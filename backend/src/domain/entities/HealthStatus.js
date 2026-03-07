export class HealthStatus {
  constructor(service, status, timestamp) {
    this.service = service
    this.status = status
    this.timestamp = timestamp
  }
}
