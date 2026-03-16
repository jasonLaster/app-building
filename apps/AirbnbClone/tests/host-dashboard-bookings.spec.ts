import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// Booking IDs
const BOOKING_COMPLETED = 'e1111111-1111-1111-1111-111111111111' // Loft, Emma, completed
const BOOKING_CONFIRMED_VILLA = 'e2222222-2222-2222-2222-222222222222' // Villa, Alex, confirmed
const BOOKING_CANCELLED = 'e5555555-5555-5555-5555-555555555555' // Loft, Alex, cancelled
const BOOKING_CONFIRMED_TOWNHOUSE = 'e6666666-6666-6666-6666-666666666666' // Townhouse, Emma, confirmed

// Property IDs for creating pending bookings
const PROP_LOFT = 'b1111111-1111-1111-1111-111111111111'
const GUEST_EMMA = 'a3333333-3333-3333-3333-333333333333'

async function loginAsHost(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill('sarah@example.com')
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

async function goToBookingsTab(page: import('@playwright/test').Page) {
  await loginAsHost(page)
  await page.goto('/hosting')
  await expect(page.getByTestId('tab-bookings')).toBeVisible({ timeout: 30000 })
  await page.getByTestId('tab-bookings').click()
  await expect(page.getByTestId('bookings-tab')).toBeVisible({ timeout: 15000 })
}

async function createPendingBooking(request: import('@playwright/test').APIRequestContext, overrides?: { check_in?: string; check_out?: string; total_price?: number; num_guests?: number }) {
  const response = await request.post('http://localhost:8888/api/bookings', {
    data: {
      property_id: PROP_LOFT,
      guest_id: GUEST_EMMA,
      check_in: overrides?.check_in || '2027-08-01',
      check_out: overrides?.check_out || '2027-08-05',
      num_guests: overrides?.num_guests || 2,
      total_price: overrides?.total_price || 600,
    },
  })
  return response.json()
}

test.describe('Host Dashboard - Bookings Tab Display & Filters', () => {
  test.beforeEach(async ({ request }) => {
    // Clean up non-seed bookings and reset seed booking statuses
    await request.delete('http://localhost:8888/api/bookings')
  })

  test('Bookings tab displays table of bookings for host\'s properties', async ({ page }) => {
    await goToBookingsTab(page)

    // Table should be visible
    const table = page.getByTestId('bookings-table')
    await expect(table).toBeVisible({ timeout: 15000 })

    // Verify column headers
    await expect(table.locator('th')).toHaveCount(8)
    await expect(table).toContainText('Property')
    await expect(table).toContainText('Guest')
    await expect(table).toContainText('Check-in')
    await expect(table).toContainText('Check-out')
    await expect(table).toContainText('Guests')
    await expect(table).toContainText('Total')
    await expect(table).toContainText('Status')
    await expect(table).toContainText('Actions')

    // Sarah has 4 bookings
    const rows = page.locator('[data-testid^="booking-row-"]')
    await expect(rows).toHaveCount(4, { timeout: 15000 })
  })

  test('Bookings table shows correct data for each booking', async ({ page }) => {
    await goToBookingsTab(page)

    // Check the confirmed Villa booking (e2222222): Villa, Alex Rivera, Apr 1-7 2026, 6 guests, $2,850, confirmed
    const villaRow = page.getByTestId(`booking-row-${BOOKING_CONFIRMED_VILLA}`)
    await expect(villaRow).toBeVisible({ timeout: 15000 })
    await expect(villaRow).toContainText('Beachfront Villa with Private Pool')
    await expect(villaRow).toContainText('Alex Rivera')
    await expect(villaRow).toContainText('Apr 1, 2026')
    await expect(villaRow).toContainText('Apr 7, 2026')
    await expect(villaRow).toContainText('6')
    await expect(villaRow).toContainText('$2,850')

    const villaStatus = page.getByTestId(`booking-status-${BOOKING_CONFIRMED_VILLA}`)
    await expect(villaStatus).toHaveText(/confirmed/i)
  })

  test('Bookings tab has status filter controls', async ({ page }) => {
    await goToBookingsTab(page)

    // All 5 filter buttons should be visible
    await expect(page.getByTestId('booking-filter-all')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('booking-filter-pending')).toBeVisible()
    await expect(page.getByTestId('booking-filter-confirmed')).toBeVisible()
    await expect(page.getByTestId('booking-filter-cancelled')).toBeVisible()
    await expect(page.getByTestId('booking-filter-completed')).toBeVisible()

    // "All" should be selected by default (has primary bg class)
    const allFilter = page.getByTestId('booking-filter-all')
    await expect(allFilter).toHaveClass(/bg-primary/)
  })

  test('Filtering bookings by Pending status', async ({ page, request }) => {
    // Create a pending booking for Sarah's property
    await createPendingBooking(request)

    await goToBookingsTab(page)

    // Should now have 5 bookings total (4 seed + 1 pending)
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(5, { timeout: 15000 })

    // Click Pending filter
    await page.getByTestId('booking-filter-pending').click()

    // Only the pending booking should be visible
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(1, { timeout: 15000 })

    // Pending filter should appear active
    await expect(page.getByTestId('booking-filter-pending')).toHaveClass(/bg-primary/)
  })

  test('Filtering bookings by Confirmed status', async ({ page }) => {
    await goToBookingsTab(page)

    await page.getByTestId('booking-filter-confirmed').click()

    // Sarah has 2 confirmed bookings
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(2, { timeout: 15000 })

    // Verify both confirmed bookings are visible
    await expect(page.getByTestId(`booking-row-${BOOKING_CONFIRMED_VILLA}`)).toBeVisible()
    await expect(page.getByTestId(`booking-row-${BOOKING_CONFIRMED_TOWNHOUSE}`)).toBeVisible()
  })

  test('Filtering bookings by Completed status', async ({ page }) => {
    await goToBookingsTab(page)

    await page.getByTestId('booking-filter-completed').click()

    // Sarah has 1 completed booking
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId(`booking-row-${BOOKING_COMPLETED}`)).toBeVisible()
  })

  test('Filtering bookings by Cancelled status', async ({ page }) => {
    await goToBookingsTab(page)

    await page.getByTestId('booking-filter-cancelled').click()

    // Sarah has 1 cancelled booking
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId(`booking-row-${BOOKING_CANCELLED}`)).toBeVisible()
  })

  test('Resetting filter to All shows all bookings', async ({ page }) => {
    await goToBookingsTab(page)

    // First filter by Confirmed
    await page.getByTestId('booking-filter-confirmed').click()
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(2, { timeout: 15000 })

    // Reset to All
    await page.getByTestId('booking-filter-all').click()
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(4, { timeout: 15000 })

    // All filter should be active
    await expect(page.getByTestId('booking-filter-all')).toHaveClass(/bg-primary/)
  })

  test('Status filters work on repeated use', async ({ page, request }) => {
    test.slow()
    // Create a pending booking so we have all statuses
    await createPendingBooking(request)

    await goToBookingsTab(page)
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(5, { timeout: 15000 })

    // Pending
    await page.getByTestId('booking-filter-pending').click()
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('booking-filter-pending')).toHaveClass(/bg-primary/)

    // Confirmed
    await page.getByTestId('booking-filter-confirmed').click()
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(2, { timeout: 15000 })
    await expect(page.getByTestId('booking-filter-confirmed')).toHaveClass(/bg-primary/)

    // All
    await page.getByTestId('booking-filter-all').click()
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(5, { timeout: 15000 })
    await expect(page.getByTestId('booking-filter-all')).toHaveClass(/bg-primary/)

    // Completed
    await page.getByTestId('booking-filter-completed').click()
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('booking-filter-completed')).toHaveClass(/bg-primary/)
  })

  test('Bookings tab shows empty state when no bookings exist', async ({ page, request }) => {
    // Make Emma a host (she has no properties, hence no bookings)
    await request.post('http://localhost:8888/api/users/a3333333-3333-3333-3333-333333333333/become-host')

    // Login as Emma
    await page.goto('/login')
    await page.getByTestId('login-email-input').fill('emma@example.com')
    await page.getByTestId('login-submit-button').click()
    await expect(page).toHaveURL('/', { timeout: 30000 })

    await page.goto('/hosting')
    await expect(page.getByTestId('tab-bookings')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-bookings').click()

    // Should show empty state
    await expect(page.getByTestId('bookings-empty-state')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('bookings-empty-state')).toContainText('No bookings yet')
  })

  test('Completed and cancelled bookings have no action buttons', async ({ page }) => {
    await goToBookingsTab(page)

    // Completed booking should not have confirm or cancel buttons
    const completedRow = page.getByTestId(`booking-row-${BOOKING_COMPLETED}`)
    await expect(completedRow).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId(`booking-confirm-${BOOKING_COMPLETED}`)).not.toBeVisible()
    await expect(page.getByTestId(`booking-cancel-${BOOKING_COMPLETED}`)).not.toBeVisible()

    // Cancelled booking should not have confirm or cancel buttons
    const cancelledRow = page.getByTestId(`booking-row-${BOOKING_CANCELLED}`)
    await expect(cancelledRow).toBeVisible()
    await expect(page.getByTestId(`booking-confirm-${BOOKING_CANCELLED}`)).not.toBeVisible()
    await expect(page.getByTestId(`booking-cancel-${BOOKING_CANCELLED}`)).not.toBeVisible()

    // Confirmed bookings SHOULD have a cancel button
    await expect(page.getByTestId(`booking-cancel-${BOOKING_CONFIRMED_VILLA}`)).toBeVisible()
  })

  test('Status badges display correct colors', async ({ page, request }) => {
    // Create a pending booking so we have all 4 statuses
    const pendingBooking = await createPendingBooking(request)

    await goToBookingsTab(page)

    // Pending badge - yellow
    const pendingStatus = page.getByTestId(`booking-status-${pendingBooking.id}`)
    await expect(pendingStatus).toBeVisible({ timeout: 15000 })
    await expect(pendingStatus).toHaveClass(/status-pending/)

    // Confirmed badge - green
    const confirmedStatus = page.getByTestId(`booking-status-${BOOKING_CONFIRMED_VILLA}`)
    await expect(confirmedStatus).toHaveClass(/status-confirmed/)

    // Cancelled badge - red
    const cancelledStatus = page.getByTestId(`booking-status-${BOOKING_CANCELLED}`)
    await expect(cancelledStatus).toHaveClass(/status-cancelled/)

    // Completed badge - blue
    const completedStatus = page.getByTestId(`booking-status-${BOOKING_COMPLETED}`)
    await expect(completedStatus).toHaveClass(/status-completed/)
  })
})
