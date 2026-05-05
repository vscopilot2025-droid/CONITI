export class GetSpeakers {
  constructor(speakerRepository) {
    this.speakerRepository = speakerRepository
  }

  async execute(filters) {
    return this.speakerRepository.getSpeakers(filters)
  }
}
