const { getContactConfig } = require('../config/env')
const { createContactMysqlRepository } = require('./contact-mysql.repository')
const { createContactMemoryRepository } = require('./contact-memory.repository')

async function createContactRepository() {
  const config = getContactConfig()
  if (config.storage === 'mysql') {
    return createContactMysqlRepository(config)
  }
  return createContactMemoryRepository()
}

module.exports = { createContactRepository }