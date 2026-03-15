import { test, expect } from '@playwright/test'

/**
 * Set up the seed session so the page loads bookings/tracked routes
 * from the pre-seeded data.
 */
async function setupSeedSession(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('gf_session_token', 'seed-session-token')
  })
  await page.goto('/trips')
  await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })
}

test.describe('TripsTabs', () => {
  test('TripsTabs displays three tabs', async ({ page }) => {
    await setupSeedSession(page)

    const tabsContainer = page.getByTestId('trips-tabs')
    await expect(tabsContainer).toBeVisible()

    // Verify all three tabs are present
    await expect(page.getByTestId('trips-tab-upcoming')).toBeVisible()
    await expect(page.getByTestId('trips-tab-upcoming')).toHaveText('Upcoming')
    await expect(page.getByTestId('trips-tab-past')).toBeVisible()
    await expect(page.getByTestId('trips-tab-past')).toHaveText('Past')
    await expect(page.getByTestId('trips-tab-tracked')).toBeVisible()
    await expect(page.getByTestId('trips-tab-tracked')).toHaveText('Tracked')

    // Upcoming tab should be selected by default
    await expect(page.getByTestId('trips-tab-upcoming')).toHaveClass(/trips-tabs__tab--active/)
    await expect(page.getByTestId('trips-tab-past')).not.toHaveClass(/trips-tabs__tab--active/)
    await expect(page.getByTestId('trips-tab-tracked')).not.toHaveClass(/trips-tabs__tab--active/)
  })

  test('TripsTabs switches to Past tab', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list to load
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Click Past tab
    await page.getByTestId('trips-tab-past').click()

    // Past tab should be visually selected
    await expect(page.getByTestId('trips-tab-past')).toHaveClass(/trips-tabs__tab--active/)
    await expect(page.getByTestId('trips-tab-upcoming')).not.toHaveClass(/trips-tabs__tab--active/)

    // Past list should be visible with past trips
    await expect(page.getByTestId('trips-past-list')).toBeVisible({ timeout: 10000 })

    // Upcoming list should no longer be visible
    await expect(page.getByTestId('trips-upcoming-list')).not.toBeVisible()

    // Past list should contain the completed trip
    const pastList = page.getByTestId('trips-past-list')
    await expect(pastList.locator('[data-testid^="trip-card-ref-"]', { hasText: 'GF-PAST01' })).toBeVisible()
  })

  test('TripsTabs switches to Tracked tab', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list to load
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Click Tracked tab
    await page.getByTestId('trips-tab-tracked').click()

    // Tracked tab should be visually selected
    await expect(page.getByTestId('trips-tab-tracked')).toHaveClass(/trips-tabs__tab--active/)

    // Tracked list should be visible with tracked route cards
    await expect(page.getByTestId('trips-tracked-list')).toBeVisible({ timeout: 10000 })

    // Trip cards should no longer be visible
    await expect(page.getByTestId('trips-upcoming-list')).not.toBeVisible()

    // Should have tracked route cards (seed data has 3)
    const trackedList = page.getByTestId('trips-tracked-list')
    await expect(trackedList.locator('[data-testid^="tracked-route-card-"]')).toHaveCount(3, { timeout: 10000 })
  })

  test('TripsTabs switches back to Upcoming after visiting other tabs', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Switch to Past
    await page.getByTestId('trips-tab-past').click()
    await expect(page.getByTestId('trips-tab-past')).toHaveClass(/trips-tabs__tab--active/)
    await expect(page.getByTestId('trips-past-list')).toBeVisible({ timeout: 10000 })

    // Switch back to Upcoming
    await page.getByTestId('trips-tab-upcoming').click()
    await expect(page.getByTestId('trips-tab-upcoming')).toHaveClass(/trips-tabs__tab--active/)
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 10000 })

    // Past list should not be visible
    await expect(page.getByTestId('trips-past-list')).not.toBeVisible()

    // Only upcoming trips should be shown
    const upcomingList = page.getByTestId('trips-upcoming-list')
    await expect(upcomingList.locator('[data-testid^="trip-card-"]').filter({
      has: page.locator('[data-testid^="trip-card-ref-"]')
    })).toHaveCount(6, { timeout: 10000 })
  })

  test('TripsTabs Upcoming tab shows empty state', async ({ page }) => {
    // Fresh session with no bookings
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })

    // Should show empty state for upcoming
    await expect(page.getByTestId('trips-empty-upcoming')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('trips-empty-upcoming')).toContainText('No upcoming trips')
    await expect(page.getByTestId('trips-empty-upcoming')).toContainText('Search for flights to plan your next trip!')
  })

  test('TripsTabs Past tab shows empty state', async ({ page }) => {
    // Fresh session with no bookings
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })

    // Switch to Past tab
    await page.getByTestId('trips-tab-past').click()

    // Should show empty state for past
    await expect(page.getByTestId('trips-empty-past')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('trips-empty-past')).toContainText('No past trips')
  })

  test('TripsTabs Tracked tab shows empty state', async ({ page }) => {
    // Fresh session with no tracked routes
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })

    // Switch to Tracked tab
    await page.getByTestId('trips-tab-tracked').click()

    // Should show empty state for tracked
    await expect(page.getByTestId('trips-empty-tracked')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('trips-empty-tracked')).toContainText('No tracked routes')
    await expect(page.getByTestId('trips-empty-tracked')).toContainText('Track prices')
  })

  test('TripsTabs Upcoming tab sorts trips by departure date ascending', async ({ page }) => {
    await setupSeedSession(page)

    // Wait for upcoming list to fully load
    const upcomingList = page.getByTestId('trips-upcoming-list')
    await expect(upcomingList).toBeVisible({ timeout: 15000 })

    // Get all date elements within the upcoming list
    const dateElements = upcomingList.locator('[data-testid^="trip-card-dates-"]')

    // Should have 6 upcoming bookings (5 confirmed + 1 cancelled)
    await expect(dateElements).toHaveCount(6, { timeout: 10000 })

    // Verify dates are in ascending order:
    // Mar 25 (GF-SORT01), Mar 30 (GF-SORT02), Apr 1 (GF-ABC123), Apr 1 (GF-CANC01), Apr 5 (GF-ONEW01), Apr 10 (GF-SORT03)
    await expect(dateElements.nth(0)).toContainText('Mar 25')
    await expect(dateElements.nth(1)).toContainText('Mar 30')
    await expect(dateElements.nth(2)).toContainText('Apr 1')
    await expect(dateElements.nth(4)).toContainText('Apr 5')
    await expect(dateElements.nth(5)).toContainText('Apr 10')
  })
})
