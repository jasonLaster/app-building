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

test.describe('TeamIssuesList', () => {
  test('Team Issues page renders with header showing team name', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify header with team name
    await expect(page.getByTestId('team-issues-title')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-issues-title')).toContainText('Engineering');
    await expect(page.getByTestId('team-issues-title')).toContainText('Issues');

    // Verify New Issue button is visible
    await expect(page.getByTestId('new-issue-btn')).toBeVisible();
  });

  test('Team Issues page shows issues grouped by status (default)', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Wait for issues to load
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Seed data groups for ENG:
    // backlog: ENG-3, ENG-7 (2 issues)
    // todo: ENG-2, ENG-6 (2 issues)
    // in_progress: ENG-1, ENG-8 (2 issues)
    // in_review: ENG-4 (1 issue)
    // done: ENG-5 (1 issue)

    // Verify backlog group
    await expect(page.getByTestId('team-issue-group-backlog')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-backlog')).toContainText('Backlog');
    await expect(page.getByTestId('team-issue-group-header-backlog')).toContainText('(2)');

    // Verify todo group
    await expect(page.getByTestId('team-issue-group-todo')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-todo')).toContainText('Todo');
    await expect(page.getByTestId('team-issue-group-header-todo')).toContainText('(2)');

    // Verify in_progress group
    await expect(page.getByTestId('team-issue-group-in_progress')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('team-issue-group-header-in_progress')).toContainText('(2)');

    // Verify in_review group
    await expect(page.getByTestId('team-issue-group-in_review')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-in_review')).toContainText('In Review');
    await expect(page.getByTestId('team-issue-group-header-in_review')).toContainText('(1)');

    // Verify done group
    await expect(page.getByTestId('team-issue-group-done')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-done')).toContainText('Done');
    await expect(page.getByTestId('team-issue-group-header-done')).toContainText('(1)');

    // Verify cancelled group is NOT displayed (no cancelled issues in seed)
    await expect(page.getByTestId('team-issue-group-cancelled')).toHaveCount(0);

    // Verify groups appear in correct status order
    const backlogBox = await page.getByTestId('team-issue-group-backlog').boundingBox();
    const todoBox = await page.getByTestId('team-issue-group-todo').boundingBox();
    const inProgressBox = await page.getByTestId('team-issue-group-in_progress').boundingBox();
    const inReviewBox = await page.getByTestId('team-issue-group-in_review').boundingBox();
    const doneBox = await page.getByTestId('team-issue-group-done').boundingBox();
    expect(backlogBox!.y).toBeLessThan(todoBox!.y);
    expect(todoBox!.y).toBeLessThan(inProgressBox!.y);
    expect(inProgressBox!.y).toBeLessThan(inReviewBox!.y);
    expect(inReviewBox!.y).toBeLessThan(doneBox!.y);
  });

  test('Team Issues page shows all team issues, not just current user\'s', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Wait for issues to load
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // All 8 ENG issues should be visible
    const issueRows = page.locator('[data-testid^="issue-row-"]');
    await expect(issueRows).toHaveCount(8, { timeout: 30000 });

    // Verify Alice's issue (ENG-1)
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
    // Verify Bob's issue (ENG-2)
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-2$/ })).toHaveCount(1);
    // Verify unassigned issue (ENG-3)
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-3$/ })).toHaveCount(1);
    // Verify Carol's issue (ENG-4)
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-4$/ })).toHaveCount(1);
    // Verify Bob's done issue (ENG-5)
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-5$/ })).toHaveCount(1);
  });

  test('Team Issues page shows empty state when team has no issues', async ({ page, baseURL }) => {
    // Login as Alice and create a new team with no issues
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const uniqueId = Date.now();

    // Create a new team via API
    const createResponse = await fetch(`${baseURL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        name: `Empty Team ${uniqueId}`,
        identifier: `ET${uniqueId}`.slice(0, 5),
        description: 'A team with no issues',
      }),
    });
    const createData = await createResponse.json();
    const emptyTeamId = createData.team.id;

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/team/${emptyTeamId}/issues`);
    await expect(page.getByTestId('team-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify empty state
    await expect(page.getByTestId('team-issues-empty')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-issues-empty')).toContainText('No issues yet');

    // New Issue button should still be visible
    await expect(page.getByTestId('new-issue-btn')).toBeVisible();
  });

  test('Status group headers are collapsible', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify in_progress group items are visible
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible({ timeout: 30000 });

    // Click the in_progress toggle to collapse
    await page.getByTestId('team-issue-group-toggle-in_progress').click();

    // Verify items are hidden
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toHaveCount(0);

    // Header should still be visible
    await expect(page.getByTestId('team-issue-group-header-in_progress')).toBeVisible();

    // Click again to expand
    await page.getByTestId('team-issue-group-toggle-in_progress').click();

    // Verify items are visible again
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible();
  });

  test('Status group collapse toggles multiple times', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify backlog group items are visible initially
    await expect(page.getByTestId('team-issue-group-items-backlog')).toBeVisible({ timeout: 30000 });

    // Click 1: collapse
    await page.getByTestId('team-issue-group-toggle-backlog').click();
    await expect(page.getByTestId('team-issue-group-items-backlog')).toHaveCount(0);

    // Click 2: expand
    await page.getByTestId('team-issue-group-toggle-backlog').click();
    await expect(page.getByTestId('team-issue-group-items-backlog')).toBeVisible();

    // Click 3: collapse again
    await page.getByTestId('team-issue-group-toggle-backlog').click();
    await expect(page.getByTestId('team-issue-group-items-backlog')).toHaveCount(0);

    // Header still shows correct count
    await expect(page.getByTestId('team-issue-group-header-backlog')).toContainText('(2)');
  });

  test('Multiple status groups can be independently collapsed', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify all groups are expanded
    await expect(page.getByTestId('team-issue-group-items-backlog')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-items-done')).toBeVisible();

    // Collapse backlog group
    await page.getByTestId('team-issue-group-toggle-backlog').click();
    await expect(page.getByTestId('team-issue-group-items-backlog')).toHaveCount(0);

    // Collapse done group
    await page.getByTestId('team-issue-group-toggle-done').click();
    await expect(page.getByTestId('team-issue-group-items-done')).toHaveCount(0);

    // In Progress should still be expanded
    await expect(page.getByTestId('team-issue-group-items-in_progress')).toBeVisible();
  });
});
