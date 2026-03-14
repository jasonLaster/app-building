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

// Helper to create a user via signup API
async function createTestUser(baseURL: string, name: string, email: string, password: string) {
  const response = await fetch(`${baseURL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

// Helper to login and navigate to /my-issues
async function loginAndNavigate(
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
  return data;
}

// Helper to get teams via API
async function getTeams(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.teams;
}

// Helper to create issue via API
async function createIssueViaApi(baseURL: string, token: string, issueData: Record<string, unknown>) {
  const response = await fetch(`${baseURL}/api/create-issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(issueData),
  });
  return response.json();
}

test.describe('MyIssuesList', () => {
  test('My Issues page renders with issues grouped by status', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Alice has: todo (2 issues: ENG-6, DES-3) and in_progress (1 issue: ENG-1)
    // Verify todo group
    await expect(page.getByTestId('issue-group-todo')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-group-header-todo')).toContainText('Todo');
    await expect(page.getByTestId('issue-group-header-todo')).toContainText('(2)');

    // Verify in_progress group
    await expect(page.getByTestId('issue-group-in_progress')).toBeVisible();
    await expect(page.getByTestId('issue-group-header-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('issue-group-header-in_progress')).toContainText('(1)');

    // Verify empty groups are NOT displayed
    await expect(page.getByTestId('issue-group-backlog')).toHaveCount(0);
    await expect(page.getByTestId('issue-group-in_review')).toHaveCount(0);
    await expect(page.getByTestId('issue-group-done')).toHaveCount(0);
    await expect(page.getByTestId('issue-group-cancelled')).toHaveCount(0);

    // Verify groups appear in correct status order (todo before in_progress)
    const todoBox = await page.getByTestId('issue-group-todo').boundingBox();
    const inProgressBox = await page.getByTestId('issue-group-in_progress').boundingBox();
    expect(todoBox!.y).toBeLessThan(inProgressBox!.y);
  });

  test('My Issues page shows empty state when no issues assigned', async ({ page, baseURL }) => {
    // Create a new user with no issues
    const email = `empty-user-${Date.now()}@test.com`;
    const data = await createTestUser(baseURL!, 'Empty User', email, 'password123');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify empty state
    await expect(page.getByTestId('my-issues-empty')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('my-issues-empty')).toContainText('No issues assigned to you yet');

    // Verify no issue list is shown
    await expect(page.getByTestId('my-issues-list')).toHaveCount(0);
  });

  test('Status group is collapsible', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Verify in_progress group items are visible
    await expect(page.getByTestId('issue-group-items-in_progress')).toBeVisible({ timeout: 30000 });

    // Click the in_progress header to collapse
    await page.getByTestId('issue-group-header-in_progress').click();

    // Verify items are hidden
    await expect(page.getByTestId('issue-group-items-in_progress')).toHaveCount(0);

    // Header should still be visible
    await expect(page.getByTestId('issue-group-header-in_progress')).toBeVisible();

    // Click again to expand
    await page.getByTestId('issue-group-header-in_progress').click();

    // Verify items are visible again
    await expect(page.getByTestId('issue-group-items-in_progress')).toBeVisible();
  });

  test('Status group collapse toggles multiple times', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Verify todo group items are visible initially
    await expect(page.getByTestId('issue-group-items-todo')).toBeVisible({ timeout: 30000 });

    // Click 1: collapse
    await page.getByTestId('issue-group-header-todo').click();
    await expect(page.getByTestId('issue-group-items-todo')).toHaveCount(0);

    // Click 2: expand
    await page.getByTestId('issue-group-header-todo').click();
    await expect(page.getByTestId('issue-group-items-todo')).toBeVisible();

    // Click 3: collapse again
    await page.getByTestId('issue-group-header-todo').click();
    await expect(page.getByTestId('issue-group-items-todo')).toHaveCount(0);

    // Header still shows correct count
    await expect(page.getByTestId('issue-group-header-todo')).toContainText('(2)');
  });

  test('Multiple status groups can be independently collapsed', async ({ page, baseURL }) => {
    // Login and create a "done" issue for Alice so she has 3 groups
    const { token, user } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: `Done issue ${Date.now()}`,
      status: 'done',
      priority: 'medium',
      assigneeId: user.id,
    });

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify all three groups are visible
    await expect(page.getByTestId('issue-group-items-todo')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-group-items-in_progress')).toBeVisible();
    await expect(page.getByTestId('issue-group-items-done')).toBeVisible();

    // Collapse todo group
    await page.getByTestId('issue-group-header-todo').click();
    await expect(page.getByTestId('issue-group-items-todo')).toHaveCount(0);

    // Collapse done group
    await page.getByTestId('issue-group-header-done').click();
    await expect(page.getByTestId('issue-group-items-done')).toHaveCount(0);

    // In Progress should still be expanded
    await expect(page.getByTestId('issue-group-items-in_progress')).toBeVisible();
  });

  test('My Issues page only shows issues assigned to current user', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Alice's issues should be present: ENG-1, ENG-6, DES-3
    const issueRows = page.locator('[data-testid^="issue-row-"]');
    await expect(issueRows).toHaveCount(3, { timeout: 30000 });

    // Verify Alice's issue identifiers are present
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^DES-3$/ })).toHaveCount(1);

    // Bob's issues should NOT be present
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-2$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-5$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-8$/ })).toHaveCount(0);

    // Unassigned issues should NOT be present
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-3$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-7$/ })).toHaveCount(0);
  });

  test('My Issues page updates when issue is assigned to user', async ({ page, baseURL }) => {
    const { token, user } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Wait for issues to load and count initial issues
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Create a new issue assigned to Alice via API
    const issueTitle = `Newly assigned issue ${Date.now()}`;
    await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: issueTitle,
      status: 'todo',
      priority: 'medium',
      assigneeId: user.id,
    });

    // Reload the page to pick up the new issue
    await page.reload();
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify the new issue appears in the list (4 total now)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(4, { timeout: 30000 });
  });

  test('My Issues page title and header are displayed', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Verify the page title "My Issues" is displayed
    await expect(page.getByTestId('my-issues-title')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('my-issues-title')).toHaveText('My Issues');
  });
});
