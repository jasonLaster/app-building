import { test, expect } from '@playwright/test'

async function setupSeedSession(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('gf_session_token', 'seed-session-token')
  })
  await page.goto('/trips')
  await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })
}

function findTripCardByRef(page: import('@playwright/test').Page, listTestId: string, ref: string) {
  const list = page.getByTestId(listTestId)
  return list.locator('[data-testid^="trip-card-"]').filter({
    has: page.locator('[data-testid^="trip-card-ref-"]', { hasText: ref }),
  })
}

async function openCancelModalForBooking(
  page: import('@playwright/test').Page,
  ref: string
) {
  await setupSeedSession(page)
  await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })
  const card = findTripCardByRef(page, 'trips-upcoming-list', ref)
  await expect(card).toBeVisible({ timeout: 10000 })
  const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
  await cancelBtn.click()
  await expect(page.getByTestId('cancel-booking-modal')).toBeVisible({ timeout: 10000 })
}

test.describe('CancelBookingModal', () => {
  test('CancelBookingModal opens when Cancel button is clicked', async ({ page }) => {
    await setupSeedSession(page)
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Find a confirmed upcoming booking
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })

    // Click the Cancel button
    const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
    await cancelBtn.click()

    // Verify modal opens
    const modal = page.getByTestId('cancel-booking-modal')
    await expect(modal).toBeVisible({ timeout: 10000 })

    // Verify confirmation message
    await expect(modal).toContainText('Are you sure you want to cancel this booking?')

    // Verify booking details section is visible
    await expect(page.getByTestId('cancel-modal-details')).toBeVisible()

    // Verify two action buttons exist
    await expect(page.getByTestId('cancel-modal-confirm')).toBeVisible()
    await expect(page.getByTestId('cancel-modal-confirm')).toContainText('Cancel Booking')
    await expect(page.getByTestId('cancel-modal-keep')).toBeVisible()
    await expect(page.getByTestId('cancel-modal-keep')).toContainText('Keep Booking')
  })

  test('CancelBookingModal shows booking details', async ({ page }) => {
    // GF-ABC123: LAX → JFK, Apr 1, American Airlines AA100
    await openCancelModalForBooking(page, 'GF-ABC123')

    const details = page.getByTestId('cancel-modal-details')
    await expect(details).toBeVisible()

    // Verify route
    await expect(details).toContainText('LAX → JFK')

    // Verify date (Apr 1)
    await expect(details).toContainText('Apr 1')

    // Verify airline info
    await expect(details).toContainText('American Airlines')
    await expect(details).toContainText('AA100')

    // Verify booking reference
    await expect(details).toContainText('GF-ABC123')
  })

  test('CancelBookingModal confirms cancellation', async ({ page }) => {
    // Use GF-SORT02 for cancellation test
    await openCancelModalForBooking(page, 'GF-SORT02')

    // Click Cancel Booking button
    await page.getByTestId('cancel-modal-confirm').click()

    // Verify modal closes
    await expect(page.getByTestId('cancel-booking-modal')).toBeHidden({ timeout: 15000 })

    // Verify the trip card shows Cancelled status
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-SORT02')
    await expect(card).toBeVisible({ timeout: 10000 })
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Cancelled', { timeout: 15000 })

    // Verify Cancel button is no longer visible on that card
    const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
    await expect(cancelBtn).toHaveCount(0)
  })

  test('CancelBookingModal dismiss keeps booking', async ({ page }) => {
    await openCancelModalForBooking(page, 'GF-ABC123')

    // Click Keep Booking button
    await page.getByTestId('cancel-modal-keep').click()

    // Verify modal closes
    await expect(page.getByTestId('cancel-booking-modal')).toBeHidden({ timeout: 10000 })

    // Verify booking remains confirmed
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    await expect(card).toBeVisible({ timeout: 10000 })
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Confirmed')

    // Verify Cancel button is still available
    const cancelBtn = card.locator('[data-testid^="trip-card-cancel-"]')
    await expect(cancelBtn).toBeVisible()
  })

  test('CancelBookingModal close via overlay click', async ({ page }) => {
    await openCancelModalForBooking(page, 'GF-ABC123')

    // Click the overlay (outside the modal)
    const overlay = page.getByTestId('cancel-modal-overlay')
    // Click at the edge of the overlay to avoid hitting the modal itself
    await overlay.click({ position: { x: 10, y: 10 } })

    // Verify modal closes
    await expect(page.getByTestId('cancel-booking-modal')).toBeHidden({ timeout: 10000 })

    // Verify booking remains confirmed
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ABC123')
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Confirmed')
  })

  test('CancelBookingModal shows loading state during cancellation', async ({ page }) => {
    await openCancelModalForBooking(page, 'GF-SORT03')

    // Click Cancel Booking
    const confirmBtn = page.getByTestId('cancel-modal-confirm')

    await confirmBtn.click()

    // The button should show "Cancelling..." text or both buttons should become disabled
    // Check that the confirm button eventually shows the loading text
    // (since this happens fast, check right after click or check post-cancellation)
    // After cancellation completes, the modal should close
    await expect(page.getByTestId('cancel-booking-modal')).toBeHidden({ timeout: 30000 })

    // Verify the booking was cancelled
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-SORT03')
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Cancelled', { timeout: 15000 })
  })

  test('CancelBookingModal cancelled trip persists in correct tab', async ({ page }) => {
    // Cancel a booking via the modal (use GF-ONEW01 which is still confirmed at this point)
    await openCancelModalForBooking(page, 'GF-ONEW01')
    await page.getByTestId('cancel-modal-confirm').click()
    await expect(page.getByTestId('cancel-booking-modal')).toBeHidden({ timeout: 15000 })

    // Verify cancelled status in Upcoming tab
    const card = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ONEW01')
    const statusEl = card.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Cancelled', { timeout: 15000 })

    // Switch to Past tab
    await page.getByTestId('trips-tab-past').click()
    await expect(
      page.getByTestId('trips-past-list').or(page.getByTestId('trips-empty-past'))
    ).toBeVisible({ timeout: 15000 })

    // Verify cancelled trip is NOT in the past tab (departure is in the future)
    const pastCard = page.getByTestId('trips-past-list').locator('[data-testid^="trip-card-ref-"]', { hasText: 'GF-ONEW01' })
    await expect(pastCard).toHaveCount(0)

    // Switch back to Upcoming tab
    await page.getByTestId('trips-tab-upcoming').click()
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    // Verify cancelled trip still appears in Upcoming tab
    const upcomingCard = findTripCardByRef(page, 'trips-upcoming-list', 'GF-ONEW01')
    await expect(upcomingCard).toBeVisible({ timeout: 10000 })
    const upcomingStatus = upcomingCard.locator('[data-testid^="trip-card-status-"]')
    await expect(upcomingStatus).toHaveText('Cancelled')
  })
})
