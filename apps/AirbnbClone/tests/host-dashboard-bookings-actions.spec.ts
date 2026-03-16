import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

const BOOKING_CONFIRMED_VILLA = 'e2222222-2222-2222-2222-222222222222' // Villa, Alex, confirmed

// For creating pending bookings
const PROP_LOFT = 'b1111111-1111-1111-1111-111111111111'
const PROP_TOWNHOUSE = 'b5555555-5555-5555-5555-555555555555'
const PROP_VILLA = 'b2222222-2222-2222-2222-222222222222'
const GUEST_EMMA = 'a3333333-3333-3333-3333-333333333333'
const GUEST_ALEX = 'a4444444-4444-4444-4444-444444444444'

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

async function createPendingBooking(
  request: import('@playwright/test').APIRequestContext,
  propertyId: string,
  guestId: string,
  checkIn: string,
  checkOut: string,
  numGuests: number,
  totalPrice: number
) {
  const response = await request.post('http://localhost:8888/api/bookings', {
    data: {
      property_id: propertyId,
      guest_id: guestId,
      check_in: checkIn,
      check_out: checkOut,
      num_guests: numGuests,
      total_price: totalPrice,
    },
  })
  return response.json()
}

test.describe.serial('Host Dashboard - Bookings Actions', () => {
  test.beforeEach(async ({ request }) => {
    // Reset bookings to seed state before each test
    await request.delete('http://localhost:8888/api/bookings')
  })

  test('Host can confirm a pending booking', async ({ page, request }) => {
    // Create a pending booking
    const pendingBooking = await createPendingBooking(
      request, PROP_LOFT, GUEST_EMMA, '2027-09-01', '2027-09-05', 2, 600
    )

    await goToBookingsTab(page)

    // Verify the pending booking is visible with Confirm button
    const row = page.getByTestId(`booking-row-${pendingBooking.id}`)
    await expect(row).toBeVisible({ timeout: 15000 })
    const statusBadge = page.getByTestId(`booking-status-${pendingBooking.id}`)
    await expect(statusBadge).toHaveText(/pending/i)

    // Capture initial active bookings stat
    const initialStatText = await page.getByTestId('stat-active-bookings').textContent()
    const initialActive = parseInt(initialStatText?.match(/\d+/)?.[0] || '0')

    // Click Confirm
    await page.getByTestId(`booking-confirm-${pendingBooking.id}`).click()

    // Status should change to confirmed
    await expect(statusBadge).toHaveText(/confirmed/i, { timeout: 15000 })
    await expect(statusBadge).toHaveClass(/status-confirmed/)

    // Confirm button should no longer be visible
    await expect(page.getByTestId(`booking-confirm-${pendingBooking.id}`)).not.toBeVisible({ timeout: 15000 })

    // Active bookings stat should remain the same (pending -> confirmed both count as active)
    await expect(page.getByTestId('stat-active-bookings')).toContainText(String(initialActive), { timeout: 15000 })
  })

  test('Host can cancel a pending booking', async ({ page, request }) => {
    // Create a pending booking
    const pendingBooking = await createPendingBooking(
      request, PROP_LOFT, GUEST_EMMA, '2027-10-01', '2027-10-05', 2, 600
    )

    await goToBookingsTab(page)

    const row = page.getByTestId(`booking-row-${pendingBooking.id}`)
    await expect(row).toBeVisible({ timeout: 15000 })

    // Click Cancel button
    await page.getByTestId(`booking-cancel-${pendingBooking.id}`).click()

    // Confirmation dialog should appear
    const dialog = page.getByTestId('cancel-booking-dialog')
    await expect(dialog).toBeVisible({ timeout: 15000 })
    await expect(dialog).toContainText('Are you sure you want to cancel this booking?')

    // Dialog should show booking details
    await expect(dialog).toContainText('Cozy Downtown Loft with City Views')
    await expect(dialog).toContainText('Emma Wilson')
    await expect(dialog).toContainText('Oct 1, 2027')
    await expect(dialog).toContainText('Oct 5, 2027')
  })

  test('Confirming cancellation of a booking updates status', async ({ page, request }) => {
    // Create a pending booking
    const pendingBooking = await createPendingBooking(
      request, PROP_LOFT, GUEST_EMMA, '2027-11-01', '2027-11-05', 2, 600
    )

    await goToBookingsTab(page)

    // Capture initial active bookings stat
    const initialStatText = await page.getByTestId('stat-active-bookings').textContent()
    const initialActive = parseInt(initialStatText?.match(/\d+/)?.[0] || '0')

    const row = page.getByTestId(`booking-row-${pendingBooking.id}`)
    await expect(row).toBeVisible({ timeout: 15000 })

    // Click Cancel to open dialog
    await page.getByTestId(`booking-cancel-${pendingBooking.id}`).click()
    await expect(page.getByTestId('cancel-booking-dialog')).toBeVisible({ timeout: 15000 })

    // Confirm the cancellation
    await page.getByTestId('cancel-booking-dialog-confirm').click()

    // Dialog should close
    await expect(page.getByTestId('cancel-booking-dialog')).not.toBeVisible({ timeout: 15000 })

    // Status should change to cancelled
    const statusBadge = page.getByTestId(`booking-status-${pendingBooking.id}`)
    await expect(statusBadge).toHaveText(/cancelled/i, { timeout: 15000 })
    await expect(statusBadge).toHaveClass(/status-cancelled/)

    // Action buttons should be removed
    await expect(page.getByTestId(`booking-confirm-${pendingBooking.id}`)).not.toBeVisible()
    await expect(page.getByTestId(`booking-cancel-${pendingBooking.id}`)).not.toBeVisible()

    // Active bookings stat should decrease by 1
    await expect(page.getByTestId('stat-active-bookings')).toContainText(String(initialActive - 1), { timeout: 15000 })
  })

  test('Dismissing booking cancellation dialog keeps booking unchanged', async ({ page, request }) => {
    // Create a pending booking
    const pendingBooking = await createPendingBooking(
      request, PROP_LOFT, GUEST_EMMA, '2027-12-01', '2027-12-05', 2, 600
    )

    await goToBookingsTab(page)

    const row = page.getByTestId(`booking-row-${pendingBooking.id}`)
    await expect(row).toBeVisible({ timeout: 15000 })

    // Click Cancel to open dialog
    await page.getByTestId(`booking-cancel-${pendingBooking.id}`).click()
    await expect(page.getByTestId('cancel-booking-dialog')).toBeVisible({ timeout: 15000 })

    // Dismiss the dialog
    await page.getByTestId('cancel-booking-dialog-dismiss').click()

    // Dialog should close
    await expect(page.getByTestId('cancel-booking-dialog')).not.toBeVisible({ timeout: 15000 })

    // Booking status should remain pending
    const statusBadge = page.getByTestId(`booking-status-${pendingBooking.id}`)
    await expect(statusBadge).toHaveText(/pending/i)

    // Action buttons should still be visible
    await expect(page.getByTestId(`booking-confirm-${pendingBooking.id}`)).toBeVisible()
    await expect(page.getByTestId(`booking-cancel-${pendingBooking.id}`)).toBeVisible()
  })

  test('Host can cancel a confirmed booking', async ({ page }) => {
    await goToBookingsTab(page)

    // Use the seed confirmed Villa booking
    const statusBadge = page.getByTestId(`booking-status-${BOOKING_CONFIRMED_VILLA}`)
    await expect(statusBadge).toHaveText(/confirmed/i, { timeout: 15000 })

    // Capture initial active bookings stat
    const initialStatText = await page.getByTestId('stat-active-bookings').textContent()
    const initialActive = parseInt(initialStatText?.match(/\d+/)?.[0] || '0')

    // Click Cancel
    await page.getByTestId(`booking-cancel-${BOOKING_CONFIRMED_VILLA}`).click()
    await expect(page.getByTestId('cancel-booking-dialog')).toBeVisible({ timeout: 15000 })

    // Confirm the cancellation
    await page.getByTestId('cancel-booking-dialog-confirm').click()

    // Dialog should close
    await expect(page.getByTestId('cancel-booking-dialog')).not.toBeVisible({ timeout: 15000 })

    // Status should change to cancelled
    await expect(statusBadge).toHaveText(/cancelled/i, { timeout: 15000 })
    await expect(statusBadge).toHaveClass(/status-cancelled/)

    // Active bookings stat should decrease
    await expect(page.getByTestId('stat-active-bookings')).toContainText(String(initialActive - 1), { timeout: 15000 })
  })

  test('Confirm and cancel actions work on repeated use', async ({ page, request }) => {
    test.slow()

    // Create 3 pending bookings on different properties with non-overlapping dates
    const pending1 = await createPendingBooking(
      request, PROP_LOFT, GUEST_ALEX, '2028-01-01', '2028-01-05', 2, 600
    )
    const pending2 = await createPendingBooking(
      request, PROP_VILLA, GUEST_EMMA, '2028-02-01', '2028-02-05', 3, 900
    )
    const pending3 = await createPendingBooking(
      request, PROP_TOWNHOUSE, GUEST_ALEX, '2028-03-01', '2028-03-05', 2, 550
    )

    await goToBookingsTab(page)

    // Verify all 3 pending bookings are visible (plus 4 seed = 7 total)
    await expect(page.locator('[data-testid^="booking-row-"]')).toHaveCount(7, { timeout: 15000 })

    // 1. Confirm the first pending booking
    await page.getByTestId(`booking-confirm-${pending1.id}`).click()
    await expect(page.getByTestId(`booking-status-${pending1.id}`)).toHaveText(/confirmed/i, { timeout: 15000 })

    // 2. Cancel the second pending booking (with dialog)
    await page.getByTestId(`booking-cancel-${pending2.id}`).click()
    await expect(page.getByTestId('cancel-booking-dialog')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('cancel-booking-dialog-confirm').click()
    await expect(page.getByTestId('cancel-booking-dialog')).not.toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId(`booking-status-${pending2.id}`)).toHaveText(/cancelled/i, { timeout: 15000 })

    // 3. Confirm the third pending booking
    await page.getByTestId(`booking-confirm-${pending3.id}`).click()
    await expect(page.getByTestId(`booking-status-${pending3.id}`)).toHaveText(/confirmed/i, { timeout: 15000 })

    // Verify final states
    await expect(page.getByTestId(`booking-status-${pending1.id}`)).toHaveText(/confirmed/i)
    await expect(page.getByTestId(`booking-status-${pending2.id}`)).toHaveText(/cancelled/i)
    await expect(page.getByTestId(`booking-status-${pending3.id}`)).toHaveText(/confirmed/i)
  })
})
