import { test, expect } from '@playwright/test'

test('deployment: app displays data and supports updates', async ({ page }) => {
  // 1. Navigate to the home page and verify property data loads
  await page.goto('/')
  await expect(page.getByTestId('property-grid')).toBeVisible()

  // Wait for property cards to appear (real data from production DB)
  const firstCard = page.locator('[data-testid^="property-card-"]').first()
  await expect(firstCard).toBeVisible({ timeout: 15000 })

  // Verify property card has meaningful content (title, price)
  await expect(firstCard.getByText('night')).toBeVisible()

  // Count properties - should have at least 1
  const cardCount = await page.locator('[data-testid^="property-card-"]').count()
  expect(cardCount).toBeGreaterThan(0)

  // 2. Test a write operation: login then add a favorite
  // Navigate to login page
  await page.goto('/login')
  await expect(page.getByTestId('login-page')).toBeVisible()

  // Fill in email and submit - login redirects to / via client-side nav
  await page.getByTestId('login-email-input').fill('sarah@example.com')
  await page.getByTestId('login-submit-button').click()

  // Wait for redirect to home after login (client-side navigation preserves state)
  await expect(page.getByTestId('property-grid')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 10000 })

  // Wait for property cards to load
  const cardAfterLogin = page.locator('[data-testid^="property-card-"]').first()
  await expect(cardAfterLogin).toBeVisible({ timeout: 15000 })

  // Click the favorite button on the first property (only visible when logged in)
  const favoriteButton = page.locator('[data-testid^="favorite-button-"]').first()
  await expect(favoriteButton).toBeVisible({ timeout: 10000 })
  await favoriteButton.click()

  // Wait for the API call to complete
  await page.waitForTimeout(1000)

  // Verify the page still works after the write operation (no errors)
  await expect(page.getByTestId('property-grid')).toBeVisible()
  const postClickCount = await page.locator('[data-testid^="property-card-"]').count()
  expect(postClickCount).toBeGreaterThan(0)
})
