import { test, expect } from '@playwright/test'

const EMMA_EMAIL = 'emma@example.com'
const EMMA_ID = 'a3333333-3333-3333-3333-333333333333'
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

async function navigateToReviewPage(page: import('@playwright/test').Page) {
  await login(page, EMMA_EMAIL)
  await deleteAllReviewsForGuest(page, EMMA_ID)
  await page.goto(`/trips/${EMMA_COMPLETED_BOOKING}/review`)
  await expect(page.getByTestId('rating-sliders')).toBeVisible({ timeout: 30000 })
}

async function setSliderValue(page: import('@playwright/test').Page, key: string, value: number) {
  const slider = page.getByTestId(`rating-input-${key}`)
  await slider.fill(String(value))
}

test.describe('Write Review - RatingSliders', () => {
  test('All six rating sliders display with default values', async ({ page }) => {
    await navigateToReviewPage(page)

    const sliders = page.getByTestId('rating-sliders')
    await expect(sliders).toBeVisible()

    // Verify all six sliders exist with correct labels and default value of 3
    const categories = [
      { key: 'rating', label: 'Overall' },
      { key: 'cleanliness', label: 'Cleanliness' },
      { key: 'accuracy', label: 'Accuracy' },
      { key: 'communication', label: 'Communication' },
      { key: 'location', label: 'Location' },
      { key: 'value', label: 'Value' },
    ]

    for (const { key, label } of categories) {
      const sliderSection = page.getByTestId(`rating-slider-${key}`)
      await expect(sliderSection).toBeVisible()
      await expect(sliderSection).toContainText(label)

      // Default value should be 3
      const valueDisplay = page.getByTestId(`rating-value-${key}`)
      await expect(valueDisplay).toHaveText('3')

      const input = page.getByTestId(`rating-input-${key}`)
      await expect(input).toHaveValue('3')
    }
  })

  test('Adjust overall rating slider', async ({ page }) => {
    await navigateToReviewPage(page)

    await setSliderValue(page, 'rating', 5)

    await expect(page.getByTestId('rating-value-rating')).toHaveText('5')
    await expect(page.getByTestId('rating-input-rating')).toHaveValue('5')

    // Other sliders remain at default
    await expect(page.getByTestId('rating-value-cleanliness')).toHaveText('3')
    await expect(page.getByTestId('rating-value-accuracy')).toHaveText('3')
    await expect(page.getByTestId('rating-value-communication')).toHaveText('3')
    await expect(page.getByTestId('rating-value-location')).toHaveText('3')
    await expect(page.getByTestId('rating-value-value')).toHaveText('3')
  })

  test('Adjust cleanliness rating slider', async ({ page }) => {
    await navigateToReviewPage(page)

    await setSliderValue(page, 'cleanliness', 4)

    await expect(page.getByTestId('rating-value-cleanliness')).toHaveText('4')
    await expect(page.getByTestId('rating-input-cleanliness')).toHaveValue('4')
  })

  test('Adjust accuracy rating slider', async ({ page }) => {
    await navigateToReviewPage(page)

    await setSliderValue(page, 'accuracy', 2)

    await expect(page.getByTestId('rating-value-accuracy')).toHaveText('2')
    await expect(page.getByTestId('rating-input-accuracy')).toHaveValue('2')
  })

  test('Adjust communication rating slider', async ({ page }) => {
    await navigateToReviewPage(page)

    await setSliderValue(page, 'communication', 5)

    await expect(page.getByTestId('rating-value-communication')).toHaveText('5')
    await expect(page.getByTestId('rating-input-communication')).toHaveValue('5')
  })

  test('Adjust location rating slider', async ({ page }) => {
    await navigateToReviewPage(page)

    await setSliderValue(page, 'location', 3)

    await expect(page.getByTestId('rating-value-location')).toHaveText('3')
    await expect(page.getByTestId('rating-input-location')).toHaveValue('3')
  })

  test('Adjust value rating slider', async ({ page }) => {
    await navigateToReviewPage(page)

    await setSliderValue(page, 'value', 1)

    await expect(page.getByTestId('rating-value-value')).toHaveText('1')
    await expect(page.getByTestId('rating-input-value')).toHaveValue('1')
  })

  test('Rating sliders enforce 1-5 range', async ({ page }) => {
    await navigateToReviewPage(page)

    const ratingInput = page.getByTestId('rating-input-rating')

    // Verify min and max attributes
    await expect(ratingInput).toHaveAttribute('min', '1')
    await expect(ratingInput).toHaveAttribute('max', '5')
    await expect(ratingInput).toHaveAttribute('step', '1')

    // Set to minimum value
    await ratingInput.fill('1')
    await expect(page.getByTestId('rating-value-rating')).toHaveText('1')

    // Set to maximum value
    await ratingInput.fill('5')
    await expect(page.getByTestId('rating-value-rating')).toHaveText('5')
  })

  test('Multiple sliders can be set independently', async ({ page }) => {
    await navigateToReviewPage(page)

    // Set each slider to a different value
    await setSliderValue(page, 'rating', 5)
    await setSliderValue(page, 'cleanliness', 4)
    await setSliderValue(page, 'accuracy', 3)
    await setSliderValue(page, 'communication', 5)
    await setSliderValue(page, 'location', 4)
    await setSliderValue(page, 'value', 2)

    // Verify each slider has its independent value
    await expect(page.getByTestId('rating-value-rating')).toHaveText('5')
    await expect(page.getByTestId('rating-value-cleanliness')).toHaveText('4')
    await expect(page.getByTestId('rating-value-accuracy')).toHaveText('3')
    await expect(page.getByTestId('rating-value-communication')).toHaveText('5')
    await expect(page.getByTestId('rating-value-location')).toHaveText('4')
    await expect(page.getByTestId('rating-value-value')).toHaveText('2')
  })

  test('Rating slider visual feedback shows filled stars or highlighted segments', async ({ page }) => {
    await navigateToReviewPage(page)

    // Set Overall to 4
    await setSliderValue(page, 'rating', 4)
    await expect(page.getByTestId('rating-value-rating')).toHaveText('4')

    const sliderSection = page.getByTestId('rating-slider-rating')

    // Stars use 'fill-primary' class for filled and 'text-border' for unfilled
    // With rating 4, first 4 stars should be filled, last 1 unfilled
    const filledStars = sliderSection.locator('svg.fill-primary')
    const unfilledStars = sliderSection.locator('svg.text-border:not(.fill-primary)')

    await expect(filledStars).toHaveCount(4)
    await expect(unfilledStars).toHaveCount(1)
  })
})
