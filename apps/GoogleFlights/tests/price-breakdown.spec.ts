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
 * Navigate to results, find a flight, then go to booking page.
 * Returns the flight ID.
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
    returnFlightId?: string
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

  // Use first card
  const firstCard = page.locator('[data-testid^="flight-card-main-"]').first()
  const testId = await firstCard.getAttribute('data-testid')
  const flightId = testId!.replace('flight-card-main-', '')

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
  await expect(page.getByTestId('price-breakdown')).toBeVisible({ timeout: 15000 })

  return flightId
}

test.describe('PriceBreakdown', () => {
  test('PriceBreakdown displays base fare per passenger', async ({ page }) => {
    // Navigate with 1 adult in economy
    await navigateToBookingPage(page, { adults: '1' })

    // The adults line item should be visible
    const adultsItem = page.getByTestId('price-breakdown-adults')
    await expect(adultsItem).toBeVisible()

    // Should show "Adult × 1"
    await expect(adultsItem).toContainText('Adult × 1')

    // Should show a price with "$" and "each"
    await expect(adultsItem).toContainText(/\$\d+/)
    await expect(adultsItem).toContainText('each')
  })

  test('PriceBreakdown displays taxes and fees', async ({ page }) => {
    await navigateToBookingPage(page, { adults: '1' })

    // Taxes line item should be visible and separate from base fare
    const taxesItem = page.getByTestId('price-breakdown-taxes')
    await expect(taxesItem).toBeVisible()
    await expect(taxesItem).toContainText('Taxes and fees')

    // Should show a dollar amount
    await expect(taxesItem).toContainText(/\$\d+\.\d{2}/)
  })

  test('PriceBreakdown displays total price', async ({ page }) => {
    await navigateToBookingPage(page, { adults: '1' })

    // Total should be visible and prominent
    const total = page.getByTestId('price-breakdown-total')
    await expect(total).toBeVisible()
    await expect(total).toContainText('Total')

    // Should show a dollar amount
    await expect(total).toContainText(/\$\d+\.\d{2}/)

    // Verify the total is the sum of base fare + taxes
    // Read the adult amount and taxes, then verify total
    const adultsItem = page.getByTestId('price-breakdown-adults')
    const adultsAmountEl = adultsItem.locator('.price-breakdown__item-amount')
    const adultsAmountText = await adultsAmountEl.textContent()
    const adultsAmount = parseFloat(adultsAmountText!.replace('$', ''))

    const taxesItem = page.getByTestId('price-breakdown-taxes')
    const taxesAmountEl = taxesItem.locator('.price-breakdown__item-amount')
    const taxesAmountText = await taxesAmountEl.textContent()
    const taxesAmount = parseFloat(taxesAmountText!.replace('$', ''))

    const totalEl = total.locator('.price-breakdown__total-amount')
    const totalText = await totalEl.textContent()
    const totalAmount = parseFloat(totalText!.replace('$', ''))

    expect(totalAmount).toBeCloseTo(adultsAmount + taxesAmount, 1)
  })

  test('PriceBreakdown shows per-passenger-type pricing for mixed group', async ({ page }) => {
    // Navigate with 2 adults, 1 child, 1 infant
    await navigateToBookingPage(page, {
      adults: '2',
      children: '1',
      infants: '1',
    })

    // Adults line
    const adultsItem = page.getByTestId('price-breakdown-adults')
    await expect(adultsItem).toBeVisible()
    await expect(adultsItem).toContainText('Adult × 2')
    await expect(adultsItem).toContainText('each')

    // Children line
    const childrenItem = page.getByTestId('price-breakdown-children')
    await expect(childrenItem).toBeVisible()
    await expect(childrenItem).toContainText('Child × 1')
    await expect(childrenItem).toContainText('each')

    // Infants line
    const infantsItem = page.getByTestId('price-breakdown-infants')
    await expect(infantsItem).toBeVisible()
    await expect(infantsItem).toContainText('Infant × 1')
    await expect(infantsItem).toContainText('each')

    // Taxes line
    await expect(page.getByTestId('price-breakdown-taxes')).toBeVisible()

    // Total should sum all passengers
    const total = page.getByTestId('price-breakdown-total')
    await expect(total).toBeVisible()
    await expect(total).toContainText(/\$\d+\.\d{2}/)

    // Verify total = adults_total + children_total + infants_total + taxes
    const adultsAmountText = await adultsItem.locator('.price-breakdown__item-amount').textContent()
    const childrenAmountText = await childrenItem.locator('.price-breakdown__item-amount').textContent()
    const infantsAmountText = await infantsItem.locator('.price-breakdown__item-amount').textContent()
    const taxesAmountText = await page.getByTestId('price-breakdown-taxes').locator('.price-breakdown__item-amount').textContent()
    const totalAmountText = await total.locator('.price-breakdown__total-amount').textContent()

    const adultsCost = parseFloat(adultsAmountText!.replace('$', ''))
    const childrenCost = parseFloat(childrenAmountText!.replace('$', ''))
    const infantsCost = parseFloat(infantsAmountText!.replace('$', ''))
    const taxesCost = parseFloat(taxesAmountText!.replace('$', ''))
    const totalCost = parseFloat(totalAmountText!.replace('$', ''))

    expect(totalCost).toBeCloseTo(adultsCost + childrenCost + infantsCost + taxesCost, 1)
  })

  test('PriceBreakdown updates for round-trip flights', async ({ page }) => {
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

    // Navigate to booking page with return flight
    await navigateToBookingPage(page, {
      adults: '1',
      returnFlightId: returnFlightId,
    })

    // Should show "Includes outbound + return flights" note
    const roundtripNote = page.getByTestId('price-breakdown-roundtrip')
    await expect(roundtripNote).toBeVisible()
    await expect(roundtripNote).toContainText('outbound + return')

    // Total should include both directions
    const total = page.getByTestId('price-breakdown-total')
    await expect(total).toBeVisible()
    await expect(total).toContainText(/\$\d+\.\d{2}/)

    // Verify total = adults_total + taxes (which includes both flights)
    const adultsAmountText = await page.getByTestId('price-breakdown-adults').locator('.price-breakdown__item-amount').textContent()
    const taxesAmountText = await page.getByTestId('price-breakdown-taxes').locator('.price-breakdown__item-amount').textContent()
    const totalAmountText = await total.locator('.price-breakdown__total-amount').textContent()

    const adultsCost = parseFloat(adultsAmountText!.replace('$', ''))
    const taxesCost = parseFloat(taxesAmountText!.replace('$', ''))
    const totalCost = parseFloat(totalAmountText!.replace('$', ''))

    expect(totalCost).toBeCloseTo(adultsCost + taxesCost, 1)
  })

  test('PriceBreakdown reflects selected cabin class pricing', async ({ page }) => {
    // Navigate with business class
    await navigateToBookingPage(page, { cabinClass: 'business' })

    // Cabin class should be displayed
    const cabin = page.getByTestId('price-breakdown-cabin')
    await expect(cabin).toBeVisible()
    await expect(cabin).toContainText('Business')

    // Get business class price
    const businessTotal = page.getByTestId('price-breakdown-total').locator('.price-breakdown__total-amount')
    const businessTotalText = await businessTotal.textContent()
    const businessPrice = parseFloat(businessTotalText!.replace('$', ''))

    // Navigate with economy class for comparison
    await navigateToBookingPage(page, { cabinClass: 'economy' })

    await expect(page.getByTestId('price-breakdown-cabin')).toContainText('Economy')

    const economyTotal = page.getByTestId('price-breakdown-total').locator('.price-breakdown__total-amount')
    const economyTotalText = await economyTotal.textContent()
    const economyPrice = parseFloat(economyTotalText!.replace('$', ''))

    // Business should be more expensive than economy
    expect(businessPrice).toBeGreaterThan(economyPrice)
  })
})
