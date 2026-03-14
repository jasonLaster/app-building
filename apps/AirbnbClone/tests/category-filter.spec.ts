import { test, expect } from '@playwright/test'

test.describe('Home Page - CategoryFilter', () => {
  test('Category filter bar displays all property type chips', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('category-filter')).toBeVisible({ timeout: 30000 })

    const types = ['Apartment', 'House', 'Cabin', 'Villa', 'Condo', 'Loft', 'Cottage', 'Townhouse']
    for (const type of types) {
      await expect(page.getByTestId(`category-chip-${type}`)).toBeVisible()
    }

    // No chip is selected by default
    for (const type of types) {
      await expect(page.getByTestId(`category-chip-${type}`)).not.toHaveClass(/bg-text/)
    }
  })

  test('Clicking a category chip filters properties by that type', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    await page.getByTestId('category-chip-Cabin').click()

    const cards = page.locator('[data-testid^="property-card-"]')
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Verify the chip is visually selected
    await expect(page.getByTestId('category-chip-Cabin')).toHaveClass(/bg-text/)
  })

  test('Clicking the selected category chip deselects it and shows all properties', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Select Cabin
    await page.getByTestId('category-chip-Cabin').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Deselect Cabin
    await page.getByTestId('category-chip-Cabin').click()
    await expect(cards).toHaveCount(5, { timeout: 15000 })
    await expect(page.getByTestId('category-chip-Cabin')).not.toHaveClass(/bg-text/)
  })

  test('Switching between category chips updates the filter', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Select Cabin
    await page.getByTestId('category-chip-Cabin').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('category-chip-Cabin')).toHaveClass(/bg-text/)

    // Switch to Villa
    await page.getByTestId('category-chip-Villa').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('category-chip-Villa')).toHaveClass(/bg-text/)
    await expect(page.getByTestId('category-chip-Cabin')).not.toHaveClass(/bg-text/)
  })

  test('Category filter works in combination with search bar', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Search by location first
    await page.getByTestId('search-location').fill('New York')
    await page.getByTestId('search-button').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Apply matching category filter (the NY property is a Loft)
    await page.getByTestId('category-chip-Loft').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })

    // Switch to a non-matching category (no Cabin in New York)
    await page.getByTestId('category-chip-Cabin').click()
    await expect(page.getByTestId('property-grid-empty')).toBeVisible({ timeout: 15000 })
  })

  test('Category filter bar is horizontally scrollable when chips overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.getByTestId('category-filter')).toBeVisible({ timeout: 30000 })

    const isScrollable = await page.getByTestId('category-filter').evaluate(el => {
      return el.scrollWidth > el.clientWidth
    })
    expect(isScrollable).toBe(true)

    const overflow = await page.getByTestId('category-filter').evaluate(el => {
      return getComputedStyle(el).overflowX
    })
    expect(overflow).toBe('auto')
  })

  test('Category chip is functional on repeated use', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    const cards = page.locator('[data-testid^="property-card-"]')

    // Click Apartment → filtered to 1
    await page.getByTestId('category-chip-Apartment').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('category-chip-Apartment')).toHaveClass(/bg-text/)

    // Switch to House (no House properties in seed data)
    await page.getByTestId('category-chip-House').click()
    await expect(page.getByTestId('property-grid-empty')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('category-chip-House')).toHaveClass(/bg-text/)
    await expect(page.getByTestId('category-chip-Apartment')).not.toHaveClass(/bg-text/)

    // Deselect House → shows all properties
    await page.getByTestId('category-chip-House').click()
    await expect(cards).toHaveCount(5, { timeout: 15000 })
    await expect(page.getByTestId('category-chip-House')).not.toHaveClass(/bg-text/)

    // Click Cabin → filtered to 1
    await page.getByTestId('category-chip-Cabin').click()
    await expect(cards).toHaveCount(1, { timeout: 15000 })
    await expect(page.getByTestId('category-chip-Cabin')).toHaveClass(/bg-text/)
  })
})
