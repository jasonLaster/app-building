import { test, expect } from '@playwright/test'

// b1111111: Loft, host Sarah, 1 seed review from Emma (rating 5, c5 a5 comm5 loc5 val4)
const PROPERTY_WITH_REVIEW = 'b1111111-1111-1111-1111-111111111111'
// b2222222: Villa, host Sarah, 0 seed reviews
const PROPERTY_NO_REVIEWS = 'b2222222-2222-2222-2222-222222222222'
const GUEST_EMMA_ID = 'a3333333-3333-3333-3333-333333333333'
const GUEST_ALEX_ID = 'a4444444-4444-4444-4444-444444444444'

async function deleteAllReviewsForProperty(page: import('@playwright/test').Page, propertyId: string) {
  const res = await page.request.get(`/api/reviews?property_id=${propertyId}`)
  const reviews = await res.json()
  for (const review of reviews) {
    await page.request.delete(`/api/reviews/${review.id}`)
  }
}

async function createBookingAndReview(
  page: import('@playwright/test').Page,
  propertyId: string,
  guestId: string,
  checkIn: string,
  checkOut: string,
  reviewData: { rating: number; cleanliness: number; accuracy: number; communication: number; location: number; value: number; comment: string }
) {
  const bookingRes = await page.request.post('/api/bookings', {
    data: {
      property_id: propertyId,
      guest_id: guestId,
      check_in: checkIn,
      check_out: checkOut,
      num_guests: 2,
      total_price: 500,
    },
  })
  const booking = await bookingRes.json()

  await page.request.post('/api/reviews', {
    data: {
      booking_id: booking.id,
      property_id: propertyId,
      guest_id: guestId,
      ...reviewData,
    },
  })
}

test.describe('Property Detail - ReviewsSection', () => {
  test('Reviews section displays average ratings by category', async ({ page }) => {
    // b1111111 has 1 seed review: cleanliness 5, accuracy 5, communication 5, location 5, value 4
    await page.goto(`/properties/${PROPERTY_WITH_REVIEW}`)

    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    const cleanliness = page.getByTestId('rating-category-cleanliness')
    await expect(cleanliness).toContainText('Cleanliness')
    await expect(cleanliness).toContainText('5.0')

    const accuracy = page.getByTestId('rating-category-accuracy')
    await expect(accuracy).toContainText('Accuracy')
    await expect(accuracy).toContainText('5.0')

    const communication = page.getByTestId('rating-category-communication')
    await expect(communication).toContainText('Communication')
    await expect(communication).toContainText('5.0')

    const location = page.getByTestId('rating-category-location')
    await expect(location).toContainText('Location')
    await expect(location).toContainText('5.0')

    const value = page.getByTestId('rating-category-value')
    await expect(value).toContainText('Value')
    await expect(value).toContainText('4.0')
  })

  test('Reviews section displays overall average rating and total review count', async ({ page }) => {
    // b1111111 has 1 seed review with rating 5
    await page.goto(`/properties/${PROPERTY_WITH_REVIEW}`)

    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    // Header: "5.0 · 1 review"
    await expect(section).toContainText('5.0')
    await expect(section).toContainText('1 review')
  })

  test('Reviews section displays individual review cards', async ({ page }) => {
    // b1111111 has 1 seed review from Emma Wilson
    await page.goto(`/properties/${PROPERTY_WITH_REVIEW}`)

    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    const reviewCards = section.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(1, { timeout: 10000 })

    const card = reviewCards.first()
    await expect(card).toContainText('Emma Wilson')
    await expect(card).toContainText('Absolutely loved this loft')
  })

  test('Review cards display guest avatar or initial', async ({ page }) => {
    test.slow()
    // b1111111 has review from Emma who has avatar
    // Set Alex's avatar to null, then create a review from Alex on b1111111 to test initial fallback
    await page.goto(`/properties/${PROPERTY_WITH_REVIEW}`)
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 30000 })

    // Remove Alex's avatar
    await page.request.put(`/api/users/${GUEST_ALEX_ID}`, {
      data: { avatar_url: null },
    })

    // Create a booking and review from Alex on this property
    await createBookingAndReview(page, PROPERTY_WITH_REVIEW, GUEST_ALEX_ID, '2025-08-01', '2025-08-05', {
      rating: 4,
      cleanliness: 4,
      accuracy: 4,
      communication: 4,
      location: 4,
      value: 4,
      comment: 'Great stay, testing avatar initial',
    })

    await page.reload()
    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    const reviewCards = section.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(2, { timeout: 10000 })

    // Emma's card should have an img avatar
    const emmaCard = reviewCards.filter({ hasText: 'Emma Wilson' })
    await expect(emmaCard.locator('img')).toBeVisible()

    // Alex's card should have initial (no img, shows 'A' initial)
    const alexCard = reviewCards.filter({ hasText: 'Alex Rivera' })
    await expect(alexCard.locator('img')).not.toBeVisible()
    // The initial should be displayed (first letter of name)
    await expect(alexCard).toContainText('A')
  })

  test('Reviews section shows message when property has no reviews', async ({ page }) => {
    // b2222222 has 0 seed reviews
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    await expect(section).toContainText('No reviews yet')

    // Category ratings should not be displayed
    await expect(page.getByTestId('rating-category-cleanliness')).not.toBeVisible()
  })

  test('Reviews section handles pagination or Show more for many reviews', async ({ page }) => {
    test.slow()

    // Navigate first to get request context
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 30000 })

    // Clean up any reviews
    await deleteAllReviewsForProperty(page, PROPERTY_NO_REVIEWS)

    // Create 8 bookings + reviews (non-overlapping dates)
    for (let i = 0; i < 8; i++) {
      const guestId = i % 2 === 0 ? GUEST_EMMA_ID : GUEST_ALEX_ID
      const month = String(i + 1).padStart(2, '0')
      await createBookingAndReview(page, PROPERTY_NO_REVIEWS, guestId, `2025-${month}-01`, `2025-${month}-05`, {
        rating: 4,
        cleanliness: 4,
        accuracy: 4,
        communication: 4,
        location: 4,
        value: 4,
        comment: `Pagination test review ${i + 1}`,
      })
    }

    await page.reload()
    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    // Should show only 6 initially
    const reviewCards = section.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(6, { timeout: 10000 })

    // "Show all 8 reviews" button should be visible
    const toggleBtn = page.getByTestId('reviews-toggle')
    await expect(toggleBtn).toBeVisible()
    await expect(toggleBtn).toContainText('Show all 8 reviews')
  })

  test('Clicking Show all reviews reveals all review cards', async ({ page }) => {
    test.slow()

    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 30000 })

    await deleteAllReviewsForProperty(page, PROPERTY_NO_REVIEWS)

    // Create 8 bookings + reviews
    for (let i = 0; i < 8; i++) {
      const guestId = i % 2 === 0 ? GUEST_EMMA_ID : GUEST_ALEX_ID
      const month = String(i + 1).padStart(2, '0')
      await createBookingAndReview(page, PROPERTY_NO_REVIEWS, guestId, `2025-${month}-10`, `2025-${month}-15`, {
        rating: 4,
        cleanliness: 4,
        accuracy: 4,
        communication: 4,
        location: 4,
        value: 4,
        comment: `Show all test review ${i + 1}`,
      })
    }

    await page.reload()
    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    // Initially 6 cards
    const reviewCards = section.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(6, { timeout: 10000 })

    // Click "Show all"
    const toggleBtn = page.getByTestId('reviews-toggle')
    await toggleBtn.click()

    // All 8 cards visible
    await expect(reviewCards).toHaveCount(8, { timeout: 10000 })

    // Button changes to "Show less"
    await expect(toggleBtn).toHaveText('Show less')
  })

  test('Reviews are ordered by most recent first', async ({ page }) => {
    test.slow()

    // Create 2 reviews with different dates on b2222222 to verify ordering
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 30000 })

    await deleteAllReviewsForProperty(page, PROPERTY_NO_REVIEWS)

    // Older review from Emma (January 2025)
    await createBookingAndReview(page, PROPERTY_NO_REVIEWS, GUEST_EMMA_ID, '2025-01-01', '2025-01-05', {
      rating: 3,
      cleanliness: 3,
      accuracy: 3,
      communication: 3,
      location: 3,
      value: 3,
      comment: 'Older review from Emma',
    })

    // Small delay to ensure different created_at timestamps
    await page.waitForTimeout(1000)

    // Newer review from Alex (February 2025)
    await createBookingAndReview(page, PROPERTY_NO_REVIEWS, GUEST_ALEX_ID, '2025-02-01', '2025-02-05', {
      rating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      value: 5,
      comment: 'Newer review from Alex',
    })

    await page.reload()
    const section = page.getByTestId('reviews-section')
    await expect(section).toBeVisible({ timeout: 30000 })

    const reviewCards = section.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(2, { timeout: 10000 })

    // Most recent (Alex) should appear first
    const firstCard = reviewCards.first()
    await expect(firstCard).toContainText('Alex Rivera')
    await expect(firstCard).toContainText('Newer review from Alex')
  })
})
