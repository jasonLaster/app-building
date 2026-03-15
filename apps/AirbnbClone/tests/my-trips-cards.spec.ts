import { test, expect } from '@playwright/test'

async function loginAs(page: import('@playwright/test').Page, email: string) {
  // Log out first if already logged in
  const logoutBtn = page.getByTestId('sidebar-logout')
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click()
    await expect(page).toHaveURL(/\/login/, { timeout: 30000 })
  }
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('My Trips Page - TripCard', () => {
  test.beforeEach(async ({ request }) => {
    // Clean up non-seed bookings and reset seed booking statuses
    await request.delete('http://localhost:8888/api/bookings')
    // Re-create seed review for e4444444 if it was deleted by a previous test
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

  test('Trip card displays all required information', async ({ page }) => {
    // Emma has a confirmed booking e6666666: Historic Townhouse in Georgetown, Washington, Jun 15-20, $1475
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    const card = page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Property title
    await expect(card).toContainText('Historic Townhouse in Georgetown')
    // City
    await expect(card).toContainText('Washington')
    // Date range (Jun 15, 2026 – Jun 20, 2026)
    await expect(card).toContainText('Jun 15, 2026')
    await expect(card).toContainText('Jun 20, 2026')
    // Status badge
    await expect(page.getByTestId('status-badge-e6666666-6666-6666-6666-666666666666')).toHaveText('Confirmed')
    // Total price
    await expect(card).toContainText('$1475')
    // Property image
    await expect(card.locator('img')).toBeVisible()
  })

  test('Trip card displays correct status badge colors', async ({ page }) => {
    test.slow()
    // Emma has pending (e3333333) and confirmed (e6666666) in upcoming, completed (e1111111) in past
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Pending badge - yellow
    const pendingBadge = page.getByTestId('status-badge-e3333333-3333-3333-3333-333333333333')
    await expect(pendingBadge).toBeVisible({ timeout: 30000 })
    await expect(pendingBadge).toHaveText('Pending')
    await expect(pendingBadge).toHaveClass(/text-status-pending/)

    // Confirmed badge - green
    const confirmedBadge = page.getByTestId('status-badge-e6666666-6666-6666-6666-666666666666')
    await expect(confirmedBadge).toHaveText('Confirmed')
    await expect(confirmedBadge).toHaveClass(/text-status-confirmed/)

    // Switch to Past tab for completed badge - blue
    await page.getByTestId('tab-past').click()
    const completedBadge = page.getByTestId('status-badge-e1111111-1111-1111-1111-111111111111')
    await expect(completedBadge).toBeVisible({ timeout: 30000 })
    await expect(completedBadge).toHaveText('Completed')
    await expect(completedBadge).toHaveClass(/text-status-completed/)

    // Log in as Alex to check cancelled badge - red
    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-cancelled').click()
    const cancelledBadge = page.getByTestId('status-badge-e5555555-5555-5555-5555-555555555555')
    await expect(cancelledBadge).toBeVisible({ timeout: 30000 })
    await expect(cancelledBadge).toHaveText('Cancelled')
    await expect(cancelledBadge).toHaveClass(/text-status-cancelled/)
  })

  test('Trip card shows property image or placeholder', async ({ page }) => {
    // Emma's bookings all have property images from the seed data
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Card with property image (e3333333 - Mountain Cabin has images)
    const cardWithImage = page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')
    await expect(cardWithImage).toBeVisible({ timeout: 30000 })
    await expect(cardWithImage.locator('img')).toBeVisible()
  })

  test('Clicking trip card navigates to booking details', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Click on the confirmed townhouse card (e6666666, property b5555555)
    const card = page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')
    await expect(card).toBeVisible({ timeout: 30000 })
    await card.click()

    // Should navigate to the property detail page
    await expect(page).toHaveURL(/\/properties\/b5555555-5555-5555-5555-555555555555/, { timeout: 30000 })
  })

  test('Cancel button appears on pending bookings', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // e3333333 is pending
    const cancelBtn = page.getByTestId('cancel-button-e3333333-3333-3333-3333-333333333333')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await expect(cancelBtn).toBeEnabled()
  })

  test('Cancel button appears on confirmed bookings', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // e6666666 is confirmed
    const cancelBtn = page.getByTestId('cancel-button-e6666666-6666-6666-6666-666666666666')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await expect(cancelBtn).toBeEnabled()
  })

  test('Cancel button does not appear on completed bookings', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Switch to Past tab
    await page.getByTestId('tab-past').click()

    // e1111111 is completed
    await expect(page.getByTestId('trip-card-e1111111-1111-1111-1111-111111111111')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('cancel-button-e1111111-1111-1111-1111-111111111111')).not.toBeVisible()
  })

  test('Cancel button does not appear on already cancelled bookings', async ({ page }) => {
    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Switch to Cancelled tab
    await page.getByTestId('tab-cancelled').click()

    // e5555555 is cancelled
    await expect(page.getByTestId('trip-card-e5555555-5555-5555-5555-555555555555')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('cancel-button-e5555555-5555-5555-5555-555555555555')).not.toBeVisible()
  })

  test('Write Review button appears on completed bookings without a review', async ({ page }) => {
    // Both seed completed bookings have reviews. Delete Alex's review for e4444444
    // to create a completed booking without a review.
    const reviewsRes = await page.request.get('/api/reviews?property_id=b4444444-4444-4444-4444-444444444444')
    const reviews = await reviewsRes.json()
    for (const review of reviews) {
      await page.request.delete(`/api/reviews/${review.id}`)
    }

    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('tab-past').click()

    // e4444444 is completed without a review now - Write Review button should appear
    await expect(page.getByTestId('trip-card-e4444444-4444-4444-4444-444444444444')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('review-button-e4444444-4444-4444-4444-444444444444')).toBeVisible({ timeout: 30000 })
  })

  test('Write Review button does not appear on completed bookings that already have a review', async ({ page }) => {
    // Alex's completed booking e4444444 has a review in seed data
    await loginAs(page, 'alex@example.com')
    await page.goto('/trips')

    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    await page.getByTestId('tab-past').click()

    // e4444444 is completed with a review
    await expect(page.getByTestId('trip-card-e4444444-4444-4444-4444-444444444444')).toBeVisible({ timeout: 30000 })

    // Write Review button should NOT be visible
    await expect(page.getByTestId('review-button-e4444444-4444-4444-4444-444444444444')).not.toBeVisible()

    // Instead, the "Reviewed" badge should appear
    await expect(page.getByTestId('reviewed-badge-e4444444-4444-4444-4444-444444444444')).toBeVisible()
  })
})
