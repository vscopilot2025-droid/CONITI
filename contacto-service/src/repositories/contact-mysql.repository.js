const mysql = require('mysql2/promise')

class ContactMySqlRepository {
  constructor(databaseConfig) {
    this.databaseConfig = databaseConfig
    this.pool = null
  }

  sanitizeMessage(row) {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      institution: row.institution,
      inquiryType: row.inquiry_type,
      message: row.message,
      createdAt: row.created_at
    }
  }

  async initialize() {
    if (this.databaseConfig.bootstrapDatabase !== false) {
      const escapedDatabaseName = this.databaseConfig.name.replace(/`/g, '``')
      const escapedRuntimeUser = String(this.databaseConfig.user).replace(/'/g, "\\'")
      const escapedRuntimePassword = String(this.databaseConfig.password).replace(/'/g, "\\'")
      const bootstrapPool = mysql.createPool({
        host: this.databaseConfig.host,
        port: this.databaseConfig.port,
        user: this.databaseConfig.bootstrapUser,
        password: this.databaseConfig.bootstrapPassword,
        waitForConnections: true,
        connectionLimit: 4,
        queueLimit: 0
      })

      await bootstrapPool.query(`CREATE DATABASE IF NOT EXISTS \`${escapedDatabaseName}\``)
      if (this.databaseConfig.user && this.databaseConfig.user !== this.databaseConfig.bootstrapUser) {
        await bootstrapPool.query(
          `CREATE USER IF NOT EXISTS '${escapedRuntimeUser}'@'%' IDENTIFIED BY '${escapedRuntimePassword}'`
        ).catch(() => null)

        await bootstrapPool.query(
          `
          GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
          ON \`${escapedDatabaseName}\`.*
          TO '${escapedRuntimeUser}'@'%'
          `
        ).catch(() => null)

        await bootstrapPool.query('FLUSH PRIVILEGES').catch(() => null)
      }
      await bootstrapPool.end()
    }

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
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(120) NOT NULL,
        last_name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL,
        institution VARCHAR(180) NOT NULL,
        inquiry_type VARCHAR(80) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_contact_messages_email (email),
        INDEX idx_contact_messages_inquiry_type (inquiry_type),
        INDEX idx_contact_messages_created_at (created_at)
      )
    `)
  }

  async createMessage({ firstName, lastName, email, institution, inquiryType, message }) {
    const [result] = await this.pool.query(
      `
      INSERT INTO contact_messages (
        first_name,
        last_name,
        email,
        institution,
        inquiry_type,
        message
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [firstName, lastName, email, institution, inquiryType, message]
    )

    const [rows] = await this.pool.query(
      'SELECT * FROM contact_messages WHERE id = ? LIMIT 1',
      [result.insertId]
    )

    return this.sanitizeMessage(rows[0])
  }

  async listMessages(filters = {}) {
    const conditions = []
    const values = []

    if (filters.inquiryType) {
      conditions.push('inquiry_type = ?')
      values.push(filters.inquiryType)
    }

    if (filters.search) {
      conditions.push(`
        (
          first_name LIKE ?
          OR last_name LIKE ?
          OR email LIKE ?
          OR institution LIKE ?
          OR inquiry_type LIKE ?
          OR message LIKE ?
        )
      `)
      const pattern = `%${filters.search.trim()}%`
      values.push(pattern, pattern, pattern, pattern, pattern, pattern)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await this.pool.query(
      `
      SELECT *
      FROM contact_messages
      ${whereClause}
      ORDER BY created_at DESC
      `,
      values
    )

    return rows.map((row) => this.sanitizeMessage(row))
  }
}

module.exports = {
  ContactMySqlRepository
}
