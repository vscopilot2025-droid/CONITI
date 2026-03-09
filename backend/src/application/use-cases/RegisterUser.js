import bcrypt from 'bcrypt'

export class RegisterUser {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  async execute({ fullName, email, password }) {
    if (!fullName?.trim()) {
      throw new Error('El nombre es obligatorio')
    }

    if (!email?.trim()) {
      throw new Error('El correo es obligatorio')
    }

    if (!password?.trim()) {
      throw new Error('La contraseña es obligatoria')
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener mínimo 6 caracteres')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await this.userRepository.findByEmail(normalizedEmail)
    if (existingUser) {
      throw new Error('El correo ya está registrado')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const createdUser = await this.userRepository.createUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash
    })

    return {
      id: createdUser.id,
      fullName: createdUser.fullName,
      email: createdUser.email
    }
  }
}
