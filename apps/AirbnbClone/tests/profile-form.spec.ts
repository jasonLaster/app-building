import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

const EMMA_ID = 'a3333333-3333-3333-3333-333333333333'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

async function resetEmmaProfile(page: import('@playwright/test').Page) {
  await page.request.put(`/api/users/${EMMA_ID}`, {
    data: {
      name: 'Emma Wilson',
      bio: 'Frequent traveler who loves finding unique places to stay.',
      phone: '+1-555-0103',
      avatar_url: 'https://i.pravatar.cc/150?u=emma',
    },
  })
}

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('Profile Page - ProfileForm', () => {
  test.beforeEach(async ({ page }) => {
    await resetEmmaProfile(page)
  })

  test('Profile page requires login', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login/, { timeout: 30000 })
    await expect(page.getByTestId('profile-page')).not.toBeVisible()
  })

  test('Profile page displays current user info', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-name-input')).toHaveValue('Emma Wilson')
    await expect(page.getByTestId('profile-email-input')).toHaveValue('emma@example.com')
    await expect(page.getByTestId('profile-bio-input')).toHaveValue('Frequent traveler who loves finding unique places to stay.')
    await expect(page.getByTestId('profile-phone-input')).toHaveValue('+1-555-0103')
    await expect(page.getByTestId('profile-avatar-input')).toHaveValue('https://i.pravatar.cc/150?u=emma')
    await expect(page.getByTestId('avatar-preview')).toBeVisible()
  })

  test('Edit name field inline', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-name-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-name-input').fill('Alice Johnson')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-success-message')).toContainText('Profile updated')
    await expect(page.getByTestId('profile-name-input')).toHaveValue('Alice Johnson')
  })

  test('Edit bio field inline', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-bio-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-bio-input').fill('Digital nomad and foodie')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-bio-input')).toHaveValue('Digital nomad and foodie')
  })

  test('Edit phone field inline', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-phone-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-phone-input').fill('555-9876')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-phone-input')).toHaveValue('555-9876')
  })

  test('Edit avatar URL field inline', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-avatar-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-avatar-input').fill('https://example.com/new-avatar.jpg')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-avatar-input')).toHaveValue('https://example.com/new-avatar.jpg')
    await expect(page.getByTestId('avatar-preview')).toHaveAttribute('src', 'https://example.com/new-avatar.jpg')
  })

  test('Save with empty name shows validation error', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-name-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-name-input').fill('')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('name-error')).toBeVisible()
    await expect(page.getByTestId('name-error')).toContainText('Name is required')
  })

  test('Save with invalid avatar URL shows validation error', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-avatar-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-avatar-input').fill('not-a-url')
    await page.getByTestId('profile-save-button').click()

    await expect(page.getByTestId('avatar-url-error')).toBeVisible()
    await expect(page.getByTestId('avatar-url-error')).toContainText('Please enter a valid URL')
  })

  test('Profile form fields are functional on repeated edits', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-name-input')).toBeVisible({ timeout: 30000 })

    // First edit
    await page.getByTestId('profile-name-input').fill('Alice Johnson')
    await page.getByTestId('profile-save-button').click()
    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-name-input')).toHaveValue('Alice Johnson')

    // Second edit
    await page.getByTestId('profile-name-input').fill('Alice Williams')
    await page.getByTestId('profile-save-button').click()
    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-name-input')).toHaveValue('Alice Williams')
  })

  test('Email field is displayed but not editable', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-email-input')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('profile-email-input')).toHaveValue('emma@example.com')
    await expect(page.getByTestId('profile-email-input')).toBeDisabled()
  })

  test('Profile update persists across navigation', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-bio-input')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('profile-bio-input').fill('New bio')
    await page.getByTestId('profile-save-button').click()
    await expect(page.getByTestId('profile-success-message')).toBeVisible({ timeout: 30000 })

    // Navigate to home
    await page.goto('/')
    await expect(page).toHaveURL('/', { timeout: 30000 })

    // Navigate back to profile
    await page.goto('/profile')
    await expect(page.getByTestId('profile-bio-input')).toHaveValue('New bio', { timeout: 30000 })
  })
})
