export class GetPublishedConferences {
  constructor(conferenceRepository) {
    this.conferenceRepository = conferenceRepository
  }

  async execute(filters = {}) {
    return this.conferenceRepository.getPublishedConferences(filters)
  }
}
