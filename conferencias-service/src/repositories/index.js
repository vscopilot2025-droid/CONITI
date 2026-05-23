const { getConferenceConfig } = require('../config/env')
const { ConferenceMemoryRepository } = require('./conference-memory.repository')
const { ConferenceMySqlRepository } = require('./conference-mysql.repository')

async function createConferenceRepository() {
  const config = getConferenceConfig()

  if (config.storage === 'mysql') {
    const repository = new ConferenceMySqlRepository(config.database)
    await repository.initialize()
    return repository
  }

  return new ConferenceMemoryRepository()
}

module.exports = {
  createConferenceRepository
}
