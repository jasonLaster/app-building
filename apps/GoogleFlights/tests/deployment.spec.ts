import { test, expect } from '@playwright/test'

test('deployment: app displays data and supports writes', async ({ page, baseURL }) => {
  // Step 1: Navigate to main page and verify real data loads
  await page.goto('/')
  await expect(page.getByTestId('search-page')).toBeVisible()

  // Verify popular destinations load with real data
  const grid = page.getByTestId('popular-destinations-grid')
  await expect(grid).toBeVisible({ timeout: 15000 })
  const cards = grid.locator('[data-testid^="popular-dest-"]')
  await expect(cards.first()).toBeVisible({ timeout: 15000 })
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)

  // Step 2: Verify a write operation works by posting a recent search via API
  const sessionToken = `deploy-test-${Date.now()}`
  const response = await page.request.post(`${baseURL}/.netlify/functions/recent-searches`, {
    data: {
      sessionToken,
      originCode: 'JFK',
      destCode: 'LHR',
      departureDate: '2026-06-15',
      returnDate: '2026-06-22',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy',
      tripType: 'round_trip',
    },
  })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(body.success).toBe(true)

  // Verify the write persisted by reading it back
  const getResponse = await page.request.get(
    `${baseURL}/.netlify/functions/recent-searches?session=${sessionToken}`
  )
  expect(getResponse.ok()).toBeTruthy()
  const searches = await getResponse.json()
  expect(searches.length).toBeGreaterThan(0)
  expect(searches[0].origin_code).toBe('JFK')
  expect(searches[0].dest_code).toBe('LHR')
})
