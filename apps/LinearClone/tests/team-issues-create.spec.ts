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

test.describe('TeamIssuesCreate', () => {
  test('New Issue button opens create issue modal with team pre-selected', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Click the New Issue button
    await page.getByTestId('new-issue-btn').click();

    // Verify the modal opens
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    // Verify the team selector shows "Engineering"
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Engineering');

    // Verify the title input is focused
    await expect(page.getByTestId('create-issue-title-input')).toBeFocused();
  });

  test('New Issue button text and icon appearance', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Verify the New Issue button is visible
    const newIssueBtn = page.getByTestId('new-issue-btn');
    await expect(newIssueBtn).toBeVisible();

    // Verify button text
    await expect(newIssueBtn).toContainText('New Issue');

    // Verify it has a plus icon (SVG with lines forming a +)
    const svg = newIssueBtn.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('Newly created issue appears in the list', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Wait for issues to load and count initial backlog issues
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });

    // Wait for seed issues to load (8 ENG issues in seed data)
    const initialRows = page.locator('[data-testid^="issue-row-"]');
    await expect(initialRows).toHaveCount(8, { timeout: 30000 });
    const initialCount = 8;

    // Click New Issue button
    await page.getByTestId('new-issue-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    // Fill in the title
    const issueTitle = `New feature request ${Date.now()}`;
    await page.getByTestId('create-issue-title-input').fill(issueTitle);

    // Status defaults to backlog, which is fine for our test

    // Submit the form by clicking Create button
    await page.getByTestId('create-issue-submit-btn').click();

    // Wait for success indicator
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });

    // Wait for modal to close
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify the new issue appears in the list (count increased by 1)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(initialCount + 1, { timeout: 30000 });

    // Verify the new issue title is visible in the backlog group
    const backlogItems = page.getByTestId('team-issue-group-items-backlog');
    await expect(backlogItems).toContainText(issueTitle, { timeout: 30000 });
  });
});
