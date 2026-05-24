const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: false,
  quiet: true
})

function getContactConfig() {
  return {
    port: Number(process.env.CONTACT_SERVICE_PORT || 3007),
    corsOrigins: (process.env.CONTACT_SERVICE_CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    storage: (process.env.CONTACT_SERVICE_STORAGE || 'mysql').toLowerCase(),
    database: {
      host: process.env.CONTACT_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONTACT_SERVICE_DB_PORT || 3306),
      name: process.env.CONTACT_SERVICE_DB_NAME || 'CONIITI_CONTACT',
      user: process.env.CONTACT_SERVICE_DB_USER || 'root',
      password: process.env.CONTACT_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = { getContactConfig }