import { test, expect } from '@playwright/test'

test.describe('Home Page - SearchBar', () => {
  test('Search bar displays all input fields on load', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('search-bar')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('search-location')).toBeVisible()
    await expect(page.getByTestId('search-location')).toHaveAttribute('placeholder', 'Where are you going?')
    await expect(page.getByTestId('search-checkin')).toBeVisible()
    await expect(page.getByTestId('search-checkin')).toHaveAttribute('type', 'date')
    await expect(page.getByTestId('search-checkout')).toBeVisible()
    await expect(page.getByTestId('search-checkout')).toHaveAttribute('type', 'date')
    await expect(page.getByTestId('search-guests')).toBeVisible()
    await expect(page.getByTestId('search-button')).toBeVisible()
  })

  test('Search by location filters property results', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    await page.getByTestId('search-location').fill('New York')
    await page.getByTestId('search-button').click()

    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('property-grid')).toContainText('New York')
  })

  test('Search by check-in and check-out dates filters results', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    await page.getByTestId('search-checkin').fill('2026-04-01')
    await page.getByTestId('search-checkout').fill('2026-04-05')
    await page.getByTestId('search-button').click()

    // Miami Villa has a confirmed booking Apr 1-7, so it should be excluded (4 of 5 remain)
    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards).toHaveCount(4, { timeout: 15000 })
  })

  test('Search by guest count filters results', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    await page.getByTestId('search-guests').fill('5')
    await page.getByTestId('search-button').click()

    // Properties with max_guests >= 5: Cabin (6), Villa (8), Townhouse (6) = 3
    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards).toHaveCount(3, { timeout: 15000 })
  })

  test('Combined search with all fields filters results', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    await page.getByTestId('search-location').fill('New York')
    await page.getByTestId('search-checkin').fill('2026-05-10')
    await page.getByTestId('search-checkout').fill('2026-05-15')
    await page.getByTestId('search-guests').fill('3')
    await page.getByTestId('search-button').click()

    // Only NY Loft matches: in New York, max_guests 4 >= 3, no conflicting bookings
    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('property-grid')).toContainText('New York')
  })

  test('Clearing search fields and re-searching shows all results', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Search by location
    await page.getByTestId('search-location').fill('New York')
    await page.getByTestId('search-button').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Clear and re-search
    await page.getByTestId('search-location').fill('')
    await page.getByTestId('search-button').click()
    await expect(cards).toHaveCount(5, { timeout: 15000 })
  })

  test('Search bar is functional on repeated use', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // First search: New York
    await page.getByTestId('search-location').fill('New York')
    await page.getByTestId('search-button').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('property-grid')).toContainText('New York')

    // Second search: Austin
    await page.getByTestId('search-location').fill('')
    await page.getByTestId('search-location').fill('Austin')
    await page.getByTestId('search-button').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('property-grid')).toContainText('Austin')
    await expect(page.getByTestId('search-location')).toHaveValue('Austin')
  })

  test('Check-in date picker prevents selecting past dates', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-bar')).toBeVisible({ timeout: 30000 })

    const today = new Date().toISOString().split('T')[0]
    await expect(page.getByTestId('search-checkin')).toHaveAttribute('min', today)
  })

  test('Check-out date must be after check-in date', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-bar')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('search-checkin').fill('2026-04-10')

    // Checkout min should be the day after check-in
    await expect(page.getByTestId('search-checkout')).toHaveAttribute('min', '2026-04-11')
  })

  test('Guest count selector enforces minimum of 1', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-bar')).toBeVisible({ timeout: 30000 })

    await expect(page.getByTestId('search-guests')).toHaveAttribute('min', '1')

    // Attempt to set guests to 0 - should be corrected to 1
    await page.getByTestId('search-guests').fill('0')
    await expect(page.getByTestId('search-guests')).toHaveValue('1')
  })
})
