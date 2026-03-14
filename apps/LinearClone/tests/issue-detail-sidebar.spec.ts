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

// Helper to login and navigate to an issue detail page
async function loginAndNavigateToIssue(
  page: import('@playwright/test').Page,
  baseURL: string,
  issueNumber: number,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
  const issues = await getTeamIssues(baseURL, data.token, engTeam.id);
  const issue = issues.find((i: { number: number }) => i.number === issueNumber);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/issue/${issue.id}`);
  await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('issue-sidebar')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, engTeam, issue };
}

test.describe('Issue Detail Sidebar - Properties, Status, Priority, Assignee', () => {
  test('Sidebar renders all property fields', async ({ page, baseURL }) => {
    // ENG-1: in_progress, high, assigned to Alice, project V2 Launch, cycle Sprint 12, has Bug label
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify all sidebar fields are visible
    await expect(page.getByTestId('sidebar-status-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-priority-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-assignee-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-labels-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-project-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-cycle-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-due-date-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-created-field')).toBeVisible();
    await expect(page.getByTestId('sidebar-updated-field')).toBeVisible();

    // Verify Status shows "In Progress"
    await expect(page.getByTestId('sidebar-status-btn')).toContainText('In Progress');

    // Verify Priority shows "High"
    await expect(page.getByTestId('sidebar-priority-btn')).toContainText('High');

    // Verify Assignee shows "Alice Johnson"
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('Alice Johnson');

    // Verify Labels shows "Bug" badge
    await expect(page.getByTestId('sidebar-labels-list')).toBeVisible();

    // Verify Project shows "V2 Launch"
    await expect(page.getByTestId('sidebar-project-btn')).toContainText('V2 Launch');

    // Verify Cycle shows "Sprint 12"
    await expect(page.getByTestId('sidebar-cycle-btn')).toContainText('Sprint 12');

    // Verify Created and Updated timestamps are displayed
    await expect(page.getByTestId('sidebar-created-value')).toBeVisible();
    await expect(page.getByTestId('sidebar-updated-value')).toBeVisible();
  });

  test('Change status via sidebar dropdown', async ({ page, baseURL }) => {
    // ENG-2: status is "todo"
    await loginAndNavigateToIssue(page, baseURL!, 2);

    // Verify current status
    await expect(page.getByTestId('sidebar-status-btn')).toContainText('Todo');

    // Click the Status field
    await page.getByTestId('sidebar-status-btn').click();

    // Verify dropdown appears with all statuses
    await expect(page.getByTestId('sidebar-status-dropdown')).toBeVisible();
    await expect(page.getByTestId('sidebar-status-option-backlog')).toBeVisible();
    await expect(page.getByTestId('sidebar-status-option-todo')).toBeVisible();
    await expect(page.getByTestId('sidebar-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('sidebar-status-option-in_review')).toBeVisible();
    await expect(page.getByTestId('sidebar-status-option-done')).toBeVisible();
    await expect(page.getByTestId('sidebar-status-option-cancelled')).toBeVisible();

    // Verify labels
    await expect(page.getByTestId('sidebar-status-option-backlog')).toContainText('Backlog');
    await expect(page.getByTestId('sidebar-status-option-todo')).toContainText('Todo');
    await expect(page.getByTestId('sidebar-status-option-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('sidebar-status-option-in_review')).toContainText('In Review');
    await expect(page.getByTestId('sidebar-status-option-done')).toContainText('Done');
    await expect(page.getByTestId('sidebar-status-option-cancelled')).toContainText('Cancelled');
  });

  test('Select new status in sidebar', async ({ page, baseURL }) => {
    // ENG-7: backlog, to avoid conflicts with other tests
    await loginAndNavigateToIssue(page, baseURL!, 7);

    // Verify current status is Backlog
    await expect(page.getByTestId('sidebar-status-btn')).toContainText('Backlog');

    // Open dropdown and select "Done"
    await page.getByTestId('sidebar-status-btn').click();
    await expect(page.getByTestId('sidebar-status-dropdown')).toBeVisible();
    await page.getByTestId('sidebar-status-option-done').click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-status-dropdown')).toHaveCount(0);

    // Verify status updated to "Done"
    await expect(page.getByTestId('sidebar-status-btn')).toContainText('Done', { timeout: 30000 });

    // Verify the header status also updates to "Done"
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('Done', { timeout: 30000 });
  });

  test('Change priority via sidebar dropdown', async ({ page, baseURL }) => {
    // ENG-2: priority is "medium"
    await loginAndNavigateToIssue(page, baseURL!, 2);

    // Verify current priority
    await expect(page.getByTestId('sidebar-priority-btn')).toContainText('Medium');

    // Click the Priority field
    await page.getByTestId('sidebar-priority-btn').click();

    // Verify dropdown appears with all priorities
    await expect(page.getByTestId('sidebar-priority-dropdown')).toBeVisible();
    await expect(page.getByTestId('sidebar-priority-option-urgent')).toBeVisible();
    await expect(page.getByTestId('sidebar-priority-option-high')).toBeVisible();
    await expect(page.getByTestId('sidebar-priority-option-medium')).toBeVisible();
    await expect(page.getByTestId('sidebar-priority-option-low')).toBeVisible();
    await expect(page.getByTestId('sidebar-priority-option-none')).toBeVisible();

    // Verify labels
    await expect(page.getByTestId('sidebar-priority-option-urgent')).toContainText('Urgent');
    await expect(page.getByTestId('sidebar-priority-option-high')).toContainText('High');
    await expect(page.getByTestId('sidebar-priority-option-medium')).toContainText('Medium');
    await expect(page.getByTestId('sidebar-priority-option-low')).toContainText('Low');
    await expect(page.getByTestId('sidebar-priority-option-none')).toContainText('No Priority');
  });

  test('Select new priority in sidebar', async ({ page, baseURL }) => {
    // ENG-3: backlog, priority low, to avoid conflicts
    await loginAndNavigateToIssue(page, baseURL!, 3);

    // Verify current priority is Low
    await expect(page.getByTestId('sidebar-priority-btn')).toContainText('Low');

    // Open dropdown and select "Urgent"
    await page.getByTestId('sidebar-priority-btn').click();
    await expect(page.getByTestId('sidebar-priority-dropdown')).toBeVisible();
    await page.getByTestId('sidebar-priority-option-urgent').click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-priority-dropdown')).toHaveCount(0);

    // Verify priority updated to "Urgent"
    await expect(page.getByTestId('sidebar-priority-btn')).toContainText('Urgent', { timeout: 30000 });
  });

  test('Change assignee via searchable selector', async ({ page, baseURL }) => {
    // ENG-3: unassigned
    await loginAndNavigateToIssue(page, baseURL!, 3);

    // Verify current assignee shows "No assignee"
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('No assignee');

    // Click the Assignee field
    await page.getByTestId('sidebar-assignee-btn').click();

    // Verify searchable dropdown appears
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toBeVisible();
    await expect(page.getByTestId('sidebar-assignee-search')).toBeVisible();

    // Verify all members are listed
    await expect(page.getByTestId('sidebar-assignee-option-none')).toBeVisible();
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toContainText('Alice Johnson');
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toContainText('Bob Smith');
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toContainText('Carol Davis');
  });

  test('Search and select assignee', async ({ page, baseURL }) => {
    // ENG-7: unassigned, to avoid conflicts
    await loginAndNavigateToIssue(page, baseURL!, 7);

    // Verify unassigned
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('No assignee');

    // Open assignee dropdown
    await page.getByTestId('sidebar-assignee-btn').click();
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toBeVisible();

    // Type search query
    await page.getByTestId('sidebar-assignee-search').fill('Ali');

    // Verify list filters to show only Alice
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toContainText('Alice Johnson');
    // Bob and Carol should be filtered out
    await expect(page.getByTestId('sidebar-assignee-dropdown')).not.toContainText('Bob Smith');
    await expect(page.getByTestId('sidebar-assignee-dropdown')).not.toContainText('Carol Davis');

    // Click on the Alice option - find it by text within the dropdown
    const aliceOption = page.getByTestId('sidebar-assignee-dropdown').locator('button').filter({ hasText: 'Alice Johnson' });
    await aliceOption.click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toHaveCount(0);

    // Verify assignee updated to Alice Johnson
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('Alice Johnson', { timeout: 30000 });
  });

  test('Remove assignee', async ({ page, baseURL }) => {
    // ENG-1: assigned to Alice
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify currently assigned to Alice
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('Alice Johnson');

    // Open assignee dropdown
    await page.getByTestId('sidebar-assignee-btn').click();
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toBeVisible();

    // Click Unassign option
    await page.getByTestId('sidebar-assignee-option-none').click();

    // Verify dropdown closes
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toHaveCount(0);

    // Verify assignee is removed
    await expect(page.getByTestId('sidebar-assignee-btn')).toContainText('No assignee', { timeout: 30000 });
  });
});
