const { Router } = require('express')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')
const { createRateLimiter } = require('../middleware/request-limit.middleware')

const allowedStatuses = ['draft', 'published', 'cancelled', 'completed']
const allowedModalities = ['virtual', 'onsite', 'hybrid']

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function parsePositiveInteger(value) {
  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

function normalizeText(value, { fieldName, required = true, maxLength } = {}) {
  if (value === undefined || value === null) {
    return required ? { error: `El campo ${fieldName} es obligatorio` } : { value: undefined }
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

function validateConferencePayload(body, { partial = false } = {}) {
  if (!partial || body.title !== undefined) {
    const title = normalizeText(body?.title, { fieldName: 'título', maxLength: 180 })
    if (title.error) return title.error
  }

  if (!partial || body.description !== undefined) {
    const description = normalizeText(body?.description, { fieldName: 'descripción', maxLength: 2500 })
    if (description.error) return description.error
  }

  if (!partial || body.category !== undefined) {
    const category = normalizeText(body?.category, { fieldName: 'categoría', maxLength: 120 })
    if (category.error) return category.error
  }

  if (!partial || body.status !== undefined) {
    if (!allowedStatuses.includes(body?.status)) {
      return `El estado debe ser uno de: ${allowedStatuses.join(', ')}`
    }
  }

  if (!partial || body.modality !== undefined) {
    if (!allowedModalities.includes(body?.modality)) {
      return `La modalidad debe ser una de: ${allowedModalities.join(', ')}`
    }
  }

  if (!partial || body.timezone !== undefined) {
    const timezone = normalizeText(body?.timezone, { fieldName: 'zona horaria', maxLength: 80 })
    if (timezone.error) return timezone.error
  }

  if (!partial || body.capacity !== undefined) {
    if (!Number.isInteger(body?.capacity) || body.capacity <= 0 || body.capacity > 5000) {
      return 'La capacidad debe ser un entero entre 1 y 5000'
    }
  }

  if (body.availableSeats !== undefined) {
    if (!Number.isInteger(body.availableSeats) || body.availableSeats < 0) {
      return 'Los cupos disponibles deben ser un entero igual o mayor a cero'
    }
  }

  if (body.capacity !== undefined && body.availableSeats !== undefined && body.availableSeats > body.capacity) {
    return 'Los cupos disponibles no pueden superar la capacidad'
  }

  if (!partial || body.startDate !== undefined) {
    if (Number.isNaN(Date.parse(body?.startDate))) {
      return 'La fecha de inicio es inválida'
    }
  }

  if (!partial || body.endDate !== undefined) {
    if (Number.isNaN(Date.parse(body?.endDate))) {
      return 'La fecha de fin es inválida'
    }
  }

  if (body.startDate && body.endDate && new Date(body.startDate) >= new Date(body.endDate)) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin'
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return 'Las etiquetas deben enviarse como un arreglo'
    }

    if (body.tags.length > 12) {
      return 'No se permiten más de 12 etiquetas por conferencia'
    }

    const invalidTag = body.tags.find((tag) => typeof tag !== 'string' || !tag.trim() || tag.trim().length > 40)
    if (invalidTag !== undefined) {
      return 'Cada etiqueta debe ser texto y no superar 40 caracteres'
    }
  }

  return null
}

function validateAgendaPayload(body) {
  const title = normalizeText(body?.title, { fieldName: 'título de la agenda', maxLength: 180 })
  if (title.error) return title.error

  const speaker = normalizeText(body?.speaker, { fieldName: 'conferencista', maxLength: 140 })
  if (speaker.error) return speaker.error

  const room = normalizeText(body?.room, { fieldName: 'sala', maxLength: 120 })
  if (room.error) return room.error

  if (Number.isNaN(Date.parse(body?.startsAt)) || Number.isNaN(Date.parse(body?.endsAt))) {
    return 'Las fechas de agenda son inválidas'
  }

  if (new Date(body.startsAt) >= new Date(body.endsAt)) {
    return 'La hora de inicio debe ser anterior a la hora de fin'
  }

  return null
}

function createConferenceRouter(repository, config) {
  const router = Router()
  const writeGuards = [requireAuth(config), requireRole('admin', 'organizer')]
  const writeLimiter = createRateLimiter({
    windowMs: config.writeRateLimitWindowMs,
    max: config.writeRateLimitMax,
    message: 'Se excedió el límite de operaciones de escritura. Intenta de nuevo en unos minutos.',
    prefix: 'conferencias-write'
  })

  router.get('/', asyncHandler(async (req, res) => {
    if (req.query.status && !allowedStatuses.includes(req.query.status)) {
      return res.status(400).json({ ok: false, message: `El estado debe ser uno de: ${allowedStatuses.join(', ')}` })
    }

    if (req.query.modality && !allowedModalities.includes(req.query.modality)) {
      return res.status(400).json({ ok: false, message: `La modalidad debe ser una de: ${allowedModalities.join(', ')}` })
    }

    if (req.query.search && String(req.query.search).trim().length > 120) {
      return res.status(400).json({ ok: false, message: 'La búsqueda no puede superar 120 caracteres' })
    }

    if (req.query.fromDate && Number.isNaN(Date.parse(req.query.fromDate))) {
      return res.status(400).json({ ok: false, message: 'La fecha inicial del filtro es inválida' })
    }

    if (req.query.toDate && Number.isNaN(Date.parse(req.query.toDate))) {
      return res.status(400).json({ ok: false, message: 'La fecha final del filtro es inválida' })
    }

    const conferences = await repository.list({
      status: req.query.status,
      category: req.query.category,
      modality: req.query.modality,
      search: req.query.search,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate
    })

    res.status(200).json({
      ok: true,
      total: conferences.length,
      conferences
    })
  }))

  router.get('/categories', asyncHandler(async (_req, res) => {
    res.status(200).json({
      ok: true,
      categories: await repository.listCategories()
    })
  }))

  router.get('/statuses', asyncHandler(async (_req, res) => {
    res.status(200).json({
      ok: true,
      statuses: await repository.listStatuses()
    })
  }))

  router.get('/:id', asyncHandler(async (req, res) => {
    const conferenceId = parsePositiveInteger(req.params.id)
    if (!conferenceId) {
      return res.status(400).json({ ok: false, message: 'El id de conferencia es inválido' })
    }

    const conference = await repository.findById(conferenceId)
    if (!conference) {
      return res.status(404).json({
        ok: false,
        message: 'Conferencia no encontrada'
      })
    }

    return res.status(200).json({
      ok: true,
      conference
    })
  }))

  router.post('/', writeLimiter, ...writeGuards, asyncHandler(async (req, res) => {
    const validationError = validateConferencePayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const conference = await repository.create({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category.trim(),
      status: req.body.status,
      modality: req.body.modality,
      timezone: req.body.timezone.trim(),
      capacity: req.body.capacity,
      availableSeats: req.body.availableSeats,
      tags: req.body.tags || [],
      startDate: req.body.startDate,
      endDate: req.body.endDate
    })

    return res.status(201).json({
      ok: true,
      message: 'Conferencia creada correctamente',
      conference
    })
  }))

  router.put('/:id', writeLimiter, ...writeGuards, asyncHandler(async (req, res) => {
    const conferenceId = parsePositiveInteger(req.params.id)
    if (!conferenceId) {
      return res.status(400).json({ ok: false, message: 'El id de conferencia es inválido' })
    }

    const validationError = validateConferencePayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const conference = await repository.update(conferenceId, {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      category: req.body.category.trim(),
      status: req.body.status,
      modality: req.body.modality,
      timezone: req.body.timezone.trim(),
      capacity: req.body.capacity,
      availableSeats: req.body.availableSeats,
      tags: req.body.tags || [],
      startDate: req.body.startDate,
      endDate: req.body.endDate
    })

    if (!conference) {
      return res.status(404).json({
        ok: false,
        message: 'Conferencia no encontrada'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Conferencia actualizada correctamente',
      conference
    })
  }))

  router.patch('/:id', writeLimiter, ...writeGuards, asyncHandler(async (req, res) => {
    const conferenceId = parsePositiveInteger(req.params.id)
    if (!conferenceId) {
      return res.status(400).json({ ok: false, message: 'El id de conferencia es inválido' })
    }

    const validationError = validateConferencePayload(req.body, { partial: true })
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const conference = await repository.update(conferenceId, req.body)
    if (!conference) {
      return res.status(404).json({
        ok: false,
        message: 'Conferencia no encontrada'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Conferencia actualizada parcialmente',
      conference
    })
  }))

  router.delete('/:id', writeLimiter, ...writeGuards, asyncHandler(async (req, res) => {
    const conferenceId = parsePositiveInteger(req.params.id)
    if (!conferenceId) {
      return res.status(400).json({ ok: false, message: 'El id de conferencia es inválido' })
    }

    const deletedConference = await repository.remove(conferenceId)
    if (!deletedConference) {
      return res.status(404).json({
        ok: false,
        message: 'Conferencia no encontrada'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Conferencia eliminada correctamente',
      conference: deletedConference
    })
  }))

  router.get('/:id/agenda', asyncHandler(async (req, res) => {
    const conferenceId = parsePositiveInteger(req.params.id)
    if (!conferenceId) {
      return res.status(400).json({ ok: false, message: 'El id de conferencia es inválido' })
    }

    const conference = await repository.findById(conferenceId)
    if (!conference) {
      return res.status(404).json({
        ok: false,
        message: 'Conferencia no encontrada'
      })
    }

    return res.status(200).json({
      ok: true,
      agenda: conference.agenda
    })
  }))

  router.post('/:id/agenda', writeLimiter, ...writeGuards, asyncHandler(async (req, res) => {
    const conferenceId = parsePositiveInteger(req.params.id)
    if (!conferenceId) {
      return res.status(400).json({ ok: false, message: 'El id de conferencia es inválido' })
    }

    const validationError = validateAgendaPayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const agendaItem = await repository.addAgendaItem(conferenceId, {
      title: req.body.title.trim(),
      speaker: req.body.speaker.trim(),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      room: req.body.room.trim()
    })

    if (!agendaItem) {
      return res.status(404).json({
        ok: false,
        message: 'Conferencia no encontrada'
      })
    }

    return res.status(201).json({
      ok: true,
      message: 'Bloque de agenda agregado correctamente',
      agendaItem
    })
  }))

  router.use((error, _req, res, _next) => {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe una conferencia con ese título o slug'
      })
    }

    console.error('[conferencias-service] error procesando solicitud:', error.message)
    return res.status(500).json({
      ok: false,
      message: 'No fue posible procesar la solicitud'
    })
  })

  return router
}

module.exports = {
  createConferenceRouter
}
