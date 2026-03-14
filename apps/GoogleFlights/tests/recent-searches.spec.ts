import { test, expect } from '@playwright/test'

/**
 * Helper to fill a valid search form with specified origin/destination codes.
 */
async function fillSearchForm(page: import('@playwright/test').Page, options: {
  originSearch: string
  originCode: string
  destSearch: string
  destCode: string
  adults?: number
  cabinClass?: string
  oneWay?: boolean
}) {
  // Select One Way if needed
  if (options.oneWay) {
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('One way')
  }

  // Set cabin class if specified
  if (options.cabinClass) {
    await page.getByTestId('cabin-class-trigger').click()
    await page.getByTestId(`cabin-class-option-${options.cabinClass}`).click()
  }

  // Set passengers if specified
  if (options.adults && options.adults > 1) {
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()
    for (let i = 1; i < options.adults; i++) {
      await page.getByTestId('adults-increment').click()
    }
    // Close dropdown by clicking trigger again
    await page.getByTestId('passenger-count-trigger').click()
  }

  // Set origin
  const originInput = page.getByTestId('origin-input')
  await originInput.click()
  await originInput.fill(options.originSearch)
  await expect(page.getByTestId('origin-dropdown')).toBeVisible({ timeout: 10000 })
  await page.getByTestId(`origin-suggestion-${options.originCode}`).click()
  await expect(page.getByTestId('origin-dropdown')).not.toBeVisible()

  // Set destination
  const destInput = page.getByTestId('destination-input')
  await destInput.click()
  await destInput.fill(options.destSearch)
  await expect(page.getByTestId('destination-dropdown')).toBeVisible({ timeout: 10000 })
  await page.getByTestId(`destination-suggestion-${options.destCode}`).click()
  await expect(page.getByTestId('destination-dropdown')).not.toBeVisible()

  // Set departure date (next month 15th)
  await page.getByTestId('departure-date-trigger').click()
  await expect(page.getByTestId('departure-date-calendar')).toBeVisible()
  await page.getByTestId('departure-date-next-month').click()
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const year = nextMonth.getFullYear()
  const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
  const departureDateStr = `${year}-${month}-15`
  await page.getByTestId(`departure-date-day-${departureDateStr}`).click()
  await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

  // Set return date if round trip
  if (!options.oneWay) {
    await page.getByTestId('return-date-trigger').click()
    await expect(page.getByTestId('return-date-calendar')).toBeVisible()
    await page.getByTestId('return-date-next-month').click()
    const returnDateStr = `${year}-${month}-20`
    await page.getByTestId(`return-date-day-${returnDateStr}`).click()
    await expect(page.getByTestId('return-date-calendar')).not.toBeVisible()
  }
}

async function deleteAllRecentSearches(page: import('@playwright/test').Page) {
  // Clear recent searches by clearing localStorage session token so a fresh one is created
  await page.evaluate(() => {
    localStorage.removeItem('gf_session_token')
  })
}

test.describe('RecentSearches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
    // Clear session to start fresh with no recent searches
    await deleteAllRecentSearches(page)
    await page.reload()
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('RecentSearches shows empty state when no searches exist', async ({ page }) => {
    // Wait for loading to finish and check empty state
    await expect(page.getByTestId('recent-searches-empty')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('recent-searches-empty')).toHaveText('No recent searches')
  })

  test('RecentSearches displays a recent search entry', async ({ page }) => {
    // Perform a search: LAX → JFK
    await fillSearchForm(page, {
      originSearch: 'Los',
      originCode: 'LAX',
      destSearch: 'New',
      destCode: 'JFK',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Navigate back to search page
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    // Verify recent search entry is displayed
    const recentList = page.getByTestId('recent-searches-list')
    await expect(recentList).toBeVisible({ timeout: 10000 })
    await expect(recentList).toContainText('LAX')
    await expect(recentList).toContainText('JFK')
    await expect(recentList).toContainText('1 passenger')
  })

  test('RecentSearches clicking a recent search re-populates the form', async ({ page }) => {
    // Perform a search: LAX → JFK with 2 adults, Business class
    await fillSearchForm(page, {
      originSearch: 'Los',
      originCode: 'LAX',
      destSearch: 'New',
      destCode: 'JFK',
      adults: 2,
      cabinClass: 'business',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Navigate back to search page
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    // Click the recent search entry
    const recentList = page.getByTestId('recent-searches-list')
    await expect(recentList).toBeVisible({ timeout: 10000 })
    const recentItem = recentList.locator('button').first()
    await recentItem.click()

    // Should navigate to results with the search parameters
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })
    const url = page.url()
    expect(url).toContain('origin=LAX')
    expect(url).toContain('destination=JFK')
    expect(url).toContain('cabinClass=business')
    expect(url).toContain('adults=2')
  })

  test('RecentSearches displays multiple recent searches in order', async ({ page }) => {
    test.slow()

    // Search 1: LAX → JFK
    await fillSearchForm(page, {
      originSearch: 'Los',
      originCode: 'LAX',
      destSearch: 'New',
      destCode: 'JFK',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Go back
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    // Search 2: SFO → ORD
    await fillSearchForm(page, {
      originSearch: 'San Fran',
      originCode: 'SFO',
      destSearch: 'Chicago',
      destCode: 'ORD',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Go back
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    // Search 3: LAX → LHR
    await fillSearchForm(page, {
      originSearch: 'Los',
      originCode: 'LAX',
      destSearch: 'London',
      destCode: 'LHR',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Go back and check order
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    const recentList = page.getByTestId('recent-searches-list')
    await expect(recentList).toBeVisible({ timeout: 10000 })

    // Should have 3 items
    const items = recentList.locator('button')
    await expect(items).toHaveCount(3, { timeout: 10000 })

    // Most recent (LAX → LHR) should be first
    await expect(items.nth(0)).toContainText('LHR')
    // Second (SFO → ORD)
    await expect(items.nth(1)).toContainText('ORD')
    // Oldest (LAX → JFK)
    await expect(items.nth(2)).toContainText('JFK')
  })

  test('RecentSearches updates after a new search', async ({ page }) => {
    test.slow()

    // Search 1: LAX → JFK
    await fillSearchForm(page, {
      originSearch: 'Los',
      originCode: 'LAX',
      destSearch: 'New',
      destCode: 'JFK',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Go back and verify one search
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
    const recentList = page.getByTestId('recent-searches-list')
    await expect(recentList).toBeVisible({ timeout: 10000 })
    await expect(recentList.locator('button')).toHaveCount(1, { timeout: 10000 })

    // Search 2: SFO → ORD
    await fillSearchForm(page, {
      originSearch: 'San Fran',
      originCode: 'SFO',
      destSearch: 'Chicago',
      destCode: 'ORD',
    })
    await page.getByTestId('search-button').click()
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Go back and check
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })

    const updatedList = page.getByTestId('recent-searches-list')
    await expect(updatedList).toBeVisible({ timeout: 10000 })
    await expect(updatedList.locator('button')).toHaveCount(2, { timeout: 10000 })

    // Most recent (SFO → ORD) should be first
    await expect(updatedList.locator('button').nth(0)).toContainText('SFO')
    await expect(updatedList.locator('button').nth(0)).toContainText('ORD')
    // Older (LAX → JFK) should be second
    await expect(updatedList.locator('button').nth(1)).toContainText('LAX')
    await expect(updatedList.locator('button').nth(1)).toContainText('JFK')
  })
})
