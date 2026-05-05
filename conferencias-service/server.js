const cors = require('cors')
const express = require('express')
const { getConferenceConfig } = require('./src/config/env')
const { createConferenceRepository } = require('./src/repositories')
const { createConferenceRouter } = require('./src/routes/conferencias.routes')

async function bootstrap() {
  const app = express()
  const config = getConferenceConfig()
  const repository = await createConferenceRepository()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'conferencias-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/conferencias', createConferenceRouter(repository))

  app.listen(config.port, () => {
    console.log(`conferencias-service corriendo en http://localhost:${config.port}`)
    console.log(`conferencias-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start conferencias-service:', error)
  process.exit(1)
})
