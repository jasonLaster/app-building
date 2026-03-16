import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('My Trips Page - TripsTabs', () => {
  test('My Trips page requires login', async ({ page }) => {
    await page.goto('/trips')

    await expect(page).toHaveURL(/\/login/, { timeout: 30000 })
    await expect(page.getByTestId('my-trips-page')).not.toBeVisible()
  })

  test('My Trips page defaults to Upcoming tab', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('tab-upcoming')).toBeVisible()
    await expect(page.getByTestId('tab-past')).toBeVisible()
    await expect(page.getByTestId('tab-cancelled')).toBeVisible()

    // Upcoming tab should be selected (has border-text class indicating active state)
    await expect(page.getByTestId('tab-upcoming')).toHaveClass(/border-text/)

    // Emma has upcoming bookings: pending cabin (e3333333) and confirmed townhouse (e6666666)
    await expect(page.getByTestId('trips-list')).toBeVisible()
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible()
  })

  test('Upcoming tab shows pending and confirmed future bookings', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Should show pending and confirmed future bookings
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible()

    // Should NOT show completed booking (e1111111)
    await expect(page.getByTestId('trip-card-e1111111-1111-1111-1111-111111111111')).not.toBeVisible()
  })

  test('Switching to Past tab shows completed bookings', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-past').click()

    await expect(page.getByTestId('tab-past')).toHaveClass(/border-text/)

    // Emma has one completed booking: e1111111 (Cozy Downtown Loft)
    await expect(page.getByTestId('trip-card-e1111111-1111-1111-1111-111111111111')).toBeVisible({ timeout: 30000 })

    // Should NOT show upcoming bookings
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).not.toBeVisible()
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).not.toBeVisible()
  })

  test('Switching to Cancelled tab shows cancelled bookings', async ({ page }) => {
    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-cancelled').click()

    await expect(page.getByTestId('tab-cancelled')).toHaveClass(/border-text/)

    // Alex has one cancelled booking: e5555555 (Cozy Downtown Loft)
    await expect(page.getByTestId('trip-card-e5555555-5555-5555-5555-555555555555')).toBeVisible({ timeout: 30000 })

    // Should NOT show upcoming or completed bookings
    await expect(page.getByTestId('trip-card-e2222222-2222-2222-2222-222222222222')).not.toBeVisible()
    await expect(page.getByTestId('trip-card-e4444444-4444-4444-4444-444444444444')).not.toBeVisible()
  })

  test('Switching back to Upcoming tab from another tab', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Switch to Past tab first
    await page.getByTestId('tab-past').click()
    await expect(page.getByTestId('tab-past')).toHaveClass(/border-text/)
    await expect(page.getByTestId('trip-card-e1111111-1111-1111-1111-111111111111')).toBeVisible({ timeout: 30000 })

    // Switch back to Upcoming
    await page.getByTestId('tab-upcoming').click()
    await expect(page.getByTestId('tab-upcoming')).toHaveClass(/border-text/)

    // Should show upcoming bookings again
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible()
  })

  test('Tab shows empty state when no bookings exist for that category', async ({ page }) => {
    // Emma has no cancelled bookings
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-cancelled').click()

    await expect(page.getByTestId('trips-empty-state')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trips-empty-state')).toContainText('No cancelled trips')
  })

  test('Upcoming tab empty state message', async ({ page }) => {
    // Sarah is a host with no guest bookings, so upcoming tab will be empty
    await loginAs(page, 'sarah@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Upcoming tab is default and should show empty state
    await expect(page.getByTestId('trips-empty-state')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trips-empty-state')).toContainText('No upcoming trips')
    // Should have a link to browse properties
    await expect(page.getByTestId('trips-empty-state').locator('a')).toContainText('Browse properties')
  })

  test('Cancelled tab empty state message', async ({ page }) => {
    // Emma has no cancelled bookings
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-cancelled').click()

    await expect(page.getByTestId('trips-empty-state')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trips-empty-state')).toContainText('No cancelled trips')
  })

  test('Tabs are functional on repeated use', async ({ page }) => {
    test.slow()
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Click Past
    await page.getByTestId('tab-past').click()
    await expect(page.getByTestId('tab-past')).toHaveClass(/border-text/)
    await expect(page.getByTestId('trip-card-e1111111-1111-1111-1111-111111111111')).toBeVisible({ timeout: 30000 })

    // Click Cancelled
    await page.getByTestId('tab-cancelled').click()
    await expect(page.getByTestId('tab-cancelled')).toHaveClass(/border-text/)
    await expect(page.getByTestId('trips-empty-state')).toBeVisible({ timeout: 30000 })

    // Click Upcoming
    await page.getByTestId('tab-upcoming').click()
    await expect(page.getByTestId('tab-upcoming')).toHaveClass(/border-text/)
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })

    // Click Past again
    await page.getByTestId('tab-past').click()
    await expect(page.getByTestId('tab-past')).toHaveClass(/border-text/)
    await expect(page.getByTestId('trip-card-e1111111-1111-1111-1111-111111111111')).toBeVisible({ timeout: 30000 })
  })
})
