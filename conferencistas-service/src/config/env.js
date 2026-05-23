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
    storage: (process.env.CONFERENCISTAS_SERVICE_STORAGE || 'mysql').toLowerCase(),
    database: {
      host: process.env.CONFERENCISTAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.CONFERENCISTAS_SERVICE_DB_PORT || 3306),
      name: process.env.CONFERENCISTAS_SERVICE_DB_NAME || 'CONITI_CONFERENCISTAS',
      user: process.env.CONFERENCISTAS_SERVICE_DB_USER || 'root',
      password: process.env.CONFERENCISTAS_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getSpeakerConfig
}
