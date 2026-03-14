import { test, expect } from '@playwright/test'

/**
 * Helper to build a results page URL with search parameters.
 */
function buildResultsUrl(params?: {
  origin?: string
  destination?: string
  departureDate?: string
  cabinClass?: string
  adults?: string
  children?: string
  infants?: string
  returnDate?: string
}): string {
  const sp = new URLSearchParams({
    origin: params?.origin ?? 'LAX',
    destination: params?.destination ?? 'JFK',
    departureDate: params?.departureDate ?? '2026-04-01',
    tripType: 'round_trip',
    cabinClass: params?.cabinClass ?? 'economy',
    adults: params?.adults ?? '1',
    children: params?.children ?? '0',
    infants: params?.infants ?? '0',
    returnDate: params?.returnDate ?? '2026-04-08',
  })
  return `/results?${sp.toString()}`
}

/**
 * Navigate to results, find a flight, then navigate to the booking page.
 */
async function navigateToBookingPage(
  page: import('@playwright/test').Page,
  options: {
    origin?: string
    destination?: string
    departureDate?: string
    cabinClass?: string
    adults?: string
    children?: string
    infants?: string
    returnDate?: string
    flightNumber?: string
  } = {}
) {
  await page.goto(buildResultsUrl({
    origin: options.origin,
    destination: options.destination,
    departureDate: options.departureDate,
    cabinClass: options.cabinClass,
    adults: options.adults,
    children: options.children,
    infants: options.infants,
    returnDate: options.returnDate,
  }))
  await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

  let flightId: string

  if (options.flightNumber) {
    const card = page.locator('[data-testid^="flight-card-"]').filter({
      has: page.locator('[data-testid^="flight-card-flightnum-"]', { hasText: new RegExp(`^${options.flightNumber}$`) })
    }).locator('[data-testid^="flight-card-main-"]')
    await expect(card).toBeVisible({ timeout: 10000 })
    const testId = await card.getAttribute('data-testid')
    flightId = testId!.replace('flight-card-main-', '')
  } else {
    const firstCard = page.locator('[data-testid^="flight-card-main-"]').first()
    const testId = await firstCard.getAttribute('data-testid')
    flightId = testId!.replace('flight-card-main-', '')
  }

  const bookingParams = new URLSearchParams({
    cabin: options.cabinClass ?? 'economy',
    adults: options.adults ?? '1',
    children: options.children ?? '0',
    infants: options.infants ?? '0',
  })

  await page.goto(`/booking/${flightId}?${bookingParams.toString()}`)
  await expect(page.getByTestId('flight-details-page')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('passenger-form')).toBeVisible({ timeout: 15000 })

  return flightId
}

/**
 * Fill in passenger form with valid data for a single adult passenger.
 */
async function fillPassengerForm(page: import('@playwright/test').Page, index = 0) {
  const uniqueSuffix = Date.now()
  await page.getByTestId(`passenger-firstname-${index}`).fill(`John${uniqueSuffix}`)
  await page.getByTestId(`passenger-lastname-${index}`).fill(`Doe${uniqueSuffix}`)
  await page.getByTestId(`passenger-dob-${index}`).fill('1990-01-15')
  await page.getByTestId(`passenger-gender-${index}`).click()
  await page.getByTestId(`passenger-gender-option-${index}-male`).click()

  // Only fill contact fields for primary passenger
  if (index === 0) {
    await page.getByTestId(`passenger-email-${index}`).fill(`john${uniqueSuffix}@example.com`)
    await page.getByTestId(`passenger-phone-${index}`).fill('+1 555-123-4567')
  }
}

test.describe('BookingAction', () => {
  test('BookingAction displays Book Flight button', async ({ page }) => {
    await navigateToBookingPage(page)

    const bookButton = page.getByTestId('booking-button')
    await expect(bookButton).toBeVisible()
    await expect(bookButton).toHaveText('Book Flight')
    await expect(bookButton).toBeEnabled()
  })

  test('BookingAction successfully books a flight', async ({ page }) => {
    await navigateToBookingPage(page, { flightNumber: 'AA100' })

    await fillPassengerForm(page, 0)

    // Click Book Flight
    await page.getByTestId('booking-button').click()

    // Should show confirmation
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('booking-confirmation')).toContainText('Booking Confirmed')

    // Should show a booking reference
    const refElement = page.getByTestId('booking-reference')
    await expect(refElement).toBeVisible()
    await expect(refElement).toContainText(/GF-[A-Z0-9]{6}/)
  })

  test('BookingAction shows booking reference number', async ({ page }) => {
    await navigateToBookingPage(page)

    await fillPassengerForm(page, 0)
    await page.getByTestId('booking-button').click()

    // Wait for confirmation
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({ timeout: 30000 })

    // Reference should be prominently displayed with GF- prefix
    const refElement = page.getByTestId('booking-reference')
    await expect(refElement).toBeVisible()
    await expect(refElement).toContainText('Your booking reference:')
    await expect(refElement).toContainText(/GF-[A-Z0-9]{6}/)
  })

  test('BookingAction prevents double booking', async ({ page }) => {
    await navigateToBookingPage(page)

    await fillPassengerForm(page, 0)
    await page.getByTestId('booking-button').click()

    // Wait for confirmation
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({ timeout: 30000 })

    // The "Book Flight" button should no longer be visible (replaced by confirmation)
    await expect(page.getByTestId('booking-button')).not.toBeVisible()
  })

  test('BookingAction shows loading state during submission', async ({ page }) => {
    await navigateToBookingPage(page)

    await fillPassengerForm(page, 0)

    const bookButton = page.getByTestId('booking-button')

    // Click to submit
    await bookButton.click()

    // The button should show "Booking..." text and be disabled during submission
    // Use a short timeout since this is a transient state
    await expect(bookButton).toBeDisabled({ timeout: 5000 })

    // Eventually should show confirmation
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({ timeout: 30000 })
  })

  test('BookingAction booking appears in My Trips', async ({ page }) => {
    test.slow()

    // Navigate to booking page for a specific flight
    await navigateToBookingPage(page, { flightNumber: 'DL200' })

    await fillPassengerForm(page, 0)

    // Book the flight
    await page.getByTestId('booking-button').click()
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({ timeout: 30000 })

    // Get the booking reference
    const refText = await page.getByTestId('booking-reference').textContent()
    const refMatch = refText?.match(/GF-[A-Z0-9]{6}/)
    expect(refMatch).toBeTruthy()
    const bookingReference = refMatch![0]

    // Navigate to My Trips page
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })

    // The upcoming list should contain the booking
    const upcomingList = page.getByTestId('trips-upcoming-list')
    await expect(upcomingList).toBeVisible({ timeout: 15000 })

    // Find the trip card containing the booking reference
    const tripCard = upcomingList.locator('[data-testid^="trip-card-"]').filter({
      has: page.locator('[data-testid^="trip-card-ref-"]', { hasText: bookingReference })
    })
    await expect(tripCard).toBeVisible({ timeout: 15000 })

    // Verify route shows LAX → JFK
    const routeEl = tripCard.locator('[data-testid^="trip-card-route-"]')
    await expect(routeEl).toContainText('LAX')
    await expect(routeEl).toContainText('JFK')

    // Verify status is Confirmed
    const statusEl = tripCard.locator('[data-testid^="trip-card-status-"]')
    await expect(statusEl).toHaveText('Confirmed')

    // Verify the booking reference is displayed
    const refEl = tripCard.locator('[data-testid^="trip-card-ref-"]')
    await expect(refEl).toContainText(bookingReference)
  })
})
