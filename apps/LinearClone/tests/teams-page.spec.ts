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

// Helper to delete all teams via API
async function deleteAllTeams(baseURL: string, token: string) {
  const teams = await getTeams(baseURL, token);
  for (const team of teams) {
    await fetch(`${baseURL}/api/teams/${team.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

// Helper to create a team via API
async function createTeamViaApi(
  baseURL: string,
  token: string,
  data: { name: string; identifier: string; description?: string }
) {
  const response = await fetch(`${baseURL}/api/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Helper to login and navigate to teams page
async function loginAndNavigateToTeams(
  page: import('@playwright/test').Page,
  baseURL: string,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/settings/teams');
  await expect(page.getByTestId('teams-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user };
}

test.describe.serial('Teams Page', () => {
  test('Teams page renders with list of all teams as cards', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    // Verify the page title
    await expect(page.getByTestId('teams-title')).toBeVisible();
    await expect(page.getByTestId('teams-title')).toHaveText('Teams');

    // Verify the teams grid is visible
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Verify team cards are rendered (seed has 2 teams: Engineering, Design)
    const teamCards = page.locator('[data-testid^="team-card-"]:not([data-testid*="-prefix-"]):not([data-testid*="-name-"]):not([data-testid*="-members-"]):not([data-testid*="-cycle-"])');
    await expect(teamCards).toHaveCount(2, { timeout: 30000 });
  });

  test('Team card displays team name prominently', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToTeams(page, baseURL!);
    const teams = await getTeams(baseURL!, token);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Verify each team card displays its name
    for (const team of teams) {
      const nameEl = page.getByTestId(`team-card-name-${team.id}`);
      await expect(nameEl).toBeVisible();
      await expect(nameEl).toHaveText(team.name);
    }
  });

  test('Team card displays identifier prefix', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToTeams(page, baseURL!);
    const teams = await getTeams(baseURL!, token);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Verify each team card displays its identifier prefix
    for (const team of teams) {
      const prefixEl = page.getByTestId(`team-card-prefix-${team.id}`);
      await expect(prefixEl).toBeVisible();
      await expect(prefixEl).toHaveText(team.identifier);
    }
  });

  test('Team card displays member count', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToTeams(page, baseURL!);
    const teams = await getTeams(baseURL!, token);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Verify each team card displays member count
    for (const team of teams) {
      const membersEl = page.getByTestId(`team-card-members-${team.id}`);
      await expect(membersEl).toBeVisible();
      const memberText = team.member_count === 1 ? '1 member' : `${team.member_count} members`;
      await expect(membersEl).toContainText(memberText);
    }
  });

  test('Team card displays active cycle name when team has an active cycle', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToTeams(page, baseURL!);
    const teams = await getTeams(baseURL!, token);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Engineering team has active cycle "Sprint 12"
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    expect(engTeam).toBeTruthy();
    expect(engTeam.active_cycle_name).toBeTruthy();

    const cycleEl = page.getByTestId(`team-card-cycle-${engTeam.id}`);
    await expect(cycleEl).toBeVisible();
    await expect(cycleEl).toContainText(engTeam.active_cycle_name);
  });

  test('Team card displays no cycle indicator when team has no active cycle', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToTeams(page, baseURL!);
    const teams = await getTeams(baseURL!, token);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Design team has no active cycle
    const desTeam = teams.find((t: { identifier: string }) => t.identifier === 'DES');
    expect(desTeam).toBeTruthy();
    expect(desTeam.active_cycle_name).toBeNull();

    const cycleEl = page.getByTestId(`team-card-cycle-${desTeam.id}`);
    await expect(cycleEl).toBeVisible();
    await expect(cycleEl).toContainText('No active cycle');
  });

  test('Clicking a team card navigates to team settings', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToTeams(page, baseURL!);
    const teams = await getTeams(baseURL!, token);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Click the first team card
    const firstTeam = teams[0];
    await page.getByTestId(`team-card-${firstTeam.id}`).click();

    // Verify team settings is displayed
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });

    // Verify the team name is shown in settings
    await expect(page.getByTestId('team-settings-name-value')).toHaveText(firstTeam.name);
  });

  test('Teams page shows empty state when no teams exist', async ({ page, baseURL }) => {
    // Delete all teams first
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await deleteAllTeams(baseURL!, data.token);

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto('/settings/teams');
    await expect(page.getByTestId('teams-page')).toBeVisible({ timeout: 30000 });

    // Verify empty state is shown
    await expect(page.getByTestId('teams-empty')).toBeVisible({ timeout: 30000 });

    // Verify teams grid is not shown
    await expect(page.getByTestId('teams-grid')).toHaveCount(0);

    // Create Team button should still be visible
    await expect(page.getByTestId('create-team-btn')).toBeVisible();
  });

  test('Teams page updates after creating a new team', async ({ page, baseURL }) => {
    const { token: _token } = await loginAndNavigateToTeams(page, baseURL!);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Count initial teams
    const initialCards = page.locator('[data-testid^="team-card-"]:not([data-testid*="-prefix-"]):not([data-testid*="-name-"]):not([data-testid*="-members-"]):not([data-testid*="-cycle-"])');
    const initialCount = await initialCards.count();

    // Create a new team via the modal
    const uniqueName = `New Team ${Date.now()}`;
    const uniquePrefix = `NT${Date.now()}`.slice(0, 4).toUpperCase();

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-team-name-input').fill(uniqueName);
    await page.getByTestId('create-team-identifier-input').fill(uniquePrefix);
    await page.getByTestId('create-team-submit-btn').click();

    // Wait for modal to close
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 15000 });

    // Verify the new team card appears
    await expect(initialCards).toHaveCount(initialCount + 1, { timeout: 15000 });
  });

  test('Teams page updates after deleting a team from team settings', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndNavigateToTeams(page, baseURL!);

    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Create a team to delete so we don't affect seed data
    const uniqueName = `Delete Me ${Date.now()}`;
    const uniquePrefix = `DM${Date.now()}`.slice(0, 3).toUpperCase();
    await createTeamViaApi(baseURL!, token, { name: uniqueName, identifier: uniquePrefix });

    // Reload to see the new team
    await page.goto('/settings/teams');
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Count teams before deletion
    const cardsLocator = page.locator('[data-testid^="team-card-"]:not([data-testid*="-prefix-"]):not([data-testid*="-name-"]):not([data-testid*="-members-"]):not([data-testid*="-cycle-"])');
    const countBefore = await cardsLocator.count();

    // Find and click the team we created
    const newTeamCard = cardsLocator.filter({ has: page.locator(`[data-testid^="team-card-name-"]`, { hasText: uniqueName }) });
    await expect(newTeamCard).toHaveCount(1, { timeout: 15000 });
    await newTeamCard.click();

    // Verify we're in team settings
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });

    // Delete the team
    await page.getByTestId('team-settings-delete-btn').click();
    await expect(page.getByTestId('team-settings-delete-confirm')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('team-settings-confirm-delete-btn').click();

    // Should navigate back to teams list
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Verify team count decreased
    await expect(cardsLocator).toHaveCount(countBefore - 1, { timeout: 15000 });

    // Verify the deleted team is no longer present
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(0, { timeout: 15000 });
  });
});
