import { test, expect } from '@playwright/test'

test.describe('TripTypeSelector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('TripTypeSelector displays default Round trip selection', async ({ page }) => {
    const trigger = page.getByTestId('trip-type-selector-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('Round trip')
    // Verify it's a custom dropdown (button trigger), not a native select
    const selector = page.getByTestId('trip-type-selector')
    await expect(selector.locator('select')).toHaveCount(0)
    const dropdown = page.getByTestId('trip-type-selector-dropdown')
    await expect(dropdown).not.toBeVisible()
  })

  test('TripTypeSelector opens dropdown and shows all options', async ({ page }) => {
    const trigger = page.getByTestId('trip-type-selector-trigger')
    await trigger.click()

    const dropdown = page.getByTestId('trip-type-selector-dropdown')
    await expect(dropdown).toBeVisible()

    await expect(page.getByTestId('trip-type-option-round_trip')).toBeVisible()
    await expect(page.getByTestId('trip-type-option-round_trip')).toHaveText('Round trip')
    await expect(page.getByTestId('trip-type-option-one_way')).toBeVisible()
    await expect(page.getByTestId('trip-type-option-one_way')).toHaveText('One way')
    await expect(page.getByTestId('trip-type-option-multi_city')).toBeVisible()
    await expect(page.getByTestId('trip-type-option-multi_city')).toHaveText('Multi-city')
  })

  test('TripTypeSelector selects One way and hides return date', async ({ page }) => {
    // Verify return date is visible with Round trip
    await expect(page.getByTestId('return-date-container')).toBeVisible()

    // Select One way
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()

    // Verify selector updated
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('One way')

    // Verify dropdown closed
    await expect(page.getByTestId('trip-type-selector-dropdown')).not.toBeVisible()

    // Verify return date is hidden
    await expect(page.getByTestId('return-date-container')).not.toBeVisible()
  })

  test('TripTypeSelector selects Multi-city option', async ({ page }) => {
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-multi_city').click()

    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('Multi-city')
    await expect(page.getByTestId('trip-type-selector-dropdown')).not.toBeVisible()
  })

  test('TripTypeSelector switches back to Round trip from One way', async ({ page }) => {
    // First select One way
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('One way')
    await expect(page.getByTestId('return-date-container')).not.toBeVisible()

    // Switch back to Round trip
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-round_trip').click()

    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('Round trip')
    await expect(page.getByTestId('return-date-container')).toBeVisible()
  })

  test('TripTypeSelector closes dropdown when clicking outside', async ({ page }) => {
    // Open the dropdown
    await page.getByTestId('trip-type-selector-trigger').click()
    await expect(page.getByTestId('trip-type-selector-dropdown')).toBeVisible()

    // Click outside the dropdown
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })

    // Dropdown should close
    await expect(page.getByTestId('trip-type-selector-dropdown')).not.toBeVisible()

    // Selection should remain unchanged
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('Round trip')
  })

  test('TripTypeSelector can be used multiple times in sequence', async ({ page }) => {
    // Select One way
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('One way')

    // Interact with another element (origin airport field)
    await page.getByTestId('origin-input').click()

    // Open trip type selector again and select Round trip
    await page.getByTestId('trip-type-selector-trigger').click()
    await expect(page.getByTestId('trip-type-selector-dropdown')).toBeVisible()
    await page.getByTestId('trip-type-option-round_trip').click()

    // Verify final state
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('Round trip')
    await expect(page.getByTestId('trip-type-selector-dropdown')).not.toBeVisible()
  })
})
