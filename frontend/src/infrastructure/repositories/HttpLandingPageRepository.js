import { LandingPageRepository } from '../../domain/ports/LandingPageRepository'

export class HttpLandingPageRepository extends LandingPageRepository {
  async getLandingDocument() {
    const response = await fetch('/conii.html')
    if (!response.ok) {
      throw new Error('Could not load legacy landing page')
    }

    const html = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(html, 'text/html')
  }
}
