import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// b1111111: Loft, $150/night, $75 cleaning, 4 max guests, host: Sarah (a1111111)
const PROPERTY_LOFT = 'b1111111-1111-1111-1111-111111111111'
// b3333333: Cabin, $200/night, $50 cleaning, 6 max guests, host: Mike (a2222222)
const PROPERTY_CABIN = 'b3333333-3333-3333-3333-333333333333'
// Guest user: Emma Wilson (a3333333)
const GUEST_EMAIL = 'emma@example.com'
// Host user: Sarah Chen (a1111111) — owns b1111111
const HOST_EMAIL = 'sarah@example.com'
const EMMA_ID = 'a3333333-3333-3333-3333-333333333333'

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

async function deleteAllBookings(page: import('@playwright/test').Page, guestId: string) {
  const res = await page.request.get(`/api/bookings?guest_id=${guestId}`)
  const bookings = await res.json()
  for (const booking of bookings) {
    await page.request.put(`/api/bookings/${booking.id}`, {
      data: { status: 'cancelled' },
    })
  }
}

test.describe('Property Detail - BookingCard', () => {
  test.beforeEach(async ({ request }) => {
    // Clean up any non-seed bookings created by Emma
    const res = await request.get(`/api/bookings?guest_id=${EMMA_ID}`)
    if (res.ok()) {
      const bookings = await res.json()
      const seedBookingIds = [
        'e1111111-1111-1111-1111-111111111111',
        'e2222222-2222-2222-2222-222222222222',
        'e3333333-3333-3333-3333-333333333333',
        'e4444444-4444-4444-4444-444444444444',
        'e5555555-5555-5555-5555-555555555555',
        'e6666666-6666-6666-6666-666666666666',
      ]
      for (const booking of bookings) {
        if (!seedBookingIds.includes(booking.id)) {
          await request.put(`/api/bookings/${booking.id}`, {
            data: { status: 'cancelled' },
          })
        }
      }
    }
  })

  test('Booking card displays price per night', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // $150 / night
    await expect(card).toContainText('$150')
    await expect(card).toContainText('/ night')
  })

  test('Booking card displays check-in and check-out date pickers', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    const checkin = page.getByTestId('booking-checkin')
    const checkout = page.getByTestId('booking-checkout')

    await expect(checkin).toBeVisible()
    await expect(checkout).toBeVisible()

    // Both should be date inputs and initially empty
    await expect(checkin).toHaveAttribute('type', 'date')
    await expect(checkout).toHaveAttribute('type', 'date')
    await expect(checkin).toHaveValue('')
    await expect(checkout).toHaveValue('')
  })

  test('Booking card displays guest count selector', async ({ page }) => {
    // b3333333: max_guests = 6
    await page.goto(`/properties/${PROPERTY_CABIN}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    const guestsButton = page.getByTestId('booking-guests')
    await expect(guestsButton).toBeVisible()

    // Open dropdown to see options
    await guestsButton.click()
    const dropdown = page.getByTestId('booking-guests-dropdown')
    await expect(dropdown).toBeVisible()

    // Should have options from 1 to 6
    const options = dropdown.locator('button')
    await expect(options).toHaveCount(6)

    // First option should be "1 guest"
    await expect(options.first()).toHaveText('1 guest')
    // Last option should be "6 guests"
    await expect(options.last()).toHaveText('6 guests')

    // Close dropdown
    await guestsButton.click()
  })

  test('Selecting dates and guests shows price breakdown', async ({ page }) => {
    // b1111111: $150/night, $75 cleaning fee
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Select check-in and check-out (3 nights)
    await page.getByTestId('booking-checkin').fill('2026-05-01')
    await page.getByTestId('booking-checkout').fill('2026-05-04')
    await page.getByTestId('booking-guests').click()
    await page.getByTestId('guest-option-2').click()

    // Price breakdown should appear
    const breakdown = page.getByTestId('price-breakdown')
    await expect(breakdown).toBeVisible()

    // $150 x 3 nights = $450
    await expect(breakdown).toContainText('$150 x 3 nights')
    await expect(breakdown).toContainText('$450')

    // Cleaning fee: $75
    await expect(breakdown).toContainText('Cleaning fee')
    await expect(breakdown).toContainText('$75')

    // Total: $525
    await expect(breakdown).toContainText('Total')
    await expect(breakdown).toContainText('$525')
  })

  test('Price breakdown updates when dates change', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Initial: 3 nights
    await page.getByTestId('booking-checkin').fill('2026-05-01')
    await page.getByTestId('booking-checkout').fill('2026-05-04')

    const breakdown = page.getByTestId('price-breakdown')
    await expect(breakdown).toContainText('$150 x 3 nights')
    await expect(breakdown).toContainText('$525')

    // Change to 5 nights
    await page.getByTestId('booking-checkout').fill('2026-05-06')

    // $150 x 5 nights = $750, Total: $825
    await expect(breakdown).toContainText('$150 x 5 nights')
    await expect(breakdown).toContainText('$750')
    await expect(breakdown).toContainText('$825')
  })

  test('Reserve button creates a booking when logged in', async ({ page }) => {
    test.slow()
    await loginAs(page, GUEST_EMAIL)

    // Clean up any existing bookings for this guest
    await deleteAllBookings(page, 'a3333333-3333-3333-3333-333333333333')

    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Select dates and guests
    await page.getByTestId('booking-checkin').fill('2026-07-01')
    await page.getByTestId('booking-checkout').fill('2026-07-04')
    await page.getByTestId('booking-guests').click()
    await page.getByTestId('guest-option-2').click()

    // Click Reserve
    const reserveBtn = page.getByTestId('reserve-button')
    await expect(reserveBtn).toBeEnabled()
    await reserveBtn.click()

    // Success message should appear
    await expect(page.getByTestId('booking-success')).toContainText('Booking confirmed', { timeout: 30000 })

    // Should redirect to /trips
    await expect(page).toHaveURL('/trips', { timeout: 30000 })
  })

  test('Reserve button is disabled when dates are not selected', async ({ page }) => {
    test.slow()
    await loginAs(page, GUEST_EMAIL)

    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // No dates selected - reserve button should be disabled
    const reserveBtn = page.getByTestId('reserve-button')
    await expect(reserveBtn).toBeVisible()
    await expect(reserveBtn).toBeDisabled()

    // Should show hint text
    await expect(card).toContainText('Select dates to book')
  })

  test('Reserve button prompts login when user is not logged in', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Not logged in - should show login prompt button
    const loginPrompt = page.getByTestId('booking-login-prompt')
    await expect(loginPrompt).toBeVisible()
    await expect(loginPrompt).toContainText('Log in to reserve')

    // Click login prompt
    await loginPrompt.click()

    // Should navigate to login page
    await expect(page).toHaveURL('/login', { timeout: 30000 })
  })

  test("Reserve button is disabled for host's own property", async ({ page }) => {
    test.slow()
    // Login as Sarah (host of b1111111)
    await loginAs(page, HOST_EMAIL)

    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Should show "You cannot book your own property" message
    const ownMessage = page.getByTestId('own-property-message')
    await expect(ownMessage).toBeVisible()
    await expect(ownMessage).toContainText('You cannot book your own property')

    // Reserve button should not be visible (replaced by own-property message)
    await expect(page.getByTestId('reserve-button')).not.toBeVisible()
  })

  test('Check-in date picker prevents selecting past dates', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    const checkin = page.getByTestId('booking-checkin')

    // The min attribute should be set to today's date
    const today = new Date().toISOString().split('T')[0]
    await expect(checkin).toHaveAttribute('min', today!)
  })

  test('Check-out date must be after check-in date', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Set check-in date
    await page.getByTestId('booking-checkin').fill('2026-05-01')

    // Check-out min should be set to check-in date or later
    const checkout = page.getByTestId('booking-checkout')
    await expect(checkout).toHaveAttribute('min', '2026-05-01')
  })

  test('Guest count cannot exceed property max_guests', async ({ page }) => {
    // b1111111: max_guests = 4
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    const guestsButton = page.getByTestId('booking-guests')
    await guestsButton.click()
    const dropdown = page.getByTestId('booking-guests-dropdown')
    const options = dropdown.locator('button')

    // Should have exactly 4 options (1-4)
    await expect(options).toHaveCount(4)

    // Last option value should be "4"
    await expect(options.last()).toHaveText('4 guests')

    // Close dropdown
    await guestsButton.click()
  })

  test('Guest count minimum is 1', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    const guestsButton = page.getByTestId('booking-guests')

    // Default display should show "1 guest"
    await expect(guestsButton).toContainText('1 guest')
    await expect(guestsButton).toHaveAttribute('data-value', '1')

    // Open dropdown to verify first option
    await guestsButton.click()
    const dropdown = page.getByTestId('booking-guests-dropdown')
    const options = dropdown.locator('button')
    await expect(options.first()).toHaveText('1 guest')

    // Close dropdown
    await guestsButton.click()
  })

  test('Reserve button shows error for unavailable dates', async ({ page }) => {
    test.slow()
    await loginAs(page, GUEST_EMAIL)

    // b2222222 has a confirmed booking for 2026-04-01 to 2026-04-07 (by Alex)
    await page.goto('/properties/b2222222-2222-2222-2222-222222222222')

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Select overlapping dates
    await page.getByTestId('booking-checkin').fill('2026-04-02')
    await page.getByTestId('booking-checkout').fill('2026-04-06')
    await page.getByTestId('booking-guests').click()
    await page.getByTestId('guest-option-2').click()

    // Click Reserve
    const reserveBtn = page.getByTestId('reserve-button')
    await expect(reserveBtn).toBeEnabled()
    await reserveBtn.click()

    // Should show error about unavailable dates
    const errorMsg = page.getByTestId('booking-error')
    await expect(errorMsg).toBeVisible({ timeout: 30000 })
    await expect(errorMsg).toContainText('not available')
  })

  test('Booking card date pickers and guest selector are functional on repeated use', async ({ page }) => {
    // b1111111: $150/night, $75 cleaning fee, 4 max guests
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    const checkin = page.getByTestId('booking-checkin')
    const checkout = page.getByTestId('booking-checkout')
    const guestsSelect = page.getByTestId('booking-guests')
    const breakdown = page.getByTestId('price-breakdown')

    // First selection: 2026-05-01 to 2026-05-04 (3 nights), 2 guests
    await checkin.fill('2026-05-01')
    await checkout.fill('2026-05-04')
    await guestsSelect.click()
    await page.getByTestId('guest-option-2').click()

    // $150 x 3 = $450 + $75 = $525
    await expect(breakdown).toContainText('$150 x 3 nights')
    await expect(breakdown).toContainText('$525')

    // Change dates: 2026-06-01 to 2026-06-05 (4 nights)
    await checkin.fill('2026-06-01')
    await checkout.fill('2026-06-05')

    // $150 x 4 = $600 + $75 = $675
    await expect(breakdown).toContainText('$150 x 4 nights')
    await expect(breakdown).toContainText('$675')

    // Change guests: 2 -> 4 -> 2
    await guestsSelect.click()
    await page.getByTestId('guest-option-4').click()
    await expect(guestsSelect).toHaveAttribute('data-value', '4')
    await guestsSelect.click()
    await page.getByTestId('guest-option-2').click()
    await expect(guestsSelect).toHaveAttribute('data-value', '2')

    // Price breakdown should still be correct after guest changes
    await expect(breakdown).toContainText('$150 x 4 nights')
    await expect(breakdown).toContainText('$675')

    // Final state verification
    await expect(checkin).toHaveValue('2026-06-01')
    await expect(checkout).toHaveValue('2026-06-05')
    await expect(guestsSelect).toHaveAttribute('data-value', '2')
  })

  test('Booking card is sticky on desktop viewport', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('booking-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Verify the card has sticky positioning
    const position = await card.evaluate((el) => {
      return window.getComputedStyle(el).position
    })
    expect(position).toBe('sticky')

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 1000))

    // Card should still be visible after scrolling
    await expect(card).toBeVisible()
    await expect(card).toBeInViewport()
  })
})
