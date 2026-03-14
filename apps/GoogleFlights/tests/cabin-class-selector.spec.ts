import { test, expect } from '@playwright/test'

test.describe('CabinClassSelector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('CabinClassSelector displays default Economy', async ({ page }) => {
    const trigger = page.getByTestId('cabin-class-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('Economy')
    // Dropdown should not be open
    await expect(page.getByTestId('cabin-class-dropdown')).not.toBeVisible()
  })

  test('CabinClassSelector opens dropdown showing all cabin classes', async ({ page }) => {
    await page.getByTestId('cabin-class-trigger').click()

    const dropdown = page.getByTestId('cabin-class-dropdown')
    await expect(dropdown).toBeVisible()

    await expect(page.getByTestId('cabin-class-option-economy')).toBeVisible()
    await expect(page.getByTestId('cabin-class-option-economy')).toHaveText('Economy')
    await expect(page.getByTestId('cabin-class-option-premium_economy')).toBeVisible()
    await expect(page.getByTestId('cabin-class-option-premium_economy')).toHaveText('Premium Economy')
    await expect(page.getByTestId('cabin-class-option-business')).toBeVisible()
    await expect(page.getByTestId('cabin-class-option-business')).toHaveText('Business')
    await expect(page.getByTestId('cabin-class-option-first')).toBeVisible()
    await expect(page.getByTestId('cabin-class-option-first')).toHaveText('First')
  })

  test('CabinClassSelector selects Business class', async ({ page }) => {
    await page.getByTestId('cabin-class-trigger').click()
    await page.getByTestId('cabin-class-option-business').click()

    await expect(page.getByTestId('cabin-class-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('Business')
  })

  test('CabinClassSelector selects Premium Economy class', async ({ page }) => {
    await page.getByTestId('cabin-class-trigger').click()
    await page.getByTestId('cabin-class-option-premium_economy').click()

    await expect(page.getByTestId('cabin-class-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('Premium Economy')
  })

  test('CabinClassSelector selects First class', async ({ page }) => {
    await page.getByTestId('cabin-class-trigger').click()
    await page.getByTestId('cabin-class-option-first').click()

    await expect(page.getByTestId('cabin-class-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('First')
  })

  test('CabinClassSelector closes dropdown when clicking outside', async ({ page }) => {
    // Open the dropdown
    await page.getByTestId('cabin-class-trigger').click()
    await expect(page.getByTestId('cabin-class-dropdown')).toBeVisible()

    // Click outside
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })

    // Dropdown should close without changing selection
    await expect(page.getByTestId('cabin-class-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('Economy')
  })

  test('CabinClassSelector can be changed multiple times', async ({ page }) => {
    // Select Business
    await page.getByTestId('cabin-class-trigger').click()
    await page.getByTestId('cabin-class-option-business').click()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('Business')

    // Interact with another element
    await page.getByTestId('origin-input').click()

    // Reopen and select First
    await page.getByTestId('cabin-class-trigger').click()
    await expect(page.getByTestId('cabin-class-dropdown')).toBeVisible()
    await page.getByTestId('cabin-class-option-first').click()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('First')

    // Reopen and select Economy
    await page.getByTestId('cabin-class-trigger').click()
    await expect(page.getByTestId('cabin-class-dropdown')).toBeVisible()
    await page.getByTestId('cabin-class-option-economy').click()
    await expect(page.getByTestId('cabin-class-trigger')).toContainText('Economy')
  })
})
