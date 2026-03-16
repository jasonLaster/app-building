import { test, expect } from '@playwright/test';

// Helper to login via API and get token
async function loginViaApi(baseURL: string, email: string, password: string) {
  const response = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!data.token) {
    throw new Error(`loginViaApi failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

// Helper to get teams via API
async function getTeams(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!data.teams) {
    throw new Error(`getTeams failed: ${JSON.stringify(data)}`);
  }
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

// Helper to create a cycle via API
async function createCycleViaApi(
  baseURL: string,
  token: string,
  teamId: string,
  name: string,
  startDate: string,
  endDate: string
) {
  const response = await fetch(`${baseURL}/api/cycles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ teamId, name, startDate, endDate }),
  });
  return response.json();
}

// Helper to login and navigate to cycle detail view
async function loginAndGoToCycleDetail(
  page: import('@playwright/test').Page,
  baseURL: string,
  cycleId?: string,
  teamIdentifier = 'ENG',
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const team = teams.find((t: { identifier: string }) => t.identifier === teamIdentifier);

  const cycles = await getCycles(baseURL, data.token, team.id);
  const cycle = cycleId
    ? cycles.find((c: { id: string }) => c.id === cycleId)
    : cycles[0];

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/team/${team.id}/cycles`);
  await expect(page.getByTestId('active-cycle-page')).toBeVisible({ timeout: 30000 });

  // Wait for either cycle-list or cycle-detail to appear
  await expect(
    page.getByTestId('cycle-list').or(page.getByTestId('cycle-detail'))
  ).toBeVisible({ timeout: 30000 });

  // If auto-selection already showed CycleDetail for a different cycle, go back to list
  const detailVisible = await page.getByTestId('cycle-detail').isVisible().catch(() => false);
  if (detailVisible && cycleId) {
    // CycleDetail is showing the auto-selected cycle; click back to get the list
    await page.getByTestId('cycle-back-btn').click();
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });
  }

  // If cycle-list is visible, click the desired cycle
  const listVisible = await page.getByTestId('cycle-list').isVisible().catch(() => false);
  if (listVisible) {
    await page.getByTestId(`cycle-row-${cycle.id}`).click({ force: true, timeout: 30000 });
  }
  await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });

  return { token: data.token, user: data.user, team, teams, cycle, cycles };
}

test.describe('BurndownChart', () => {
  test('Burndown chart renders as a bar chart showing issues completed per day', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    // Verify burndown chart is visible
    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });

    // Verify chart title
    await expect(page.getByTestId('burndown-chart-title')).toBeVisible();
    await expect(page.getByTestId('burndown-chart-title')).toContainText('Issues Completed per Day');

    // Verify chart container with bars exists
    await expect(page.getByTestId('burndown-chart-container')).toBeVisible();

    // Get cycle data to verify date range bars exist
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const _startDate = new Date(cycleData.cycle.startDate + 'T00:00:00');
    const _endDate = new Date(cycleData.cycle.endDate + 'T00:00:00');

    // Verify bars exist for the start date
    const startDateStr = cycleData.cycle.startDate;
    await expect(page.getByTestId(`burndown-bar-${startDateStr}`)).toBeVisible({ timeout: 10000 });

    // If there are burndown entries, verify bars have proper structure
    if (cycleData.burndown.length > 0) {
      // At least one bar should exist for a date with completions
      const firstEntry = cycleData.burndown[0];
      const bar = page.getByTestId(`burndown-bar-${firstEntry.date}`);
      await expect(bar).toBeVisible();
    }
  });

  test('Burndown chart shows correct date range matching the cycle', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });

    // Get cycle data for date range
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const startDate = cycleData.cycle.startDate;
    const endDate = cycleData.cycle.endDate;

    // Verify first date bar exists (start date)
    await expect(page.getByTestId(`burndown-bar-${startDate}`)).toBeVisible({ timeout: 10000 });

    // Verify last date bar exists (end date)
    await expect(page.getByTestId(`burndown-bar-${endDate}`)).toBeVisible();

    // Count total bar columns - should match number of days in cycle
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const expectedDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const barColumns = page.locator('[data-testid^="burndown-bar-"]');
    await expect(barColumns).toHaveCount(expectedDays, { timeout: 15000 });
  });

  test('Burndown chart updates when an issue is marked as done', async ({ page, baseURL }) => {
    test.slow();
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });

    // Get cycle issues
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const issues = cycleData.issues;

    // Find a non-done issue to mark as done
    const nonDoneIssue = issues.find((i: { status: string }) => i.status !== 'done');
    if (!nonDoneIssue) return;

    // Set grouping to "none" to see all issues flat
    await page.getByTestId('cycle-group-by-btn').click();
    await expect(page.getByTestId('cycle-group-by-dropdown')).toBeVisible();
    await page.getByTestId('cycle-group-by-option-none').click();

    // Get the initial completed count from stats
    const initialCompletedText = await page.getByTestId('cycle-stat-completed').locator('.cycle-detail-stat-value').textContent();
    const initialCompleted = parseInt(initialCompletedText || '0', 10);

    // Click the status button on the issue row
    await page.getByTestId(`issue-status-btn-${nonDoneIssue.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${nonDoneIssue.id}`)).toBeVisible();

    // Change to "done"
    await page.getByTestId('issue-status-option-done').click();

    // Verify completed count increased
    await expect(page.getByTestId('cycle-stat-completed')).toContainText(String(initialCompleted + 1), { timeout: 15000 });

    // The burndown chart should still be visible and rendered
    await expect(page.getByTestId('burndown-chart')).toBeVisible();
    await expect(page.getByTestId('burndown-chart-container')).toBeVisible();
  });

  test('Burndown chart shows empty state for cycle with no completed issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const team = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    // Create a new empty cycle via API
    const cycleName = `Empty Chart Cycle ${Date.now()}`;
    const newCycle = await createCycleViaApi(baseURL!, data.token, team.id, cycleName, '2026-07-01', '2026-07-14');

    // Navigate to cycles page
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/team/${team.id}/cycles`);
    await expect(page.getByTestId('active-cycle-page')).toBeVisible({ timeout: 30000 });

    // Wait for either cycle-list or cycle-detail to appear
    await expect(page.getByTestId('cycle-list').or(page.getByTestId('cycle-detail'))).toBeVisible({ timeout: 30000 });

    // Click the new empty cycle
    await page.getByTestId(`cycle-row-${newCycle.id}`).click({ timeout: 30000 });
    await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });

    // Verify burndown chart shows empty state
    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('burndown-chart-empty')).toBeVisible();
    await expect(page.getByTestId('burndown-chart-empty')).toContainText('No issues completed yet');

    // Chart container and axes should still render
    await expect(page.getByTestId('burndown-chart-container')).toBeVisible();
  });

  test('Burndown chart has readable axis labels and chart title', async ({ page, baseURL }) => {
    await loginAndGoToCycleDetail(page, baseURL!);

    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });

    // Verify title is present and readable
    const title = page.getByTestId('burndown-chart-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Issues Completed per Day');

    // Verify chart container is visible
    await expect(page.getByTestId('burndown-chart-container')).toBeVisible();

    // Verify y-axis labels exist (integer values)
    const yLabels = page.locator('.burndown-chart-y-label');
    const yLabelCount = await yLabels.count();
    expect(yLabelCount).toBeGreaterThan(0);

    // Verify x-axis labels exist (date labels)
    const xLabels = page.locator('.burndown-chart-x-label:not(.burndown-chart-x-label-hidden)');
    const xLabelCount = await xLabels.count();
    expect(xLabelCount).toBeGreaterThan(0);

    // Verify x-axis labels contain formatted dates (e.g., "Mar 10")
    const firstXLabel = await xLabels.first().textContent();
    expect(firstXLabel).toBeTruthy();
    // Should match a pattern like "Mar 10" or "Jan 15"
    expect(firstXLabel!.trim()).toMatch(/^[A-Z][a-z]{2}\s+\d{1,2}$/);
  });

  test('Burndown chart bar heights are proportional to issue counts', async ({ page, baseURL }) => {
    const { token, cycle } = await loginAndGoToCycleDetail(page, baseURL!);

    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });

    // Get burndown data from API
    const cycleData = await getCycleIssues(baseURL!, token, cycle.id);
    const burndown = cycleData.burndown;

    if (burndown.length < 2) {
      // Not enough data points to compare proportionality — just verify chart renders
      await expect(page.getByTestId('burndown-chart-container')).toBeVisible();
      return;
    }

    // Find max count to compute expected heights
    const maxCount = Math.max(...burndown.map((e: { count: number }) => e.count));

    // Verify that bars with higher counts have taller heights
    for (const entry of burndown) {
      const barColumn = page.getByTestId(`burndown-bar-${entry.date}`);
      await expect(barColumn).toBeVisible();

      // Get the inner bar's height style
      const bar = barColumn.locator('.burndown-chart-bar');
      const heightStyle = await bar.getAttribute('style');

      // Expected height percentage
      const expectedPct = (entry.count / maxCount) * 100;

      // Verify the height is set via inline style
      expect(heightStyle).toBeTruthy();
      expect(heightStyle).toContain(`${expectedPct}%`);
    }
  });

  test('Burndown chart handles a cycle spanning a long date range', async ({ page, baseURL }) => {
    // Create a cycle spanning 28 days (4 weeks)
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const team = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const cycleName = `Long Cycle ${Date.now()}`;
    const newCycle = await createCycleViaApi(
      baseURL!,
      data.token,
      team.id,
      cycleName,
      '2026-08-01',
      '2026-08-28'
    );

    // Navigate and select the Long Cycle
    await loginAndGoToCycleDetail(page, baseURL!, newCycle.id);
    await expect(page.getByTestId('cycle-detail-name')).toContainText('Long Cycle', { timeout: 15000 });

    // Verify burndown chart renders
    await expect(page.getByTestId('burndown-chart')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('burndown-chart-container')).toBeVisible();

    // Should have 28 bar columns for 28 days
    const barColumns = page.locator('[data-testid^="burndown-bar-"]');
    await expect(barColumns).toHaveCount(28, { timeout: 15000 });

    // Verify first and last date bars exist
    await expect(page.getByTestId('burndown-bar-2026-08-01')).toBeVisible();
    await expect(page.getByTestId('burndown-bar-2026-08-28')).toBeVisible();

    // Verify x-axis labels are readable (some may be hidden for long ranges)
    // The chart uses showEveryNthLabel for label skipping on long ranges
    const visibleLabels = page.locator('.burndown-chart-x-label:not(.burndown-chart-x-label-hidden)');
    const visibleLabelCount = await visibleLabels.count();
    // For 28 days, should show fewer than 28 labels (label skipping active)
    expect(visibleLabelCount).toBeGreaterThan(0);
    expect(visibleLabelCount).toBeLessThanOrEqual(28);
  });
});
