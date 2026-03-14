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

// Helper to login and navigate to team issues page
async function loginAndNavigateToTeamIssues(
  page: import('@playwright/test').Page,
  baseURL: string,
  teamIdentifier = 'ENG',
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const team = teams.find((t: { identifier: string }) => t.identifier === teamIdentifier);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/team/${team.id}/issues`);
  await expect(page.getByTestId('team-issues-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, team, teams };
}

// Helper to login and navigate to my issues page
async function loginAndNavigateToMyIssues(
  page: import('@playwright/test').Page,
  baseURL: string,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/my-issues');
  await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user };
}

// Helper to open create issue modal from team issues page
async function openCreateModalFromTeamPage(
  page: import('@playwright/test').Page,
  baseURL: string,
  teamIdentifier = 'ENG'
) {
  const result = await loginAndNavigateToTeamIssues(page, baseURL, teamIdentifier);
  await page.getByTestId('new-issue-btn').click();
  await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });
  return result;
}

test.describe('CreateIssueModalForm', () => {
  test('Create issue modal renders with all form fields', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    // Verify all form fields are visible
    await expect(page.getByTestId('create-issue-team-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-title-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-description-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-status-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-priority-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-assignee-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-labels-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-project-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-cycle-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-due-date-field')).toBeVisible();
    await expect(page.getByTestId('create-issue-parent-field')).toBeVisible();

    // Verify fields have proper labels
    await expect(page.getByTestId('create-issue-team-field')).toContainText('Team');
    await expect(page.getByTestId('create-issue-title-field')).toContainText('Title');
    await expect(page.getByTestId('create-issue-description-field')).toContainText('Description');
    await expect(page.getByTestId('create-issue-status-field')).toContainText('Status');
    await expect(page.getByTestId('create-issue-priority-field')).toContainText('Priority');
    await expect(page.getByTestId('create-issue-assignee-field')).toContainText('Assignee');
    await expect(page.getByTestId('create-issue-labels-field')).toContainText('Labels');
    await expect(page.getByTestId('create-issue-project-field')).toContainText('Project');
    await expect(page.getByTestId('create-issue-cycle-field')).toContainText('Cycle');
    await expect(page.getByTestId('create-issue-due-date-field')).toContainText('Due date');
    await expect(page.getByTestId('create-issue-parent-field')).toContainText('Parent issue');
  });

  test('Modal opens from New Issue button on team issues page', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the New Issue button
    await page.getByTestId('new-issue-btn').click();

    // Verify the modal opens as an overlay
    await expect(page.getByTestId('create-issue-modal-overlay')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-modal')).toBeVisible();

    // Verify Team selector is pre-selected to "Engineering"
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Engineering');

    // Verify Title input is focused
    await expect(page.getByTestId('create-issue-title-input')).toBeFocused();
  });

  test('Modal opens from keyboard shortcut C', async ({ page, baseURL }) => {
    await loginAndNavigateToMyIssues(page, baseURL!);

    // Press "C" key (no input focused)
    await page.keyboard.press('c');

    // Verify the modal opens as an overlay
    await expect(page.getByTestId('create-issue-modal-overlay')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-modal')).toBeVisible();
  });

  test('Team selector defaults to current team context', async ({ page, baseURL }) => {
    // Navigate to Design team page and open modal
    await openCreateModalFromTeamPage(page, baseURL!, 'DES');

    // Verify team selector shows "Design"
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Design');
  });

  test('Team selector allows changing team', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!, 'ENG');

    // Click team selector
    await page.getByTestId('create-issue-team-selector').click();
    await expect(page.getByTestId('create-issue-team-dropdown')).toBeVisible();

    // Find and click "Design" option
    const designOption = page.getByTestId('create-issue-team-dropdown').locator('button').filter({ hasText: /^Design$/ });
    await designOption.click();

    // Verify team selector now shows "Design"
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Design');
  });

  test('Title field is required', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    // Leave title empty and click submit
    await page.getByTestId('create-issue-submit-btn').click();

    // Verify validation error appears
    await expect(page.getByTestId('create-issue-title-error')).toBeVisible();
    await expect(page.getByTestId('create-issue-title-error')).toContainText('Title is required');

    // Verify modal is still open (issue was not created)
    await expect(page.getByTestId('create-issue-modal')).toBeVisible();
  });

  test('Title field accepts text input', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    // Type in the title field
    await page.getByTestId('create-issue-title-input').fill('Implement user authentication');

    // Verify the title field displays the text
    await expect(page.getByTestId('create-issue-title-input')).toHaveValue('Implement user authentication');
  });

  test('Description field supports markdown text entry', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    const markdownText = '## Overview\nThis issue covers the auth flow';

    // Type markdown in the description field
    await page.getByTestId('create-issue-description-input').fill(markdownText);

    // Verify the description field accepts and displays the markdown text
    await expect(page.getByTestId('create-issue-description-input')).toHaveValue(markdownText);
  });

  test('Status dropdown defaults to Backlog', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    // Verify status shows "Backlog" as default
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Backlog');

    // Verify the status selector has an SVG icon
    const statusIcon = page.getByTestId('create-issue-status-selector').locator('svg').first();
    await expect(statusIcon).toBeVisible();
  });

  test('Status dropdown shows all status options with icons', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    // Click the status dropdown
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();

    // Verify all 6 status options are visible
    await expect(page.getByTestId('create-issue-status-option-backlog')).toBeVisible();
    await expect(page.getByTestId('create-issue-status-option-todo')).toBeVisible();
    await expect(page.getByTestId('create-issue-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('create-issue-status-option-in_review')).toBeVisible();
    await expect(page.getByTestId('create-issue-status-option-done')).toBeVisible();
    await expect(page.getByTestId('create-issue-status-option-cancelled')).toBeVisible();

    // Verify each option has the correct label text
    await expect(page.getByTestId('create-issue-status-option-backlog')).toContainText('Backlog');
    await expect(page.getByTestId('create-issue-status-option-todo')).toContainText('Todo');
    await expect(page.getByTestId('create-issue-status-option-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('create-issue-status-option-in_review')).toContainText('In Review');
    await expect(page.getByTestId('create-issue-status-option-done')).toContainText('Done');
    await expect(page.getByTestId('create-issue-status-option-cancelled')).toContainText('Cancelled');

    // Verify each option has an icon (SVG)
    for (const status of ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']) {
      const option = page.getByTestId(`create-issue-status-option-${status}`);
      await expect(option.locator('svg').first()).toBeVisible();
    }
  });

  test('Status dropdown allows selecting a different status', async ({ page, baseURL }) => {
    await openCreateModalFromTeamPage(page, baseURL!);

    // Verify initial status is Backlog
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Backlog');

    // Click status dropdown and select "Todo"
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-todo').click();

    // Verify status now shows "Todo"
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Todo');

    // Verify the status selector has an icon
    const statusIcon = page.getByTestId('create-issue-status-selector').locator('svg').first();
    await expect(statusIcon).toBeVisible();
  });
});
