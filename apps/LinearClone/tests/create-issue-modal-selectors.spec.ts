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

// Helper to login and open create issue modal from ENG team page
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

  // Open create issue modal
  await page.getByTestId('new-issue-btn').click();
  await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

  return { token: data.token, user: data.user, team, teams };
}

test.describe('CreateIssueModalSelectors', () => {
  test('Priority dropdown defaults to No Priority', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify priority shows "No Priority" as default
    await expect(page.getByTestId('create-issue-priority-selector')).toContainText('No Priority');

    // Verify the priority selector has an SVG icon
    const priorityIcon = page.getByTestId('create-issue-priority-selector').locator('svg').first();
    await expect(priorityIcon).toBeVisible();
  });

  test('Priority dropdown shows all priority options with icons', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click the priority dropdown
    await page.getByTestId('create-issue-priority-selector').click();
    await expect(page.getByTestId('create-issue-priority-dropdown')).toBeVisible();

    // Verify all 5 priority options are visible with correct labels
    await expect(page.getByTestId('create-issue-priority-option-urgent')).toBeVisible();
    await expect(page.getByTestId('create-issue-priority-option-urgent')).toContainText('Urgent');

    await expect(page.getByTestId('create-issue-priority-option-high')).toBeVisible();
    await expect(page.getByTestId('create-issue-priority-option-high')).toContainText('High');

    await expect(page.getByTestId('create-issue-priority-option-medium')).toBeVisible();
    await expect(page.getByTestId('create-issue-priority-option-medium')).toContainText('Medium');

    await expect(page.getByTestId('create-issue-priority-option-low')).toBeVisible();
    await expect(page.getByTestId('create-issue-priority-option-low')).toContainText('Low');

    await expect(page.getByTestId('create-issue-priority-option-none')).toBeVisible();
    await expect(page.getByTestId('create-issue-priority-option-none')).toContainText('No Priority');

    // Verify each option has an icon (SVG)
    for (const priority of ['urgent', 'high', 'medium', 'low', 'none']) {
      const option = page.getByTestId(`create-issue-priority-option-${priority}`);
      await expect(option.locator('svg').first()).toBeVisible();
    }
  });

  test('Priority dropdown allows selecting a priority', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify initial priority is "No Priority"
    await expect(page.getByTestId('create-issue-priority-selector')).toContainText('No Priority');

    // Click priority dropdown and select "High"
    await page.getByTestId('create-issue-priority-selector').click();
    await expect(page.getByTestId('create-issue-priority-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-priority-option-high').click();

    // Verify priority now shows "High"
    await expect(page.getByTestId('create-issue-priority-selector')).toContainText('High');

    // Verify the priority selector has an icon
    const priorityIcon = page.getByTestId('create-issue-priority-selector').locator('svg').first();
    await expect(priorityIcon).toBeVisible();
  });

  test('Assignee selector is searchable', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click the assignee selector
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();

    // Type search text "Ali"
    await page.getByTestId('create-issue-assignee-search').fill('Ali');

    // Verify only Alice Johnson is shown (filtered results)
    const options = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Johnson/ });
    await expect(options).toHaveCount(1, { timeout: 10000 });
    await expect(options).toContainText('Alice Johnson');

    // Verify Bob Smith is not shown
    await expect(
      page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Bob Smith/ })
    ).toHaveCount(0);
  });

  test('Assignee selector allows selecting a member', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify assignee is initially empty
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('No assignee');

    // Click assignee selector
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();

    // Type "Bob" to search
    await page.getByTestId('create-issue-assignee-search').fill('Bob');

    // Click Bob Smith
    const bobOption = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Bob Smith/ });
    await expect(bobOption).toBeVisible({ timeout: 10000 });
    await bobOption.click();

    // Verify assignee shows "Bob Smith"
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('Bob Smith');
  });

  test('Labels multi-select allows selecting multiple labels', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click labels selector
    await page.getByTestId('create-issue-labels-selector').click();
    await expect(page.getByTestId('create-issue-labels-dropdown')).toBeVisible();

    // Select "Bug" label
    const bugOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    // Select "Feature" label
    const featureOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Feature$/ });
    await featureOption.click();

    // Verify both labels appear as badges
    const selectedLabels = page.getByTestId('create-issue-selected-labels');
    await expect(selectedLabels).toBeVisible();
    await expect(selectedLabels).toContainText('Bug');
    await expect(selectedLabels).toContainText('Feature');
  });

  test('Labels multi-select allows removing a selected label', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Select "Bug" and "Feature" labels
    await page.getByTestId('create-issue-labels-selector').click();
    await expect(page.getByTestId('create-issue-labels-dropdown')).toBeVisible();

    const bugOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    const featureOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Feature$/ });
    await featureOption.click();

    // Close dropdown by clicking elsewhere on the form
    await page.getByTestId('create-issue-title-input').click();

    // Verify both labels are selected
    const selectedLabels = page.getByTestId('create-issue-selected-labels');
    await expect(selectedLabels).toContainText('Bug');
    await expect(selectedLabels).toContainText('Feature');

    // Find the Bug label badge and click its remove button
    const bugBadges = selectedLabels.locator('.cif-label-badge').filter({ hasText: /^Bug/ });
    await bugBadges.locator('.cif-label-remove').click();

    // Verify only "Feature" remains
    await expect(selectedLabels).toContainText('Feature');
    await expect(selectedLabels).not.toContainText('Bug');
  });

  test('Project selector is searchable', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click the project selector
    await page.getByTestId('create-issue-project-selector').click();
    await expect(page.getByTestId('create-issue-project-dropdown')).toBeVisible();

    // Verify search input is present
    await expect(page.getByTestId('create-issue-project-search')).toBeVisible();

    // Type search text — seed data has "V2 Launch" project
    await page.getByTestId('create-issue-project-search').fill('V2');

    // Verify "V2 Launch" is visible in the filtered results
    const projectOptions = page.getByTestId('create-issue-project-dropdown').locator('button').filter({ hasText: /V2 Launch/ });
    await expect(projectOptions).toHaveCount(1, { timeout: 10000 });
  });

  test('Project selector allows selecting a project', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify project is initially empty
    await expect(page.getByTestId('create-issue-project-selector')).toContainText('No project');

    // Click project selector
    await page.getByTestId('create-issue-project-selector').click();
    await expect(page.getByTestId('create-issue-project-dropdown')).toBeVisible();

    // Select "V2 Launch" project
    const projectOption = page.getByTestId('create-issue-project-dropdown').locator('button').filter({ hasText: /V2 Launch/ });
    await expect(projectOption).toBeVisible({ timeout: 10000 });
    await projectOption.click();

    // Verify project field shows "V2 Launch"
    await expect(page.getByTestId('create-issue-project-selector')).toContainText('V2 Launch');
  });
});
