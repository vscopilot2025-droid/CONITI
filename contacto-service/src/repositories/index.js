const { getContactConfig } = require('../config/env')
const { ContactMemoryRepository, allowedInquiryTypes } = require('./contact-memory.repository')
const { ContactMySqlRepository } = require('./contact-mysql.repository')

async function createContactRepository() {
  const config = getContactConfig()

  if (config.storage === 'mysql') {
    const repository = new ContactMySqlRepository(config.database)
    await repository.initialize()
    return repository
  }

  const repository = new ContactMemoryRepository()
  await repository.initialize()
  return repository
}

module.exports = {
  allowedInquiryTypes,
  createContactRepository
}
