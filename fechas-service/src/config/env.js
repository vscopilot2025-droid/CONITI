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
    storage: (process.env.FECHAS_SERVICE_STORAGE || 'mysql').toLowerCase(),
    database: {
      host: process.env.FECHAS_SERVICE_DB_HOST || 'localhost',
      port: Number(process.env.FECHAS_SERVICE_DB_PORT || 3306),
      name: process.env.FECHAS_SERVICE_DB_NAME || 'CONITI_FECHAS',
      user: process.env.FECHAS_SERVICE_DB_USER || 'root',
      password: process.env.FECHAS_SERVICE_DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getScheduleConfig
}
