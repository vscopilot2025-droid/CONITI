import { SpeakerRepository } from '../../domain/ports/SpeakerRepository'
import { apiConfig, buildApiUrl } from '../config/api'

export class HttpSpeakerRepository extends SpeakerRepository {
  async getSpeakers(filters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value)
      }
    })

    const response = await fetch(buildApiUrl(apiConfig.speakersApiUrl, `/conferencistas${params.toString() ? `?${params.toString()}` : ''}`))
    if (!response.ok) {
      throw new Error('Could not load speakers')
    }

    const payload = await response.json()
    return payload.speakers || []
  }

  async getFeaturedSpeakers() {
    return this.getSpeakers({ featured: true })
  }
}
