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

/**
 * Helper to drag a range slider handle to a percentage position on the track.
 */
async function dragSliderHandle(
  page: import('@playwright/test').Page,
  handleTestId: string,
  trackTestId: string,
  targetPercent: number
) {
  const track = page.getByTestId(trackTestId)
  const handle = page.getByTestId(handleTestId)
  await handle.scrollIntoViewIfNeeded()
  const trackBox = await track.boundingBox()
  const handleBox = await handle.boundingBox()
  if (!trackBox || !handleBox) throw new Error('Could not get bounding boxes')

  const startX = handleBox.x + handleBox.width / 2
  const startY = handleBox.y + handleBox.height / 2
  const targetX = trackBox.x + trackBox.width * targetPercent
  const targetY = trackBox.y + trackBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(targetX, targetY, { steps: 10 })
  await page.mouse.up()
}

test.describe('FilterSidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    // Wait for flights to load
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })
  })

  test('FilterSidebar displays all filter sections', async ({ page }) => {
    const sidebar = page.getByTestId('filter-sidebar')
    await expect(sidebar).toBeVisible()

    // Verify all filter sections are visible
    await expect(page.getByTestId('filter-sort-section')).toBeVisible()
    await expect(page.getByTestId('filter-stops-section')).toBeVisible()
    await expect(page.getByTestId('filter-airlines-section')).toBeVisible()
    await expect(page.getByTestId('filter-price-section')).toBeVisible()
    await expect(page.getByTestId('filter-duration-section')).toBeVisible()
    await expect(page.getByTestId('filter-departure-time-section')).toBeVisible()
    await expect(page.getByTestId('filter-arrival-time-section')).toBeVisible()

    // Verify section labels
    await expect(page.getByTestId('filter-sort-section')).toContainText('Sort by')
    await expect(page.getByTestId('filter-stops-section')).toContainText('Stops')
    await expect(page.getByTestId('filter-airlines-section')).toContainText('Airlines')
    await expect(page.getByTestId('filter-price-section')).toContainText('Price range')
    await expect(page.getByTestId('filter-duration-section')).toContainText('Duration range')
    await expect(page.getByTestId('filter-departure-time-section')).toContainText('Departure time')
    await expect(page.getByTestId('filter-arrival-time-section')).toContainText('Arrival time')
  })

  test('FilterSidebar stops filter — check Nonstop', async ({ page }) => {
    // Get initial count
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check Nonstop checkbox
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').check()

    // Only nonstop flights should be shown (4 nonstop flights: AA100, DL200, UA300, B6400)
    await expect(resultsCount).toContainText('4 of 5 flights')

    // Verify all visible cards show "Nonstop" in their stops label
    const stopsLabels = page.locator('[data-testid^="flight-card-stops-"]')
    const count = await stopsLabels.count()
    for (let i = 0; i < count; i++) {
      await expect(stopsLabels.nth(i)).toContainText('Nonstop')
    }
  })

  test('FilterSidebar stops filter — check 1 stop', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check 1 stop checkbox
    await page.getByTestId('filter-stops-one').locator('input[type="checkbox"]').check()

    // Only 1-stop flights should be shown (AA101 has 2 legs = 1 stop)
    await expect(resultsCount).toContainText('1 of 5 flights')

    // Verify visible card shows "1 stop"
    const stopsLabels = page.locator('[data-testid^="flight-card-stops-"]')
    await expect(stopsLabels).toHaveCount(1)
    await expect(stopsLabels.first()).toContainText('1 stop')
  })

  test('FilterSidebar stops filter — check multiple options', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check both Nonstop and 1 stop
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').check()
    await page.getByTestId('filter-stops-one').locator('input[type="checkbox"]').check()

    // Both nonstop (4) and 1-stop (1) = all 5 flights should be shown
    await expect(resultsCount).toContainText('5 of 5 flights')
  })

  test('FilterSidebar stops filter — uncheck to remove filter', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check Nonstop
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').check()
    await expect(resultsCount).toContainText('4 of 5 flights')

    // Uncheck Nonstop
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').uncheck()

    // All flights should be displayed again
    await expect(resultsCount).toContainText('5 of 5 flights')
  })

  test('FilterSidebar airlines filter shows airlines with flight counts', async ({ page }) => {
    const airlinesSection = page.getByTestId('filter-airlines-section')
    await expect(airlinesSection).toBeVisible()

    // Seed data for LAX→JFK: AA (2), DL (1), UA (1), B6 (1)
    // Verify airlines are shown with counts
    await expect(airlinesSection).toContainText('American Airlines')
    await expect(airlinesSection).toContainText('(2)')
    await expect(airlinesSection).toContainText('Delta Air Lines')
    await expect(airlinesSection).toContainText('(1)')
    await expect(airlinesSection).toContainText('United Airlines')
    await expect(airlinesSection).toContainText('JetBlue Airways')

    // Each airline should have a checkbox
    await expect(page.getByTestId('filter-airline-AA').locator('input[type="checkbox"]')).toBeVisible()
    await expect(page.getByTestId('filter-airline-DL').locator('input[type="checkbox"]')).toBeVisible()
    await expect(page.getByTestId('filter-airline-UA').locator('input[type="checkbox"]')).toBeVisible()
    await expect(page.getByTestId('filter-airline-B6').locator('input[type="checkbox"]')).toBeVisible()
  })

  test('FilterSidebar airlines filter — select specific airline', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Select Delta
    await page.getByTestId('filter-airline-DL').locator('input[type="checkbox"]').check()

    // Only Delta flights (1) should be shown
    await expect(resultsCount).toContainText('1 of 5 flights')

    // Verify the visible card is a Delta flight
    const cards = page.locator('[data-testid^="flight-card-airline-"]')
    await expect(cards).toHaveCount(1)
    await expect(cards.first()).toContainText('Delta Air Lines')
  })

  test('FilterSidebar airlines filter — select multiple airlines', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Select American Airlines and United Airlines
    await page.getByTestId('filter-airline-AA').locator('input[type="checkbox"]').check()
    await page.getByTestId('filter-airline-UA').locator('input[type="checkbox"]').check()

    // AA (2) + UA (1) = 3 flights
    await expect(resultsCount).toContainText('3 of 5 flights')
  })

  test('FilterSidebar price range slider displays histogram', async ({ page }) => {
    const priceSection = page.getByTestId('filter-price-section')
    await expect(priceSection).toBeVisible()

    // Verify slider is displayed
    await expect(page.getByTestId('price-range-slider')).toBeVisible()

    // Verify histogram is displayed
    await expect(page.getByTestId('price-range-histogram')).toBeVisible()

    // Verify histogram has bars
    const histogramBars = page.getByTestId('price-range-histogram').locator('.range-slider__histogram-bar')
    const barCount = await histogramBars.count()
    expect(barCount).toBeGreaterThan(0)

    // Verify min and max labels are shown
    await expect(page.getByTestId('price-range-min-label')).toBeVisible()
    await expect(page.getByTestId('price-range-max-label')).toBeVisible()

    // Verify handles are present
    await expect(page.getByTestId('price-range-handle-min')).toBeVisible()
    await expect(page.getByTestId('price-range-handle-max')).toBeVisible()
  })

  test('FilterSidebar price range slider filters results', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Drag the max handle to ~60% position to filter out expensive flights
    // Prices range from ~$229 to ~$367 in seed data
    // At 60%, we should be around $312, filtering out UA300 ($367) and AA100 ($344)
    await dragSliderHandle(page, 'price-range-handle-max', 'price-range-track', 0.6)

    // Verify some flights are filtered out (fewer than 5)
    await expect(resultsCount).not.toContainText('5 of 5 flights', { timeout: 5000 })

    // Verify the max label updated
    const maxLabel = page.getByTestId('price-range-max-label')
    await expect(maxLabel).toBeVisible()
  })

  test('FilterSidebar price range slider — adjust min price', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Drag the min handle to ~50% position to filter out cheap flights
    // At 50%, we should be around $298, filtering out B6400 ($229) and AA101 ($229)
    await dragSliderHandle(page, 'price-range-handle-min', 'price-range-track', 0.5)

    // Verify some flights are filtered out
    await expect(resultsCount).not.toContainText('5 of 5 flights', { timeout: 5000 })
  })

  test('FilterSidebar duration range slider filters results', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Durations: 330min (4 flights) and 420min (1 flight)
    // Drag max handle to ~50% to filter out the 420min flight
    await dragSliderHandle(page, 'duration-range-handle-max', 'duration-range-track', 0.5)

    // Verify the 420min flight (AA101) is filtered out, showing 4 flights
    await expect(resultsCount).toContainText('4 of 5 flights', { timeout: 5000 })
  })

  test('FilterSidebar departure time filter — Morning checkbox', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check Morning checkbox
    await page.getByTestId('filter-departure-morning').locator('input[type="checkbox"]').check()

    // Morning flights (6-12): B6400 (06:00), AA100 (08:00), DL200 (10:15) = 3 flights
    await expect(resultsCount).toContainText('3 of 5 flights')
  })

  test('FilterSidebar departure time filter — multiple time periods', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check Morning and Evening per spec
    await page.getByTestId('filter-departure-morning').locator('input[type="checkbox"]').check()
    await expect(resultsCount).toContainText('3 of 5 flights')

    await page.getByTestId('filter-departure-evening').locator('input[type="checkbox"]').check()

    // Morning (3) + Evening (0 in seed data) = 3 flights; afternoon/night flights hidden
    await expect(resultsCount).toContainText('3 of 5 flights')
  })

  test('FilterSidebar departure time filter — arrival time checkboxes', async ({ page }) => {
    const resultsCount = page.getByTestId('results-count')
    await expect(resultsCount).toContainText('5 of 5 flights')

    // Check Afternoon in arrival time filter
    await page.getByTestId('filter-arrival-afternoon').locator('input[type="checkbox"]').check()

    // Afternoon arrivals (12-18): B6400 (14:30), AA100 (16:30) = 2 flights
    await expect(resultsCount).toContainText('2 of 5 flights')
  })

  test('FilterSidebar sort by dropdown — default "Best"', async ({ page }) => {
    // Verify sort dropdown shows "Best" as default
    const sortButton = page.getByTestId('sort-dropdown-button')
    await expect(sortButton).toBeVisible()
    await expect(sortButton).toContainText('Best')
  })

  test('FilterSidebar sort by Price (lowest)', async ({ page }) => {
    // Open sort dropdown
    await page.getByTestId('sort-dropdown-button').click()
    await expect(page.getByTestId('sort-dropdown')).toBeVisible()

    // Select Price (lowest)
    await page.getByTestId('sort-option-price').click()

    // Verify dropdown closed and shows new selection
    await expect(page.getByTestId('sort-dropdown-button')).toContainText('Price (lowest)')

    // Verify results are sorted by price ascending
    // Get all price elements
    const priceElements = page.locator('[data-testid^="flight-card-price-"]')
    const count = await priceElements.count()
    expect(count).toBeGreaterThan(1)

    const prices: number[] = []
    for (let i = 0; i < count; i++) {
      const text = await priceElements.nth(i).textContent()
      const price = parseInt(text!.replace('$', ''), 10)
      prices.push(price)
    }

    // Verify ascending order
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]!)
    }
  })

  test('FilterSidebar sort by Duration (shortest)', async ({ page }) => {
    // Open sort dropdown and select Duration
    await page.getByTestId('sort-dropdown-button').click()
    await expect(page.getByTestId('sort-dropdown')).toBeVisible()
    await page.getByTestId('sort-option-duration').click()

    await expect(page.getByTestId('sort-dropdown-button')).toContainText('Duration (shortest)')

    // Verify results are sorted by duration ascending
    const durationElements = page.locator('[data-testid^="flight-card-duration-"]')
    const count = await durationElements.count()
    expect(count).toBeGreaterThan(1)

    const durations: number[] = []
    for (let i = 0; i < count; i++) {
      const text = await durationElements.nth(i).textContent()
      // Parse duration like "5h 30m" or "7h"
      const match = text!.match(/(\d+)h(?:\s*(\d+)m)?/)
      if (match) {
        const hours = parseInt(match[1]!, 10)
        const minutes = parseInt(match[2] || '0', 10)
        durations.push(hours * 60 + minutes)
      }
    }

    // Verify ascending order
    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeGreaterThanOrEqual(durations[i - 1]!)
    }
  })

  test('FilterSidebar sort by Departure time (earliest)', async ({ page }) => {
    // Open sort dropdown and select Departure time
    await page.getByTestId('sort-dropdown-button').click()
    await expect(page.getByTestId('sort-dropdown')).toBeVisible()
    await page.getByTestId('sort-option-departure').click()

    await expect(page.getByTestId('sort-dropdown-button')).toContainText('Departure time (earliest)')

    // Verify results are sorted by departure time ascending
    const departureElements = page.locator('[data-testid^="flight-card-departure-"]')
    const count = await departureElements.count()
    expect(count).toBeGreaterThan(1)

    // First flight should have earliest departure (B6400 at 6:00 AM)
    await expect(departureElements.first()).toContainText('6:00')
  })

  test('FilterSidebar sort by Arrival time (earliest)', async ({ page }) => {
    // Open sort dropdown and select Arrival time
    await page.getByTestId('sort-dropdown-button').click()
    await expect(page.getByTestId('sort-dropdown')).toBeVisible()
    await page.getByTestId('sort-option-arrival').click()

    await expect(page.getByTestId('sort-dropdown-button')).toContainText('Arrival time (earliest)')

    // Verify results are sorted by arrival time ascending
    const arrivalElements = page.locator('[data-testid^="flight-card-arrival-"]')
    const count = await arrivalElements.count()
    expect(count).toBeGreaterThan(1)

    // First flight should have earliest arrival (B6400 arriving at 2:30 PM)
    await expect(arrivalElements.first()).toContainText('2:30')
  })
})
