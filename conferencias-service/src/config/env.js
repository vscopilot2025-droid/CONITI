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
    storage: (process.env.CONFERENCIAS_SERVICE_STORAGE || 'memory').toLowerCase(),
    database: {
      host: process.env.CONFERENCIAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONFERENCIAS_SERVICE_DB_PORT || 3306),
      name: process.env.CONFERENCIAS_SERVICE_DB_NAME || 'CONITI_CONFERENCIAS',
      user: process.env.CONFERENCIAS_SERVICE_DB_USER || 'root',
      password: process.env.CONFERENCIAS_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getConferenceConfig
}
