const allowedInquiryTypes = [
  'Boletería y acceso',
  'Ponencias y abstracts',
  'Patrocinio',
  'Prensa y medios',
  'Otra consulta'
]

class ContactMemoryRepository {
  constructor() {
    this.nextMessageId = 1
    this.messages = []
  }

  async initialize() {}

  sanitizeMessage(message) {
    return {
      id: message.id,
      firstName: message.firstName,
      lastName: message.lastName,
      email: message.email,
      institution: message.institution,
      inquiryType: message.inquiryType,
      message: message.message,
      createdAt: message.createdAt
    }
  }

  async createMessage(payload) {
    const entry = {
      id: this.nextMessageId++,
      ...payload,
      createdAt: new Date().toISOString()
    }

    this.messages.unshift(entry)
    return this.sanitizeMessage(entry)
  }

  async listMessages(filters = {}) {
    const query = (filters.search || '').trim().toLowerCase()

    return this.messages
      .filter((message) => {
        if (filters.inquiryType && message.inquiryType !== filters.inquiryType) {
          return false
        }

        if (!query) {
          return true
        }

        const searchableText = [
          message.firstName,
          message.lastName,
          message.email,
          message.institution,
          message.inquiryType,
          message.message
        ].join(' ').toLowerCase()

        return searchableText.includes(query)
      })
      .map((message) => this.sanitizeMessage(message))
  }
}

module.exports = {
  allowedInquiryTypes,
  ContactMemoryRepository
}
