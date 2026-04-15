const mysql = require('mysql2/promise')
const {
  defaultAvailabilities,
  defaultConflicts,
  defaultMasterAgenda
} = require('../data/default-schedules')

class ScheduleMySqlRepository {
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
      CREATE TABLE IF NOT EXISTS availabilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resource_type VARCHAR(40) NOT NULL,
        resource_id INT NOT NULL,
        resource_name VARCHAR(180) NOT NULL,
        timezone VARCHAR(80) NOT NULL,
        starts_at DATETIME NOT NULL,
        ends_at DATETIME NOT NULL,
        status VARCHAR(40) NOT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS conflicts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resource_type VARCHAR(40) NOT NULL,
        resource_id INT NOT NULL,
        resource_name VARCHAR(180) NOT NULL,
        starts_at DATETIME NOT NULL,
        ends_at DATETIME NOT NULL,
        severity VARCHAR(20) NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS master_agenda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(40) NOT NULL,
        event_id INT NOT NULL,
        title VARCHAR(180) NOT NULL,
        timezone VARCHAR(80) NOT NULL,
        starts_at DATETIME NOT NULL,
        ends_at DATETIME NOT NULL,
        owner VARCHAR(80) NOT NULL,
        location VARCHAR(120) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

  mapAvailabilityRow(row) {
    return {
      id: row.id,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      resourceName: row.resource_name,
      timezone: row.timezone,
      startsAt: this.toIso(row.starts_at),
      endsAt: this.toIso(row.ends_at),
      status: row.status,
      notes: row.notes,
      createdAt: this.toIso(row.created_at),
      updatedAt: this.toIso(row.updated_at)
    }
  }

  mapConflictRow(row) {
    return {
      id: row.id,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      resourceName: row.resource_name,
      startsAt: this.toIso(row.starts_at),
      endsAt: this.toIso(row.ends_at),
      severity: row.severity,
      reason: row.reason,
      createdAt: this.toIso(row.created_at)
    }
  }

  mapAgendaRow(row) {
    return {
      id: row.id,
      eventType: row.event_type,
      eventId: row.event_id,
      title: row.title,
      timezone: row.timezone,
      startsAt: this.toIso(row.starts_at),
      endsAt: this.toIso(row.ends_at),
      owner: row.owner,
      location: row.location,
      createdAt: this.toIso(row.created_at),
      updatedAt: this.toIso(row.updated_at)
    }
  }

  async seedDefaults() {
    const [availabilityRows] = await this.pool.query('SELECT COUNT(*) AS total FROM availabilities')
    if (availabilityRows[0].total === 0) {
      for (const entry of defaultAvailabilities) {
        await this.createAvailability(entry)
      }
    }

    const [conflictRows] = await this.pool.query('SELECT COUNT(*) AS total FROM conflicts')
    if (conflictRows[0].total === 0) {
      for (const entry of defaultConflicts) {
        await this.createConflict(entry)
      }
    }

    const [agendaRows] = await this.pool.query('SELECT COUNT(*) AS total FROM master_agenda')
    if (agendaRows[0].total === 0) {
      for (const entry of defaultMasterAgenda) {
        await this.createMasterAgendaEntry(entry)
      }
    }
  }

  async listAvailabilities(filters = {}) {
    const conditions = []
    const values = []

    if (filters.resourceType) {
      conditions.push('resource_type = ?')
      values.push(filters.resourceType)
    }
    if (filters.resourceId) {
      conditions.push('resource_id = ?')
      values.push(Number(filters.resourceId))
    }
    if (filters.status) {
      conditions.push('status = ?')
      values.push(filters.status)
    }
    if (filters.timezone) {
      conditions.push('timezone = ?')
      values.push(filters.timezone)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await this.pool.query(
      `SELECT * FROM availabilities ${whereClause} ORDER BY starts_at ASC`,
      values
    )

    return rows.map((row) => this.mapAvailabilityRow(row))
  }

  async createAvailability(data) {
    const [result] = await this.pool.query(
      `
      INSERT INTO availabilities (
        resource_type, resource_id, resource_name, timezone, starts_at, ends_at, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.resourceType,
        Number(data.resourceId),
        data.resourceName,
        data.timezone,
        this.toMySqlDateTime(data.startsAt),
        this.toMySqlDateTime(data.endsAt),
        data.status,
        data.notes || null
      ]
    )

    const [rows] = await this.pool.query('SELECT * FROM availabilities WHERE id = ? LIMIT 1', [result.insertId])
    return this.mapAvailabilityRow(rows[0])
  }

  async listConflicts(filters = {}) {
    const conditions = []
    const values = []

    if (filters.resourceType) {
      conditions.push('resource_type = ?')
      values.push(filters.resourceType)
    }
    if (filters.resourceId) {
      conditions.push('resource_id = ?')
      values.push(Number(filters.resourceId))
    }
    if (filters.severity) {
      conditions.push('severity = ?')
      values.push(filters.severity)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await this.pool.query(
      `SELECT * FROM conflicts ${whereClause} ORDER BY starts_at ASC`,
      values
    )

    return rows.map((row) => this.mapConflictRow(row))
  }

  async createConflict(data) {
    const [result] = await this.pool.query(
      `
      INSERT INTO conflicts (
        resource_type, resource_id, resource_name, starts_at, ends_at, severity, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.resourceType,
        Number(data.resourceId),
        data.resourceName,
        this.toMySqlDateTime(data.startsAt),
        this.toMySqlDateTime(data.endsAt),
        data.severity,
        data.reason
      ]
    )

    const [rows] = await this.pool.query('SELECT * FROM conflicts WHERE id = ? LIMIT 1', [result.insertId])
    return this.mapConflictRow(rows[0])
  }

  async listTimezones() {
    const [rows] = await this.pool.query('SELECT DISTINCT timezone FROM availabilities ORDER BY timezone ASC')
    return rows.map((row) => row.timezone)
  }

  async listMasterAgenda(filters = {}) {
    const conditions = []
    const values = []

    if (filters.owner) {
      conditions.push('owner = ?')
      values.push(filters.owner)
    }
    if (filters.eventType) {
      conditions.push('event_type = ?')
      values.push(filters.eventType)
    }
    if (filters.timezone) {
      conditions.push('timezone = ?')
      values.push(filters.timezone)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await this.pool.query(
      `SELECT * FROM master_agenda ${whereClause} ORDER BY starts_at ASC`,
      values
    )

    return rows.map((row) => this.mapAgendaRow(row))
  }

  async createMasterAgendaEntry(data) {
    const [result] = await this.pool.query(
      `
      INSERT INTO master_agenda (
        event_type, event_id, title, timezone, starts_at, ends_at, owner, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.eventType,
        Number(data.eventId),
        data.title,
        data.timezone,
        this.toMySqlDateTime(data.startsAt),
        this.toMySqlDateTime(data.endsAt),
        data.owner,
        data.location || null
      ]
    )

    const [rows] = await this.pool.query('SELECT * FROM master_agenda WHERE id = ? LIMIT 1', [result.insertId])
    return this.mapAgendaRow(rows[0])
  }
}

module.exports = {
  ScheduleMySqlRepository
}
