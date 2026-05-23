import { ScheduleRepository } from '../../domain/ports/ScheduleRepository'
import { apiConfig, buildApiUrl } from '../config/api'

export class HttpScheduleRepository extends ScheduleRepository {
  async getMasterAgenda() {
    const response = await fetch(buildApiUrl(apiConfig.datesApiUrl, '/fechas/master-agenda'))
    if (!response.ok) {
      throw new Error('Could not load schedule')
    }

    const payload = await response.json()
    return payload.entries || []
  }
}
