import cors from 'cors'
import express from 'express'
import { GetHealthStatus } from '../../application/use-cases/GetHealthStatus.js'
import { LoginUser } from '../../application/use-cases/LoginUser.js'
import { RegisterUser } from '../../application/use-cases/RegisterUser.js'
import { SystemHealthRepository } from '../../infrastructure/repositories/SystemHealthRepository.js'
import { MySqlUserRepository } from '../../infrastructure/repositories/MySqlUserRepository.js'
import { createAuthRouter } from './auth.routes.js'
import { createHealthRouter } from './health.routes.js'

export function createApp() {
  const app = express()
  const healthRepository = new SystemHealthRepository()
  const userRepository = new MySqlUserRepository()
  const getHealthStatusUseCase = new GetHealthStatus(healthRepository)
  const registerUserUseCase = new RegisterUser(userRepository)
  const loginUserUseCase = new LoginUser(userRepository)

  app.use(cors())
  app.use(express.json())
  app.use('/api', createHealthRouter(getHealthStatusUseCase))
  app.use('/api/auth', createAuthRouter(registerUserUseCase, loginUserUseCase))

  return app
}
