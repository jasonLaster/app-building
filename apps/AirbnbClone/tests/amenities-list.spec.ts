import { test, expect } from '@playwright/test'

// b2222222: Villa, Miami, 18 amenities across all 4 categories (Essentials, Features, Safety, Location)
const PROPERTY_MANY_AMENITIES = 'b2222222-2222-2222-2222-222222222222'
// b4444444: Apartment, Austin, 6 amenities in Essentials + Features + Safety (no Location category)
const PROPERTY_FEW_AMENITIES = 'b4444444-4444-4444-4444-444444444444'

test.describe('Property Detail - AmenitiesList', () => {
  test('Amenities list displays amenities grouped by category with icons', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_MANY_AMENITIES}`)

    const amenitiesList = page.getByTestId('amenities-list')
    await expect(amenitiesList).toBeVisible({ timeout: 30000 })

    // Should display category headings - Villa has amenities in all 4 categories
    await expect(amenitiesList).toContainText('Essentials')
    await expect(amenitiesList).toContainText('Features')
    await expect(amenitiesList).toContainText('Safety')
    await expect(amenitiesList).toContainText('Location')

    // Each amenity should be displayed with name and icon (within initial 10)
    // Check a few specific amenities that should be visible initially
    await expect(amenitiesList).toContainText('WiFi')
    await expect(amenitiesList).toContainText('Kitchen')
    await expect(amenitiesList).toContainText('Pool')

    // Each amenity item should have an icon (svg element) and name
    const firstAmenity = amenitiesList.locator('[data-testid^="amenity-"]').first()
    await expect(firstAmenity).toBeVisible()
    await expect(firstAmenity.locator('svg')).toBeVisible()
  })

  test('Amenities list only shows categories that have amenities', async ({ page }) => {
    // b4444444 has amenities in Essentials (WiFi, Kitchen, Air conditioning),
    // Features (Gym, Pool), and Safety (Smoke alarm) — no Location category
    await page.goto(`/properties/${PROPERTY_FEW_AMENITIES}`)

    const amenitiesList = page.getByTestId('amenities-list')
    await expect(amenitiesList).toBeVisible({ timeout: 30000 })

    // Should show categories that have amenities
    await expect(amenitiesList).toContainText('Essentials')
    await expect(amenitiesList).toContainText('Features')
    await expect(amenitiesList).toContainText('Safety')

    // Should NOT show Location category (no location amenities for this property)
    await expect(amenitiesList.locator('h3').filter({ hasText: /^Location$/ })).toHaveCount(0)
  })

  test('Amenities list shows "Show all amenities" when there are many amenities', async ({ page }) => {
    // b2222222 has 18 amenities (> 10 threshold)
    await page.goto(`/properties/${PROPERTY_MANY_AMENITIES}`)

    const amenitiesList = page.getByTestId('amenities-list')
    await expect(amenitiesList).toBeVisible({ timeout: 30000 })

    // Should show "Show all 18 amenities" button
    const toggle = page.getByTestId('amenities-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveText('Show all 18 amenities')

    // Only initial 10 amenities should be displayed
    const visibleAmenities = amenitiesList.locator('[data-testid^="amenity-"]')
    await expect(visibleAmenities).toHaveCount(10)
  })

  test('Clicking "Show all amenities" reveals the complete list', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_MANY_AMENITIES}`)

    const amenitiesList = page.getByTestId('amenities-list')
    await expect(amenitiesList).toBeVisible({ timeout: 30000 })

    const toggle = page.getByTestId('amenities-toggle')
    await expect(toggle).toHaveText('Show all 18 amenities')

    // Click to show all
    await toggle.click()

    // All 18 amenities should now be visible
    const allAmenities = amenitiesList.locator('[data-testid^="amenity-"]')
    await expect(allAmenities).toHaveCount(18)

    // Button should now say "Show less"
    await expect(toggle).toHaveText('Show less')

    // All 4 categories should be visible
    await expect(amenitiesList).toContainText('Essentials')
    await expect(amenitiesList).toContainText('Features')
    await expect(amenitiesList).toContainText('Safety')
    await expect(amenitiesList).toContainText('Location')
  })

  test('Amenities list displays message when property has no amenities', async ({ page }) => {
    // Create a property with no amenities via API
    const createResponse = await page.request.post('/api/properties', {
      data: {
        host_id: 'a1111111-1111-1111-1111-111111111111',
        title: `No Amenities Property ${Date.now()}`,
        description: 'A property with no amenities for testing',
        property_type: 'Apartment',
        price_per_night: 100,
        cleaning_fee: 25,
        max_guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        address: '1 Test St',
        city: 'Testville',
        state: 'TS',
        country: 'United States',
      },
    })
    const property = await createResponse.json()

    await page.goto(`/properties/${property.id}`)

    const amenitiesList = page.getByTestId('amenities-list')
    await expect(amenitiesList).toBeVisible({ timeout: 30000 })

    // Should display "No amenities listed" message
    await expect(amenitiesList).toContainText('No amenities listed')

    // Should not have any amenity items
    await expect(amenitiesList.locator('[data-testid^="amenity-"]')).toHaveCount(0)
  })
})
