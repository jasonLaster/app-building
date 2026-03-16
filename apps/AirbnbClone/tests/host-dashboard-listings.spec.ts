import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// Sarah's property IDs (host a1111111)
const PROP_LOFT = 'b1111111-1111-1111-1111-111111111111'
const PROP_VILLA = 'b2222222-2222-2222-2222-222222222222'
const PROP_TOWNHOUSE = 'b5555555-5555-5555-5555-555555555555'

const BASE = 'http://localhost:8888'

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

test.describe('Host Dashboard - Listings Tab', () => {
  test.beforeEach(async ({ request }) => {
    // Reset all properties to active state before each test
    await request.put(`${BASE}/api/properties/${PROP_LOFT}`, { data: { is_active: true } })
    await request.put(`${BASE}/api/properties/${PROP_VILLA}`, { data: { is_active: true } })
    await request.put(`${BASE}/api/properties/${PROP_TOWNHOUSE}`, { data: { is_active: true } })
  })
  test('Listings tab displays host\'s properties in a grid', async ({ page }) => {
    await goToHostDashboard(page)

    // Sarah has 3 properties
    const cards = page.locator('[data-testid^="listing-card-"]')
    await expect(cards).toHaveCount(3, { timeout: 15000 })

    // Verify each property card is visible
    await expect(page.getByTestId(`listing-card-${PROP_LOFT}`)).toBeVisible()
    await expect(page.getByTestId(`listing-card-${PROP_VILLA}`)).toBeVisible()
    await expect(page.getByTestId(`listing-card-${PROP_TOWNHOUSE}`)).toBeVisible()
  })

  test('Listing card shows property details', async ({ page }) => {
    await goToHostDashboard(page)

    // Check the Loft card details: title, price, city, rating, review count, active badge
    const loftCard = page.getByTestId(`listing-card-${PROP_LOFT}`)
    await expect(loftCard).toBeVisible({ timeout: 15000 })
    await expect(loftCard).toContainText('Cozy Downtown Loft with City Views')
    await expect(loftCard).toContainText('$150')
    await expect(loftCard).toContainText('New York')
    await expect(loftCard).toContainText('5.0')
    await expect(loftCard).toContainText('1 reviews')

    const statusBadge = page.getByTestId(`listing-status-${PROP_LOFT}`)
    await expect(statusBadge).toHaveText('Active')
  })

  test('Listing card has Edit button that navigates to property detail', async ({ page }) => {
    await goToHostDashboard(page)

    const editBtn = page.getByTestId(`listing-edit-${PROP_LOFT}`)
    await expect(editBtn).toBeVisible({ timeout: 15000 })
    await editBtn.click()

    await expect(page).toHaveURL(`/properties/${PROP_LOFT}`, { timeout: 30000 })
  })

  test('Listing card has Deactivate button for active properties', async ({ page }) => {
    await goToHostDashboard(page)

    // Click Deactivate on the Loft
    const deactivateBtn = page.getByTestId(`listing-deactivate-${PROP_LOFT}`)
    await expect(deactivateBtn).toBeVisible({ timeout: 15000 })
    await deactivateBtn.click()

    // Confirmation dialog should appear
    const dialog = page.getByTestId('deactivate-dialog')
    await expect(dialog).toBeVisible({ timeout: 15000 })
    await expect(dialog).toContainText('Are you sure you want to deactivate this listing?')
    await expect(dialog).toContainText('Cozy Downtown Loft with City Views')
  })

  test('Confirming deactivation sets property to inactive', async ({ page }) => {
    await goToHostDashboard(page)

    // Capture initial Total Listings count
    const initialStatText = await page.getByTestId('stat-total-listings').textContent()
    const initialCount = parseInt(initialStatText?.match(/\d+/)?.[0] || '0', 10)

    // Deactivate the Loft
    await page.getByTestId(`listing-deactivate-${PROP_LOFT}`).click()
    await expect(page.getByTestId('deactivate-dialog')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('deactivate-dialog-confirm').click()

    // Dialog should close
    await expect(page.getByTestId('deactivate-dialog')).not.toBeVisible({ timeout: 15000 })

    // Property status should change to Inactive
    await expect(page.getByTestId(`listing-status-${PROP_LOFT}`)).toHaveText('Inactive', { timeout: 15000 })

    // Total Listings stat should decrease by 1
    await expect(page.getByTestId('stat-total-listings')).toContainText(String(initialCount - 1), { timeout: 15000 })
  })

  test('Dismissing deactivation dialog keeps property active', async ({ page }) => {
    await goToHostDashboard(page)

    // Open deactivation dialog for the Loft
    await page.getByTestId(`listing-deactivate-${PROP_LOFT}`).click()
    await expect(page.getByTestId('deactivate-dialog')).toBeVisible({ timeout: 15000 })

    // Cancel/dismiss the dialog
    await page.getByTestId('deactivate-dialog-cancel').click()

    // Dialog should close
    await expect(page.getByTestId('deactivate-dialog')).not.toBeVisible({ timeout: 15000 })

    // Property should still be active
    await expect(page.getByTestId(`listing-status-${PROP_LOFT}`)).toHaveText('Active')
  })

  test('Listing card shows Activate button for inactive properties', async ({ page }) => {
    await goToHostDashboard(page)

    // First deactivate the Loft via API to make it inactive
    await page.request.delete(`http://localhost:8888/api/properties/${PROP_LOFT}`)

    // Reload to see updated state
    await page.goto('/hosting')
    await expect(page.getByTestId('listings-tab')).toBeVisible({ timeout: 30000 })

    // Loft should now show Inactive status and Activate button
    await expect(page.getByTestId(`listing-status-${PROP_LOFT}`)).toHaveText('Inactive', { timeout: 15000 })
    const activateBtn = page.getByTestId(`listing-activate-${PROP_LOFT}`)
    await expect(activateBtn).toBeVisible()

    // Click Activate
    await activateBtn.click()

    // Property should become Active again
    await expect(page.getByTestId(`listing-status-${PROP_LOFT}`)).toHaveText('Active', { timeout: 15000 })

    // Total Listings stat should update
    await expect(page.getByTestId('stat-total-listings')).toContainText('3', { timeout: 15000 })
  })

  test('Listings tab shows empty state for host with no properties', async ({ page, request }) => {
    // Make emma a host via API (she has no properties)
    await request.post('http://localhost:8888/api/users/a3333333-3333-3333-3333-333333333333/become-host')

    // Login as emma
    await page.goto('/login')
    await page.getByTestId('login-email-input').fill('emma@example.com')
    await page.getByTestId('login-submit-button').click()
    await expect(page).toHaveURL('/', { timeout: 30000 })

    await page.goto('/hosting')
    await expect(page.getByTestId('listings-tab')).toBeVisible({ timeout: 30000 })

    // Should show empty state
    await expect(page.getByTestId('listings-empty-state')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('listings-empty-state')).toContainText("You don't have any listings yet")
  })

  test('Add Listing button is visible on the Listings tab', async ({ page }) => {
    await goToHostDashboard(page)

    const addBtn = page.getByTestId('add-listing-button')
    await expect(addBtn).toBeVisible({ timeout: 15000 })
    await expect(addBtn).toContainText('Add Listing')
  })

  test('Deactivate and activate actions work on repeated use', async ({ page }) => {
    test.slow()
    await goToHostDashboard(page)

    // Capture initial Total Listings count
    const initialStatText = await page.getByTestId('stat-total-listings').textContent()
    const initialCount = parseInt(initialStatText?.match(/\d+/)?.[0] || '0', 10)

    // 1. Deactivate the Loft (first property)
    await page.getByTestId(`listing-deactivate-${PROP_LOFT}`).click()
    await expect(page.getByTestId('deactivate-dialog')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('deactivate-dialog-confirm').click()
    await expect(page.getByTestId('deactivate-dialog')).not.toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId(`listing-status-${PROP_LOFT}`)).toHaveText('Inactive', { timeout: 15000 })
    await expect(page.getByTestId('stat-total-listings')).toContainText(String(initialCount - 1), { timeout: 15000 })

    // 2. Activate the Loft back
    await page.getByTestId(`listing-activate-${PROP_LOFT}`).click()
    await expect(page.getByTestId(`listing-status-${PROP_LOFT}`)).toHaveText('Active', { timeout: 15000 })
    await expect(page.getByTestId('stat-total-listings')).toContainText(String(initialCount), { timeout: 15000 })

    // 3. Deactivate the Villa (second property)
    await page.getByTestId(`listing-deactivate-${PROP_VILLA}`).click()
    await expect(page.getByTestId('deactivate-dialog')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('deactivate-dialog-confirm').click()
    await expect(page.getByTestId('deactivate-dialog')).not.toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId(`listing-status-${PROP_VILLA}`)).toHaveText('Inactive', { timeout: 15000 })
    await expect(page.getByTestId('stat-total-listings')).toContainText(String(initialCount - 1), { timeout: 15000 })
  })
})
