import { HealthRepository } from '../../domain/ports/HealthRepository.js'
import { HealthStatus } from '../../domain/entities/HealthStatus.js'

export class SystemHealthRepository extends HealthRepository {
  getStatus() {
    return new HealthStatus('coniiti-backend', 'ok', new Date().toISOString())
  }
}
