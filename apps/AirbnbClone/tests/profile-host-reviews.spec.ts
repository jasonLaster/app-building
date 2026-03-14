import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('Profile Page - BecomeHostButton', () => {
  test('Become a Host button is visible for non-host users', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('become-host-button')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('become-host-button')).toContainText('Become a Host')
  })

  test('Become a Host button is hidden for existing hosts', async ({ page }) => {
    test.slow()
    await login(page, 'sarah@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('profile-page')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('become-host-button')).not.toBeVisible()
  })

  test('Clicking Become a Host sets user as host', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('become-host-button')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('become-host-button').click()

    // Confirmation dialog appears
    await expect(page.getByTestId('become-host-dialog')).toBeVisible()

    // Confirm
    await page.getByTestId('become-host-confirm').click()

    // Button disappears and success message shown
    await expect(page.getByTestId('become-host-success')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('become-host-success')).toContainText('You are now a host!')
    await expect(page.getByTestId('become-host-button')).not.toBeVisible()

    // Hosting link now visible in sidebar
    await expect(page.getByTestId('sidebar-link-hosting')).toBeVisible({ timeout: 30000 })
  })

  test('Cancel Become a Host confirmation dialog', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('become-host-button')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('become-host-button').click()

    // Dialog appears
    await expect(page.getByTestId('become-host-dialog')).toBeVisible()

    // Cancel
    await page.getByTestId('become-host-cancel').click()

    // Dialog closes, button remains
    await expect(page.getByTestId('become-host-dialog')).not.toBeVisible()
    await expect(page.getByTestId('become-host-button')).toBeVisible()
  })

  test('Become a Host button appearance', async ({ page }) => {
    test.slow()
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('become-host-button')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('become-host-button')).toContainText('Become a Host')

    const bgColor = await page.getByTestId('become-host-button').evaluate(
      (el) => getComputedStyle(el).backgroundColor
    )
    // #FF5A5F = rgb(255, 90, 95)
    expect(bgColor).toBe('rgb(255, 90, 95)')
  })
})

test.describe('Profile Page - UserReviewsList', () => {
  test('Reviews list displays user\'s written reviews', async ({ page }) => {
    test.slow()
    // Emma has 1 review for "Cozy Downtown Loft with City Views" rated 5
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('user-reviews-list')).toContainText('My Reviews')

    // Emma has 1 review in the seed data
    const reviewCards = page.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(1, { timeout: 30000 })

    // Verify review card content
    const reviewCard = reviewCards.first()
    await expect(reviewCard).toContainText('Cozy Downtown Loft with City Views')
    await expect(reviewCard.getByTestId('star-rating')).toBeVisible()
    await expect(reviewCard).toContainText('Absolutely loved this loft!')
  })

  test('Reviews list shows empty state for user with no reviews', async ({ page }) => {
    test.slow()
    // Register a new user who has no reviews
    const uniqueEmail = `noreview-${Date.now()}@example.com`
    await page.goto('/login')
    await page.getByTestId('auth-toggle-link').click()
    await expect(page.getByTestId('register-form')).toBeVisible()
    await page.getByTestId('register-name-input').fill('No Review User')
    await page.getByTestId('register-email-input').fill(uniqueEmail)
    await page.getByTestId('register-submit-button').click()
    await expect(page).toHaveURL('/', { timeout: 30000 })

    await page.goto('/profile')
    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('reviews-empty-state')).toBeVisible()
    await expect(page.getByTestId('reviews-empty-state')).toContainText("You haven't written any reviews yet")
  })

  test('Review card shows rating with star display', async ({ page }) => {
    test.slow()
    // Emma's review has rating 5
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })
    const reviewCards = page.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(1, { timeout: 30000 })

    const starRating = reviewCards.first().getByTestId('star-rating')
    await expect(starRating).toBeVisible()

    // Rating 5: all 5 stars should be filled (have fill="currentColor")
    const filledStars = starRating.locator('svg[fill="currentColor"]')
    await expect(filledStars).toHaveCount(5)
  })

  test('Review card links to the reviewed property', async ({ page }) => {
    test.slow()
    // Emma's review is for property b1111111-1111-1111-1111-111111111111
    await login(page, 'emma@example.com')
    await page.goto('/profile')

    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })
    const reviewCards = page.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(1, { timeout: 30000 })

    // Click the property link in the review card
    const propertyLink = reviewCards.first().locator('[data-testid^="review-property-link-"]')
    await expect(propertyLink).toContainText('Cozy Downtown Loft with City Views')
    await propertyLink.click()

    await expect(page).toHaveURL(/\/properties\/b1111111-1111-1111-1111-111111111111/, { timeout: 30000 })
  })
})
