import { test, expect } from '@playwright/test'

/**
 * Helper to build a results page URL with search parameters.
 */
function buildResultsUrl(params?: {
  origin?: string
  destination?: string
  departureDate?: string
  cabinClass?: string
}): string {
  const sp = new URLSearchParams({
    origin: params?.origin ?? 'LAX',
    destination: params?.destination ?? 'JFK',
    departureDate: params?.departureDate ?? '2026-04-01',
    tripType: 'round_trip',
    cabinClass: params?.cabinClass ?? 'economy',
    adults: '1',
    children: '0',
    infants: '0',
    returnDate: '2026-04-08',
  })
  return `/results?${sp.toString()}`
}

test.describe('FlightResultCard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })
  })

  test('FlightResultCard displays airline info', async ({ page }) => {
    // Verify a flight card shows airline logo (colored circle with initials) and name
    const logo = page.locator('[data-testid^="flight-card-logo-"]').first()
    await expect(logo).toBeVisible()
    // Logo should have airline initials text
    const logoText = await logo.textContent()
    expect(logoText!.length).toBeGreaterThan(0)

    const airlineName = page.locator('[data-testid^="flight-card-airline-"]').first()
    await expect(airlineName).toBeVisible()
    const nameText = await airlineName.textContent()
    expect(nameText!.length).toBeGreaterThan(0)
  })

  test('FlightResultCard displays departure and arrival times', async ({ page }) => {
    const departure = page.locator('[data-testid^="flight-card-departure-"]').first()
    const arrival = page.locator('[data-testid^="flight-card-arrival-"]').first()

    await expect(departure).toBeVisible()
    await expect(arrival).toBeVisible()

    // Times should contain AM or PM
    await expect(departure).toContainText(/[AP]M/)
    await expect(arrival).toContainText(/[AP]M/)
  })

  test('FlightResultCard displays flight duration', async ({ page }) => {
    const duration = page.locator('[data-testid^="flight-card-duration-"]').first()
    await expect(duration).toBeVisible()
    // Duration should be in format like "5h 30m" or "7h"
    await expect(duration).toContainText(/\d+h/)
  })

  test('FlightResultCard displays stops and layover info', async ({ page }) => {
    // Check nonstop flight shows "Nonstop"
    const nonstopLabel = page.locator('[data-testid^="flight-card-stops-"]').filter({ hasText: /^Nonstop$/ })
    await expect(nonstopLabel.first()).toBeVisible()

    // Check connecting flight shows "1 stop · DFW"
    const connectingLabel = page.locator('[data-testid^="flight-card-stops-"]').filter({ hasText: /1 stop/ })
    await expect(connectingLabel).toHaveCount(1)
    await expect(connectingLabel).toContainText('1 stop · DFW')
  })

  test('FlightResultCard displays price prominently', async ({ page }) => {
    const price = page.locator('[data-testid^="flight-card-price-"]').first()
    await expect(price).toBeVisible()
    // Price should start with $
    await expect(price).toContainText(/\$\d+/)
  })

  test('FlightResultCard displays CO2 emissions', async ({ page }) => {
    const co2 = page.locator('[data-testid^="flight-card-co2-"]').first()
    await expect(co2).toBeVisible()
    await expect(co2).toContainText(/\d+ kg CO₂/)
  })

  test('FlightResultCard expand to show details', async ({ page }) => {
    // Click first card to expand
    const firstCardMain = page.locator('[data-testid^="flight-card-main-"]').first()
    await firstCardMain.click()

    // Get flight ID from the testid
    const mainTestId = await firstCardMain.getAttribute('data-testid')
    const flightId = mainTestId!.replace('flight-card-main-', '')

    // Details section should appear with amenities, baggage, and select button
    await expect(page.getByTestId(`flight-card-details-${flightId}`)).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId(`flight-card-amenities-${flightId}`)).toBeVisible()
    await expect(page.getByTestId(`flight-card-baggage-${flightId}`)).toBeVisible()
    await expect(page.getByTestId(`flight-card-select-${flightId}`)).toBeVisible()
  })

  test('FlightResultCard collapse details', async ({ page }) => {
    // Expand first card
    const firstCardMain = page.locator('[data-testid^="flight-card-main-"]').first()
    await firstCardMain.click()

    const mainTestId = await firstCardMain.getAttribute('data-testid')
    const flightId = mainTestId!.replace('flight-card-main-', '')
    await expect(page.getByTestId(`flight-card-details-${flightId}`)).toBeVisible({ timeout: 10000 })

    // Collapse by clicking again
    await firstCardMain.click()
    await expect(page.getByTestId(`flight-card-details-${flightId}`)).not.toBeVisible()
  })

  test('FlightResultCard details show leg-by-leg breakdown', async ({ page }) => {
    // Find and expand the connecting flight (1 stop)
    const connectingCardMain = page.locator('[data-testid^="flight-card-main-"]').filter({
      has: page.locator('[data-testid^="flight-card-stops-"]', { hasText: /1 stop/ })
    })
    await connectingCardMain.click()

    // Get the flight ID
    const mainTestId = await connectingCardMain.getAttribute('data-testid')
    const flightId = mainTestId!.replace('flight-card-main-', '')

    // Wait for details and legs to load
    await expect(page.getByTestId(`flight-card-details-${flightId}`)).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId(`flight-card-leg-${flightId}-1`)).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId(`flight-card-leg-${flightId}-2`)).toBeVisible()

    // Should show layover info between legs
    const layover = page.getByTestId(`flight-card-layover-${flightId}-1`)
    await expect(layover).toBeVisible()
    await expect(layover).toContainText('layover')
    await expect(layover).toContainText('DFW')

    // Each leg should show origin and destination airports
    const leg1 = page.getByTestId(`flight-card-leg-${flightId}-1`)
    await expect(leg1).toContainText('LAX')
    await expect(leg1).toContainText('DFW')

    const leg2 = page.getByTestId(`flight-card-leg-${flightId}-2`)
    await expect(leg2).toContainText('DFW')
    await expect(leg2).toContainText('JFK')
  })

  test('FlightResultCard details show amenities icons', async ({ page }) => {
    // Expand a card (most LAX→JFK flights have wifi, power, entertainment)
    const firstCardMain = page.locator('[data-testid^="flight-card-main-"]').first()
    await firstCardMain.click()

    const mainTestId = await firstCardMain.getAttribute('data-testid')
    const flightId = mainTestId!.replace('flight-card-main-', '')

    await expect(page.getByTestId(`flight-card-details-${flightId}`)).toBeVisible({ timeout: 10000 })

    // Amenities section should be visible with at least one amenity
    const amenities = page.getByTestId(`flight-card-amenities-${flightId}`)
    await expect(amenities).toBeVisible()

    // Check for amenity items (Wi-Fi, Power, Entertainment)
    const amenityItems = amenities.locator('.flight-card__amenity')
    const count = await amenityItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('FlightResultCard details show baggage allowance', async ({ page }) => {
    const firstCardMain = page.locator('[data-testid^="flight-card-main-"]').first()
    await firstCardMain.click()

    const mainTestId = await firstCardMain.getAttribute('data-testid')
    const flightId = mainTestId!.replace('flight-card-main-', '')

    await expect(page.getByTestId(`flight-card-details-${flightId}`)).toBeVisible({ timeout: 10000 })

    // Baggage info should be visible (economy: "1 carry-on bag, 1 personal item")
    const baggage = page.getByTestId(`flight-card-baggage-${flightId}`)
    await expect(baggage).toBeVisible()
    await expect(baggage).toContainText('carry-on')
  })

  test('FlightResultCard overnight flight shows plus 1 day indicator', async ({ page }) => {
    // Navigate to JFK→LHR which has overnight flights (BA100, AA700 both arrive next day)
    await page.goto(buildResultsUrl({ origin: 'JFK', destination: 'LHR' }))
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    // All JFK→LHR flights arrive the next day, so +1 indicator should be present
    const dayIndicator = page.locator('[data-testid^="flight-card-day-"]').first()
    await expect(dayIndicator).toBeVisible()
    await expect(dayIndicator).toContainText('+1')
  })

  test('FlightResultCard clicking Select navigates to booking page', async ({ page }) => {
    // Expand first card
    const firstCardMain = page.locator('[data-testid^="flight-card-main-"]').first()
    await firstCardMain.click()

    const mainTestId = await firstCardMain.getAttribute('data-testid')
    const flightId = mainTestId!.replace('flight-card-main-', '')

    await expect(page.getByTestId(`flight-card-details-${flightId}`)).toBeVisible({ timeout: 10000 })

    // Click Select button
    await page.getByTestId(`flight-card-select-${flightId}`).click()

    // Should navigate to booking page with the flight ID in the URL
    await expect(page).toHaveURL(new RegExp(`/booking/${flightId}`))
  })

  test('FlightResultCard expand and collapse multiple cards', async ({ page }) => {
    const cards = page.locator('[data-testid^="flight-card-main-"]')
    const cardA = cards.nth(0)
    const cardB = cards.nth(1)

    // Get IDs
    const idA = (await cardA.getAttribute('data-testid'))!.replace('flight-card-main-', '')
    const idB = (await cardB.getAttribute('data-testid'))!.replace('flight-card-main-', '')

    // Expand card A
    await cardA.click()
    await expect(page.getByTestId(`flight-card-details-${idA}`)).toBeVisible({ timeout: 10000 })

    // Expand card B
    await cardB.click()
    await expect(page.getByTestId(`flight-card-details-${idB}`)).toBeVisible({ timeout: 10000 })

    // Both should be expanded
    await expect(page.getByTestId(`flight-card-details-${idA}`)).toBeVisible()
    await expect(page.getByTestId(`flight-card-details-${idB}`)).toBeVisible()

    // Collapse card A
    await cardA.click()
    await expect(page.getByTestId(`flight-card-details-${idA}`)).not.toBeVisible()

    // Card B should still be expanded
    await expect(page.getByTestId(`flight-card-details-${idB}`)).toBeVisible()
  })
})
