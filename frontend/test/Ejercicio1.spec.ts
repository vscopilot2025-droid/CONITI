import { test, expect } from '@playwright/test'

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'

test('formulario de login: validación de campos requeridos', async ({ page }) => {
  await page.goto(baseUrl)

  await page.getByRole('link', { name: 'Inscríbete' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByText('El correo es obligatorio')).toBeVisible()
  await expect(page.getByText('La contraseña es obligatoria')).toBeVisible()
})

test('formulario de login: credenciales válidas', async ({ page }) => {
  await page.goto(baseUrl)

  await page.getByRole('link', { name: 'Inscríbete' }).click()
  await page.fill('#auth-login-email', 'usuario@test.com')
  await page.fill('#auth-login-password', '123456')
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('heading', { name: 'Boletas de Acceso' })).toBeVisible()
})
