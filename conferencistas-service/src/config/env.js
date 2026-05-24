const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: false,
  quiet: true
})

function getSpeakerConfig() {
  return {
    port: Number(process.env.CONFERENCISTAS_SERVICE_PORT || 3005),
    jwtSecret: process.env.CONFERENCISTAS_SERVICE_JWT_SECRET || process.env.AUTH_SERVICE_JWT_SECRET || 'coniiti-auth-service-secret',
    corsOrigins: (process.env.CONFERENCISTAS_SERVICE_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    storage: (process.env.CONFERENCISTAS_SERVICE_STORAGE || 'mysql').toLowerCase(),
    database: {
      host: process.env.CONFERENCISTAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONFERENCISTAS_SERVICE_DB_PORT || 3306),
      name: process.env.CONFERENCISTAS_SERVICE_DB_NAME || 'CONIITI_CONFERENCISTAS',
      user: process.env.CONFERENCISTAS_SERVICE_DB_USER || 'root',
      password: process.env.CONFERENCISTAS_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getSpeakerConfig
}
