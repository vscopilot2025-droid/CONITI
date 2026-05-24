const mysql = require('mysql2/promise')

async function createContactMysqlRepository(config) {
  const pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    waitForConnections: true,
    connectionLimit: 10
  })

  // Create DB and table if they don't exist
  const conn = await pool.getConnection()
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
  await conn.query(`USE \`${config.database.name}\``)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(160) NOT NULL,
      institution VARCHAR(160) NOT NULL,
      query_type VARCHAR(80) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_contact_email (email),
      INDEX idx_contact_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  conn.release()

  const dbPool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    waitForConnections: true,
    connectionLimit: 10
  })

  return {
    async saveMessage({ firstName, lastName, email, institution, queryType, message }) {
      const [result] = await dbPool.query(
        `INSERT INTO contact_messages (first_name, last_name, email, institution, query_type, message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, institution, queryType, message]
      )
      return { id: result.insertId, firstName, lastName, email, institution, queryType, message, status: 'pending' }
    },

    async getAllMessages() {
      const [rows] = await dbPool.query('SELECT * FROM contact_messages ORDER BY created_at DESC')
      return rows
    }
  }
}

module.exports = { createContactMysqlRepository }