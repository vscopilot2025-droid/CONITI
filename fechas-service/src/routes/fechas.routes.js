const { Router } = require('express')

const allowedAvailabilityStatuses = ['available', 'reserved', 'blocked', 'tentative']
const allowedConflictSeverities = ['low', 'medium', 'high']

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
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
  return null
}

function createDatesRouter(repository) {
  const router = Router()

  router.get('/availability', asyncHandler(async (req, res) => {
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

  router.post('/availability', asyncHandler(async (req, res) => {
    const validationError = validateAvailabilityPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const availability = await repository.createAvailability({
      resourceType: req.body.resourceType.trim(),
      resourceId: req.body.resourceId,
      resourceName: req.body.resourceName.trim(),
      timezone: req.body.timezone.trim(),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      status: req.body.status,
      notes: req.body.notes || ''
    })

    res.status(201).json({
      ok: true,
      message: 'Disponibilidad creada correctamente',
      availability
    })
  }))

  router.get('/conflicts', asyncHandler(async (req, res) => {
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

  router.post('/conflicts', asyncHandler(async (req, res) => {
    const validationError = validateConflictPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const conflict = await repository.createConflict({
      resourceType: req.body.resourceType.trim(),
      resourceId: req.body.resourceId,
      resourceName: req.body.resourceName.trim(),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      severity: req.body.severity,
      reason: req.body.reason.trim()
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

  router.get('/master-agenda', asyncHandler(async (req, res) => {
    const entries = await repository.listMasterAgenda({
      owner: req.query.owner,
      eventType: req.query.eventType,
      timezone: req.query.timezone
    })

    res.status(200).json({
      ok: true,
      total: entries.length,
      entries
    })
  }))

  router.post('/master-agenda', asyncHandler(async (req, res) => {
    const validationError = validateAgendaPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const entry = await repository.createMasterAgendaEntry({
      eventType: req.body.eventType.trim(),
      eventId: req.body.eventId,
      title: req.body.title.trim(),
      timezone: req.body.timezone.trim(),
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      owner: req.body.owner.trim(),
      location: req.body.location?.trim() || null
    })

    res.status(201).json({
      ok: true,
      message: 'Entrada de agenda maestra creada correctamente',
      entry
    })
  }))

  router.use((error, _req, res, _next) => {
    return res.status(500).json({
      ok: false,
      message: error.message || 'No fue posible procesar la solicitud'
    })
  })

  return router
}

module.exports = {
  createDatesRouter
}
