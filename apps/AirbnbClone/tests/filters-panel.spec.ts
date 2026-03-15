import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

test.describe('Home Page - FiltersPanel', () => {
  test('Filters panel is hidden by default with a visible toggle button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('filters-toggle')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('filters-toggle')).toContainText('Filters')

    // Panel should not be visible
    await expect(page.getByTestId('filters-panel')).not.toBeVisible()
  })

  test('Clicking the Filters button opens the filters panel', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('filters-toggle')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('filters-toggle').click()

    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    // Verify all filter controls are present
    await expect(page.getByTestId('filter-min-price')).toBeVisible()
    await expect(page.getByTestId('filter-max-price')).toBeVisible()
    await expect(page.getByTestId('filter-min-bedrooms')).toBeVisible()
    await expect(page.getByTestId('filter-min-beds')).toBeVisible()
    await expect(page.getByTestId('filter-min-bathrooms')).toBeVisible()

    // Amenity checkboxes should be visible (fetched from API)
    await expect(page.locator('[data-testid^="amenity-checkbox-"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('Clicking the Filters button again closes the filters panel', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('filters-toggle')).toBeVisible({ timeout: 30000 })

    // Open
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    // Close
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).not.toBeVisible()
  })

  test('Price range slider filters properties by price per night', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Open filters panel
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    // Set min=$125, max=$300
    // Seed prices: $120, $150, $200, $275, $450
    // Expected: $150 (Loft), $200 (Cabin), $275 (Townhouse) = 3 properties
    await page.getByTestId('filter-min-price').fill('125')
    await page.getByTestId('filter-max-price').fill('300')
    await page.getByTestId('filters-apply').click()

    await expect(cards).toHaveCount(3, { timeout: 15000 })
  })

  test('Bedrooms minimum filter works correctly', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Open filters
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    // Set bedrooms minimum to 3
    // Seed bedrooms: Loft=1, Villa=4, Cabin=3, Apartment=1, Townhouse=3
    // Expected: Villa (4), Cabin (3), Townhouse (3) = 3 properties
    await page.getByTestId('filter-min-bedrooms').selectOption('3')
    await page.getByTestId('filters-apply').click()

    await expect(cards).toHaveCount(3, { timeout: 15000 })
  })

  test('Beds minimum filter works correctly', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Open filters
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    // Set beds minimum to 3
    // Seed beds: Loft=2, Villa=5, Cabin=4, Apartment=1, Townhouse=3
    // Expected: Villa (5), Cabin (4), Townhouse (3) = 3 properties
    await page.getByTestId('filter-min-beds').selectOption('3')
    await page.getByTestId('filters-apply').click()

    await expect(cards).toHaveCount(3, { timeout: 15000 })
  })

  test('Bathrooms minimum filter works correctly', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Open filters
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    // Set bathrooms minimum to 2
    // Seed bathrooms: Loft=1, Villa=3, Cabin=2, Apartment=1, Townhouse=2
    // Expected: Villa (3), Cabin (2), Townhouse (2) = 3 properties
    await page.getByTestId('filter-min-bathrooms').selectOption('2')
    await page.getByTestId('filters-apply').click()

    await expect(cards).toHaveCount(3, { timeout: 15000 })
  })

  test('Amenity checkboxes filter properties by selected amenities', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Open filters
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid^="amenity-checkbox-"]').first()).toBeVisible({ timeout: 15000 })

    // Check WiFi (c1111111-...) and Pool (c7777777-...)
    // WiFi: all 5 properties have it
    // Pool: Villa and Apartment have it
    // Both WiFi AND Pool: Villa, Apartment = 2 properties
    const wifiCheckbox = page.getByTestId('amenity-checkbox-c1111111-1111-1111-1111-111111111111').locator('input[type="checkbox"]')
    const poolCheckbox = page.getByTestId('amenity-checkbox-c7777777-7777-7777-7777-777777777777').locator('input[type="checkbox"]')

    await wifiCheckbox.check()
    await poolCheckbox.check()
    await page.getByTestId('filters-apply').click()

    await expect(cards).toHaveCount(2, { timeout: 15000 })
  })

  test('Amenity checkboxes are grouped by category', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('filters-toggle')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid^="amenity-checkbox-"]').first()).toBeVisible({ timeout: 15000 })

    // Verify category groups are present: Essentials, Features, Safety, Location
    const panel = page.getByTestId('filters-panel')
    await expect(panel).toContainText('Essentials')
    await expect(panel).toContainText('Features')
    await expect(panel).toContainText('Safety')
    await expect(panel).toContainText('Location')
  })

  test('Multiple filters combine with AND logic', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Open filters
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid^="amenity-checkbox-"]').first()).toBeVisible({ timeout: 15000 })

    // Set price $100-$300, bedrooms >= 2, WiFi checked
    // Price $100-$300: Apartment($120), Loft($150), Cabin($200), Townhouse($275) = 4
    // Bedrooms >= 2: Villa(4), Cabin(3), Townhouse(3) = 3
    // WiFi: all 5
    // Combined (AND): Cabin ($200, 3br, WiFi) and Townhouse ($275, 3br, WiFi) = 2
    await page.getByTestId('filter-min-price').fill('100')
    await page.getByTestId('filter-max-price').fill('300')
    await page.getByTestId('filter-min-bedrooms').selectOption('2')

    const wifiCheckbox = page.getByTestId('amenity-checkbox-c1111111-1111-1111-1111-111111111111').locator('input[type="checkbox"]')
    await wifiCheckbox.check()

    await page.getByTestId('filters-apply').click()

    await expect(cards).toHaveCount(2, { timeout: 15000 })
  })

  test('Filters combine with search bar and category filter', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Search for Asheville (Cabin is in Asheville)
    await page.getByTestId('search-location').fill('Asheville')
    await page.getByTestId('search-button').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Select Cabin category
    await page.getByTestId('category-chip-Cabin').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Open filters and set bedrooms >= 2
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('filter-min-bedrooms').selectOption('2')
    await page.getByTestId('filters-apply').click()

    // Cabin in Asheville with 3 bedrooms matches all 3 criteria
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Now set bedrooms >= 5 — the Cabin only has 3, so no results
    // Panel stays open after applying, so just change the value directly
    await page.getByTestId('filter-min-bedrooms').selectOption('5')
    await page.getByTestId('filters-apply').click()

    await expect(page.getByTestId('property-grid-empty')).toBeVisible({ timeout: 15000 })
  })

  test('Resetting filters shows all properties', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Capture initial unfiltered count
    const initialCount = await cards.count()

    // Open filters and apply restrictive filter
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('filter-min-bedrooms').selectOption('4')
    await page.getByTestId('filters-apply').click()

    // Only Villa has 4 bedrooms
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Reset filters (panel stays open after apply since isOpen is local state)
    await page.getByTestId('filters-reset').click()

    // All properties should show again
    await expect(cards).toHaveCount(initialCount, { timeout: 15000 })

    // Verify controls are reset to defaults (panel is still open)
    await expect(page.getByTestId('filter-min-price')).toHaveValue('')
    await expect(page.getByTestId('filter-max-price')).toHaveValue('')
    await expect(page.getByTestId('filter-min-bedrooms')).toHaveValue('0')
    await expect(page.getByTestId('filter-min-beds')).toHaveValue('0')
    await expect(page.getByTestId('filter-min-bathrooms')).toHaveValue('0')
  })

  test('Filters panel controls are functional on repeated use', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Capture initial unfiltered count
    const initialCount = await cards.count()

    // First filter: bedrooms >= 3
    // Villa(4), Cabin(3), Townhouse(3) = 3 from seed
    await page.getByTestId('filters-toggle').click()
    await expect(page.getByTestId('filters-panel')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('filter-min-bedrooms').selectOption('3')
    await page.getByTestId('filters-apply').click()
    await expect(async () => {
      const count = await cards.count()
      expect(count).toBeGreaterThanOrEqual(3)
      expect(count).toBeLessThan(initialCount)
    }).toPass({ timeout: 15000 })

    // Second filter: change to bathrooms >= 3 (panel still open after apply)
    // Only Villa has 3 bathrooms from seed
    await page.getByTestId('filter-min-bedrooms').selectOption('0')
    await page.getByTestId('filter-min-bathrooms').selectOption('3')
    await page.getByTestId('filters-apply').click()
    await expect(async () => {
      const count = await cards.count()
      expect(count).toBeGreaterThanOrEqual(1)
      expect(count).toBeLessThan(initialCount)
    }).toPass({ timeout: 15000 })

    // Reset and verify all properties return (panel still open)
    await page.getByTestId('filters-reset').click()
    await expect(cards).toHaveCount(initialCount, { timeout: 15000 })

    // Third filter: price range (panel still open after reset)
    await page.getByTestId('filter-min-price').fill('200')
    await page.getByTestId('filter-max-price').fill('300')
    await page.getByTestId('filters-apply').click()
    await expect(async () => {
      const count = await cards.count()
      expect(count).toBeGreaterThanOrEqual(2)
      expect(count).toBeLessThan(initialCount)
    }).toPass({ timeout: 15000 })
  })
})
