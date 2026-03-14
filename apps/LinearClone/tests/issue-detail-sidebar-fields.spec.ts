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

// Helper to get teams via API
async function getTeams(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.teams;
}

// Helper to get team issues via API
async function getTeamIssues(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/team-issues?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.issues;
}

// Helper to get labels via API
async function getLabels(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/labels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.labels;
}

// Helper to get projects via API
async function getProjects(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.projects;
}

// Helper to login and navigate to an issue detail page
async function loginAndNavigateToIssue(
  page: import('@playwright/test').Page,
  baseURL: string,
  issueNumber: number,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
  const issues = await getTeamIssues(baseURL, data.token, engTeam.id);
  const issue = issues.find((i: { number: number }) => i.number === issueNumber);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/issue/${issue.id}`);
  await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('issue-sidebar')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, engTeam, issue };
}

test.describe('Issue Detail Sidebar - Labels', () => {
  test('Add labels via multi-select picker', async ({ page, baseURL }) => {
    // ENG-7: has Improvement label, no other labels
    await loginAndNavigateToIssue(page, baseURL!, 7);

    // Click the Labels button
    await page.getByTestId('sidebar-labels-btn').click();

    // Verify multi-select dropdown appears with all available labels
    await expect(page.getByTestId('sidebar-labels-dropdown')).toBeVisible();
    await expect(page.getByTestId('sidebar-labels-dropdown')).toContainText('Bug');
    await expect(page.getByTestId('sidebar-labels-dropdown')).toContainText('Feature');
    await expect(page.getByTestId('sidebar-labels-dropdown')).toContainText('Improvement');
    await expect(page.getByTestId('sidebar-labels-dropdown')).toContainText('Documentation');
  });

  test('Select multiple labels', async ({ page, baseURL }) => {
    // ENG-5: has Documentation label
    const { token } = await loginAndNavigateToIssue(page, baseURL!, 5);

    // Get label IDs for assertions
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    const featureLabel = labels.find((l: { name: string }) => l.name === 'Feature');

    // Open labels dropdown
    await page.getByTestId('sidebar-labels-btn').click();
    await expect(page.getByTestId('sidebar-labels-dropdown')).toBeVisible();

    // Click "Bug" label
    await page.getByTestId(`sidebar-label-option-${bugLabel.id}`).click();

    // Click "Feature" label
    await page.getByTestId(`sidebar-label-option-${featureLabel.id}`).click();

    // Verify both new labels appear as badges in the sidebar (along with existing Documentation)
    await expect(page.getByTestId(`sidebar-label-badge-${bugLabel.id}`)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`sidebar-label-badge-${featureLabel.id}`)).toBeVisible({ timeout: 30000 });
  });

  test('Remove a label', async ({ page, baseURL }) => {
    // ENG-1: has Bug label
    const { token } = await loginAndNavigateToIssue(page, baseURL!, 1);

    // Get label IDs
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');

    // Verify Bug label badge is displayed
    await expect(page.getByTestId(`sidebar-label-badge-${bugLabel.id}`)).toBeVisible();

    // Open labels dropdown
    await page.getByTestId('sidebar-labels-btn').click();
    await expect(page.getByTestId('sidebar-labels-dropdown')).toBeVisible();

    // Uncheck "Bug" label
    await page.getByTestId(`sidebar-label-option-${bugLabel.id}`).click();

    // Verify Bug badge is removed
    await expect(page.getByTestId(`sidebar-label-badge-${bugLabel.id}`)).toHaveCount(0, { timeout: 30000 });
  });
});

test.describe('Issue Detail Sidebar - Project', () => {
  test('Change project via searchable selector', async ({ page, baseURL }) => {
    // ENG-5: no project assigned
    await loginAndNavigateToIssue(page, baseURL!, 5);

    // Verify no project
    await expect(page.getByTestId('sidebar-project-btn')).toContainText('No project');

    // Click the Project field
    await page.getByTestId('sidebar-project-btn').click();

    // Verify searchable dropdown appears
    await expect(page.getByTestId('sidebar-project-dropdown')).toBeVisible();
    await expect(page.getByTestId('sidebar-project-search')).toBeVisible();
    await expect(page.getByTestId('sidebar-project-option-none')).toBeVisible();

    // Verify projects are listed
    await expect(page.getByTestId('sidebar-project-dropdown')).toContainText('V2 Launch');
  });

  test('Search and select project', async ({ page, baseURL }) => {
    // ENG-7: no project assigned, to avoid conflicts
    await loginAndNavigateToIssue(page, baseURL!, 7);

    // Verify no project
    await expect(page.getByTestId('sidebar-project-btn')).toContainText('No project');

    // Open project dropdown
    await page.getByTestId('sidebar-project-btn').click();
    await expect(page.getByTestId('sidebar-project-dropdown')).toBeVisible();

    // Type search query
    await page.getByTestId('sidebar-project-search').fill('V2');

    // Verify filtered results show V2 Launch
    await expect(page.getByTestId('sidebar-project-dropdown')).toContainText('V2 Launch');

    // Click on V2 Launch option
    const projectOption = page.getByTestId('sidebar-project-dropdown').locator('button').filter({ hasText: 'V2 Launch' });
    await projectOption.click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-project-dropdown')).toHaveCount(0);

    // Verify project updated
    await expect(page.getByTestId('sidebar-project-btn')).toContainText('V2 Launch', { timeout: 30000 });
  });

  test('Remove project assignment', async ({ page, baseURL }) => {
    // ENG-2: has project V2 Launch
    await loginAndNavigateToIssue(page, baseURL!, 2);

    // Verify current project
    await expect(page.getByTestId('sidebar-project-btn')).toContainText('V2 Launch');

    // Open project dropdown
    await page.getByTestId('sidebar-project-btn').click();
    await expect(page.getByTestId('sidebar-project-dropdown')).toBeVisible();

    // Click "No project" option
    await page.getByTestId('sidebar-project-option-none').click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-project-dropdown')).toHaveCount(0);

    // Verify project removed
    await expect(page.getByTestId('sidebar-project-btn')).toContainText('No project', { timeout: 30000 });
  });
});

test.describe('Issue Detail Sidebar - Cycle', () => {
  test('Change cycle via dropdown', async ({ page, baseURL }) => {
    // ENG-3: no cycle
    await loginAndNavigateToIssue(page, baseURL!, 3);

    // Verify no cycle
    await expect(page.getByTestId('sidebar-cycle-btn')).toContainText('No cycle');

    // Click the Cycle field
    await page.getByTestId('sidebar-cycle-btn').click();

    // Verify dropdown appears with cycles
    await expect(page.getByTestId('sidebar-cycle-dropdown')).toBeVisible();
    await expect(page.getByTestId('sidebar-cycle-option-none')).toBeVisible();
    await expect(page.getByTestId('sidebar-cycle-dropdown')).toContainText('Sprint 12');
  });

  test('Select cycle', async ({ page, baseURL }) => {
    // ENG-5: no cycle, to avoid conflicts
    await loginAndNavigateToIssue(page, baseURL!, 5);

    // Verify no cycle
    await expect(page.getByTestId('sidebar-cycle-btn')).toContainText('No cycle');

    // Open cycle dropdown
    await page.getByTestId('sidebar-cycle-btn').click();
    await expect(page.getByTestId('sidebar-cycle-dropdown')).toBeVisible();

    // Click Sprint 12 option
    const cycleOption = page.getByTestId('sidebar-cycle-dropdown').locator('button').filter({ hasText: 'Sprint 12' });
    await cycleOption.click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-cycle-dropdown')).toHaveCount(0);

    // Verify cycle updated
    await expect(page.getByTestId('sidebar-cycle-btn')).toContainText('Sprint 12', { timeout: 30000 });
  });
});

test.describe('Issue Detail Sidebar - Due Date and Timestamps', () => {
  test('Change due date via date picker', async ({ page, baseURL }) => {
    // ENG-3: no due date
    await loginAndNavigateToIssue(page, baseURL!, 3);

    // Verify the due date input is available
    const dueDateInput = page.getByTestId('sidebar-due-date-input');
    await expect(dueDateInput).toBeVisible();

    // Verify no due date display is shown (no clear button visible)
    await expect(page.getByTestId('sidebar-due-date-clear')).toHaveCount(0);
  });

  test('Select due date', async ({ page, baseURL }) => {
    // ENG-7: no due date, to avoid conflicts
    await loginAndNavigateToIssue(page, baseURL!, 7);

    // Set due date via the date input
    const dueDateInput = page.getByTestId('sidebar-due-date-input');
    await dueDateInput.fill('2026-04-15');

    // Verify the due date display shows the formatted date
    await expect(page.getByTestId('sidebar-due-date-display')).toContainText('Apr 15, 2026', { timeout: 30000 });

    // Verify the clear button appears
    await expect(page.getByTestId('sidebar-due-date-clear')).toBeVisible();
  });

  test('Clear due date', async ({ page, baseURL }) => {
    // ENG-8: has project and cycle, let's use it; first set a due date then clear it
    // Use ENG-5 which has no due date - set one first then clear
    await loginAndNavigateToIssue(page, baseURL!, 5);

    // First set a due date
    const dueDateInput = page.getByTestId('sidebar-due-date-input');
    await dueDateInput.fill('2026-04-15');

    // Verify due date is shown
    await expect(page.getByTestId('sidebar-due-date-display')).toContainText('Apr 15, 2026', { timeout: 30000 });
    await expect(page.getByTestId('sidebar-due-date-clear')).toBeVisible();

    // Click clear button
    await page.getByTestId('sidebar-due-date-clear').click();

    // Verify due date is cleared
    await expect(page.getByTestId('sidebar-due-date-display')).toHaveCount(0, { timeout: 30000 });
    await expect(page.getByTestId('sidebar-due-date-clear')).toHaveCount(0);
  });

  test('Created and Updated timestamps are read-only', async ({ page, baseURL }) => {
    // ENG-1: has timestamps
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify Created field is visible with a value
    const createdValue = page.getByTestId('sidebar-created-value');
    await expect(createdValue).toBeVisible();
    // The value should be a date string (not empty)
    await expect(createdValue).not.toHaveText('');

    // Verify Updated field is visible with a value
    const updatedValue = page.getByTestId('sidebar-updated-value');
    await expect(updatedValue).toBeVisible();
    await expect(updatedValue).not.toHaveText('');

    // Verify the fields have the read-only class (sidebar-field-readonly)
    const createdField = page.getByTestId('sidebar-created-field');
    await expect(createdField).toHaveClass(/sidebar-field-readonly/);

    const updatedField = page.getByTestId('sidebar-updated-field');
    await expect(updatedField).toHaveClass(/sidebar-field-readonly/);

    // Verify there are no buttons or inputs within the created/updated fields
    // (they should only contain a label and a span)
    await expect(createdField.locator('button')).toHaveCount(0);
    await expect(createdField.locator('input')).toHaveCount(0);
    await expect(updatedField.locator('button')).toHaveCount(0);
    await expect(updatedField.locator('input')).toHaveCount(0);
  });
});

test.describe('Issue Detail Sidebar - Dropdown Behavior', () => {
  test('Sidebar dropdowns close on outside click', async ({ page, baseURL }) => {
    // ENG-4: in_review, high priority
    await loginAndNavigateToIssue(page, baseURL!, 4);

    // Verify current priority
    await expect(page.getByTestId('sidebar-priority-btn')).toContainText('High');

    // Open the priority dropdown
    await page.getByTestId('sidebar-priority-btn').click();
    await expect(page.getByTestId('sidebar-priority-dropdown')).toBeVisible();

    // Click outside the dropdown (on the description area)
    await page.getByTestId('issue-description').click();

    // Verify the dropdown closes
    await expect(page.getByTestId('sidebar-priority-dropdown')).toHaveCount(0, { timeout: 10000 });

    // Verify the priority value did not change
    await expect(page.getByTestId('sidebar-priority-btn')).toContainText('High');
  });

  test('Use assignee selector multiple times in sequence', async ({ page, baseURL }) => {
    // ENG-1: assigned to Alice Johnson
    const { token } = await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify initial assignee is Alice
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('Alice Johnson');

    // Get the initial activity count
    await page.getByTestId('activity-tab').click();
    const activityList = page.getByTestId('activity-list');
    await expect(activityList).toBeVisible({ timeout: 30000 });
    const initialEntryCount = await activityList.locator('[data-testid^="activity-entry-"]').count();

    // First selection: click Assignee field, select Bob Smith
    await page.getByTestId('sidebar-assignee-btn').click();
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toBeVisible();
    // Verify the search input is empty (reset)
    await expect(page.getByTestId('sidebar-assignee-search')).toHaveValue('');
    const bobOption = page.getByTestId('sidebar-assignee-dropdown').locator('button').filter({ hasText: 'Bob Smith' });
    await bobOption.click();

    // Verify dropdown closes and assignee updates to Bob
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toHaveCount(0);
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('Bob Smith', { timeout: 30000 });

    // Second selection: click Assignee field again, select Carol Davis
    await page.getByTestId('sidebar-assignee-btn').click();
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toBeVisible();
    // Verify the search input is reset between uses
    await expect(page.getByTestId('sidebar-assignee-search')).toHaveValue('');
    const carolOption = page.getByTestId('sidebar-assignee-dropdown').locator('button').filter({ hasText: 'Carol Davis' });
    await carolOption.click();

    // Verify dropdown closes and assignee updates to Carol Davis
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toHaveCount(0);
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('Carol Davis', { timeout: 30000 });

    // Verify both changes created separate activity entries
    await expect(
      activityList.locator('[data-testid^="activity-entry-"]')
    ).toHaveCount(initialEntryCount + 2, { timeout: 30000 });
  });
});
