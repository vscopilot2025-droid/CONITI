export class GetLandingDocument {
  constructor(landingPageRepository) {
    this.landingPageRepository = landingPageRepository
  }

  async execute() {
    return this.landingPageRepository.getLandingDocument()
  }
}
