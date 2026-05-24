const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const { getScheduleConfig } = require('./src/config/env')
const { createScheduleRepository } = require('./src/repositories')
const { createDatesRouter } = require('./src/routes/fechas.routes')

function createCorsOptions(corsOrigins) {
  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origen no permitido por CORS'))
    }
  }
}

async function bootstrap() {
  const app = express()
  const config = getScheduleConfig()
  const repository = await createScheduleRepository()

  app.use(helmet())
  app.use(cors(createCorsOptions(config.corsOrigins)))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'fechas-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/fechas', createDatesRouter(repository, config))

  app.listen(config.port, () => {
    console.log(`fechas-service corriendo en http://localhost:${config.port}`)
    console.log(`fechas-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start fechas-service:', error)
  process.exit(1)
})
