import { test, expect } from '@playwright/test';

// Helper to login via API and get token
async function loginViaApi(baseURL: string, email: string, password: string) {
  const response = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Helper to get labels via API
async function getLabels(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/labels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.labels;
}

// Helper to login and navigate to labels page
async function loginAndNavigateToLabels(
  page: import('@playwright/test').Page,
  baseURL: string,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/settings/labels');
  await expect(page.getByTestId('labels-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user };
}

test.describe('Edit Label', () => {
  test('Clicking edit button on a label enters inline edit mode', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get labels from API to find Bug label
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    expect(bugLabel).toBeTruthy();

    // Click the edit button on the Bug label
    await page.getByTestId(`label-edit-btn-${bugLabel.id}`).click();

    // Verify the name field becomes an editable input pre-filled with "Bug"
    const nameInput = page.getByTestId(`label-edit-name-input-${bugLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await expect(nameInput).toHaveValue('Bug');

    // Verify the color picker appears with current red color selected
    const redSwatch = page.getByTestId(`label-edit-swatch-red-${bugLabel.id}`);
    await expect(redSwatch).toBeVisible();
    await expect(redSwatch).toHaveClass(/label-edit-swatch-selected/);

    // Verify Save and Cancel buttons appear
    await expect(page.getByTestId(`label-edit-save-btn-${bugLabel.id}`)).toBeVisible();
    await expect(page.getByTestId(`label-edit-cancel-btn-${bugLabel.id}`)).toBeVisible();
  });
});
