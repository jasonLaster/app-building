import { test, expect } from '@playwright/test';

test('deployment: app displays data and supports updates', async ({ page, baseURL }) => {
  // Step 1: Login
  await page.goto(`${baseURL}/login`);
  await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 15000 });
  await page.getByPlaceholder('you@example.com').fill('alice@acme.com');
  await page.getByPlaceholder('Enter your password').fill('password123');
  await page.getByTestId('login-submit-button').click();

  // Wait for redirect to main app after login
  await page.waitForURL('**/my-issues', { timeout: 20000 });

  // Verify data displays on My Issues page - sidebar shows team names from DB
  await expect(page.getByTestId('sidebar-team-header-4c324c47-84c4-45b3-8100-58004d652755')).toBeVisible({ timeout: 15000 });

  // Step 2: Navigate to All Teams via sidebar link
  await page.locator('a[href="/settings/teams"]').click();
  await expect(page.getByTestId('create-team-btn')).toBeVisible({ timeout: 15000 });

  // Verify teams data displays on teams page
  await expect(page.getByTestId('team-card-name-4c324c47-84c4-45b3-8100-58004d652755')).toBeVisible({ timeout: 10000 });

  // Step 3: Verify data can be updated - create a team then delete it
  const testTeamName = `DeployTest-${Date.now()}`;

  await page.getByTestId('create-team-btn').click();
  await page.getByTestId('create-team-name-input').fill(testTeamName);
  await page.getByTestId('create-team-identifier-input').fill('DTX');
  await page.getByTestId('create-team-submit-btn').click();

  // Verify the team appears
  await expect(page.getByText(testTeamName).first()).toBeVisible({ timeout: 10000 });

  // Clean up: delete the test team via API to leave DB in clean state
  const cleanupToken = await page.evaluate(() => localStorage.getItem('session_token'));
  if (cleanupToken) {
    const teamsResp = await page.request.get(`${baseURL}/.netlify/functions/teams`, {
      headers: { Authorization: `Bearer ${cleanupToken}` },
    });
    const teamsData = await teamsResp.json();
    const testTeam = teamsData.teams?.find((t: { name: string }) => t.name === testTeamName);
    if (testTeam) {
      await page.request.delete(`${baseURL}/.netlify/functions/teams/${testTeam.id}`, {
        headers: { Authorization: `Bearer ${cleanupToken}` },
      });
    }
  }
});
