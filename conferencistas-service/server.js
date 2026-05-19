const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const { getSpeakerConfig } = require('./src/config/env')
const { createSpeakerRepository } = require('./src/repositories')
const { createSpeakersRouter } = require('./src/routes/conferencistas.routes')

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
  const config = getSpeakerConfig()
  const repository = await createSpeakerRepository()

  app.use(helmet())
  app.use(cors(createCorsOptions(config.corsOrigins)))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'conferencistas-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/conferencistas', createSpeakersRouter(repository, config))

  app.listen(config.port, () => {
    console.log(`conferencistas-service corriendo en http://localhost:${config.port}`)
    console.log(`conferencistas-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start conferencistas-service:', error)
  process.exit(1)
})
