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

test.describe('TeamIssuesRow', () => {
  test('Issue row displays all required fields including checkbox and team prefix', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    // Wait for issues to load
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Get the ENG-1 issue (in_progress, high priority, assigned to Alice, Bug label)
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Verify issue row exists
    const row = page.getByTestId(`issue-row-${eng1.id}`);
    await expect(row).toBeVisible();

    // Verify checkbox is present
    await expect(page.getByTestId(`issue-checkbox-${eng1.id}`)).toBeVisible();

    // Verify priority icon is present
    await expect(page.getByTestId(`issue-priority-${eng1.id}`)).toBeVisible();

    // Verify identifier with team prefix
    await expect(page.getByTestId(`issue-identifier-${eng1.id}`)).toHaveText('ENG-1');

    // Verify title
    await expect(page.getByTestId(`issue-title-${eng1.id}`)).toContainText('Fix login session expiration bug');

    // Verify status button is present
    await expect(page.getByTestId(`issue-status-btn-${eng1.id}`)).toBeVisible();

    // Verify label badge (Bug label)
    await expect(page.getByTestId(`issue-labels-${eng1.id}`)).toBeVisible();

    // Verify assignee avatar (Alice Johnson → AJ)
    await expect(page.getByTestId(`issue-assignee-${eng1.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-assignee-${eng1.id}`)).toContainText('AJ');
  });

  test('Issue row title is clickable and navigates to issue detail', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Get ENG-1 issue ID
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    // Click the title
    await page.getByTestId(`issue-title-${eng1.id}`).click();

    // Verify navigation to issue detail page
    await expect(page).toHaveURL(`/issue/${eng1.id}`, { timeout: 30000 });
  });

  test('Issue row status icon is clickable to change status', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Find a todo issue (ENG-2)
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');

    // Click the status icon
    await page.getByTestId(`issue-status-btn-${eng2.id}`).click();

    // Verify dropdown appears with all status options
    await expect(page.getByTestId(`issue-status-dropdown-${eng2.id}`)).toBeVisible();
    await expect(page.getByTestId('issue-status-option-backlog')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-todo')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-in_review')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-done')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-cancelled')).toBeVisible();
  });

  test('Changing status via issue row status dropdown persists and moves issue between groups', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Find ENG-2 (currently todo)
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');

    // Verify initial todo group has 2 issues, in_progress has 2
    await expect(page.getByTestId('team-issue-group-header-todo')).toContainText('(2)');
    await expect(page.getByTestId('team-issue-group-header-in_progress')).toContainText('(2)');

    // Click status icon on ENG-2
    await page.getByTestId(`issue-status-btn-${eng2.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng2.id}`)).toBeVisible();

    // Select "In Progress"
    await page.getByTestId('issue-status-option-in_progress').click();

    // Dropdown should close
    await expect(page.getByTestId(`issue-status-dropdown-${eng2.id}`)).toHaveCount(0);

    // Verify group counts updated: todo should now have 1, in_progress should have 3
    await expect(page.getByTestId('team-issue-group-header-todo')).toContainText('(1)', { timeout: 30000 });
    await expect(page.getByTestId('team-issue-group-header-in_progress')).toContainText('(3)');

    // Verify the issue moved to in_progress group
    const inProgressItems = page.getByTestId('team-issue-group-items-in_progress');
    await expect(inProgressItems.locator(`[data-testid="issue-identifier-${eng2.id}"]`)).toBeVisible();
  });

  test('Issue row status dropdown can be used multiple times', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Find ENG-6 (currently todo)
    const issues = await getTeamIssues(baseURL!, token, engTeam.id);
    const eng6 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');

    // First change: todo → in_progress
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible();
    await page.getByTestId('issue-status-option-in_progress').click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toHaveCount(0);

    // Verify ENG-6 is now in in_progress group
    await expect(
      page.getByTestId('team-issue-group-items-in_progress')
        .locator(`[data-testid="issue-identifier-${eng6.id}"]`)
    ).toBeVisible({ timeout: 30000 });

    // Second change: in_progress → done
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible();
    await page.getByTestId('issue-status-option-done').click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toHaveCount(0);

    // Verify ENG-6 is now in done group
    await expect(
      page.getByTestId('team-issue-group-items-done')
        .locator(`[data-testid="issue-identifier-${eng6.id}"]`)
    ).toBeVisible({ timeout: 30000 });
  });

  test('Issue row displays priority icon with correct color', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);

    // ENG-6 is urgent priority
    const eng6 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');
    const urgentPriority = page.getByTestId(`issue-priority-${eng6.id}`);
    await expect(urgentPriority).toBeVisible();
    await expect(urgentPriority).toHaveAttribute('title', 'Urgent');

    // ENG-1 is high priority
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');
    const highPriority = page.getByTestId(`issue-priority-${eng1.id}`);
    await expect(highPriority).toBeVisible();
    await expect(highPriority).toHaveAttribute('title', 'High');

    // ENG-2 is medium priority
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');
    const mediumPriority = page.getByTestId(`issue-priority-${eng2.id}`);
    await expect(mediumPriority).toBeVisible();
    await expect(mediumPriority).toHaveAttribute('title', 'Medium');

    // ENG-3 is low priority
    const eng3 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-3');
    const lowPriority = page.getByTestId(`issue-priority-${eng3.id}`);
    await expect(lowPriority).toBeVisible();
    await expect(lowPriority).toHaveAttribute('title', 'Low');

    // ENG-7 is no priority
    const eng7 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-7');
    const nonePriority = page.getByTestId(`issue-priority-${eng7.id}`);
    await expect(nonePriority).toBeVisible();
    await expect(nonePriority).toHaveAttribute('title', 'No Priority');
  });

  test('Issue row displays labels as colored badges', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);

    // ENG-1 has "Bug" label (red)
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');
    const labelsContainer = page.getByTestId(`issue-labels-${eng1.id}`);
    await expect(labelsContainer).toBeVisible();

    // Find the Bug label badge
    const bugLabel = eng1.labels.find((l: { name: string }) => l.name === 'Bug');
    const labelBadge = page.getByTestId(`issue-label-${eng1.id}-${bugLabel.id}`);
    await expect(labelBadge).toBeVisible();
    await expect(labelBadge).toContainText('Bug');
  });

  test('Issue row shows assignee avatar', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);

    // ENG-1 is assigned to Alice Johnson → initials AJ
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');
    const assignee = page.getByTestId(`issue-assignee-${eng1.id}`);
    await expect(assignee).toBeVisible();
    await expect(assignee).toContainText('AJ');
    await expect(assignee).toHaveAttribute('title', 'Alice Johnson');

    // ENG-2 is assigned to Bob Smith → initials BS
    const eng2 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-2');
    const bobAssignee = page.getByTestId(`issue-assignee-${eng2.id}`);
    await expect(bobAssignee).toBeVisible();
    await expect(bobAssignee).toContainText('BS');
  });

  test('Issue row hides optional fields when not set', async ({ page, baseURL }) => {
    const { token, engTeam } = await loginAndNavigateToTeamIssues(page, baseURL!);

    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    const issues = await getTeamIssues(baseURL!, token, engTeam.id);

    // ENG-7: no assignee, no due date, no project (has label Improvement though)
    const eng7 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-7');

    // Required fields should be present
    await expect(page.getByTestId(`issue-identifier-${eng7.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-title-${eng7.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-priority-${eng7.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-status-btn-${eng7.id}`)).toBeVisible();

    // No assignee → assignee element should not exist
    await expect(page.getByTestId(`issue-assignee-${eng7.id}`)).toHaveCount(0);

    // No due date → due date element should not exist
    await expect(page.getByTestId(`issue-due-date-${eng7.id}`)).toHaveCount(0);

    // No project → project element should not exist
    await expect(page.getByTestId(`issue-project-${eng7.id}`)).toHaveCount(0);
  });
});
