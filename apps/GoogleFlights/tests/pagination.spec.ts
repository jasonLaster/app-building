import { test, expect } from '@playwright/test'

/**
 * Helper to build a results page URL with search parameters.
 * Defaults to SFO→JFK which has 23 flights in seed data (requires pagination).
 */
function buildResultsUrl(params?: {
  origin?: string
  destination?: string
  departureDate?: string
  cabinClass?: string
}): string {
  const sp = new URLSearchParams({
    origin: params?.origin ?? 'SFO',
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

test.describe('Pagination', () => {
  test('Pagination "Load more" button is displayed at bottom of results', async ({ page }) => {
    // SFO→JFK has 23 flights, page 1 shows 20 with more available
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    // Load more button should be visible
    const loadMore = page.getByTestId('pagination-load-more')
    await expect(loadMore).toBeVisible()
    await expect(loadMore).toContainText('Load more results')
  })

  test('Pagination loading more results appends to list', async ({ page }) => {
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    // Verify initial count is 20 flights (page 1)
    await expect(page.locator('.flight-card')).toHaveCount(20, { timeout: 15000 })

    // Click Load more
    await page.getByTestId('pagination-load-more').click()

    // All 23 flights should now be displayed
    await expect(page.locator('.flight-card')).toHaveCount(23, { timeout: 15000 })
  })

  test('Pagination button hidden when all results loaded', async ({ page }) => {
    // LAX→JFK has only 5 flights (all fit on page 1, no pagination needed)
    await page.goto(buildResultsUrl({ origin: 'LAX', destination: 'JFK' }))
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    // Pagination should not be present since all results are loaded
    await expect(page.getByTestId('pagination')).toHaveCount(0)
  })

  test('Pagination preserves filters when loading more', async ({ page }) => {
    await page.goto(buildResultsUrl())
    await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

    const resultsCount = page.getByTestId('results-count')

    // SFO→JFK has 23 total (22 nonstop + 1 connecting)
    // Page 1 loads 20 flights (19 nonstop + 1 connecting based on price sort)

    // Apply Nonstop filter
    await page.getByTestId('filter-stops-nonstop').locator('input[type="checkbox"]').check()

    // Should show 19 nonstop of 20 loaded
    await expect(resultsCount).toContainText('19 of 20 flights')

    // Click Load more to get page 2 (3 more flights, all nonstop)
    await page.getByTestId('pagination-load-more').click()

    // After loading more, total loaded = 23, nonstop = 22
    await expect(resultsCount).toContainText('22 of 23 flights', { timeout: 15000 })
  })
})
