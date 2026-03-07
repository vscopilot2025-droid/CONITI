import { Router } from 'express'

export function createHealthRouter(getHealthStatusUseCase) {
  const router = Router()

  router.get('/health', (_req, res) => {
    const status = getHealthStatusUseCase.execute()
    res.json(status)
  })

  return router
}
