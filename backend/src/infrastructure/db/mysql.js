import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const dbName = process.env.DB_NAME || 'CONITI'

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

let pool

export function getPool() {
  if (!pool) {
    throw new Error('Database pool is not initialized yet')
  }

  return pool
}

export async function initializeDatabase() {
  const serverPool = mysql.createPool(baseConfig)
  await serverPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
  await serverPool.end()

  pool = mysql.createPool({
    ...baseConfig,
    database: dbName
  })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      last_login_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
}
