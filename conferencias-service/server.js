const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const { getConferenceConfig } = require('./src/config/env')
const { createConferenceRepository } = require('./src/repositories')
const { createConferenceRouter } = require('./src/routes/conferencias.routes')

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
  const config = getConferenceConfig()
  const repository = await createConferenceRepository()

  app.use(helmet())
  app.use(cors(createCorsOptions(config.corsOrigins)))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'conferencias-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/conferencias', createConferenceRouter(repository, config))

  app.listen(config.port, () => {
    console.log(`conferencias-service corriendo en http://localhost:${config.port}`)
    console.log(`conferencias-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start conferencias-service:', error)
  process.exit(1)
})
