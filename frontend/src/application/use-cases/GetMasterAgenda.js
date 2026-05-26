export class GetMasterAgenda {
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository
  }

  async execute() {
    return this.scheduleRepository.getMasterAgenda()
  }
}
