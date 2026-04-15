const { Router } = require('express')

const allowedStatuses = ['draft', 'published', 'cancelled', 'completed']
const allowedModalities = ['virtual', 'onsite', 'hybrid']

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function validateConferencePayload(body, { partial = false } = {}) {
  if (!partial || body.title !== undefined) {
    if (!body?.title?.trim()) {
      return 'El titulo es obligatorio'
    }
  }

  if (!partial || body.description !== undefined) {
    if (!body?.description?.trim()) {
      return 'La descripcion es obligatoria'
    }
  }

  if (!partial || body.category !== undefined) {
    if (!body?.category?.trim()) {
      return 'La categoria es obligatoria'
    }
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
    if (!body?.timezone?.trim()) {
      return 'La zona horaria es obligatoria'
    }
  }

  if (!partial || body.capacity !== undefined) {
    if (!Number.isInteger(body?.capacity) || body.capacity <= 0) {
      return 'La capacidad debe ser un entero mayor a cero'
    }
  }

  if (body.availableSeats !== undefined) {
    if (!Number.isInteger(body.availableSeats) || body.availableSeats < 0) {
      return 'Los cupos disponibles deben ser un entero igual o mayor a cero'
    }
  }

  if (!partial || body.startDate !== undefined) {
    if (Number.isNaN(Date.parse(body?.startDate))) {
      return 'La fecha de inicio es invalida'
    }
  }

  if (!partial || body.endDate !== undefined) {
    if (Number.isNaN(Date.parse(body?.endDate))) {
      return 'La fecha de fin es invalida'
    }
  }

  if (body.startDate && body.endDate && new Date(body.startDate) >= new Date(body.endDate)) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin'
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    return 'Las etiquetas deben enviarse como un arreglo'
  }

  return null
}

function validateAgendaPayload(body) {
  if (!body?.title?.trim()) {
    return 'El titulo de la agenda es obligatorio'
  }

  if (!body?.speaker?.trim()) {
    return 'El conferencista es obligatorio'
  }

  if (!body?.room?.trim()) {
    return 'La sala es obligatoria'
  }

  if (Number.isNaN(Date.parse(body?.startsAt)) || Number.isNaN(Date.parse(body?.endsAt))) {
    return 'Las fechas de agenda son invalidas'
  }

  if (new Date(body.startsAt) >= new Date(body.endsAt)) {
    return 'La hora de inicio debe ser anterior a la hora de fin'
  }

  return null
}

function createConferenceRouter(repository) {
  const router = Router()

  router.get('/', asyncHandler(async (req, res) => {
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
    const conference = await repository.findById(req.params.id)
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

  router.post('/', asyncHandler(async (req, res) => {
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

  router.put('/:id', asyncHandler(async (req, res) => {
    const validationError = validateConferencePayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const conference = await repository.update(req.params.id, {
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

  router.patch('/:id', asyncHandler(async (req, res) => {
    const validationError = validateConferencePayload(req.body, { partial: true })
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const conference = await repository.update(req.params.id, req.body)
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

  router.delete('/:id', asyncHandler(async (req, res) => {
    const deletedConference = await repository.remove(req.params.id)
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
    const conference = await repository.findById(req.params.id)
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

  router.post('/:id/agenda', asyncHandler(async (req, res) => {
    const validationError = validateAgendaPayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const agendaItem = await repository.addAgendaItem(req.params.id, {
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
        message: 'Ya existe una conferencia con ese titulo o slug'
      })
    }

    return res.status(500).json({
      ok: false,
      message: error.message || 'No fue posible procesar la solicitud'
    })
  })

  return router
}

module.exports = {
  createConferenceRouter
}
