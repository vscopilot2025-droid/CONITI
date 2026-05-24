const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: false,
  quiet: true
})

function getScheduleConfig() {
  return {
    port: Number(process.env.FECHAS_SERVICE_PORT || 3006),
    jwtSecret: process.env.FECHAS_SERVICE_JWT_SECRET || process.env.AUTH_SERVICE_JWT_SECRET || 'coniiti-auth-service-secret',
    corsOrigins: (process.env.FECHAS_SERVICE_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    storage: (process.env.FECHAS_SERVICE_STORAGE || 'mysql').toLowerCase(),
    conferencesServiceUrl:
      process.env.FECHAS_SERVICE_CONFERENCIAS_URL ||
      process.env.CONFERENCIAS_SERVICE_URL ||
      'http://127.0.0.1:3004',
    database: {
      host: process.env.FECHAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.FECHAS_SERVICE_DB_PORT || 3306),
      name: process.env.FECHAS_SERVICE_DB_NAME || 'CONIITI_FECHAS',
      user: process.env.FECHAS_SERVICE_DB_USER || 'root',
      password: process.env.FECHAS_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getScheduleConfig
}
