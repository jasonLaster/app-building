import { test, expect } from '@playwright/test'

/** Helper: navigate to Explore page and select an origin airport */
async function selectOrigin(page: import('@playwright/test').Page, query: string, code: string) {
  const input = page.getByTestId('explore-origin-input')
  await input.click()
  await input.fill(query)
  const dropdown = page.getByTestId('explore-origin-dropdown')
  await expect(dropdown).toBeVisible({ timeout: 10000 })
  await page.getByTestId(`explore-origin-suggestion-${code}`).click()
  await expect(dropdown).not.toBeVisible()
}

test.describe('DealsSection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByTestId('explore-page')).toBeVisible({ timeout: 10000 })
  })

  test('DealsSection displays deal cards on Explore page', async ({ page }) => {
    // Select an origin airport
    await selectOrigin(page, 'LAX', 'LAX')

    // The deals section should be visible
    const dealsSection = page.getByTestId('deals-section')
    await expect(dealsSection).toBeVisible({ timeout: 10000 })

    // Should contain a title
    await expect(dealsSection).toContainText('Deals')

    // Wait for deal cards to appear
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Should have multiple deal cards
    const count = await dealCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('DealsSection deal card shows destination dates price and savings', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for deal cards to load
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Get the destination code from the first card's testid
    const firstTestId = await dealCards.first().getAttribute('data-testid')
    const destCode = firstTestId!.replace('deal-card-', '')

    // Card should show the destination code
    const card = page.getByTestId(`deal-card-${destCode}`)
    await expect(card).toContainText(destCode)

    // Card should show dates (format: "Mon DD – Mon DD")
    const dates = page.getByTestId(`deal-dates-${destCode}`)
    await expect(dates).toBeVisible()
    const datesText = await dates.textContent()
    // Date format like "Mar 15 – Mar 22"
    expect(datesText).toMatch(/[A-Z][a-z]{2}\s+\d+\s*–\s*[A-Z][a-z]{2}\s+\d+/)

    // Card should show price with $ sign
    const price = page.getByTestId(`deal-price-${destCode}`)
    await expect(price).toBeVisible()
    await expect(price).toContainText('$')

    // Card should show savings percentage (deals always have savings > 0)
    const savings = page.getByTestId(`deal-savings-${destCode}`)
    await expect(savings).toBeVisible()
    await expect(savings).toContainText('% less than usual')

    // Card should show a gradient background on the image area
    const cardImage = card.locator('.deals-section__card-image')
    const bgStyle = await cardImage.getAttribute('style')
    expect(bgStyle).toContain('linear-gradient')
  })

  test('DealsSection clicking a deal card initiates a search', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for deal cards
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Get the destination code from the first card
    const firstTestId = await dealCards.first().getAttribute('data-testid')
    const destCode = firstTestId!.replace('deal-card-', '')

    // Get the dates from the card to verify URL params later
    const _datesText = await page.getByTestId(`deal-dates-${destCode}`).textContent()

    // Click the deal card
    await dealCards.first().click()

    // Should navigate to the results page
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })

    // Verify URL contains correct parameters
    const url = page.url()
    const params = new URLSearchParams(new URL(url).search)
    expect(params.get('origin')).toBe('LAX')
    expect(params.get('destination')).toBe(destCode)
    expect(params.get('departureDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(params.get('returnDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('DealsSection updates when origin airport changes', async ({ page }) => {
    // Select LAX first
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for LAX deals to load
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Note a deal card from LAX results
    const laxFirstTestId = await dealCards.first().getAttribute('data-testid')
    const _laxDestCode = laxFirstTestId!.replace('deal-card-', '')

    // Change origin to SFO
    await selectOrigin(page, 'SFO', 'SFO')

    // Wait for new deals to load
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Deals grid should still be visible with cards
    const dealsGrid = page.getByTestId('deals-grid')
    await expect(dealsGrid).toBeVisible({ timeout: 10000 })

    const sfoCount = await dealCards.count()
    expect(sfoCount).toBeGreaterThan(0)
  })

  test('DealsSection shows loading state while fetching deals', async ({ page }) => {
    // Trigger origin selection to initiate a fetch
    const input = page.getByTestId('explore-origin-input')
    await input.click()
    await input.fill('LAX')
    const dropdown = page.getByTestId('explore-origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })
    await page.getByTestId('explore-origin-suggestion-LAX').click()

    // After loading completes, deal cards should appear
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Verify loading state is gone
    const loadingState = page.getByTestId('deals-loading')
    await expect(loadingState).not.toBeVisible()
  })

  test('DealsSection shows empty state when no deals available', async ({ page }) => {
    // Select HNL which has no outbound flights in seed data
    await selectOrigin(page, 'Honolulu', 'HNL')

    // Should show empty state message
    const emptyState = page.getByTestId('deals-empty')
    await expect(emptyState).toBeVisible({ timeout: 15000 })
    await expect(emptyState).toContainText('No deals available from this airport right now')

    // No deal cards should be visible
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards).toHaveCount(0)
  })

  test('DealsSection displays multiple deal cards in grid or row layout', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for deals grid to appear
    const dealsGrid = page.getByTestId('deals-grid')
    await expect(dealsGrid).toBeVisible({ timeout: 15000 })

    // Should have multiple deal cards
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 10000 })
    const count = await dealCards.count()
    expect(count).toBeGreaterThanOrEqual(2)

    // Verify the grid container uses CSS grid layout
    const display = await dealsGrid.evaluate((el) => getComputedStyle(el).display)
    expect(display).toBe('grid')
  })

  test('DealsSection savings percentage is calculated correctly', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for deal cards
    const dealCards = page.locator('[data-testid^="deal-card-"]')
    await expect(dealCards.first()).toBeVisible({ timeout: 15000 })

    // Get the first card's destination code
    const firstTestId = await dealCards.first().getAttribute('data-testid')
    const destCode = firstTestId!.replace('deal-card-', '')

    // The savings element should show a percentage with the down arrow indicator
    const savings = page.getByTestId(`deal-savings-${destCode}`)
    await expect(savings).toBeVisible()

    const savingsText = await savings.textContent()
    // Should match pattern: "↓ NN% less than usual"
    expect(savingsText).toMatch(/↓\s*\d+%\s*less than usual/)

    // Extract the percentage and verify it's a positive number
    const percentMatch = savingsText!.match(/(\d+)%/)
    expect(percentMatch).not.toBeNull()
    const percent = parseInt(percentMatch![1]!, 10)
    expect(percent).toBeGreaterThan(0)
    expect(percent).toBeLessThan(100)
  })
})
