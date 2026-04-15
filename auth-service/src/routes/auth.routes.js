const { Router } = require('express')
const { requireAuth, requireRole } = require('../middleware/auth.middleware')
const { allowedRoles } = require('../repositories')
const { createJwt } = require('../services/token.service')

function validateRegistrationPayload(body) {
  if (!body?.fullName?.trim()) {
    return 'El nombre es obligatorio'
  }

  if (!body?.email?.trim()) {
    return 'El correo es obligatorio'
  }

  if (!body?.password?.trim()) {
    return 'La contraseña es obligatoria'
  }

  if (body.password.trim().length < 6) {
    return 'La contraseña debe tener mínimo 6 caracteres'
  }

  if (body.role && !allowedRoles.includes(body.role)) {
    return `El rol debe ser uno de: ${allowedRoles.join(', ')}`
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

function createAuthRouter(repository) {
  const authRouter = Router()
  const authGuard = requireAuth(repository)
  const adminGuard = requireRole('admin')

  authRouter.post('/register', async (req, res) => {
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
      fullName: req.body.fullName,
      email: normalizedEmail,
      password: req.body.password.trim(),
      role: req.body.role || 'attendee'
    })

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      ...issueAuthResponse(user)
    })
  })

  authRouter.post('/login', async (req, res) => {
    if (!req.body?.email?.trim() || !req.body?.password?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Correo y contraseña son obligatorios'
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
    const { role } = req.body || {}
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        ok: false,
        message: `El rol debe ser uno de: ${allowedRoles.join(', ')}`
      })
    }

    const updatedUser = await repository.updateUserRole(req.params.id, role)
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

  authRouter.post('/reset-password/request', async (req, res) => {
    if (!req.body?.email?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El correo es obligatorio'
      })
    }

    const result = await repository.createResetToken(req.body.email)
    if (!result) {
      return res.status(404).json({
        ok: false,
        message: 'No existe un usuario con ese correo'
      })
    }

    return res.status(200).json({
      ok: true,
      message: 'Solicitud de reseteo creada',
      resetToken: result.token,
      expiresAt: result.expiresAt
    })
  })

  authRouter.post('/reset-password/confirm', async (req, res) => {
    if (!req.body?.token?.trim() || !req.body?.newPassword?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Token y nueva contraseña son obligatorios'
      })
    }

    if (req.body.newPassword.trim().length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña debe tener mínimo 6 caracteres'
      })
    }

    const updatedUser = await repository.consumeResetToken(
      req.body.token.trim(),
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

  return authRouter
}

module.exports = {
  createAuthRouter
}
