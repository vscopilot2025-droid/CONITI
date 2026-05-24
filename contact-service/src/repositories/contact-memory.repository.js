async function createContactMemoryRepository() {
  const messages = []
  let nextId = 1

  return {
    async saveMessage({ firstName, lastName, email, institution, queryType, message }) {
      const entry = {
        id: nextId++,
        firstName, lastName, email, institution, queryType, message,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      messages.push(entry)
      return entry
    },

    async getAllMessages() {
      return [...messages].reverse()
    }
  }
}

module.exports = { createContactMemoryRepository }