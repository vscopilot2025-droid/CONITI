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
    jwtExpiresInSeconds: Number(process.env.AUTH_SERVICE_JWT_EXPIRES_IN_SECONDS || 60 * 60 * 2),
    corsOrigins: (process.env.AUTH_SERVICE_CORS_ORIGINS || process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    requestBodyLimit: process.env.AUTH_SERVICE_REQUEST_BODY_LIMIT || '100kb',
    authRateLimitWindowMs: Number(process.env.AUTH_SERVICE_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    loginRateLimitMax: Number(process.env.AUTH_SERVICE_LOGIN_RATE_LIMIT_MAX || 10),
    registerRateLimitMax: Number(process.env.AUTH_SERVICE_REGISTER_RATE_LIMIT_MAX || 5),
    resetRateLimitMax: Number(process.env.AUTH_SERVICE_RESET_RATE_LIMIT_MAX || 5),
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
      password: process.env.AUTH_SERVICE_DB_PASSWORD || process.env.DB_PASSWORD || '',
      bootstrapDatabase: process.env.AUTH_SERVICE_DB_BOOTSTRAP !== 'false'
    }
  }
}

module.exports = {
  getAuthConfig
}
