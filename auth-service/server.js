const cors = require('cors')
const express = require('express')
const { getAuthConfig } = require('./src/config/env')
const { createAuthRepository } = require('./src/repositories')
const { createAuthRouter } = require('./src/routes/auth.routes')
const {
  createPaymentsRouter,
  createPaymentsWebhookHandler
} = require('./src/routes/payments.routes')

async function bootstrap() {
  const app = express()
  const config = getAuthConfig()
  const repository = await createAuthRepository()

  app.use(cors())
  app.post('/payments/webhook', express.raw({ type: 'application/json' }), createPaymentsWebhookHandler(repository, config))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'auth-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/auth', createAuthRouter(repository))
  app.use('/payments', createPaymentsRouter(repository, config))

  app.listen(config.port, () => {
    console.log(`auth-service corriendo en http://localhost:${config.port}`)
    console.log(`auth-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start auth-service:', error)
  process.exit(1)
})
