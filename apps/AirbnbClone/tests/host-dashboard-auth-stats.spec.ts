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
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('Host Dashboard - Auth & Stats', () => {
  test('Host Dashboard requires login — redirects unauthenticated users', async ({ page }) => {
    await page.goto('/hosting')
    await expect(page).toHaveURL(/\/login/, { timeout: 30000 })
    await expect(page.getByTestId('host-dashboard')).not.toBeVisible()
  })

  test('Host Dashboard requires host status — shows upgrade prompt for non-hosts', async ({ page }) => {
    // Emma is a non-host user
    await loginAs(page, 'emma@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('host-dashboard')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('host-dashboard')).toContainText('You need to become a host to access this page')
    await expect(page.getByTestId('become-host-link')).toBeVisible()

    // Click link and verify navigation to profile
    await page.getByTestId('become-host-link').click()
    await expect(page).toHaveURL(/\/profile/, { timeout: 30000 })
  })

  test('Stats overview displays total listings count', async ({ page }) => {
    // Sarah has 3 active properties (b1111111, b2222222, b5555555)
    await loginAs(page, 'sarah@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('stats-overview')).toBeVisible({ timeout: 30000 })

    const totalListings = page.getByTestId('stat-total-listings')
    await expect(totalListings).toBeVisible()
    await expect(totalListings).toContainText('Total Listings')
    await expect(totalListings).toContainText('3', { timeout: 15000 })
  })

  test('Stats overview displays active bookings count', async ({ page }) => {
    // Sarah's properties have: e2222222 (confirmed), e6666666 (confirmed) = 2 active
    await loginAs(page, 'sarah@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('stats-overview')).toBeVisible({ timeout: 30000 })

    const activeBookings = page.getByTestId('stat-active-bookings')
    await expect(activeBookings).toBeVisible()
    await expect(activeBookings).toContainText('Active Bookings')
    await expect(activeBookings).toContainText('2', { timeout: 15000 })
  })

  test('Stats overview displays total earnings', async ({ page }) => {
    // Sarah's completed bookings: e1111111 ($825) = $825 total
    await loginAs(page, 'sarah@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('stats-overview')).toBeVisible({ timeout: 30000 })

    const totalEarnings = page.getByTestId('stat-total-earnings')
    await expect(totalEarnings).toBeVisible()
    await expect(totalEarnings).toContainText('Total Earnings')
    await expect(totalEarnings).toContainText('$825', { timeout: 15000 })
  })

  test('Stats overview displays average rating', async ({ page }) => {
    // Sarah's reviews: 1 review with rating 5 → avg 5.0
    await loginAs(page, 'sarah@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('stats-overview')).toBeVisible({ timeout: 30000 })

    const avgRating = page.getByTestId('stat-average-rating')
    await expect(avgRating).toBeVisible()
    await expect(avgRating).toContainText('Average Rating')
    await expect(avgRating).toContainText('5.0', { timeout: 15000 })
  })

  test('Stats overview shows zeros for a new host with no data', async ({ page, request }) => {
    // Make emma a host via API first (she has no properties as host)
    await request.post('http://localhost:8888/api/users/a3333333-3333-3333-3333-333333333333/become-host')

    // Now login — the login fetches fresh user data from DB with is_host=true
    await loginAs(page, 'emma@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('stats-overview')).toBeVisible({ timeout: 30000 })

    await expect(page.getByTestId('stat-total-listings')).toContainText('0', { timeout: 15000 })
    await expect(page.getByTestId('stat-active-bookings')).toContainText('0', { timeout: 15000 })
    await expect(page.getByTestId('stat-total-earnings')).toContainText('$0', { timeout: 15000 })
    await expect(page.getByTestId('stat-average-rating')).toContainText('—', { timeout: 15000 })
  })

  test('Host Dashboard displays navigation tabs for Listings and Bookings', async ({ page }) => {
    await loginAs(page, 'sarah@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('host-dashboard')).toBeVisible({ timeout: 30000 })

    const listingsTab = page.getByTestId('tab-listings')
    const bookingsTab = page.getByTestId('tab-bookings')

    await expect(listingsTab).toBeVisible()
    await expect(listingsTab).toHaveText('Listings')
    await expect(bookingsTab).toBeVisible()
    await expect(bookingsTab).toHaveText('Bookings')

    // Listings tab should be active by default (has active styling)
    await expect(listingsTab).toHaveClass(/border-primary/)
  })

  test('Switching between Listings and Bookings tabs', async ({ page }) => {
    await loginAs(page, 'sarah@example.com')
    await page.goto('/hosting')
    await expect(page.getByTestId('host-dashboard')).toBeVisible({ timeout: 30000 })

    // Listings tab active by default
    await expect(page.getByTestId('listings-tab')).toBeVisible({ timeout: 30000 })

    // Click Bookings tab
    await page.getByTestId('tab-bookings').click()
    await expect(page.getByTestId('bookings-tab')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('tab-bookings')).toHaveClass(/border-primary/)

    // Click Listings tab again
    await page.getByTestId('tab-listings').click()
    await expect(page.getByTestId('listings-tab')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('tab-listings')).toHaveClass(/border-primary/)
  })
})
