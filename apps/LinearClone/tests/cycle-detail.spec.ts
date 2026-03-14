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

// Helper to get cycles via API
async function getCycles(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/cycles?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.cycles;
}

// Helper to get cycle issues via API
async function getCycleIssues(baseURL: string, token: string, cycleId: string) {
  const response = await fetch(`${baseURL}/api/cycle-issues?cycleId=${cycleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Helper to login and navigate to cycle detail view
async function loginAndGoToCycleDetail(
  page: import('@playwright/test').Page,
  baseURL: string,
  teamIdentifier = 'ENG',
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const team = teams.find((t: { identifier: string }) => t.identifier === teamIdentifier);

  // Get cycles and pick the first one
  const cycles = await getCycles(baseURL, data.token, team.id);
  const cycle = cycles[0];

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/team/${team.id}/cycles`);
  await expect(page.getByTestId('active-cycle-page')).toBeVisible({ timeout: 30000 });

  // Wait for cycle list and click the cycle
  await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });
  await page.getByTestId(`cycle-row-${cycle.id}`).click();
  await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });

  return { token: data.token, user: data.user, team, teams, cycle, cycles };
}

test.describe('CycleDetail', () => {
  test('Cycle detail view renders cycle name and date range', async ({ page, baseURL }) => {
    const { cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Verify cycle name
    await expect(page.getByTestId('cycle-detail-name')).toContainText(cycle.name);

    // Verify date range is displayed
    await expect(page.getByTestId('cycle-detail-dates')).toBeVisible();
    // The date range should contain formatted dates
    const datesText = await page.getByTestId('cycle-detail-dates').textContent();
    expect(datesText).toBeTruthy();
    expect(datesText!.length).toBeGreaterThan(0);
  });

  test('Cycle detail shows progress stats (total, completed, in progress, remaining)', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Get cycle issues from API to compute expected stats
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;
    const totalIssues = issues.length;
    const completedIssues = issues.filter((i: { status: string }) => i.status === 'done').length;
    const inProgressIssues = issues.filter((i: { status: string }) => i.status === 'in_progress' || i.status === 'in_review').length;
    const remainingIssues = totalIssues - completedIssues - inProgressIssues;

    // Verify stats
    await expect(page.getByTestId('cycle-detail-stats')).toBeVisible({ timeout: 10000 });

    const totalStat = page.getByTestId('cycle-stat-total');
    await expect(totalStat).toContainText(String(totalIssues));

    const completedStat = page.getByTestId('cycle-stat-completed');
    await expect(completedStat).toContainText(String(completedIssues));

    const inProgressStat = page.getByTestId('cycle-stat-in-progress');
    await expect(inProgressStat).toContainText(String(inProgressIssues));

    const remainingStat = page.getByTestId('cycle-stat-remaining');
    await expect(remainingStat).toContainText(String(remainingIssues));
  });

  test('Cycle detail shows progress bar with correct completion percentage', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Get cycle issues to compute expected percentage
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;
    const totalIssues = issues.length;
    const completedIssues = issues.filter((i: { status: string }) => i.status === 'done').length;
    const expectedPct = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 1000) / 10 : 0;

    // Verify progress bar section
    await expect(page.getByTestId('cycle-detail-progress')).toBeVisible();

    // Verify the progress text shows correct values
    await expect(page.getByTestId('cycle-detail-progress')).toContainText(`${completedIssues} of ${totalIssues}`);
    await expect(page.getByTestId('cycle-detail-progress')).toContainText(`${expectedPct}%`);
  });

  test('Cycle detail displays filtered issue list matching Team Issues layout', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Get cycle issues from API
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;

    if (issues.length > 0) {
      // The issue list section should be visible
      await expect(page.getByTestId('cycle-detail-issues')).toBeVisible({ timeout: 10000 });

      // Verify at least one issue row is visible
      // Issues use data-testid="issue-row-{id}"
      const firstIssue = issues[0];
      const issueRow = page.getByTestId(`issue-row-${firstIssue.id}`);
      await expect(issueRow).toBeVisible({ timeout: 15000 });

      // Verify issue row shows identifier and title
      await expect(page.getByTestId(`issue-identifier-${firstIssue.id}`)).toContainText(firstIssue.identifier);
      await expect(page.getByTestId(`issue-title-${firstIssue.id}`)).toContainText(firstIssue.title);
    }
  });

  test('Clicking an issue in cycle detail navigates to issue detail page', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Get cycle issues from API
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;
    expect(issues.length).toBeGreaterThan(0);

    const targetIssue = issues[0];

    // Click the issue title
    await page.getByTestId(`issue-title-${targetIssue.id}`).click();

    // Verify navigation to issue detail page
    await expect(page).toHaveURL(new RegExp(`/issue/${targetIssue.id}`), { timeout: 30000 });
  });

  test('Cycle detail issue list supports grouping by status, priority, assignee', async ({ page, baseURL }) => {
    await loginAndGoToCycleDetail(page, baseURL!);

    // Default grouping is by status - verify group headers exist
    await expect(page.getByTestId('cycle-detail-issues')).toBeVisible({ timeout: 10000 });

    // Change group to Priority
    await page.getByTestId('cycle-group-by-btn').click();
    await expect(page.getByTestId('cycle-group-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-group-by-option-priority').click();

    // Verify priority groups appear (at least one group header)
    await expect(page.locator('[data-testid^="cycle-issue-group-header-"]').first()).toBeVisible({ timeout: 15000 });

    // Change group to Assignee
    await page.getByTestId('cycle-group-by-btn').click();
    await expect(page.getByTestId('cycle-group-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-group-by-option-assignee').click();

    // Verify assignee groups appear
    await expect(page.locator('[data-testid^="cycle-issue-group-header-"]').first()).toBeVisible({ timeout: 15000 });
  });

  test('Cycle detail issue list supports sorting', async ({ page, baseURL }) => {
    await loginAndGoToCycleDetail(page, baseURL!);

    await expect(page.getByTestId('cycle-detail-issues')).toBeVisible({ timeout: 10000 });

    // Change sort to Status
    await page.getByTestId('cycle-sort-by-btn').click();
    await expect(page.getByTestId('cycle-sort-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-sort-by-option-status').click();

    // Verify sort button reflects the change
    await expect(page.getByTestId('cycle-sort-by-btn')).toContainText('Status');

    // Change sort to Created date
    await page.getByTestId('cycle-sort-by-btn').click();
    await expect(page.getByTestId('cycle-sort-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-sort-by-option-created').click();

    await expect(page.getByTestId('cycle-sort-by-btn')).toContainText('Created date');
  });

  test('Cycle detail issue list supports filtering', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    await expect(page.getByTestId('cycle-detail-issues')).toBeVisible({ timeout: 10000 });

    // Get cycle issues to know what statuses exist
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;
    const inProgressIssues = issues.filter((i: { status: string }) => i.status === 'in_progress');

    // Open status filter
    await page.getByTestId('cycle-status-filter-btn').click();
    await expect(page.getByTestId('cycle-status-filter-dropdown')).toBeVisible();

    // Select "in_progress" filter
    await page.getByTestId('cycle-status-filter-in_progress').click();

    // Close the dropdown by clicking elsewhere
    await page.getByTestId('cycle-detail-header').click();

    // Filter button should show active state
    await expect(page.getByTestId('cycle-status-filter-btn')).toContainText('Status (1)');

    // If there are in_progress issues, they should be visible
    if (inProgressIssues.length > 0) {
      for (const issue of inProgressIssues) {
        await expect(page.getByTestId(`issue-row-${issue.id}`)).toBeVisible({ timeout: 10000 });
      }
    }

    // Issues with other statuses should not be visible
    const otherIssues = issues.filter((i: { status: string }) => i.status !== 'in_progress');
    for (const issue of otherIssues) {
      await expect(page.getByTestId(`issue-row-${issue.id}`)).toHaveCount(0);
    }
  });

  test('Cycle detail issue list supports bulk actions', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // First set grouping to "none" so checkboxes are visible without group headers
    await page.getByTestId('cycle-group-by-btn').click();
    await expect(page.getByTestId('cycle-group-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-group-by-option-none').click();

    await expect(page.getByTestId('cycle-detail-issues')).toBeVisible({ timeout: 10000 });

    // Get cycle issues
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;
    expect(issues.length).toBeGreaterThan(0);

    // Select first two issues by clicking their checkboxes
    const issuesToSelect = issues.slice(0, Math.min(2, issues.length));
    for (const issue of issuesToSelect) {
      await page.getByTestId(`issue-checkbox-${issue.id}`).click();
    }

    // Verify bulk actions bar appears
    await expect(page.getByTestId('cycle-bulk-actions')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('cycle-bulk-actions')).toContainText(`${issuesToSelect.length} selected`);

    // Use bulk action to set status
    await page.getByTestId('cycle-bulk-status-btn').click();
    await expect(page.getByTestId('cycle-bulk-status-dropdown')).toBeVisible();
    await page.getByTestId('cycle-bulk-status-done').click();

    // Bulk actions bar should be cleared after action
    await expect(page.getByTestId('cycle-bulk-actions')).toHaveCount(0, { timeout: 15000 });
  });

  test('Cycle detail progress stats update when an issue status changes', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Get initial stats from API
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;
    const initialCompleted = issues.filter((i: { status: string }) => i.status === 'done').length;

    // Record initial completed count from UI
    await expect(page.getByTestId('cycle-stat-completed')).toContainText(String(initialCompleted), { timeout: 10000 });

    // Find a non-done issue to change
    const nonDoneIssue = issues.find((i: { status: string }) => i.status !== 'done');
    if (!nonDoneIssue) return;

    // Set grouping to "none" to see all issues flat
    await page.getByTestId('cycle-group-by-btn').click();
    await expect(page.getByTestId('cycle-group-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-group-by-option-none').click();

    // Click the status button on the issue row to open status dropdown
    await page.getByTestId(`issue-status-btn-${nonDoneIssue.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${nonDoneIssue.id}`)).toBeVisible();

    // Change to "done"
    await page.getByTestId('issue-status-option-done').click();

    // Verify completed count increased
    await expect(page.getByTestId('cycle-stat-completed')).toContainText(String(initialCompleted + 1), { timeout: 15000 });
  });

  test('Cycle detail renders correctly for a cycle with no issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const team = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    // Create a new empty cycle via API
    const cycleName = `Empty Cycle ${Date.now()}`;
    const createRes = await fetch(`${baseURL}/api/cycles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        teamId: team.id,
        name: cycleName,
        startDate: '2026-05-01',
        endDate: '2026-05-14',
      }),
    });
    const newCycle = await createRes.json();

    // Navigate to cycles page
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/team/${team.id}/cycles`);
    await expect(page.getByTestId('active-cycle-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    // Click the new empty cycle
    await page.getByTestId(`cycle-row-${newCycle.id}`).click();
    await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });

    // Verify stats show all zeros
    await expect(page.getByTestId('cycle-stat-total')).toContainText('0', { timeout: 10000 });
    await expect(page.getByTestId('cycle-stat-completed')).toContainText('0');
    await expect(page.getByTestId('cycle-stat-in-progress')).toContainText('0');
    await expect(page.getByTestId('cycle-stat-remaining')).toContainText('0');

    // Progress bar shows 0%
    await expect(page.getByTestId('cycle-detail-progress')).toContainText('0 of 0');
    await expect(page.getByTestId('cycle-detail-progress')).toContainText('0%');

    // Issue list shows empty state
    await expect(page.getByTestId('cycle-detail-no-issues')).toBeVisible();
    await expect(page.getByTestId('cycle-detail-no-issues')).toContainText('No issues in this cycle');
  });
});
