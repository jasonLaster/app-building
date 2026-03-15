import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// b1111111: Loft, 4 guests, 1 bedroom, 2 beds, 1 bath, New York, US, host Sarah Chen, 1 review (5.0)
const PROPERTY_WITH_REVIEWS = 'b1111111-1111-1111-1111-111111111111'
// b2222222: Villa, 8 guests, 4 bedrooms, 5 beds, 3 bath, Miami, US, host Sarah Chen, 0 reviews
const PROPERTY_NO_REVIEWS = 'b2222222-2222-2222-2222-222222222222'
// b4444444: Apartment, 2 guests, 1 bedroom, 1 bed, 1 bath, Austin, TX, host Mike Johnson, 1 review (4.0)
const PROPERTY_SINGULAR = 'b4444444-4444-4444-4444-444444444444'

test.describe('Property Detail - PropertyHeader', () => {
  test('Property header displays title, location, rating summary, and host info', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_REVIEWS}`)

    const header = page.getByTestId('property-header')
    await expect(header).toBeVisible({ timeout: 30000 })

    // Title
    await expect(header.locator('h1')).toHaveText('Cozy Downtown Loft with City Views')

    // Location
    await expect(header).toContainText('New York, United States')

    // Rating summary - property has 1 review with rating 5
    const reviewLink = page.getByTestId('review-count-link')
    await expect(reviewLink).toBeVisible()
    await expect(reviewLink).toContainText('5.0')
    await expect(reviewLink).toContainText('(1 review)')

    // Host info
    await expect(header).toContainText('Hosted by')
    await expect(header).toContainText('Sarah Chen')

    // Host avatar
    const avatar = page.getByTestId('host-avatar')
    await expect(avatar).toBeVisible()
  })

  test('Property header shows "New" when property has no reviews', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const header = page.getByTestId('property-header')
    await expect(header).toBeVisible({ timeout: 30000 })

    // Should show "New" instead of rating
    await expect(header).toContainText('New')

    // No review count link
    await expect(page.getByTestId('review-count-link')).not.toBeVisible()
  })

  test('Clicking review count scrolls to or navigates to reviews section', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_REVIEWS}`)

    const reviewLink = page.getByTestId('review-count-link')
    await expect(reviewLink).toBeVisible({ timeout: 30000 })

    // Click the review count
    await reviewLink.click()

    // Reviews section should be visible (scrolled into view)
    const reviewsSection = page.getByTestId('reviews-section')
    await expect(reviewsSection).toBeVisible()
    await expect(reviewsSection).toBeInViewport({ timeout: 5000 })
  })

  test('Property header displays host avatar as clickable element', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_REVIEWS}`)

    const header = page.getByTestId('property-header')
    await expect(header).toBeVisible({ timeout: 30000 })

    // Host avatar should be visible and circular (img element)
    const avatar = page.getByTestId('host-avatar')
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveAttribute('alt', 'Sarah Chen')

    // Avatar should be inside a clickable element
    const hostInfo = page.getByTestId('host-info')
    await expect(hostInfo).toBeVisible()

    // Host name displayed next to avatar
    await expect(hostInfo).toContainText('Sarah Chen')
  })
})

test.describe('Property Detail - PropertyInfo', () => {
  test('Property info section displays all property details', async ({ page }) => {
    // b2222222: Villa, 8 guests, 4 bedrooms, 5 beds, 3 bathrooms
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const info = page.getByTestId('property-info')
    await expect(info).toBeVisible({ timeout: 30000 })

    await expect(info).toContainText('Villa')
    await expect(info).toContainText('8 guests')
    await expect(info).toContainText('4 bedrooms')
    await expect(info).toContainText('5 beds')
    await expect(info).toContainText('3 bathrooms')
  })

  test('Property info section displays check-in and check-out times', async ({ page }) => {
    // Default check_in_time is '15:00', check_out_time is '11:00'
    await page.goto(`/properties/${PROPERTY_WITH_REVIEWS}`)

    const info = page.getByTestId('property-info')
    await expect(info).toBeVisible({ timeout: 30000 })

    // 15:00 → 3:00 PM
    await expect(info).toContainText('Check-in: 3:00 PM')
    // 11:00 → 11:00 AM
    await expect(info).toContainText('Check-out: 11:00 AM')
  })

  test('Property info section handles singular and plural labels correctly', async ({ page }) => {
    // b4444444: 2 guests, 1 bedroom, 1 bed, 1 bathroom
    await page.goto(`/properties/${PROPERTY_SINGULAR}`)

    const info = page.getByTestId('property-info')
    await expect(info).toBeVisible({ timeout: 30000 })

    await expect(info).toContainText('1 bedroom')
    await expect(info).toContainText('1 bed')
    await expect(info).toContainText('1 bathroom')
    // 2 guests should be plural
    await expect(info).toContainText('2 guests')
  })
})

test.describe('Property Detail - PropertyDescription', () => {
  test('Property description displays full description text', async ({ page }) => {
    // b4444444 has a short description (under 300 chars)
    await page.goto(`/properties/${PROPERTY_SINGULAR}`)

    const desc = page.getByTestId('property-description')
    await expect(desc).toBeVisible({ timeout: 30000 })

    await expect(desc).toContainText('Stylish apartment in the vibrant South Congress neighborhood')
    await expect(desc).toContainText('Features a rooftop pool and gym access')

    // No Show more button for short description
    await expect(page.getByTestId('description-toggle')).not.toBeVisible()
  })

  test('Long description shows a "Show more" toggle', async ({ page }) => {
    // b2222222 has a long description (over 300 chars)
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const desc = page.getByTestId('property-description')
    await expect(desc).toBeVisible({ timeout: 30000 })

    // Description should be truncated
    const descText = desc.locator('p')
    await expect(descText).toContainText('...')

    // Show more button should be visible
    const toggle = page.getByTestId('description-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveText('Show more')
  })

  test('Clicking "Show more" expands the full description', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const desc = page.getByTestId('property-description')
    await expect(desc).toBeVisible({ timeout: 30000 })

    const toggle = page.getByTestId('description-toggle')
    await expect(toggle).toHaveText('Show more')

    // Click Show more
    await toggle.click()

    // Full description should be visible (no ellipsis truncation)
    const descText = desc.locator('p')
    await expect(descText).toContainText('sipping your favorite drinks')

    // Toggle should now say Show less
    await expect(toggle).toHaveText('Show less')
  })

  test('Clicking "Show less" collapses the description back', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const desc = page.getByTestId('property-description')
    await expect(desc).toBeVisible({ timeout: 30000 })

    // Expand first
    const toggle = page.getByTestId('description-toggle')
    await toggle.click()
    await expect(toggle).toHaveText('Show less')

    // Click Show less
    await toggle.click()

    // Should be truncated again
    const descText = desc.locator('p')
    await expect(descText).toContainText('...')
    await expect(toggle).toHaveText('Show more')
  })

  test('Show more/less toggle is functional on repeated use', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_NO_REVIEWS}`)

    const desc = page.getByTestId('property-description')
    await expect(desc).toBeVisible({ timeout: 30000 })

    const toggle = page.getByTestId('description-toggle')
    const descText = desc.locator('p')

    // Click Show more
    await toggle.click()
    await expect(toggle).toHaveText('Show less')
    await expect(descText).not.toContainText('...')

    // Click Show less
    await toggle.click()
    await expect(toggle).toHaveText('Show more')
    await expect(descText).toContainText('...')

    // Click Show more again
    await toggle.click()
    await expect(toggle).toHaveText('Show less')
    await expect(descText).toContainText('sipping your favorite drinks')
  })
})
