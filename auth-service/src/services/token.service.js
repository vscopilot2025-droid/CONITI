const crypto = require('crypto')
const { getAuthConfig } = require('../config/env')

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function fromBase64Url(value) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalizedValue.length % 4)) % 4)
  return Buffer.from(`${normalizedValue}${padding}`, 'base64').toString('utf8')
}

function sign(input) {
  const { jwtSecret } = getAuthConfig()

  return crypto
    .createHmac('sha256', jwtSecret)
    .update(input)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function createJwt(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const { jwtExpiresInSeconds } = getAuthConfig()
  const now = Math.floor(Date.now() / 1000)
  const body = {
    ...payload,
    iat: now,
    exp: now + jwtExpiresInSeconds
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(body))
  const signature = sign(`${encodedHeader}.${encodedPayload}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyJwt(token) {
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Token inválido')
  }

  const expectedSignature = sign(`${encodedHeader}.${encodedPayload}`)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)
  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error('Firma del token inválida')
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload))
  const currentTimestamp = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < currentTimestamp) {
    throw new Error('Token expirado')
  }

  return payload
}

module.exports = {
  createJwt,
  verifyJwt
}
