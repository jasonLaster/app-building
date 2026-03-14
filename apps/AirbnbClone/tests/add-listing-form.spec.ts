import { test, expect } from '@playwright/test'

// Amenity IDs from seed data
const AMENITY_WIFI = 'c1111111-1111-1111-1111-111111111111'
const AMENITY_KITCHEN = 'c2222222-2222-2222-2222-222222222222'
const AMENITY_POOL = 'c7777777-7777-7777-7777-777777777777'

async function loginAsHost(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill('sarah@example.com')
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

async function goToHostDashboard(page: import('@playwright/test').Page) {
  await loginAsHost(page)
  await page.goto('/hosting')
  await expect(page.getByTestId('listings-tab')).toBeVisible({ timeout: 30000 })
}

async function openAddListingForm(page: import('@playwright/test').Page) {
  await goToHostDashboard(page)
  await page.getByTestId('add-listing-button').click()
  await expect(page.getByTestId('add-listing-form')).toBeVisible({ timeout: 15000 })
}

async function completeStep1(page: import('@playwright/test').Page) {
  await page.getByTestId('property-type-select').click()
  await page.getByTestId('property-type-option-cabin').click()
  await page.getByTestId('listing-title-input').fill('Cozy Mountain Retreat')
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-2')).toBeVisible({ timeout: 15000 })
}

async function completeStep2(page: import('@playwright/test').Page) {
  await page.getByTestId('listing-city-input').fill('Denver')
  await page.getByTestId('listing-state-input').fill('CO')
  await page.getByTestId('listing-country-input').fill('USA')
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-3')).toBeVisible({ timeout: 15000 })
}

async function completeStep3(page: import('@playwright/test').Page) {
  // Default values are already 1, increase maxGuests to 4, bedrooms to 2, beds to 3, bathrooms stays 1
  await page.getByTestId('maxGuests-increment').click()
  await page.getByTestId('maxGuests-increment').click()
  await page.getByTestId('maxGuests-increment').click()
  await page.getByTestId('bedrooms-increment').click()
  await page.getByTestId('beds-increment').click()
  await page.getByTestId('beds-increment').click()
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-4')).toBeVisible({ timeout: 15000 })
}

async function completeStep4(page: import('@playwright/test').Page) {
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-5')).toBeVisible({ timeout: 15000 })
}

async function completeStep5(page: import('@playwright/test').Page) {
  await page.getByTestId('photo-url-input').fill('https://example.com/photo1.jpg')
  await page.getByTestId('add-photo-button').click()
  await expect(page.getByTestId('photo-item-0')).toBeVisible({ timeout: 15000 })
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-6')).toBeVisible({ timeout: 15000 })
}

function mockNominatimApi(page: import('@playwright/test').Page) {
  return page.route('**/nominatim.openstreetmap.org/search**', async (route) => {
    const url = new URL(route.request().url())
    const query = url.searchParams.get('q') || ''
    if (query.includes('123 Main')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            display_name: '123 Main St, Denver, CO, USA',
            address: {
              house_number: '123',
              road: 'Main St',
              city: 'Denver',
              state: 'CO',
              country: 'USA',
            },
            lat: '39.7392',
            lon: '-104.9903',
          },
        ]),
      })
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    }
  })
}

test.describe('Add Listing Form - Steps 1 to 6', () => {
  test('Clicking Add Listing button opens the multi-step form', async ({ page }) => {
    await openAddListingForm(page)

    // Step 1 should be displayed
    await expect(page.getByTestId('add-listing-step-1')).toBeVisible()

    // Step indicator shows step 1 of 7
    const stepIndicator = page.getByTestId('step-indicator')
    await expect(stepIndicator).toBeVisible()
    await expect(stepIndicator).toContainText('Step 1 of 7')

    // Property type select and title input are visible
    await expect(page.getByTestId('property-type-select')).toBeVisible()
    await expect(page.getByTestId('listing-title-input')).toBeVisible()

    // Next and Cancel buttons are visible
    await expect(page.getByTestId('add-listing-next')).toBeVisible()
    await expect(page.getByTestId('add-listing-cancel')).toBeVisible()
  })

  test('Step 1 — Property type selection and title input', async ({ page }) => {
    await openAddListingForm(page)

    // Property type dropdown should list all types
    await page.getByTestId('property-type-select').click()
    const types = ['apartment', 'house', 'cabin', 'villa', 'condo', 'loft', 'cottage', 'townhouse']
    for (const type of types) {
      await expect(page.getByTestId(`property-type-option-${type}`)).toBeVisible()
    }
    // Close the dropdown by clicking the select button again
    await page.getByTestId('property-type-select').click()

    // Title input is visible
    const titleInput = page.getByTestId('listing-title-input')
    await expect(titleInput).toBeVisible()
  })

  test('Step 1 — Selecting property type and entering title', async ({ page }) => {
    await openAddListingForm(page)

    // Select Cabin
    await page.getByTestId('property-type-select').click()
    await page.getByTestId('property-type-option-cabin').click()

    // Verify Cabin is selected
    await expect(page.getByTestId('property-type-select')).toContainText('Cabin')

    // Enter title
    await page.getByTestId('listing-title-input').fill('Cozy Mountain Retreat')
    await expect(page.getByTestId('listing-title-input')).toHaveValue('Cozy Mountain Retreat')

    // Next button should be enabled
    await expect(page.getByTestId('add-listing-next')).toBeEnabled()
  })

  test('Step 1 — Validation prevents proceeding without required fields', async ({ page }) => {
    await openAddListingForm(page)

    // Click Next without filling anything
    await page.getByTestId('add-listing-next').click()

    // Should still be on step 1
    await expect(page.getByTestId('add-listing-step-1')).toBeVisible()

    // Validation errors should appear
    await expect(page.getByTestId('add-listing-step-1')).toContainText('Property type is required')
    await expect(page.getByTestId('add-listing-step-1')).toContainText('Title is required')

    // Should not advance to step 2
    await expect(page.getByTestId('add-listing-step-2')).not.toBeVisible()
  })

  test('Step 2 — Location fields displayed', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)

    // Step 2 should be visible
    await expect(page.getByTestId('add-listing-step-2')).toBeVisible()

    // Step indicator shows step 2 of 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 2 of 7')

    // All location fields are visible
    await expect(page.getByTestId('listing-address-input')).toBeVisible()
    await expect(page.getByTestId('listing-city-input')).toBeVisible()
    await expect(page.getByTestId('listing-state-input')).toBeVisible()
    await expect(page.getByTestId('listing-country-input')).toBeVisible()

    // Back and Next buttons are visible
    await expect(page.getByTestId('add-listing-back')).toBeVisible()
    await expect(page.getByTestId('add-listing-next')).toBeVisible()
  })

  test('Step 2 — Address field uses autocomplete', async ({ page }) => {
    await mockNominatimApi(page)
    await openAddListingForm(page)
    await completeStep1(page)

    // Type in address field
    await page.getByTestId('listing-address-input').fill('123 Main')

    // Wait for autocomplete suggestions to appear
    await expect(page.getByTestId('address-suggestions')).toBeVisible({ timeout: 15000 })

    // Suggestions should contain our mocked result
    await expect(page.getByTestId('address-suggestions')).toContainText('123 Main St, Denver, CO, USA')

    // Click the suggestion
    await page.getByTestId('address-suggestions').locator('button').first().click()

    // Suggestions should close
    await expect(page.getByTestId('address-suggestions')).not.toBeVisible()
  })

  test('Step 2 — Address autocomplete populates related fields', async ({ page }) => {
    await mockNominatimApi(page)
    await openAddListingForm(page)
    await completeStep1(page)

    // Type in address field
    await page.getByTestId('listing-address-input').fill('123 Main')

    // Wait for and click autocomplete suggestion
    await expect(page.getByTestId('address-suggestions')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('address-suggestions').locator('button').first().click()

    // Verify all fields are auto-populated
    await expect(page.getByTestId('listing-address-input')).toHaveValue('123 Main St')
    await expect(page.getByTestId('listing-city-input')).toHaveValue('Denver')
    await expect(page.getByTestId('listing-state-input')).toHaveValue('CO')
    await expect(page.getByTestId('listing-country-input')).toHaveValue('USA')
  })

  test('Step 2 — Validation requires city and country', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)

    // Fill address but leave city and country empty
    await page.getByTestId('listing-address-input').fill('123 Some Street')

    // Click Next
    await page.getByTestId('add-listing-next').click()

    // Should still be on step 2
    await expect(page.getByTestId('add-listing-step-2')).toBeVisible()

    // Validation errors should appear
    await expect(page.getByTestId('add-listing-step-2')).toContainText('City is required')
    await expect(page.getByTestId('add-listing-step-2')).toContainText('Country is required')
  })

  test('Step 3 — Details fields displayed', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Step 3 should be visible
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible()

    // Step indicator shows step 3 of 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 3 of 7')

    // All detail fields with increment/decrement are visible
    await expect(page.getByTestId('maxGuests-value')).toBeVisible()
    await expect(page.getByTestId('maxGuests-increment')).toBeVisible()
    await expect(page.getByTestId('maxGuests-decrement')).toBeVisible()

    await expect(page.getByTestId('bedrooms-value')).toBeVisible()
    await expect(page.getByTestId('bedrooms-increment')).toBeVisible()
    await expect(page.getByTestId('bedrooms-decrement')).toBeVisible()

    await expect(page.getByTestId('beds-value')).toBeVisible()
    await expect(page.getByTestId('beds-increment')).toBeVisible()
    await expect(page.getByTestId('beds-decrement')).toBeVisible()

    await expect(page.getByTestId('bathrooms-value')).toBeVisible()
    await expect(page.getByTestId('bathrooms-increment')).toBeVisible()
    await expect(page.getByTestId('bathrooms-decrement')).toBeVisible()
  })

  test('Step 3 — Setting property details', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Set max guests to 4 (starts at 1, click increment 3 times)
    await page.getByTestId('maxGuests-increment').click()
    await page.getByTestId('maxGuests-increment').click()
    await page.getByTestId('maxGuests-increment').click()
    await expect(page.getByTestId('maxGuests-value')).toHaveText('4')

    // Set bedrooms to 2 (starts at 1, click increment 1 time)
    await page.getByTestId('bedrooms-increment').click()
    await expect(page.getByTestId('bedrooms-value')).toHaveText('2')

    // Set beds to 3 (starts at 1, click increment 2 times)
    await page.getByTestId('beds-increment').click()
    await page.getByTestId('beds-increment').click()
    await expect(page.getByTestId('beds-value')).toHaveText('3')

    // Bathrooms stays at 1
    await expect(page.getByTestId('bathrooms-value')).toHaveText('1')

    // Next button should be enabled
    await expect(page.getByTestId('add-listing-next')).toBeEnabled()
  })

  test('Step 3 — Validation requires all detail fields', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Decrement all fields to 0
    await page.getByTestId('maxGuests-decrement').click()
    await expect(page.getByTestId('maxGuests-value')).toHaveText('0')

    await page.getByTestId('bedrooms-decrement').click()
    await expect(page.getByTestId('bedrooms-value')).toHaveText('0')

    await page.getByTestId('beds-decrement').click()
    await expect(page.getByTestId('beds-value')).toHaveText('0')

    await page.getByTestId('bathrooms-decrement').click()
    await expect(page.getByTestId('bathrooms-value')).toHaveText('0')

    // Click Next
    await page.getByTestId('add-listing-next').click()

    // Should still be on step 3
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible()

    // Validation error should appear
    await expect(page.getByTestId('add-listing-step-3')).toContainText('Max guests must be at least 1')
  })

  test('Step 4 — Amenities selection displayed', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)

    // Step 4 should be visible
    await expect(page.getByTestId('add-listing-step-4')).toBeVisible()

    // Step indicator shows step 4 of 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 4 of 7')

    // Category headings should be visible
    await expect(page.getByTestId('add-listing-step-4')).toContainText('Essentials')
    await expect(page.getByTestId('add-listing-step-4')).toContainText('Features')
    await expect(page.getByTestId('add-listing-step-4')).toContainText('Safety')
    await expect(page.getByTestId('add-listing-step-4')).toContainText('Location')

    // Some amenity checkboxes should be visible
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).toBeVisible()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_KITCHEN}`)).toBeVisible()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_POOL}`)).toBeVisible()
  })

  test('Step 4 — Selecting amenities', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)

    // Check WiFi
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    // Verify checked state via border class
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).toHaveClass(/border-primary/)

    // Check Kitchen
    await page.getByTestId(`amenity-checkbox-${AMENITY_KITCHEN}`).click()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_KITCHEN}`)).toHaveClass(/border-primary/)

    // Check Pool
    await page.getByTestId(`amenity-checkbox-${AMENITY_POOL}`).click()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_POOL}`)).toHaveClass(/border-primary/)

    // Should be able to proceed (amenities are optional)
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-5')).toBeVisible({ timeout: 15000 })
  })

  test('Step 4 — Amenities are toggleable', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)

    // Check WiFi
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).toHaveClass(/border-primary/)

    // Uncheck WiFi
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).not.toHaveClass(/border-primary/)

    // Check WiFi again
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).toHaveClass(/border-primary/)
  })

  test('Step 5 — Photo URL input displayed', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)

    // Step 5 should be visible
    await expect(page.getByTestId('add-listing-step-5')).toBeVisible()

    // Step indicator shows step 5 of 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 5 of 7')

    // Photo URL input and Add Photo button are visible
    await expect(page.getByTestId('photo-url-input')).toBeVisible()
    await expect(page.getByTestId('add-photo-button')).toBeVisible()

    // No photos yet
    await expect(page.locator('[data-testid^="photo-item-"]')).toHaveCount(0)
  })

  test('Step 5 — Adding a photo URL', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)

    // Enter photo URL and add it
    await page.getByTestId('photo-url-input').fill('https://example.com/photo1.jpg')
    await page.getByTestId('add-photo-button').click()

    // Photo should appear in the list
    await expect(page.getByTestId('photo-item-0')).toBeVisible({ timeout: 15000 })

    // URL input should be cleared
    await expect(page.getByTestId('photo-url-input')).toHaveValue('')
  })

  test('Step 5 — Adding multiple photo URLs', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)

    // Add first photo
    await page.getByTestId('photo-url-input').fill('https://example.com/photo1.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-0')).toBeVisible({ timeout: 15000 })

    // Add second photo
    await page.getByTestId('photo-url-input').fill('https://example.com/photo2.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-1')).toBeVisible({ timeout: 15000 })

    // Add third photo
    await page.getByTestId('photo-url-input').fill('https://example.com/photo3.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-2')).toBeVisible({ timeout: 15000 })

    // All three photos should be displayed
    await expect(page.locator('[data-testid^="photo-item-"]')).toHaveCount(3)

    // Each photo should have a remove button
    await expect(page.getByTestId('remove-photo-0')).toBeAttached()
    await expect(page.getByTestId('remove-photo-1')).toBeAttached()
    await expect(page.getByTestId('remove-photo-2')).toBeAttached()
  })

  test('Step 5 — Removing a photo', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)

    // Add 3 photos
    await page.getByTestId('photo-url-input').fill('https://example.com/photo1.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-0')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('photo-url-input').fill('https://example.com/photo2.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-1')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('photo-url-input').fill('https://example.com/photo3.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-2')).toBeVisible({ timeout: 15000 })

    // Verify 3 photos
    await expect(page.locator('[data-testid^="photo-item-"]')).toHaveCount(3)

    // Remove the second photo (index 1) - need to hover to make button visible
    await page.getByTestId('photo-item-1').hover()
    await page.getByTestId('remove-photo-1').click({ force: true })

    // Should now have 2 photos
    await expect(page.locator('[data-testid^="photo-item-"]')).toHaveCount(2, { timeout: 15000 })
  })

  test('Step 5 — Validation requires at least one photo', async ({ page }) => {
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)

    // Try to proceed without adding any photos
    await page.getByTestId('add-listing-next').click()

    // Should still be on step 5
    await expect(page.getByTestId('add-listing-step-5')).toBeVisible()

    // Validation error should appear
    await expect(page.getByTestId('add-listing-step-5')).toContainText('At least one photo is required')
  })

  test('Step 6 — Pricing fields displayed', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)

    // Step 6 should be visible
    await expect(page.getByTestId('add-listing-step-6')).toBeVisible()

    // Step indicator shows step 6 of 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 6 of 7')

    // Price per night input is visible and required
    await expect(page.getByTestId('price-per-night-input')).toBeVisible()

    // Cleaning fee input is visible with default value 0
    await expect(page.getByTestId('cleaning-fee-input')).toBeVisible()
    await expect(page.getByTestId('cleaning-fee-input')).toHaveValue('0')

    // Currency prefix $ is shown (visible in the container text)
    await expect(page.getByTestId('add-listing-step-6')).toContainText('$')
  })
})
