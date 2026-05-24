const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const { getAuthConfig } = require('./src/config/env')
const { createAuthRepository } = require('./src/repositories')
const { createAuthRouter } = require('./src/routes/auth.routes')

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
  const config = getAuthConfig()
  const repository = await createAuthRepository()
  const authNoStore = (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    next()
  }

  app.use(helmet())
  app.use(cors(createCorsOptions(config.corsOrigins)))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'auth-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/auth', authNoStore, createAuthRouter(repository))

  app.listen(config.port, () => {
    console.log(`auth-service corriendo en http://localhost:${config.port}`)
    console.log(`auth-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start auth-service:', error)
  process.exit(1)
})
