import { SpeakerRepository } from '../../domain/ports/SpeakerRepository'

export class HttpSpeakerRepository extends SpeakerRepository {
  async getFeaturedSpeakers() {
    const response = await fetch('http://127.0.0.1:3005/conferencistas?featured=true')
    if (!response.ok) {
      throw new Error('Could not load speakers')
    }

    const payload = await response.json()
    return payload.speakers || []
  }
}
