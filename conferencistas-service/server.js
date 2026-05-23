const cors = require('cors')
const express = require('express')
const { getSpeakerConfig } = require('./src/config/env')
const { createSpeakerRepository } = require('./src/repositories')
const { createSpeakersRouter } = require('./src/routes/conferencistas.routes')

async function bootstrap() {
  const app = express()
  const config = getSpeakerConfig()
  const repository = await createSpeakerRepository()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'conferencistas-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/conferencistas', createSpeakersRouter(repository))

  app.listen(config.port, () => {
    console.log(`conferencistas-service corriendo en http://localhost:${config.port}`)
    console.log(`conferencistas-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start conferencistas-service:', error)
  process.exit(1)
})
