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
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/team/${engTeam.id}/issues`);
  await expect(page.getByTestId('team-issues-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, engTeam };
}

// Helper to get team issues via API
async function _getTeamIssues(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/team-issues?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.issues;
}

test.describe('GroupBySort - Sort By', () => {
  test('Sort by control renders with default option', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify sort by button is visible and shows default option
    const sortByBtn = page.getByTestId('sort-by-btn');
    await expect(sortByBtn).toBeVisible({ timeout: 30000 });
    await expect(sortByBtn).toContainText('Sort');
    await expect(sortByBtn).toContainText('Priority');
  });

  test('Sort by dropdown shows all sorting options', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the sort by button to open dropdown
    await page.getByTestId('sort-by-btn').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('sort-by-dropdown')).toBeVisible();

    // Verify all options are present
    await expect(page.getByTestId('sort-by-option-priority')).toBeVisible();
    await expect(page.getByTestId('sort-by-option-priority')).toContainText('Priority');

    await expect(page.getByTestId('sort-by-option-created')).toBeVisible();
    await expect(page.getByTestId('sort-by-option-created')).toContainText('Created date');

    await expect(page.getByTestId('sort-by-option-updated')).toBeVisible();
    await expect(page.getByTestId('sort-by-option-updated')).toContainText('Updated date');

    await expect(page.getByTestId('sort-by-option-status')).toBeVisible();
    await expect(page.getByTestId('sort-by-option-status')).toContainText('Status');
  });

  test('Sort by Priority orders issues by priority level', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Default sort is already Priority, verify issues within a group are sorted by priority
    // In the "in_progress" group we have: ENG-1 (high), ENG-8 (medium)
    // With priority sort: high should come before medium
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible({ timeout: 30000 });

    const inProgressItems = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-row-"]');
    await expect(inProgressItems).toHaveCount(2);

    // Get the identifier text of the first and second issues
    const firstIdentifier = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').first();
    const secondIdentifier = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').last();

    // ENG-1 (high priority) should come before ENG-8 (medium priority)
    await expect(firstIdentifier).toContainText('ENG-1');
    await expect(secondIdentifier).toContainText('ENG-8');
  });

  test('Sort by Created date orders issues by creation time', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Switch sort to Created date
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-created').click();

    // Verify sort button updated
    await expect(page.getByTestId('sort-by-btn')).toContainText('Created date');

    // With "Created date" sort (newest first), issues inserted later should come first
    // within each group. In the "in_progress" group: ENG-1 (inserted first) and ENG-8 (inserted later)
    // Newest first means ENG-8 should come before ENG-1
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible({ timeout: 30000 });

    const firstIdentifier = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').first();
    const secondIdentifier = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').last();

    // ENG-8 (created later) should come before ENG-1 (created earlier)
    await expect(firstIdentifier).toContainText('ENG-8');
    await expect(secondIdentifier).toContainText('ENG-1');
  });

  test('Sort by Updated date orders issues by last update time', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Switch sort to Updated date
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-updated').click();

    // Verify sort button updated
    await expect(page.getByTestId('sort-by-btn')).toContainText('Updated date');

    // Updated date sort shows most recently updated first
    // Issues are created sequentially, so most recently created = most recently updated
    // In "in_progress" group: ENG-8 (updated later) should come before ENG-1
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible({ timeout: 30000 });

    const firstIdentifier = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').first();
    const secondIdentifier = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').last();

    await expect(firstIdentifier).toContainText('ENG-8');
    await expect(secondIdentifier).toContainText('ENG-1');
  });

  test('Sort by Status orders issues by status progression', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // First set group by to None for a flat list
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-none').click();
    await expect(page.getByTestId('group-by-btn')).toContainText('None');

    // Then set sort by to Status
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-status').click();
    await expect(page.getByTestId('sort-by-btn')).toContainText('Status');

    // Verify issues are in a flat list
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });
    const issueRows = page.locator('[data-testid^="issue-row-"]');
    await expect(issueRows).toHaveCount(8, { timeout: 30000 });

    // Status order: backlog(0), todo(1), in_progress(2), in_review(3), done(4), cancelled(5)
    // ENG issues by status:
    // backlog: ENG-3, ENG-7
    // todo: ENG-2, ENG-6
    // in_progress: ENG-1, ENG-8
    // in_review: ENG-4
    // done: ENG-5

    // Verify ordering by checking that backlog issues appear before todo, etc.
    const identifiers = page.locator('[data-testid^="issue-identifier-"]');

    // First two should be backlog issues (ENG-3, ENG-7)
    const firstId = await identifiers.nth(0).textContent();
    const secondId = await identifiers.nth(1).textContent();
    expect(['ENG-3', 'ENG-7']).toContain(firstId?.trim());
    expect(['ENG-3', 'ENG-7']).toContain(secondId?.trim());

    // Last issue should be done (ENG-5)
    const lastId = await identifiers.nth(7).textContent();
    expect(lastId?.trim()).toBe('ENG-5');
  });

  test('Sort works correctly within groups', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Default grouping is Status, select Priority sort
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-priority').click();

    // In the "todo" group: ENG-6 (urgent), ENG-2 (medium)
    // Priority sort: urgent first
    await expect(page.getByTestId('team-issue-group-items-todo')).toBeVisible({ timeout: 30000 });

    const todoIdentifiers = page.getByTestId('team-issue-group-items-todo').locator('[data-testid^="issue-identifier-"]');
    await expect(todoIdentifiers).toHaveCount(2);

    // ENG-6 (urgent) should come before ENG-2 (medium)
    await expect(todoIdentifiers.first()).toContainText('ENG-6');
    await expect(todoIdentifiers.last()).toContainText('ENG-2');

    // Also verify in backlog group: ENG-3 (low), ENG-7 (none)
    const backlogIdentifiers = page.getByTestId('team-issue-group-items-backlog').locator('[data-testid^="issue-identifier-"]');
    await expect(backlogIdentifiers).toHaveCount(2);

    // ENG-3 (low) should come before ENG-7 (no priority)
    await expect(backlogIdentifiers.first()).toContainText('ENG-3');
    await expect(backlogIdentifiers.last()).toContainText('ENG-7');
  });

  test('Sort by can be changed multiple times', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Sort by Priority (default)
    await expect(page.getByTestId('sort-by-btn')).toContainText('Priority', { timeout: 30000 });

    // Change to Created date
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-created').click();
    await expect(page.getByTestId('sort-by-btn')).toContainText('Created date');

    // Verify sort took effect - in "in_progress" group, newest first
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible({ timeout: 30000 });
    const inProgressFirst = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').first();
    await expect(inProgressFirst).toContainText('ENG-8');

    // Change to Updated date
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-updated').click();
    await expect(page.getByTestId('sort-by-btn')).toContainText('Updated date');

    // Change back to Priority
    await page.getByTestId('sort-by-btn').click();
    await page.getByTestId('sort-by-option-priority').click();
    await expect(page.getByTestId('sort-by-btn')).toContainText('Priority');

    // Verify priority sort is active - ENG-1 (high) should come before ENG-8 (medium) in in_progress
    const inProgressFirstAfter = page.getByTestId('team-issue-group-items-in_progress').locator('[data-testid^="issue-identifier-"]').first();
    await expect(inProgressFirstAfter).toContainText('ENG-1');
  });
});
