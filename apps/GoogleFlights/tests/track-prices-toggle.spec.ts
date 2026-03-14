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
    children: '0',
    infants: '0',
  })
  if (params?.returnDate !== undefined) {
    sp.set('returnDate', params.returnDate)
  } else {
    sp.set('returnDate', defaultReturn)
  }
  return `/results?${sp.toString()}`
}

/**
 * Helper to delete all tracked routes via API for a given session token.
 */
async function deleteAllTrackedRoutes(page: import('@playwright/test').Page, sessionToken: string) {
  const res = await page.request.get(`/api/tracked-routes?session=${sessionToken}&list=true`)
  if (res.ok()) {
    const data = await res.json() as { routes?: { id: string; origin_code: string; dest_code: string }[] }
    if (data.routes) {
      for (const route of data.routes) {
        await page.request.delete('/api/tracked-routes', {
          data: {
            sessionToken,
            originCode: route.origin_code,
            destCode: route.dest_code,
          },
        })
      }
    }
  }
}

test.describe('TrackPricesToggle', () => {
  let sessionToken: string

  test.beforeEach(async ({ page }) => {
    // Navigate to results page
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })

    // Get session token from localStorage
    sessionToken = await page.evaluate(() => {
      return localStorage.getItem('session_token') || ''
    })

    // Clean up tracked routes for this session
    if (sessionToken) {
      await deleteAllTrackedRoutes(page, sessionToken)
      // Reload to reflect clean state
      await page.reload()
      await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    }
  })

  test('TrackPricesToggle is displayed on results page', async ({ page }) => {
    // Verify toggle is visible
    const toggle = page.getByTestId('track-prices-toggle')
    await expect(toggle).toBeVisible({ timeout: 10000 })

    // Verify it's in the off/untracked state
    const button = page.getByTestId('track-prices-button')
    await expect(button).toBeVisible()
    const label = page.getByTestId('track-prices-label')
    await expect(label).toHaveText('Track prices')
  })

  test('TrackPricesToggle enables price tracking', async ({ page }) => {
    const button = page.getByTestId('track-prices-button')
    const label = page.getByTestId('track-prices-label')

    // Verify initially off
    await expect(label).toHaveText('Track prices', { timeout: 10000 })

    // Click to enable tracking
    await button.click()

    // Should switch to tracked state
    await expect(label).toHaveText('Tracking prices', { timeout: 10000 })
  })

  test('TrackPricesToggle disables price tracking', async ({ page }) => {
    const button = page.getByTestId('track-prices-button')
    const label = page.getByTestId('track-prices-label')

    // First enable tracking
    await expect(label).toHaveText('Track prices', { timeout: 10000 })
    await button.click()
    await expect(label).toHaveText('Tracking prices', { timeout: 10000 })

    // Now disable tracking
    await button.click()

    // Should switch back to untracked state
    await expect(label).toHaveText('Track prices', { timeout: 10000 })
  })

  test('TrackPricesToggle reflects existing tracked route', async ({ page }) => {
    test.slow()

    const button = page.getByTestId('track-prices-button')
    const label = page.getByTestId('track-prices-label')

    // Enable tracking for LAX → JFK
    await expect(label).toHaveText('Track prices', { timeout: 10000 })
    await button.click()
    await expect(label).toHaveText('Tracking prices', { timeout: 10000 })

    // Navigate away and come back to the same route
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    // Navigate back to the same search results
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })

    // The toggle should reflect the existing tracked route (on state)
    await expect(page.getByTestId('track-prices-label')).toHaveText('Tracking prices', { timeout: 10000 })
  })

  test('TrackPricesToggle tracked route appears in My Trips', async ({ page }) => {
    test.slow()

    const button = page.getByTestId('track-prices-button')
    const label = page.getByTestId('track-prices-label')

    // Enable tracking for LAX → JFK
    await expect(label).toHaveText('Track prices', { timeout: 10000 })
    await button.click()
    await expect(label).toHaveText('Tracking prices', { timeout: 10000 })

    // Navigate to My Trips page
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 10000 })

    // Click the "Tracked" tab
    await page.getByTestId('trips-tab-tracked').click()

    // Verify tracked route appears in the list
    const trackedList = page.getByTestId('trips-tracked-list')
    await expect(trackedList).toBeVisible({ timeout: 10000 })

    // Verify route details (LAX → JFK)
    await expect(trackedList).toContainText('LAX')
    await expect(trackedList).toContainText('JFK')
  })

  test('TrackPricesToggle can be toggled multiple times', async ({ page }) => {
    test.slow()

    const button = page.getByTestId('track-prices-button')
    const label = page.getByTestId('track-prices-label')

    // Initially off
    await expect(label).toHaveText('Track prices', { timeout: 10000 })

    // Toggle ON
    await button.click()
    await expect(label).toHaveText('Tracking prices', { timeout: 10000 })

    // Toggle OFF
    await button.click()
    await expect(label).toHaveText('Track prices', { timeout: 10000 })

    // Toggle ON again
    await button.click()
    await expect(label).toHaveText('Tracking prices', { timeout: 10000 })
  })
})
