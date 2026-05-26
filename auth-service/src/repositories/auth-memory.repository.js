const { hashPassword, verifyPassword } = require('../utils/password.util')

const allowedRoles = ['admin', 'organizer', 'attendee']
const allowedTicketProfiles = ['visitor', 'speaker', 'student']

class AuthMemoryRepository {
  constructor() {
    const now = new Date().toISOString()
    this.nextUserId = 3
    this.favoriteConferences = new Map([
      [1, [1, 2]],
      [2, [3]]
    ])
    this.users = [
      {
        id: 1,
        fullName: 'Admin CONIITI',
        email: 'admin@coniiti.test',
        passwordHash: hashPassword('Admin123*'),
        role: 'admin',
        ticketProfile: 'speaker',
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
        ticketProfile: 'visitor',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null
      }
    ]
    this.resetTokens = []
  }

  async initialize() {}

  sanitizeUser(user) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      ticketProfile: user.ticketProfile || 'visitor',
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

  async createUser({ fullName, email, password, role = 'attendee', ticketProfile = 'visitor' }) {
    const timestamp = new Date().toISOString()
    const user = {
      id: this.nextUserId++,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role,
      ticketProfile,
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

  async listFavoriteConferenceIds(userId) {
    return [...(this.favoriteConferences.get(Number(userId)) || [])]
  }

  async addFavoriteConference(userId, conferenceId) {
    const normalizedUserId = Number(userId)
    const normalizedConferenceId = Number(conferenceId)
    const favorites = new Set(this.favoriteConferences.get(normalizedUserId) || [])
    favorites.add(normalizedConferenceId)
    this.favoriteConferences.set(normalizedUserId, [...favorites])
    return this.listFavoriteConferenceIds(normalizedUserId)
  }

  async removeFavoriteConference(userId, conferenceId) {
    const normalizedUserId = Number(userId)
    const normalizedConferenceId = Number(conferenceId)
    const favorites = new Set(this.favoriteConferences.get(normalizedUserId) || [])
    favorites.delete(normalizedConferenceId)
    this.favoriteConferences.set(normalizedUserId, [...favorites])
    return this.listFavoriteConferenceIds(normalizedUserId)
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
}

module.exports = {
  allowedRoles,
  allowedTicketProfiles,
  AuthMemoryRepository
}
