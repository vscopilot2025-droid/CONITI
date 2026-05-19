const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: false,
  quiet: true
})

function getConferenceConfig() {
  return {
    port: Number(process.env.CONFERENCIAS_SERVICE_PORT || 3004),
    jwtSecret: process.env.CONFERENCIAS_SERVICE_JWT_SECRET || process.env.AUTH_SERVICE_JWT_SECRET || 'coniiti-auth-service-secret',
    corsOrigins: (process.env.CONFERENCIAS_SERVICE_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    storage: (process.env.CONFERENCIAS_SERVICE_STORAGE || 'memory').toLowerCase(),
    database: {
      host: process.env.CONFERENCIAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONFERENCIAS_SERVICE_DB_PORT || 3306),
      name: process.env.CONFERENCIAS_SERVICE_DB_NAME || 'CONIITI_CONFERENCIAS',
      user: process.env.CONFERENCIAS_SERVICE_DB_USER || 'root',
      password: process.env.CONFERENCIAS_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getConferenceConfig
}
