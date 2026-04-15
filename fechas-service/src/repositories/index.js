const { getScheduleConfig } = require('../config/env')
const { ScheduleMemoryRepository } = require('./schedule-memory.repository')
const { ScheduleMySqlRepository } = require('./schedule-mysql.repository')

async function createScheduleRepository() {
  const config = getScheduleConfig()

  if (config.storage === 'mysql') {
    const repository = new ScheduleMySqlRepository(config.database)
    await repository.initialize()
    return repository
  }

  return new ScheduleMemoryRepository()
}

module.exports = {
  createScheduleRepository
}
