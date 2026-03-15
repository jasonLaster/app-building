import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

test.describe('Home Page - PropertyGrid', () => {
  test('Property grid displays properties in a responsive grid layout', async ({ page }) => {
    await page.goto('/')

    // Wait for properties to load
    const grid = page.getByTestId('property-grid')
    await expect(grid).toBeVisible({ timeout: 30000 })

    // Verify grid contains property cards
    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards.first()).toBeVisible({ timeout: 15000 })

    // Verify the grid has responsive CSS classes
    await expect(grid).toHaveClass(/grid/)
    await expect(grid).toHaveClass(/grid-cols-1/)
    await expect(grid).toHaveClass(/sm:grid-cols-2/)
    await expect(grid).toHaveClass(/lg:grid-cols-3/)
    await expect(grid).toHaveClass(/xl:grid-cols-4/)
  })

  test('Property grid shows message when no properties match filters', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    // Search for a non-existent location
    await page.getByTestId('search-location').fill('Atlantis')
    await page.getByTestId('search-button').click()

    // Verify empty state message appears
    const emptyState = page.getByTestId('property-grid-empty')
    await expect(emptyState).toBeVisible({ timeout: 15000 })
    await expect(emptyState).toContainText('No properties found')
    await expect(emptyState).toContainText('Try adjusting your filters or search criteria')
  })

  test('Property grid loads and displays properties from API on initial page load', async ({ page }) => {
    await page.goto('/')

    // Verify loading indicator appears initially (may be brief)
    // Then verify properties load
    const grid = page.getByTestId('property-grid')
    await expect(grid).toBeVisible({ timeout: 30000 })

    // Verify property cards are present with data from seed
    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards.first()).toBeVisible({ timeout: 15000 })

    // Verify at least one property card has expected content from seed data
    await expect(grid).toContainText('Cozy Downtown Loft')
    await expect(grid).toContainText('New York')
  })
})

test.describe('Home Page - PropertyCard', () => {
  test('Property card displays all required information', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })

    // Use the Cozy Downtown Loft (b1111111...) which has 1 review with rating 5
    const loftCard = page.getByTestId('property-card-b1111111-1111-1111-1111-111111111111')
    await expect(loftCard).toBeVisible({ timeout: 15000 })

    // Verify title
    await expect(loftCard).toContainText('Cozy Downtown Loft')

    // Verify location
    await expect(loftCard).toContainText('New York')
    await expect(loftCard).toContainText('United States')

    // Verify price
    await expect(loftCard).toContainText('$150')
    await expect(loftCard).toContainText('/ night')

    // Verify property type badge
    const badge = page.getByTestId('property-type-badge-b1111111-1111-1111-1111-111111111111')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('Loft')

    // Verify rating display (has 1 review with rating 5)
    await expect(loftCard).toContainText('5.0')
    await expect(loftCard).toContainText('(1)')
  })

  test('Property card shows property image', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })

    // Property with image (Cozy Downtown Loft)
    const loftCard = page.getByTestId('property-card-b1111111-1111-1111-1111-111111111111')
    await expect(loftCard).toBeVisible({ timeout: 15000 })

    // Verify the card has an img element
    const img = loftCard.locator('img')
    await expect(img).toBeVisible()
    await expect(img).toHaveAttribute('src', /picsum\.photos/)
  })

  test('Clicking a property card navigates to property detail page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })

    const propertyId = 'b1111111-1111-1111-1111-111111111111'
    const card = page.getByTestId(`property-card-${propertyId}`)
    await expect(card).toBeVisible({ timeout: 15000 })

    await card.click()

    await expect(page).toHaveURL(`/properties/${propertyId}`, { timeout: 30000 })
  })

  test('Property card displays property type badge', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // Verify different property type badges
    const loftBadge = page.getByTestId('property-type-badge-b1111111-1111-1111-1111-111111111111')
    await expect(loftBadge).toBeVisible()
    await expect(loftBadge).toHaveText('Loft')

    const villaBadge = page.getByTestId('property-type-badge-b2222222-2222-2222-2222-222222222222')
    await expect(villaBadge).toBeVisible()
    await expect(villaBadge).toHaveText('Villa')

    const cabinBadge = page.getByTestId('property-type-badge-b3333333-3333-3333-3333-333333333333')
    await expect(cabinBadge).toBeVisible()
    await expect(cabinBadge).toHaveText('Cabin')
  })

  test('Property card displays average rating with review count', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })

    // Cozy Downtown Loft has 1 review with rating 5
    const loftCard = page.getByTestId('property-card-b1111111-1111-1111-1111-111111111111')
    await expect(loftCard).toContainText('5.0')
    await expect(loftCard).toContainText('(1)')

    // Modern Austin Apartment has 1 review with rating 4
    const austinCard = page.getByTestId('property-card-b4444444-4444-4444-4444-444444444444')
    await expect(austinCard).toContainText('4.0')
    await expect(austinCard).toContainText('(1)')

    // Beachfront Villa has no reviews - should show "New"
    const villaCard = page.getByTestId('property-card-b2222222-2222-2222-2222-222222222222')
    await expect(villaCard).toContainText('New')
  })
})
