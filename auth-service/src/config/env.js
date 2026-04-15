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

function getAuthConfig() {
  return {
    port: Number(process.env.AUTH_SERVICE_PORT || 3003),
    jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET || 'coniiti-auth-service-secret',
    storage: (process.env.AUTH_SERVICE_STORAGE || 'memory').toLowerCase(),
    database: {
      host: process.env.AUTH_SERVICE_DB_HOST || process.env.DB_HOST || 'localhost',
      port: Number(process.env.AUTH_SERVICE_DB_PORT || process.env.DB_PORT || 3306),
      name: process.env.AUTH_SERVICE_DB_NAME || process.env.DB_NAME || 'CONITI',
      user: process.env.AUTH_SERVICE_DB_USER || process.env.DB_USER || 'root',
      password: process.env.AUTH_SERVICE_DB_PASSWORD || process.env.DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getAuthConfig
}
