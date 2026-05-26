const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const { getScheduleConfig } = require('./src/config/env')
const { createScheduleRepository } = require('./src/repositories')
const { createDatesRouter } = require('./src/routes/fechas.routes')

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
  const config = getScheduleConfig()
  const repository = await createScheduleRepository()
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
  app.use(createAuditLogger('fechas-service'))

  app.get('/health', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'fechas-service',
      status: 'up',
      storage: config.storage
    })
  })

  app.use('/fechas', apiNoStore, createDatesRouter(repository, config))

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

    console.error('[fechas-service] error no controlado:', error?.message || error)
    return res.status(500).json({
      ok: false,
      message: 'No fue posible procesar la solicitud'
    })
  })

  app.listen(config.port, () => {
    console.log(`fechas-service corriendo en http://localhost:${config.port}`)
    console.log(`fechas-service storage: ${config.storage}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start fechas-service:', error)
  process.exit(1)
})
