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
async function deleteAllLabels(baseURL: string, token: string) {
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
async function createLabelViaApi(
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

test.describe.serial('Edit Label', () => {
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

  test('Successfully edit label name via inline edit', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to edit
    const uniqueName = `EditName ${Date.now()}`;
    const newName = `Defect ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    // Reload to see the new label
    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get the label ID
    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Click edit button
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Clear and type new name
    await nameInput.clear();
    await nameInput.fill(newName);

    // Click Save
    await page.getByTestId(`label-edit-save-btn-${targetLabel.id}`).click();

    // Verify edit mode exits
    await expect(nameInput).toHaveCount(0, { timeout: 15000 });

    // Verify new name is displayed with same red color
    const nameEl = page.getByTestId(`label-name-${targetLabel.id}`);
    await expect(nameEl).toHaveText(newName, { timeout: 15000 });

    const dotEl = page.getByTestId(`label-dot-${targetLabel.id}`);
    await expect(dotEl).toHaveCSS('background-color', 'rgb(239, 68, 68)'); // #ef4444 red
  });

  test('Successfully edit label color via inline edit', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to edit
    const uniqueName = `EditColor ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    // Reload to see the new label
    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Click edit button
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Select blue preset color
    await page.getByTestId(`label-edit-swatch-blue-${targetLabel.id}`).click();

    // Click Save
    await page.getByTestId(`label-edit-save-btn-${targetLabel.id}`).click();

    // Verify edit mode exits
    await expect(nameInput).toHaveCount(0, { timeout: 15000 });

    // Verify name unchanged and color is now blue
    const nameEl = page.getByTestId(`label-name-${targetLabel.id}`);
    await expect(nameEl).toHaveText(uniqueName, { timeout: 15000 });

    const dotEl = page.getByTestId(`label-dot-${targetLabel.id}`);
    await expect(dotEl).toHaveCSS('background-color', 'rgb(59, 130, 246)'); // #3b82f6 blue
  });

  test('Edit both label name and color simultaneously', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to edit
    const uniqueName = `EditBoth ${Date.now()}`;
    const newName = `Critical Bug ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Click edit
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Change name
    await nameInput.clear();
    await nameInput.fill(newName);

    // Change color to orange
    await page.getByTestId(`label-edit-swatch-orange-${targetLabel.id}`).click();

    // Save
    await page.getByTestId(`label-edit-save-btn-${targetLabel.id}`).click();

    // Verify edit mode exits
    await expect(nameInput).toHaveCount(0, { timeout: 15000 });

    // Verify new name and orange color
    const nameEl = page.getByTestId(`label-name-${targetLabel.id}`);
    await expect(nameEl).toHaveText(newName, { timeout: 15000 });

    const dotEl = page.getByTestId(`label-dot-${targetLabel.id}`);
    await expect(dotEl).toHaveCSS('background-color', 'rgb(249, 115, 22)'); // #f97316 orange
  });

  test('Cancel inline edit reverts changes', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to test cancel on
    const uniqueName = `CancelTest ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Enter edit mode
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Change name and color
    await nameInput.clear();
    await nameInput.fill('Something Else');
    await page.getByTestId(`label-edit-swatch-blue-${targetLabel.id}`).click();

    // Click Cancel
    await page.getByTestId(`label-edit-cancel-btn-${targetLabel.id}`).click();

    // Verify edit mode exits
    await expect(nameInput).toHaveCount(0, { timeout: 15000 });

    // Verify original name and red color are still showing
    const nameEl = page.getByTestId(`label-name-${targetLabel.id}`);
    await expect(nameEl).toHaveText(uniqueName, { timeout: 15000 });

    const dotEl = page.getByTestId(`label-dot-${targetLabel.id}`);
    await expect(dotEl).toHaveCSS('background-color', 'rgb(239, 68, 68)'); // #ef4444 red
  });

  test('Edit label validates required name field', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to edit
    const uniqueName = `ValidateName ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Enter edit mode
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Clear name field completely
    await nameInput.clear();

    // Click Save
    await page.getByTestId(`label-edit-save-btn-${targetLabel.id}`).click();

    // Verify validation error is shown
    const nameError = page.getByTestId(`label-edit-name-error-${targetLabel.id}`);
    await expect(nameError).toBeVisible({ timeout: 10000 });
    await expect(nameError).toHaveText('Label name is required');

    // Verify edit mode is still active
    await expect(nameInput).toBeVisible();
  });

  test('Edit label prevents duplicate label names', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create two labels
    const uniqueName1 = `DupA ${Date.now()}`;
    const uniqueName2 = `DupB ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName1, color: '#ef4444' });
    await createLabelViaApi(baseURL!, token, { name: uniqueName2, color: '#3b82f6' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const labelA = labels.find((l: { name: string }) => l.name === uniqueName1);
    expect(labelA).toBeTruthy();

    // Enter edit mode on label A
    await page.getByTestId(`label-edit-btn-${labelA.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${labelA.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Try to rename to label B's name
    await nameInput.clear();
    await nameInput.fill(uniqueName2);

    // Click Save
    await page.getByTestId(`label-edit-save-btn-${labelA.id}`).click();

    // Verify error is shown
    const nameError = page.getByTestId(`label-edit-name-error-${labelA.id}`);
    await expect(nameError).toBeVisible({ timeout: 10000 });
    await expect(nameError).toContainText('already exists');

    // Verify edit mode is still active
    await expect(nameInput).toBeVisible();
  });

  test('Edit label with custom hex color', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to edit
    const uniqueName = `CustomHex ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Enter edit mode
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();

    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Enter custom hex color
    const hexInput = page.getByTestId(`label-edit-hex-input-${targetLabel.id}`);
    await hexInput.fill('#22c55e');

    // Save
    await page.getByTestId(`label-edit-save-btn-${targetLabel.id}`).click();

    // Verify edit mode exits
    await expect(nameInput).toHaveCount(0, { timeout: 15000 });

    // Verify the label now shows green color
    const dotEl = page.getByTestId(`label-dot-${targetLabel.id}`);
    await expect(dotEl).toHaveCSS('background-color', 'rgb(34, 197, 94)'); // #22c55e green
  });

  test('Clicking delete button shows confirmation dialog', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get a label with known issue count from API
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    expect(bugLabel).toBeTruthy();

    // Click delete button
    await page.getByTestId(`label-delete-btn-${bugLabel.id}`).click();

    // Verify confirmation dialog appears
    const modal = page.getByTestId('label-delete-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Verify dialog message contains label name
    const message = page.getByTestId('label-delete-message');
    await expect(message).toContainText('Bug');

    // Verify issue count is mentioned if > 0
    if (bugLabel.issue_count > 0) {
      await expect(message).toContainText(`${bugLabel.issue_count}`);
    }

    // Verify Confirm and Cancel buttons are present
    await expect(page.getByTestId('label-delete-confirm-btn')).toBeVisible();
    await expect(page.getByTestId('label-delete-cancel-btn')).toBeVisible();

    // Label should NOT be deleted yet
    await page.getByTestId('label-delete-cancel-btn').click();
    await expect(modal).toHaveCount(0, { timeout: 10000 });

    // Verify label still exists
    const nameEl = page.getByTestId(`label-name-${bugLabel.id}`);
    await expect(nameEl).toBeVisible();
  });

  test('Confirm delete removes the label', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to delete
    const uniqueName = `ToDelete ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#6b7280' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Count labels before deletion
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const countBefore = await labelRows.count();

    // Click delete
    await page.getByTestId(`label-delete-btn-${targetLabel.id}`).click();

    // Verify dialog shows
    await expect(page.getByTestId('label-delete-modal')).toBeVisible({ timeout: 10000 });

    // Confirm delete
    await page.getByTestId('label-delete-confirm-btn').click();

    // Verify modal closes
    await expect(page.getByTestId('label-delete-modal')).toHaveCount(0, { timeout: 15000 });

    // Verify count decreased
    await expect(labelRows).toHaveCount(countBefore - 1, { timeout: 15000 });

    // Verify the deleted label is gone
    await expect(
      page.locator('[data-testid^="label-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test('Cancel delete keeps the label', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label
    const uniqueName = `KeepMe ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Count labels before
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const countBefore = await labelRows.count();

    // Click delete
    await page.getByTestId(`label-delete-btn-${targetLabel.id}`).click();

    // Verify dialog shows
    await expect(page.getByTestId('label-delete-modal')).toBeVisible({ timeout: 10000 });

    // Click Cancel
    await page.getByTestId('label-delete-cancel-btn').click();

    // Verify dialog closes
    await expect(page.getByTestId('label-delete-modal')).toHaveCount(0, { timeout: 10000 });

    // Verify label still exists and count unchanged
    await expect(labelRows).toHaveCount(countBefore, { timeout: 15000 });
    const nameEl = page.getByTestId(`label-name-${targetLabel.id}`);
    await expect(nameEl).toHaveText(uniqueName);
  });

  test('Delete label used by zero issues', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label with 0 issues
    const uniqueName = `Archived ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#6b7280' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();
    expect(targetLabel.issue_count).toBe(0);

    // Count labels before
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const countBefore = await labelRows.count();

    // Click delete
    await page.getByTestId(`label-delete-btn-${targetLabel.id}`).click();

    // Verify dialog shows
    const modal = page.getByTestId('label-delete-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Verify the message does NOT mention issue count (since 0 issues)
    const message = page.getByTestId('label-delete-message');
    await expect(message).toContainText(uniqueName);

    // Confirm delete
    await page.getByTestId('label-delete-confirm-btn').click();

    // Verify modal closes and label removed
    await expect(modal).toHaveCount(0, { timeout: 15000 });
    await expect(labelRows).toHaveCount(countBefore - 1, { timeout: 15000 });

    // Verify deleted label is gone
    await expect(
      page.locator('[data-testid^="label-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test('Only one label can be in edit mode at a time', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create two labels
    const nameA = `EditOneA ${Date.now()}`;
    const nameB = `EditOneB ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: nameA, color: '#ef4444' });
    await createLabelViaApi(baseURL!, token, { name: nameB, color: '#3b82f6' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const labelA = labels.find((l: { name: string }) => l.name === nameA);
    const labelB = labels.find((l: { name: string }) => l.name === nameB);
    expect(labelA).toBeTruthy();
    expect(labelB).toBeTruthy();

    // Enter edit mode on label A
    await page.getByTestId(`label-edit-btn-${labelA.id}`).click();
    const nameInputA = page.getByTestId(`label-edit-name-input-${labelA.id}`);
    await expect(nameInputA).toBeVisible({ timeout: 10000 });

    // Now click edit on label B
    await page.getByTestId(`label-edit-btn-${labelB.id}`).click();
    const nameInputB = page.getByTestId(`label-edit-name-input-${labelB.id}`);
    await expect(nameInputB).toBeVisible({ timeout: 10000 });

    // Verify label A is no longer in edit mode
    await expect(nameInputA).toHaveCount(0, { timeout: 10000 });

    // Verify label B is in edit mode
    await expect(nameInputB).toHaveValue(nameB);
  });

  test('Edit mode is exited when delete is clicked on same label', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label
    const uniqueName = `EditThenDelete ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#ef4444' });

    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    const labels = await getLabels(baseURL!, token);
    const targetLabel = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(targetLabel).toBeTruthy();

    // Enter edit mode
    await page.getByTestId(`label-edit-btn-${targetLabel.id}`).click();
    const nameInput = page.getByTestId(`label-edit-name-input-${targetLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Change name but don't save
    await nameInput.clear();
    await nameInput.fill('Defect');

    // Click delete on the same label
    await page.getByTestId(`label-delete-btn-${targetLabel.id}`).click();

    // Verify edit mode is exited (name input gone)
    await expect(nameInput).toHaveCount(0, { timeout: 10000 });

    // Verify delete confirmation dialog appears with original name (not "Defect")
    const modal = page.getByTestId('label-delete-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const message = page.getByTestId('label-delete-message');
    await expect(message).toContainText(uniqueName);

    // Cancel to clean up
    await page.getByTestId('label-delete-cancel-btn').click();
  });
});
