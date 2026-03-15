import { test, expect } from '@playwright/test'

// Seed data references
const EMMA_EMAIL = 'emma@example.com'
const ALEX_EMAIL = 'alex@example.com'
const EMMA_ID = 'a3333333-3333-3333-3333-333333333333'

// Emma's completed booking at Cozy Downtown Loft (has review in seed)
const EMMA_COMPLETED_BOOKING = 'e1111111-1111-1111-1111-111111111111'
const EMMA_COMPLETED_PROPERTY = 'b1111111-1111-1111-1111-111111111111'

// Emma's pending booking
const EMMA_PENDING_BOOKING = 'e3333333-3333-3333-3333-333333333333'

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

test.describe('Write Review - PropertyBookingContext', () => {
  test('Property info displays for the booking being reviewed', async ({ page }) => {
    await login(page, EMMA_EMAIL)
    // Delete Emma's review so the booking is reviewable
    await deleteAllReviewsForGuest(page, EMMA_ID)

    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    const context = page.getByTestId('property-booking-context')
    await expect(context).toBeVisible({ timeout: 30000 })

    // Property title
    await expect(page.getByTestId('booking-context-title')).toHaveText('Cozy Downtown Loft with City Views')

    // Location
    await expect(page.getByTestId('booking-context-location')).toContainText('New York')
    await expect(page.getByTestId('booking-context-location')).toContainText('United States')

    // Dates and nights: Dec 15, 2025 – Dec 20, 2025 (5 nights)
    const datesEl = page.getByTestId('booking-context-dates')
    await expect(datesEl).toContainText('Dec 15, 2025')
    await expect(datesEl).toContainText('Dec 20, 2025')
    await expect(datesEl).toContainText('5 nights')
  })

  test('Property booking context shows guest count', async ({ page }) => {
    await login(page, EMMA_EMAIL)
    await deleteAllReviewsForGuest(page, EMMA_ID)

    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    const guestsEl = page.getByTestId('booking-context-guests')
    await expect(guestsEl).toBeVisible({ timeout: 30000 })
    await expect(guestsEl).toContainText('2 guests')
  })

  test('Property booking context shows total price paid', async ({ page }) => {
    await login(page, EMMA_EMAIL)
    await deleteAllReviewsForGuest(page, EMMA_ID)

    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    const priceEl = page.getByTestId('booking-context-price')
    await expect(priceEl).toBeVisible({ timeout: 30000 })
    await expect(priceEl).toContainText('$825')
  })

  test('Redirect to login if not authenticated', async ({ page }) => {
    // Navigate directly without logging in
    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    await expect(page).toHaveURL(/\/login/, { timeout: 30000 })
    await expect(page.getByTestId('write-review-page')).not.toBeVisible()
  })

  test('Error state when booking does not exist', async ({ page }) => {
    await login(page, EMMA_EMAIL)

    await page.goto('/trips/nonexistent-booking-id/review')

    const errorEl = page.getByTestId('review-page-error')
    await expect(errorEl).toBeVisible({ timeout: 30000 })
    await expect(errorEl).toContainText('Booking not found')

    // Review form should not be visible
    await expect(page.getByTestId('review-form')).not.toBeVisible()
  })

  test('Error state when booking belongs to another user', async ({ page }) => {
    // Log in as Alex and try to access Emma's booking
    await login(page, ALEX_EMAIL)

    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    const errorEl = page.getByTestId('review-page-error')
    await expect(errorEl).toBeVisible({ timeout: 30000 })
    await expect(errorEl).toContainText('Booking not found')

    await expect(page.getByTestId('review-form')).not.toBeVisible()
  })

  test('Error state when booking is not completed', async ({ page }) => {
    await login(page, EMMA_EMAIL)

    // e3333333 is Emma's pending booking
    await page.goto(`/trips/${EMMA_PENDING_BOOKING}/review`)

    const errorEl = page.getByTestId('review-page-error')
    await expect(errorEl).toBeVisible({ timeout: 30000 })
    await expect(errorEl).toContainText('You can only review completed bookings')

    await expect(page.getByTestId('review-form')).not.toBeVisible()
  })

  test('Error state when review already exists for booking', async ({ page }) => {
    await login(page, EMMA_EMAIL)

    // Ensure a review exists for this booking (earlier tests may have deleted it)
    await deleteAllReviewsForGuest(page, EMMA_ID)
    await page.request.post('/api/reviews', {
      data: {
        booking_id: EMMA_COMPLETED_BOOKING,
        property_id: EMMA_COMPLETED_PROPERTY,
        guest_id: EMMA_ID,
        rating: 5,
        cleanliness: 5,
        accuracy: 5,
        communication: 5,
        location: 5,
        value: 4,
        comment: 'Great stay!',
      },
    })

    await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)

    const errorEl = page.getByTestId('review-page-error')
    await expect(errorEl).toBeVisible({ timeout: 30000 })
    await expect(errorEl).toContainText('You have already reviewed this booking')

    await expect(page.getByTestId('review-form')).not.toBeVisible()
  })
})
