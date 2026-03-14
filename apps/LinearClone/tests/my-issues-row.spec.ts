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

// Helper to get labels via API
async function getLabels(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/labels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.labels;
}

// Helper to get my issues via API
async function getMyIssues(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/my-issues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.issues;
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

test.describe('IssueRow', () => {
  test('Issue row displays all required fields', async ({ page, baseURL }) => {
    // Create an issue with all fields set via API
    const { token, user } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');

    // Get projects via team-issues
    const teamResponse = await fetch(`${baseURL}/api/team-issues?teamId=${engTeam.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const teamData = await teamResponse.json();
    const v2Project = teamData.projects?.find((p: { name: string }) => p.name === 'V2 Launch');

    const issueTitle = `All fields issue ${Date.now()}`;
    const createResult = await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: issueTitle,
      status: 'in_progress',
      priority: 'high',
      assigneeId: user.id,
      labelIds: [bugLabel.id],
      projectId: v2Project?.id || null,
      dueDate: '2026-03-20',
    });
    const createdIssue = createResult.issue;

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Find the created issue row
    const issueRow = page.getByTestId(`issue-row-${createdIssue.id}`);
    await expect(issueRow).toBeVisible({ timeout: 30000 });

    // Verify priority icon
    await expect(page.getByTestId(`issue-priority-${createdIssue.id}`)).toBeVisible();

    // Verify identifier
    await expect(page.getByTestId(`issue-identifier-${createdIssue.id}`)).toHaveText(createdIssue.identifier);

    // Verify title
    await expect(page.getByTestId(`issue-title-${createdIssue.id}`)).toHaveText(issueTitle);

    // Verify status button
    await expect(page.getByTestId(`issue-status-btn-${createdIssue.id}`)).toBeVisible();

    // Verify label badge
    await expect(page.getByTestId(`issue-labels-${createdIssue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-label-${createdIssue.id}-${bugLabel.id}`)).toContainText('Bug');

    // Verify assignee
    await expect(page.getByTestId(`issue-assignee-${createdIssue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-assignee-${createdIssue.id}`)).toHaveText('AJ');

    // Verify due date
    await expect(page.getByTestId(`issue-due-date-${createdIssue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-due-date-${createdIssue.id}`)).toHaveText('Mar 20');

    // Verify project name
    await expect(page.getByTestId(`issue-project-${createdIssue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-project-${createdIssue.id}`)).toHaveText('V2 Launch');
  });

  test('Issue row title is clickable and navigates to issue detail', async ({ page, baseURL }) => {
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Click the issue title
    await page.getByTestId(`issue-title-${eng1.id}`).click();

    // Verify navigation to issue detail page
    await expect(page).toHaveURL(new RegExp(`/issue/${eng1.id}`), { timeout: 30000 });
  });

  test('Issue row status icon is clickable to change status', async ({ page, baseURL }) => {
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    // Use ENG-6 which is 'todo' status
    const eng6 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Click the status icon
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();

    // Verify dropdown appears with all statuses
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('issue-status-option-backlog')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-todo')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-in_review')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-done')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-cancelled')).toBeVisible();
  });

  test('Changing status via issue row status dropdown persists', async ({ page, baseURL }) => {
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    const eng6 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify ENG-6 is in todo group initially
    const todoItems = page.getByTestId('issue-group-items-todo');
    await expect(todoItems).toBeVisible({ timeout: 30000 });
    await expect(todoItems.getByTestId(`issue-row-${eng6.id}`)).toBeVisible();

    // Open status dropdown and change to in_progress
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId('issue-status-option-in_progress').click();

    // Verify dropdown closed
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toHaveCount(0);

    // Verify the issue moved to in_progress group
    await expect(page.getByTestId('issue-group-items-in_progress').getByTestId(`issue-row-${eng6.id}`)).toBeVisible({ timeout: 30000 });

    // Verify persistence by reloading the page
    await page.reload();
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-group-items-in_progress').getByTestId(`issue-row-${eng6.id}`)).toBeVisible({ timeout: 30000 });
  });

  test('Issue row status change updates group membership', async ({ page, baseURL }) => {
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    const eng6 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Initial state: todo has 2, in_progress has 1
    await expect(page.getByTestId('issue-group-header-todo')).toContainText('(2)', { timeout: 30000 });
    await expect(page.getByTestId('issue-group-header-in_progress')).toContainText('(1)');

    // Change ENG-6 from todo to in_progress
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId('issue-status-option-in_progress').click();

    // Verify counts updated: todo has 1, in_progress has 2
    await expect(page.getByTestId('issue-group-header-todo')).toContainText('(1)');
    await expect(page.getByTestId('issue-group-header-in_progress')).toContainText('(2)');
  });

  test('Issue row status dropdown can be used multiple times', async ({ page, baseURL }) => {
    test.slow();

    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    const eng6 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-group-items-todo')).toBeVisible({ timeout: 30000 });

    // First status change: todo -> in_progress
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId('issue-status-option-in_progress').click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toHaveCount(0);

    // Verify issue is in in_progress group
    await expect(page.getByTestId('issue-group-items-in_progress').getByTestId(`issue-row-${eng6.id}`)).toBeVisible({ timeout: 30000 });

    // Second status change: in_progress -> done
    await page.getByTestId(`issue-status-btn-${eng6.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId('issue-status-option-done').click();
    await expect(page.getByTestId(`issue-status-dropdown-${eng6.id}`)).toHaveCount(0);

    // Verify issue is in done group
    await expect(page.getByTestId('issue-group-items-done').getByTestId(`issue-row-${eng6.id}`)).toBeVisible({ timeout: 30000 });
  });

  test('Issue row displays priority icon with correct color', async ({ page, baseURL }) => {
    // Alice has: ENG-6 (urgent), ENG-1 (high), DES-3 (low)
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    const urgentIssue = issues.find((i: { identifier: string }) => i.identifier === 'ENG-6');
    const highIssue = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');
    const lowIssue = issues.find((i: { identifier: string }) => i.identifier === 'DES-3');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Verify priority icons are present with correct titles
    await expect(page.getByTestId(`issue-priority-${urgentIssue.id}`)).toHaveAttribute('title', 'Urgent');
    await expect(page.getByTestId(`issue-priority-${highIssue.id}`)).toHaveAttribute('title', 'High');
    await expect(page.getByTestId(`issue-priority-${lowIssue.id}`)).toHaveAttribute('title', 'Low');

    // Verify each priority icon contains an SVG
    await expect(page.getByTestId(`issue-priority-${urgentIssue.id}`).locator('svg')).toBeVisible();
    await expect(page.getByTestId(`issue-priority-${highIssue.id}`).locator('svg')).toBeVisible();
    await expect(page.getByTestId(`issue-priority-${lowIssue.id}`).locator('svg')).toBeVisible();
  });

  test('Issue row displays labels as colored badges', async ({ page, baseURL }) => {
    // Create an issue with two labels
    const { token, user } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const labels = await getLabels(baseURL!, token);
    const bugLabel = labels.find((l: { name: string }) => l.name === 'Bug');
    const featureLabel = labels.find((l: { name: string }) => l.name === 'Feature');

    const createResult = await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: `Multi-label issue ${Date.now()}`,
      status: 'todo',
      priority: 'medium',
      assigneeId: user.id,
      labelIds: [bugLabel.id, featureLabel.id],
    });
    const issue = createResult.issue;

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify both label badges are shown
    await expect(page.getByTestId(`issue-labels-${issue.id}`)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`issue-label-${issue.id}-${bugLabel.id}`)).toContainText('Bug');
    await expect(page.getByTestId(`issue-label-${issue.id}-${featureLabel.id}`)).toContainText('Feature');
  });

  test('Issue row shows assignee avatar', async ({ page, baseURL }) => {
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    // ENG-1 is assigned to Alice Johnson
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify assignee avatar shows initials "AJ" for Alice Johnson
    await expect(page.getByTestId(`issue-assignee-${eng1.id}`)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`issue-assignee-${eng1.id}`)).toHaveText('AJ');
    await expect(page.getByTestId(`issue-assignee-${eng1.id}`)).toHaveAttribute('title', 'Alice Johnson');
  });

  test('Issue row shows due date', async ({ page, baseURL }) => {
    // Create an issue with a due date
    const { token, user } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    const createResult = await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: `Due date issue ${Date.now()}`,
      status: 'todo',
      priority: 'medium',
      assigneeId: user.id,
      dueDate: '2026-03-20',
    });
    const issue = createResult.issue;

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify due date is displayed
    await expect(page.getByTestId(`issue-due-date-${issue.id}`)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`issue-due-date-${issue.id}`)).toHaveText('Mar 20');
  });

  test('Issue row shows project name when assigned', async ({ page, baseURL }) => {
    const { token } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const issues = await getMyIssues(baseURL!, token);
    // ENG-1 is assigned to V2 Launch project
    const eng1 = issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify project name is displayed
    await expect(page.getByTestId(`issue-project-${eng1.id}`)).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`issue-project-${eng1.id}`)).toHaveText('V2 Launch');
  });

  test('Issue row hides optional fields when not set', async ({ page, baseURL }) => {
    // Create an issue with minimal fields (no labels, no due date, no project)
    const { token, user } = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    const createResult = await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: `Minimal issue ${Date.now()}`,
      status: 'backlog',
      priority: 'none',
      assigneeId: user.id,
    });
    const issue = createResult.issue;

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify the issue row exists
    await expect(page.getByTestId(`issue-row-${issue.id}`)).toBeVisible({ timeout: 30000 });

    // Verify required fields are present
    await expect(page.getByTestId(`issue-priority-${issue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-identifier-${issue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-title-${issue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-status-btn-${issue.id}`)).toBeVisible();
    await expect(page.getByTestId(`issue-assignee-${issue.id}`)).toBeVisible();

    // Verify optional fields are NOT shown
    await expect(page.getByTestId(`issue-labels-${issue.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`issue-due-date-${issue.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`issue-project-${issue.id}`)).toHaveCount(0);
  });
});
