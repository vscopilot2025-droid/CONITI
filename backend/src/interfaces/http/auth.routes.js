import { Router } from 'express'

export function createAuthRouter(registerUserUseCase, loginUserUseCase) {
  const router = Router()

  router.post('/register', async (req, res) => {
    try {
      const result = await registerUserUseCase.execute({
        fullName: req.body?.fullName,
        email: req.body?.email,
        password: req.body?.password
      })

      res.status(201).json({
        ok: true,
        message: 'Usuario registrado correctamente',
        user: result
      })
    } catch (error) {
      res.status(400).json({
        ok: false,
        message: error.message || 'No fue posible registrar el usuario'
      })
    }
  })

  router.post('/login', async (req, res) => {
    try {
      const result = await loginUserUseCase.execute({
        email: req.body?.email,
        password: req.body?.password
      })

      res.status(200).json({
        ok: true,
        message: 'Inicio de sesión exitoso',
        user: result
      })
    } catch (error) {
      res.status(401).json({
        ok: false,
        message: error.message || 'Credenciales inválidas'
      })
    }
  })

  return router
}
