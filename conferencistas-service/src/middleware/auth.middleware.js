const crypto = require('crypto')

function fromBase64Url(value) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalizedValue.length % 4)) % 4)
  return Buffer.from(`${normalizedValue}${padding}`, 'base64').toString('utf8')
}

function sign(input, jwtSecret) {
  return crypto
    .createHmac('sha256', jwtSecret)
    .update(input)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function verifyJwt(token, jwtSecret) {
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Token invalido')
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`, jwtSecret)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)
  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error('Firma del token invalida')
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload))
  const currentTimestamp = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < currentTimestamp) {
    throw new Error('Token expirado')
  }

  return payload
}

function requireAuth(config) {
  return (req, res, next) => {
    const authorizationHeader = req.headers.authorization || ''
    const [scheme, token] = authorizationHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        ok: false,
        message: 'Autenticacion requerida'
      })
    }

    try {
      req.auth = {
        token,
        payload: verifyJwt(token, config.jwtSecret)
      }
      return next()
    } catch (error) {
      return res.status(401).json({
        ok: false,
        message: 'Autenticacion requerida'
      })
    }
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.auth?.payload?.role)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para esta accion'
      })
    }

    return next()
  }
}

module.exports = {
  requireAuth,
  requireRole
}
