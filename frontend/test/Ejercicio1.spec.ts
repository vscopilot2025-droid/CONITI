import { test, expect } from '@playwright/test'

test('formulario de login: validación de campos requeridos', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Inscríbete' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByText('El correo es obligatorio')).toBeVisible()
  await expect(page.getByText('La contraseña es obligatoria')).toBeVisible()
})

test('formulario de login: credenciales válidas', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
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

  await expect(page.getByRole('heading', { name: 'Boletas de Acceso' })).toBeVisible()
})
