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

test.describe('BulkActions', () => {
  test('Issue row checkboxes are visible and unchecked by default', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Get all issues to verify checkboxes
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    expect(issues.length).toBeGreaterThanOrEqual(5);

    // Verify each issue row has a checkbox that is unchecked
    for (const issue of issues.slice(0, 5)) {
      const checkbox = page.getByTestId(`issue-checkbox-${issue.id}`).locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('Clicking a checkbox selects an issue', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const targetIssue = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Click the checkbox
    await page.getByTestId(`issue-checkbox-${targetIssue.id}`).click();

    // Verify checkbox is checked
    const checkbox = page.getByTestId(`issue-checkbox-${targetIssue.id}`).locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();

    // Verify the row has selected style
    const row = page.getByTestId(`issue-row-${targetIssue.id}`);
    await expect(row).toHaveClass(/issue-row-selected/);

    // Verify bulk action toolbar appears
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();
  });

  test('Clicking a checked checkbox deselects the issue', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const targetIssue = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Select the issue first
    await page.getByTestId(`issue-checkbox-${targetIssue.id}`).click();
    const checkbox = page.getByTestId(`issue-checkbox-${targetIssue.id}`).locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

    // Uncheck the issue
    await page.getByTestId(`issue-checkbox-${targetIssue.id}`).click();

    // Verify checkbox is unchecked
    await expect(checkbox).not.toBeChecked();

    // Verify selected style is removed
    const row = page.getByTestId(`issue-row-${targetIssue.id}`);
    await expect(row).not.toHaveClass(/issue-row-selected/);

    // Verify bulk action toolbar disappears (no other issues selected)
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0);
  });

  test('Multiple issues can be selected via checkboxes', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const issue1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');
    const issue2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');
    const issue3 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-3');

    // Select issue1 and issue3
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();
    await page.getByTestId(`issue-checkbox-${issue3.id}`).click();

    // Verify issue1 and issue3 are checked
    await expect(page.getByTestId(`issue-checkbox-${issue1.id}`).locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.getByTestId(`issue-checkbox-${issue3.id}`).locator('input[type="checkbox"]')).toBeChecked();

    // Verify issue2 is NOT checked
    await expect(page.getByTestId(`issue-checkbox-${issue2.id}`).locator('input[type="checkbox"]')).not.toBeChecked();

    // Verify both selected rows have selected style
    await expect(page.getByTestId(`issue-row-${issue1.id}`)).toHaveClass(/issue-row-selected/);
    await expect(page.getByTestId(`issue-row-${issue3.id}`)).toHaveClass(/issue-row-selected/);

    // Verify toolbar shows "2 selected"
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');
  });

  test('Bulk action toolbar appears when issues are selected', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Verify no toolbar initially
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0);

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const targetIssue = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Select one issue
    await page.getByTestId(`issue-checkbox-${targetIssue.id}`).click();

    // Verify toolbar appears with count and action buttons
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('1 selected');
    await expect(page.getByTestId('bulk-action-status')).toBeVisible();
    await expect(page.getByTestId('bulk-action-priority')).toBeVisible();
    await expect(page.getByTestId('bulk-action-assignee')).toBeVisible();
    await expect(page.getByTestId('bulk-action-label')).toBeVisible();
  });

  test('Bulk action toolbar disappears when all issues are deselected', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const targetIssue = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Select an issue
    await page.getByTestId(`issue-checkbox-${targetIssue.id}`).click();
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

    // Deselect the issue
    await page.getByTestId(`issue-checkbox-${targetIssue.id}`).click();

    // Verify toolbar disappears
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0);

    // Verify no action buttons visible
    await expect(page.getByTestId('bulk-action-status')).toHaveCount(0);
    await expect(page.getByTestId('bulk-action-priority')).toHaveCount(0);
    await expect(page.getByTestId('bulk-action-assignee')).toHaveCount(0);
    await expect(page.getByTestId('bulk-action-label')).toHaveCount(0);
  });

  test('Bulk status change updates all selected issues', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    // ENG-2 is todo, ENG-3 is backlog
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');
    const eng3 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-3');

    // Select both issues
    await page.getByTestId(`issue-checkbox-${eng2.id}`).click();
    await page.getByTestId(`issue-checkbox-${eng3.id}`).click();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');

    // Click Status action and select "In Progress"
    await page.getByTestId('bulk-action-status').click();
    await expect(page.getByTestId('bulk-action-status-dropdown')).toBeVisible();
    await page.getByTestId('bulk-status-option-in_progress').click();

    // Verify toolbar disappears (selection cleared)
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0, { timeout: 30000 });

    // Verify both issues moved to In Progress group
    const inProgressItems = page.getByTestId('team-issue-group-items-in_progress');
    await expect(inProgressItems.locator(`[data-testid="issue-identifier-${eng2.id}"]`)).toBeVisible({ timeout: 30000 });
    await expect(inProgressItems.locator(`[data-testid="issue-identifier-${eng3.id}"]`)).toBeVisible({ timeout: 30000 });
  });

  test('Bulk priority change updates all selected issues', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    // ENG-2 is medium priority, ENG-3 is low priority
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');
    const eng3 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-3');

    // Select both issues
    await page.getByTestId(`issue-checkbox-${eng2.id}`).click();
    await page.getByTestId(`issue-checkbox-${eng3.id}`).click();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');

    // Click Priority action and select "High"
    await page.getByTestId('bulk-action-priority').click();
    await expect(page.getByTestId('bulk-action-priority-dropdown')).toBeVisible();
    await page.getByTestId('bulk-priority-option-high').click();

    // Verify toolbar disappears (selection cleared)
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0, { timeout: 30000 });

    // Verify both issues now show High priority after data refetch
    await expect(page.getByTestId(`issue-priority-${eng2.id}`)).toHaveAttribute('title', 'High', { timeout: 30000 });
    await expect(page.getByTestId(`issue-priority-${eng3.id}`)).toHaveAttribute('title', 'High', { timeout: 30000 });
  });

  test('Bulk assignee change updates all selected issues', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    // ENG-1 is assigned to Alice, ENG-3 is unassigned
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');
    const eng3 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-3');

    // Get Bob's member info from the team issues API response
    const teamData = await (await fetch(`${baseURL}/api/team-issues?teamId=${engTeam.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })).json();
    const bob = teamData.members.find((m: { name: string }) => m.name === 'Bob Smith');

    // Select both issues
    await page.getByTestId(`issue-checkbox-${eng1.id}`).click();
    await page.getByTestId(`issue-checkbox-${eng3.id}`).click();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');

    // Click Assignee action and select "Bob"
    await page.getByTestId('bulk-action-assignee').click();
    await expect(page.getByTestId('bulk-action-assignee-dropdown')).toBeVisible();
    await page.getByTestId(`bulk-assignee-option-${bob.id}`).click();

    // Verify toolbar disappears (selection cleared)
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0, { timeout: 30000 });

    // Verify both issues now show Bob's initials (BS)
    await expect(page.getByTestId(`issue-assignee-${eng1.id}`)).toContainText('BS', { timeout: 30000 });
    await expect(page.getByTestId(`issue-assignee-${eng3.id}`)).toContainText('BS', { timeout: 30000 });
  });

  test('Bulk label change updates all selected issues', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    // ENG-7 has Improvement label, ENG-1 has Bug label
    const eng7 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-7');
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Get the Feature label ID
    const labels = await getLabels(baseURL!, token);
    const featureLabel = labels.find((l: { name: string }) => l.name === 'Feature');

    // Select both issues
    await page.getByTestId(`issue-checkbox-${eng7.id}`).click();
    await page.getByTestId(`issue-checkbox-${eng1.id}`).click();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');

    // Click Label action and select "Feature"
    await page.getByTestId('bulk-action-label').click();
    await expect(page.getByTestId('bulk-action-label-dropdown')).toBeVisible();
    await page.getByTestId(`bulk-label-option-${featureLabel.id}`).click();

    // Verify toolbar disappears (selection cleared)
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0, { timeout: 30000 });

    // Verify both issues now have the Feature label
    await expect(page.getByTestId(`issue-label-${eng7.id}-${featureLabel.id}`)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`issue-label-${eng1.id}-${featureLabel.id}`)).toBeVisible({ timeout: 30000 });

    // ENG-1 should still have its Bug label too
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    await expect(page.getByTestId(`issue-label-${eng1.id}-${bugLabel.id}`)).toBeVisible();
  });

  test('Bulk actions can be performed multiple times in sequence', async ({ page, baseURL }) => {
    test.slow();
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');
    const eng3 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-3');
    const eng4 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-4');
    const eng5 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-5');

    // First bulk action: select ENG-2 and ENG-3, change status to In Progress
    await page.getByTestId(`issue-checkbox-${eng2.id}`).click();
    await page.getByTestId(`issue-checkbox-${eng3.id}`).click();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');

    await page.getByTestId('bulk-action-status').click();
    await expect(page.getByTestId('bulk-action-status-dropdown')).toBeVisible();
    await page.getByTestId('bulk-status-option-in_progress').click();

    // Verify toolbar disappears after first bulk action
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0, { timeout: 30000 });

    // Verify first pair is in In Progress
    const inProgressItems = page.getByTestId('team-issue-group-items-in_progress');
    await expect(inProgressItems.locator(`[data-testid="issue-identifier-${eng2.id}"]`)).toBeVisible({ timeout: 30000 });
    await expect(inProgressItems.locator(`[data-testid="issue-identifier-${eng3.id}"]`)).toBeVisible({ timeout: 30000 });

    // Second bulk action: select ENG-4 and ENG-5, change priority to High
    await page.getByTestId(`issue-checkbox-${eng4.id}`).click();
    await page.getByTestId(`issue-checkbox-${eng5.id}`).click();
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();
    await expect(page.getByTestId('bulk-actions-count')).toContainText('2 selected');

    await page.getByTestId('bulk-action-priority').click();
    await expect(page.getByTestId('bulk-action-priority-dropdown')).toBeVisible();
    await page.getByTestId('bulk-priority-option-high').click();

    // Verify toolbar disappears after second bulk action
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0, { timeout: 30000 });

    // Verify second pair has High priority
    await expect(page.getByTestId(`issue-priority-${eng4.id}`)).toHaveAttribute('title', 'High', { timeout: 30000 });
    await expect(page.getByTestId(`issue-priority-${eng5.id}`)).toHaveAttribute('title', 'High', { timeout: 30000 });
  });

  test('Select all checkbox in group header selects all issues in that group', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Backlog group has ENG-3 and ENG-7 (2 issues)
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const backlogIssues = issues.filter((i: { status: string }) => i.status === 'backlog');
    const backlogCount = backlogIssues.length;

    // Click the group select checkbox in the backlog header
    await page.getByTestId('team-issue-group-select-backlog').click();

    // Verify all backlog issues are checked
    for (const issue of backlogIssues) {
      const checkbox = page.getByTestId(`issue-checkbox-${issue.id}`).locator('input[type="checkbox"]');
      await expect(checkbox).toBeChecked();
      await expect(page.getByTestId(`issue-row-${issue.id}`)).toHaveClass(/issue-row-selected/);
    }

    // Verify toolbar shows correct count
    await expect(page.getByTestId('bulk-actions-count')).toContainText(`${backlogCount} selected`);

    // Verify issues in other groups are NOT selected
    const nonBacklogIssues = issues.filter((i: { status: string }) => i.status !== 'backlog');
    for (const issue of nonBacklogIssues) {
      const checkbox = page.getByTestId(`issue-checkbox-${issue.id}`).locator('input[type="checkbox"]');
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('Deselect all via group header checkbox', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const backlogIssues = issues.filter((i: { status: string }) => i.status === 'backlog');

    // Select all via group header
    await page.getByTestId('team-issue-group-select-backlog').click();

    // Verify all are selected
    for (const issue of backlogIssues) {
      await expect(page.getByTestId(`issue-checkbox-${issue.id}`).locator('input[type="checkbox"]')).toBeChecked();
    }
    await expect(page.getByTestId('bulk-actions-toolbar')).toBeVisible();

    // Deselect all via group header
    await page.getByTestId('team-issue-group-select-backlog').click();

    // Verify all backlog issues are deselected
    for (const issue of backlogIssues) {
      const checkbox = page.getByTestId(`issue-checkbox-${issue.id}`).locator('input[type="checkbox"]');
      await expect(checkbox).not.toBeChecked();
    }

    // Verify toolbar disappears
    await expect(page.getByTestId('bulk-actions-toolbar')).toHaveCount(0);
  });
});
