import { test, expect } from '@playwright/test'

test('formulario de login: validación de campos requeridos', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Inscríbete' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByText('El correo es obligatorio')).toBeVisible()
  await expect(page.getByText('La contrasena es obligatoria')).toBeVisible()
})

test('formulario de login: credenciales válidas', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Inicio de sesión exitoso.',
        user: { id: 1, email: 'usuario@test.com', fullName: 'Usuario Test' }
      })
    })
  })

  await page.goto('/')

  await page.getByRole('link', { name: 'Inscríbete' }).click()
  await page.fill('#auth-login-email', 'usuario@test.com')
  await page.fill('#auth-login-password', '123456')
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Boletería' })).toBeVisible()
})

test('formulario de registro: crea cuenta y navega a boletería', async ({ page }) => {
  await page.route('**/auth/register', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Usuario registrado correctamente',
        token: 'token-demo',
        tokenType: 'Bearer',
        user: { id: 3, email: 'nuevo@test.com', fullName: 'Usuario Nuevo', ticketProfile: 'visitor' }
      })
    })
  })

  await page.goto('/')

  await page.getByRole('link', { name: 'Inscríbete' }).click()
  await page.getByRole('button', { name: 'Registrarse' }).click()
  await page.fill('#auth-register-name', 'Usuario Nuevo')
  await page.fill('#auth-register-email', 'nuevo@test.com')
  await page.selectOption('#auth-register-ticket-profile', 'visitor')
  await page.fill('#auth-register-password', 'Segura123')
  await page.fill('#auth-register-confirm', 'Segura123')
  await page.locator('#auth-register-form').evaluate((form) => form.requestSubmit())

  await expect(page.getByRole('heading', { name: 'Boletería' })).toBeVisible()
})

test('navegación principal: abre módulos nuevos y desplegable', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Conferencias', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Conferencias' })).toBeVisible()

  await page.getByRole('link', { name: 'Cronograma', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Cronograma 2026' })).toBeVisible()

  await page.getByRole('link', { name: 'Conferencistas', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Conferencistas' })).toBeVisible()

  await page.getByRole('link', { name: 'Nosotros', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Nosotros' })).toBeVisible()

  await page.getByRole('button', { name: /Más sobre nosotros/ }).click()
  await page.getByRole('link', { name: 'Comité' }).click()
  await expect(page.getByRole('heading', { name: 'Comité' })).toBeVisible()

  await page.getByRole('button', { name: /Más sobre nosotros/ }).click()
  await page.getByRole('link', { name: 'Guía de participación' }).click()
  await expect(page.getByRole('heading', { name: 'Guía de participación' })).toBeVisible()

  await page.getByRole('button', { name: /Más sobre nosotros/ }).click()
  await page.getByRole('link', { name: 'Líneas temáticas', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Líneas Temáticas', exact: true })).toBeVisible()
  await page.getByText('Engineering Education').click()
  await expect(page.getByText('Problem-Based Learning')).toBeVisible()
})
