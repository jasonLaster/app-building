import { test, expect } from '@playwright/test'

test.describe('PassengerCountSelector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('PassengerCountSelector displays default 1 Adult', async ({ page }) => {
    const trigger = page.getByTestId('passenger-count-trigger')
    await expect(trigger).toBeVisible()
    await expect(trigger).toContainText('1 Adult')
    // Verify it's a custom dropdown (not native select)
    const selector = page.getByTestId('passenger-count-selector')
    await expect(selector.locator('select')).toHaveCount(0)
    // Verify dropdown is closed by default
    const dropdown = page.getByTestId('passenger-count-dropdown')
    await expect(dropdown).not.toBeVisible()
  })

  test('PassengerCountSelector opens dropdown with passenger categories', async ({ page }) => {
    const trigger = page.getByTestId('passenger-count-trigger')
    await trigger.click()

    const dropdown = page.getByTestId('passenger-count-dropdown')
    await expect(dropdown).toBeVisible()

    // Verify Adults row
    const adultsRow = page.getByTestId('passenger-row-adults')
    await expect(adultsRow).toBeVisible()
    await expect(adultsRow).toContainText('Adults')
    await expect(page.getByTestId('adults-count')).toHaveText('1')
    await expect(page.getByTestId('adults-decrement')).toBeVisible()
    await expect(page.getByTestId('adults-increment')).toBeVisible()

    // Verify Children row
    const childrenRow = page.getByTestId('passenger-row-children')
    await expect(childrenRow).toBeVisible()
    await expect(childrenRow).toContainText('Children')
    await expect(page.getByTestId('children-count')).toHaveText('0')
    await expect(page.getByTestId('children-decrement')).toBeVisible()
    await expect(page.getByTestId('children-increment')).toBeVisible()

    // Verify Infants row
    const infantsRow = page.getByTestId('passenger-row-infants')
    await expect(infantsRow).toBeVisible()
    await expect(infantsRow).toContainText('Infants')
    await expect(page.getByTestId('infants-count')).toHaveText('0')
    await expect(page.getByTestId('infants-decrement')).toBeVisible()
    await expect(page.getByTestId('infants-increment')).toBeVisible()
  })

  test('PassengerCountSelector increments adult count', async ({ page }) => {
    // Open dropdown
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()

    // Verify initial count
    await expect(page.getByTestId('adults-count')).toHaveText('1')

    // Increment adults
    await page.getByTestId('adults-increment').click()
    await expect(page.getByTestId('adults-count')).toHaveText('2')

    // Close dropdown and verify trigger label updates
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })
    await expect(page.getByTestId('passenger-count-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('passenger-count-trigger')).toContainText('2 passengers')
  })

  test('PassengerCountSelector decrements adult count with minimum of 1', async ({ page }) => {
    // Open dropdown
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()

    // Verify initial count is 1
    await expect(page.getByTestId('adults-count')).toHaveText('1')

    // Verify decrement button is disabled at minimum
    await expect(page.getByTestId('adults-decrement')).toBeDisabled()

    // Click decrement - count should remain 1
    await page.getByTestId('adults-decrement').click({ force: true })
    await expect(page.getByTestId('adults-count')).toHaveText('1')
  })

  test('PassengerCountSelector increments and decrements children', async ({ page }) => {
    // Open dropdown
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()

    // Verify initial count
    await expect(page.getByTestId('children-count')).toHaveText('0')

    // Increment children twice
    await page.getByTestId('children-increment').click()
    await expect(page.getByTestId('children-count')).toHaveText('1')
    await page.getByTestId('children-increment').click()
    await expect(page.getByTestId('children-count')).toHaveText('2')

    // Decrement children once
    await page.getByTestId('children-decrement').click()
    await expect(page.getByTestId('children-count')).toHaveText('1')

    // Verify total: 1 adult + 1 child = 2 passengers
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })
    await expect(page.getByTestId('passenger-count-trigger')).toContainText('2 passengers')
  })

  test('PassengerCountSelector increments and decrements infants', async ({ page }) => {
    // Open dropdown
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()

    // Verify initial count
    await expect(page.getByTestId('infants-count')).toHaveText('0')

    // Increment infants
    await page.getByTestId('infants-increment').click()
    await expect(page.getByTestId('infants-count')).toHaveText('1')

    // Verify total: 1 adult + 1 infant = 2 passengers
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })
    await expect(page.getByTestId('passenger-count-trigger')).toContainText('2 passengers')
  })

  test('PassengerCountSelector prevents infants exceeding adults', async ({ page }) => {
    // Open dropdown
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()

    // Add 1 infant (adults = 1, so max infants = 1)
    await page.getByTestId('infants-increment').click()
    await expect(page.getByTestId('infants-count')).toHaveText('1')

    // Verify increment button is now disabled (infants = adults = 1)
    await expect(page.getByTestId('infants-increment')).toBeDisabled()

    // Try to increment - should remain at 1
    await page.getByTestId('infants-increment').click({ force: true })
    await expect(page.getByTestId('infants-count')).toHaveText('1')
  })

  test('PassengerCountSelector closes dropdown and retains values', async ({ page }) => {
    // Open dropdown and set values: 2 adults, 1 child
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()

    await page.getByTestId('adults-increment').click()
    await expect(page.getByTestId('adults-count')).toHaveText('2')

    await page.getByTestId('children-increment').click()
    await expect(page.getByTestId('children-count')).toHaveText('1')

    // Close by clicking outside
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })
    await expect(page.getByTestId('passenger-count-dropdown')).not.toBeVisible()

    // Verify label shows total (2 + 1 = 3 passengers)
    await expect(page.getByTestId('passenger-count-trigger')).toContainText('3 passengers')

    // Reopen and verify values are retained
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()
    await expect(page.getByTestId('adults-count')).toHaveText('2')
    await expect(page.getByTestId('children-count')).toHaveText('1')
    await expect(page.getByTestId('infants-count')).toHaveText('0')
  })

  test('PassengerCountSelector can be used repeatedly', async ({ page }) => {
    // Open selector and add 1 adult
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()
    await page.getByTestId('adults-increment').click()
    await expect(page.getByTestId('adults-count')).toHaveText('2')

    // Close dropdown
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })
    await expect(page.getByTestId('passenger-count-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('passenger-count-trigger')).toContainText('2 passengers')

    // Interact with another element (cabin class)
    await page.getByTestId('cabin-class-trigger').click()
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })

    // Reopen passenger selector and add 1 child
    await page.getByTestId('passenger-count-trigger').click()
    await expect(page.getByTestId('passenger-count-dropdown')).toBeVisible()
    await expect(page.getByTestId('adults-count')).toHaveText('2')
    await page.getByTestId('children-increment').click()
    await expect(page.getByTestId('children-count')).toHaveText('1')

    // Close and verify final state
    await page.getByTestId('search-page').click({ position: { x: 0, y: 0 } })
    await expect(page.getByTestId('passenger-count-dropdown')).not.toBeVisible()
    await expect(page.getByTestId('passenger-count-trigger')).toContainText('3 passengers')
  })
})
