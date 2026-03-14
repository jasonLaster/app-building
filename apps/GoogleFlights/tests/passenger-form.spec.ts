import { test, expect } from '@playwright/test'

/**
 * Helper to build a results page URL with search parameters.
 */
function buildResultsUrl(params?: {
  origin?: string
  destination?: string
  departureDate?: string
  cabinClass?: string
  adults?: string
  children?: string
  infants?: string
  returnDate?: string
}): string {
  const sp = new URLSearchParams({
    origin: params?.origin ?? 'LAX',
    destination: params?.destination ?? 'JFK',
    departureDate: params?.departureDate ?? '2026-04-01',
    tripType: 'round_trip',
    cabinClass: params?.cabinClass ?? 'economy',
    adults: params?.adults ?? '1',
    children: params?.children ?? '0',
    infants: params?.infants ?? '0',
    returnDate: params?.returnDate ?? '2026-04-08',
  })
  return `/results?${sp.toString()}`
}

/**
 * Navigate to results, find a flight, then navigate to the booking page.
 */
async function navigateToBookingPage(
  page: import('@playwright/test').Page,
  options: {
    origin?: string
    destination?: string
    departureDate?: string
    cabinClass?: string
    adults?: string
    children?: string
    infants?: string
    returnDate?: string
    flightNumber?: string
  } = {}
) {
  await page.goto(buildResultsUrl({
    origin: options.origin,
    destination: options.destination,
    departureDate: options.departureDate,
    cabinClass: options.cabinClass,
    adults: options.adults,
    children: options.children,
    infants: options.infants,
    returnDate: options.returnDate,
  }))
  await expect(page.getByTestId('search-results-page')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('results-list')).toBeVisible({ timeout: 15000 })

  let flightId: string

  if (options.flightNumber) {
    const card = page.locator('[data-testid^="flight-card-"]').filter({
      has: page.locator('[data-testid^="flight-card-flightnum-"]', { hasText: new RegExp(`^${options.flightNumber}$`) })
    }).locator('[data-testid^="flight-card-main-"]')
    await expect(card).toBeVisible({ timeout: 10000 })
    const testId = await card.getAttribute('data-testid')
    flightId = testId!.replace('flight-card-main-', '')
  } else {
    const firstCard = page.locator('[data-testid^="flight-card-main-"]').first()
    const testId = await firstCard.getAttribute('data-testid')
    flightId = testId!.replace('flight-card-main-', '')
  }

  const bookingParams = new URLSearchParams({
    cabin: options.cabinClass ?? 'economy',
    adults: options.adults ?? '1',
    children: options.children ?? '0',
    infants: options.infants ?? '0',
  })

  await page.goto(`/booking/${flightId}?${bookingParams.toString()}`)
  await expect(page.getByTestId('flight-details-page')).toBeVisible({ timeout: 15000 })
  await expect(page.getByTestId('passenger-form')).toBeVisible({ timeout: 15000 })

  return flightId
}

test.describe('PassengerForm', () => {
  test('PassengerForm displays correct number of passenger forms', async ({ page }) => {
    await navigateToBookingPage(page, { adults: '2', children: '1' })

    // Should have 3 passenger sub-forms
    await expect(page.locator('[data-testid^="passenger-subform-"]')).toHaveCount(3)

    // Check labels
    await expect(page.getByTestId('passenger-label-0')).toHaveText('Passenger 1 (Adult)')
    await expect(page.getByTestId('passenger-label-1')).toHaveText('Passenger 2 (Adult)')
    await expect(page.getByTestId('passenger-label-2')).toHaveText('Passenger 3 (Child)')

    // Each form should have first name, last name, dob, and gender fields
    for (let i = 0; i < 3; i++) {
      await expect(page.getByTestId(`passenger-firstname-${i}`)).toBeVisible()
      await expect(page.getByTestId(`passenger-lastname-${i}`)).toBeVisible()
      await expect(page.getByTestId(`passenger-dob-${i}`)).toBeVisible()
      await expect(page.getByTestId(`passenger-gender-${i}`)).toBeVisible()
    }
  })

  test('PassengerForm shows primary passenger contact fields', async ({ page }) => {
    await navigateToBookingPage(page, { adults: '2' })

    // Passenger 1 (primary) should have email and phone
    await expect(page.getByTestId('passenger-email-0')).toBeVisible()
    await expect(page.getByTestId('passenger-phone-0')).toBeVisible()

    // Passenger 2 should NOT have email and phone
    await expect(page.getByTestId('passenger-email-1')).not.toBeVisible()
    await expect(page.getByTestId('passenger-phone-1')).not.toBeVisible()
  })

  test('PassengerForm first name and last name input', async ({ page }) => {
    await navigateToBookingPage(page)

    const firstName = page.getByTestId('passenger-firstname-0')
    const lastName = page.getByTestId('passenger-lastname-0')

    await firstName.fill('John')
    await lastName.fill('Doe')

    await expect(firstName).toHaveValue('John')
    await expect(lastName).toHaveValue('Doe')
  })

  test('PassengerForm date of birth picker', async ({ page }) => {
    await navigateToBookingPage(page)

    const dobInput = page.getByTestId('passenger-dob-0')
    await dobInput.fill('1990-01-15')

    await expect(dobInput).toHaveValue('1990-01-15')
  })

  test('PassengerForm gender dropdown', async ({ page }) => {
    await navigateToBookingPage(page)

    const genderDropdown = page.getByTestId('passenger-gender-0')

    // Initially shows placeholder
    await expect(genderDropdown).toContainText('Select gender')

    // Click to open dropdown
    await genderDropdown.click()

    // Options should be visible
    const options = page.getByTestId('passenger-gender-options-0')
    await expect(options).toBeVisible()

    // All 4 options should be present
    await expect(page.getByTestId('passenger-gender-option-0-male')).toBeVisible()
    await expect(page.getByTestId('passenger-gender-option-0-female')).toBeVisible()
    await expect(page.getByTestId('passenger-gender-option-0-other')).toBeVisible()
    await expect(page.getByTestId('passenger-gender-option-0-prefer-not-to-say')).toBeVisible()

    // Select "Male"
    await page.getByTestId('passenger-gender-option-0-male').click()

    // Dropdown should close and show selected value
    await expect(options).not.toBeVisible()
    await expect(genderDropdown).toContainText('Male')
  })

  test('PassengerForm email validation', async ({ page }) => {
    await navigateToBookingPage(page)

    // Type invalid email
    await page.getByTestId('passenger-email-0').fill('invalid-email')

    // Fill other required fields to avoid other errors clouding the assertion
    await page.getByTestId('passenger-firstname-0').fill('John')
    await page.getByTestId('passenger-lastname-0').fill('Doe')
    await page.getByTestId('passenger-dob-0').fill('1990-01-15')
    await page.getByTestId('passenger-gender-0').click()
    await page.getByTestId('passenger-gender-option-0-male').click()
    await page.getByTestId('passenger-phone-0').fill('+1 555-123-4567')

    // Click Book Flight to trigger validation
    await page.getByTestId('booking-button').click()

    // Email validation error should appear
    await expect(page.getByTestId('passenger-error-email-0')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('passenger-error-email-0')).toHaveText('Please enter a valid email address')
  })

  test('PassengerForm email accepts valid input', async ({ page }) => {
    await navigateToBookingPage(page)

    const emailInput = page.getByTestId('passenger-email-0')
    await emailInput.fill('john.doe@example.com')

    await expect(emailInput).toHaveValue('john.doe@example.com')

    // No validation error should be visible
    await expect(page.getByTestId('passenger-error-email-0')).not.toBeVisible()
  })

  test('PassengerForm phone number input', async ({ page }) => {
    await navigateToBookingPage(page)

    const phoneInput = page.getByTestId('passenger-phone-0')
    await phoneInput.fill('+1 555-123-4567')

    await expect(phoneInput).toHaveValue('+1 555-123-4567')

    // No validation error
    await expect(page.getByTestId('passenger-error-phone-0')).not.toBeVisible()
  })

  test('PassengerForm required field validation', async ({ page }) => {
    await navigateToBookingPage(page)

    // Click Book Flight without filling anything
    await page.getByTestId('booking-button').click()

    // All required field errors should appear for passenger 0
    await expect(page.getByTestId('passenger-error-firstname-0')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('passenger-error-firstname-0')).toHaveText('First name is required')

    await expect(page.getByTestId('passenger-error-lastname-0')).toBeVisible()
    await expect(page.getByTestId('passenger-error-lastname-0')).toHaveText('Last name is required')

    await expect(page.getByTestId('passenger-error-dob-0')).toBeVisible()
    await expect(page.getByTestId('passenger-error-dob-0')).toHaveText('Date of birth is required')

    await expect(page.getByTestId('passenger-error-gender-0')).toBeVisible()
    await expect(page.getByTestId('passenger-error-gender-0')).toHaveText('Gender is required')

    // Primary passenger also needs email and phone
    await expect(page.getByTestId('passenger-error-email-0')).toBeVisible()
    await expect(page.getByTestId('passenger-error-email-0')).toHaveText('Email is required')

    await expect(page.getByTestId('passenger-error-phone-0')).toBeVisible()
    await expect(page.getByTestId('passenger-error-phone-0')).toHaveText('Phone number is required')
  })

  test('PassengerForm infant passenger form', async ({ page }) => {
    await navigateToBookingPage(page, { adults: '1', infants: '1' })

    // Should have 2 passenger sub-forms
    await expect(page.locator('[data-testid^="passenger-subform-"]')).toHaveCount(2)

    // First is adult with contact fields
    await expect(page.getByTestId('passenger-label-0')).toHaveText('Passenger 1 (Adult)')
    await expect(page.getByTestId('passenger-email-0')).toBeVisible()
    await expect(page.getByTestId('passenger-phone-0')).toBeVisible()

    // Second is infant without contact fields
    await expect(page.getByTestId('passenger-label-1')).toHaveText('Passenger 2 (Infant)')
    await expect(page.getByTestId('passenger-firstname-1')).toBeVisible()
    await expect(page.getByTestId('passenger-lastname-1')).toBeVisible()
    await expect(page.getByTestId('passenger-dob-1')).toBeVisible()
    await expect(page.getByTestId('passenger-gender-1')).toBeVisible()
    await expect(page.getByTestId('passenger-email-1')).not.toBeVisible()
    await expect(page.getByTestId('passenger-phone-1')).not.toBeVisible()
  })

  test('PassengerForm can be filled and edited multiple times', async ({ page }) => {
    await navigateToBookingPage(page)

    const firstName = page.getByTestId('passenger-firstname-0')
    const dobInput = page.getByTestId('passenger-dob-0')

    // Fill first name with "John"
    await firstName.fill('John')
    await expect(firstName).toHaveValue('John')

    // Change to "Jane"
    await firstName.fill('Jane')
    await expect(firstName).toHaveValue('Jane')

    // Interact with DOB picker
    await dobInput.fill('1990-01-15')
    await expect(dobInput).toHaveValue('1990-01-15')

    // Return to first name and change to "Alex"
    await firstName.fill('Alex')
    await expect(firstName).toHaveValue('Alex')

    // DOB should still retain its value
    await expect(dobInput).toHaveValue('1990-01-15')
  })
})
