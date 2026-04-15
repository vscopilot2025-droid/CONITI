const { getSpeakerConfig } = require('../config/env')
const { SpeakerMemoryRepository } = require('./speaker-memory.repository')
const { SpeakerMySqlRepository } = require('./speaker-mysql.repository')

async function createSpeakerRepository() {
  const config = getSpeakerConfig()

  if (config.storage === 'mysql') {
    const repository = new SpeakerMySqlRepository(config.database)
    await repository.initialize()
    return repository
  }

  return new SpeakerMemoryRepository()
}

module.exports = {
  createSpeakerRepository
}
