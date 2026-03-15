import { test, expect } from '@playwright/test'
import { truncateAndSeed } from '../scripts/seed-db'

test.beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    await truncateAndSeed(dbUrl)
  }
})

// Property b2222222 has 4 images (most images in seed data)
const PROPERTY_WITH_IMAGES = 'b2222222-2222-2222-2222-222222222222'
// Property b4444444 has 2 images
const PROPERTY_FOR_SINGLE = 'b4444444-4444-4444-4444-444444444444'

// Seed images for b4444444 that need to be restored after deletion tests
const SEED_IMAGES_B4444444 = [
  { property_id: PROPERTY_FOR_SINGLE, url: 'https://picsum.photos/seed/apt1/800/600', caption: 'Living room', display_order: 0 },
  { property_id: PROPERTY_FOR_SINGLE, url: 'https://picsum.photos/seed/apt2/800/600', caption: 'Bedroom', display_order: 1 },
]

test.describe('Property Detail - ImageGallery', () => {
  test.beforeEach(async ({ request }) => {
    // Delete all images for b4444444 and re-create seed images
    const propertyResponse = await request.get(`/api/properties/${PROPERTY_FOR_SINGLE}`)
    if (propertyResponse.ok()) {
      const property = await propertyResponse.json()
      const images = property.images as { id: string }[]
      for (const img of images) {
        await request.delete(`/api/property-images/${img.id}`)
      }
    }
    for (const img of SEED_IMAGES_B4444444) {
      await request.post('/api/property-images', { data: img })
    }
  })

  test('Image gallery displays main large image and smaller thumbnails', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_IMAGES}`)

    const gallery = page.getByTestId('image-gallery')
    await expect(gallery).toBeVisible({ timeout: 30000 })

    // Main image should be visible
    const mainImage = gallery.locator('img').first()
    await expect(mainImage).toBeVisible()
    await expect(mainImage).toHaveAttribute('alt', 'Pool overlooking ocean')

    // Thumbnails should be visible (4 images total, 1 main + 3 thumbnails)
    const thumbnails = gallery.locator('[data-testid^="thumbnail-"]')
    await expect(thumbnails).toHaveCount(3)
  })

  test.describe.serial('Destructive image tests', () => {
    test('Image gallery displays single image when property has only one image', async ({ page, request }) => {
      // Delete one of the two images from property b4444444 to leave only one
      const propertyResponse = await request.get(`/api/properties/${PROPERTY_FOR_SINGLE}`)
      const property = await propertyResponse.json()
      const images = property.images as { id: string }[]

      // Delete all images except the first one
      for (let i = 1; i < images.length; i++) {
        await request.delete(`/api/property-images/${images[i]!.id}`)
      }

      await page.goto(`/properties/${PROPERTY_FOR_SINGLE}`)

      const gallery = page.getByTestId('image-gallery')
      await expect(gallery).toBeVisible({ timeout: 30000 })

      // Single image displayed as main
      const mainImage = gallery.locator('img')
      await expect(mainImage).toHaveCount(1)
      await expect(mainImage).toBeVisible()

      // No thumbnail grid
      const thumbnails = gallery.locator('[data-testid^="thumbnail-"]')
      await expect(thumbnails).toHaveCount(0)
    })

    test('Image gallery displays placeholder when property has no images', async ({ page, request }) => {
      // Delete all images from property b4444444
      const propertyResponse = await request.get(`/api/properties/${PROPERTY_FOR_SINGLE}`)
      const property = await propertyResponse.json()
      const images = property.images as { id: string }[]

      for (const img of images) {
        await request.delete(`/api/property-images/${img.id}`)
      }

      await page.goto(`/properties/${PROPERTY_FOR_SINGLE}`)

      const gallery = page.getByTestId('image-gallery')
      await expect(gallery).toBeVisible({ timeout: 30000 })

      // Should show "No images available" placeholder
      await expect(gallery).toContainText('No images available')

      // No img elements
      const imgs = gallery.locator('img')
      await expect(imgs).toHaveCount(0)
    })
  })

  test('Clicking a thumbnail image makes it the main displayed image', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_IMAGES}`)

    const gallery = page.getByTestId('image-gallery')
    await expect(gallery).toBeVisible({ timeout: 30000 })

    // Main image area is the first child of the grid
    const mainImageArea = gallery.locator('> div > div').first()
    await expect(mainImageArea.locator('img')).toHaveAttribute('alt', 'Pool overlooking ocean')

    // Thumbnails: Master bedroom, Outdoor dining, Beach access
    const thumbnails = gallery.locator('[data-testid^="thumbnail-"]')
    await expect(thumbnails).toHaveCount(3)

    // Click the third thumbnail (Beach access)
    await thumbnails.nth(2).click()

    // The main image should now be Beach access
    await expect(mainImageArea.locator('img')).toHaveAttribute('alt', 'Beach access')

    // The previously main image (Pool) should now appear as a thumbnail
    await expect(gallery).toContainText('Pool overlooking ocean')
  })

  test('Clicking thumbnails is functional on repeated use', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_IMAGES}`)

    const gallery = page.getByTestId('image-gallery')
    await expect(gallery).toBeVisible({ timeout: 30000 })

    const mainImageArea = gallery.locator('> div > div').first()
    const thumbnails = gallery.locator('[data-testid^="thumbnail-"]')
    await expect(thumbnails).toHaveCount(3)

    // Click first thumbnail (second image - "Master bedroom")
    await thumbnails.nth(0).click()
    await expect(mainImageArea.locator('img').first()).toHaveAttribute('alt', 'Master bedroom')

    // Click third thumbnail (now it shows a different image since main changed)
    // After clicking "Master bedroom" as main, thumbnails are: Pool overlooking ocean, Outdoor dining, Beach access
    await thumbnails.nth(2).click()
    await expect(mainImageArea.locator('img').first()).toHaveAttribute('alt', 'Beach access')

    // Click first thumbnail again
    // After "Beach access" as main, thumbnails reorder: Pool overlooking ocean, Master bedroom, Outdoor dining
    await thumbnails.nth(0).click()
    await expect(mainImageArea.locator('img').first()).toHaveAttribute('alt', 'Pool overlooking ocean')
  })

  test('Image gallery shows image captions when available', async ({ page }) => {
    await page.goto(`/properties/${PROPERTY_WITH_IMAGES}`)

    const gallery = page.getByTestId('image-gallery')
    await expect(gallery).toBeVisible({ timeout: 30000 })

    // Main image should show its caption
    await expect(gallery).toContainText('Pool overlooking ocean')

    // Thumbnails should also show captions
    await expect(gallery).toContainText('Master bedroom')
    await expect(gallery).toContainText('Outdoor dining')
    await expect(gallery).toContainText('Beach access')
  })
})
