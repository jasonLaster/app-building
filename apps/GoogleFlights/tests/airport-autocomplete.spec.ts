import { test, expect } from '@playwright/test'

test.describe('AirportAutocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('search-page')).toBeVisible({ timeout: 10000 })
  })

  test('AirportAutocomplete origin field shows placeholder text', async ({ page }) => {
    const originInput = page.getByTestId('origin-input')
    await expect(originInput).toBeVisible()
    await expect(originInput).toHaveAttribute('placeholder', 'Where from?')
    await expect(originInput).toHaveValue('')
  })

  test('AirportAutocomplete destination field shows placeholder text', async ({ page }) => {
    const destInput = page.getByTestId('destination-input')
    await expect(destInput).toBeVisible()
    await expect(destInput).toHaveAttribute('placeholder', 'Where to?')
    await expect(destInput).toHaveValue('')
  })

  test('AirportAutocomplete shows suggestions when typing airport name', async ({ page }) => {
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('Los Angeles')

    const dropdown = page.getByTestId('origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })

    const laxSuggestion = page.getByTestId('origin-suggestion-LAX')
    await expect(laxSuggestion).toBeVisible()
    await expect(laxSuggestion).toContainText('Los Angeles International Airport')
    await expect(laxSuggestion).toContainText('LAX')
  })

  test('AirportAutocomplete shows suggestions when typing IATA code', async ({ page }) => {
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('JFK')

    const dropdown = page.getByTestId('origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })

    const jfkSuggestion = page.getByTestId('origin-suggestion-JFK')
    await expect(jfkSuggestion).toBeVisible()
    await expect(jfkSuggestion).toContainText('John F. Kennedy International Airport')
    await expect(jfkSuggestion).toContainText('JFK')
  })

  test('AirportAutocomplete shows suggestions when typing city name', async ({ page }) => {
    const destInput = page.getByTestId('destination-input')
    await destInput.click()
    await destInput.fill('London')

    const dropdown = page.getByTestId('destination-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })

    const lhrSuggestion = page.getByTestId('destination-suggestion-LHR')
    await expect(lhrSuggestion).toBeVisible()
    await expect(lhrSuggestion).toContainText('Heathrow')
    await expect(lhrSuggestion).toContainText('LHR')
  })

  test('AirportAutocomplete selects a suggestion and populates the field', async ({ page }) => {
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('Los')

    const dropdown = page.getByTestId('origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })

    await page.getByTestId('origin-suggestion-LAX').click()

    await expect(dropdown).not.toBeVisible()
    await expect(originInput).toHaveValue('Los Angeles (LAX)')
  })

  test('AirportAutocomplete swap button exchanges origin and destination', async ({ page }) => {
    // Set origin to LAX
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('LAX')
    await expect(page.getByTestId('origin-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('origin-suggestion-LAX').click()
    await expect(originInput).toHaveValue('Los Angeles (LAX)')

    // Set destination to JFK
    const destInput = page.getByTestId('destination-input')
    await destInput.click()
    await destInput.fill('JFK')
    await expect(page.getByTestId('destination-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('destination-suggestion-JFK').click()
    await expect(destInput).toHaveValue('New York (JFK)')

    // Click swap
    await page.getByTestId('swap-airports-button').click()

    // Verify swapped values
    await expect(originInput).toHaveValue('New York (JFK)')
    await expect(destInput).toHaveValue('Los Angeles (LAX)')
  })

  test('AirportAutocomplete swap button works with empty fields', async ({ page }) => {
    // Set origin to LAX only
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('LAX')
    await expect(page.getByTestId('origin-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('origin-suggestion-LAX').click()
    await expect(originInput).toHaveValue('Los Angeles (LAX)')

    const destInput = page.getByTestId('destination-input')
    await expect(destInput).toHaveValue('')

    // Click swap
    await page.getByTestId('swap-airports-button').click()

    // Origin should be empty, destination should have LAX
    await expect(originInput).toHaveValue('')
    await expect(destInput).toHaveValue('Los Angeles (LAX)')
  })

  test('AirportAutocomplete clears field and shows new suggestions', async ({ page }) => {
    // Set origin to LAX
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('LAX')
    await expect(page.getByTestId('origin-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('origin-suggestion-LAX').click()
    await expect(originInput).toHaveValue('Los Angeles (LAX)')

    // Clear and type new query
    await originInput.click()
    await originInput.fill('San')

    const dropdown = page.getByTestId('origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })

    // Should show San Francisco and San Diego
    await expect(page.getByTestId('origin-suggestion-SFO')).toBeVisible()
    await expect(page.getByTestId('origin-suggestion-SFO')).toContainText('San Francisco International Airport')

  })

  test('AirportAutocomplete shows no results for invalid query', async ({ page }) => {
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('xyznonexistent')

    const dropdown = page.getByTestId('origin-dropdown')
    await expect(dropdown).toBeVisible({ timeout: 10000 })

    const noResults = page.getByTestId('origin-no-results')
    await expect(noResults).toBeVisible()
    await expect(noResults).toHaveText('No airports found')
  })

  test('AirportAutocomplete destination works after using origin', async ({ page }) => {
    // Set origin to LAX
    const originInput = page.getByTestId('origin-input')
    await originInput.click()
    await originInput.fill('LAX')
    await expect(page.getByTestId('origin-dropdown')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('origin-suggestion-LAX').click()
    await expect(originInput).toHaveValue('Los Angeles (LAX)')

    // Now use destination
    const destInput = page.getByTestId('destination-input')
    await destInput.click()
    await destInput.fill('New York')

    const destDropdown = page.getByTestId('destination-dropdown')
    await expect(destDropdown).toBeVisible({ timeout: 10000 })

    const jfkSuggestion = page.getByTestId('destination-suggestion-JFK')
    await expect(jfkSuggestion).toBeVisible()
    await jfkSuggestion.click()

    // Both fields should retain their values
    await expect(destDropdown).not.toBeVisible()
    await expect(destInput).toHaveValue('New York (JFK)')
    await expect(originInput).toHaveValue('Los Angeles (LAX)')
  })
})
