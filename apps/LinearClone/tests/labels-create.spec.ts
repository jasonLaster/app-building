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

// Helper to delete all labels via API
async function _deleteAllLabels(baseURL: string, token: string) {
  const labels = await getLabels(baseURL, token);
  for (const label of labels) {
    await fetch(`${baseURL}/api/labels`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: label.id }),
    });
  }
}

// Helper to create a label via API
async function _createLabelViaApi(
  baseURL: string,
  token: string,
  data: { name: string; color: string }
) {
  const response = await fetch(`${baseURL}/api/labels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
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

test.describe.serial('Create Label', () => {
  test('Create Label button opens the create label form', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    // Click Create Label button
    await page.getByTestId('create-label-btn').click();

    // Verify the form is visible
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    // Verify form has name input
    await expect(page.getByTestId('create-label-name-input')).toBeVisible();

    // Verify color picker section with presets and hex input
    await expect(page.getByTestId('create-label-color-picker')).toBeVisible();
    await expect(page.getByTestId('create-label-hex-input')).toBeVisible();

    // Verify Create and Cancel buttons
    await expect(page.getByTestId('create-label-submit-btn')).toBeVisible();
    await expect(page.getByTestId('create-label-cancel-btn')).toBeVisible();
  });

  test('Successfully create a new label with preset color', async ({ page, baseURL }) => {
    const { token: _token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Count initial labels
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const initialCount = await labelRows.count();

    const uniqueName = `Bug ${Date.now()}`;

    // Open form and create label
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-label-name-input').fill(uniqueName);
    await page.getByTestId('create-label-swatch-red').click();
    await page.getByTestId('create-label-submit-btn').click();

    // Verify form closes
    await expect(page.getByTestId('create-label-form')).toHaveCount(0, { timeout: 15000 });

    // Verify label count increased
    await expect(labelRows).toHaveCount(initialCount + 1, { timeout: 15000 });

    // Verify new label appears with correct name
    const newLabel = page.locator('[data-testid^="label-name-"]').filter({ hasText: uniqueName });
    await expect(newLabel).toBeVisible({ timeout: 15000 });
  });

  test('Successfully create a new label with custom hex color', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const uniqueName = `Custom Category ${Date.now()}`;

    // Open form and create label with custom hex
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-label-name-input').fill(uniqueName);
    await page.getByTestId('create-label-hex-input').fill('#ff6b2e');
    await page.getByTestId('create-label-submit-btn').click();

    // Verify form closes
    await expect(page.getByTestId('create-label-form')).toHaveCount(0, { timeout: 15000 });

    // Verify the new label appears
    const newLabel = page.locator('[data-testid^="label-name-"]').filter({ hasText: uniqueName });
    await expect(newLabel).toBeVisible({ timeout: 15000 });

    // Get the label's ID and verify its dot color
    const labels = await getLabels(baseURL!, token);
    const created = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(created).toBeTruthy();

    const dot = page.getByTestId(`label-dot-${created.id}`);
    await expect(dot).toHaveCSS('background-color', 'rgb(255, 107, 46)'); // #ff6b2e
  });

  test('Create label form validates required name field', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    // Open form
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    // Click Create without entering a name
    await page.getByTestId('create-label-submit-btn').click();

    // Verify error message
    await expect(page.getByTestId('create-label-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-label-name-error')).toContainText('Label name is required');

    // Verify the form stays open
    await expect(page.getByTestId('create-label-form')).toBeVisible();
  });

  test('Create label form prevents duplicate label names', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    // Open form and try to create a label with a name that already exists (from seed)
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-label-name-input').fill('Bug');
    await page.getByTestId('create-label-swatch-blue').click();
    await page.getByTestId('create-label-submit-btn').click();

    // Verify error message
    await expect(page.getByTestId('create-label-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-label-name-error')).toContainText('A label with this name already exists');

    // Verify the form stays open
    await expect(page.getByTestId('create-label-form')).toBeVisible();
  });

  test('Cancel button closes create label form without creating', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Count initial labels
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const initialCount = await labelRows.count();

    // Open form and type a name
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('create-label-name-input').fill('Draft Label');

    // Click Cancel
    await page.getByTestId('create-label-cancel-btn').click();

    // Verify form closes
    await expect(page.getByTestId('create-label-form')).toHaveCount(0, { timeout: 10000 });

    // Verify no new label was created
    await expect(labelRows).toHaveCount(initialCount, { timeout: 10000 });

    // Reopen form and verify it's reset
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-label-name-input')).toHaveValue('');
  });

  test('Color picker shows preset color options', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    // Open form
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    // Verify all preset color swatches are visible
    const presetColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];
    for (const color of presetColors) {
      await expect(page.getByTestId(`create-label-swatch-${color}`)).toBeVisible();
    }

    // Verify hex input is also available
    await expect(page.getByTestId('create-label-hex-input')).toBeVisible();
  });

  test('Selecting a preset color updates the color preview', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    // Open form
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    // Click the blue preset swatch
    await page.getByTestId('create-label-swatch-blue').click();

    // Verify the swatch is selected (has selected class)
    await expect(page.getByTestId('create-label-swatch-blue')).toHaveClass(/create-label-swatch-selected/);

    // Verify the color preview dot updates to blue
    const preview = page.getByTestId('create-label-color-preview');
    await expect(preview).toHaveCSS('background-color', 'rgb(59, 130, 246)'); // #3b82f6
  });

  test('Custom hex input validates hex color format', async ({ page, baseURL }) => {
    await loginAndNavigateToLabels(page, baseURL!);

    // Open form
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    // Fill in valid name and invalid hex
    const uniqueName = `ColorTest ${Date.now()}`;
    await page.getByTestId('create-label-name-input').fill(uniqueName);
    await page.getByTestId('create-label-hex-input').fill('notacolor');
    await page.getByTestId('create-label-submit-btn').click();

    // Verify color error is shown
    await expect(page.getByTestId('create-label-color-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-label-color-error')).toContainText('Invalid color format');

    // Verify the form stays open
    await expect(page.getByTestId('create-label-form')).toBeVisible();
  });

  test('Create label form can be used multiple times in sequence', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Count initial labels
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const initialCount = await labelRows.count();

    const uniqueSuffix = Date.now();
    const firstName = `Bug ${uniqueSuffix}`;
    const secondName = `Feature ${uniqueSuffix}`;

    // Create first label
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('create-label-name-input').fill(firstName);
    await page.getByTestId('create-label-swatch-red').click();
    await page.getByTestId('create-label-submit-btn').click();

    // Wait for form to close
    await expect(page.getByTestId('create-label-form')).toHaveCount(0, { timeout: 15000 });
    await expect(labelRows).toHaveCount(initialCount + 1, { timeout: 15000 });

    // Open form again and create second label
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    // Verify the form is reset
    await expect(page.getByTestId('create-label-name-input')).toHaveValue('');

    await page.getByTestId('create-label-name-input').fill(secondName);
    await page.getByTestId('create-label-swatch-blue').click();
    await page.getByTestId('create-label-submit-btn').click();

    // Wait for form to close
    await expect(page.getByTestId('create-label-form')).toHaveCount(0, { timeout: 15000 });

    // Verify both labels exist
    await expect(labelRows).toHaveCount(initialCount + 2, { timeout: 15000 });

    await expect(
      page.locator('[data-testid^="label-name-"]').filter({ hasText: firstName })
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('[data-testid^="label-name-"]').filter({ hasText: secondName })
    ).toBeVisible({ timeout: 15000 });
  });
});
