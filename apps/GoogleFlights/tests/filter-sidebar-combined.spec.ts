import { test, expect } from '@playwright/test'

/**
 * Helper to build a results page URL with search parameters.
 * Uses 2026-04-01 to match seed data for LAX→JFK route.
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

test.describe('FilterSidebar Combined', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })
  })

  test('FilterSidebar combining multiple filters', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check Nonstop in Stops filter
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').check()
    await expect(resultsCount).toContainText('4 of 5 flights')

    // Select Delta in Airlines filter
    await page.getByTestId('filter-airline-DL').locator('input[type="checkbox"]').check()

    // Nonstop + Delta = DL200 only = 1 flight
    await expect(resultsCount).toContainText('1 of 5 flights')

    // Verify the remaining flight is Delta and nonstop
    const airlineNames = page.locator('[data-testid^="flight-card-airline-"]')
    await expect(airlineNames).toHaveCount(1)
    await expect(airlineNames.first()).toContainText('Delta Air Lines')

    const stopsLabels = page.locator('[data-testid^="flight-card-stops-"]')
    await expect(stopsLabels).toHaveCount(1)
    await expect(stopsLabels.first()).toContainText('Nonstop')
  })

  test('FilterSidebar filters can be used repeatedly', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // First: check Nonstop
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').check()
    await expect(resultsCount).toContainText('4 of 5 flights')

    // Verify all shown are nonstop
    const stopsLabels = page.locator('[data-testid^="flight-card-stops-"]')
    await expect(stopsLabels).toHaveCount(4)

    // Second: uncheck Nonstop, check 1 stop
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').uncheck()
    await page.getByTestId('filter-stops-one').locator('input[type="checkbox"]').check()
    await expect(resultsCount).toContainText('1 of 5 flights')

    // Verify the shown flight is 1 stop
    await expect(stopsLabels.first()).toContainText('1 stop')

    // Third: change sort to Price (lowest)
    await page.getByTestId('sort-dropdown-button').click()
    await expect(page.getByTestId('sort-dropdown')).toBeVisible()
    await page.getByTestId('sort-option-price').click()
    await expect(page.getByTestId('sort-dropdown-button')).toContainText('Price (lowest)')

    // Still only 1 flight shown (1 stop filter still active)
    await expect(resultsCount).toContainText('1 of 5 flights')
  })
})
