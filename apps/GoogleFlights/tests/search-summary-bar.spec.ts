import { test, expect } from '@playwright/test'

/**
 * Helper to build a results page URL with search parameters.
 */
function buildResultsUrl(params?: {
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  tripType?: string
  cabinClass?: string
  adults?: number
  children?: number
  infants?: number
}): string {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
  const defaultDeparture = `${year}-${month}-25`
  const defaultReturn = `${year}-${month}-30`

  const sp = new URLSearchParams({
    origin: params?.origin ?? 'LAX',
    destination: params?.destination ?? 'JFK',
    departureDate: params?.departureDate ?? defaultDeparture,
    tripType: params?.tripType ?? 'round_trip',
    cabinClass: params?.cabinClass ?? 'economy',
    adults: String(params?.adults ?? 1),
    children: String(params?.children ?? 0),
    infants: String(params?.infants ?? 0),
  })
  if (params?.returnDate !== undefined) {
    sp.set('returnDate', params.returnDate)
  } else if ((params?.tripType ?? 'round_trip') === 'round_trip') {
    sp.set('returnDate', defaultReturn)
  }
  return `/results?${sp.toString()}`
}

test.describe('SearchSummaryBar', () => {
  test.beforeEach(async ({ page }) => {
    const url = buildResultsUrl()
    await page.goto(url)
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    // Wait for search summary bar to be visible
    await expect(page.getByTestId('search-summary-bar')).toBeVisible({ timeout: 10000 })
  })

  test('SearchSummaryBar displays search parameters after search', async ({ page }) => {
    // Verify origin chip displays LAX
    await expect(page.getByTestId('summary-origin')).toContainText('LAX')
    // Verify destination chip displays JFK
    await expect(page.getByTestId('summary-destination')).toContainText('JFK')
    // Verify dates chip is visible with formatted date
    await expect(page.getByTestId('summary-dates')).toBeVisible()
    // Verify passengers chip displays "1 adult"
    await expect(page.getByTestId('summary-passengers')).toContainText('1 adult')
    // Verify cabin class chip displays "Economy"
    await expect(page.getByTestId('summary-cabin-class')).toContainText('Economy')

    // Each chip should be clickable (buttons)
    await expect(page.getByTestId('summary-origin')).toBeEnabled()
    await expect(page.getByTestId('summary-destination')).toBeEnabled()
    await expect(page.getByTestId('summary-dates')).toBeEnabled()
    await expect(page.getByTestId('summary-passengers')).toBeEnabled()
    await expect(page.getByTestId('summary-cabin-class')).toBeEnabled()
  })

  test('SearchSummaryBar inline edit origin airport', async ({ page }) => {
    // Click origin chip to open editor
    await page.getByTestId('summary-origin').click()
    await expect(page.getByTestId('summary-origin-editor')).toBeVisible()

    // Type SFO in the autocomplete
    const originInput = page.getByTestId('summary-origin-autocomplete-input')
    await originInput.click()
    await originInput.fill('San')
    await expect(page.getByTestId('summary-origin-autocomplete-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('summary-origin-autocomplete-suggestion-SFO').click()

    // Editor should close
    await expect(page.getByTestId('summary-origin-editor')).not.toBeVisible()

    // URL should update with new origin
    await expect(page).toHaveURL(/origin=SFO/, { timeout: 10000 })
    // Summary bar should show SFO
    await expect(page.getByTestId('summary-origin')).toContainText('SFO')
  })

  test('SearchSummaryBar inline edit destination airport', async ({ page }) => {
    // Click destination chip to open editor
    await page.getByTestId('summary-destination').click()
    await expect(page.getByTestId('summary-destination-editor')).toBeVisible()

    // Type ORD in the autocomplete
    const destInput = page.getByTestId('summary-dest-autocomplete-input')
    await destInput.click()
    await destInput.fill('Chicago')
    await expect(page.getByTestId('summary-dest-autocomplete-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('summary-dest-autocomplete-suggestion-ORD').click()

    // Editor should close
    await expect(page.getByTestId('summary-destination-editor')).not.toBeVisible()

    // URL should update with new destination
    await expect(page).toHaveURL(/destination=ORD/, { timeout: 10000 })
    // Summary bar should show ORD
    await expect(page.getByTestId('summary-destination')).toContainText('ORD')
  })

  test('SearchSummaryBar inline edit departure date', async ({ page }) => {
    // Click dates chip to open departure date editor
    await page.getByTestId('summary-dates').click()
    await expect(page.getByTestId('summary-departure-editor')).toBeVisible()

    // The calendar should be visible
    await expect(page.getByTestId('summary-departure-calendar')).toBeVisible()

    // Pick a different day (28th of the same month)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const newDateStr = `${year}-${month}-28`
    await page.getByTestId(`summary-departure-day-${newDateStr}`).click()

    // Editor should close
    await expect(page.getByTestId('summary-departure-editor')).not.toBeVisible()

    // URL should update with new departure date
    await expect(page).toHaveURL(new RegExp(`departureDate=${newDateStr}`), { timeout: 10000 })
  })

  test('SearchSummaryBar inline edit return date', async ({ page }) => {
    // Verify return date chip is visible for round trip
    await expect(page.getByTestId('summary-return-date')).toBeVisible()

    // Click return date chip
    await page.getByTestId('summary-return-date').click()
    await expect(page.getByTestId('summary-return-editor')).toBeVisible()

    // The calendar should be visible
    await expect(page.getByTestId('summary-return-calendar')).toBeVisible()

    // Pick a different return date (28th)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const newReturnStr = `${year}-${month}-28`
    await page.getByTestId(`summary-return-day-${newReturnStr}`).click()

    // Editor should close
    await expect(page.getByTestId('summary-return-editor')).not.toBeVisible()

    // URL should update with new return date
    await expect(page).toHaveURL(new RegExp(`returnDate=${newReturnStr}`), { timeout: 10000 })
  })

  test('SearchSummaryBar inline edit passengers', async ({ page }) => {
    // Click passengers chip
    await page.getByTestId('summary-passengers').click()
    await expect(page.getByTestId('summary-passengers-editor')).toBeVisible()

    // Verify adults count is 1
    await expect(page.getByTestId('adults-count')).toHaveText('1')

    // Increment adults to 2
    await page.getByTestId('adults-increment').click()
    await expect(page.getByTestId('adults-count')).toHaveText('2')

    // Click Done to apply
    await page.getByTestId('summary-passengers-done').click()

    // Editor should close
    await expect(page.getByTestId('summary-passengers-editor')).not.toBeVisible()

    // URL should update with adults=2
    await expect(page).toHaveURL(/adults=2/, { timeout: 10000 })
    // Summary should show "2 passengers"
    await expect(page.getByTestId('summary-passengers')).toContainText('2 passengers')
  })

  test('SearchSummaryBar inline edit cabin class', async ({ page }) => {
    // Click cabin class chip
    await page.getByTestId('summary-cabin-class').click()
    await expect(page.getByTestId('summary-cabin-editor')).toBeVisible()

    // Verify dropdown is visible
    await expect(page.getByTestId('cabin-class-dropdown')).toBeVisible()

    // Select Business
    await page.getByTestId('cabin-class-option-business').click()

    // Click Done to apply
    await page.getByTestId('summary-cabin-done').click()

    // Editor should close
    await expect(page.getByTestId('summary-cabin-editor')).not.toBeVisible()

    // URL should update with cabinClass=business
    await expect(page).toHaveURL(/cabinClass=business/, { timeout: 10000 })
    // Summary should show "Business"
    await expect(page.getByTestId('summary-cabin-class')).toContainText('Business')
  })

  test('SearchSummaryBar inline editor closes without changes on outside click', async ({ page }) => {
    // Record current URL
    const urlBefore = page.url()

    // Click origin chip to open editor
    await page.getByTestId('summary-origin').click()
    await expect(page.getByTestId('summary-origin-editor')).toBeVisible()

    // Click outside the summary bar (on the results page body)
    await page.getByTestId('search-results-page').click({ position: { x: 5, y: 500 } })

    // Editor should close
    await expect(page.getByTestId('summary-origin-editor')).not.toBeVisible()

    // URL should remain unchanged
    expect(page.url()).toBe(urlBefore)

    // Summary bar values should remain the same
    await expect(page.getByTestId('summary-origin')).toContainText('LAX')
  })

  test('SearchSummaryBar can be edited multiple times in sequence', async ({ page }) => {
    test.slow()

    // First edit: change origin to SFO
    await page.getByTestId('summary-origin').click()
    await expect(page.getByTestId('summary-origin-editor')).toBeVisible()
    const originInput = page.getByTestId('summary-origin-autocomplete-input')
    await originInput.click()
    await originInput.fill('San')
    await expect(page.getByTestId('summary-origin-autocomplete-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('summary-origin-autocomplete-suggestion-SFO').click()

    // Wait for URL to update
    await expect(page).toHaveURL(/origin=SFO/, { timeout: 10000 })
    await expect(page.getByTestId('summary-origin')).toContainText('SFO')

    // Second edit: change cabin class to Business
    await page.getByTestId('summary-cabin-class').click()
    await expect(page.getByTestId('summary-cabin-editor')).toBeVisible()
    await page.getByTestId('cabin-class-option-business').click()
    await page.getByTestId('summary-cabin-done').click()

    // Wait for URL to update with both changes
    await expect(page).toHaveURL(/cabinClass=business/, { timeout: 10000 })
    await expect(page).toHaveURL(/origin=SFO/, { timeout: 10000 })

    // Verify summary bar reflects all changes
    await expect(page.getByTestId('summary-origin')).toContainText('SFO')
    await expect(page.getByTestId('summary-destination')).toContainText('JFK')
    await expect(page.getByTestId('summary-cabin-class')).toContainText('Business')
  })
})
