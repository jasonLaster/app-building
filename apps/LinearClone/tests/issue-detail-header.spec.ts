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

  // Find the issue by number
  const issue = issues.find((i: { number: number }) => i.number === issueNumber);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/issue/${issue.id}`);
  await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, engTeam, issue };
}

test.describe('IssueDetailHeader', () => {
  test('Issue header renders identifier and title', async ({ page, baseURL }) => {
    // ENG-1: "Fix login session expiration bug", status: in_progress
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify identifier is displayed
    await expect(page.getByTestId('issue-header-identifier')).toBeVisible();
    await expect(page.getByTestId('issue-header-identifier')).toHaveText('ENG-1');

    // Verify title is displayed
    await expect(page.getByTestId('issue-header-title')).toBeVisible();
    await expect(page.getByTestId('issue-header-title')).toHaveText('Fix login session expiration bug');

    // Verify status selector is visible
    await expect(page.getByTestId('issue-header-status-btn')).toBeVisible();
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('In Progress');
  });

  test('Inline edit issue title', async ({ page, baseURL }) => {
    // ENG-1: "Fix login session expiration bug"
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Click the title to enter edit mode
    await page.getByTestId('issue-header-title').click();

    // Verify input appears with current title value
    const titleInput = page.getByTestId('issue-header-title-input');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue('Fix login session expiration bug');
    await expect(titleInput).toBeFocused();
  });

  test('Save edited issue title', async ({ page, baseURL }) => {
    // Use ENG-3 (backlog, unassigned) to avoid conflicts with other tests
    await loginAndNavigateToIssue(page, baseURL!, 3);

    const uniqueSuffix = Date.now();
    const newTitle = `Updated dark mode title ${uniqueSuffix}`;

    // Click title to edit
    await page.getByTestId('issue-header-title').click();
    const titleInput = page.getByTestId('issue-header-title-input');
    await expect(titleInput).toBeVisible();

    // Clear and type new title
    await titleInput.fill(newTitle);
    await titleInput.press('Enter');

    // Verify title updates in display mode
    await expect(page.getByTestId('issue-header-title')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-header-title')).toHaveText(newTitle);

    // Verify input is no longer visible (returned to display mode)
    await expect(page.getByTestId('issue-header-title-input')).toHaveCount(0);
  });

  test('Cancel title edit on Escape', async ({ page, baseURL }) => {
    // ENG-1: "Fix login session expiration bug"
    await loginAndNavigateToIssue(page, baseURL!, 1);

    const originalTitle = 'Fix login session expiration bug';

    // Click title to edit
    await page.getByTestId('issue-header-title').click();
    const titleInput = page.getByTestId('issue-header-title-input');
    await expect(titleInput).toBeVisible();

    // Type some characters
    await titleInput.fill('Some random text that should not be saved');

    // Press Escape to cancel
    await titleInput.press('Escape');

    // Verify title reverts to original
    await expect(page.getByTestId('issue-header-title')).toBeVisible();
    await expect(page.getByTestId('issue-header-title')).toHaveText(originalTitle);

    // Verify input is gone (display mode)
    await expect(page.getByTestId('issue-header-title-input')).toHaveCount(0);
  });

  test('Title edit validates non-empty', async ({ page, baseURL }) => {
    // ENG-1: "Fix login session expiration bug"
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Click title to edit
    await page.getByTestId('issue-header-title').click();
    const titleInput = page.getByTestId('issue-header-title-input');
    await expect(titleInput).toBeVisible();

    // Clear the title completely
    await titleInput.fill('');
    await titleInput.press('Enter');

    // Verify input still visible (did not save) and has error styling
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveClass(/issue-header-title-input-error/);
  });

  test('Inline status selector displays current status', async ({ page, baseURL }) => {
    // ENG-1: status is "in_progress" -> label "In Progress"
    await loginAndNavigateToIssue(page, baseURL!, 1);

    const statusBtn = page.getByTestId('issue-header-status-btn');
    await expect(statusBtn).toBeVisible();
    await expect(statusBtn).toContainText('In Progress');
  });

  test('Change status via inline selector', async ({ page, baseURL }) => {
    // ENG-2: status is "todo"
    await loginAndNavigateToIssue(page, baseURL!, 2);

    // Verify current status is Todo
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('Todo');

    // Click the status selector
    await page.getByTestId('issue-header-status-btn').click();

    // Verify dropdown appears with all statuses
    const dropdown = page.getByTestId('issue-header-status-dropdown');
    await expect(dropdown).toBeVisible();
    await expect(page.getByTestId('issue-header-status-option-backlog')).toBeVisible();
    await expect(page.getByTestId('issue-header-status-option-todo')).toBeVisible();
    await expect(page.getByTestId('issue-header-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('issue-header-status-option-in_review')).toBeVisible();
    await expect(page.getByTestId('issue-header-status-option-done')).toBeVisible();
    await expect(page.getByTestId('issue-header-status-option-cancelled')).toBeVisible();

    // Verify each option has correct label text
    await expect(page.getByTestId('issue-header-status-option-backlog')).toContainText('Backlog');
    await expect(page.getByTestId('issue-header-status-option-todo')).toContainText('Todo');
    await expect(page.getByTestId('issue-header-status-option-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('issue-header-status-option-in_review')).toContainText('In Review');
    await expect(page.getByTestId('issue-header-status-option-done')).toContainText('Done');
    await expect(page.getByTestId('issue-header-status-option-cancelled')).toContainText('Cancelled');
  });

  test('Select new status from dropdown', async ({ page, baseURL }) => {
    // Use ENG-7 (backlog, unassigned) to avoid conflicts
    await loginAndNavigateToIssue(page, baseURL!, 7);

    // Verify current status is Backlog
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('Backlog');

    // Open dropdown and select "In Progress"
    await page.getByTestId('issue-header-status-btn').click();
    await expect(page.getByTestId('issue-header-status-dropdown')).toBeVisible();
    await page.getByTestId('issue-header-status-option-in_progress').click();

    // Verify dropdown closes
    await expect(page.getByTestId('issue-header-status-dropdown')).toHaveCount(0);

    // Verify status updated to "In Progress"
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('In Progress', { timeout: 30000 });
  });

  test('Status dropdown closes on outside click', async ({ page, baseURL }) => {
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Open the status dropdown
    await page.getByTestId('issue-header-status-btn').click();
    await expect(page.getByTestId('issue-header-status-dropdown')).toBeVisible();

    // Click outside the dropdown (on the page body)
    await page.getByTestId('issue-detail-main').click({ position: { x: 10, y: 10 } });

    // Verify dropdown is closed
    await expect(page.getByTestId('issue-header-status-dropdown')).toHaveCount(0);

    // Verify status has not changed (still "In Progress")
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('In Progress');
  });
});
