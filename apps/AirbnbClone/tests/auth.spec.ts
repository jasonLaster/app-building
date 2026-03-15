import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

test.describe('Auth Page', () => {
  test.beforeEach(async ({ request }) => {
    // Delete all non-seed users created by registration tests
    await request.delete('http://localhost:8888/api/auth')
  })

  test.describe('AuthToggle', () => {
    test('Auth page defaults to login mode', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByTestId('login-page')).toBeVisible()
      await expect(page.getByTestId('login-form')).toBeVisible()
      await expect(page.getByTestId('login-email-input')).toBeVisible()
      await expect(page.getByTestId('login-submit-button')).toHaveText('Log In')
      await expect(page.getByTestId('auth-toggle-link')).toHaveText('Register')
      await expect(page.getByTestId('auth-toggle')).toContainText("Don't have an account?")
    })

    test('Toggle from login to register mode', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('auth-toggle-link').click()

      await expect(page.getByTestId('register-form')).toBeVisible()
      await expect(page.getByTestId('register-name-input')).toBeVisible()
      await expect(page.getByTestId('register-email-input')).toBeVisible()
      await expect(page.getByTestId('register-submit-button')).toHaveText('Register')
      await expect(page.getByTestId('auth-toggle-link')).toHaveText('Log In')
      await expect(page.getByTestId('auth-toggle')).toContainText('Already have an account?')
    })

    test('Toggle from register back to login mode', async ({ page }) => {
      await page.goto('/login')

      // First toggle to register
      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      // Toggle back to login
      await page.getByTestId('auth-toggle-link').click()

      await expect(page.getByTestId('login-form')).toBeVisible()
      await expect(page.getByTestId('login-email-input')).toBeVisible()
      await expect(page.getByTestId('login-submit-button')).toHaveText('Log In')
    })

    test('Toggle preserves no stale input between modes', async ({ page }) => {
      await page.goto('/login')

      // Type in login email field
      await page.getByTestId('login-email-input').fill('test@example.com')
      await expect(page.getByTestId('login-email-input')).toHaveValue('test@example.com')

      // Toggle to register
      await page.getByTestId('auth-toggle-link').click()

      // Register form fields should be empty
      await expect(page.getByTestId('register-name-input')).toHaveValue('')
      await expect(page.getByTestId('register-email-input')).toHaveValue('')
    })
  })

  test.describe('LoginForm', () => {
    test('Login with valid email redirects to home', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('login-email-input').fill('emma@example.com')
      await page.getByTestId('login-submit-button').click()

      await expect(page).toHaveURL('/', { timeout: 30000 })
    })

    test('Login with empty email shows validation error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('login-submit-button').click()

      await expect(page.getByTestId('login-error')).toBeVisible()
      await expect(page.getByTestId('login-error')).toContainText('Email is required')
    })

    test('Login with invalid email format shows validation error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('login-email-input').fill('not-an-email')
      await page.getByTestId('login-submit-button').click()

      await expect(page.getByTestId('login-error')).toBeVisible()
      await expect(page.getByTestId('login-error')).toContainText('Please enter a valid email address')
    })

    test('Login with non-existent email shows error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('login-email-input').fill('unknown@example.com')
      await page.getByTestId('login-submit-button').click()

      await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 30000 })
      await expect(page.getByTestId('login-error')).toContainText('No account found with this email')
      await expect(page).toHaveURL(/\/login/)
    })

    test('Login form email input is functional on repeated use', async ({ page }) => {
      test.slow()
      await page.goto('/login')

      // First attempt with non-existent email
      await page.getByTestId('login-email-input').fill('wrong@example.com')
      await page.getByTestId('login-submit-button').click()

      await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 30000 })

      // Clear and try with valid email
      await page.getByTestId('login-email-input').fill('')
      await page.getByTestId('login-email-input').fill('emma@example.com')
      await page.getByTestId('login-submit-button').click()

      await expect(page).toHaveURL('/', { timeout: 30000 })
    })
  })

  test.describe('RegisterForm', () => {
    test('Register with valid name and email creates account and redirects to home', async ({ page }) => {
      const uniqueEmail = `newuser-${Date.now()}@example.com`
      await page.goto('/login')

      // Switch to register mode
      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      await page.getByTestId('register-name-input').fill('New User')
      await page.getByTestId('register-email-input').fill(uniqueEmail)
      await page.getByTestId('register-submit-button').click()

      await expect(page).toHaveURL('/', { timeout: 30000 })
    })

    test('Register with empty name shows validation error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      await page.getByTestId('register-email-input').fill('newuser@example.com')
      await page.getByTestId('register-submit-button').click()

      await expect(page.getByTestId('register-error')).toBeVisible()
      await expect(page.getByTestId('register-error')).toContainText('Name is required')
    })

    test('Register with empty email shows validation error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      await page.getByTestId('register-name-input').fill('New User')
      await page.getByTestId('register-submit-button').click()

      await expect(page.getByTestId('register-error')).toBeVisible()
      await expect(page.getByTestId('register-error')).toContainText('Email is required')
    })

    test('Register with invalid email format shows validation error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      await page.getByTestId('register-name-input').fill('New User')
      await page.getByTestId('register-email-input').fill('bad-email')
      await page.getByTestId('register-submit-button').click()

      await expect(page.getByTestId('register-error')).toBeVisible()
      await expect(page.getByTestId('register-error')).toContainText('Please enter a valid email address')
    })

    test('Register with already-existing email shows error', async ({ page }) => {
      await page.goto('/login')

      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      await page.getByTestId('register-name-input').fill('Some Name')
      await page.getByTestId('register-email-input').fill('sarah@example.com')
      await page.getByTestId('register-submit-button').click()

      await expect(page.getByTestId('register-error')).toBeVisible({ timeout: 30000 })
      await expect(page.getByTestId('register-error')).toContainText('An account with this email already exists')
      await expect(page.getByTestId('register-form')).toBeVisible()
    })

    test('Register form fields are functional on repeated use', async ({ page }) => {
      test.slow()
      const uniqueEmail = `newuser-${Date.now()}@example.com`
      await page.goto('/login')

      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      // First attempt with existing email
      await page.getByTestId('register-name-input').fill('Some Name')
      await page.getByTestId('register-email-input').fill('sarah@example.com')
      await page.getByTestId('register-submit-button').click()

      await expect(page.getByTestId('register-error')).toBeVisible({ timeout: 30000 })

      // Change email to unique one and retry
      await page.getByTestId('register-email-input').fill('')
      await page.getByTestId('register-email-input').fill(uniqueEmail)
      await page.getByTestId('register-submit-button').click()

      await expect(page).toHaveURL('/', { timeout: 30000 })
    })
  })

  test.describe('E2E Auth Flow', () => {
    test('Complete signup, signout, and signin flow', async ({ page }) => {
      test.slow()
      const uniqueEmail = `e2e-user-${Date.now()}@example.com`
      const userName = `E2E User ${Date.now()}`

      // Step 1: Sign up
      await page.goto('/login')
      await page.getByTestId('auth-toggle-link').click()
      await expect(page.getByTestId('register-form')).toBeVisible()

      await page.getByTestId('register-name-input').fill(userName)
      await page.getByTestId('register-email-input').fill(uniqueEmail)
      await page.getByTestId('register-submit-button').click()

      // Verify post-signup state: redirected to home
      await expect(page).toHaveURL('/', { timeout: 30000 })

      // Step 2: Sign out
      await page.getByTestId('sidebar-toggle').click()
      await page.getByTestId('sidebar-logout').click()

      // Verify signed out: login link visible in header
      await expect(page.locator('a[href="/login"]')).toBeVisible({ timeout: 30000 })

      // Step 3: Sign in with the new credentials
      await page.goto('/login')
      await expect(page.getByTestId('login-form')).toBeVisible()
      await page.getByTestId('login-email-input').fill(uniqueEmail)
      await page.getByTestId('login-submit-button').click()

      // Verify authenticated state: redirected to home
      await expect(page).toHaveURL('/', { timeout: 30000 })
    })
  })
})
