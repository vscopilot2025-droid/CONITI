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
    requestBodyLimit: process.env.CONFERENCIAS_SERVICE_REQUEST_BODY_LIMIT || '150kb',
    writeRateLimitWindowMs: Number(process.env.CONFERENCIAS_SERVICE_WRITE_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    writeRateLimitMax: Number(process.env.CONFERENCIAS_SERVICE_WRITE_RATE_LIMIT_MAX || 60),
    storage: (process.env.CONFERENCIAS_SERVICE_STORAGE || 'memory').toLowerCase(),
    database: {
      host: process.env.CONFERENCIAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONFERENCIAS_SERVICE_DB_PORT || 3306),
      name: process.env.CONFERENCIAS_SERVICE_DB_NAME || 'CONIITI_CONFERENCIAS',
      user: process.env.CONFERENCIAS_SERVICE_DB_USER || 'root',
      password: process.env.CONFERENCIAS_SERVICE_DB_PASSWORD || '',
      bootstrapDatabase: process.env.CONFERENCIAS_SERVICE_DB_BOOTSTRAP !== 'false'
    }
  }
}

module.exports = {
  getConferenceConfig
}
