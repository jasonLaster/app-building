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

test.describe('Sidebar Navigation', () => {
  test('Sidebar Settings link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-settings').click();
    await expect(page).toHaveURL(/\/settings$/, { timeout: 30000 });

    // Verify active state
    await expect(page.getByTestId('sidebar-link-settings')).toHaveClass(/sidebar-link-active/, { timeout: 10000 });
  });

  test('Sidebar highlights current page link', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // My Issues should be active
    await expect(page.getByTestId('sidebar-link-my-issues')).toHaveClass(/sidebar-link-active/, { timeout: 10000 });

    // Other links should NOT be active
    await expect(page.getByTestId('sidebar-link-inbox')).not.toHaveClass(/sidebar-link-active/);
    await expect(page.getByTestId('sidebar-link-settings')).not.toHaveClass(/sidebar-link-active/);
  });

  test('Sidebar active highlight updates on navigation', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // My Issues is highlighted initially
    await expect(page.getByTestId('sidebar-link-my-issues')).toHaveClass(/sidebar-link-active/, { timeout: 10000 });

    // Click Inbox
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });

    // Inbox should now be active, My Issues should not
    await expect(page.getByTestId('sidebar-link-inbox')).toHaveClass(/sidebar-link-active/, { timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-my-issues')).not.toHaveClass(/sidebar-link-active/);
  });

  test('Sidebar is present on all authenticated pages', async ({ page, baseURL }) => {
    test.slow();
    await authenticatePage(page, baseURL!);

    // Navigate to /my-issues
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sidebar-link-my-issues')).toBeVisible();

    // Click Inbox in sidebar to navigate
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sidebar-link-inbox')).toBeVisible();

    // Click Settings in sidebar to navigate
    await page.getByTestId('sidebar-link-settings').click();
    await expect(page).toHaveURL(/\/settings/, { timeout: 30000 });
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sidebar-link-settings')).toBeVisible();
  });

  test('Sidebar is not shown on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('sidebar')).not.toBeVisible({ timeout: 10000 });
  });

  test('Sidebar is not shown on signup page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('sidebar')).not.toBeVisible({ timeout: 10000 });
  });
});
