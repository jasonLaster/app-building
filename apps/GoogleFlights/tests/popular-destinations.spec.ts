import { test, expect } from '@playwright/test'

test.describe('PopularDestinations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('PopularDestinations grid is displayed on search page', async ({ page }) => {
    const grid = page.getByTestId('popular-destinations-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Should have destination cards
    const cards = grid.locator('[data-testid^="popular-dest-"]:not([data-testid^="popular-dest-price-"])')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Each card should have city, country, and price info
    const firstCard = cards.first()
    await expect(firstCard).toBeVisible()
    // Card should contain text (city and country)
    const cardText = await firstCard.textContent()
    expect(cardText).toBeTruthy()
    expect(cardText!.length).toBeGreaterThan(0)
  })

  test('PopularDestinations card shows city country and price', async ({ page }) => {
    const grid = page.getByTestId('popular-destinations-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Check a specific destination card - NRT (Tokyo, Japan) is seeded
    const tokyoCard = page.getByTestId('popular-dest-NRT')
    await expect(tokyoCard).toBeVisible({ timeout: 10000 })

    // Should show city name
    await expect(tokyoCard).toContainText('Tokyo')
    // Should show country
    await expect(tokyoCard).toContainText('Japan')

    // Should show price
    const priceEl = page.getByTestId('popular-dest-price-NRT')
    await expect(priceEl).toBeVisible()
    await expect(priceEl).toContainText('from $')
  })

  test('PopularDestinations clicking a card initiates a search', async ({ page }) => {
    const grid = page.getByTestId('popular-destinations-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Click the first available destination card
    const cards = grid.locator('[data-testid^="popular-dest-"]:not([data-testid^="popular-dest-price-"])')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })

    // Get the IATA code from the first card's testid
    const firstCardTestId = await cards.first().getAttribute('data-testid')
    const iataCode = firstCardTestId!.replace('popular-dest-', '')

    // Click the card
    await cards.first().click()

    // Should navigate to results page with the destination
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })
    const url = page.url()
    expect(url).toContain(`destination=${iataCode}`)
  })

  test('PopularDestinations displays multiple cards in grid layout', async ({ page }) => {
    const grid = page.getByTestId('popular-destinations-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Should have multiple cards (seed data includes NRT, LHR, CDG, DXB, SIN, SYD, FCO, BKK)
    const cards = grid.locator('[data-testid^="popular-dest-"]:not([data-testid^="popular-dest-price-"])')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // Verify the grid contains multiple visible cards
    for (let i = 0; i < Math.min(count, 4); i++) {
      await expect(cards.nth(i)).toBeVisible()
    }
  })
})
