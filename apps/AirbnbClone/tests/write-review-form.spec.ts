import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// Seed data references
const ALEX_EMAIL = 'alex@example.com'
const ALEX_ID = 'a4444444-4444-4444-4444-444444444444'
const ALEX_COMPLETED_BOOKING = 'e4444444-4444-4444-4444-444444444444'
const ALEX_COMPLETED_PROPERTY = 'b4444444-4444-4444-4444-444444444444'

const EMMA_EMAIL = 'emma@example.com'
const EMMA_COMPLETED_BOOKING = 'e1111111-1111-1111-1111-111111111111'

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

async function setAllRatings(
  page: import('@playwright/test').Page,
  ratings: Record<string, number>
) {
  for (const [key, value] of Object.entries(ratings)) {
    await page.getByTestId(`rating-input-${key}`).fill(String(value))
  }
}

async function navigateToReviewPage(page: import('@playwright/test').Page) {
  await login(page, ALEX_EMAIL)
  await deleteAllReviewsForGuest(page, ALEX_ID)
  await page.goto(`/trips/${ALEX_COMPLETED_BOOKING}/review`)
  await expect(page.getByTestId('review-form')).toBeVisible({ timeout: 30000 })
}

test.describe.serial('ReviewForm', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllReviewsForGuest(page, ALEX_ID)
  })

  test('Review form displays comment text area', async ({ page }) => {
    await login(page, ALEX_EMAIL)
    await page.goto(`/trips/${ALEX_COMPLETED_BOOKING}/review`)
    await expect(page.getByTestId('review-form')).toBeVisible({ timeout: 30000 })

    const textarea = page.getByTestId('review-comment-textarea')
    await expect(textarea).toBeVisible()
    await expect(textarea).toHaveAttribute('placeholder', /Tell others about your experience/)
  })

  test('Submit button is visible', async ({ page }) => {
    await login(page, ALEX_EMAIL)
    await page.goto(`/trips/${ALEX_COMPLETED_BOOKING}/review`)
    await expect(page.getByTestId('review-form')).toBeVisible({ timeout: 30000 })

    const submitBtn = page.getByTestId('submit-review-button')
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toContainText('Submit Review')
  })

  test('Type a comment in the text area', async ({ page }) => {
    await navigateToReviewPage(page)

    const comment = 'Amazing stay! The villa was beautiful and the host was very responsive.'
    await page.getByTestId('review-comment-textarea').fill(comment)
    await expect(page.getByTestId('review-comment-textarea')).toHaveValue(comment)
  })

  test('Submit review with all ratings and comment', async ({ page }) => {
    test.slow()
    await navigateToReviewPage(page)

    await setAllRatings(page, {
      rating: 5,
      cleanliness: 5,
      accuracy: 4,
      communication: 5,
      location: 4,
      value: 4,
    })

    await page.getByTestId('review-comment-textarea').fill(
      'Wonderful experience, would definitely come back!'
    )

    await page.getByTestId('submit-review-button').click()
    await expect(page).toHaveURL(/\/trips/, { timeout: 30000 })
  })

  test('Submitted review appears on property detail page', async ({ page }) => {
    test.slow()
    await navigateToReviewPage(page)

    // Submit review
    await setAllRatings(page, {
      rating: 5,
      cleanliness: 5,
      accuracy: 4,
      communication: 5,
      location: 4,
      value: 4,
    })
    await page.getByTestId('review-comment-textarea').fill(
      'Wonderful experience, would definitely come back!'
    )
    await page.getByTestId('submit-review-button').click()
    await expect(page).toHaveURL(/\/trips/, { timeout: 30000 })

    // Navigate to property detail page
    await page.goto(`/properties/${ALEX_COMPLETED_PROPERTY}`)
    await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 30000 })

    // Verify the property's average rating and review count are updated
    const reviewCountLink = page.getByTestId('review-count-link')
    await expect(reviewCountLink).toBeVisible({ timeout: 30000 })
    await expect(reviewCountLink).toContainText('5.00')
    await expect(reviewCountLink).toContainText('1 review')

    // Verify the review appears with guest name, rating, and comment
    const reviewsSection = page.getByTestId('reviews-section')
    await expect(reviewsSection).toContainText('Alex Rivera')
    await expect(reviewsSection).toContainText(
      'Wonderful experience, would definitely come back!'
    )
  })

  test('Submitted review appears in user profile reviews list', async ({ page }) => {
    test.slow()
    await navigateToReviewPage(page)

    // Submit review
    await setAllRatings(page, {
      rating: 5,
      cleanliness: 5,
      accuracy: 4,
      communication: 5,
      location: 4,
      value: 4,
    })
    await page.getByTestId('review-comment-textarea').fill(
      'Wonderful experience, would definitely come back!'
    )
    await page.getByTestId('submit-review-button').click()
    await expect(page).toHaveURL(/\/trips/, { timeout: 30000 })

    // Navigate to profile
    await page.goto('/profile')
    await expect(page.getByTestId('user-reviews-list')).toBeVisible({ timeout: 30000 })

    // Verify review appears in the user's reviews list
    const reviewsList = page.getByTestId('user-reviews-list')
    await expect(reviewsList).toContainText('Modern Austin Apartment')
    await expect(reviewsList).toContainText(
      'Wonderful experience, would definitely come back!'
    )
  })

  test('Submit review with ratings but no comment', async ({ page }) => {
    test.slow()
    await navigateToReviewPage(page)

    // Set all ratings to 3 (from default 0)
    await setAllRatings(page, {
      rating: 3,
      cleanliness: 3,
      accuracy: 3,
      communication: 3,
      location: 3,
      value: 3,
    })

    // Leave comment empty — comment is optional
    await expect(page.getByTestId('review-comment-textarea')).toHaveValue('')

    await page.getByTestId('submit-review-button').click()
    await expect(page).toHaveURL(/\/trips/, { timeout: 30000 })
  })

  test('Submit button is disabled when ratings are not set', async ({ page }) => {
    await login(page, ALEX_EMAIL)
    await page.goto(`/trips/${ALEX_COMPLETED_BOOKING}/review`)
    await expect(page.getByTestId('review-form')).toBeVisible({ timeout: 30000 })

    // No sliders adjusted — all at default 0 (Not rated)
    const submitBtn = page.getByTestId('submit-review-button')
    await expect(submitBtn).toBeDisabled()
  })

  test('Form validation prevents submission without all ratings', async ({ page }) => {
    await navigateToReviewPage(page)

    // Set only Overall to 5, leave others at 0 (unset)
    await page.getByTestId('rating-input-rating').fill('5')

    // Button should now be enabled (not all unset)
    const submitBtn = page.getByTestId('submit-review-button')
    await expect(submitBtn).toBeEnabled()

    // Click submit
    await submitBtn.click()

    // Validation error should appear
    const errorEl = page.getByTestId('review-form-error')
    await expect(errorEl).toBeVisible({ timeout: 10000 })
    await expect(errorEl).toContainText('Please rate all categories')
  })

  test('Write Review button on My Trips disappears after submitting review', async ({
    page,
  }) => {
    test.slow()
    await navigateToReviewPage(page)

    // Fill out review
    await setAllRatings(page, {
      rating: 4,
      cleanliness: 4,
      accuracy: 4,
      communication: 4,
      location: 4,
      value: 4,
    })
    await page.getByTestId('review-comment-textarea').fill('Great stay!')
    await page.getByTestId('submit-review-button').click()

    // Should navigate to /trips
    await expect(page).toHaveURL(/\/trips/, { timeout: 30000 })

    // Go to Past tab to see completed bookings
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('tab-past').click()

    // The Write Review button should no longer appear for this booking
    await expect(
      page.getByTestId(`review-button-${ALEX_COMPLETED_BOOKING}`)
    ).not.toBeVisible({ timeout: 10000 })

    // Instead, a "Reviewed" badge should appear
    await expect(
      page.getByTestId(`reviewed-badge-${ALEX_COMPLETED_BOOKING}`)
    ).toBeVisible({ timeout: 10000 })
  })

  test('Navigate back from review page without submitting', async ({ page }) => {
    test.slow()
    await navigateToReviewPage(page)

    // Set some ratings and type partial comment
    await page.getByTestId('rating-input-rating').fill('4')
    await page.getByTestId('review-comment-textarea').fill('Partial comment...')

    // Click Cancel button to go back
    await page.getByTestId('cancel-review-button').click()

    // Should navigate to /trips
    await expect(page).toHaveURL(/\/trips/, { timeout: 30000 })
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Write Review button should still appear on the trip card
    await page.getByTestId('tab-past').click()
    await expect(
      page.getByTestId(`review-button-${ALEX_COMPLETED_BOOKING}`)
    ).toBeVisible({ timeout: 30000 })
  })

  test('Comment text area allows multi-line input', async ({ page }) => {
    await navigateToReviewPage(page)

    const multiLineComment = 'First line.\nSecond line.\nThird line.'
    await page.getByTestId('review-comment-textarea').fill(multiLineComment)

    await expect(page.getByTestId('review-comment-textarea')).toHaveValue(
      multiLineComment
    )
  })
})

test.describe('ReviewForm - Already Reviewed', () => {
  test('Re-visiting review page after submission shows already-reviewed state', async ({
    page,
  }) => {
    // Emma has a review for booking e1111111 in seed data — do NOT delete it
    await login(page, EMMA_EMAIL)

    // Navigate directly to the review page for the already-reviewed booking
    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    // Should show already-reviewed error message
    const errorEl = page.getByTestId('review-page-error')
    await expect(errorEl).toBeVisible({ timeout: 30000 })
    await expect(errorEl).toContainText('You have already reviewed this booking')

    // Review form should not be visible
    await expect(page.getByTestId('review-form')).not.toBeVisible()

    // A link back to trips should be available
    const backLink = page.getByRole('link', { name: /Back to My Trips/i })
    await expect(backLink).toBeVisible()
  })
})
