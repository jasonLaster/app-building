import { test, expect } from '@playwright/test'

/**
 * Set up the seed session so the page loads bookings from pre-seeded data.
 */
async function setupSeedSession(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('gf_session_token', 'seed-session-token')
  })
  await page.goto('/trips')
  await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })
}

/**
 * Find a trip card by its booking reference within a list container.
 */
function findTripCardByRef(page: import('@playwright/test').Page, listTestId: string, ref: string) {
  const list = page.getByTestId(listTestId)
  return list.locator('[data-testid^="trip-card-"]').filter({
    has: page.locator('[data-testid^="trip-card-ref-"]', { hasText: ref })
  })
}

test.describe('TripCard', () => {
  test('TripCard displays route information', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the GF-ABC123 card (LAX → JFK)
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify route displays origin and destination IATA codes
    const routeEl = card.locator('[data-testid^="trip-card-route-"]')
    await expect(routeEl).toContainText('LAX')
    await expect(routeEl).toContainText('JFK')
    await expect(routeEl).toContainText('→')
  })

  test('TripCard displays travel dates', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the round-trip booking GF-SORT01 (LAX→JFK Mar 25, return Mar 30)
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-SORT01')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify both departure and return dates are shown
    const datesEl = card.locator('[data-testid^="trip-card-dates-"]')
    await expect(datesEl).toContainText('Mar 25')
    await expect(datesEl).toContainText('Mar 30')
    await expect(datesEl).toContainText('–')
  })

  test('TripCard displays airline and flight info', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the GF-SORT02 card (Delta DL960)
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-SORT02')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify airline name and flight number
    await expect(card).toContainText('Delta Air Lines')
    await expect(card).toContainText('DL960')

    // Verify airline logo is displayed
    const logoEl = card.locator('[data-testid^="trip-card-airline-logo-"]')
    await expect(logoEl).toBeVisible()
  })

  test('TripCard displays Confirmed status badge', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find a confirmed booking
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify Confirmed status badge
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Confirmed')
    await expect(statusEl).toHaveClass(/trip-card__status--confirmed/)
  })

  test('TripCard displays Completed status badge', async ({ page }) => {
    await setupSeedSession(page)

    // Switch to Past tab
    await page.getByTestId('trips-tab-past').click()
    await expect(page.getByTestId('trips-past-list')).toBeVisible({ timeout: 15000 })

    // Find the completed booking
    const card = findTripCardByRef(page, 'trips-past-list', 'GF-PAST01')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify Completed status badge
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Completed')
    await expect(statusEl).toHaveClass(/trip-card__status--completed/)
  })

  test('TripCard displays Cancelled status badge', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the cancelled booking
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-CANC01')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify Cancelled status badge
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Cancelled')
    await expect(statusEl).toHaveClass(/trip-card__status--cancelled/)
  })

  test('TripCard displays price paid', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the GF-ABC123 card (total_price_cents = 34385 → $343.85)
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify price is displayed
    const priceEl = card.locator('[data-testid^="trip-card-price-"]')
    await expect(priceEl).toHaveText('$343.85')
  })

  test('TripCard displays booking reference', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the card and verify reference is displayed
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })

    const refEl = card.locator('[data-testid^="trip-card-ref-"]')
    await expect(refEl).toHaveText('GF-ABC123')
  })

  test('TripCard shows cancel button for upcoming confirmed flights', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find a confirmed upcoming booking
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify Cancel button is visible
    const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
    await expect(cancelBtn).toBeVisible()
    await expect(cancelBtn).toHaveText('Cancel')
  })

  test('TripCard does not show cancel button for past flights', async ({ page }) => {
    await setupSeedSession(page)

    // Switch to Past tab
    await page.getByTestId('trips-tab-past').click()
    await expect(page.getByTestId('trips-past-list')).toBeVisible({ timeout: 15000 })

    // Find the completed past booking
    const card = findTripCardByRef(page, 'trips-past-list', 'GF-PAST01')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify no Cancel button exists on past trip cards
    const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
    await expect(cancelBtn).toHaveCount(0)
  })

  test('TripCard does not show cancel button for already cancelled flights', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the cancelled booking
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-CANC01')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify Cancelled status badge is shown
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Cancelled')

    // Verify no Cancel button
    const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
    await expect(cancelBtn).toHaveCount(0)
  })

  test('TripCard displays one-way trip correctly', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find the one-way booking GF-ONEW01 (SFO → ORD, Apr 5)
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ONEW01')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Verify route
    const routeEl = card.locator('[data-testid^="trip-card-route-"]')
    await expect(routeEl).toContainText('SFO')
    await expect(routeEl).toContainText('ORD')
    await expect(routeEl).toContainText('→')

    // Verify only departure date shown (no return date separator)
    const datesEl = card.locator('[data-testid^="trip-card-dates-"]')
    await expect(datesEl).toContainText('Apr 5')
    const datesText = await datesEl.textContent()
    expect(datesText).not.toContain('–')

    // Verify other fields are displayed normally
    await expect(card).toContainText('American Airlines')
    await expect(card).toContainText('AA970')

    const priceEl = card.locator('[data-testid^="trip-card-price-"]')
    await expect(priceEl).toHaveText('$205.85')

    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Confirmed')

    const refEl = card.locator('[data-testid^="trip-card-ref-"]')
    await expect(refEl).toHaveText('GF-ONEW01')
  })
})
