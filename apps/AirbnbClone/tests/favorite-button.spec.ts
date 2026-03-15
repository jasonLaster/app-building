import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// Helper to log in as a user
async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

const EMMA_ID = 'a3333333-3333-3333-3333-333333333333'

// Properties that should be in Emma's favorites (seed state)
const EMMA_FAVORITED = [
  'b2222222-2222-2222-2222-222222222222',
  'b3333333-3333-3333-3333-333333333333',
]

// Properties used in tests that should NOT be in Emma's favorites (seed state)
const EMMA_NOT_FAVORITED = [
  'b1111111-1111-1111-1111-111111111111',
  'b4444444-4444-4444-4444-444444444444',
  'b5555555-5555-5555-5555-555555555555',
]

test.describe('Home Page - FavoriteButton', () => {
  // Reset Emma's favorites to seed state before each test
  test.beforeEach(async ({ request }) => {
    for (const propertyId of EMMA_FAVORITED) {
      await request.post('/api/favorites', {
        data: { user_id: EMMA_ID, property_id: propertyId },
      })
    }
    for (const propertyId of EMMA_NOT_FAVORITED) {
      await request.delete(`/api/favorites/${propertyId}?user_id=${EMMA_ID}`)
    }
  })

  test('Favorite button shows outline heart when property is not favorited', async ({ page }) => {
    // Log in as Emma (favorites: b2222222, b3333333 — NOT b1111111)
    await loginAs(page, 'emma@example.com')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // b1111111 is NOT in Emma's favorites
    const favBtn = page.getByTestId('favorite-button-b1111111-1111-1111-1111-111111111111')
    await expect(favBtn).toBeVisible({ timeout: 15000 })

    // Heart should not have the filled class (fill-primary)
    const heart = favBtn.locator('svg')
    await expect(heart).not.toHaveClass(/fill-primary/)
    await expect(heart).toHaveClass(/text-text-secondary/)
  })

  test('Clicking favorite button on unfavorited property adds it to favorites', async ({ page }) => {
    // Log in as Emma (favorites: b2222222, b3333333 — NOT b4444444)
    await loginAs(page, 'emma@example.com')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // b4444444 is NOT in Emma's favorites
    const favBtn = page.getByTestId('favorite-button-b4444444-4444-4444-4444-444444444444')
    await expect(favBtn).toBeVisible({ timeout: 15000 })

    // Verify it's not favorited initially
    const heart = favBtn.locator('svg')
    await expect(heart).toHaveClass(/text-text-secondary/, { timeout: 15000 })

    // Click to favorite
    await favBtn.click()

    // Heart should become filled
    await expect(heart).toHaveClass(/fill-primary/, { timeout: 15000 })
  })

  test('Clicking favorite button on favorited property removes it from favorites', async ({ page }) => {
    // Log in as Emma (favorites: b2222222, b3333333)
    await loginAs(page, 'emma@example.com')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // b2222222 IS in Emma's favorites
    const favBtn = page.getByTestId('favorite-button-b2222222-2222-2222-2222-222222222222')
    await expect(favBtn).toBeVisible({ timeout: 15000 })

    // Verify it's favorited initially (filled heart)
    const heart = favBtn.locator('svg')
    await expect(heart).toHaveClass(/fill-primary/, { timeout: 15000 })

    // Click to unfavorite
    await favBtn.click()

    // Heart should return to outline
    await expect(heart).toHaveClass(/text-text-secondary/, { timeout: 15000 })
  })

  test('Favorite button does not navigate to property detail page', async ({ page }) => {
    await loginAs(page, 'emma@example.com')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    const favBtn = page.getByTestId('favorite-button-b1111111-1111-1111-1111-111111111111')
    await expect(favBtn).toBeVisible({ timeout: 15000 })

    // Click the favorite button
    await favBtn.click()

    // Should remain on the home page, not navigate to property detail
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })

  test('Favorite button is not shown when user is not logged in', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // Favorite buttons should not be visible when logged out
    await expect(
      page.locator('[data-testid^="favorite-button-"]')
    ).toHaveCount(0)
  })

  test('Favorite button reflects correct state on page load', async ({ page }) => {
    // Log in as Emma (favorites: b2222222, b3333333)
    await loginAs(page, 'emma@example.com')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // b2222222 (Beachfront Villa) should be favorited (filled heart)
    const favBtnVilla = page.getByTestId('favorite-button-b2222222-2222-2222-2222-222222222222')
    await expect(favBtnVilla).toBeVisible({ timeout: 15000 })
    const heartVilla = favBtnVilla.locator('svg')
    await expect(heartVilla).toHaveClass(/fill-primary/, { timeout: 15000 })

    // b3333333 (Mountain Cabin) should be favorited (filled heart)
    const favBtnCabin = page.getByTestId('favorite-button-b3333333-3333-3333-3333-333333333333')
    await expect(favBtnCabin).toBeVisible({ timeout: 15000 })
    const heartCabin = favBtnCabin.locator('svg')
    await expect(heartCabin).toHaveClass(/fill-primary/, { timeout: 15000 })

    // b1111111 (Cozy Downtown Loft) should NOT be favorited (outline heart)
    const favBtnLoft = page.getByTestId('favorite-button-b1111111-1111-1111-1111-111111111111')
    await expect(favBtnLoft).toBeVisible({ timeout: 15000 })
    const heartLoft = favBtnLoft.locator('svg')
    await expect(heartLoft).not.toHaveClass(/fill-primary/)
    await expect(heartLoft).toHaveClass(/text-text-secondary/)
  })

  test('Favorite button is functional on repeated use', async ({ page }) => {
    test.slow()
    await loginAs(page, 'emma@example.com')

    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // Use b5555555 (Historic Townhouse) which is NOT in Emma's favorites
    const favBtn = page.getByTestId('favorite-button-b5555555-5555-5555-5555-555555555555')
    await expect(favBtn).toBeVisible({ timeout: 15000 })
    const heart = favBtn.locator('svg')

    // Verify initial state - not favorited
    await expect(heart).toHaveClass(/text-text-secondary/, { timeout: 15000 })

    // Click 1: favorite it
    await favBtn.click()
    await expect(heart).toHaveClass(/fill-primary/, { timeout: 15000 })

    // Click 2: unfavorite it
    await favBtn.click()
    await expect(heart).toHaveClass(/text-text-secondary/, { timeout: 15000 })

    // Click 3: favorite it again
    await favBtn.click()
    await expect(heart).toHaveClass(/fill-primary/, { timeout: 15000 })
  })
})
