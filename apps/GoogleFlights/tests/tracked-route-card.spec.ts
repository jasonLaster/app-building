import { test, expect } from '@playwright/test'

async function setupSeedSession(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('gf_session_token', 'seed-session-token')
  })
  await page.goto('/trips')
  await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })
}

async function navigateToTrackedTab(page: import('@playwright/test').Page) {
  await setupSeedSession(page)
  await page.getByTestId('trips-tab-tracked').click()
  await expect(page.getByTestId('trips-tracked-list')).toBeVisible({ timeout: 15000 })
}

test.describe('TrackedRouteCard', () => {
  test('TrackedRouteCard displays route', async ({ page }) => {
    await navigateToTrackedTab(page)

    // Find the LAX → LHR tracked route card
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const laxLhrCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /LAX → LHR/ }),
    })
    await expect(laxLhrCard).toBeVisible({ timeout: 10000 })

    // Verify route text
    const routeEl = laxLhrCard.locator('[data-testid^="tracked-route-route-"]')
    await expect(routeEl).toContainText('LAX')
    await expect(routeEl).toContainText('→')
    await expect(routeEl).toContainText('LHR')
  })

  test('TrackedRouteCard displays date range being tracked', async ({ page }) => {
    await navigateToTrackedTab(page)

    // Find the LAX → LHR card (dates: Apr 1 – Apr 15)
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const laxLhrCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /LAX → LHR/ }),
    })
    await expect(laxLhrCard).toBeVisible({ timeout: 10000 })

    const datesEl = laxLhrCard.locator('[data-testid^="tracked-route-dates-"]')
    await expect(datesEl).toContainText('Apr 1')
    await expect(datesEl).toContainText('Apr 15')
    await expect(datesEl).toContainText('–')
  })

  test('TrackedRouteCard displays current lowest price', async ({ page }) => {
    await navigateToTrackedTab(page)

    // Find the LAX → LHR card
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const laxLhrCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /LAX → LHR/ }),
    })
    await expect(laxLhrCard).toBeVisible({ timeout: 10000 })

    // Verify price is displayed (should contain $ and a number)
    const priceEl = laxLhrCard.locator('[data-testid^="tracked-route-price-"]')
    await expect(priceEl).toBeVisible()
    await expect(priceEl).toContainText('$')
  })

  test('TrackedRouteCard displays price trend indicator going up', async ({ page }) => {
    await navigateToTrackedTab(page)

    // LAX → LHR has initial_price_cents=61504, current lowest=68885 → +12%
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const laxLhrCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /LAX → LHR/ }),
    })
    await expect(laxLhrCard).toBeVisible({ timeout: 10000 })

    // Verify upward trend indicator
    const trendEl = laxLhrCard.locator('[data-testid^="tracked-route-trend-"]')
    await expect(trendEl).toBeVisible()
    await expect(trendEl).toContainText('↑')
    await expect(trendEl).toContainText('+12%')
    // Verify it has the "up" styling class (red)
    await expect(trendEl).toHaveClass(/tracked-route-card__trend--up/)
  })

  test('TrackedRouteCard displays price trend indicator going down', async ({ page }) => {
    await navigateToTrackedTab(page)

    // SFO → NRT has initial_price_cents=93625, current lowest=86135 → -8%
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const sfoNrtCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /SFO → NRT/ }),
    })
    await expect(sfoNrtCard).toBeVisible({ timeout: 10000 })

    // Verify downward trend indicator
    const trendEl = sfoNrtCard.locator('[data-testid^="tracked-route-trend-"]')
    await expect(trendEl).toBeVisible()
    await expect(trendEl).toContainText('↓')
    await expect(trendEl).toContainText('-8%')
    // Verify it has the "down" styling class (green)
    await expect(trendEl).toHaveClass(/tracked-route-card__trend--down/)
  })

  test('TrackedRouteCard Search button navigates to search results', async ({ page }) => {
    await navigateToTrackedTab(page)

    // Find the LAX → LHR card
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const laxLhrCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /LAX → LHR/ }),
    })
    await expect(laxLhrCard).toBeVisible({ timeout: 10000 })

    // Click Search button
    const searchBtn = laxLhrCard.locator('[data-testid^="tracked-route-search-"]')
    await searchBtn.click()

    // Verify navigation to search results page with correct params
    await page.waitForURL(/\/results/, { timeout: 15000 })
    const url = new URL(page.url())
    expect(url.pathname).toBe('/results')
    expect(url.searchParams.get('origin')).toBe('LAX')
    expect(url.searchParams.get('destination')).toBe('LHR')
    expect(url.searchParams.get('departureDate')).toBe('2026-04-01')
  })

  test('TrackedRouteCard Untrack button removes tracking', async ({ page }) => {
    await navigateToTrackedTab(page)

    // Should have 3 tracked routes from seed data
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    const initialCount = await cards.count()
    expect(initialCount).toBeGreaterThanOrEqual(2)

    // Click Untrack on the first card
    const firstUntrackBtn = cards.first().locator('[data-testid^="tracked-route-untrack-"]')
    await firstUntrackBtn.click()

    // Verify the card is removed (count decreases by 1)
    await expect(cards).toHaveCount(initialCount - 1, { timeout: 15000 })
  })

  test('TrackedRouteCard Untrack then re-check shows updated list', async ({ page }) => {
    await navigateToTrackedTab(page)

    // Should have 3 tracked routes from seed data
    const cards = page.locator('[data-testid^="tracked-route-card-"]')
    await expect(cards).toHaveCount(3, { timeout: 15000 })

    // Click Untrack on the first card
    const firstUntrackBtn = cards.first().locator('[data-testid^="tracked-route-untrack-"]')
    await firstUntrackBtn.click()

    // Wait for removal
    await expect(cards).toHaveCount(2, { timeout: 15000 })

    // Switch to Upcoming tab and back to Tracked
    await page.getByTestId('trips-tab-upcoming').click()
    await expect(page.getByTestId('trips-upcoming-list')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('trips-tab-tracked').click()
    await expect(page.getByTestId('trips-tracked-list')).toBeVisible({ timeout: 15000 })

    // Verify still only 2 tracked routes
    await expect(page.locator('[data-testid^="tracked-route-card-"]')).toHaveCount(2, { timeout: 15000 })
  })

  test('TrackedRouteCard Search button works for multiple cards', async ({ page }) => {
    await navigateToTrackedTab(page)

    const cards = page.locator('[data-testid^="tracked-route-card-"]')

    // Find SFO → NRT card and click Search
    const sfoNrtCard = cards.filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /SFO → NRT/ }),
    })
    await expect(sfoNrtCard).toBeVisible({ timeout: 10000 })
    const sfoSearchBtn = sfoNrtCard.locator('[data-testid^="tracked-route-search-"]')
    await sfoSearchBtn.click()

    // Verify navigated to results with SFO → NRT params
    await page.waitForURL(/\/results/, { timeout: 15000 })
    let url = new URL(page.url())
    expect(url.searchParams.get('origin')).toBe('SFO')
    expect(url.searchParams.get('destination')).toBe('NRT')

    // Navigate back to My Trips
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 15000 })
    await page.getByTestId('trips-tab-tracked').click()
    await expect(page.getByTestId('trips-tracked-list')).toBeVisible({ timeout: 15000 })

    // Find LAX → LHR card and click Search
    const laxLhrCard = page.locator('[data-testid^="tracked-route-card-"]').filter({
      has: page.locator('[data-testid^="tracked-route-route-"]', { hasText: /LAX → LHR/ }),
    })
    await expect(laxLhrCard).toBeVisible({ timeout: 10000 })
    const laxSearchBtn = laxLhrCard.locator('[data-testid^="tracked-route-search-"]')
    await laxSearchBtn.click()

    // Verify navigated to results with LAX → LHR params
    await page.waitForURL(/\/results/, { timeout: 15000 })
    url = new URL(page.url())
    expect(url.searchParams.get('origin')).toBe('LAX')
    expect(url.searchParams.get('destination')).toBe('LHR')
  })
})
