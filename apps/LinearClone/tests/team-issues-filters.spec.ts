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

// ENG seed data (8 issues):
// ENG-1: in_progress, high, Bug, Alice, V2 Launch, Sprint 12
// ENG-2: todo, medium, Feature, Bob, V2 Launch, Sprint 12
// ENG-3: backlog, low, Feature, unassigned, V2 Launch, no cycle
// ENG-4: in_review, high, Improvement, Carol, V2 Launch, Sprint 12
// ENG-5: done, medium, Documentation, Bob, no project, no cycle
// ENG-6: todo, urgent, Bug, Alice, V2 Launch, Sprint 12
// ENG-7: backlog, none, Improvement, unassigned, no project, no cycle
// ENG-8: in_progress, medium, Feature, Bob, V2 Launch, Sprint 12

test.describe('Team Issues Filters', () => {
  test('Team filters toolbar renders with all filter options', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify filters toolbar is visible
    await expect(page.getByTestId('team-filters-toolbar')).toBeVisible({ timeout: 30000 });

    // Verify all six filter buttons are present
    await expect(page.getByTestId('team-filter-btn-status')).toBeVisible();
    await expect(page.getByTestId('team-filter-btn-status')).toContainText('Status');

    await expect(page.getByTestId('team-filter-btn-priority')).toBeVisible();
    await expect(page.getByTestId('team-filter-btn-priority')).toContainText('Priority');

    await expect(page.getByTestId('team-filter-btn-assignee')).toBeVisible();
    await expect(page.getByTestId('team-filter-btn-assignee')).toContainText('Assignee');

    await expect(page.getByTestId('team-filter-btn-label')).toBeVisible();
    await expect(page.getByTestId('team-filter-btn-label')).toContainText('Label');

    await expect(page.getByTestId('team-filter-btn-project')).toBeVisible();
    await expect(page.getByTestId('team-filter-btn-project')).toContainText('Project');

    await expect(page.getByTestId('team-filter-btn-cycle')).toBeVisible();
    await expect(page.getByTestId('team-filter-btn-cycle')).toContainText('Cycle');
  });

  test('Status filter dropdown shows all statuses with icons', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the Status filter button
    await page.getByTestId('team-filter-btn-status').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('team-filter-dropdown-status')).toBeVisible();

    // Verify all 6 statuses are shown with correct labels
    await expect(page.getByTestId('team-filter-option-status-backlog')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-status-backlog')).toContainText('Backlog');

    await expect(page.getByTestId('team-filter-option-status-todo')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-status-todo')).toContainText('Todo');

    await expect(page.getByTestId('team-filter-option-status-in_progress')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-status-in_progress')).toContainText('In Progress');

    await expect(page.getByTestId('team-filter-option-status-in_review')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-status-in_review')).toContainText('In Review');

    await expect(page.getByTestId('team-filter-option-status-done')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-status-done')).toContainText('Done');

    await expect(page.getByTestId('team-filter-option-status-cancelled')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-status-cancelled')).toContainText('Cancelled');

    // Each option should have an SVG icon (StatusIcon component)
    for (const status of ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']) {
      await expect(page.getByTestId(`team-filter-option-status-${status}`).locator('svg')).toHaveCount(1);
    }
  });

  test('Status filter filters issues by selected statuses', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // ENG team has 8 issues total
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Status filter and select "In Progress"
    await page.getByTestId('team-filter-btn-status').click();
    await page.getByTestId('team-filter-option-status-in_progress').click();

    // Only in_progress issues should show: ENG-1, ENG-8 (2 issues)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });

    // Verify the in_progress group is visible
    await expect(page.getByTestId('team-issue-group-in_progress')).toBeVisible();

    // Other groups should be hidden
    await expect(page.getByTestId('team-issue-group-backlog')).toHaveCount(0);
    await expect(page.getByTestId('team-issue-group-todo')).toHaveCount(0);
    await expect(page.getByTestId('team-issue-group-done')).toHaveCount(0);

    // Status filter button should show badge "1"
    await expect(page.getByTestId('team-filter-badge-status')).toBeVisible();
    await expect(page.getByTestId('team-filter-badge-status')).toHaveText('1');
  });

  test('Priority filter dropdown shows all priorities with icons', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the Priority filter button
    await page.getByTestId('team-filter-btn-priority').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('team-filter-dropdown-priority')).toBeVisible();

    // Verify all 5 priorities are shown
    await expect(page.getByTestId('team-filter-option-priority-urgent')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-priority-urgent')).toContainText('Urgent');

    await expect(page.getByTestId('team-filter-option-priority-high')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-priority-high')).toContainText('High');

    await expect(page.getByTestId('team-filter-option-priority-medium')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-priority-medium')).toContainText('Medium');

    await expect(page.getByTestId('team-filter-option-priority-low')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-priority-low')).toContainText('Low');

    await expect(page.getByTestId('team-filter-option-priority-none')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-priority-none')).toContainText('No Priority');

    // Each option should have an SVG icon (PriorityIcon component)
    for (const priority of ['urgent', 'high', 'medium', 'low', 'none']) {
      await expect(page.getByTestId(`team-filter-option-priority-${priority}`).locator('svg')).toHaveCount(1);
    }
  });

  test('Priority filter filters issues by selected priorities', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // ENG team: high(2: ENG-1, ENG-4), medium(3: ENG-2, ENG-5, ENG-8), urgent(1: ENG-6), low(1: ENG-3), none(1: ENG-7)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Priority filter and select "High"
    await page.getByTestId('team-filter-btn-priority').click();
    await page.getByTestId('team-filter-option-priority-high').click();

    // Only high priority issues: ENG-1, ENG-4
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-4$/ })).toHaveCount(1);

    // Other issues hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-2$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(0);
  });

  test('Assignee filter dropdown shows all team members', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the Assignee filter button
    await page.getByTestId('team-filter-btn-assignee').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('team-filter-dropdown-assignee')).toBeVisible();

    // Verify Unassigned option
    await expect(page.getByTestId('team-filter-option-assignee-unassigned')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-assignee-unassigned')).toContainText('Unassigned');

    // Verify all 3 team members are shown (Alice, Bob, Carol)
    const dropdown = page.getByTestId('team-filter-dropdown-assignee');
    await expect(dropdown).toContainText('Alice Johnson');
    await expect(dropdown).toContainText('Bob Smith');
    await expect(dropdown).toContainText('Carol Davis');

    // 1 unassigned + 3 members = 4 options
    await expect(dropdown.locator('button')).toHaveCount(4);
  });

  test('Assignee filter filters issues by selected assignees', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Alice: ENG-1, ENG-6; Bob: ENG-2, ENG-5, ENG-8; Carol: ENG-4; Unassigned: ENG-3, ENG-7
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Assignee filter and find Alice's option
    await page.getByTestId('team-filter-btn-assignee').click();

    // Click Alice's option (by finding button with her name)
    const aliceOption = page.getByTestId('team-filter-dropdown-assignee').locator('button').filter({ hasText: /Alice Johnson/ });
    await aliceOption.click();

    // Only Alice's issues should show: ENG-1, ENG-6
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(1);

    // Bob's and unassigned issues should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-2$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-3$/ })).toHaveCount(0);
  });

  test('Label filter dropdown shows all available labels', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the Label filter button
    await page.getByTestId('team-filter-btn-label').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('team-filter-dropdown-label')).toBeVisible();

    // Seed labels: Bug, Feature, Improvement, Documentation
    const dropdown = page.getByTestId('team-filter-dropdown-label');
    await expect(dropdown.locator('button')).toHaveCount(4);

    await expect(dropdown).toContainText('Bug');
    await expect(dropdown).toContainText('Feature');
    await expect(dropdown).toContainText('Improvement');
    await expect(dropdown).toContainText('Documentation');
  });

  test('Label filter filters issues by selected labels', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Bug: ENG-1, ENG-6; Feature: ENG-2, ENG-3, ENG-8; Improvement: ENG-4, ENG-7; Documentation: ENG-5
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Label filter and select "Bug"
    await page.getByTestId('team-filter-btn-label').click();
    const bugOption = page.getByTestId('team-filter-dropdown-label').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    // Only Bug-labeled issues should show: ENG-1, ENG-6
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(1);

    // Other issues should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-2$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-5$/ })).toHaveCount(0);
  });

  test('Assignee filter allows multi-select', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Alice: ENG-1, ENG-6 (2); Bob: ENG-2, ENG-5, ENG-8 (3)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Assignee filter and select Alice and Bob
    await page.getByTestId('team-filter-btn-assignee').click();

    const aliceOption = page.getByTestId('team-filter-dropdown-assignee').locator('button').filter({ hasText: /Alice Johnson/ });
    await aliceOption.click();

    const bobOption = page.getByTestId('team-filter-dropdown-assignee').locator('button').filter({ hasText: /Bob Smith/ });
    await bobOption.click();

    // Alice (2) + Bob (3) = 5 issues
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(5, { timeout: 15000 });

    // Carol's and unassigned issues should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-4$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-3$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-7$/ })).toHaveCount(0);

    // Filter badge should show "2"
    await expect(page.getByTestId('team-filter-badge-assignee')).toBeVisible();
    await expect(page.getByTestId('team-filter-badge-assignee')).toHaveText('2');
  });
});
