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
 * Navigate to results, find a flight by flight number, extract its ID,
 * then navigate to the booking page for that flight.
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
    returnFlightId?: string
  } = {}
) {
  // Navigate to search results to get a flight ID
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
    // Find the card containing the specified flight number
    const card = page.locator('[data-testid^="flight-card-"]').filter({
      has: page.locator(`[data-testid^="flight-card-flightnum-"]`, { hasText: new RegExp(`^${options.flightNumber}$`) })
    }).locator('[data-testid^="flight-card-main-"]')
    await expect(card).toBeVisible({ timeout: 10000 })
    const testId = await card.getAttribute('data-testid')
    flightId = testId!.replace('flight-card-main-', '')
  } else {
    // Use first card
    const firstCard = page.locator('[data-testid^="flight-card-main-"]').first()
    const testId = await firstCard.getAttribute('data-testid')
    flightId = testId!.replace('flight-card-main-', '')
  }

  // Build booking URL
  const bookingParams = new URLSearchParams({
    cabin: options.cabinClass ?? 'economy',
    adults: options.adults ?? '1',
    children: options.children ?? '0',
    infants: options.infants ?? '0',
  })
  if (options.returnFlightId) {
    bookingParams.set('returnFlight', options.returnFlightId)
  }

  await page.goto(`/booking/${flightId}?${bookingParams.toString()}`)
  await expect(page.getByTestId('flight-details-page')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('flight-summary')).toBeVisible({ timeout: 15000 })

  return flightId
}

test.describe('FlightSummary', () => {
  test('FlightSummary displays full outbound itinerary', async ({ page }) => {
    // Navigate to a nonstop LAX→JFK flight (DL200: Delta, 5h 30m)
    await navigateToBookingPage(page, { flightNumber: 'DL200' })

    // Verify the flight summary header shows the route
    const header = page.getByTestId('flight-summary-header')
    await expect(header).toBeVisible()
    await expect(header).toContainText('LAX')
    await expect(header).toContainText('JFK')

    // Verify duration
    await expect(page.getByTestId('flight-summary-duration')).toContainText('5h 30m')

    // Verify stops (nonstop)
    await expect(page.getByTestId('flight-summary-stops')).toContainText('Nonstop')

    // Verify the leg details
    const leg = page.getByTestId('flight-summary-leg-1')
    await expect(leg).toBeVisible()

    // Airline name
    await expect(page.getByTestId('flight-summary-airline-1')).toContainText('Delta Air Lines')

    // Flight number
    await expect(page.getByTestId('flight-summary-flightnum-1')).toContainText('DL200')

    // Departure and arrival times should be visible and contain AM/PM
    await expect(page.getByTestId('flight-summary-dep-time-1')).toContainText(/[AP]M/)
    await expect(page.getByTestId('flight-summary-arr-time-1')).toContainText(/[AP]M/)

    // Terminal info (seed data adds T1/T2 for single-leg flights)
    await expect(page.getByTestId('flight-summary-dep-terminal-1')).toContainText('Terminal')
    await expect(page.getByTestId('flight-summary-arr-terminal-1')).toContainText('Terminal')

    // Label shows outbound
    await expect(page.getByTestId('flight-summary-label')).toContainText('Outbound')
    await expect(page.getByTestId('flight-summary-label')).toContainText('LAX → JFK')
  })

  test('FlightSummary displays outbound and return flights for round trip', async ({ page }) => {
    // First, get a return flight ID from JFK→LAX results
    await page.goto(buildResultsUrl({
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2026-04-08',
    }))
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    const returnCard = page.locator('[data-testid^="flight-card-main-"]').first()
    const returnTestId = await returnCard.getAttribute('data-testid')
    const returnFlightId = returnTestId!.replace('flight-card-main-', '')

    // Now get an outbound flight ID from LAX→JFK results
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    const outboundCard = page.locator('[data-testid^="flight-card-main-"]').first()
    const outboundTestId = await outboundCard.getAttribute('data-testid')
    const outboundFlightId = outboundTestId!.replace('flight-card-main-', '')

    // Navigate to booking page with both outbound and return flights
    const bookingParams = new URLSearchParams({
      cabin: 'economy',
      adults: '1',
      children: '0',
      infants: '0',
      returnFlight: returnFlightId,
    })
    await page.goto(`/booking/${outboundFlightId}?${bookingParams.toString()}`)
    await expect(page.getByTestId('flight-details-page')).toBeVisible({ timeout: 15000 })

    // Wait for both flight summaries to appear
    const summaries = page.getByTestId('flight-summary')
    await expect(summaries).toHaveCount(2, { timeout: 15000 })

    // First summary should be outbound (LAX→JFK)
    const labels = page.getByTestId('flight-summary-label')
    await expect(labels.first()).toContainText('Outbound')
    await expect(labels.first()).toContainText('LAX')
    await expect(labels.first()).toContainText('JFK')

    // Second summary should be return (JFK→LAX)
    await expect(labels.nth(1)).toContainText('Return')
    await expect(labels.nth(1)).toContainText('JFK')
    await expect(labels.nth(1)).toContainText('LAX')
  })

  test('FlightSummary displays connecting flight with multiple legs', async ({ page }) => {
    // AA101: LAX→DFW→JFK, 1 stop, 7h
    await navigateToBookingPage(page, { flightNumber: 'AA101' })

    // Should show 1 stop
    await expect(page.getByTestId('flight-summary-stops')).toContainText('1 stop')

    // Should show total duration 7h
    await expect(page.getByTestId('flight-summary-duration')).toContainText('7h')

    // Leg 1: LAX → DFW
    const leg1 = page.getByTestId('flight-summary-leg-1')
    await expect(leg1).toBeVisible({ timeout: 10000 })
    await expect(leg1).toContainText('LAX')
    await expect(leg1).toContainText('DFW')

    // Verify departure terminal on leg 1
    await expect(page.getByTestId('flight-summary-dep-terminal-1')).toContainText('T4')
    await expect(page.getByTestId('flight-summary-arr-terminal-1')).toContainText('TC')

    // Layover indicator between legs
    const layover = page.getByTestId('flight-summary-layover-1')
    await expect(layover).toBeVisible()
    await expect(layover).toContainText('layover')
    await expect(layover).toContainText('DFW')

    // Leg 2: DFW → JFK
    const leg2 = page.getByTestId('flight-summary-leg-2')
    await expect(leg2).toBeVisible()
    await expect(leg2).toContainText('DFW')
    await expect(leg2).toContainText('JFK')

    // Verify terminals on leg 2
    await expect(page.getByTestId('flight-summary-dep-terminal-2')).toContainText('TC')
    await expect(page.getByTestId('flight-summary-arr-terminal-2')).toContainText('T8')
  })

  test('FlightSummary shows total duration and stops count', async ({ page }) => {
    // Test with nonstop flight first
    await navigateToBookingPage(page, { flightNumber: 'AA100' })

    await expect(page.getByTestId('flight-summary-duration')).toContainText('5h 30m')
    await expect(page.getByTestId('flight-summary-stops')).toContainText('Nonstop')

    // Now test with 1-stop flight
    await navigateToBookingPage(page, { flightNumber: 'AA101' })

    await expect(page.getByTestId('flight-summary-duration')).toContainText('7h')
    await expect(page.getByTestId('flight-summary-stops')).toContainText('1 stop')
  })

  test('FlightSummary shows overnight arrival indicator', async ({ page }) => {
    // BA100: JFK→LHR departs 19:00, arrives 07:00 next day (+1)
    await navigateToBookingPage(page, {
      origin: 'JFK',
      destination: 'LHR',
      flightNumber: 'BA100',
    })

    // Overnight indicator should be visible
    const overnightNote = page.getByTestId('flight-summary-overnight')
    await expect(overnightNote).toBeVisible()
    await expect(overnightNote).toContainText('+1')

    // The +1 day indicator should also show on the leg arrival time
    const dayIndicator = page.getByTestId('flight-summary-day-1')
    await expect(dayIndicator).toBeVisible()
    await expect(dayIndicator).toContainText('+1')
  })

  test('FlightSummary shows aircraft type and amenities', async ({ page }) => {
    // B6400: LAX→JFK, Airbus A321, wifi=true, power=true, entertainment=false
    await navigateToBookingPage(page, { flightNumber: 'B6400' })

    // Aircraft type should be displayed
    await expect(page.getByTestId('flight-summary-aircraft-1')).toContainText('Airbus A321')

    // Amenities section
    const amenities = page.getByTestId('flight-summary-amenities')
    await expect(amenities).toBeVisible()

    // Wi-Fi should be shown
    await expect(page.getByTestId('flight-summary-wifi')).toBeVisible()
    await expect(page.getByTestId('flight-summary-wifi')).toContainText('Wi-Fi')

    // Power should be shown
    await expect(page.getByTestId('flight-summary-power')).toBeVisible()
    await expect(page.getByTestId('flight-summary-power')).toContainText('Power')

    // Entertainment should NOT be shown (has_entertainment=false)
    await expect(page.getByTestId('flight-summary-entertainment')).not.toBeVisible()
  })

  test('FlightSummary shows baggage allowance', async ({ page }) => {
    // Economy flight: "1 carry-on bag, 1 personal item"
    await navigateToBookingPage(page, { cabinClass: 'economy' })

    const baggage = page.getByTestId('flight-summary-baggage')
    await expect(baggage).toBeVisible()
    await expect(baggage).toContainText('1 carry-on bag, 1 personal item')

    // Premium economy: "1 carry-on bag, 1 checked bag included"
    await navigateToBookingPage(page, { cabinClass: 'premium_economy' })
    await expect(page.getByTestId('flight-summary-baggage')).toContainText('1 carry-on bag, 1 checked bag included')

    // Business: "2 carry-on bags, 2 checked bags included"
    await navigateToBookingPage(page, { cabinClass: 'business' })
    await expect(page.getByTestId('flight-summary-baggage')).toContainText('2 carry-on bags, 2 checked bags included')
  })
})
