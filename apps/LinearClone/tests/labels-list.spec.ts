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

// Helper to get teams and issues via API
async function getTeamIssues(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/team-issues?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.issues;
}

async function getTeams(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.teams;
}

// Helper to update issue labels via API
async function updateIssueLabels(
  baseURL: string,
  token: string,
  issueId: string,
  labelIds: string[]
) {
  await fetch(`${baseURL}/api/update-issue`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ issueId, field: 'labels', labelIds }),
  });
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

test.describe.serial('Labels List', () => {
  test('Labels page renders with list of all labels', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    // Verify page title
    await expect(page.getByTestId('labels-title')).toBeVisible();
    await expect(page.getByTestId('labels-title')).toHaveText('Labels');

    // Verify the label list is visible
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get labels from API to verify count
    const labels = await getLabels(baseURL!, token);

    // Verify all label rows are rendered
    const labelRows = page.locator('[data-testid^="label-row-"]');
    await expect(labelRows).toHaveCount(labels.length, { timeout: 15000 });

    // Verify Create Label button is visible
    await expect(page.getByTestId('create-label-btn')).toBeVisible();
  });

  test('Label row displays colored dot matching label color', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get labels from API
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    expect(bugLabel).toBeTruthy();

    // Verify the Bug label row has a colored dot with the correct color
    const dot = page.getByTestId(`label-dot-${bugLabel.id}`);
    await expect(dot).toBeVisible();
    await expect(dot).toHaveCSS('background-color', 'rgb(239, 68, 68)'); // #ef4444
  });

  test('Label row displays issue count for each label', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get labels from API to verify issue counts
    const labels = await getLabels(baseURL!, token);

    for (const label of labels) {
      const countEl = page.getByTestId(`label-count-${label.id}`);
      await expect(countEl).toBeVisible();
      await expect(countEl).toHaveText(String(label.issue_count));
    }
  });

  test('Labels page shows empty state when no labels exist', async ({ page, baseURL }) => {
    // Login and delete all labels
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await deleteAllLabels(baseURL!, data.token);

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto('/settings/labels');
    await expect(page.getByTestId('labels-page')).toBeVisible({ timeout: 30000 });

    // Verify empty state is displayed
    await expect(page.getByTestId('label-list-empty')).toBeVisible({ timeout: 15000 });

    // Verify label list is not shown
    await expect(page.getByTestId('label-list')).toHaveCount(0);

    // Verify Create Label button is still visible
    await expect(page.getByTestId('create-label-btn')).toBeVisible();
  });

  test('Each label row has edit and delete action buttons', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get labels from API
    const labels = await getLabels(baseURL!, token);

    // Verify each label row has edit and delete buttons
    for (const label of labels) {
      const editBtn = page.getByTestId(`label-edit-btn-${label.id}`);
      const deleteBtn = page.getByTestId(`label-delete-btn-${label.id}`);
      await expect(editBtn).toBeVisible();
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('Labels list updates after creating a new label', async ({ page, baseURL }) => {
    const { token: _token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Count initial labels
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const initialCount = await labelRows.count();

    // Create a new label via the form
    const uniqueName = `Enhancement ${Date.now()}`;
    await page.getByTestId('create-label-btn').click();
    await expect(page.getByTestId('create-label-form')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-label-name-input').fill(uniqueName);
    await page.getByTestId('create-label-swatch-purple').click();
    await page.getByTestId('create-label-submit-btn').click();

    // Verify the form closes
    await expect(page.getByTestId('create-label-form')).toHaveCount(0, { timeout: 15000 });

    // Verify count increased by 1
    await expect(labelRows).toHaveCount(initialCount + 1, { timeout: 15000 });

    // Verify the new label appears with correct name and 0 issue count
    const newLabelRow = page.locator('[data-testid^="label-name-"]').filter({ hasText: uniqueName });
    await expect(newLabelRow).toBeVisible({ timeout: 15000 });
  });

  test('Labels list updates after deleting a label', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to delete so we don't affect seed data
    const uniqueName = `ToDelete ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: uniqueName, color: '#6b7280' });

    // Reload to see the new label
    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Count labels before deletion
    const labelRows = page.locator('[data-testid^="label-row-"]');
    const countBefore = await labelRows.count();

    // Find and get the label's ID from the API
    const labels = await getLabels(baseURL!, token);
    const toDelete = labels.find((l: { name: string }) => l.name === uniqueName);
    expect(toDelete).toBeTruthy();

    // Click delete button on the label
    await page.getByTestId(`label-delete-btn-${toDelete.id}`).click();

    // Verify confirmation dialog appears
    await expect(page.getByTestId('label-delete-modal')).toBeVisible({ timeout: 10000 });

    // Click confirm delete
    await page.getByTestId('label-delete-confirm-btn').click();

    // Verify modal closes and label is removed
    await expect(page.getByTestId('label-delete-modal')).toHaveCount(0, { timeout: 15000 });
    await expect(labelRows).toHaveCount(countBefore - 1, { timeout: 15000 });

    // Verify the deleted label is no longer visible
    await expect(
      page.locator('[data-testid^="label-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(0, { timeout: 15000 });
  });

  test('Labels list updates after editing a label', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Create a label to edit
    const originalName = `EditMe ${Date.now()}`;
    const newName = `Edited ${Date.now()}`;
    await createLabelViaApi(baseURL!, token, { name: originalName, color: '#ef4444' });

    // Reload to see the new label
    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get the label ID
    const labels = await getLabels(baseURL!, token);
    const editLabel = labels.find((l: { name: string }) => l.name === originalName);
    expect(editLabel).toBeTruthy();

    // Click edit button
    await page.getByTestId(`label-edit-btn-${editLabel.id}`).click();

    // Verify inline edit mode
    const nameInput = page.getByTestId(`label-edit-name-input-${editLabel.id}`);
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Change name and color
    await nameInput.clear();
    await nameInput.fill(newName);
    await page.getByTestId(`label-edit-swatch-orange-${editLabel.id}`).click();

    // Save
    await page.getByTestId(`label-edit-save-btn-${editLabel.id}`).click();

    // Verify edit mode exits and new name/color shows
    await expect(nameInput).toHaveCount(0, { timeout: 15000 });

    const updatedNameEl = page.getByTestId(`label-name-${editLabel.id}`);
    await expect(updatedNameEl).toHaveText(newName, { timeout: 15000 });

    const updatedDot = page.getByTestId(`label-dot-${editLabel.id}`);
    await expect(updatedDot).toHaveCSS('background-color', 'rgb(249, 115, 22)'); // #f97316 orange
  });

  test('Label issue count reflects actual usage across issues', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndNavigateToLabels(page, baseURL!);

    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Get labels from API
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    expect(bugLabel).toBeTruthy();

    const initialCount = bugLabel.issue_count;

    // Find an issue that doesn't have the Bug label and add it
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    expect(engTeam).toBeTruthy();

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    // Find an issue that doesn't have the Bug label
    const issueWithoutBug = issues.find(
      (i: { labels: { id: string }[] }) =>
        !i.labels?.some((l: { id: string }) => l.id === bugLabel.id)
    );
    expect(issueWithoutBug).toBeTruthy();

    // Add the Bug label to this issue via API
    const existingLabelIds = (issueWithoutBug.labels || []).map((l: { id: string }) => l.id);
    await updateIssueLabels(baseURL!, token, issueWithoutBug.id, [
      ...existingLabelIds,
      bugLabel.id,
    ]);

    // Navigate back to labels page
    await page.goto('/settings/labels');
    await expect(page.getByTestId('label-list')).toBeVisible({ timeout: 30000 });

    // Verify the Bug label count increased by 1
    const countEl = page.getByTestId(`label-count-${bugLabel.id}`);
    await expect(countEl).toHaveText(String(initialCount + 1), { timeout: 15000 });
  });
});
