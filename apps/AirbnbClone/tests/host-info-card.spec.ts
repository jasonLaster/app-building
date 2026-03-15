import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// b1111111: Loft, host Sarah Chen (a1111111), avatar set, bio set, created 2021-03-15
// Sarah owns 3 properties: b1111111, b2222222, b5555555
const PROPERTY_LOFT = 'b1111111-1111-1111-1111-111111111111'

// b3333333: Cabin, host Mike Johnson (a2222222), avatar set, bio set, created 2022-06-01
// Mike owns 2 properties: b3333333, b4444444
const PROPERTY_CABIN = 'b3333333-3333-3333-3333-333333333333'
const HOST_MIKE_ID = 'a2222222-2222-2222-2222-222222222222'

test.describe('Property Detail - HostInfoCard', () => {
  test.beforeEach(async ({ request }) => {
    // Restore Mike's avatar and bio to seed state before each test
    await request.put(`/api/users/${HOST_MIKE_ID}`, {
      data: {
        avatar_url: 'https://i.pravatar.cc/150?u=mike',
        bio: 'Travel enthusiast and outdoor adventure guide. I love sharing my favorite spots with guests from around the world.',
      },
    })
  })

  test('Host info card displays host name, avatar, bio, and member since date', async ({ page }) => {
    // Sarah Chen: avatar set, bio "Superhost with 5 years...", created 2021-03-15
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('host-info-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Host name
    await expect(card).toContainText('Sarah Chen')

    // Avatar image
    const avatar = card.locator('img')
    await expect(avatar).toBeVisible()
    await expect(avatar).toHaveAttribute('alt', 'Sarah Chen')

    // Bio
    await expect(card).toContainText('Superhost with 5 years of experience')

    // Member since - 2021-03-15 formats to "March 2021"
    await expect(card).toContainText('Member since March 2021')
  })

  test('Host info card displays number of listings', async ({ page }) => {
    // Sarah owns 3 active properties (b1111111, b2222222, b5555555)
    await page.goto(`/properties/${PROPERTY_LOFT}`)

    const card = page.getByTestId('host-info-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    await expect(card).toContainText('3 listings')
  })

  test('Host info card shows placeholder avatar when host has no avatar', async ({ page }) => {
    test.slow()

    // Navigate first to get request context
    await page.goto(`/properties/${PROPERTY_CABIN}`)
    await expect(page.getByTestId('host-info-card')).toBeVisible({ timeout: 30000 })

    // Remove Mike's avatar via API
    await page.request.put(`/api/users/${HOST_MIKE_ID}`, {
      data: { avatar_url: null },
    })

    // Reload to see updated data
    await page.reload()
    const card = page.getByTestId('host-info-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Should show placeholder (first initial) instead of img
    await expect(card.locator('img')).not.toBeVisible()

    // Should still show the host name
    await expect(card).toContainText('Mike Johnson')

    // The placeholder should show 'M' (first initial)
    await expect(card).toContainText('M')
  })

  test('Host info card displays correctly when host has no bio', async ({ page }) => {
    test.slow()

    // Navigate first to get request context
    await page.goto(`/properties/${PROPERTY_CABIN}`)
    await expect(page.getByTestId('host-info-card')).toBeVisible({ timeout: 30000 })

    // Remove Mike's bio via API (explicitly preserve avatar in case another test cleared it)
    await page.request.put(`/api/users/${HOST_MIKE_ID}`, {
      data: { bio: null, avatar_url: 'https://i.pravatar.cc/150?u=mike' },
    })

    // Reload to see updated data
    await page.reload()
    const card = page.getByTestId('host-info-card')
    await expect(card).toBeVisible({ timeout: 30000 })

    // Host name should still be displayed
    await expect(card).toContainText('Mike Johnson')

    // Avatar should still be visible
    const avatar = card.locator('img')
    await expect(avatar).toBeVisible()

    // Member since should still show
    await expect(card).toContainText('Member since June 2022')

    // Listing count should still show
    await expect(card).toContainText('2 listings')

    // Bio text should not be present (Mike's original bio was about "Travel enthusiast")
    await expect(card).not.toContainText('Travel enthusiast')
  })
})
