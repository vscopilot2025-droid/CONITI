const { Router } = require('express')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')
const { createRateLimiter } = require('../middleware/request-limit.middleware')

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

function normalizeExpertise(expertise) {
  if (expertise === undefined) {
    return []
  }

  if (!Array.isArray(expertise)) {
    throw new Error('La experiencia debe enviarse como un arreglo')
  }

  if (expertise.length > 12) {
    throw new Error('La experiencia no puede tener mas de 12 elementos')
  }

  return expertise.map((item, index) => normalizeText(item, {
    maxLength: 60,
    fieldName: `expertise[${index}]`
  }))
}

function validateSpeakerPayload(body, { partial = false } = {}) {
  if (!partial || body.fullName !== undefined) {
    if (!body?.fullName?.trim()) return 'El nombre completo es obligatorio'
    if (body.fullName.trim().length > 140) return 'El nombre completo supera el maximo permitido'
  }
  if (!partial || body.slug !== undefined) {
    if (!body?.slug?.trim()) return 'El slug es obligatorio'
    if (body.slug.trim().length > 120) return 'El slug supera el maximo permitido'
  }
  if (!partial || body.initials !== undefined) {
    if (!body?.initials?.trim()) return 'Las iniciales son obligatorias'
    if (body.initials.trim().length > 12) return 'Las iniciales superan el maximo permitido'
  }
  if (!partial || body.institution !== undefined) {
    if (!body?.institution?.trim()) return 'La institucion es obligatoria'
    if (body.institution.trim().length > 180) return 'La institucion supera el maximo permitido'
  }
  if (!partial || body.country !== undefined) {
    if (!body?.country?.trim()) return 'El pais es obligatorio'
    if (body.country.trim().length > 80) return 'El pais supera el maximo permitido'
  }
  if (!partial || body.countryCode !== undefined) {
    if (!body?.countryCode?.trim()) return 'El codigo de pais es obligatorio'
    if (!/^[A-Za-z]{2,5}$/.test(body.countryCode.trim())) return 'El codigo de pais es invalido'
  }
  if (!partial || body.city !== undefined) {
    if (!body?.city?.trim()) return 'La ciudad es obligatoria'
    if (body.city.trim().length > 80) return 'La ciudad supera el maximo permitido'
  }
  if (!partial || body.bio !== undefined) {
    if (!body?.bio?.trim()) return 'La biografia es obligatoria'
    if (body.bio.trim().length > 3000) return 'La biografia supera el maximo permitido'
  }
  if (body.expertise !== undefined && !Array.isArray(body.expertise)) {
    return 'La experiencia debe enviarse como un arreglo'
  }
  if (Array.isArray(body.expertise) && body.expertise.length > 12) {
    return 'La experiencia no puede tener mas de 12 elementos'
  }
  return null
}

function validateTalkPayload(body) {
  if (!body?.title?.trim()) return 'El titulo de la ponencia es obligatorio'
  if (body.title.trim().length > 180) return 'El titulo de la ponencia supera el maximo permitido'
  if (!body?.abstract?.trim()) return 'El resumen de la ponencia es obligatorio'
  if (body.abstract.trim().length > 2500) return 'El resumen de la ponencia supera el maximo permitido'
  if (!body?.topic?.trim()) return 'El tema de la ponencia es obligatorio'
  if (body.topic.trim().length > 120) return 'El tema de la ponencia supera el maximo permitido'
  if (!Number.isInteger(body?.durationMinutes) || body.durationMinutes <= 0 || body.durationMinutes > 600) {
    return 'La duracion debe ser un entero entre 1 y 600 minutos'
  }
  return null
}

function validateEventLinkPayload(body) {
  if (!body?.conferenceTitle?.trim()) return 'El titulo del evento es obligatorio'
  if (body.conferenceTitle.trim().length > 180) return 'El titulo del evento supera el maximo permitido'
  if (!body?.participationType?.trim()) return 'El tipo de participacion es obligatorio'
  if (body.participationType.trim().length > 80) return 'El tipo de participacion supera el maximo permitido'
  if (body.conferenceId !== undefined && body.conferenceId !== null && parsePositiveInteger(body.conferenceId) === null) {
    return 'El id de la conferencia es invalido'
  }
  if (body.scheduledAt && Number.isNaN(Date.parse(body.scheduledAt))) {
    return 'La fecha programada es invalida'
  }
  return null
}

function createSpeakersRouter(repository, config) {
  const router = Router()
  const writeLimiter = createRateLimiter({
    windowMs: config.writeRateLimitWindowMs,
    max: config.writeRateLimitMax,
    prefix: 'speakers-write',
    message: 'Has excedido el limite temporal para operaciones de escritura'
  })
  const writeGuards = [writeLimiter, requireAuth(config), requireRole('admin', 'organizer')]

  router.get('/', asyncHandler(async (req, res) => {
    if (req.query.search && String(req.query.search).trim().length > 120) {
      return res.status(400).json({ ok: false, message: 'El parametro search supera el maximo permitido' })
    }

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
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const speaker = await repository.findById(speakerId)
    if (!speaker) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({ ok: true, speaker })
  }))

  router.post('/', ...writeGuards, asyncHandler(async (req, res) => {
    const validationError = validateSpeakerPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const speaker = await repository.create({
      fullName: normalizeText(req.body.fullName, { maxLength: 140, fieldName: 'fullName' }),
      slug: normalizeText(req.body.slug, { maxLength: 120, fieldName: 'slug' }).toLowerCase(),
      initials: normalizeText(req.body.initials, { maxLength: 12, fieldName: 'initials' }).toUpperCase(),
      institution: normalizeText(req.body.institution, { maxLength: 180, fieldName: 'institution' }),
      country: normalizeText(req.body.country, { maxLength: 80, fieldName: 'country' }),
      countryCode: normalizeText(req.body.countryCode, { maxLength: 5, fieldName: 'countryCode' }).toUpperCase(),
      city: normalizeText(req.body.city, { maxLength: 80, fieldName: 'city' }),
      bio: normalizeText(req.body.bio, { maxLength: 3000, fieldName: 'bio' }),
      expertise: normalizeExpertise(req.body.expertise),
      featured: Boolean(req.body.featured)
    })

    res.status(201).json({
      ok: true,
      message: 'Conferencista creado correctamente',
      speaker
    })
  }))

  router.put('/:id', ...writeGuards, asyncHandler(async (req, res) => {
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const validationError = validateSpeakerPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const speaker = await repository.update(speakerId, {
      fullName: normalizeText(req.body.fullName, { maxLength: 140, fieldName: 'fullName' }),
      slug: normalizeText(req.body.slug, { maxLength: 120, fieldName: 'slug' }).toLowerCase(),
      initials: normalizeText(req.body.initials, { maxLength: 12, fieldName: 'initials' }).toUpperCase(),
      institution: normalizeText(req.body.institution, { maxLength: 180, fieldName: 'institution' }),
      country: normalizeText(req.body.country, { maxLength: 80, fieldName: 'country' }),
      countryCode: normalizeText(req.body.countryCode, { maxLength: 5, fieldName: 'countryCode' }).toUpperCase(),
      city: normalizeText(req.body.city, { maxLength: 80, fieldName: 'city' }),
      bio: normalizeText(req.body.bio, { maxLength: 3000, fieldName: 'bio' }),
      expertise: normalizeExpertise(req.body.expertise),
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

  router.patch('/:id', ...writeGuards, asyncHandler(async (req, res) => {
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const validationError = validateSpeakerPayload(req.body, { partial: true })
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const payload = {}

    if (req.body.fullName !== undefined) payload.fullName = normalizeText(req.body.fullName, { maxLength: 140, fieldName: 'fullName' })
    if (req.body.slug !== undefined) payload.slug = normalizeText(req.body.slug, { maxLength: 120, fieldName: 'slug' }).toLowerCase()
    if (req.body.initials !== undefined) payload.initials = normalizeText(req.body.initials, { maxLength: 12, fieldName: 'initials' }).toUpperCase()
    if (req.body.institution !== undefined) payload.institution = normalizeText(req.body.institution, { maxLength: 180, fieldName: 'institution' })
    if (req.body.country !== undefined) payload.country = normalizeText(req.body.country, { maxLength: 80, fieldName: 'country' })
    if (req.body.countryCode !== undefined) payload.countryCode = normalizeText(req.body.countryCode, { maxLength: 5, fieldName: 'countryCode' }).toUpperCase()
    if (req.body.city !== undefined) payload.city = normalizeText(req.body.city, { maxLength: 80, fieldName: 'city' })
    if (req.body.bio !== undefined) payload.bio = normalizeText(req.body.bio, { maxLength: 3000, fieldName: 'bio' })
    if (req.body.expertise !== undefined) payload.expertise = normalizeExpertise(req.body.expertise)
    if (req.body.featured !== undefined) payload.featured = Boolean(req.body.featured)

    const speaker = await repository.update(speakerId, payload)
    if (!speaker) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({
      ok: true,
      message: 'Conferencista actualizado parcialmente',
      speaker
    })
  }))

  router.delete('/:id', ...writeGuards, asyncHandler(async (req, res) => {
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const speaker = await repository.remove(speakerId)
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
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const talks = await repository.listTalks(speakerId)
    if (!talks) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({ ok: true, talks })
  }))

  router.post('/:id/ponencias', ...writeGuards, asyncHandler(async (req, res) => {
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const validationError = validateTalkPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const talk = await repository.addTalk(speakerId, {
      title: normalizeText(req.body.title, { maxLength: 180, fieldName: 'title' }),
      abstract: normalizeText(req.body.abstract, { maxLength: 2500, fieldName: 'abstract' }),
      topic: normalizeText(req.body.topic, { maxLength: 120, fieldName: 'topic' }),
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
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const eventLinks = await repository.listEventLinks(speakerId)
    if (!eventLinks) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(200).json({ ok: true, eventLinks })
  }))

  router.post('/:id/eventos', ...writeGuards, asyncHandler(async (req, res) => {
    const speakerId = parsePositiveInteger(req.params.id)
    if (speakerId === null) {
      return res.status(400).json({ ok: false, message: 'El id del conferencista es invalido' })
    }

    const validationError = validateEventLinkPayload(req.body)
    if (validationError) {
      return res.status(400).json({ ok: false, message: validationError })
    }

    const eventLink = await repository.addEventLink(speakerId, {
      conferenceId: req.body.conferenceId === undefined || req.body.conferenceId === null
        ? null
        : parsePositiveInteger(req.body.conferenceId),
      conferenceTitle: normalizeText(req.body.conferenceTitle, { maxLength: 180, fieldName: 'conferenceTitle' }),
      participationType: normalizeText(req.body.participationType, { maxLength: 80, fieldName: 'participationType' }),
      scheduledAt: req.body.scheduledAt || null
    })

    if (!eventLink) {
      return res.status(404).json({ ok: false, message: 'Conferencista no encontrado' })
    }

    res.status(201).json({
      ok: true,
      message: 'Relacion con evento agregada correctamente',
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

    console.error('[conferencistas-service] error procesando solicitud:', error?.message || error)
    return res.status(500).json({
      ok: false,
      message: 'No fue posible procesar la solicitud'
    })
  })

  return router
}

module.exports = {
  createSpeakersRouter
}
