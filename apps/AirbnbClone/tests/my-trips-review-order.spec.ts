import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('currentUser'))
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('My Trips - Review & Ordering', () => {
  test.beforeEach(async ({ request }) => {
    // Reset booking statuses and re-create seed review for e4444444 if deleted
    await request.delete('http://localhost:8888/api/bookings')
    await request.post('http://localhost:8888/api/reviews', {
      data: {
        booking_id: 'e4444444-4444-4444-4444-444444444444',
        property_id: 'b4444444-4444-4444-4444-444444444444',
        guest_id: 'a4444444-4444-4444-4444-444444444444',
        rating: 4,
        cleanliness: 4,
        accuracy: 4,
        communication: 5,
        location: 5,
        value: 4,
        comment: 'Great location in SoCo.'
      }
    })
  })

  test('Clicking Write Review button navigates to review page', async ({ page }) => {
    // Delete Alex's review for e4444444 so the Write Review button appears
    const reviewsRes = await page.request.get('/api/reviews?property_id=b4444444-4444-4444-4444-444444444444')
    const reviews = await reviewsRes.json()
    for (const review of reviews) {
      await page.request.delete(`/api/reviews/${review.id}`)
    }

    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('tab-past').click()

    // e4444444 is completed without a review now
    const reviewBtn = page.getByTestId('review-button-e4444444-4444-4444-4444-444444444444')
    await expect(reviewBtn).toBeVisible({ timeout: 30000 })

    await reviewBtn.click()

    // Should navigate to the review page for this booking
    await expect(page).toHaveURL(/\/trips\/e4444444-4444-4444-4444-444444444444\/review/, { timeout: 30000 })
  })

  test('Write Review button does not appear on pending, confirmed, or cancelled bookings', async ({ page }) => {
    test.slow()
    // Check pending booking (Emma's e3333333)
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Upcoming tab: e3333333 is pending, e6666666 is confirmed
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('review-button-e3333333-3333-3333-3333-333333333333')).not.toBeVisible()

    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible()
    await expect(page.getByTestId('review-button-e6666666-6666-6666-6666-666666666666')).not.toBeVisible()

    // Check cancelled booking (Alex's e5555555)
    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('tab-cancelled').click()
    await expect(page.getByTestId('trip-card-e5555555-5555-5555-5555-555555555555')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('review-button-e5555555-5555-5555-5555-555555555555')).not.toBeVisible()
  })

  test('Trip cards are ordered by check-in date', async ({ page }) => {
    // Emma has three upcoming bookings:
    // e3333333: check_in 2026-05-10 (Mountain Cabin) - pending
    // e6666666: check_in 2026-06-15 (Historic Townhouse) - confirmed
    // e7777777: check_in 2026-07-01 (Beachfront Villa) - confirmed
    // They should appear in chronological order
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // All three cards should be visible in Upcoming tab
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible()
    await expect(page.getByTestId('trip-card-e7777777-7777-7777-7777-777777777777')).toBeVisible()

    // Get all trip cards in the list and verify order
    const tripCards = page.getByTestId('trips-list').locator('[data-testid^="trip-card-"]')
    await expect(tripCards).toHaveCount(3, { timeout: 30000 })

    // First card should be the earliest check-in (May 10 - Mountain Cabin)
    await expect(tripCards.nth(0)).toContainText('May 10, 2026')
    // Second card should be the next check-in (Jun 15 - Historic Townhouse)
    await expect(tripCards.nth(1)).toContainText('Jun 15, 2026')
    // Third card should be the latest check-in (Jul 1 - Beachfront Villa)
    await expect(tripCards.nth(2)).toContainText('Jul 1, 2026')
  })
})
