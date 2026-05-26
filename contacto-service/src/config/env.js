const dotenv = require('dotenv')
const path = require('path')

const candidatePaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../../.env')
]

candidatePaths.forEach((envPath) => {
  dotenv.config({
    path: envPath,
    override: false,
    quiet: true
  })
})

function getContactConfig() {
  return {
    port: Number(process.env.CONTACTO_SERVICE_PORT || 3007),
    jwtSecret: process.env.CONTACTO_SERVICE_JWT_SECRET || process.env.AUTH_SERVICE_JWT_SECRET || 'coniiti-auth-service-secret',
    corsOrigins: (process.env.CONTACTO_SERVICE_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    requestBodyLimit: process.env.CONTACTO_SERVICE_REQUEST_BODY_LIMIT || '120kb',
    submitRateLimitWindowMs: Number(process.env.CONTACTO_SERVICE_SUBMIT_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    submitRateLimitMax: Number(process.env.CONTACTO_SERVICE_SUBMIT_RATE_LIMIT_MAX || 8),
    writeRateLimitWindowMs: Number(process.env.CONTACTO_SERVICE_WRITE_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    writeRateLimitMax: Number(process.env.CONTACTO_SERVICE_WRITE_RATE_LIMIT_MAX || 40),
    storage: (process.env.CONTACTO_SERVICE_STORAGE || 'mysql').toLowerCase(),
    database: {
      host: process.env.CONTACTO_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONTACTO_SERVICE_DB_PORT || 3306),
      name: process.env.CONTACTO_SERVICE_DB_NAME || 'CONIITI_CONTACTO',
      user: process.env.CONTACTO_SERVICE_DB_USER || 'root',
      password: process.env.CONTACTO_SERVICE_DB_PASSWORD || '',
      bootstrapDatabase: process.env.CONTACTO_SERVICE_DB_BOOTSTRAP !== 'false',
      bootstrapUser: process.env.CONTACTO_SERVICE_DB_BOOTSTRAP_USER || process.env.CONTACTO_SERVICE_DB_USER || 'root',
      bootstrapPassword: process.env.CONTACTO_SERVICE_DB_BOOTSTRAP_PASSWORD || process.env.CONTACTO_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getContactConfig
}
