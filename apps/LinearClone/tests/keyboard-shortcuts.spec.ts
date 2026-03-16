import { test, expect } from '@playwright/test';

// Helper to login as Alice and return token
async function loginAsAlice(baseURL: string): Promise<string> {
  const response = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@acme.com', password: 'password123' }),
  });
  const data = await response.json();
  return data.token;
}

// Helper to authenticate page as Alice
async function authenticatePage(page: unknown, baseURL: string): Promise<string> {
  const token = await loginAsAlice(baseURL);
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  return token;
}

test.describe('Keyboard Shortcuts', () => {
  test('Pressing C opens create issue modal', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 15000 });

    // Ensure no modal is open
    await expect(page.getByTestId('create-issue-modal')).not.toBeVisible();

    // Press C key
    await page.keyboard.press('c');

    // Modal should open with title input focused
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-issue-title-input')).toBeFocused({ timeout: 5000 });
  });

  test('Pressing C does not open modal when typing in input', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings');
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 15000 });

    // Focus the workspace name input
    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.focus();

    // Get current value and press C
    const valueBefore = await nameInput.inputValue();
    await page.keyboard.press('c');

    // The character 'c' should be typed into the input
    await expect(nameInput).toHaveValue(valueBefore + 'c', { timeout: 5000 });

    // The create issue modal should NOT open
    await expect(page.getByTestId('create-issue-modal')).not.toBeVisible();
  });

  test('G then I navigates to My Issues', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('inbox-page')).toBeVisible({ timeout: 15000 });

    // Press G then I
    await page.keyboard.press('g');
    await page.keyboard.press('i');

    // Should navigate to /my-issues
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 10000 });
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 10000 });
  });

  test('G then N navigates to Inbox', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 15000 });

    // Press G then N
    await page.keyboard.press('g');
    await page.keyboard.press('n');

    // Should navigate to /inbox
    await expect(page).toHaveURL(/\/inbox/, { timeout: 10000 });
    await expect(page.getByTestId('inbox-page')).toBeVisible({ timeout: 10000 });
  });

  test('G then I does not navigate when typing in input', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings');
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 15000 });

    // Focus the workspace name input
    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.focus();

    // Get current value, press G then I
    const valueBefore = await nameInput.inputValue();
    await page.keyboard.press('g');
    await page.keyboard.press('i');

    // Characters 'gi' should be typed into the input
    await expect(nameInput).toHaveValue(valueBefore + 'gi', { timeout: 5000 });

    // Should still be on /settings - no navigation
    await expect(page).toHaveURL(/\/settings/, { timeout: 5000 });
  });

  test('G chord times out if second key is delayed', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 15000 });

    // Press G key
    await page.keyboard.press('g');

    // Wait 2 seconds (chord timeout is 1 second)
    await page.waitForTimeout(2000);

    // Press I key after timeout
    await page.keyboard.press('i');

    // Should still be on /my-issues - no navigation occurred
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 5000 });
    await expect(page.getByTestId('my-issues-page')).toBeVisible();
  });

  test('G followed by unrecognized key does nothing', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 15000 });

    // Press G then X (unrecognized chord)
    await page.keyboard.press('g');
    await page.keyboard.press('x');

    // Should still be on /my-issues
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 5000 });

    // No modal should open
    await expect(page.getByTestId('create-issue-modal')).not.toBeVisible();

    // Page should still be functional
    await expect(page.getByTestId('my-issues-page')).toBeVisible();
  });

  test('Keyboard shortcuts work from different pages', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings');
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 15000 });

    // Click on the page body to ensure focus is not in an input
    await page.locator('body').click();

    // Press C key
    await page.keyboard.press('c');

    // Modal should open same as from any other page
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 10000 });
  });

  test('Keyboard shortcuts do not fire when modal is open', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 15000 });

    // Open the create issue modal first
    await page.keyboard.press('c');
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 10000 });

    // Now press Escape to unfocus the title input, then click on the modal overlay area
    // but we need to make sure focus is not on an input for the G chord to even be attempted
    // Actually, the KeyboardShortcuts component checks createIssueModalOpen and returns early
    // So even pressing G then I on the modal body should not navigate

    // Click on the modal (not on an input) to ensure we're not in an input field
    await page.getByTestId('create-issue-modal').locator('.cim-header').click();

    // Press G then I
    await page.keyboard.press('g');
    await page.keyboard.press('i');

    // Should still be on /my-issues - no navigation
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 5000 });

    // Modal should still be open
    await expect(page.getByTestId('create-issue-modal')).toBeVisible();
  });
});
