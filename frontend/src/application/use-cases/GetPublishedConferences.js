export class GetPublishedConferences {
  constructor(conferenceRepository) {
    this.conferenceRepository = conferenceRepository
  }

  async execute() {
    return this.conferenceRepository.getPublishedConferences()
  }
}
