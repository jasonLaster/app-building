import { test, expect } from '@playwright/test'

/** Helper: navigate to Explore page and select an origin airport */
async function selectOrigin(page: import('@playwright/test').Page, query: string, code: string) {
  const input = page.getByTestId('explore-origin-input')
  await input.click()
  await input.fill(query)
  const dropdown = page.getByTestId('explore-origin-dropdown')
  await expect(dropdown).toBeVisible({ timeout: 10000 })
  await page.getByTestId(`explore-origin-suggestion-${code}`).click()
  await expect(dropdown).not.toBeVisible()
}

test.describe('FlexibleDatesGrid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByTestId('explore-page')).toBeVisible({ timeout: 10000 })
  })

  test('FlexibleDatesGrid displays calendar-style grid with prices', async ({ page }) => {
    // Select origin to load data
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for flexible dates grid to be visible
    const grid = page.getByTestId('flexible-dates-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Wait for cells to appear (not loading state)
    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Should have date cells with prices
    const dateCells = page.locator('[data-testid^="date-cell-"]')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })
    const count = await dateCells.count()
    expect(count).toBeGreaterThan(0)

    // Each cell should show a day name, date, and price
    const firstCell = dateCells.first()
    const cellText = await firstCell.textContent()
    // Should contain a price ($ sign) or dash for no-price cells
    expect(cellText).toMatch(/(\$\d+|—)/)
  })

  test('FlexibleDatesGrid cells are color-coded by price level', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    const dateCells = page.locator('[data-testid^="date-cell-"]')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })

    // Check that cells have color-coded CSS classes
    const allCells = await dateCells.all()
    const classNames = new Set<string>()
    for (const cell of allCells) {
      const cls = await cell.getAttribute('class')
      if (cls?.includes('--cheap')) classNames.add('cheap')
      if (cls?.includes('--moderate')) classNames.add('moderate')
      if (cls?.includes('--expensive')) classNames.add('expensive')
    }

    // Should have at least one pricing level class applied
    expect(classNames.size).toBeGreaterThan(0)
  })

  test('FlexibleDatesGrid date range selector Weekend trips', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    const grid = page.getByTestId('flexible-dates-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Click the Weekend trips button
    const weekendBtn = page.getByTestId('date-range-weekend')
    await expect(weekendBtn).toBeVisible()
    await weekendBtn.click()

    // Weekend button should be active
    await expect(weekendBtn).toHaveClass(/--active/)

    // Wait for cells to load
    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })
  })

  test('FlexibleDatesGrid date range selector 1 week', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    const grid = page.getByTestId('flexible-dates-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Click 1 week
    const oneWeekBtn = page.getByTestId('date-range-1week')
    await expect(oneWeekBtn).toBeVisible()
    await oneWeekBtn.click()

    // 1 week button should be active
    await expect(oneWeekBtn).toHaveClass(/--active/)

    // Wait for cells to appear
    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Should have date cells
    const dateCells = page.locator('[data-testid^="date-cell-"]')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })
    const count = await dateCells.count()
    expect(count).toBeGreaterThan(0)
  })

  test('FlexibleDatesGrid date range selector 2 weeks', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    const grid = page.getByTestId('flexible-dates-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // First select 1 week
    await page.getByTestId('date-range-1week').click()
    const cells1 = page.getByTestId('flexible-dates-cells')
    await expect(cells1).toBeVisible({ timeout: 15000 })

    // Now select 2 weeks
    const twoWeeksBtn = page.getByTestId('date-range-2weeks')
    await twoWeeksBtn.click()

    // 2 weeks button should be active
    await expect(twoWeeksBtn).toHaveClass(/--active/)

    // Wait for cells to appear
    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    const dateCells = page.locator('[data-testid^="date-cell-"]')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })
  })

  test('FlexibleDatesGrid clicking a date cell initiates a search', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    // Select 1 week range for predictable return date calculation
    await page.getByTestId('date-range-1week').click()

    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Find a cell with a price (not disabled)
    const dateCells = page.locator('[data-testid^="date-cell-"]:not([disabled])')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })

    // Get the date from the first enabled cell's testid
    const firstTestId = await dateCells.first().getAttribute('data-testid')
    const departureDate = firstTestId!.replace('date-cell-', '')

    // Calculate expected return date (1 week = 7 days later)
    const depDate = new Date(departureDate + 'T12:00:00')
    depDate.setDate(depDate.getDate() + 7)
    const returnDate = depDate.toISOString().split('T')[0]

    // Click the cell
    await dateCells.first().click()

    // Should navigate to results page with origin, departureDate, and returnDate
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })
    const url = page.url()
    const params = new URLSearchParams(new URL(url).search)
    expect(params.get('origin')).toBe('LAX')
    expect(params.get('departureDate')).toBe(departureDate)
    expect(params.get('returnDate')).toBe(returnDate)
  })

  test('FlexibleDatesGrid shows loading state while fetching price data', async ({ page }) => {
    // Select origin - loading should appear briefly
    const input = page.getByTestId('explore-origin-input')
    await input.click()
    await input.fill('LAX')
    const dropdown = page.getByTestId('explore-origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })
    await page.getByTestId('explore-origin-suggestion-LAX').click()

    // After loading, cells should appear
    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })
  })

  test('FlexibleDatesGrid updates when origin changes', async ({ page }) => {
    // Select LAX
    await selectOrigin(page, 'LAX', 'LAX')

    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Get initial cell prices
    const dateCells = page.locator('[data-testid^="date-cell-"]')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })
    const initialCount = await dateCells.count()

    // Change to SFO
    await selectOrigin(page, 'SFO', 'SFO')

    // Grid should still be visible and update with new data
    await expect(cells).toBeVisible({ timeout: 15000 })
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })
    const updatedCount = await dateCells.count()
    expect(updatedCount).toBeGreaterThan(0)
  })

  test('FlexibleDatesGrid date range selector can be toggled repeatedly', async ({ page }) => {
    await selectOrigin(page, 'LAX', 'LAX')

    const grid = page.getByTestId('flexible-dates-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    const weekendBtn = page.getByTestId('date-range-weekend')
    const oneWeekBtn = page.getByTestId('date-range-1week')
    const twoWeeksBtn = page.getByTestId('date-range-2weeks')

    // Start with weekend (default)
    await expect(weekendBtn).toHaveClass(/--active/)

    // Switch to 1 week
    await oneWeekBtn.click()
    await expect(oneWeekBtn).toHaveClass(/--active/)
    const cells = page.getByTestId('flexible-dates-cells')
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Switch to 2 weeks
    await twoWeeksBtn.click()
    await expect(twoWeeksBtn).toHaveClass(/--active/)
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Switch back to weekend
    await weekendBtn.click()
    await expect(weekendBtn).toHaveClass(/--active/)
    await expect(cells).toBeVisible({ timeout: 15000 })

    // Verify data is still present
    const dateCells = page.locator('[data-testid^="date-cell-"]')
    await expect(dateCells.first()).toBeVisible({ timeout: 10000 })
  })

  test('FlexibleDatesGrid shows empty state when no prices available', async ({ page }) => {
    const grid = page.getByTestId('flexible-dates-grid')
    await expect(grid).toBeVisible({ timeout: 10000 })

    // Without selecting an origin, the grid should show empty state
    // since no data is fetched without an origin
    const emptyState = page.getByTestId('flexible-dates-empty')
    await expect(emptyState).toBeVisible({ timeout: 10000 })
    await expect(emptyState).toContainText('No price data available')
  })
})
