const mysql = require('mysql2/promise')
const { defaultSpeakers } = require('../data/default-speakers')

class SpeakerMySqlRepository {
  constructor(databaseConfig) {
    this.databaseConfig = databaseConfig
    this.pool = null
  }

  async initialize() {
    const serverPool = mysql.createPool({
      host: this.databaseConfig.host,
      port: this.databaseConfig.port,
      user: this.databaseConfig.user,
      password: this.databaseConfig.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    await serverPool.query(`CREATE DATABASE IF NOT EXISTS \`${this.databaseConfig.name}\``)
    await serverPool.end()

    this.pool = mysql.createPool({
      host: this.databaseConfig.host,
      port: this.databaseConfig.port,
      user: this.databaseConfig.user,
      password: this.databaseConfig.password,
      database: this.databaseConfig.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS speakers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(140) NOT NULL,
        slug VARCHAR(180) NOT NULL UNIQUE,
        initials VARCHAR(12) NOT NULL,
        institution VARCHAR(160) NOT NULL,
        country VARCHAR(80) NOT NULL,
        country_code VARCHAR(8) NOT NULL,
        city VARCHAR(120) NOT NULL,
        bio TEXT NOT NULL,
        expertise JSON NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS speaker_talks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        speaker_id INT NOT NULL,
        title VARCHAR(180) NOT NULL,
        abstract TEXT NOT NULL,
        topic VARCHAR(100) NOT NULL,
        duration_minutes INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_speaker_talks_speaker
          FOREIGN KEY (speaker_id) REFERENCES speakers(id)
          ON DELETE CASCADE
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS speaker_event_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        speaker_id INT NOT NULL,
        conference_id INT NULL,
        conference_title VARCHAR(180) NOT NULL,
        participation_type VARCHAR(60) NOT NULL,
        scheduled_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_speaker_event_links_speaker
          FOREIGN KEY (speaker_id) REFERENCES speakers(id)
          ON DELETE CASCADE
      )
    `)

    await this.seedDefaults()
  }

  toIso(value) {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
  }

  toMySqlDateTime(value) {
    return value ? new Date(value).toISOString().slice(0, 19).replace('T', ' ') : null
  }

  mapSpeakerRow(row) {
    return {
      id: row.id,
      fullName: row.full_name,
      slug: row.slug,
      initials: row.initials,
      institution: row.institution,
      country: row.country,
      countryCode: row.country_code,
      city: row.city,
      bio: row.bio,
      expertise: Array.isArray(row.expertise) ? row.expertise : JSON.parse(row.expertise || '[]'),
      featured: Boolean(row.featured),
      createdAt: this.toIso(row.created_at),
      updatedAt: this.toIso(row.updated_at),
      talks: [],
      eventLinks: []
    }
  }

  mapTalkRow(row) {
    return {
      id: row.id,
      title: row.title,
      abstract: row.abstract,
      topic: row.topic,
      durationMinutes: row.duration_minutes
    }
  }

  mapEventLinkRow(row) {
    return {
      id: row.id,
      conferenceId: row.conference_id,
      conferenceTitle: row.conference_title,
      participationType: row.participation_type,
      scheduledAt: row.scheduled_at ? this.toIso(row.scheduled_at) : null
    }
  }

  async seedDefaults() {
    for (const speaker of defaultSpeakers) {
      const [existingRows] = await this.pool.query(
        'SELECT id FROM speakers WHERE slug = ? LIMIT 1',
        [speaker.slug]
      )

      let speakerId = existingRows[0]?.id || null
      if (!speakerId) {
        const createdSpeaker = await this.create(speaker)
        speakerId = createdSpeaker.id
      }

      const [talkRows] = await this.pool.query(
        'SELECT COUNT(*) AS total FROM speaker_talks WHERE speaker_id = ?',
        [speakerId]
      )
      if (!talkRows[0].total) {
        for (const talk of speaker.talks) {
          await this.addTalk(speakerId, talk)
        }
      }

      const [eventRows] = await this.pool.query(
        'SELECT COUNT(*) AS total FROM speaker_event_links WHERE speaker_id = ?',
        [speakerId]
      )
      if (!eventRows[0].total) {
        for (const eventLink of speaker.eventLinks) {
          await this.addEventLink(speakerId, eventLink)
        }
      }
    }
  }

  async list(filters = {}) {
    const conditions = []
    const values = []

    if (filters.country) {
      conditions.push('LOWER(country) = LOWER(?)')
      values.push(filters.country)
    }

    if (filters.institution) {
      conditions.push('LOWER(institution) LIKE ?')
      values.push(`%${filters.institution.toLowerCase()}%`)
    }

    if (filters.featured !== undefined) {
      conditions.push('featured = ?')
      values.push(String(filters.featured).toLowerCase() === 'true')
    }

    if (filters.search) {
      const search = `%${filters.search.toLowerCase()}%`
      conditions.push('(LOWER(full_name) LIKE ? OR LOWER(bio) LIKE ? OR LOWER(expertise) LIKE ?)')
      values.push(search, search, search)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await this.pool.query(
      `SELECT * FROM speakers ${whereClause} ORDER BY full_name ASC`,
      values
    )

    const speakers = rows.map((row) => this.mapSpeakerRow(row))
    await this.attachTalksAndEvents(speakers)
    return speakers
  }

  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM speakers WHERE id = ? LIMIT 1', [Number(id)])
    if (!rows.length) {
      return null
    }

    const speaker = this.mapSpeakerRow(rows[0])
    speaker.talks = await this.listTalks(speaker.id)
    speaker.eventLinks = await this.listEventLinks(speaker.id)
    return speaker
  }

  async create(data) {
    const [result] = await this.pool.query(
      `
      INSERT INTO speakers (
        full_name, slug, initials, institution, country, country_code,
        city, bio, expertise, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.fullName,
        data.slug,
        data.initials,
        data.institution,
        data.country,
        data.countryCode,
        data.city,
        data.bio,
        JSON.stringify(data.expertise || []),
        Boolean(data.featured)
      ]
    )

    return this.findById(result.insertId)
  }

  async update(id, data) {
    const currentSpeaker = await this.findById(id)
    if (!currentSpeaker) {
      return null
    }

    const merged = {
      ...currentSpeaker,
      ...data,
      expertise: data.expertise ?? currentSpeaker.expertise
    }

    await this.pool.query(
      `
      UPDATE speakers
      SET full_name = ?, slug = ?, initials = ?, institution = ?, country = ?,
          country_code = ?, city = ?, bio = ?, expertise = ?, featured = ?
      WHERE id = ?
      `,
      [
        merged.fullName,
        merged.slug,
        merged.initials,
        merged.institution,
        merged.country,
        merged.countryCode,
        merged.city,
        merged.bio,
        JSON.stringify(merged.expertise || []),
        Boolean(merged.featured),
        Number(id)
      ]
    )

    return this.findById(id)
  }

  async remove(id) {
    const speaker = await this.findById(id)
    if (!speaker) {
      return null
    }

    await this.pool.query('DELETE FROM speakers WHERE id = ?', [Number(id)])
    return speaker
  }

  async listCountries() {
    const [rows] = await this.pool.query('SELECT DISTINCT country FROM speakers ORDER BY country ASC')
    return rows.map((row) => row.country)
  }

  async addTalk(speakerId, talk) {
    const speaker = await this.findById(speakerId)
    if (!speaker) {
      return null
    }

    const [result] = await this.pool.query(
      `
      INSERT INTO speaker_talks (speaker_id, title, abstract, topic, duration_minutes)
      VALUES (?, ?, ?, ?, ?)
      `,
      [Number(speakerId), talk.title, talk.abstract, talk.topic, talk.durationMinutes]
    )

    const [rows] = await this.pool.query('SELECT * FROM speaker_talks WHERE id = ? LIMIT 1', [result.insertId])
    return this.mapTalkRow(rows[0])
  }

  async addEventLink(speakerId, eventLink) {
    const speaker = await this.findById(speakerId)
    if (!speaker) {
      return null
    }

    const [result] = await this.pool.query(
      `
      INSERT INTO speaker_event_links (
        speaker_id, conference_id, conference_title, participation_type, scheduled_at
      ) VALUES (?, ?, ?, ?, ?)
      `,
      [
        Number(speakerId),
        eventLink.conferenceId ?? null,
        eventLink.conferenceTitle,
        eventLink.participationType,
        this.toMySqlDateTime(eventLink.scheduledAt)
      ]
    )

    const [rows] = await this.pool.query(
      'SELECT * FROM speaker_event_links WHERE id = ? LIMIT 1',
      [result.insertId]
    )

    return this.mapEventLinkRow(rows[0])
  }

  async listTalks(speakerId) {
    const [rows] = await this.pool.query(
      'SELECT * FROM speaker_talks WHERE speaker_id = ? ORDER BY id ASC',
      [Number(speakerId)]
    )

    return rows.map((row) => this.mapTalkRow(row))
  }

  async listEventLinks(speakerId) {
    const [rows] = await this.pool.query(
      'SELECT * FROM speaker_event_links WHERE speaker_id = ? ORDER BY scheduled_at ASC, id ASC',
      [Number(speakerId)]
    )

    return rows.map((row) => this.mapEventLinkRow(row))
  }

  async attachTalksAndEvents(speakers) {
    if (!speakers.length) {
      return
    }

    const speakerIds = speakers.map((speaker) => speaker.id)
    const placeholders = speakerIds.map(() => '?').join(', ')
    const [talkRows] = await this.pool.query(
      `SELECT * FROM speaker_talks WHERE speaker_id IN (${placeholders}) ORDER BY id ASC`,
      speakerIds
    )
    const [eventRows] = await this.pool.query(
      `SELECT * FROM speaker_event_links WHERE speaker_id IN (${placeholders}) ORDER BY scheduled_at ASC, id ASC`,
      speakerIds
    )

    const talksBySpeakerId = new Map()
    for (const row of talkRows) {
      const currentTalks = talksBySpeakerId.get(row.speaker_id) || []
      currentTalks.push(this.mapTalkRow(row))
      talksBySpeakerId.set(row.speaker_id, currentTalks)
    }

    const eventsBySpeakerId = new Map()
    for (const row of eventRows) {
      const currentEvents = eventsBySpeakerId.get(row.speaker_id) || []
      currentEvents.push(this.mapEventLinkRow(row))
      eventsBySpeakerId.set(row.speaker_id, currentEvents)
    }

    for (const speaker of speakers) {
      speaker.talks = talksBySpeakerId.get(speaker.id) || []
      speaker.eventLinks = eventsBySpeakerId.get(speaker.id) || []
    }
  }
}

module.exports = {
  SpeakerMySqlRepository
}
