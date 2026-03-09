import bcrypt from 'bcrypt'

export class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async execute({ email, password }) {
    if (!email?.trim()) {
      throw new Error('El correo es obligatorio')
    }

    if (!password?.trim()) {
      throw new Error('La contraseña es obligatoria')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await this.userRepository.findByEmail(normalizedEmail)
    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas')
    }

    await this.userRepository.updateLastLogin(user.id)

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    }
  }
}
