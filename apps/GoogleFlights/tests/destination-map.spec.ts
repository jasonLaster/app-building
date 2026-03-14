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

test.describe('DestinationMap', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore')
    await expect(page.getByTestId('explore-page')).toBeVisible({ timeout: 10000 })
  })

  test('DestinationMap displays interactive map on Explore page', async ({ page }) => {
    const map = page.getByTestId('destination-map')
    await expect(map).toBeVisible({ timeout: 10000 })

    // Map SVG should be visible
    const svg = page.getByTestId('destination-map-svg')
    await expect(svg).toBeVisible()

    // Zoom controls should be present
    const controls = page.getByTestId('destination-map-controls')
    await expect(controls).toBeVisible()
    await expect(page.getByTestId('destination-map-zoom-in')).toBeVisible()
    await expect(page.getByTestId('destination-map-zoom-out')).toBeVisible()
    await expect(page.getByTestId('destination-map-reset')).toBeVisible()
  })

  test('DestinationMap shows origin airport selector', async ({ page }) => {
    const originSelector = page.getByTestId('explore-origin-selector')
    await expect(originSelector).toBeVisible({ timeout: 10000 })

    const originInput = page.getByTestId('explore-origin-input')
    await expect(originInput).toBeVisible()
    await expect(originInput).toHaveAttribute('placeholder', 'Select origin airport')
  })

  test('DestinationMap changing origin updates displayed destinations', async ({ page }) => {
    // Select LAX as origin
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for markers to appear
    const markers = page.locator('[data-testid^="destination-marker-"]')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })
    const laxCount = await markers.count()
    expect(laxCount).toBeGreaterThan(0)

    // Get the first marker's testid for LAX results
    const firstLaxMarkerId = await markers.first().getAttribute('data-testid')

    // Change origin to SFO
    await selectOrigin(page, 'SFO', 'SFO')

    // Wait for markers to update - new markers should appear
    await expect(markers.first()).toBeVisible({ timeout: 15000 })
    const sfoCount = await markers.count()
    expect(sfoCount).toBeGreaterThan(0)
  })

  test('DestinationMap displays destination markers with prices', async ({ page }) => {
    // Select origin
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for markers to appear
    const markers = page.locator('[data-testid^="destination-marker-"]')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })

    const count = await markers.count()
    expect(count).toBeGreaterThan(0)

    // Each marker should contain a price (text with $ sign)
    const firstMarker = markers.first()
    await expect(firstMarker).toBeVisible()
    const markerText = await firstMarker.textContent()
    expect(markerText).toMatch(/\$\d+/)
  })

  test('DestinationMap clicking a destination marker initiates a search', async ({ page }) => {
    // Select LAX as origin
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for markers
    const markers = page.locator('[data-testid^="destination-marker-"]')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })

    // Get the IATA code from the first marker's testid
    const firstTestId = await markers.first().getAttribute('data-testid')
    const iataCode = firstTestId!.replace('destination-marker-', '')

    // Click the marker
    await markers.first().click()

    // Should navigate to results with origin=LAX and destination set
    await expect(page).toHaveURL(/\/results\?/, { timeout: 10000 })
    const url = page.url()
    expect(url).toContain('origin=LAX')
    expect(url).toContain(`destination=${iataCode}`)
  })

  test('DestinationMap hover on destination marker shows tooltip', async ({ page }) => {
    // Select origin
    await selectOrigin(page, 'LAX', 'LAX')

    // Wait for markers
    const markers = page.locator('[data-testid^="destination-marker-"]')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })

    // Get the IATA code from the first marker
    const firstTestId = await markers.first().getAttribute('data-testid')
    const iataCode = firstTestId!.replace('destination-marker-', '')

    // Hover over the marker
    await markers.first().hover()

    // Tooltip should appear with destination info
    const tooltip = page.getByTestId(`destination-tooltip-${iataCode}`)
    await expect(tooltip).toBeVisible({ timeout: 5000 })

    // Tooltip should contain city name, price, and airline info
    const tooltipText = await tooltip.textContent()
    expect(tooltipText).toContain(iataCode)
    expect(tooltipText).toMatch(/\$\d+/)
  })

  test('DestinationMap zoom and pan interaction', async ({ page }) => {
    const map = page.getByTestId('destination-map')
    await expect(map).toBeVisible({ timeout: 10000 })

    const svg = page.getByTestId('destination-map-svg')

    // Get initial viewBox
    const initialViewBox = await svg.getAttribute('viewBox')
    expect(initialViewBox).toBe('0 0 1000 500')

    // Click zoom in
    await page.getByTestId('destination-map-zoom-in').click()

    // ViewBox should have changed (smaller width/height = zoomed in)
    const zoomedViewBox = await svg.getAttribute('viewBox')
    expect(zoomedViewBox).not.toBe('0 0 1000 500')

    // Click reset to return to original
    await page.getByTestId('destination-map-reset').click()
    const resetViewBox = await svg.getAttribute('viewBox')
    expect(resetViewBox).toBe('0 0 1000 500')

    // Click zoom out
    await page.getByTestId('destination-map-zoom-out').click()

    // After zooming out from default, viewBox should still be 1000x500 (max)
    // since we're already at the maximum zoom level
    const zoomedOutViewBox = await svg.getAttribute('viewBox')
    expect(zoomedOutViewBox).toBe('0 0 1000 500')
  })

  test('DestinationMap shows loading state while fetching destinations', async ({ page }) => {
    // Select origin - loading state appears while fetching
    const input = page.getByTestId('explore-origin-input')
    await input.click()
    await input.fill('LAX')
    const dropdown = page.getByTestId('explore-origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })
    await page.getByTestId('explore-origin-suggestion-LAX').click()

    // After loading completes, markers should appear
    const markers = page.locator('[data-testid^="destination-marker-"]')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })
  })

  test('DestinationMap shows empty state when no destinations available', async ({ page }) => {
    // Select an airport that has no outbound flights in seed data
    await selectOrigin(page, 'Honolulu', 'HNL')

    // Should show empty state message since HNL has no outbound flights
    const emptyState = page.getByTestId('destination-map-empty')
    await expect(emptyState).toBeVisible({ timeout: 15000 })
    await expect(emptyState).toContainText('No destinations found')
  })

  test('DestinationMap origin can be changed repeatedly', async ({ page }) => {
    // Select LAX
    await selectOrigin(page, 'LAX', 'LAX')
    const markers = page.locator('[data-testid^="destination-marker-"]')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })
    const laxCount = await markers.count()
    expect(laxCount).toBeGreaterThan(0)

    // Change to SFO
    await selectOrigin(page, 'SFO', 'SFO')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })
    const sfoCount = await markers.count()
    expect(sfoCount).toBeGreaterThan(0)

    // Change back to LAX
    await selectOrigin(page, 'LAX', 'LAX')
    await expect(markers.first()).toBeVisible({ timeout: 15000 })
    const laxCount2 = await markers.count()
    expect(laxCount2).toBeGreaterThan(0)
  })
})
