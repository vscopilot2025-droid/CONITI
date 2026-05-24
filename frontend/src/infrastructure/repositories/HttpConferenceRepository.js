import { ConferenceRepository } from '../../domain/ports/ConferenceRepository'
import { apiConfig, buildApiUrl } from '../config/api'

export class HttpConferenceRepository extends ConferenceRepository {
  async getPublishedConferences(filters = {}) {
    const params = new URLSearchParams({ status: 'published' })
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value)
      }
    })

    const response = await fetch(buildApiUrl(apiConfig.conferencesApiUrl, `/conferencias?${params.toString()}`))
    if (!response.ok) {
      throw new Error('Could not load conferences')
    }

    const payload = await response.json()
    return payload.conferences || []
  }

  async getCategories() {
    const response = await fetch(buildApiUrl(apiConfig.conferencesApiUrl, '/conferencias/categories'))
    if (!response.ok) {
      throw new Error('Could not load conference categories')
    }

    const payload = await response.json()
    return payload.categories || []
  }
}
