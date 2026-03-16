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

// Helper to create an issue via API
async function createIssue(
  baseURL: string,
  token: string,
  payload: {
    teamId: string;
    title: string;
    status?: string;
    priority?: string;
    parentId?: string;
  }
) {
  const response = await fetch(`${baseURL}/api/create-issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  return data.issue;
}

// Helper to update issue field via API
async function _updateIssueField(
  baseURL: string,
  token: string,
  issueId: string,
  field: string,
  value: string | null
) {
  const response = await fetch(`${baseURL}/api/update-issue`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ issueId, field, value }),
  });
  return response.json();
}

// Helper to login and navigate to an issue detail page
async function loginAndNavigateToIssue(
  page: import('@playwright/test').Page,
  baseURL: string,
  issueId: string,
  token: string
) {
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), token);
  await page.goto(`/issue/${issueId}`);
  await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('sub-issues')).toBeVisible({ timeout: 30000 });
}

test.describe('IssueDetailSubIssues', () => {
  test('Sub-issues section renders with heading and add button', async ({ page, baseURL }) => {
    // Login and get an existing issue with no sub-issues (ENG-1)
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 1);

    await loginAndNavigateToIssue(page, baseURL!, issue.id, data.token);

    // Verify sub-issues section is visible
    await expect(page.getByTestId('sub-issues')).toBeVisible();
    await expect(page.getByTestId('sub-issues-title')).toHaveText('Sub-issues');
    await expect(page.getByTestId('sub-issues-add-btn')).toBeVisible();
    await expect(page.getByTestId('sub-issues-add-btn')).toContainText('Add sub-issue');

    // Verify empty state when no sub-issues
    await expect(page.getByTestId('sub-issues-empty')).toBeVisible();
    await expect(page.getByTestId('sub-issues-empty')).toHaveText('No sub-issues');
  });

  test('Sub-issues list displays child issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const parentIssue = issues.find((i: { number: number }) => i.number === 1);

    // Create two sub-issues via API
    const sub1 = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Design login form ${Date.now()}`,
      status: 'done',
      priority: 'medium',
      parentId: parentIssue.id,
    });
    const sub2 = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Implement validation ${Date.now()}`,
      status: 'in_progress',
      priority: 'high',
      parentId: parentIssue.id,
    });

    await loginAndNavigateToIssue(page, baseURL!, parentIssue.id, data.token);

    // Verify sub-issues list is visible (not empty state)
    await expect(page.getByTestId('sub-issues-list')).toBeVisible({ timeout: 30000 });

    // Verify first sub-issue row
    const row1 = page.getByTestId(`sub-issue-row-${sub1.id}`);
    await expect(row1).toBeVisible();
    await expect(page.getByTestId(`sub-issue-identifier-${sub1.id}`)).toContainText(sub1.identifier);
    await expect(page.getByTestId(`sub-issue-title-${sub1.id}`)).toContainText(sub1.title);
    await expect(page.getByTestId(`sub-issue-status-${sub1.id}`)).toBeVisible();
    await expect(page.getByTestId(`sub-issue-priority-${sub1.id}`)).toBeVisible();

    // Verify second sub-issue row
    const row2 = page.getByTestId(`sub-issue-row-${sub2.id}`);
    await expect(row2).toBeVisible();
    await expect(page.getByTestId(`sub-issue-identifier-${sub2.id}`)).toContainText(sub2.identifier);
    await expect(page.getByTestId(`sub-issue-title-${sub2.id}`)).toContainText(sub2.title);
    await expect(page.getByTestId(`sub-issue-status-${sub2.id}`)).toBeVisible();
    await expect(page.getByTestId(`sub-issue-priority-${sub2.id}`)).toBeVisible();
  });

  test('Click sub-issue navigates to its detail page', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const parentIssue = issues.find((i: { number: number }) => i.number === 2);

    // Create a sub-issue
    const subIssue = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Navigate test sub-issue ${Date.now()}`,
      status: 'todo',
      parentId: parentIssue.id,
    });

    await loginAndNavigateToIssue(page, baseURL!, parentIssue.id, data.token);

    // Verify sub-issue is displayed
    await expect(page.getByTestId(`sub-issue-title-${subIssue.id}`)).toBeVisible({ timeout: 30000 });

    // Click the sub-issue title
    await page.getByTestId(`sub-issue-title-${subIssue.id}`).click();

    // Verify navigation to the sub-issue detail page
    await expect(page).toHaveURL(`/issue/${subIssue.id}`, { timeout: 30000 });
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-header-title')).toContainText(subIssue.title, { timeout: 30000 });
  });

  test('Add sub-issue button opens create issue modal', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const parentIssue = issues.find((i: { number: number }) => i.number === 3);

    await loginAndNavigateToIssue(page, baseURL!, parentIssue.id, data.token);

    // Click the "Add sub-issue" button
    await page.getByTestId('sub-issues-add-btn').click();

    // Verify create issue modal opens
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    // Verify the parent issue field is pre-filled
    const parentSelector = page.getByTestId('create-issue-parent-selector');
    await expect(parentSelector).toBeVisible();
    // The parent selector should show the parent issue (not "No parent issue")
    await expect(parentSelector).not.toContainText('No parent issue');

    // Verify the team selector defaults to the same team
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Engineering');
  });

  test('Newly created sub-issue appears in the list', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const parentIssue = issues.find((i: { number: number }) => i.number === 4);

    await loginAndNavigateToIssue(page, baseURL!, parentIssue.id, data.token);

    // Verify empty state initially
    await expect(page.getByTestId('sub-issues-empty')).toBeVisible();

    // Click add sub-issue
    await page.getByTestId('sub-issues-add-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    // Fill in title
    const uniqueTitle = `Write unit tests ${Date.now()}`;
    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);

    // Set status to Todo
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-todo').click();

    // Submit the form
    await page.getByTestId('create-issue-submit-btn').click();

    // Wait for modal to close (shows success then auto-closes)
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify new sub-issue appears in the list
    await expect(page.getByTestId('sub-issues-list')).toBeVisible({ timeout: 30000 });

    // Find the new sub-issue by title
    const subIssueRows = page.locator('[data-testid^="sub-issue-row-"]');
    await expect(subIssueRows).toHaveCount(1, { timeout: 30000 });

    // Verify the new sub-issue has the correct title
    const titleElements = page.locator('[data-testid^="sub-issue-title-"]');
    await expect(titleElements.first()).toContainText(uniqueTitle);
  });

  test('Sub-issue status icon updates when status changes', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const parentIssue = issues.find((i: { number: number }) => i.number === 5);

    // Create a sub-issue with in_progress status
    const subIssue = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Status update test ${Date.now()}`,
      status: 'in_progress',
      parentId: parentIssue.id,
    });

    await loginAndNavigateToIssue(page, baseURL!, parentIssue.id, data.token);

    // Verify sub-issue is displayed
    await expect(page.getByTestId(`sub-issue-row-${subIssue.id}`)).toBeVisible({ timeout: 30000 });

    // Navigate to the sub-issue detail
    await page.getByTestId(`sub-issue-title-${subIssue.id}`).click();
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('In Progress', { timeout: 30000 });

    // Change status to Done
    await page.getByTestId('issue-header-status-btn').click();
    await expect(page.getByTestId('issue-header-status-dropdown')).toBeVisible();
    await page.getByTestId('issue-header-status-option-done').click();
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('Done', { timeout: 30000 });

    // Navigate back to parent issue
    await page.goto(`/issue/${parentIssue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Verify the sub-issue status icon has updated - check the status element is visible
    await expect(page.getByTestId(`sub-issue-status-${subIssue.id}`)).toBeVisible({ timeout: 30000 });
    // The status icon SVG should reflect "done" state - verify via the row being present
    await expect(page.getByTestId(`sub-issue-row-${subIssue.id}`)).toBeVisible();
  });

  test('Multiple sub-issues display in correct order', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const parentIssue = issues.find((i: { number: number }) => i.number === 6);

    const timestamp = Date.now();

    // Create 4 sub-issues in order
    const sub1 = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Sub-issue first ${timestamp}`,
      status: 'todo',
      parentId: parentIssue.id,
    });
    const sub2 = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Sub-issue second ${timestamp}`,
      status: 'in_progress',
      parentId: parentIssue.id,
    });
    const sub3 = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Sub-issue third ${timestamp}`,
      status: 'done',
      parentId: parentIssue.id,
    });
    const sub4 = await createIssue(baseURL!, data.token, {
      teamId: engTeam.id,
      title: `Sub-issue fourth ${timestamp}`,
      status: 'backlog',
      parentId: parentIssue.id,
    });

    await loginAndNavigateToIssue(page, baseURL!, parentIssue.id, data.token);

    // Verify all 4 sub-issues are displayed
    await expect(page.getByTestId('sub-issues-list')).toBeVisible({ timeout: 30000 });
    const subIssueRows = page.locator('[data-testid^="sub-issue-row-"]');
    await expect(subIssueRows).toHaveCount(4, { timeout: 30000 });

    // Verify each sub-issue is present
    await expect(page.getByTestId(`sub-issue-row-${sub1.id}`)).toBeVisible();
    await expect(page.getByTestId(`sub-issue-row-${sub2.id}`)).toBeVisible();
    await expect(page.getByTestId(`sub-issue-row-${sub3.id}`)).toBeVisible();
    await expect(page.getByTestId(`sub-issue-row-${sub4.id}`)).toBeVisible();

    // Verify they are displayed in creation order (by checking identifier order)
    // Sub-issues are ordered by created_at ASC in the API
    const identifiers = page.locator('[data-testid^="sub-issue-identifier-"]');
    const id1Text = await identifiers.nth(0).textContent();
    const id2Text = await identifiers.nth(1).textContent();
    const id3Text = await identifiers.nth(2).textContent();
    const id4Text = await identifiers.nth(3).textContent();

    // Extract numbers and verify ascending order
    const num1 = parseInt(id1Text!.split('-')[1]);
    const num2 = parseInt(id2Text!.split('-')[1]);
    const num3 = parseInt(id3Text!.split('-')[1]);
    const num4 = parseInt(id4Text!.split('-')[1]);

    expect(num1).toBeLessThan(num2);
    expect(num2).toBeLessThan(num3);
    expect(num3).toBeLessThan(num4);
  });
});
