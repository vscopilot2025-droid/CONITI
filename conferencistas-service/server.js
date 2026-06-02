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
      if (!origin || corsOrigins.includes(origin) || /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$)|(\.devtunnels\.ms$)/i.test(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origen no permitido por CORS'))
    }
  }
}

function createAuditLogger(serviceName) {
  return (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next()
    }

    res.on('finish', () => {
      console.info(JSON.stringify({
        type: 'security_audit',
        service: serviceName,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        actorId: req.auth?.payload?.sub || null,
        actorRole: req.auth?.payload?.role || null,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || null,
        userAgent: req.headers['user-agent'] || null,
        timestamp: new Date().toISOString()
      }))
    })

    return next()
  }
}

async function bootstrap() {
  const app = express()
  const config = getSpeakerConfig()
  const repository = await createSpeakerRepository()
  const apiNoStore = (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    next()
  }

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }))
  app.use(cors(createCorsOptions(config.corsOrigins)))
  app.use(express.json({ limit: config.requestBodyLimit }))
  app.disable('x-powered-by')
  app.use(createAuditLogger('conferencistas-service'))

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'conferencistas-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/conferencistas', apiNoStore, createSpeakersRouter(repository, config))

  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({
        ok: false,
        message: 'El cuerpo de la solicitud supera el tamaño permitido'
      })
    }

    if (error?.message === 'Origen no permitido por CORS') {
      return res.status(403).json({
        ok: false,
        message: 'Origen no permitido por CORS'
      })
    }

    console.error('[conferencistas-service] error no controlado:', error?.message || error)
    return res.status(500).json({
      ok: false,
      message: 'No fue posible procesar la solicitud'
    })
  })

  app.listen(config.port, () => {
    console.log(`conferencistas-service corriendo en http://localhost:${config.port}`)
    console.log(`conferencistas-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start conferencistas-service:', error)
  process.exit(1)
})
