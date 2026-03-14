import { test, expect } from '@playwright/test'

/**
 * Helper to fill a valid search form with origin, destination, and dates.
 */
async function fillSearchForm(page: import('@playwright/test').Page, options?: {
  skipOrigin?: boolean
  skipDestination?: boolean
  skipDepartureDate?: boolean
  skipReturnDate?: boolean
  oneWay?: boolean
}) {
  // Select One Way if needed
  if (options?.oneWay) {
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('One way')
  }

  // Set origin airport (type "Los" and select LAX)
  if (!options?.skipOrigin) {
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('Los')
    await expect(page.getByTestId('origin-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('origin-suggestion-LAX').click()
    await expect(page.getByTestId('origin-dropdown')).not.toBeVisible()
  }

  // Set destination airport (type "New" and select JFK)
  if (!options?.skipDestination) {
    const destInput = page.getByTestId('destination-input')
    await destInput.click()
    await destInput.fill('New')
    await expect(page.getByTestId('destination-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('destination-suggestion-JFK').click()
    await expect(page.getByTestId('destination-dropdown')).not.toBeVisible()
  }

  // Set departure date (pick a future date)
  if (!options?.skipDepartureDate) {
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()
    // Navigate to next month to ensure we pick a future date
    await page.getByTestId('departure-date-next-month').click()
    // Click the 15th day of the next month
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const departureDateStr = `${year}-${month}-15`
    await page.getByTestId(`departure-date-day-${departureDateStr}`).click()
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()
  }

  // Set return date (pick a date after departure)
  if (!options?.skipReturnDate && !options?.oneWay) {
    await page.getByTestId('return-date-trigger').click()
    await expect(page.getByTestId('return-date-calendar')).toBeVisible()
    // Navigate to next month to match departure month, then pick 20th
    await page.getByTestId('return-date-next-month').click()
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const returnDateStr = `${year}-${month}-20`
    await page.getByTestId(`return-date-day-${returnDateStr}`).click()
    await expect(page.getByTestId('return-date-calendar')).not.toBeVisible()
  }
}

test.describe('SearchButton', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('SearchButton is displayed with prominent styling', async ({ page }) => {
    const searchButton = page.getByTestId('search-button')
    await expect(searchButton).toBeVisible()
    await expect(searchButton).toContainText('Search')

    // Verify the button has the prominent blue color
    const bgColor = await searchButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    // The button should have a noticeable background color (not transparent/white)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('SearchButton navigates to results page with valid inputs', async ({ page }) => {
    await fillSearchForm(page)

    // Click search
    await page.getByTestId('search-button').click()

    // Verify navigation to results page
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Verify URL contains search parameters
    const url = page.url()
    expect(url).toContain('origin=LAX')
    expect(url).toContain('destination=JFK')
    expect(url).toContain('departureDate=')
    expect(url).toContain('returnDate=')
    expect(url).toContain('tripType=round_trip')
    expect(url).toContain('cabinClass=economy')
    expect(url).toContain('adults=1')
  })

  test('SearchButton shows validation error when origin is missing', async ({ page }) => {
    await fillSearchForm(page, { skipOrigin: true })

    // Click search
    await page.getByTestId('search-button').click()

    // Should stay on search page (not navigate to results)
    expect(page.url()).not.toContain('/results')

    // Validation error should appear near origin field
    await expect(page.getByTestId('origin-error')).toBeVisible()
    await expect(page.getByTestId('origin-error')).toContainText('origin')
  })

  test('SearchButton shows validation error when destination is missing', async ({ page }) => {
    await fillSearchForm(page, { skipDestination: true })

    // Click search
    await page.getByTestId('search-button').click()

    // Should stay on search page (not navigate to results)
    expect(page.url()).not.toContain('/results')

    // Validation error should appear near destination field
    await expect(page.getByTestId('destination-error')).toBeVisible()
    await expect(page.getByTestId('destination-error')).toContainText('destination')
  })

  test('SearchButton shows validation error when departure date is missing', async ({ page }) => {
    await fillSearchForm(page, { skipDepartureDate: true, skipReturnDate: true })

    // Click search
    await page.getByTestId('search-button').click()

    // Should stay on search page (not navigate to results)
    expect(page.url()).not.toContain('/results')

    // Validation error should appear near departure date field
    await expect(page.getByTestId('departure-date-error')).toBeVisible()
    await expect(page.getByTestId('departure-date-error')).toContainText('departure')
  })

  test('SearchButton shows validation error when return date is missing for round trip', async ({ page }) => {
    await fillSearchForm(page, { skipReturnDate: true })

    // Click search
    await page.getByTestId('search-button').click()

    // Should stay on search page (not navigate to results)
    expect(page.url()).not.toContain('/results')

    // Validation error should appear near return date field
    await expect(page.getByTestId('return-date-error')).toBeVisible()
    await expect(page.getByTestId('return-date-error')).toContainText('return')
  })

  test('SearchButton works for One way trip without return date', async ({ page }) => {
    await fillSearchForm(page, { oneWay: true })

    // Click search
    await page.getByTestId('search-button').click()

    // Verify navigation to results page
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Verify URL contains one_way trip type and no return date
    const url = page.url()
    expect(url).toContain('origin=LAX')
    expect(url).toContain('destination=JFK')
    expect(url).toContain('tripType=one_way')
    expect(url).not.toContain('returnDate=')
  })

  test('SearchButton saves search to recent searches', async ({ page }) => {
    await fillSearchForm(page)

    // Click search
    await page.getByTestId('search-button').click()

    // Wait for navigation to results page
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Navigate back to search page
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    // Verify a recent search entry appears
    const recentSearchesList = page.getByTestId('recent-searches-list')
    await expect(recentSearchesList).toBeVisible({ timeout: 10000 })

    // Verify the recent search shows LAX → JFK
    await expect(recentSearchesList).toContainText('LAX')
    await expect(recentSearchesList).toContainText('JFK')
  })
})
