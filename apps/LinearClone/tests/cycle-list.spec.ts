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

// Helper to delete all cycles for a team via direct API
async function deleteAllCycles(baseURL: string, token: string, teamId: string) {
  const cycles = await getCycles(baseURL, token, teamId);
  for (const cycle of cycles) {
    // No delete endpoint exists, so we rely on DB reset between tests
  }
}

// Helper to login and navigate to cycles page
async function loginAndGoToCycles(
  page: import('@playwright/test').Page,
  baseURL: string,
  teamIdentifier = 'ENG',
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const team = teams.find((t: { identifier: string }) => t.identifier === teamIdentifier);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/team/${team.id}/cycles`);
  await expect(page.getByTestId('active-cycle-page')).toBeVisible({ timeout: 30000 });

  return { token: data.token, user: data.user, team, teams };
}

test.describe('CycleList', () => {
  test('Cycle list renders all team cycles with name, date range, progress bar, and issue count', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    // Wait for the cycle list to load
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    // Seed data has 1 cycle: Sprint 12 for ENG team
    const cycles = await getCycles(baseURL!, token, team.id);
    expect(cycles.length).toBeGreaterThan(0);

    // Verify each cycle row shows name, date range, progress bar, and issue count
    for (const cycle of cycles) {
      const row = page.getByTestId(`cycle-row-${cycle.id}`);
      await expect(row).toBeVisible({ timeout: 10000 });

      // Check name
      await expect(page.getByTestId(`cycle-name-${cycle.id}`)).toContainText(cycle.name);

      // Check date range is present
      await expect(page.getByTestId(`cycle-dates-${cycle.id}`)).toBeVisible();

      // Check progress bar exists
      await expect(page.getByTestId(`cycle-progress-${cycle.id}`)).toBeVisible();

      // Check issue count
      await expect(page.getByTestId(`cycle-issue-count-${cycle.id}`)).toContainText('issues');
    }
  });

  test('Active cycle is visually highlighted in the list', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    const cycles = await getCycles(baseURL!, token, team.id);
    const activeCycle = cycles.find((c: { isActive: boolean }) => c.isActive);

    if (activeCycle) {
      // Active cycle should have the "Active" badge
      await expect(page.getByTestId(`cycle-active-badge-${activeCycle.id}`)).toBeVisible();
      await expect(page.getByTestId(`cycle-active-badge-${activeCycle.id}`)).toContainText('Active');

      // Active cycle row should have the active class
      const row = page.getByTestId(`cycle-row-${activeCycle.id}`);
      await expect(row).toHaveClass(/cycle-list-row-active/);
    }

    // Non-active cycles should NOT have the badge
    const inactiveCycles = cycles.filter((c: { isActive: boolean }) => !c.isActive);
    for (const cycle of inactiveCycles) {
      await expect(page.getByTestId(`cycle-active-badge-${cycle.id}`)).toHaveCount(0);
    }
  });

  test('Clicking a cycle navigates to cycle detail view', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    const cycles = await getCycles(baseURL!, token, team.id);
    expect(cycles.length).toBeGreaterThan(0);

    const targetCycle = cycles[0];

    // Click the cycle row
    await page.getByTestId(`cycle-row-${targetCycle.id}`).click();

    // Verify cycle detail view is shown
    await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });

    // Verify cycle name in detail view
    await expect(page.getByTestId('cycle-detail-name')).toContainText(targetCycle.name);
  });

  test('Cycle list shows empty state when team has no cycles', async ({ page, baseURL }) => {
    // Navigate to Design team cycles - Design team has no cycles in seed data
    await loginAndGoToCycles(page, baseURL!, 'DES');

    // Verify empty state is shown
    await expect(page.getByTestId('cycle-list-empty')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('cycle-list-empty')).toContainText('No cycles yet');

    // "New Cycle" button should still be visible
    await expect(page.getByTestId('new-cycle-btn')).toBeVisible();
  });

  test('Cycle list progress bar accurately reflects issue completion percentage', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    const cycles = await getCycles(baseURL!, token, team.id);

    for (const cycle of cycles) {
      const expectedPct = cycle.issueCount > 0
        ? Math.round((cycle.doneCount / cycle.issueCount) * 100)
        : 0;

      // Verify the progress text shows the correct percentage
      const row = page.getByTestId(`cycle-row-${cycle.id}`);
      await expect(row).toContainText(`${expectedPct}%`);
    }
  });

  test('Cycle list updates when a new cycle is created', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    // Wait for cycle list or empty state
    const cycleListOrEmpty = page.getByTestId('cycle-list').or(page.getByTestId('cycle-list-empty'));
    await expect(cycleListOrEmpty).toBeVisible({ timeout: 30000 });

    // Get initial cycle count from API
    const initialCycles = await getCycles(baseURL!, token, team.id);
    const initialCount = initialCycles.length;

    // Click "New Cycle" button
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Fill in cycle details
    const cycleName = `Sprint Test ${Date.now()}`;
    await page.getByTestId('create-cycle-name-input').fill(cycleName);
    await page.getByTestId('create-cycle-start-date-input').fill('2026-04-01');
    await page.getByTestId('create-cycle-end-date-input').fill('2026-04-14');

    // Submit
    await page.getByTestId('create-cycle-submit-btn').click();

    // Wait for modal to close
    await expect(page.getByTestId('create-cycle-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify cycle list now shows the new cycle
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    // The new cycle should appear in the list
    const cycleList = page.getByTestId('cycle-list');
    await expect(cycleList).toContainText(cycleName, { timeout: 15000 });
  });

  test('Clicking a different cycle after viewing one switches the detail view', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    // First create a second cycle so we have two to switch between
    const response = await fetch(`${baseURL}/api/cycles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        teamId: team.id,
        name: `Second Cycle ${Date.now()}`,
        startDate: '2026-04-01',
        endDate: '2026-04-14',
      }),
    });
    const secondCycle = await response.json();

    // Reload the page to see both cycles
    await page.goto(`/team/${team.id}/cycles`);
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    // Get cycles from API
    const cycles = await getCycles(baseURL!, token, team.id);
    expect(cycles.length).toBeGreaterThanOrEqual(2);

    // Click first cycle
    await page.getByTestId(`cycle-row-${cycles[0].id}`).click();
    await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('cycle-detail-name')).toContainText(cycles[0].name);

    // Go back to list
    await page.getByTestId('cycle-back-btn').click();
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    // Click second cycle
    await page.getByTestId(`cycle-row-${cycles[1].id}`).click();
    await expect(page.getByTestId('cycle-detail')).toBeVisible({ timeout: 30000 });

    // Verify detail shows the second cycle's name, not the first
    await expect(page.getByTestId('cycle-detail-name')).toContainText(cycles[1].name);
  });
});
