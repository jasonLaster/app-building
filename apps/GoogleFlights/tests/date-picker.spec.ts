import { test, expect } from '@playwright/test'

test.describe('DatePicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('DatePicker departure field shows placeholder', async ({ page }) => {
    const departureTrigger = page.getByTestId('departure-date-trigger')
    await expect(departureTrigger).toBeVisible()
    await expect(departureTrigger).toContainText('Departure')
  })

  test('DatePicker return field shows placeholder when Round trip', async ({ page }) => {
    // Default trip type is Round trip
    await expect(page.getByTestId('trip-type-selector-trigger')).toContainText('Round trip')

    const returnTrigger = page.getByTestId('return-date-trigger')
    await expect(returnTrigger).toBeVisible()
    await expect(returnTrigger).toContainText('Return')
  })

  test('DatePicker opens calendar on departure field click', async ({ page }) => {
    // Calendar should not be visible initially
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    // Click the departure date trigger
    await page.getByTestId('departure-date-trigger').click()

    // Calendar should now be visible
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()

    // Should show the current month label
    const now = new Date()
    const expectedMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    await expect(page.getByTestId('departure-date-month-label')).toHaveText(expectedMonth)

    // Navigation buttons should be present
    await expect(page.getByTestId('departure-date-prev-month')).toBeVisible()
    await expect(page.getByTestId('departure-date-next-month')).toBeVisible()

    // Previous month button should be disabled for current month
    await expect(page.getByTestId('departure-date-prev-month')).toBeDisabled()
  })

  test('DatePicker selects a departure date', async ({ page }) => {
    // Open departure calendar
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()

    // Navigate to next month to pick a future date
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const dateStr = `${year}-${month}-25`

    // Click the 25th
    await page.getByTestId(`departure-date-day-${dateStr}`).click()

    // Calendar should close
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    // Departure trigger should show the selected date
    const expectedDisplay = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    await expect(page.getByTestId('departure-date-trigger')).toContainText(expectedDisplay)
  })

  test('DatePicker selects a return date after departure', async ({ page }) => {
    // First set departure date to next month 25th
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const depDateStr = `${year}-${month}-25`
    await page.getByTestId(`departure-date-day-${depDateStr}`).click()
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    // Now open return calendar
    await page.getByTestId('return-date-trigger').click()
    await expect(page.getByTestId('return-date-calendar')).toBeVisible()

    // Navigate to the month after next to pick April 1
    const returnMonth = new Date()
    returnMonth.setMonth(returnMonth.getMonth() + 2)
    const retYear = returnMonth.getFullYear()
    const retMonth = String(returnMonth.getMonth() + 1).padStart(2, '0')

    // The return calendar opens at current month, navigate to the right month
    // We need to navigate forward twice (once past current, once past next)
    await page.getByTestId('return-date-next-month').click()
    await page.getByTestId('return-date-next-month').click()

    const retDateStr = `${retYear}-${retMonth}-01`
    await page.getByTestId(`return-date-day-${retDateStr}`).click()
    await expect(page.getByTestId('return-date-calendar')).not.toBeVisible()

    // Return trigger should show the selected date
    const expectedDisplay = new Date(retDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    await expect(page.getByTestId('return-date-trigger')).toContainText(expectedDisplay)
  })

  test('DatePicker prevents selecting return date before departure', async ({ page }) => {
    // Set departure date to next month 25th
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const depDateStr = `${year}-${month}-25`
    await page.getByTestId(`departure-date-day-${depDateStr}`).click()
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    // Open return calendar
    await page.getByTestId('return-date-trigger').click()
    await expect(page.getByTestId('return-date-calendar')).toBeVisible()

    // Navigate to the same month as departure
    await page.getByTestId('return-date-next-month').click()

    // The 20th should be before departure (25th), so it should be disabled
    const beforeDateStr = `${year}-${month}-20`
    await expect(page.getByTestId(`return-date-day-${beforeDateStr}`)).toBeDisabled()
  })

  test('DatePicker navigates to next month', async ({ page }) => {
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()

    const now = new Date()
    const currentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    await expect(page.getByTestId('departure-date-month-label')).toHaveText(currentMonthLabel)

    // Click next month
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextMonthLabel = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    await expect(page.getByTestId('departure-date-month-label')).toHaveText(nextMonthLabel)
  })

  test('DatePicker navigates to previous month not before current', async ({ page }) => {
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()

    // On current month, prev button should be disabled
    await expect(page.getByTestId('departure-date-prev-month')).toBeDisabled()

    // Navigate to next month first
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextMonthLabel = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    await expect(page.getByTestId('departure-date-month-label')).toHaveText(nextMonthLabel)

    // Now prev button should be enabled
    await expect(page.getByTestId('departure-date-prev-month')).not.toBeDisabled()

    // Click prev to go back to current month
    await page.getByTestId('departure-date-prev-month').click()

    const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    await expect(page.getByTestId('departure-date-month-label')).toHaveText(currentMonthLabel)

    // Prev button should be disabled again
    await expect(page.getByTestId('departure-date-prev-month')).toBeDisabled()
  })

  test('DatePicker return field hidden when One way selected', async ({ page }) => {
    // Return field should be visible by default (Round trip)
    await expect(page.getByTestId('return-date-container')).toBeVisible()

    // Switch to One way
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()

    // Return date field should be hidden
    await expect(page.getByTestId('return-date-container')).not.toBeVisible()

    // Departure date should still be visible
    await expect(page.getByTestId('departure-date-container')).toBeVisible()
  })

  test('DatePicker retains departure date when switching trip types', async ({ page }) => {
    // Set departure date
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const depDateStr = `${year}-${month}-25`
    await page.getByTestId(`departure-date-day-${depDateStr}`).click()
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    const expectedDisplay = new Date(depDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    await expect(page.getByTestId('departure-date-trigger')).toContainText(expectedDisplay)

    // Switch to One way
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-one_way').click()

    // Departure date should still be shown
    await expect(page.getByTestId('departure-date-trigger')).toContainText(expectedDisplay)

    // Switch back to Round trip
    await page.getByTestId('trip-type-selector-trigger').click()
    await page.getByTestId('trip-type-option-round_trip').click()

    // Departure date should still be retained
    await expect(page.getByTestId('departure-date-trigger')).toContainText(expectedDisplay)
  })

  test('DatePicker can be used repeatedly', async ({ page }) => {
    // Set departure date to 25th of next month
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()
    await page.getByTestId('departure-date-next-month').click()

    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const year = nextMonth.getFullYear()
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const firstDateStr = `${year}-${month}-25`
    await page.getByTestId(`departure-date-day-${firstDateStr}`).click()
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    const firstDisplay = new Date(firstDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    await expect(page.getByTestId('departure-date-trigger')).toContainText(firstDisplay)

    // Now click again and select a different date (28th)
    await page.getByTestId('departure-date-trigger').click()
    await expect(page.getByTestId('departure-date-calendar')).toBeVisible()

    const secondDateStr = `${year}-${month}-28`
    await page.getByTestId(`departure-date-day-${secondDateStr}`).click()
    await expect(page.getByTestId('departure-date-calendar')).not.toBeVisible()

    const secondDisplay = new Date(secondDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    await expect(page.getByTestId('departure-date-trigger')).toContainText(secondDisplay)
  })
})
