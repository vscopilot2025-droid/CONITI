const { hashPassword, verifyPassword } = require('../utils/password.util')

const allowedRoles = ['admin', 'organizer', 'attendee']

class AuthMemoryRepository {
  constructor() {
    const now = new Date().toISOString()
    this.nextUserId = 3
    this.users = [
      {
        id: 1,
        fullName: 'Admin CONIITI',
        email: 'admin@coniiti.test',
        passwordHash: hashPassword('Admin123*'),
        role: 'admin',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null
      },
      {
        id: 2,
        fullName: 'Organizador Demo',
        email: 'organizer@coniiti.test',
        passwordHash: hashPassword('Organizer123*'),
        role: 'organizer',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null
      }
    ]
    this.resetTokens = []
    this.payments = []
  }

  async initialize() {}

  sanitizeUser(user) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    }
  }

  async findUserByEmail(email) {
    return this.users.find((user) => user.email === email) || null
  }

  async findUserById(id) {
    return this.users.find((user) => user.id === Number(id)) || null
  }

  async createUser({ fullName, email, password, role = 'attendee' }) {
    const timestamp = new Date().toISOString()
    const user = {
      id: this.nextUserId++,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: null
    }

    this.users.push(user)
    return this.sanitizeUser(user)
  }

  async validateCredentials(email, password) {
    const user = await this.findUserByEmail(email.trim().toLowerCase())
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return null
    }

    user.lastLoginAt = new Date().toISOString()
    user.updatedAt = user.lastLoginAt
    return this.sanitizeUser(user)
  }

  async updateUserRole(userId, role) {
    const user = await this.findUserById(userId)
    if (!user) {
      return null
    }

    user.role = role
    user.updatedAt = new Date().toISOString()
    return this.sanitizeUser(user)
  }

  async createResetToken(email) {
    const user = await this.findUserByEmail(email.trim().toLowerCase())
    if (!user) {
      return null
    }

    const expiresAt = Date.now() + 1000 * 60 * 15
    const token = `reset-${user.id}-${Date.now()}`
    this.resetTokens.push({
      token,
      userId: user.id,
      expiresAt,
      used: false
    })

    return {
      token,
      expiresAt: new Date(expiresAt).toISOString(),
      user: this.sanitizeUser(user)
    }
  }

  async consumeResetToken(token, newPassword) {
    const resetToken = this.resetTokens.find((entry) => entry.token === token)
    if (!resetToken || resetToken.used || resetToken.expiresAt < Date.now()) {
      return null
    }

    const user = await this.findUserById(resetToken.userId)
    if (!user) {
      return null
    }

    user.passwordHash = hashPassword(newPassword)
    user.updatedAt = new Date().toISOString()
    resetToken.used = true
    return this.sanitizeUser(user)
  }

  async listUsers() {
    return this.users.map((user) => this.sanitizeUser(user))
  }

  async createPaymentSession({
    sessionId,
    userId,
    userEmail,
    ticketType,
    amountInMinorUnit,
    currency,
    checkoutUrl,
    status = 'created'
  }) {
    const now = new Date().toISOString()
    const payment = {
      sessionId,
      userId: Number(userId),
      userEmail,
      ticketType,
      amountInMinorUnit: Number(amountInMinorUnit),
      currency: String(currency || 'cop').toLowerCase(),
      checkoutUrl,
      status,
      providerPaymentId: null,
      providerEventId: null,
      createdAt: now,
      updatedAt: now
    }

    this.payments = this.payments.filter((item) => item.sessionId !== sessionId)
    this.payments.push(payment)
    return { ...payment }
  }

  async markPaymentCompleted({ sessionId, providerPaymentId, providerEventId }) {
    const payment = this.payments.find((item) => item.sessionId === sessionId)
    if (!payment) {
      return null
    }

    payment.status = 'paid'
    payment.providerPaymentId = providerPaymentId || payment.providerPaymentId
    payment.providerEventId = providerEventId || payment.providerEventId
    payment.updatedAt = new Date().toISOString()
    return { ...payment }
  }

  async markPaymentFailed({ sessionId, providerEventId }) {
    const payment = this.payments.find((item) => item.sessionId === sessionId)
    if (!payment) {
      return null
    }

    payment.status = 'failed'
    payment.providerEventId = providerEventId || payment.providerEventId
    payment.updatedAt = new Date().toISOString()
    return { ...payment }
  }

  async findPaymentSessionById(sessionId) {
    const payment = this.payments.find((item) => item.sessionId === sessionId)
    return payment ? { ...payment } : null
  }
}

module.exports = {
  allowedRoles,
  AuthMemoryRepository
}
