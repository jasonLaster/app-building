import { test, expect } from '@playwright/test'

const EMMA_ID = 'a3333333-3333-3333-3333-333333333333'
const PROPERTY_VILLA = 'b2222222-2222-2222-2222-222222222222'
const PROPERTY_CABIN = 'b3333333-3333-3333-3333-333333333333'
const PROPERTY_APARTMENT = 'b4444444-4444-4444-4444-444444444444'

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

async function deleteAllReviewsForGuest(page: import('@playwright/test').Page, guestId: string) {
  const res = await page.request.get(`/api/reviews?guest_id=${guestId}`)
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
  reviewData: { rating: number; cleanliness: number; accuracy: number; communication: number; location: number; value: number; comment: string; created_at?: string }
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

  test('Reviews list shows review details correctly', async ({ page }) => {
    test.slow()
    // Set up: delete existing reviews for Emma, create one with specific details
    await login(page, 'emma@example.com')

    await deleteAllReviewsForGuest(page, EMMA_ID)
    await createBookingAndReview(page, PROPERTY_VILLA, EMMA_ID, '2025-07-01', '2025-07-05', {
      rating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      value: 5,
      comment: 'Amazing stay! The host was very welcoming.',
      created_at: '2026-01-15T12:00:00.000Z',
    })

    await page.goto('/profile')
    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })

    const reviewCards = page.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(1, { timeout: 30000 })

    const card = reviewCards.first()

    // Verify property title
    await expect(card).toContainText('Beachfront Villa with Private Pool')

    // Verify 5 filled stars
    const starRating = card.getByTestId('star-rating')
    await expect(starRating).toBeVisible()
    const filledStars = starRating.locator('svg[fill="currentColor"]')
    await expect(filledStars).toHaveCount(5)

    // Verify comment text
    await expect(card).toContainText('Amazing stay! The host was very welcoming.')

    // Verify formatted date "Jan 15, 2026"
    await expect(card).toContainText('Jan 15, 2026')
  })

  test('Reviews list updates after writing a new review', async ({ page }) => {
    test.slow()
    // Set up: delete all of Emma's reviews, create 2 new reviews via API
    await login(page, 'emma@example.com')

    await deleteAllReviewsForGuest(page, EMMA_ID)

    // Create 2 reviews for Emma on different properties
    await createBookingAndReview(page, PROPERTY_VILLA, EMMA_ID, '2025-06-01', '2025-06-05', {
      rating: 4,
      cleanliness: 4,
      accuracy: 4,
      communication: 4,
      location: 4,
      value: 4,
      comment: 'Great villa stay',
    })
    await createBookingAndReview(page, PROPERTY_CABIN, EMMA_ID, '2025-07-01', '2025-07-05', {
      rating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      value: 5,
      comment: 'Wonderful cabin retreat',
    })

    // Navigate to profile and verify 2 existing reviews
    await page.goto('/profile')
    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })
    const reviewCards = page.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(2, { timeout: 30000 })

    // Emma's seed booking e1111111 is 'completed' for Cozy Downtown Loft.
    // Its review was deleted above, so "Write Review" should be available.
    // Navigate to write a review for that booking
    await page.goto('/trips/e1111111-1111-1111-1111-111111111111/review')
    await expect(page.getByTestId('review-form')).toBeVisible({ timeout: 30000 })

    // Fill in the review
    await page.getByTestId('review-comment-textarea').fill('Fantastic loft with amazing views!')
    await page.getByTestId('submit-review-button').click()

    // Wait for success
    await expect(page.getByTestId('review-success-message')).toBeVisible({ timeout: 30000 })

    // Navigate back to profile
    await page.goto('/profile')
    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })

    // Should now show 3 reviews
    await expect(reviewCards).toHaveCount(3, { timeout: 30000 })

    // Verify the newly written review is present with correct property title and comment
    const newReviewCard = reviewCards.filter({
      has: page.locator('[data-testid^="review-property-link-"]', { hasText: 'Cozy Downtown Loft with City Views' }),
    })
    await expect(newReviewCard).toHaveCount(1)
    await expect(newReviewCard).toContainText('Fantastic loft with amazing views!')
  })

  test('Reviews list shows multiple reviews in chronological order', async ({ page }) => {
    test.slow()
    // Set up: delete all of Emma's reviews, create 3 with specific dates
    await login(page, 'emma@example.com')

    await deleteAllReviewsForGuest(page, EMMA_ID)

    // Create 3 reviews with different dates (inserted in non-chronological order to test sorting)
    await createBookingAndReview(page, PROPERTY_VILLA, EMMA_ID, '2025-06-01', '2025-06-05', {
      rating: 4,
      cleanliness: 4,
      accuracy: 4,
      communication: 4,
      location: 4,
      value: 4,
      comment: 'Great beachfront villa',
      created_at: '2026-01-15T12:00:00.000Z',
    })
    await createBookingAndReview(page, PROPERTY_APARTMENT, EMMA_ID, '2025-07-01', '2025-07-05', {
      rating: 4,
      cleanliness: 4,
      accuracy: 4,
      communication: 4,
      location: 4,
      value: 4,
      comment: 'Nice Austin apartment',
      created_at: '2026-02-10T12:00:00.000Z',
    })
    await createBookingAndReview(page, PROPERTY_CABIN, EMMA_ID, '2025-08-01', '2025-08-05', {
      rating: 5,
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      value: 5,
      comment: 'Amazing cabin retreat',
      created_at: '2026-03-05T12:00:00.000Z',
    })

    await page.goto('/profile')
    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })

    const reviewCards = page.locator('[data-testid^="review-card-"]')
    await expect(reviewCards).toHaveCount(3, { timeout: 30000 })

    // Reviews should be in reverse chronological order (newest first):
    // 1. Mountain Cabin Retreat (Mar 5, 2026)
    // 2. Modern Austin Apartment (Feb 10, 2026)
    // 3. Beachfront Villa with Private Pool (Jan 15, 2026)
    const firstCard = reviewCards.nth(0)
    await expect(firstCard).toContainText('Mountain Cabin Retreat')
    await expect(firstCard).toContainText('Mar 5, 2026')

    const secondCard = reviewCards.nth(1)
    await expect(secondCard).toContainText('Modern Austin Apartment')
    await expect(secondCard).toContainText('Feb 10, 2026')

    const thirdCard = reviewCards.nth(2)
    await expect(thirdCard).toContainText('Beachfront Villa with Private Pool')
    await expect(thirdCard).toContainText('Jan 15, 2026')
  })
})
