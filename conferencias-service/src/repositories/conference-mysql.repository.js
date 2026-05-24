const mysql = require('mysql2/promise')
const { defaultConferences } = require('../data/default-conferences')
const { buildSlug } = require('../utils/slug.util')

class ConferenceMySqlRepository {
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
      CREATE TABLE IF NOT EXISTS conferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(180) NOT NULL,
        slug VARCHAR(220) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        category VARCHAR(80) NOT NULL,
        status VARCHAR(40) NOT NULL,
        modality VARCHAR(40) NOT NULL,
        timezone VARCHAR(80) NOT NULL,
        capacity INT NOT NULL,
        available_seats INT NOT NULL,
        tags JSON NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS conference_agenda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conference_id INT NOT NULL,
        title VARCHAR(180) NOT NULL,
        speaker VARCHAR(140) NOT NULL,
        starts_at DATETIME NOT NULL,
        ends_at DATETIME NOT NULL,
        room VARCHAR(120) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_conference_agenda_conference
          FOREIGN KEY (conference_id) REFERENCES conferences(id)
          ON DELETE CASCADE
      )
    `)

    await this.seedDefaults()
  }

  toIso(value) {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
  }

  toMySqlDateTime(value) {
    return new Date(value).toISOString().slice(0, 19).replace('T', ' ')
  }

  mapConferenceRow(row) {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      category: row.category,
      status: row.status,
      modality: row.modality,
      timezone: row.timezone,
      capacity: row.capacity,
      availableSeats: row.available_seats,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
      startDate: this.toIso(row.start_date),
      endDate: this.toIso(row.end_date),
      createdAt: this.toIso(row.created_at),
      updatedAt: this.toIso(row.updated_at),
      agenda: []
    }
  }

  mapAgendaRow(row) {
    return {
      id: row.id,
      title: row.title,
      speaker: row.speaker,
      startsAt: this.toIso(row.starts_at),
      endsAt: this.toIso(row.ends_at),
      room: row.room
    }
  }

  async seedDefaults() {
    await this.pool.query(
      'DELETE FROM conferences WHERE slug IN (?, ?)',
      [
        'arquitectura-de-microservicios-con-node-js',
        'observabilidad-para-plataformas-de-eventos'
      ]
    )

    for (const conference of defaultConferences) {
      const slug = buildSlug(conference.title)
      const [rows] = await this.pool.query(
        'SELECT id FROM conferences WHERE slug = ? LIMIT 1',
        [slug]
      )
      if (rows.length) {
        await this.update(rows[0].id, conference)
        await this.pool.query('DELETE FROM conference_agenda WHERE conference_id = ?', [rows[0].id])
        for (const agendaItem of conference.agenda) {
          await this.addAgendaItem(rows[0].id, agendaItem)
        }
        continue
      }

      const createdConference = await this.create(conference)
      for (const agendaItem of conference.agenda) {
        await this.addAgendaItem(createdConference.id, agendaItem)
      }
    }
  }

  async list(filters = {}) {
    const conditions = []
    const values = []

    if (filters.status) {
      conditions.push('status = ?')
      values.push(filters.status)
    }

    if (filters.category) {
      conditions.push('LOWER(category) = LOWER(?)')
      values.push(filters.category)
    }

    if (filters.modality) {
      conditions.push('modality = ?')
      values.push(filters.modality)
    }

    if (filters.search) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)')
      const search = `%${filters.search.toLowerCase()}%`
      values.push(search, search, search)
    }

    if (filters.fromDate) {
      conditions.push('start_date >= ?')
      values.push(filters.fromDate)
    }

    if (filters.toDate) {
      conditions.push('end_date <= ?')
      values.push(filters.toDate)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await this.pool.query(
      `SELECT * FROM conferences ${whereClause} ORDER BY start_date ASC`,
      values
    )

    const conferences = rows.map((row) => this.mapConferenceRow(row))
    await this.attachAgenda(conferences)
    return conferences
  }

  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM conferences WHERE id = ? LIMIT 1',
      [Number(id)]
    )

    if (!rows.length) {
      return null
    }

    const conference = this.mapConferenceRow(rows[0])
    conference.agenda = await this.listAgendaByConferenceId(conference.id)
    return conference
  }

  async create(data) {
    const [result] = await this.pool.query(
      `
      INSERT INTO conferences (
        title, slug, description, category, status, modality, timezone,
        capacity, available_seats, tags, start_date, end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        buildSlug(data.title),
        data.description,
        data.category,
        data.status,
        data.modality,
        data.timezone,
        data.capacity,
        data.availableSeats ?? data.capacity,
        JSON.stringify(data.tags || []),
        this.toMySqlDateTime(data.startDate),
        this.toMySqlDateTime(data.endDate)
      ]
    )

    return this.findById(result.insertId)
  }

  async update(id, data) {
    const currentConference = await this.findById(id)
    if (!currentConference) {
      return null
    }

    const merged = {
      ...currentConference,
      ...data,
      tags: data.tags ?? currentConference.tags
    }

    await this.pool.query(
      `
      UPDATE conferences
      SET title = ?, slug = ?, description = ?, category = ?, status = ?,
          modality = ?, timezone = ?, capacity = ?, available_seats = ?,
          tags = ?, start_date = ?, end_date = ?
      WHERE id = ?
      `,
      [
        merged.title,
        buildSlug(merged.title),
        merged.description,
        merged.category,
        merged.status,
        merged.modality,
        merged.timezone,
        merged.capacity,
        merged.availableSeats,
        JSON.stringify(merged.tags || []),
        this.toMySqlDateTime(merged.startDate),
        this.toMySqlDateTime(merged.endDate),
        Number(id)
      ]
    )

    return this.findById(id)
  }

  async remove(id) {
    const conference = await this.findById(id)
    if (!conference) {
      return null
    }

    await this.pool.query('DELETE FROM conferences WHERE id = ?', [Number(id)])
    return conference
  }

  async listCategories() {
    const [rows] = await this.pool.query(
      'SELECT DISTINCT category FROM conferences ORDER BY category ASC'
    )
    return rows.map((row) => row.category)
  }

  async listStatuses() {
    const [rows] = await this.pool.query(
      'SELECT DISTINCT status FROM conferences ORDER BY status ASC'
    )
    return rows.map((row) => row.status)
  }

  async addAgendaItem(conferenceId, item) {
    const conference = await this.findById(conferenceId)
    if (!conference) {
      return null
    }

    const [result] = await this.pool.query(
      `
      INSERT INTO conference_agenda (conference_id, title, speaker, starts_at, ends_at, room)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        Number(conferenceId),
        item.title,
        item.speaker,
        this.toMySqlDateTime(item.startsAt),
        this.toMySqlDateTime(item.endsAt),
        item.room
      ]
    )

    const [rows] = await this.pool.query(
      'SELECT * FROM conference_agenda WHERE id = ? LIMIT 1',
      [result.insertId]
    )

    return this.mapAgendaRow(rows[0])
  }

  async listAgendaByConferenceId(conferenceId) {
    const [rows] = await this.pool.query(
      'SELECT * FROM conference_agenda WHERE conference_id = ? ORDER BY starts_at ASC',
      [Number(conferenceId)]
    )

    return rows.map((row) => this.mapAgendaRow(row))
  }

  async attachAgenda(conferences) {
    if (!conferences.length) {
      return
    }

    const conferenceIds = conferences.map((conference) => conference.id)
    const placeholders = conferenceIds.map(() => '?').join(', ')
    const [agendaRows] = await this.pool.query(
      `SELECT * FROM conference_agenda WHERE conference_id IN (${placeholders}) ORDER BY starts_at ASC`,
      conferenceIds
    )

    const agendaByConferenceId = new Map()
    for (const row of agendaRows) {
      const agendaItem = this.mapAgendaRow(row)
      const currentItems = agendaByConferenceId.get(row.conference_id) || []
      currentItems.push(agendaItem)
      agendaByConferenceId.set(row.conference_id, currentItems)
    }

    for (const conference of conferences) {
      conference.agenda = agendaByConferenceId.get(conference.id) || []
    }
  }
}

module.exports = {
  ConferenceMySqlRepository
}
