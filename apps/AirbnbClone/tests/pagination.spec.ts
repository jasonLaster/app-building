import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

const HOST_ID = 'a1111111-1111-1111-1111-111111111111'
const BASE_URL = 'http://localhost:8888'

const SEED_PROPERTY_IDS = [
  'b1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'b3333333-3333-3333-3333-333333333333',
  'b4444444-4444-4444-4444-444444444444',
  'b5555555-5555-5555-5555-555555555555',
]

async function cleanupTestProperties(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/properties?limit=1000`)
  const data = await res.json()
  for (const prop of data.properties) {
    if (!SEED_PROPERTY_IDS.includes(prop.id)) {
      await fetch(`${BASE_URL}/api/properties/${prop.id}`, { method: 'DELETE' })
    }
  }
}

async function seedExtraProperties(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await fetch(`${BASE_URL}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host_id: HOST_ID,
        title: `Pagination Test Property ${i + 1} ${Date.now()}`,
        description: `Test property for pagination ${i + 1}`,
        property_type: 'Apartment',
        price_per_night: 100 + i,
        cleaning_fee: 30,
        max_guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1,
        address: `${100 + i} Test St`,
        city: 'TestCity',
        state: 'TS',
        country: 'United States',
      }),
    })
  }
}

test.describe('Home Page - Pagination', () => {
  test.beforeEach(async () => {
    await cleanupTestProperties()
  })

  test.describe('Multi-page tests', () => {
    // Seed has 5 properties, create 30 more for 35 total (3 pages of 12)
    test.beforeEach(async () => {
      await seedExtraProperties(30)
    })

    test('Pagination controls are displayed when results exceed one page', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      await expect(page.getByTestId('pagination')).toBeVisible()
      await expect(page.getByTestId('pagination-previous')).toBeVisible()
      await expect(page.getByTestId('pagination-next')).toBeVisible()
      await expect(page.getByTestId('pagination-page-1')).toBeVisible()
      await expect(page.getByTestId('pagination-page-2')).toBeVisible()
    })

    test('Clicking Next page loads the next set of properties', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // Verify we start on page 1 with 12 cards
      await expect(page.locator('[data-testid^="property-card-"]')).toHaveCount(12, { timeout: 15000 })

      // Click Next
      await page.getByTestId('pagination-next').click()

      // Verify page 2 is now active
      await expect(page.getByTestId('pagination-page-2')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Previous button should now be enabled
      await expect(page.getByTestId('pagination-previous')).toBeEnabled()

      // Page 2 should have cards loaded
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })
    })

    test('Clicking Previous page loads the previous set of properties', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // Navigate to page 2 first
      await page.getByTestId('pagination-next').click()
      await expect(page.getByTestId('pagination-page-2')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Click Previous
      await page.getByTestId('pagination-previous').click()

      // Verify page 1 is active again
      await expect(page.getByTestId('pagination-page-1')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Previous button should be disabled on page 1
      await expect(page.getByTestId('pagination-previous')).toBeDisabled()

      // Should have 12 cards (full first page)
      await expect(page.locator('[data-testid^="property-card-"]')).toHaveCount(12, { timeout: 15000 })
    })

    test('Clicking a specific page number navigates to that page', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // Click page 3
      await page.getByTestId('pagination-page-3').click()

      // Verify page 3 is active
      await expect(page.getByTestId('pagination-page-3')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Cards should be visible on page 3
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 15000 })
    })

    test('Next button is disabled on the last page', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // With 35 properties and limit 12: 3 pages (12, 12, 11)
      // Navigate to the last page (page 3)
      await page.getByTestId('pagination-page-3').click()
      await expect(page.getByTestId('pagination-page-3')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Next button should be disabled on the last page
      await expect(page.getByTestId('pagination-next')).toBeDisabled()

      // Previous button should be enabled
      await expect(page.getByTestId('pagination-previous')).toBeEnabled()
    })

    test('Previous button is disabled on the first page', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // On page 1, Previous should be disabled
      await expect(page.getByTestId('pagination-previous')).toBeDisabled()

      // Next should be enabled since there are multiple pages
      await expect(page.getByTestId('pagination-next')).toBeEnabled()
    })

    test('Applying filters resets pagination to page 1', async ({ page }) => {
      test.slow()
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // Navigate to page 3
      await page.getByTestId('pagination-page-3').click()
      await expect(page.getByTestId('pagination-page-3')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Apply a category filter by clicking the "Cabin" chip
      await page.getByTestId('category-chip-Cabin').click()

      // Wait for the grid to update with filtered results
      // Only 1 Cabin exists in seed data (Mountain Cabin Retreat), extras are all Apartment
      await expect(page.locator('[data-testid^="property-card-"]')).toHaveCount(1, { timeout: 15000 })

      // Pagination should be hidden since only 1 result fits on one page
      // This confirms pagination was reset to page 1 (the only page of filtered results)
      await expect(page.getByTestId('pagination')).toHaveCount(0)
    })

    test('Pagination is functional on repeated use', async ({ page }) => {
      test.slow()
      await page.goto('/')
      await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

      // Start on page 1
      await expect(page.getByTestId('pagination-page-1')).toHaveClass(/bg-text/)

      // Click Next -> page 2
      await page.getByTestId('pagination-next').click()
      await expect(page.getByTestId('pagination-page-2')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Click Next -> page 3
      await page.getByTestId('pagination-next').click()
      await expect(page.getByTestId('pagination-page-3')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Click Previous -> page 2
      await page.getByTestId('pagination-previous').click()
      await expect(page.getByTestId('pagination-page-2')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Click page 1 directly
      await page.getByTestId('pagination-page-1').click()
      await expect(page.getByTestId('pagination-page-1')).toHaveClass(/bg-text/, { timeout: 15000 })

      // Verify page 1 state: 12 cards, previous disabled
      await expect(page.locator('[data-testid^="property-card-"]')).toHaveCount(12, { timeout: 15000 })
      await expect(page.getByTestId('pagination-previous')).toBeDisabled()
    })
  })

  test('Pagination controls are hidden when all results fit on one page', async ({ page }) => {
    // With only 5 seed properties and limit 12, pagination should be hidden
    await page.goto('/')
    await expect(page.locator('[data-testid^="property-card-"]').first()).toBeVisible({ timeout: 30000 })

    // All 5 seed properties fit on one page
    await expect(page.locator('[data-testid^="property-card-"]')).toHaveCount(5, { timeout: 15000 })

    // Pagination should not be visible
    await expect(page.getByTestId('pagination')).toHaveCount(0)
  })
})
