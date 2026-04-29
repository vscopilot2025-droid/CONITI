import { ConferenceRepository } from '../../domain/ports/ConferenceRepository'
import { apiConfig, buildApiUrl } from '../config/api'

export class HttpConferenceRepository extends ConferenceRepository {
  async getPublishedConferences() {
    const response = await fetch(buildApiUrl(apiConfig.conferencesApiUrl, '/conferencias?status=published'))
    if (!response.ok) {
      throw new Error('Could not load conferences')
    }

    const payload = await response.json()
    return payload.conferences || []
  }
}
