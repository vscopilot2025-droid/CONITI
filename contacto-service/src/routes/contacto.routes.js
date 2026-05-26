const { Router } = require('express')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')
const { createRateLimiter } = require('../middleware/request-limit.middleware')
const { allowedInquiryTypes } = require('../repositories')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeOption(value) {
  return String(value || '')
    .trim()
    .replace(/Ã¡/g, 'a')
    .replace(/Ã©/g, 'e')
    .replace(/Ã­/g, 'i')
    .replace(/Ã³/g, 'o')
    .replace(/Ãº/g, 'u')
    .replace(/Ã±/g, 'n')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function normalizeText(value, { fieldName, maxLength, required = true } = {}) {
  if (value === undefined || value === null) {
    return required ? { error: `El campo ${fieldName} es obligatorio` } : { value: '' }
  }

  if (typeof value !== 'string') {
    return { error: `El campo ${fieldName} debe ser texto` }
  }

  const normalizedValue = value.trim()
  if (required && !normalizedValue) {
    return { error: `El campo ${fieldName} es obligatorio` }
  }

  if (maxLength && normalizedValue.length > maxLength) {
    return { error: `El campo ${fieldName} no puede superar ${maxLength} caracteres` }
  }

  return { value: normalizedValue }
}

function validateMessagePayload(body) {
  const firstName = normalizeText(body?.firstName, { fieldName: 'nombre', maxLength: 120 })
  if (firstName.error) return firstName.error

  const lastName = normalizeText(body?.lastName, { fieldName: 'apellido', maxLength: 120 })
  if (lastName.error) return lastName.error

  const email = normalizeText(body?.email, { fieldName: 'correo', maxLength: 160 })
  if (email.error) return email.error
  if (!emailPattern.test(email.value.toLowerCase())) {
    return 'El correo no es valido'
  }

  const institution = normalizeText(body?.institution, { fieldName: 'institucion', maxLength: 180 })
  if (institution.error) return institution.error

  if (!allowedInquiryTypes.some((item) => normalizeOption(item) === normalizeOption(body?.inquiryType))) {
    return `El tipo de consulta debe ser uno de: ${allowedInquiryTypes.join(', ')}`
  }

  const message = normalizeText(body?.message, { fieldName: 'mensaje', maxLength: 2500 })
  if (message.error) return message.error

  return null
}

function createContactRouter(repository, config) {
  const router = Router()
  const submitLimiter = createRateLimiter({
    windowMs: config.submitRateLimitWindowMs,
    max: config.submitRateLimitMax,
    message: 'Has excedido temporalmente el limite de envios de mensajes.',
    prefix: 'contact-submit'
  })
  const readGuard = [requireAuth(config), requireRole('admin', 'organizer')]

  router.get('/messages', ...readGuard, asyncHandler(async (req, res) => {
    if (req.query.search && String(req.query.search).trim().length > 160) {
      return res.status(400).json({ ok: false, message: 'La busqueda supera el maximo permitido' })
    }

    if (req.query.inquiryType && !allowedInquiryTypes.some((item) => normalizeOption(item) === normalizeOption(req.query.inquiryType))) {
      return res.status(400).json({
        ok: false,
        message: `El tipo de consulta debe ser uno de: ${allowedInquiryTypes.join(', ')}`
      })
    }

    const messages = await repository.listMessages({
      search: req.query.search,
      inquiryType: req.query.inquiryType
    })

    res.status(200).json({
      ok: true,
      total: messages.length,
      messages
    })
  }))

  router.post('/messages', submitLimiter, asyncHandler(async (req, res) => {
    const validationError = validateMessagePayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const contactMessage = await repository.createMessage({
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      email: req.body.email.trim().toLowerCase(),
      institution: req.body.institution.trim(),
      inquiryType: allowedInquiryTypes.find((item) => normalizeOption(item) === normalizeOption(req.body.inquiryType)) || req.body.inquiryType,
      message: req.body.message.trim()
    })

    return res.status(201).json({
      ok: true,
      message: 'Mensaje registrado correctamente',
      contactMessage
    })
  }))

  return router
}

module.exports = {
  createContactRouter
}
