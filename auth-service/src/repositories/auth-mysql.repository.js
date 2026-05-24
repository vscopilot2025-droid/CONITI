const mysql = require('mysql2/promise')
const { hashPassword, verifyPassword } = require('../utils/password.util')

class AuthMySqlRepository {
  constructor(databaseConfig) {
    this.databaseConfig = databaseConfig
    this.pool = null
  }

  sanitizeUser(row) {
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    }
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
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(40) NOT NULL DEFAULT 'attendee',
        last_login_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    const [roleColumnRows] = await this.pool.query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'role'
      LIMIT 1
      `,
      [this.databaseConfig.name]
    )

    if (!roleColumnRows.length) {
      try {
        await this.pool.query(`
          ALTER TABLE users
          ADD COLUMN role VARCHAR(40) NOT NULL DEFAULT 'attendee'
        `)
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          throw error
        }
      }
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_password_reset_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      )
    `)

    await this.seedDefaults()
  }

  async seedDefaults() {
    const defaults = [
      {
        fullName: 'Admin CONIITI',
        email: 'admin@coniiti.test',
        password: 'Admin123*',
        role: 'admin'
      },
      {
        fullName: 'Organizador Demo',
        email: 'organizer@coniiti.test',
        password: 'Organizer123*',
        role: 'organizer'
      }
    ]

    for (const user of defaults) {
      const existingUser = await this.findUserByEmail(user.email)
      if (!existingUser) {
        await this.createUser(user)
      }
    }
  }

  async findUserByEmail(email) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    )

    return rows[0] || null
  }

  async findUserById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [Number(id)]
    )

    return rows[0] || null
  }

  async createUser({ fullName, email, password, role = 'attendee' }) {
    const passwordHash = hashPassword(password)
    const [result] = await this.pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [fullName.trim(), email.trim().toLowerCase(), passwordHash, role]
    )

    const user = await this.findUserById(result.insertId)
    return this.sanitizeUser(user)
  }

  async validateCredentials(email, password) {
    const user = await this.findUserByEmail(email.trim().toLowerCase())
    if (!user || !verifyPassword(password, user.password_hash)) {
      return null
    }

    await this.pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    )

    const updatedUser = await this.findUserById(user.id)
    return this.sanitizeUser(updatedUser)
  }

  async updateUserRole(userId, role) {
    const [result] = await this.pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, Number(userId)]
    )

    if (!result.affectedRows) {
      return null
    }

    const user = await this.findUserById(userId)
    return this.sanitizeUser(user)
  }

  async createResetToken(email) {
    const user = await this.findUserByEmail(email.trim().toLowerCase())
    if (!user) {
      return null
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 15)
    const token = `reset-${user.id}-${Date.now()}`

    await this.pool.query(
      'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
      [token, user.id, expiresAt]
    )

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: this.sanitizeUser(user)
    }
  }

  async consumeResetToken(token, newPassword) {
    const [rows] = await this.pool.query(
      `
      SELECT prt.id, prt.user_id
      FROM password_reset_tokens prt
      WHERE prt.token = ? AND prt.used_at IS NULL AND prt.expires_at > NOW()
      LIMIT 1
      `,
      [token]
    )

    const row = rows[0]
    if (!row) {
      return null
    }

    await this.pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashPassword(newPassword), row.user_id]
    )

    await this.pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [row.id]
    )

    const updatedUser = await this.findUserById(row.user_id)
    return this.sanitizeUser(updatedUser)
  }

  async listUsers() {
    const [rows] = await this.pool.query('SELECT * FROM users ORDER BY id ASC')
    return rows.map((row) => this.sanitizeUser(row))
  }
}

module.exports = {
  AuthMySqlRepository
}
