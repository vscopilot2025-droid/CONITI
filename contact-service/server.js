const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const { getContactConfig } = require('./src/config/env')
const { createContactRepository } = require('./src/repositories')
const { createContactRouter } = require('./src/routes/contact.routes')

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
  const config = getContactConfig()
  const repository = await createContactRepository()

  app.use(helmet())
  app.use(cors(createCorsOptions(config.corsOrigins)))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'contact-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/contact', createContactRouter(repository))

  app.listen(config.port, () => {
    console.log(`contact-service corriendo en http://localhost:${config.port}`)
    console.log(`contact-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start contact-service:', error)
  process.exit(1)
})