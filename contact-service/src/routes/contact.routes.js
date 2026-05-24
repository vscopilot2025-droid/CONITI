const { Router } = require('express')

function createContactRouter(repository) {
  const router = Router()

  // POST /contact — guardar mensaje
  router.post('/', async (req, res) => {
    try {
      const { firstName, lastName, email, institution, queryType, message } = req.body

      if (!firstName || !lastName || !email || !institution || !queryType || !message) {
        return res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios' })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ ok: false, error: 'Correo electrónico inválido' })
      }

      const saved = await repository.saveMessage({ firstName, lastName, email, institution, queryType, message })
      return res.status(201).json({ ok: true, data: saved })
    } catch (err) {
      console.error('Error guardando mensaje:', err)
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' })
    }
  })

  // GET /contact — listar mensajes (admin)
  router.get('/', async (_req, res) => {
    try {
      const messages = await repository.getAllMessages()
      return res.status(200).json({ ok: true, data: messages })
    } catch (err) {
      console.error('Error obteniendo mensajes:', err)
      return res.status(500).json({ ok: false, error: 'Error interno del servidor' })
    }
  })

  return router
}

module.exports = { createContactRouter }