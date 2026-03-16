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

test.describe('CreateCycle', () => {
  test('"New Cycle" button is visible on the cycles page', async ({ page, baseURL }) => {
    await loginAndGoToCycles(page, baseURL!);

    // Verify the "New Cycle" button is visible
    const newCycleBtn = page.getByTestId('new-cycle-btn');
    await expect(newCycleBtn).toBeVisible({ timeout: 10000 });
    await expect(newCycleBtn).toContainText('New Cycle');
  });

  test('Clicking "New Cycle" opens create cycle modal with correct fields', async ({ page, baseURL }) => {
    await loginAndGoToCycles(page, baseURL!);

    // Click the New Cycle button
    await page.getByTestId('new-cycle-btn').click();

    // Verify modal opens
    const modal = page.getByTestId('create-cycle-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Verify modal has correct title
    await expect(modal).toContainText('New Cycle');

    // Verify Name input field
    await expect(page.getByTestId('create-cycle-name-input')).toBeVisible();

    // Verify Start date input
    await expect(page.getByTestId('create-cycle-start-date-input')).toBeVisible();

    // Verify End date input
    await expect(page.getByTestId('create-cycle-end-date-input')).toBeVisible();

    // Verify Create button
    await expect(page.getByTestId('create-cycle-submit-btn')).toBeVisible();
    await expect(page.getByTestId('create-cycle-submit-btn')).toContainText('Create');

    // Verify Cancel button
    await expect(page.getByTestId('create-cycle-cancel-btn')).toBeVisible();
    await expect(page.getByTestId('create-cycle-cancel-btn')).toContainText('Cancel');
  });

  test('Successfully creating a cycle with all fields filled', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    // Get initial cycle count
    const initialCycles = await getCycles(baseURL!, token, team.id);
    const _initialCount = initialCycles.length;

    // Open create modal
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Fill in all fields
    const cycleName = `Sprint 5 ${Date.now()}`;
    await page.getByTestId('create-cycle-name-input').fill(cycleName);
    await page.getByTestId('create-cycle-start-date-input').fill('2026-02-12');
    await page.getByTestId('create-cycle-end-date-input').fill('2026-02-25');

    // Click Create
    await page.getByTestId('create-cycle-submit-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-cycle-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify cycle list shows the new cycle
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('cycle-list')).toContainText(cycleName, { timeout: 15000 });
  });

  test('Create cycle validates that name is required', async ({ page, baseURL }) => {
    await loginAndGoToCycles(page, baseURL!);

    // Open create modal
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Set dates but leave name empty
    await page.getByTestId('create-cycle-start-date-input').fill('2026-02-12');
    await page.getByTestId('create-cycle-end-date-input').fill('2026-02-25');

    // Click Create
    await page.getByTestId('create-cycle-submit-btn').click();

    // Verify validation error for name
    await expect(page.getByTestId('create-cycle-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-cycle-name-error')).toContainText('Name is required');

    // Modal should still be open
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible();
  });

  test('Create cycle validates that end date is after start date', async ({ page, baseURL }) => {
    await loginAndGoToCycles(page, baseURL!);

    // Open create modal
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Fill name and set end date before start date
    await page.getByTestId('create-cycle-name-input').fill('Sprint 5');
    await page.getByTestId('create-cycle-start-date-input').fill('2026-02-25');
    await page.getByTestId('create-cycle-end-date-input').fill('2026-02-12');

    // Click Create
    await page.getByTestId('create-cycle-submit-btn').click();

    // Verify validation error for end date
    await expect(page.getByTestId('create-cycle-end-date-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-cycle-end-date-error')).toContainText('End date must be after start date');

    // Modal should still be open
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible();
  });

  test('Create cycle validates start and end dates are required', async ({ page, baseURL }) => {
    await loginAndGoToCycles(page, baseURL!);

    // Open create modal
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Fill name only, leave dates empty
    await page.getByTestId('create-cycle-name-input').fill('Sprint 5');

    // Click Create
    await page.getByTestId('create-cycle-submit-btn').click();

    // Verify validation errors for both dates
    await expect(page.getByTestId('create-cycle-start-date-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-cycle-start-date-error')).toContainText('Start date is required');

    await expect(page.getByTestId('create-cycle-end-date-error')).toBeVisible();
    await expect(page.getByTestId('create-cycle-end-date-error')).toContainText('End date is required');

    // Modal should still be open
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible();
  });

  test('Cancel button closes the create cycle modal without creating', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    // Get initial cycle count
    const initialCycles = await getCycles(baseURL!, token, team.id);
    const _initialCount = initialCycles.length;

    // Open create modal
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Fill in name
    await page.getByTestId('create-cycle-name-input').fill('Sprint 5');

    // Click Cancel
    await page.getByTestId('create-cycle-cancel-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-cycle-modal')).toHaveCount(0, { timeout: 10000 });

    // Verify no new cycle was created via API
    const afterCycles = await getCycles(baseURL!, token, team.id);
    expect(afterCycles.length).toBe(initialCount);
  });

  test('Only one cycle can be active at a time per team', async ({ page, baseURL }) => {
    const { token, team } = await loginAndGoToCycles(page, baseURL!);

    // Seed data has Sprint 12 (2026-03-10 to 2026-03-24) which is active
    // Create a new cycle with overlapping dates
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    const cycleName = `Sprint 5 ${Date.now()}`;
    await page.getByTestId('create-cycle-name-input').fill(cycleName);
    await page.getByTestId('create-cycle-start-date-input').fill('2026-03-15');
    await page.getByTestId('create-cycle-end-date-input').fill('2026-03-28');
    await page.getByTestId('create-cycle-submit-btn').click();

    // Wait for modal to close
    await expect(page.getByTestId('create-cycle-modal')).toHaveCount(0, { timeout: 30000 });

    // Wait for cycle list to load
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });

    // Get updated cycles from API
    const cycles = await getCycles(baseURL!, token, team.id);
    const activeCycles = cycles.filter((c: { isActive: boolean }) => c.isActive);

    // Only one cycle should be active
    expect(activeCycles.length).toBeLessThanOrEqual(1);

    // Verify in UI: count active badges
    const activeBadges = page.locator('[data-testid^="cycle-active-badge-"]');
    await expect(activeBadges).toHaveCount(activeCycles.length, { timeout: 15000 });
  });

  test('Creating a cycle persists after page refresh', async ({ page, baseURL }) => {
    const { token: _token, team: _team } = await loginAndGoToCycles(page, baseURL!);

    // Create a new cycle
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    const cycleName = `Sprint Persist ${Date.now()}`;
    await page.getByTestId('create-cycle-name-input').fill(cycleName);
    await page.getByTestId('create-cycle-start-date-input').fill('2026-06-01');
    await page.getByTestId('create-cycle-end-date-input').fill('2026-06-14');
    await page.getByTestId('create-cycle-submit-btn').click();

    // Wait for modal to close
    await expect(page.getByTestId('create-cycle-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify cycle appears in list
    await expect(page.getByTestId('cycle-list')).toContainText(cycleName, { timeout: 15000 });

    // Refresh the page
    await page.reload();
    await expect(page.getByTestId('active-cycle-page')).toBeVisible({ timeout: 30000 });

    // Verify cycle still shows after refresh
    await expect(page.getByTestId('cycle-list')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('cycle-list')).toContainText(cycleName, { timeout: 15000 });
  });

  test('Create cycle modal can be opened, cancelled, and reopened', async ({ page, baseURL }) => {
    await loginAndGoToCycles(page, baseURL!);

    // Open modal first time
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Fill in name
    await page.getByTestId('create-cycle-name-input').fill('Sprint X');

    // Cancel
    await page.getByTestId('create-cycle-cancel-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toHaveCount(0, { timeout: 10000 });

    // Reopen modal
    await page.getByTestId('new-cycle-btn').click();
    await expect(page.getByTestId('create-cycle-modal')).toBeVisible({ timeout: 10000 });

    // Verify fields are empty (form reset)
    await expect(page.getByTestId('create-cycle-name-input')).toHaveValue('');
    await expect(page.getByTestId('create-cycle-start-date-input')).toHaveValue('');
    await expect(page.getByTestId('create-cycle-end-date-input')).toHaveValue('');

    // Verify modal still works - can fill and submit
    await expect(page.getByTestId('create-cycle-submit-btn')).toBeVisible();
    await expect(page.getByTestId('create-cycle-cancel-btn')).toBeVisible();
  });
});
