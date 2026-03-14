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

// Helper to login and open create issue modal from a team page
async function loginAndOpenCreateModal(
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
  await page.goto(`/team/${team.id}/issues`);
  await expect(page.getByTestId('team-issues-page')).toBeVisible({ timeout: 30000 });

  await page.getByTestId('new-issue-btn').click();
  await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

  return { token: data.token, user: data.user, team, teams };
}

test.describe('CreateIssueModalCyclesDates', () => {
  test('Cycle dropdown shows team\'s available cycles', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click the cycle dropdown
    await page.getByTestId('create-issue-cycle-selector').click();
    await expect(page.getByTestId('create-issue-cycle-dropdown')).toBeVisible();

    // Verify "Sprint 12" cycle is shown (seed data for ENG team)
    const cycleOptions = page.getByTestId('create-issue-cycle-dropdown').locator('button').filter({ hasText: /Sprint 12/ });
    await expect(cycleOptions).toHaveCount(1, { timeout: 10000 });
    await expect(cycleOptions).toContainText('Sprint 12');

    // Verify the active badge is shown (Sprint 12 is active: 2026-03-10 to 2026-03-24)
    const activeBadge = page.getByTestId('create-issue-cycle-dropdown').locator('.cif-active-badge');
    await expect(activeBadge).toBeVisible();
  });

  test('Cycle dropdown allows selecting a cycle', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify cycle is initially empty
    await expect(page.getByTestId('create-issue-cycle-selector')).toContainText('No cycle');

    // Click cycle dropdown and select "Sprint 12"
    await page.getByTestId('create-issue-cycle-selector').click();
    await expect(page.getByTestId('create-issue-cycle-dropdown')).toBeVisible();

    const sprintOption = page.getByTestId('create-issue-cycle-dropdown').locator('button').filter({ hasText: /Sprint 12/ });
    await expect(sprintOption).toBeVisible({ timeout: 10000 });
    await sprintOption.click();

    // Verify cycle field shows "Sprint 12"
    await expect(page.getByTestId('create-issue-cycle-selector')).toContainText('Sprint 12');
  });

  test('Cycle dropdown updates when team is changed', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify ENG team's Sprint 12 cycle is available
    await page.getByTestId('create-issue-cycle-selector').click();
    await expect(page.getByTestId('create-issue-cycle-dropdown')).toBeVisible();
    const engCycle = page.getByTestId('create-issue-cycle-dropdown').locator('button').filter({ hasText: /Sprint 12/ });
    await expect(engCycle).toHaveCount(1, { timeout: 10000 });

    // Select Sprint 12 cycle
    await engCycle.click();
    await expect(page.getByTestId('create-issue-cycle-selector')).toContainText('Sprint 12');

    // Change team to Design
    await page.getByTestId('create-issue-team-selector').click();
    await expect(page.getByTestId('create-issue-team-dropdown')).toBeVisible();
    const designOption = page.getByTestId('create-issue-team-dropdown').locator('button').filter({ hasText: /^Design$/ });
    await designOption.click();

    // Verify team is now Design
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Design');

    // Verify cycle selection was cleared
    await expect(page.getByTestId('create-issue-cycle-selector')).toContainText('No cycle');

    // Design team has no cycles in seed data, so dropdown should show no cycles
    await page.getByTestId('create-issue-cycle-selector').click();
    await expect(page.getByTestId('create-issue-cycle-dropdown')).toBeVisible();
    const noCyclesMsg = page.getByTestId('create-issue-cycle-dropdown').locator('.cif-dropdown-empty');
    await expect(noCyclesMsg).toContainText('No cycles available', { timeout: 10000 });
  });

  test('Due date picker allows selecting a date', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify due date is initially empty (no display shown)
    await expect(page.getByTestId('create-issue-due-date-display')).toHaveCount(0);

    // Set a date via the date input
    await page.getByTestId('create-issue-due-date-input').fill('2026-03-25');

    // Verify the formatted display appears
    await expect(page.getByTestId('create-issue-due-date-display')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-issue-due-date-display')).toContainText('Mar 25, 2026');
  });

  test('Due date picker allows clearing the date', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Set a date first
    await page.getByTestId('create-issue-due-date-input').fill('2026-03-25');
    await expect(page.getByTestId('create-issue-due-date-display')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-issue-due-date-display')).toContainText('Mar 25, 2026');

    // Click the clear button
    await page.getByTestId('create-issue-due-date-clear').click();

    // Verify the due date display is gone
    await expect(page.getByTestId('create-issue-due-date-display')).toHaveCount(0, { timeout: 10000 });
  });

  test('Parent issue selector is searchable', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click the parent issue selector
    await page.getByTestId('create-issue-parent-selector').click();
    await expect(page.getByTestId('create-issue-parent-dropdown')).toBeVisible();

    // Verify search input is present
    await expect(page.getByTestId('create-issue-parent-search')).toBeVisible();

    // Type "Fix login" to search for the first seed issue
    await page.getByTestId('create-issue-parent-search').fill('Fix login');

    // Verify matching issue appears in results
    const matchingOption = page.getByTestId('create-issue-parent-dropdown').locator('button').filter({ hasText: /Fix login session expiration bug/ });
    await expect(matchingOption).toHaveCount(1, { timeout: 10000 });
    await expect(matchingOption).toContainText('ENG-1');
  });

  test('Parent issue selector allows selecting a parent', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify parent issue is initially empty
    await expect(page.getByTestId('create-issue-parent-selector')).toContainText('No parent issue');

    // Click parent selector
    await page.getByTestId('create-issue-parent-selector').click();
    await expect(page.getByTestId('create-issue-parent-dropdown')).toBeVisible();

    // Search for and select the first ENG issue
    await page.getByTestId('create-issue-parent-search').fill('Fix login');
    const parentOption = page.getByTestId('create-issue-parent-dropdown').locator('button').filter({ hasText: /Fix login session expiration bug/ });
    await expect(parentOption).toBeVisible({ timeout: 10000 });
    await parentOption.click();

    // Verify parent issue field shows the selected issue
    await expect(page.getByTestId('create-issue-parent-selector')).toContainText('ENG-1');
    await expect(page.getByTestId('create-issue-parent-selector')).toContainText('Fix login session expiration bug');
  });

  test('Assignee selector can be used multiple times', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Select Alice Johnson
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-assignee-search').fill('Alice');
    const aliceOption = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Alice Johnson/ });
    await expect(aliceOption).toBeVisible({ timeout: 10000 });
    await aliceOption.click();
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('Alice Johnson');

    // Clear selection and select Bob Smith
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-assignee-option-none').click();
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('No assignee');

    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-assignee-search').fill('Bob');
    const bobOption = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Bob Smith/ });
    await expect(bobOption).toBeVisible({ timeout: 10000 });
    await bobOption.click();
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('Bob Smith');

    // Now change to Carol Davis
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-assignee-search').fill('Carol');
    const carolOption = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Carol Davis/ });
    await expect(carolOption).toBeVisible({ timeout: 10000 });
    await carolOption.click();

    // Verify Carol Davis is selected after all changes
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('Carol Davis');
  });

  test('Labels selector can be used multiple times in sequence', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // First: select "Bug" label
    await page.getByTestId('create-issue-labels-selector').click();
    await expect(page.getByTestId('create-issue-labels-dropdown')).toBeVisible();
    const bugOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    // Close dropdown
    await page.getByTestId('create-issue-title-input').click();

    // Verify Bug badge is shown
    const selectedLabels = page.getByTestId('create-issue-selected-labels');
    await expect(selectedLabels).toContainText('Bug');

    // Second: open again and add "Feature"
    await page.getByTestId('create-issue-labels-selector').click();
    await expect(page.getByTestId('create-issue-labels-dropdown')).toBeVisible();
    const featureOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Feature$/ });
    await featureOption.click();

    // Close dropdown
    await page.getByTestId('create-issue-title-input').click();

    // Verify both labels are shown
    await expect(selectedLabels).toContainText('Bug');
    await expect(selectedLabels).toContainText('Feature');

    // Third: open again, remove "Bug" (toggle it off) and add "Improvement"
    await page.getByTestId('create-issue-labels-selector').click();
    await expect(page.getByTestId('create-issue-labels-dropdown')).toBeVisible();

    // Toggle Bug off
    const bugToggle = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Bug$/ });
    await bugToggle.click();

    // Toggle Improvement on
    const improvementOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Improvement$/ });
    await improvementOption.click();

    // Close dropdown
    await page.getByTestId('create-issue-title-input').click();

    // Verify final state: "Feature" and "Improvement" are shown, "Bug" is not
    await expect(selectedLabels).toContainText('Feature');
    await expect(selectedLabels).toContainText('Improvement');
    await expect(selectedLabels).not.toContainText('Bug');
  });

  test('Status dropdown can be changed multiple times', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify initial status is Backlog
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Backlog');

    // Change to Todo
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-todo').click();
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Todo');

    // Change to In Progress
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-in_progress').click();
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('In Progress');

    // Change back to Backlog
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-backlog').click();
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Backlog');
  });
});
