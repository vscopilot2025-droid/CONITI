const { verifyJwt } = require('../services/token.service')

function requireAuth(repository) {
  return async (req, res, next) => {
    const authorizationHeader = req.headers.authorization || ''
    const [scheme, token] = authorizationHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        ok: false,
        message: 'Token de acceso requerido'
      })
    }

    try {
      const payload = verifyJwt(token)
      const user = await repository.findUserById(payload.sub)

      if (!user) {
        return res.status(401).json({
          ok: false,
          message: 'Usuario no válido para este token'
        })
      }

      req.auth = {
        token,
        user: repository.sanitizeUser ? repository.sanitizeUser(user) : user,
        payload
      }

      return next()
    } catch (error) {
      return res.status(401).json({
        ok: false,
        message: error.message || 'Token inválido'
      })
    }
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.user) {
      return res.status(401).json({
        ok: false,
        message: 'Autenticación requerida'
      })
    }

    if (!roles.includes(req.auth.user.role)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para esta acción'
      })
    }

    return next()
  }
}

module.exports = {
  requireAuth,
  requireRole
}
