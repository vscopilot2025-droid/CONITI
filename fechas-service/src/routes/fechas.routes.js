const { Router } = require('express')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')
const { createRateLimiter } = require('../middleware/request-limit.middleware')

const allowedAvailabilityStatuses = ['available', 'reserved', 'blocked', 'tentative']
const allowedConflictSeverities = ['low', 'medium', 'high']

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

function normalizeText(value, { maxLength, fieldName, allowEmpty = false } = {}) {
  if (value === undefined || value === null) {
    return allowEmpty ? '' : null
  }

  if (typeof value !== 'string') {
    throw new Error(`El campo ${fieldName} debe ser una cadena de texto`)
  }

  const normalized = value.trim()
  if (!allowEmpty && !normalized) {
    throw new Error(`El campo ${fieldName} es obligatorio`)
  }

  if (maxLength && normalized.length > maxLength) {
    throw new Error(`El campo ${fieldName} supera el maximo permitido de ${maxLength} caracteres`)
  }

  return normalized
}

function validateAvailabilityPayload(body) {
  if (!body?.resourceType?.trim()) return 'El tipo de recurso es obligatorio'
  if (!Number.isInteger(body?.resourceId) || body.resourceId <= 0) return 'El id del recurso debe ser un entero mayor a cero'
  if (!body?.resourceName?.trim()) return 'El nombre del recurso es obligatorio'
  if (!body?.timezone?.trim()) return 'La zona horaria es obligatoria'
  if (!allowedAvailabilityStatuses.includes(body?.status)) {
    return `El estado debe ser uno de: ${allowedAvailabilityStatuses.join(', ')}`
  }
  if (Number.isNaN(Date.parse(body?.startsAt)) || Number.isNaN(Date.parse(body?.endsAt))) {
    return 'Las fechas de disponibilidad son invalidas'
  }
  if (new Date(body.startsAt) >= new Date(body.endsAt)) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin'
  }
  if (body.resourceType.trim().length > 60) return 'El tipo de recurso supera el maximo permitido'
  if (body.resourceName.trim().length > 160) return 'El nombre del recurso supera el maximo permitido'
  if (body.timezone.trim().length > 80) return 'La zona horaria supera el maximo permitido'
  if (body.notes !== undefined && String(body.notes).trim().length > 300) return 'Las notas superan el maximo permitido'
  return null
}

function validateConflictPayload(body) {
  if (!body?.resourceType?.trim()) return 'El tipo de recurso es obligatorio'
  if (!Number.isInteger(body?.resourceId) || body.resourceId <= 0) return 'El id del recurso debe ser un entero mayor a cero'
  if (!body?.resourceName?.trim()) return 'El nombre del recurso es obligatorio'
  if (!allowedConflictSeverities.includes(body?.severity)) {
    return `La severidad debe ser una de: ${allowedConflictSeverities.join(', ')}`
  }
  if (!body?.reason?.trim()) return 'La razon del conflicto es obligatoria'
  if (Number.isNaN(Date.parse(body?.startsAt)) || Number.isNaN(Date.parse(body?.endsAt))) {
    return 'Las fechas del conflicto son invalidas'
  }
  if (new Date(body.startsAt) >= new Date(body.endsAt)) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin'
  }
  if (body.resourceType.trim().length > 60) return 'El tipo de recurso supera el maximo permitido'
  if (body.resourceName.trim().length > 160) return 'El nombre del recurso supera el maximo permitido'
  if (body.reason.trim().length > 300) return 'La razon del conflicto supera el maximo permitido'
  return null
}

function validateAgendaPayload(body) {
  if (!body?.eventType?.trim()) return 'El tipo de evento es obligatorio'
  if (!Number.isInteger(body?.eventId) || body.eventId <= 0) return 'El id del evento debe ser un entero mayor a cero'
  if (!body?.title?.trim()) return 'El titulo del evento es obligatorio'
  if (!body?.timezone?.trim()) return 'La zona horaria es obligatoria'
  if (!body?.owner?.trim()) return 'El owner es obligatorio'
  if (Number.isNaN(Date.parse(body?.startsAt)) || Number.isNaN(Date.parse(body?.endsAt))) {
    return 'Las fechas de agenda son invalidas'
  }
  if (new Date(body.startsAt) >= new Date(body.endsAt)) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin'
  }
  if (body.eventType.trim().length > 60) return 'El tipo de evento supera el maximo permitido'
  if (body.title.trim().length > 180) return 'El titulo del evento supera el maximo permitido'
  if (body.timezone.trim().length > 80) return 'La zona horaria supera el maximo permitido'
  if (body.owner.trim().length > 120) return 'El owner supera el maximo permitido'
  if (body.location !== undefined && body.location !== null && String(body.location).trim().length > 120) {
    return 'La ubicacion supera el maximo permitido'
  }
  return null
}

function buildScheduleDayLabel(dateKey, index) {
  const [, month, day] = dateKey.split('-')
  const monthLabels = {
    '09': 'Sep',
    '10': 'Oct'
  }
  const formattedDate = `${day} ${monthLabels[month] || month}`

  return `Dia ${index + 1} · ${formattedDate}`
}

function getConferenceLeadAgendaItem(conference) {
  if (!conference?.agenda?.length) {
    return null
  }

  return conference.agenda.find((item) => item.title === conference.title) || conference.agenda[conference.agenda.length - 1]
}

function mapConferenceToScheduleEntry(conference) {
  const leadAgendaItem = getConferenceLeadAgendaItem(conference)

  return {
    conferenceId: conference.id,
    slug: conference.slug,
    title: conference.title,
    description: conference.description,
    category: conference.category,
    modality: conference.modality,
    timezone: conference.timezone,
    startDate: conference.startDate,
    endDate: conference.endDate,
    room: leadAgendaItem?.room || 'Sala por confirmar',
    leadSpeakerName: leadAgendaItem?.speaker || 'Conferencista por confirmar',
    availableSeats: conference.availableSeats,
    tags: conference.tags || []
  }
}

async function fetchPublishedConferences(config) {
  const url = new URL('/conferencias', config.conferencesServiceUrl)
  url.searchParams.set('status', 'published')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('No fue posible sincronizar las conferencias para construir el cronograma')
  }

  const payload = await response.json()
  return payload.conferences || []
}

async function buildMasterAgenda(config) {
  const conferences = await fetchPublishedConferences(config)
  const grouped = new Map()

  conferences.forEach((conference) => {
    const dateKey = conference.startDate.slice(0, 10)
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }

    grouped.get(dateKey).push(mapConferenceToScheduleEntry(conference))
  })

  const days = Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, 3)
    .map(([dateKey, entries], index) => ({
      id: dateKey,
      label: buildScheduleDayLabel(dateKey, index),
      entries: entries.sort((left, right) => new Date(left.startDate) - new Date(right.startDate))
    }))

  return {
    total: conferences.length,
    days
  }
}

function createDatesRouter(repository, config) {
  const router = Router()
  const writeLimiter = createRateLimiter({
    windowMs: config.writeRateLimitWindowMs,
    max: config.writeRateLimitMax,
    prefix: 'dates-write',
    message: 'Has excedido el limite temporal para operaciones de escritura'
  })
  const writeGuards = [writeLimiter, requireAuth(config), requireRole('admin', 'organizer')]

  router.get('/availability', asyncHandler(async (req, res) => {
    if (req.query.resourceId !== undefined && parsePositiveInteger(req.query.resourceId) === null) {
      return res.status(400).json({ ok: false, message: 'El parametro resourceId es invalido' })
    }
    if (req.query.status && !allowedAvailabilityStatuses.includes(req.query.status)) {
      return res.status(400).json({ ok: false, message: `El parametro status debe ser uno de: ${allowedAvailabilityStatuses.join(', ')}` })
    }
    if (req.query.timezone && String(req.query.timezone).trim().length > 80) {
      return res.status(400).json({ ok: false, message: 'El parametro timezone supera el maximo permitido' })
    }

    const availabilities = await repository.listAvailabilities({
      resourceType: req.query.resourceType,
      resourceId: req.query.resourceId,
      status: req.query.status,
      timezone: req.query.timezone
    })

    res.status(200).json({
      ok: true,
      total: availabilities.length,
      availabilities
    })
  }))

  router.post('/availability', ...writeGuards, asyncHandler(async (req, res) => {
    const validationError = validateAvailabilityPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const availability = await repository.createAvailability({
      resourceType: normalizeText(req.body.resourceType, { maxLength: 60, fieldName: 'resourceType' }),
      resourceId: req.body.resourceId,
      resourceName: normalizeText(req.body.resourceName, { maxLength: 160, fieldName: 'resourceName' }),
      timezone: normalizeText(req.body.timezone, { maxLength: 80, fieldName: 'timezone' }),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      status: req.body.status,
      notes: normalizeText(req.body.notes, { maxLength: 300, fieldName: 'notes', allowEmpty: true })
    })

    res.status(201).json({
      ok: true,
      message: 'Disponibilidad creada correctamente',
      availability
    })
  }))

  router.get('/conflicts', asyncHandler(async (req, res) => {
    if (req.query.resourceId !== undefined && parsePositiveInteger(req.query.resourceId) === null) {
      return res.status(400).json({ ok: false, message: 'El parametro resourceId es invalido' })
    }
    if (req.query.severity && !allowedConflictSeverities.includes(req.query.severity)) {
      return res.status(400).json({ ok: false, message: `El parametro severity debe ser uno de: ${allowedConflictSeverities.join(', ')}` })
    }

    const conflicts = await repository.listConflicts({
      resourceType: req.query.resourceType,
      resourceId: req.query.resourceId,
      severity: req.query.severity
    })

    res.status(200).json({
      ok: true,
      total: conflicts.length,
      conflicts
    })
  }))

  router.post('/conflicts', ...writeGuards, asyncHandler(async (req, res) => {
    const validationError = validateConflictPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const conflict = await repository.createConflict({
      resourceType: normalizeText(req.body.resourceType, { maxLength: 60, fieldName: 'resourceType' }),
      resourceId: req.body.resourceId,
      resourceName: normalizeText(req.body.resourceName, { maxLength: 160, fieldName: 'resourceName' }),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      severity: req.body.severity,
      reason: normalizeText(req.body.reason, { maxLength: 300, fieldName: 'reason' })
    })

    res.status(201).json({
      ok: true,
      message: 'Conflicto registrado correctamente',
      conflict
    })
  }))

  router.get('/timezones', asyncHandler(async (_req, res) => {
    const timezones = await repository.listTimezones()
    res.status(200).json({ ok: true, timezones })
  }))

  router.get('/master-agenda', asyncHandler(async (_req, res) => {
    const agenda = await buildMasterAgenda(config)

    res.status(200).json({
      ok: true,
      total: agenda.total,
      days: agenda.days
    })
  }))

  router.post('/master-agenda', ...writeGuards, asyncHandler(async (req, res) => {
    const validationError = validateAgendaPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const entry = await repository.createMasterAgendaEntry({
      eventType: normalizeText(req.body.eventType, { maxLength: 60, fieldName: 'eventType' }),
      eventId: req.body.eventId,
      title: normalizeText(req.body.title, { maxLength: 180, fieldName: 'title' }),
      timezone: normalizeText(req.body.timezone, { maxLength: 80, fieldName: 'timezone' }),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      owner: normalizeText(req.body.owner, { maxLength: 120, fieldName: 'owner' }),
      location: req.body.location ? normalizeText(req.body.location, { maxLength: 120, fieldName: 'location' }) : null
    })

    res.status(201).json({
      ok: true,
      message: 'Entrada de agenda maestra creada correctamente',
      entry
    })
  }))

  router.use((error, _req, res, _next) => {
    console.error('[fechas-service] error procesando solicitud:', error?.message || error)
    return res.status(500).json({
      ok: false,
      message: 'No fue posible procesar la solicitud'
    })
  })

  return router
}

module.exports = {
  createDatesRouter
}
