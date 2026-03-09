import { User } from '../../domain/entities/User.js'
import { UserRepository } from '../../domain/ports/UserRepository.js'
import { getPool } from '../db/mysql.js'

function mapRowToUser(row) {
  return new User({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at
  })
}

export class MySqlUserRepository extends UserRepository {
  async createUser({ fullName, email, passwordHash }) {
    const pool = getPool()
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [fullName, email, passwordHash]
    )

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
    return mapRowToUser(rows[0])
  }

  async findByEmail(email) {
    const pool = getPool()
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
    if (!rows.length) {
      return null
    }

    return mapRowToUser(rows[0])
  }

  async updateLastLogin(id) {
    const pool = getPool()
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id])
  }
}
