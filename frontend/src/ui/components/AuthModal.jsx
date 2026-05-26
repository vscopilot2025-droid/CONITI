import { useEffect, useState } from 'react'
import { apiConfig, buildApiUrl } from '../../infrastructure/config/api'

const authStorageKey = 'coniiti.auth'

function persistAuthSession(session) {
  sessionStorage.setItem(authStorageKey, JSON.stringify(session))
  localStorage.removeItem(authStorageKey)
}

const initialLoginState = {
  email: '',
  password: ''
}

const initialRegisterState = {
  fullName: '',
  email: '',
  ticketProfile: 'visitor',
  password: '',
  confirmPassword: ''
}

const ticketProfileOptions = [
  { value: 'visitor', label: 'Visitante' },
  { value: 'speaker', label: 'Ponente' },
  { value: 'student', label: 'Estudiante' }
]

function getErrorMessage(payload, fallback) {
  return payload?.message || fallback
}

function clearLoginPasswordField(setLoginForm) {
  setLoginForm((current) => ({ ...current, password: '' }))
}

function clearRegisterPasswordFields(setRegisterForm) {
  setRegisterForm((current) => ({
    ...current,
    password: '',
    confirmPassword: ''
  }))
}

export function AuthModal({ initialMode = 'login', isOpen, onClose, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode)
  const [loginForm, setLoginForm] = useState(initialLoginState)
  const [registerForm, setRegisterForm] = useState(initialRegisterState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState({ text: '', type: 'default' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setFieldErrors({})
      setMessage({ text: '', type: 'default' })
    }
  }, [initialMode, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  function switchMode(nextMode) {
    setMode(nextMode)
    setFieldErrors({})
    setMessage({ text: '', type: 'default' })
  }

  function updateLoginField(field, value) {
    setLoginForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  function updateRegisterField(field, value) {
    setRegisterForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  async function parseJsonResponse(response) {
    try {
      return await response.json()
    } catch (_error) {
      return null
    }
  }

  async function submitLogin(event) {
    event.preventDefault()

    const email = loginForm.email.trim()
    const password = loginForm.password.trim()
    const errors = {}

    if (!email) errors.email = 'El correo es obligatorio'
    if (!password) errors.password = 'La contrasena es obligatoria'

    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setMessage({ text: 'Completa los campos obligatorios.', type: 'error' })
      return
    }

    try {
      setIsSubmitting(true)
      setMessage({ text: 'Validando credenciales...', type: 'default' })

      const response = await fetch(buildApiUrl(apiConfig.authApiUrl, '/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const payload = await parseJsonResponse(response)

      if (!response.ok || !payload?.ok) {
        clearLoginPasswordField(setLoginForm)
        setMessage({
          text: getErrorMessage(payload, 'No fue posible iniciar sesion.'),
          type: 'error'
        })
        return
      }

      persistAuthSession({
        token: payload.token,
        tokenType: payload.tokenType,
        user: payload.user
      })

      setMessage({ text: 'Inicio de sesion exitoso.', type: 'success' })
      setLoginForm(initialLoginState)
      onClose()
      onAuthenticated?.(payload)
    } catch (_error) {
      clearLoginPasswordField(setLoginForm)
      setMessage({
        text: 'No hay conexion con el servicio de autenticacion.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitRegister(event) {
    event.preventDefault()

    const fullName = registerForm.fullName.trim()
    const email = registerForm.email.trim()
    const password = registerForm.password
    const confirmPassword = registerForm.confirmPassword
    const errors = {}

    if (!fullName) errors.fullName = 'El nombre es obligatorio'
    if (!email) errors.registerEmail = 'El correo es obligatorio'
    if (!registerForm.ticketProfile) errors.ticketProfile = 'Selecciona un perfil para boleteria'
    if (!password) errors.registerPassword = 'La contrasena es obligatoria'
    if (password && password.length < 8) {
      errors.registerPassword = 'La contrasena debe tener minimo 8 caracteres'
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contrasenas no coinciden'
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setMessage({ text: 'Revisa los campos del formulario.', type: 'error' })
      return
    }

    try {
      setIsSubmitting(true)
      setMessage({ text: 'Creando cuenta...', type: 'default' })

      const response = await fetch(buildApiUrl(apiConfig.authApiUrl, '/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          ticketProfile: registerForm.ticketProfile,
          password
        })
      })
      const payload = await parseJsonResponse(response)

      if (!response.ok || !payload?.ok) {
        clearRegisterPasswordFields(setRegisterForm)
        setMessage({
          text: getErrorMessage(payload, 'No fue posible registrar el usuario.'),
          type: 'error'
        })
        return
      }

      persistAuthSession({
        token: payload.token,
        tokenType: payload.tokenType,
        user: payload.user
      })

      setMessage({ text: 'Cuenta creada correctamente.', type: 'success' })
      setRegisterForm(initialRegisterState)
      onClose()
      onAuthenticated?.(payload)
    } catch (_error) {
      clearRegisterPasswordFields(setRegisterForm)
      setMessage({
        text: 'No hay conexion con el servicio de autenticacion.',
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`auth-modal${isOpen ? ' active' : ''}`} id="auth-modal" aria-hidden={!isOpen}>
      <div className="auth-modal-backdrop" onClick={onClose} />
      <div className="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Cerrar">
          <i className="bi bi-x-lg" />
        </button>

        <span className="section-eyebrow eyebrow-gold">Acceso CONIITI</span>
        <h3 className="section-title" id="auth-modal-title" style={{ fontSize: '2.2rem', marginBottom: 20, color: '#fff' }}>
          Bienvenido
        </h3>

        <div className="auth-tabs" role="tablist" aria-label="Acceso">
          <button
            id="auth-tab-login"
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            type="button"
            onClick={() => switchMode('login')}
          >
            Iniciar sesion
          </button>
          <button
            id="auth-tab-register"
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            type="button"
            onClick={() => switchMode('register')}
          >
            Registrarse
          </button>
        </div>

        <p className={`auth-info ${message.type === 'error' ? 'error' : ''} ${message.type === 'success' ? 'success' : ''}`} id="auth-global-message">
          {message.text}
        </p>

        {mode === 'login' ? (
          <form id="auth-login-form" className="auth-form" onSubmit={submitLogin} noValidate>
            <label className="form-label-custom" htmlFor="auth-login-email">Correo electronico</label>
            <input
              className="form-input"
              type="email"
              id="auth-login-email"
              placeholder="correo@ejemplo.com"
              value={loginForm.email}
              onChange={(event) => updateLoginField('email', event.target.value)}
              required
            />
            <p className="auth-error" id="auth-login-email-error">{fieldErrors.email || ''}</p>

            <label className="form-label-custom" htmlFor="auth-login-password" style={{ marginTop: 14 }}>Contrasena</label>
            <input
              className="form-input"
              type="password"
              id="auth-login-password"
              placeholder="Tu contrasena"
              value={loginForm.password}
              onChange={(event) => updateLoginField('password', event.target.value)}
              required
            />
            <p className="auth-error" id="auth-login-password-error">{fieldErrors.password || ''}</p>

            <button type="submit" className="btn-primary" style={{ marginTop: 20, cursor: 'pointer', clipPath: 'none' }} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form id="auth-register-form" className="auth-form" onSubmit={submitRegister} noValidate>
            <label className="form-label-custom" htmlFor="auth-register-name">Nombre completo</label>
            <input
              className="form-input"
              type="text"
              id="auth-register-name"
              placeholder="Tu nombre"
              value={registerForm.fullName}
              onChange={(event) => updateRegisterField('fullName', event.target.value)}
              required
            />
            <p className="auth-error">{fieldErrors.fullName || ''}</p>

            <label className="form-label-custom" htmlFor="auth-register-email" style={{ marginTop: 14 }}>Correo electronico</label>
            <input
              className="form-input"
              type="email"
              id="auth-register-email"
              placeholder="correo@ejemplo.com"
              value={registerForm.email}
              onChange={(event) => updateRegisterField('email', event.target.value)}
              required
            />
            <p className="auth-error">{fieldErrors.registerEmail || ''}</p>

            <label className="form-label-custom" htmlFor="auth-register-ticket-profile" style={{ marginTop: 14 }}>Perfil para boleteria</label>
            <div className="auth-select-wrap">
              <select
                className="form-input auth-select-input"
                id="auth-register-ticket-profile"
                value={registerForm.ticketProfile}
                onChange={(event) => updateRegisterField('ticketProfile', event.target.value)}
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff' }}
                required
              >
                {ticketProfileOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <p className="auth-error">{fieldErrors.ticketProfile || ''}</p>

            <label className="form-label-custom" htmlFor="auth-register-password" style={{ marginTop: 14 }}>Contrasena</label>
            <input
              className="form-input"
              type="password"
              id="auth-register-password"
              placeholder="Minimo 8 caracteres"
              minLength={8}
              value={registerForm.password}
              onChange={(event) => updateRegisterField('password', event.target.value)}
              required
            />
            <p className="auth-error">{fieldErrors.registerPassword || ''}</p>

            <label className="form-label-custom" htmlFor="auth-register-confirm" style={{ marginTop: 14 }}>Confirmar contrasena</label>
            <input
              className="form-input"
              type="password"
              id="auth-register-confirm"
              placeholder="Repite tu contrasena"
              minLength={8}
              value={registerForm.confirmPassword}
              onChange={(event) => updateRegisterField('confirmPassword', event.target.value)}
              required
            />
            <p className="auth-error">{fieldErrors.confirmPassword || ''}</p>

            <button type="submit" className="btn-primary" style={{ marginTop: 20, cursor: 'pointer', clipPath: 'none' }} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
