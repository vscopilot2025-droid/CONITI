const dotenv = require('dotenv')
const path = require('path')

const candidatePaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../../.env')
]

candidatePaths.forEach((envPath) => {
  dotenv.config({
    path: envPath,
    override: false,
    quiet: true
  })
})

function getAuthConfig() {
  return {
    port: Number(process.env.AUTH_SERVICE_PORT || 3003),
    jwtSecret: process.env.AUTH_SERVICE_JWT_SECRET || 'coniiti-auth-service-secret',
    corsOrigins: (process.env.AUTH_SERVICE_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    storage: (process.env.AUTH_SERVICE_STORAGE || 'memory').toLowerCase(),
    payments: {
      mode: (process.env.AUTH_SERVICE_PAYMENTS_MODE || 'stripe').toLowerCase(),
      stripeSecretKey: process.env.AUTH_SERVICE_STRIPE_SECRET_KEY || '',
      stripeWebhookSecret: process.env.AUTH_SERVICE_STRIPE_WEBHOOK_SECRET || '',
      currency: (process.env.AUTH_SERVICE_PAYMENTS_CURRENCY || 'cop').toLowerCase(),
      successUrl: process.env.AUTH_SERVICE_PAYMENTS_SUCCESS_URL || 'http://localhost:5173/?payment=success',
      cancelUrl: process.env.AUTH_SERVICE_PAYMENTS_CANCEL_URL || 'http://localhost:5173/?payment=cancelled'
    },
    database: {
      host: process.env.AUTH_SERVICE_DB_HOST || process.env.DB_HOST || 'localhost',
      port: Number(process.env.AUTH_SERVICE_DB_PORT || process.env.DB_PORT || 3306),
      name: process.env.AUTH_SERVICE_DB_NAME || 'CONIITI_AUTH',
      user: process.env.AUTH_SERVICE_DB_USER || process.env.DB_USER || 'root',
      password: process.env.AUTH_SERVICE_DB_PASSWORD || process.env.DB_PASSWORD || ''
    }
  }
}

module.exports = {
  getAuthConfig
}
