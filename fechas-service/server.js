const cors = require('cors')
const express = require('express')
const { getScheduleConfig } = require('./src/config/env')
const { createScheduleRepository } = require('./src/repositories')
const { createDatesRouter } = require('./src/routes/fechas.routes')

async function bootstrap() {
  const app = express()
  const config = getScheduleConfig()
  const repository = await createScheduleRepository()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'fechas-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/fechas', createDatesRouter(repository))

  app.listen(config.port, () => {
    console.log(`fechas-service corriendo en http://localhost:${config.port}`)
    console.log(`fechas-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start fechas-service:', error)
  process.exit(1)
})
