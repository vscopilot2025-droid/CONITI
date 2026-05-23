const { Router } = require('express')

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

function validateSpeakerPayload(body, { partial = false } = {}) {
  if (!partial || body.fullName !== undefined) {
    if (!body?.fullName?.trim()) return 'El nombre completo es obligatorio'
  }
  if (!partial || body.slug !== undefined) {
    if (!body?.slug?.trim()) return 'El slug es obligatorio'
  }
  if (!partial || body.initials !== undefined) {
    if (!body?.initials?.trim()) return 'Las iniciales son obligatorias'
  }
  if (!partial || body.institution !== undefined) {
    if (!body?.institution?.trim()) return 'La institución es obligatoria'
  }
  if (!partial || body.country !== undefined) {
    if (!body?.country?.trim()) return 'El país es obligatorio'
  }
  if (!partial || body.countryCode !== undefined) {
    if (!body?.countryCode?.trim()) return 'El código de país es obligatorio'
  }
  if (!partial || body.city !== undefined) {
    if (!body?.city?.trim()) return 'La ciudad es obligatoria'
  }
  if (!partial || body.bio !== undefined) {
    if (!body?.bio?.trim()) return 'La biografía es obligatoria'
  }
  if (body.expertise !== undefined && !Array.isArray(body.expertise)) {
    return 'La experiencia debe enviarse como un arreglo'
  }
  return null
}

function validateTalkPayload(body) {
  if (!body?.title?.trim()) return 'El título de la ponencia es obligatorio'
  if (!body?.abstract?.trim()) return 'El resumen de la ponencia es obligatorio'
  if (!body?.topic?.trim()) return 'El tema de la ponencia es obligatorio'
  if (!Number.isInteger(body?.durationMinutes) || body.durationMinutes <= 0) {
    return 'La duración debe ser un entero mayor a cero'
  }
  return null
}

function validateEventLinkPayload(body) {
  if (!body?.conferenceTitle?.trim()) return 'El título del evento es obligatorio'
  if (!body?.participationType?.trim()) return 'El tipo de participación es obligatorio'
  if (body.scheduledAt && Number.isNaN(Date.parse(body.scheduledAt))) {
    return 'La fecha programada es inválida'
  }
  return null
}

function createSpeakersRouter(repository) {
  const router = Router()

  router.get('/', asyncHandler(async (req, res) => {
    const speakers = await repository.list({
      country: req.query.country,
      institution: req.query.institution,
      featured: req.query.featured,
      search: req.query.search
    })

    res.status(200).json({ ok: true, total: speakers.length, speakers })
  }))

  router.get('/countries', asyncHandler(async (_req, res) => {
    res.status(200).json({ ok: true, countries: await repository.listCountries() })
  }))

  router.get('/:id', asyncHandler(async (req, res) => {
    const speaker = await repository.findById(req.params.id)
    if (!speaker) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({ ok: true, speaker })
  }))

  router.post('/', asyncHandler(async (req, res) => {
    const validationError = validateSpeakerPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const speaker = await repository.create({
      fullName: req.body.fullName.trim(),
      slug: req.body.slug.trim(),
      initials: req.body.initials.trim(),
      institution: req.body.institution.trim(),
      country: req.body.country.trim(),
      countryCode: req.body.countryCode.trim(),
      city: req.body.city.trim(),
      bio: req.body.bio.trim(),
      expertise: req.body.expertise || [],
      featured: Boolean(req.body.featured)
    })

    res.status(201).json({
      ok: true,
      message: 'Conferencista creado correctamente',
      speaker
    })
  }))

  router.put('/:id', asyncHandler(async (req, res) => {
    const validationError = validateSpeakerPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const speaker = await repository.update(req.params.id, {
      fullName: req.body.fullName.trim(),
      slug: req.body.slug.trim(),
      initials: req.body.initials.trim(),
      institution: req.body.institution.trim(),
      country: req.body.country.trim(),
      countryCode: req.body.countryCode.trim(),
      city: req.body.city.trim(),
      bio: req.body.bio.trim(),
      expertise: req.body.expertise || [],
      featured: Boolean(req.body.featured)
    })

    if (!speaker) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({
      ok: true,
      message: 'Conferencista actualizado correctamente',
      speaker
    })
  }))

  router.patch('/:id', asyncHandler(async (req, res) => {
    const validationError = validateSpeakerPayload(req.body, { partial: true })
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const speaker = await repository.update(req.params.id, req.body)
    if (!speaker) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({
      ok: true,
      message: 'Conferencista actualizado parcialmente',
      speaker
    })
  }))

  router.delete('/:id', asyncHandler(async (req, res) => {
    const speaker = await repository.remove(req.params.id)
    if (!speaker) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({
      ok: true,
      message: 'Conferencista eliminado correctamente',
      speaker
    })
  }))

  router.get('/:id/ponencias', asyncHandler(async (req, res) => {
    const talks = await repository.listTalks(req.params.id)
    if (!talks) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({ ok: true, talks })
  }))

  router.post('/:id/ponencias', asyncHandler(async (req, res) => {
    const validationError = validateTalkPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const talk = await repository.addTalk(req.params.id, {
      title: req.body.title.trim(),
      abstract: req.body.abstract.trim(),
      topic: req.body.topic.trim(),
      durationMinutes: req.body.durationMinutes
    })

    if (!talk) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(201).json({
      ok: true,
      message: 'Ponencia agregada correctamente',
      talk
    })
  }))

  router.get('/:id/eventos', asyncHandler(async (req, res) => {
    const eventLinks = await repository.listEventLinks(req.params.id)
    if (!eventLinks) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({ ok: true, eventLinks })
  }))

  router.post('/:id/eventos', asyncHandler(async (req, res) => {
    const validationError = validateEventLinkPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const eventLink = await repository.addEventLink(req.params.id, {
      conferenceId: req.body.conferenceId ?? null,
      conferenceTitle: req.body.conferenceTitle.trim(),
      participationType: req.body.participationType.trim(),
      scheduledAt: req.body.scheduledAt || null
    })

    if (!eventLink) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(201).json({
      ok: true,
      message: 'Relación con evento agregada correctamente',
      eventLink
    })
  }))

  router.use((error, _req, res, _next) => {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un conferencista con ese slug'
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
  createSpeakersRouter
}
