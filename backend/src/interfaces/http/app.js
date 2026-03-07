import cors from 'cors'
import express from 'express'
import { GetHealthStatus } from '../../application/use-cases/GetHealthStatus.js'
import { SystemHealthRepository } from '../../infrastructure/repositories/SystemHealthRepository.js'
import { createHealthRouter } from './health.routes.js'

export function createApp() {
  const app = express()
  const healthRepository = new SystemHealthRepository()
  const getHealthStatusUseCase = new GetHealthStatus(healthRepository)

  app.use(cors())
  app.use(express.json())
  app.use('/api', createHealthRouter(getHealthStatusUseCase))

  return app
}
