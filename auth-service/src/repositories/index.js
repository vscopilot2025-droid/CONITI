const { getAuthConfig } = require('../config/env')
const { AuthMemoryRepository, allowedRoles } = require('./auth-memory.repository')
const { AuthMySqlRepository } = require('./auth-mysql.repository')

async function createAuthRepository() {
  const config = getAuthConfig()

  if (config.storage === 'mysql') {
    const repository = new AuthMySqlRepository(config.database)
    await repository.initialize()
    return repository
  }

  const repository = new AuthMemoryRepository()
  await repository.initialize()
  return repository
}

module.exports = {
  allowedRoles,
  createAuthRepository
}
