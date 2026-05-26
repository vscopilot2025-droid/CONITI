const { Router } = require('express')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')
const { createRateLimiter } = require('../middleware/request-limit.middleware')
const { allowedRoles } = require('../repositories')
const { createJwt } = require('../services/token.service')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeTrimmedString(value, { maxLength, fieldName, required = true } = {}) {
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

function validatePassword(value, fieldName = 'contraseña') {
  if (typeof value !== 'string' || !value.trim()) {
    return `La ${fieldName} es obligatoria`
  }

  const normalizedPassword = value.trim()
  if (normalizedPassword.length < 8) {
    return `La ${fieldName} debe tener mínimo 8 caracteres`
  }

  if (!/[A-Za-z]/.test(normalizedPassword) || !/\d/.test(normalizedPassword)) {
    return `La ${fieldName} debe incluir letras y números`
  }

  return null
}

function validateRegistrationPayload(body) {
  const fullName = normalizeTrimmedString(body?.fullName, { fieldName: 'nombre', maxLength: 120 })
  if (fullName.error) return fullName.error

  const email = normalizeTrimmedString(body?.email, { fieldName: 'correo', maxLength: 160 })
  if (email.error) return email.error
  if (!emailPattern.test(email.value.toLowerCase())) {
    return 'El correo no es válido'
  }

  const passwordError = validatePassword(body?.password)
  if (passwordError) return passwordError

  if (body.role && !allowedRoles.includes(body.role)) {
    return `El rol debe ser uno de: ${allowedRoles.join(', ')}`
  }

  return null
}

function validateLoginPayload(body) {
  const email = normalizeTrimmedString(body?.email, { fieldName: 'correo', maxLength: 160 })
  if (email.error) return email.error
  if (!emailPattern.test(email.value.toLowerCase())) {
    return 'El correo no es válido'
  }

  if (!body?.password?.trim()) {
    return 'La contraseña es obligatoria'
  }

  return null
}

function issueAuthResponse(user) {
  const token = createJwt({
    sub: user.id,
    email: user.email,
    role: user.role
  })

  return {
    user,
    token,
    tokenType: 'Bearer'
  }
}

function createAuthRouter(repository, config) {
  const authRouter = Router()
  const authGuard = requireAuth(repository)
  const adminGuard = requireRole('admin')
  const loginLimiter = createRateLimiter({
    windowMs: config.authRateLimitWindowMs,
    max: config.loginRateLimitMax,
    message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos.',
    prefix: 'auth-login'
  })
  const registerLimiter = createRateLimiter({
    windowMs: config.authRateLimitWindowMs,
    max: config.registerRateLimitMax,
    message: 'Demasiados intentos de registro. Intenta de nuevo en unos minutos.',
    prefix: 'auth-register'
  })
  const resetLimiter = createRateLimiter({
    windowMs: config.authRateLimitWindowMs,
    max: config.resetRateLimitMax,
    message: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en unos minutos.',
    prefix: 'auth-reset'
  })

  authRouter.post('/register', registerLimiter, async (req, res) => {
    const validationError = validateRegistrationPayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const normalizedEmail = req.body.email.trim().toLowerCase()
    const existingUser = await repository.findUserByEmail(normalizedEmail)
    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: 'El correo ya está registrado'
      })
    }

    const user = await repository.createUser({
      fullName: req.body.fullName.trim(),
      email: normalizedEmail,
      password: req.body.password.trim(),
      role: 'attendee'
    })

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      ...issueAuthResponse(user)
    })
  })

  authRouter.post('/login', loginLimiter, async (req, res) => {
    const validationError = validateLoginPayload(req.body)
    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError
      })
    }

    const user = await repository.validateCredentials(req.body.email, req.body.password)
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Inicio de sesión exitoso',
      ...issueAuthResponse(user)
    })
  })

  authRouter.get('/me', authGuard, async (req, res) => {
    return res.status(200).json({
      ok: true,
      user: req.auth.user
    })
  })

  authRouter.get('/roles', authGuard, async (req, res) => {
    return res.status(200).json({
      ok: true,
      currentRole: req.auth.user.role,
      availableRoles: allowedRoles
    })
  })

  authRouter.patch('/users/:id/role', authGuard, adminGuard, async (req, res) => {
    const userId = Number(req.params.id)
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'El id de usuario es inválido'
      })
    }

    const { role } = req.body || {}
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        ok: false,
        message: `El rol debe ser uno de: ${allowedRoles.join(', ')}`
      })
    }

    const updatedUser = await repository.updateUserRole(userId, role)
    if (!updatedUser) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Rol actualizado correctamente',
      user: updatedUser
    })
  })

  authRouter.post('/reset-password/request', resetLimiter, async (req, res) => {
    const email = normalizeTrimmedString(req.body?.email, { fieldName: 'correo', maxLength: 160 })
    if (email.error) {
      return res.status(400).json({
        ok: false,
        message: email.error
      })
    }

    if (!emailPattern.test(email.value.toLowerCase())) {
      return res.status(400).json({
        ok: false,
        message: 'El correo no es válido'
      })
    }

    await repository.createResetToken(email.value)

    return res.status(200).json({
      ok: true,
      message: 'Si el correo existe, se generó una solicitud de reseteo'
    })
  })

  authRouter.post('/reset-password/confirm', resetLimiter, async (req, res) => {
    const token = normalizeTrimmedString(req.body?.token, { fieldName: 'token', maxLength: 255 })
    if (token.error) {
      return res.status(400).json({
        ok: false,
        message: token.error
      })
    }

    const passwordError = validatePassword(req.body?.newPassword, 'nueva contraseña')
    if (passwordError) {
      return res.status(400).json({
        ok: false,
        message: passwordError
      })
    }

    const updatedUser = await repository.consumeResetToken(
      token.value,
      req.body.newPassword.trim()
    )

    if (!updatedUser) {
      return res.status(400).json({
        ok: false,
        message: 'El token de reseteo no es válido o ya expiró'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada correctamente',
      user: updatedUser
    })
  })

  authRouter.get('/users', authGuard, adminGuard, async (_req, res) => {
    const users = await repository.listUsers()

    return res.status(200).json({
      ok: true,
      users
    })
  })

  authRouter.use((error, _req, res, _next) => {
    console.error('[auth-service] error procesando solicitud:', error.message)
    return res.status(500).json({
      ok: false,
      message: 'No fue posible procesar la solicitud'
    })
  })

  return authRouter
}

module.exports = {
  createAuthRouter
}
