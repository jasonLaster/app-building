import { test, expect } from '@playwright/test'

async function loginAs(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login')
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-submit-button').click()
  await expect(page).toHaveURL('/', { timeout: 30000 })
}

test.describe('My Trips - CancelBookingDialog', () => {
  test('Clicking Cancel button opens confirmation dialog', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // e6666666 is confirmed - click its Cancel button
    const cancelBtn = page.getByTestId('cancel-button-e6666666-6666-6666-6666-666666666666')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await cancelBtn.click()

    // Dialog should appear
    const dialog = page.getByTestId('cancel-dialog')
    await expect(dialog).toBeVisible({ timeout: 30000 })
    await expect(dialog).toContainText('Are you sure you want to cancel this booking?')

    // Confirm and dismiss buttons should be visible
    await expect(page.getByTestId('cancel-dialog-confirm')).toBeVisible()
    await expect(page.getByTestId('cancel-dialog-dismiss')).toBeVisible()
  })

  test('Dismissing cancellation dialog keeps booking unchanged', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Open cancel dialog for pending booking e3333333
    const cancelBtn = page.getByTestId('cancel-button-e3333333-3333-3333-3333-333333333333')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await cancelBtn.click()

    await expect(page.getByTestId('cancel-dialog')).toBeVisible({ timeout: 30000 })

    // Click Keep Booking to dismiss
    await page.getByTestId('cancel-dialog-dismiss').click()

    // Dialog should close
    await expect(page.getByTestId('cancel-dialog')).not.toBeVisible({ timeout: 30000 })

    // Booking should still be visible in Upcoming with original status
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible()
    await expect(page.getByTestId('status-badge-e3333333-3333-3333-3333-333333333333')).toHaveText('Pending')
  })

  test('Closing the dialog via overlay click keeps booking unchanged', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Open cancel dialog for confirmed booking e6666666
    const cancelBtn = page.getByTestId('cancel-button-e6666666-6666-6666-6666-666666666666')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await cancelBtn.click()

    await expect(page.getByTestId('cancel-dialog')).toBeVisible({ timeout: 30000 })

    // Click on the overlay (outside the dialog)
    const overlay = page.getByTestId('cancel-dialog-overlay')
    // Click at the edge of the overlay to avoid hitting the dialog itself
    await overlay.click({ position: { x: 10, y: 10 } })

    // Dialog should close
    await expect(page.getByTestId('cancel-dialog')).not.toBeVisible({ timeout: 30000 })

    // Booking should still be visible with original status
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible()
    await expect(page.getByTestId('status-badge-e6666666-6666-6666-6666-666666666666')).toHaveText('Confirmed')
  })

  test('Cancel dialog shows property and date context', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Open cancel dialog for e3333333 (Mountain Cabin, May 10-13, 2026)
    const cancelBtn = page.getByTestId('cancel-button-e3333333-3333-3333-3333-333333333333')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await cancelBtn.click()

    const dialog = page.getByTestId('cancel-dialog')
    await expect(dialog).toBeVisible({ timeout: 30000 })

    // Dialog should show property name and date range
    await expect(dialog).toContainText('Mountain Cabin')
    // CancelBookingDialog uses long month format: "May 10, 2026 – May 13, 2026"
    await expect(dialog).toContainText('May 10, 2026')
    await expect(dialog).toContainText('May 13, 2026')
  })

  // --- Destructive tests below (each uses a unique booking) ---

  test('Cancel dialog is functional on repeated use', async ({ page }) => {
    test.slow()
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // First: open cancel dialog for e3333333 (pending) and dismiss it
    await page.getByTestId('cancel-button-e3333333-3333-3333-3333-333333333333').click()
    await expect(page.getByTestId('cancel-dialog')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('cancel-dialog-dismiss').click()
    await expect(page.getByTestId('cancel-dialog')).not.toBeVisible({ timeout: 30000 })

    // First booking should still be unchanged
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible()
    await expect(page.getByTestId('status-badge-e3333333-3333-3333-3333-333333333333')).toHaveText('Pending')

    // Second: open cancel dialog for e6666666 (confirmed) and confirm cancellation
    await page.getByTestId('cancel-button-e6666666-6666-6666-6666-666666666666').click()
    await expect(page.getByTestId('cancel-dialog')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('cancel-dialog-confirm').click()
    await expect(page.getByTestId('cancel-dialog')).not.toBeVisible({ timeout: 30000 })

    // Second booking should be cancelled and removed from Upcoming
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).not.toBeVisible({ timeout: 30000 })

    // First booking should still be in Upcoming unchanged
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible()

    // Switch to Cancelled to verify second booking moved there
    await page.getByTestId('tab-cancelled').click()
    await expect(page.getByTestId('trip-card-e6666666-6666-6666-6666-666666666666')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('status-badge-e6666666-6666-6666-6666-666666666666')).toHaveText('Cancelled')
  })

  test('Confirming cancellation updates booking status to cancelled', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Cancel the pending booking e3333333
    const cancelBtn = page.getByTestId('cancel-button-e3333333-3333-3333-3333-333333333333')
    await expect(cancelBtn).toBeVisible({ timeout: 30000 })
    await cancelBtn.click()

    await expect(page.getByTestId('cancel-dialog')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('cancel-dialog-confirm').click()

    // Dialog should close
    await expect(page.getByTestId('cancel-dialog')).not.toBeVisible({ timeout: 30000 })

    // Booking should no longer be in Upcoming tab
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).not.toBeVisible({ timeout: 30000 })

    // Switch to Cancelled tab - booking should appear there with cancelled status
    await page.getByTestId('tab-cancelled').click()
    await expect(page.getByTestId('trip-card-e3333333-3333-3333-3333-333333333333')).toBeVisible({ timeout: 30000 })
    await expect(page.getByTestId('status-badge-e3333333-3333-3333-3333-333333333333')).toHaveText('Cancelled')
  })

  test('After cancellation, booking moves from Upcoming to Cancelled tab', async ({ page }) => {
    await loginAs(page, 'emma@example.com')
    await page.goto('/trips')
    await expect(page.getByTestId('my-trips-page')).toBeVisible({ timeout: 30000 })

    // Confirm the booking e7777777 is in Upcoming first
    await expect(page.getByTestId('trip-card-e7777777-7777-7777-7777-777777777777')).toBeVisible({ timeout: 30000 })

    // Cancel the confirmed booking e7777777 (Beachfront Villa)
    await page.getByTestId('cancel-button-e7777777-7777-7777-7777-777777777777').click()
    await expect(page.getByTestId('cancel-dialog')).toBeVisible({ timeout: 30000 })
    await page.getByTestId('cancel-dialog-confirm').click()

    // Should be removed from Upcoming tab
    await expect(page.getByTestId('trip-card-e7777777-7777-7777-7777-777777777777')).not.toBeVisible({ timeout: 30000 })

    // Switch to Cancelled tab
    await page.getByTestId('tab-cancelled').click()

    // Booking should appear in Cancelled tab with red cancelled badge
    await expect(page.getByTestId('trip-card-e7777777-7777-7777-7777-777777777777')).toBeVisible({ timeout: 30000 })
    const badge = page.getByTestId('status-badge-e7777777-7777-7777-7777-777777777777')
    await expect(badge).toHaveText('Cancelled')
    await expect(badge).toHaveClass(/text-status-cancelled/)
  })
})
