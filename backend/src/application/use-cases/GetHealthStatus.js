export class GetHealthStatus {
  constructor(healthRepository) {
    this.healthRepository = healthRepository
  }

  execute() {
    return this.healthRepository.getStatus()
  }
}
