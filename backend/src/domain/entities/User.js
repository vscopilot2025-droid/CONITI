export class User {
  constructor({ id, fullName, email, passwordHash, createdAt, updatedAt, lastLoginAt }) {
    this.id = id
    this.fullName = fullName
    this.email = email
    this.passwordHash = passwordHash
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.lastLoginAt = lastLoginAt
  }
}
