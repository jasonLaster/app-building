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

test.describe('GroupBySort - Group By', () => {
  test('Group by control renders with default "Status" selected', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify group-by-sort container is visible
    await expect(page.getByTestId('group-by-sort')).toBeVisible({ timeout: 30000 });

    // Verify group by button is visible and shows "Status" as default
    const groupByBtn = page.getByTestId('group-by-btn');
    await expect(groupByBtn).toBeVisible();
    await expect(groupByBtn).toContainText('Group');
    await expect(groupByBtn).toContainText('Status');
  });

  test('Group by dropdown shows all grouping options', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the group by button to open dropdown
    await page.getByTestId('group-by-btn').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('group-by-dropdown')).toBeVisible();

    // Verify all options are present and clickable
    await expect(page.getByTestId('group-by-option-status')).toBeVisible();
    await expect(page.getByTestId('group-by-option-status')).toContainText('Status');

    await expect(page.getByTestId('group-by-option-priority')).toBeVisible();
    await expect(page.getByTestId('group-by-option-priority')).toContainText('Priority');

    await expect(page.getByTestId('group-by-option-assignee')).toBeVisible();
    await expect(page.getByTestId('group-by-option-assignee')).toContainText('Assignee');

    await expect(page.getByTestId('group-by-option-project')).toBeVisible();
    await expect(page.getByTestId('group-by-option-project')).toContainText('Project');

    await expect(page.getByTestId('group-by-option-label')).toBeVisible();
    await expect(page.getByTestId('group-by-option-label')).toContainText('Label');

    await expect(page.getByTestId('group-by-option-none')).toBeVisible();
    await expect(page.getByTestId('group-by-option-none')).toContainText('None');
  });

  test('Group by Priority groups issues under priority headers', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Select Priority from group by dropdown
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-priority').click();

    // Verify button now shows Priority
    await expect(page.getByTestId('group-by-btn')).toContainText('Priority');

    // Seed data priorities for ENG:
    // urgent: ENG-6 (1)
    // high: ENG-1, ENG-4 (2)
    // medium: ENG-2, ENG-5, ENG-8 (3)
    // low: ENG-3 (1)
    // none: ENG-7 (1)

    // Verify Urgent group
    await expect(page.getByTestId('team-issue-group-urgent')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-issue-group-header-urgent')).toContainText('Urgent');
    await expect(page.getByTestId('team-issue-group-header-urgent')).toContainText('(1)');

    // Verify High group
    await expect(page.getByTestId('team-issue-group-high')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-high')).toContainText('High');
    await expect(page.getByTestId('team-issue-group-header-high')).toContainText('(2)');

    // Verify Medium group
    await expect(page.getByTestId('team-issue-group-medium')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-medium')).toContainText('Medium');
    await expect(page.getByTestId('team-issue-group-header-medium')).toContainText('(3)');

    // Verify Low group
    await expect(page.getByTestId('team-issue-group-low')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-low')).toContainText('Low');
    await expect(page.getByTestId('team-issue-group-header-low')).toContainText('(1)');

    // Verify No Priority group
    await expect(page.getByTestId('team-issue-group-none')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-none')).toContainText('No Priority');
    await expect(page.getByTestId('team-issue-group-header-none')).toContainText('(1)');

    // Verify ordering: urgent < high < medium < low < none
    const urgentBox = await page.getByTestId('team-issue-group-urgent').boundingBox();
    const highBox = await page.getByTestId('team-issue-group-high').boundingBox();
    const mediumBox = await page.getByTestId('team-issue-group-medium').boundingBox();
    const lowBox = await page.getByTestId('team-issue-group-low').boundingBox();
    const noneBox = await page.getByTestId('team-issue-group-none').boundingBox();
    expect(urgentBox!.y).toBeLessThan(highBox!.y);
    expect(highBox!.y).toBeLessThan(mediumBox!.y);
    expect(mediumBox!.y).toBeLessThan(lowBox!.y);
    expect(lowBox!.y).toBeLessThan(noneBox!.y);
  });

  test('Group by Assignee groups issues under assignee headers', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Select Assignee from group by dropdown
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-assignee').click();

    // Verify button now shows Assignee
    await expect(page.getByTestId('group-by-btn')).toContainText('Assignee');

    // Seed data assignees for ENG:
    // Alice: ENG-1, ENG-6 (2)
    // Bob: ENG-2, ENG-5, ENG-8 (3)
    // Carol: ENG-4 (1)
    // Unassigned: ENG-3, ENG-7 (2)

    // Wait for groups to render
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Verify assignee groups exist with correct counts
    // Find groups by their header text content
    const groupHeaders = page.locator('[data-testid^="team-issue-group-header-"]');
    await expect(groupHeaders).toHaveCount(4, { timeout: 30000 });

    // Verify Alice group
    const aliceHeader = groupHeaders.filter({ hasText: /Alice Johnson/ });
    await expect(aliceHeader).toBeVisible();
    await expect(aliceHeader).toContainText('(2)');

    // Verify Bob group
    const bobHeader = groupHeaders.filter({ hasText: /Bob Smith/ });
    await expect(bobHeader).toBeVisible();
    await expect(bobHeader).toContainText('(3)');

    // Verify Carol group
    const carolHeader = groupHeaders.filter({ hasText: /Carol Davis/ });
    await expect(carolHeader).toBeVisible();
    await expect(carolHeader).toContainText('(1)');

    // Verify Unassigned group
    await expect(page.getByTestId('team-issue-group-header-unassigned')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-unassigned')).toContainText('Unassigned');
    await expect(page.getByTestId('team-issue-group-header-unassigned')).toContainText('(2)');
  });

  test('Group by Project groups issues under project headers', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Select Project from group by dropdown
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-project').click();

    // Verify button now shows Project
    await expect(page.getByTestId('group-by-btn')).toContainText('Project');

    // Seed data projects for ENG:
    // V2 Launch: ENG-1, ENG-2, ENG-3, ENG-4, ENG-6, ENG-8 (6)
    // No Project: ENG-5, ENG-7 (2)

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const groupHeaders = page.locator('[data-testid^="team-issue-group-header-"]');
    await expect(groupHeaders).toHaveCount(2, { timeout: 30000 });

    // Verify V2 Launch group
    const v2Header = groupHeaders.filter({ hasText: /V2 Launch/ });
    await expect(v2Header).toBeVisible();
    await expect(v2Header).toContainText('(6)');

    // Verify No Project group
    await expect(page.getByTestId('team-issue-group-header-none')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-header-none')).toContainText('No Project');
    await expect(page.getByTestId('team-issue-group-header-none')).toContainText('(2)');
  });

  test('Group by Label groups issues under label headers', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Select Label from group by dropdown
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-label').click();

    // Verify button now shows Label
    await expect(page.getByTestId('group-by-btn')).toContainText('Label');

    // Seed data labels for ENG:
    // Bug: ENG-1, ENG-6 (2)
    // Feature: ENG-2, ENG-3, ENG-8 (3)
    // Improvement: ENG-4, ENG-7 (2)
    // Documentation: ENG-5 (1)

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const groupHeaders = page.locator('[data-testid^="team-issue-group-header-"]');
    await expect(groupHeaders).toHaveCount(4, { timeout: 30000 });

    // Verify Bug group
    const bugHeader = groupHeaders.filter({ hasText: /Bug/ });
    await expect(bugHeader).toBeVisible();
    await expect(bugHeader).toContainText('(2)');

    // Verify Feature group
    const featureHeader = groupHeaders.filter({ hasText: /Feature/ });
    await expect(featureHeader).toBeVisible();
    await expect(featureHeader).toContainText('(3)');

    // Verify Improvement group
    const improvementHeader = groupHeaders.filter({ hasText: /Improvement/ });
    await expect(improvementHeader).toBeVisible();
    await expect(improvementHeader).toContainText('(2)');

    // Verify Documentation group
    const docHeader = groupHeaders.filter({ hasText: /Documentation/ });
    await expect(docHeader).toBeVisible();
    await expect(docHeader).toContainText('(1)');
  });

  test('Group by None shows a flat list', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Select None from group by dropdown
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-none').click();

    // Verify button now shows None
    await expect(page.getByTestId('group-by-btn')).toContainText('None');

    // Verify issues list is visible
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Verify no group headers are present
    const groupHeaders = page.locator('[data-testid^="team-issue-group-header-"]');
    await expect(groupHeaders).toHaveCount(0);

    // Verify all 8 ENG issues are displayed in a flat list
    const issueRows = page.locator('[data-testid^="issue-row-"]');
    await expect(issueRows).toHaveCount(8, { timeout: 30000 });
  });

  test('Switching group by option re-renders immediately', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify default Status grouping
    await expect(page.getByTestId('team-issue-group-backlog')).toBeVisible({ timeout: 30000 });

    // Switch to Priority grouping
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-priority').click();

    // Verify priority groups appear without page reload
    await expect(page.getByTestId('team-issue-group-urgent')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-issue-group-high')).toBeVisible();

    // Verify status groups are gone
    await expect(page.getByTestId('team-issue-group-backlog')).toHaveCount(0);
    await expect(page.getByTestId('team-issue-group-todo')).toHaveCount(0);
  });

  test('Group by can be changed multiple times', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify default Status grouping
    await expect(page.getByTestId('team-issue-group-backlog')).toBeVisible({ timeout: 30000 });

    // Change to Priority
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-priority').click();
    await expect(page.getByTestId('team-issue-group-urgent')).toBeVisible({ timeout: 30000 });

    // Change to Assignee
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-assignee').click();
    await expect(page.getByTestId('team-issue-group-header-unassigned')).toBeVisible({ timeout: 30000 });

    // Change back to Status
    await page.getByTestId('group-by-btn').click();
    await page.getByTestId('group-by-option-status').click();

    // Verify original Status grouping is restored
    await expect(page.getByTestId('team-issue-group-backlog')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-issue-group-header-backlog')).toContainText('Backlog');
    await expect(page.getByTestId('team-issue-group-header-backlog')).toContainText('(2)');
    await expect(page.getByTestId('team-issue-group-todo')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-in_progress')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-in_review')).toBeVisible();
    await expect(page.getByTestId('team-issue-group-done')).toBeVisible();
  });
});
