export class GetFeaturedSpeakers {
  constructor(speakerRepository) {
    this.speakerRepository = speakerRepository
  }

  async execute() {
    return this.speakerRepository.getFeaturedSpeakers()
  }
}
