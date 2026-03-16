import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

const HOST_ID = 'a1111111-1111-1111-1111-111111111111'
const AMENITY_WIFI = 'c1111111-1111-1111-1111-111111111111'
const AMENITY_KITCHEN = 'c2222222-2222-2222-2222-222222222222'

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

async function completeStep1(page: import('@playwright/test').Page, title = 'Cozy Mountain Retreat') {
  await page.getByTestId('property-type-select').click()
  await page.getByTestId('property-type-option-cabin').click()
  await page.getByTestId('listing-title-input').fill(title)
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
  await page.getByTestId('maxGuests-increment').click()
  await page.getByTestId('maxGuests-increment').click()
  await page.getByTestId('maxGuests-increment').click()
  await page.getByTestId('bedrooms-increment').click()
  await page.getByTestId('beds-increment').click()
  await page.getByTestId('beds-increment').click()
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-4')).toBeVisible({ timeout: 15000 })
}

async function completeStep4(page: import('@playwright/test').Page, selectAmenities = false) {
  if (selectAmenities) {
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    await page.getByTestId(`amenity-checkbox-${AMENITY_KITCHEN}`).click()
  }
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-5')).toBeVisible({ timeout: 15000 })
}

async function completeStep5(page: import('@playwright/test').Page, photoCount = 1) {
  for (let i = 0; i < photoCount; i++) {
    await page.getByTestId('photo-url-input').fill(`https://example.com/photo${i + 1}.jpg`)
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId(`photo-item-${i}`)).toBeVisible({ timeout: 15000 })
  }
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-6')).toBeVisible({ timeout: 15000 })
}

async function completeStep6(page: import('@playwright/test').Page, price = '150', cleaningFee = '50') {
  await page.getByTestId('price-per-night-input').fill(price)
  await page.getByTestId('cleaning-fee-input').fill(cleaningFee)
  await page.getByTestId('add-listing-next').click()
  await expect(page.getByTestId('add-listing-step-7')).toBeVisible({ timeout: 15000 })
}

async function deleteAllTestProperties(page: import('@playwright/test').Page) {
  const response = await page.request.get(`/api/host-listings?host_id=${HOST_ID}`)
  const listingsData = await response.json()
  const listings = (listingsData.items ?? listingsData) as { id: string; title: string }[]
  for (const listing of listings) {
    // Only delete properties created by tests (not seed data)
    if (listing.title.includes('Test Listing') || listing.title.includes('Cozy Mountain Retreat') || listing.title.includes('Second Test')) {
      await page.request.delete(`/api/properties/${listing.id}`)
    }
  }
}

test.describe('Add Listing Form - Steps 6-7 and Form Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTestProperties(page)
  })

  test('Step 6 — Entering pricing information', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)

    // Enter price per night
    await page.getByTestId('price-per-night-input').fill('150')
    await expect(page.getByTestId('price-per-night-input')).toHaveValue('150')

    // Enter cleaning fee
    await page.getByTestId('cleaning-fee-input').fill('50')
    await expect(page.getByTestId('cleaning-fee-input')).toHaveValue('50')

    // Currency prefix $ is shown
    await expect(page.getByTestId('add-listing-step-6')).toContainText('$')
  })

  test('Step 6 — Validation requires price per night', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)

    // Leave price per night empty and click Next
    await page.getByTestId('add-listing-next').click()

    // Should still be on step 6
    await expect(page.getByTestId('add-listing-step-6')).toBeVisible()

    // Validation error should appear
    await expect(page.getByTestId('add-listing-step-6')).toContainText('Price per night is required and must be greater than 0')

    // Should not advance to step 7
    await expect(page.getByTestId('add-listing-step-7')).not.toBeVisible()
  })

  test('Step 7 — Review and publish page displayed', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)
    await completeStep6(page)

    // Step 7 should be visible
    await expect(page.getByTestId('add-listing-step-7')).toBeVisible()

    // Step indicator shows step 7 of 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 7 of 7')

    // Review page shows summary sections
    await expect(page.getByTestId('add-listing-step-7')).toContainText('Review & Publish')
    await expect(page.getByTestId('add-listing-step-7')).toContainText('Property')
    await expect(page.getByTestId('add-listing-step-7')).toContainText('Location')
    await expect(page.getByTestId('add-listing-step-7')).toContainText('Details')
    await expect(page.getByTestId('add-listing-step-7')).toContainText('Pricing')

    // Publish and Back buttons are visible
    await expect(page.getByTestId('add-listing-publish')).toBeVisible()
    await expect(page.getByTestId('add-listing-back')).toBeVisible()
  })

  test('Step 7 — Review page shows all entered data correctly', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)

    // Step 1: type Cabin, title "Cozy Mountain Retreat"
    await page.getByTestId('property-type-select').click()
    await page.getByTestId('property-type-option-cabin').click()
    await page.getByTestId('listing-title-input').fill('Cozy Mountain Retreat')
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-2')).toBeVisible({ timeout: 15000 })

    // Step 2: address "123 Pine Rd", city "Aspen", state "CO", country "USA"
    await page.getByTestId('listing-address-input').fill('123 Pine Rd')
    await page.getByTestId('listing-city-input').fill('Aspen')
    await page.getByTestId('listing-state-input').fill('CO')
    await page.getByTestId('listing-country-input').fill('USA')
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible({ timeout: 15000 })

    // Step 3: 4 guests, 2 bedrooms, 2 beds, 1 bathroom
    await page.getByTestId('maxGuests-increment').click()
    await page.getByTestId('maxGuests-increment').click()
    await page.getByTestId('maxGuests-increment').click()
    await page.getByTestId('bedrooms-increment').click()
    await page.getByTestId('beds-increment').click()
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-4')).toBeVisible({ timeout: 15000 })

    // Step 4: select WiFi and Kitchen
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    await page.getByTestId(`amenity-checkbox-${AMENITY_KITCHEN}`).click()
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-5')).toBeVisible({ timeout: 15000 })

    // Step 5: add 2 photos
    await page.getByTestId('photo-url-input').fill('https://example.com/photo1.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-0')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('photo-url-input').fill('https://example.com/photo2.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-1')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-6')).toBeVisible({ timeout: 15000 })

    // Step 6: price $200/night, cleaning fee $75
    await page.getByTestId('price-per-night-input').fill('200')
    await page.getByTestId('cleaning-fee-input').fill('75')
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-7')).toBeVisible({ timeout: 15000 })

    // Verify review page shows all entered data
    const reviewPage = page.getByTestId('add-listing-step-7')
    await expect(reviewPage).toContainText('Cabin')
    await expect(reviewPage).toContainText('Cozy Mountain Retreat')
    await expect(reviewPage).toContainText('123 Pine Rd')
    await expect(reviewPage).toContainText('Aspen')
    await expect(reviewPage).toContainText('CO')
    await expect(reviewPage).toContainText('USA')
    await expect(reviewPage).toContainText('4') // guests
    await expect(reviewPage).toContainText('2') // bedrooms and beds
    await expect(reviewPage).toContainText('1') // bathrooms
    await expect(reviewPage).toContainText('WiFi')
    await expect(reviewPage).toContainText('Kitchen')
    await expect(reviewPage).toContainText('$200')
    await expect(reviewPage).toContainText('$75')
  })

  test('Publishing a new listing creates the property', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)

    // Get initial listing count
    const initialStatText = await page.getByTestId('stat-total-listings').textContent()
    const initialCount = parseInt(initialStatText?.match(/\d+/)?.[0] || '0', 10)

    // Complete all steps
    const uniqueTitle = `Test Listing ${Date.now()}`
    await completeStep1(page, uniqueTitle)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)
    await completeStep6(page)

    // Click Publish
    await page.getByTestId('add-listing-publish').click()

    // Form should close
    await expect(page.getByTestId('add-listing-form')).not.toBeVisible({ timeout: 30000 })

    // New property should appear in listings tab
    await expect(page.getByTestId('listings-tab')).toContainText(uniqueTitle, { timeout: 30000 })

    // Total Listings stat should increment
    await expect(page.getByTestId('stat-total-listings')).toContainText(String(initialCount + 1), { timeout: 30000 })
  })

  test('Back button navigates to the previous step', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Now on step 3
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible()

    // Click Back
    await page.getByTestId('add-listing-back').click()

    // Should be on step 2
    await expect(page.getByTestId('add-listing-step-2')).toBeVisible({ timeout: 15000 })

    // Previously entered data should be preserved
    await expect(page.getByTestId('listing-city-input')).toHaveValue('Denver')
    await expect(page.getByTestId('listing-state-input')).toHaveValue('CO')
    await expect(page.getByTestId('listing-country-input')).toHaveValue('USA')
  })

  test('Cancel button closes the form without saving', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)
    await completeStep3(page)

    // Now on step 4
    await expect(page.getByTestId('add-listing-step-4')).toBeVisible()

    // Click Cancel
    await page.getByTestId('add-listing-cancel').click()

    // Confirmation dialog should appear
    await expect(page.getByTestId('discard-dialog')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('discard-dialog')).toContainText('Discard your listing?')
    await expect(page.getByTestId('discard-dialog')).toContainText('All entered information will be lost.')
    await expect(page.getByTestId('discard-dialog-confirm')).toBeVisible()
    await expect(page.getByTestId('discard-dialog-keep')).toBeVisible()
  })

  test('Confirming cancel discards the listing form', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Click Cancel to open discard dialog
    await page.getByTestId('add-listing-cancel').click()
    await expect(page.getByTestId('discard-dialog')).toBeVisible({ timeout: 15000 })

    // Click Discard
    await page.getByTestId('discard-dialog-confirm').click()

    // Form should close
    await expect(page.getByTestId('add-listing-form')).not.toBeVisible({ timeout: 15000 })

    // User should be back on the Listings tab
    await expect(page.getByTestId('listings-tab')).toBeVisible({ timeout: 15000 })
  })

  test('Dismissing cancel keeps the form open', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Now on step 3 - enter some data
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible()

    // Click Cancel to open discard dialog
    await page.getByTestId('add-listing-cancel').click()
    await expect(page.getByTestId('discard-dialog')).toBeVisible({ timeout: 15000 })

    // Click Keep Editing
    await page.getByTestId('discard-dialog-keep').click()

    // Dialog should close
    await expect(page.getByTestId('discard-dialog')).not.toBeVisible({ timeout: 15000 })

    // Form should still be open on step 3
    await expect(page.getByTestId('add-listing-form')).toBeVisible()
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible()
  })

  test('Step indicator shows correct progress throughout the form', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)

    // Step 1
    await expect(page.getByTestId('step-indicator')).toContainText('Step 1 of 7')

    await completeStep1(page)
    // Step 2
    await expect(page.getByTestId('step-indicator')).toContainText('Step 2 of 7')

    await completeStep2(page)
    // Step 3
    await expect(page.getByTestId('step-indicator')).toContainText('Step 3 of 7')

    await completeStep3(page)
    // Step 4
    await expect(page.getByTestId('step-indicator')).toContainText('Step 4 of 7')

    await completeStep4(page)
    // Step 5
    await expect(page.getByTestId('step-indicator')).toContainText('Step 5 of 7')

    await completeStep5(page)
    // Step 6
    await expect(page.getByTestId('step-indicator')).toContainText('Step 6 of 7')

    await completeStep6(page)
    // Step 7
    await expect(page.getByTestId('step-indicator')).toContainText('Step 7 of 7')

    // Go back and verify indicator updates
    await page.getByTestId('add-listing-back').click()
    await expect(page.getByTestId('step-indicator')).toContainText('Step 6 of 7')
  })

  test('Data persistence across steps when navigating back and forth', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)
    await completeStep1(page)
    await completeStep2(page)

    // Step 3: set specific values
    await page.getByTestId('maxGuests-increment').click()
    await page.getByTestId('maxGuests-increment').click() // maxGuests = 3
    await page.getByTestId('bedrooms-increment').click() // bedrooms = 2
    await expect(page.getByTestId('maxGuests-value')).toHaveText('3')
    await expect(page.getByTestId('bedrooms-value')).toHaveText('2')

    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-4')).toBeVisible({ timeout: 15000 })

    // Step 4: select WiFi amenity
    await page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`).click()
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).toHaveClass(/border-primary/)

    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-5')).toBeVisible({ timeout: 15000 })

    // Step 5: add a photo
    await page.getByTestId('photo-url-input').fill('https://example.com/persist-test.jpg')
    await page.getByTestId('add-photo-button').click()
    await expect(page.getByTestId('photo-item-0')).toBeVisible({ timeout: 15000 })

    // Now go back twice to step 3
    await page.getByTestId('add-listing-back').click()
    await expect(page.getByTestId('add-listing-step-4')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('add-listing-back').click()
    await expect(page.getByTestId('add-listing-step-3')).toBeVisible({ timeout: 15000 })

    // Verify step 3 data is preserved
    await expect(page.getByTestId('maxGuests-value')).toHaveText('3')
    await expect(page.getByTestId('bedrooms-value')).toHaveText('2')

    // Go forward to step 4
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-4')).toBeVisible({ timeout: 15000 })

    // Verify WiFi amenity is still selected
    await expect(page.getByTestId(`amenity-checkbox-${AMENITY_WIFI}`)).toHaveClass(/border-primary/)

    // Go forward to step 5
    await page.getByTestId('add-listing-next').click()
    await expect(page.getByTestId('add-listing-step-5')).toBeVisible({ timeout: 15000 })

    // Verify photo is still there
    await expect(page.getByTestId('photo-item-0')).toBeVisible()
  })

  test('Add Listing form works correctly on repeated use', async ({ page }) => {
    test.slow()
    await openAddListingForm(page)

    // Get initial listing count
    const initialStatText = await page.getByTestId('stat-total-listings').textContent()
    const initialCount = parseInt(initialStatText?.match(/\d+/)?.[0] || '0', 10)

    // First listing
    const firstTitle = `Test Listing ${Date.now()}`
    await completeStep1(page, firstTitle)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)
    await completeStep6(page)
    await page.getByTestId('add-listing-publish').click()
    await expect(page.getByTestId('add-listing-form')).not.toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('listings-tab')).toContainText(firstTitle, { timeout: 30000 })

    // Second listing
    await page.getByTestId('add-listing-button').click()
    await expect(page.getByTestId('add-listing-form')).toBeVisible({ timeout: 15000 })

    const secondTitle = `Second Test ${Date.now()}`
    await completeStep1(page, secondTitle)
    await completeStep2(page)
    await completeStep3(page)
    await completeStep4(page)
    await completeStep5(page)
    await completeStep6(page, '100', '25')
    await page.getByTestId('add-listing-publish').click()
    await expect(page.getByTestId('add-listing-form')).not.toBeVisible({ timeout: 30000 })

    // Both properties should appear in listings tab
    await expect(page.getByTestId('listings-tab')).toContainText(firstTitle, { timeout: 30000 })
    await expect(page.getByTestId('listings-tab')).toContainText(secondTitle, { timeout: 30000 })

    // Total Listings stat should show correct total
    await expect(page.getByTestId('stat-total-listings')).toContainText(String(initialCount + 2), { timeout: 30000 })
  })
})
