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

test.describe('Team Issues Filters - Advanced', () => {
  test('Project filter dropdown shows all team projects', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the Project filter button
    await page.getByTestId('team-filter-btn-project').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('team-filter-dropdown-project')).toBeVisible();

    // Verify "No Project" option
    await expect(page.getByTestId('team-filter-option-project-none')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-project-none')).toContainText('No Project');

    // Verify V2 Launch project is listed
    const dropdown = page.getByTestId('team-filter-dropdown-project');
    await expect(dropdown).toContainText('V2 Launch');

    // 1 "No Project" + 1 actual project = 2 options
    await expect(dropdown.locator('button')).toHaveCount(2);
  });

  test('Project filter filters issues by selected projects', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // V2 Launch: ENG-1,2,3,4,6,8 (6); No Project: ENG-5,7 (2)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Project filter and select "No Project"
    await page.getByTestId('team-filter-btn-project').click();
    await page.getByTestId('team-filter-option-project-none').click();

    // Only issues with no project: ENG-5, ENG-7
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-5$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-7$/ })).toHaveCount(1);

    // V2 Launch issues should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(0);
  });

  test('Cycle filter dropdown shows team cycles', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the Cycle filter button
    await page.getByTestId('team-filter-btn-cycle').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('team-filter-dropdown-cycle')).toBeVisible();

    // Verify "No Cycle" option
    await expect(page.getByTestId('team-filter-option-cycle-none')).toBeVisible();
    await expect(page.getByTestId('team-filter-option-cycle-none')).toContainText('No Cycle');

    // Verify Sprint 12 is listed
    const dropdown = page.getByTestId('team-filter-dropdown-cycle');
    await expect(dropdown).toContainText('Sprint 12');

    // 1 "No Cycle" + 1 actual cycle = 2 options
    await expect(dropdown.locator('button')).toHaveCount(2);
  });

  test('Cycle filter filters issues by selected cycle', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Sprint 12: ENG-1,2,4,6,8 (5); No Cycle: ENG-3,5,7 (3)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Open Cycle filter and select Sprint 12
    await page.getByTestId('team-filter-btn-cycle').click();
    const sprint12Option = page.getByTestId('team-filter-dropdown-cycle').locator('button').filter({ hasText: /Sprint 12/ });
    await sprint12Option.click();

    // Only Sprint 12 issues: ENG-1,2,4,6,8
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(5, { timeout: 15000 });

    // Non-Sprint 12 issues should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-3$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-5$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-7$/ })).toHaveCount(0);
  });

  test('Multiple filters combine with AND logic', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // ENG-1: high, Bug, in_progress
    // ENG-4: high, Improvement, in_review
    // ENG-6: urgent, Bug, todo
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Select "High" in Priority filter
    await page.getByTestId('team-filter-btn-priority').click();
    await page.getByTestId('team-filter-option-priority-high').click();

    // Close priority dropdown by clicking the page title
    await page.getByTestId('team-issues-title').click();

    // Select "Bug" in Label filter
    await page.getByTestId('team-filter-btn-label').click();
    const bugOption = page.getByTestId('team-filter-dropdown-label').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    // Only ENG-1 matches both High priority AND Bug label
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);

    // ENG-4 (high, Improvement) and ENG-6 (urgent, Bug) should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-4$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(0);
  });

  test('Clearing a filter restores all issues', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Apply Status filter for "In Progress"
    await page.getByTestId('team-filter-btn-status').click();
    await page.getByTestId('team-filter-option-status-in_progress').click();

    // Only 2 issues visible (ENG-1, ENG-8)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });

    // Deselect "In Progress" to clear the filter
    await page.getByTestId('team-filter-option-status-in_progress').click();

    // All 8 issues should be restored
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 15000 });

    // Badge should be gone
    await expect(page.getByTestId('team-filter-badge-status')).toHaveCount(0);
  });

  test('Filter state shows active filter indicators', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Initially, no badges should be visible
    await expect(page.getByTestId('team-filter-badge-status')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-badge-priority')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-badge-assignee')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-badge-label')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-badge-project')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-badge-cycle')).toHaveCount(0);

    // Select "High" in Priority filter
    await page.getByTestId('team-filter-btn-priority').click();
    await page.getByTestId('team-filter-option-priority-high').click();

    // Priority filter button should show active indicator (badge with "1")
    await expect(page.getByTestId('team-filter-badge-priority')).toBeVisible();
    await expect(page.getByTestId('team-filter-badge-priority')).toHaveText('1');

    // Priority button should have active class
    await expect(page.getByTestId('team-filter-btn-priority')).toHaveClass(/team-filters-btn-active/);

    // Other filter buttons should remain inactive
    await expect(page.getByTestId('team-filter-badge-status')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-badge-label')).toHaveCount(0);
    await expect(page.getByTestId('team-filter-btn-status')).not.toHaveClass(/team-filters-btn-active/);
    await expect(page.getByTestId('team-filter-btn-label')).not.toHaveClass(/team-filters-btn-active/);
  });

  test('Filters can be used repeatedly after clearing', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Apply Priority filter for "High" (ENG-1, ENG-4 = 2 issues)
    await page.getByTestId('team-filter-btn-priority').click();
    await page.getByTestId('team-filter-option-priority-high').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });

    // Clear it
    await page.getByTestId('team-filter-option-priority-high').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 15000 });

    // Close priority dropdown
    await page.getByTestId('team-issues-title').click();

    // Apply Status filter for "Done" (ENG-5 = 1 issue)
    await page.getByTestId('team-filter-btn-status').click();
    await page.getByTestId('team-filter-option-status-done').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-5$/ })).toHaveCount(1);

    // Clear it
    await page.getByTestId('team-filter-option-status-done').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 15000 });

    // Close status dropdown
    await page.getByTestId('team-issues-title').click();

    // Apply Priority filter for "Urgent" (ENG-6 = 1 issue)
    await page.getByTestId('team-filter-btn-priority').click();
    await page.getByTestId('team-filter-option-priority-urgent').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(1);
  });

  test('Filters work correctly with grouping options', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Change grouping to Priority
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-priority').click();

    // Wait for regrouping
    await expect(page.getByTestId('team-issue-group-high')).toBeVisible({ timeout: 15000 });

    // Apply Assignee filter for Alice (ENG-1: high, ENG-6: urgent)
    await page.getByTestId('team-filter-btn-assignee').click();
    const aliceOption = page.getByTestId('team-filter-dropdown-assignee').locator('button').filter({ hasText: /Alice Johnson/ });
    await aliceOption.click();

    // Only Alice's issues should show, grouped by priority
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });

    // High group should have ENG-1, Urgent group should have ENG-6
    await expect(page.getByTestId('team-issue-group-high')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-urgent')).toBeVisible();

    // Empty priority groups should not be displayed
    await expect(page.getByTestId('team-issue-group-medium')).toHaveCount(0);
    await expect(page.getByTestId('team-issue-group-low')).toHaveCount(0);
    await expect(page.getByTestId('team-issue-group-none')).toHaveCount(0);
  });

  test('Filters persist while navigating within the page', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(8, { timeout: 30000 });

    // Apply Status filter for "In Progress"
    await page.getByTestId('team-filter-btn-status').click();
    await page.getByTestId('team-filter-option-status-in_progress').click();

    // Close dropdown
    await page.getByTestId('team-issues-title').click();

    // Verify filter is applied - 2 issues (ENG-1, ENG-8)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });

    // Click on an issue title to navigate to detail page
    const issueTitle = page.locator('[data-testid^="issue-title-"]').first();
    await issueTitle.click();

    // Wait for issue detail page to load
    await expect(page.locator('[data-testid="issue-detail-page"]')).toBeVisible({ timeout: 30000 });

    // Navigate back
    await page.goBack();

    // Verify we're back on team issues page
    await expect(page.getByTestId('team-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify filter is still applied - still showing only "In Progress" issues
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });

    // Verify filter badge is still showing
    await expect(page.getByTestId('team-filter-badge-status')).toBeVisible();
    await expect(page.getByTestId('team-filter-badge-status')).toHaveText('1');
  });
});
