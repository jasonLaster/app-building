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

// Helper to delete all non-seed teams via API
async function deleteTestTeams(baseURL: string, token: string) {
  const teams = await getTeams(baseURL, token);
  for (const team of teams) {
    if (team.identifier !== 'ENG' && team.identifier !== 'DES') {
      await fetch(`${baseURL}/api/teams/${team.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }
}

// Helper to reset ENG team to seed values
async function resetEngTeam(baseURL: string, token: string) {
  const teams = await getTeams(baseURL, token);
  const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG' || t.name === 'Engineering');
  if (engTeam) {
    await fetch(`${baseURL}/api/teams/${engTeam.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Engineering', identifier: 'ENG', description: 'Core product engineering team' }),
    });
  }
}

// Helper to login and navigate to a specific team's settings
async function loginAndNavigateToTeamSettings(
  page: import('@playwright/test').Page,
  baseURL: string,
  teamIdentifier: string,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/settings/teams');
  await expect(page.getByTestId('teams-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

  // Find and click the team card by identifier
  const teams = await getTeams(baseURL, data.token);
  const team = teams.find((t: { identifier: string }) => t.identifier === teamIdentifier);
  expect(team).toBeTruthy();

  await page.getByTestId(`team-card-${team.id}`).click();
  await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });

  return { token: data.token, team };
}

test.describe('Team Settings', () => {
  test.beforeEach(async ({ baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await deleteTestTeams(baseURL!, data.token);
    await resetEngTeam(baseURL!, data.token);
  });

  test('Team settings page renders with editable fields', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Team name field
    const nameValue = page.getByTestId('team-settings-name-value');
    await expect(nameValue).toBeVisible();
    await expect(nameValue).toHaveText(/Engineering/);

    // Identifier prefix field
    const identifierValue = page.getByTestId('team-settings-identifier-value');
    await expect(identifierValue).toBeVisible();
    await expect(identifierValue).toHaveText(/ENG/);

    // Description field
    const descriptionValue = page.getByTestId('team-settings-description-value');
    await expect(descriptionValue).toBeVisible();
    await expect(descriptionValue).toContainText('Core product engineering team');

    // Team Members section
    await expect(page.getByTestId('team-settings-members-section')).toBeVisible();

    // Back button
    await expect(page.getByTestId('team-settings-back-btn')).toBeVisible();

    // Delete Team button
    await expect(page.getByTestId('team-settings-delete-btn')).toBeVisible();
  });

  test('Inline edit team name', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the name to enter edit mode
    await page.getByTestId('team-settings-name-value').click();
    const nameInput = page.getByTestId('team-settings-name-input');
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Clear and type new name
    await nameInput.fill('Platform Engineering');
    await nameInput.press('Enter');

    // Verify the name updated
    await expect(page.getByTestId('team-settings-name-value')).toHaveText(/Platform Engineering/, { timeout: 15000 });

    // Reload to verify persistence
    await page.reload();
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-settings-name-value')).toHaveText(/Platform Engineering/, { timeout: 15000 });
  });

  test('Inline edit team name with empty value rejected', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the name to enter edit mode
    await page.getByTestId('team-settings-name-value').click();
    const nameInput = page.getByTestId('team-settings-name-input');
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // Clear the value and try to confirm
    await nameInput.fill('');
    await nameInput.press('Enter');

    // Validation error should appear
    await expect(page.getByTestId('team-settings-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('team-settings-name-error')).toContainText('cannot be empty');
  });

  test('Inline edit team identifier prefix', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the identifier to enter edit mode
    await page.getByTestId('team-settings-identifier-value').click();
    const identInput = page.getByTestId('team-settings-identifier-input');
    await expect(identInput).toBeVisible({ timeout: 10000 });

    // Change the prefix
    await identInput.fill('ENGR');
    await identInput.press('Enter');

    // Verify the identifier updated
    await expect(page.getByTestId('team-settings-identifier-value')).toHaveText(/ENGR/, { timeout: 15000 });

    // Reload to verify persistence
    await page.reload();
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-settings-identifier-value')).toHaveText(/ENGR/, { timeout: 15000 });
  });

  test('Inline edit team identifier prefix enforces uppercase and 2-5 char limit', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the identifier to enter edit mode
    await page.getByTestId('team-settings-identifier-value').click();
    const identInput = page.getByTestId('team-settings-identifier-input');
    await expect(identInput).toBeVisible({ timeout: 10000 });

    // Enter lowercase single char "a"
    await identInput.fill('a');

    // The input auto-uppercases, so it should be "A"
    await expect(identInput).toHaveValue('A');

    // Try to confirm with just 1 char
    await identInput.press('Enter');

    // Validation error about 2-5 chars
    await expect(page.getByTestId('team-settings-identifier-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('team-settings-identifier-error')).toContainText('2-5');
  });

  test('Inline edit team identifier prefix rejects duplicate prefix', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the identifier to enter edit mode
    await page.getByTestId('team-settings-identifier-value').click();
    const identInput = page.getByTestId('team-settings-identifier-input');
    await expect(identInput).toBeVisible({ timeout: 10000 });

    // Try to change to DES which is already used by the Design team
    await identInput.fill('DES');
    await identInput.press('Enter');

    // Error should indicate duplicate
    await expect(page.getByTestId('team-settings-identifier-error')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('team-settings-identifier-error')).toContainText('already exists');
  });

  test('Inline edit team description', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the description to enter edit mode
    await page.getByTestId('team-settings-description-value').click();
    const descInput = page.getByTestId('team-settings-description-input');
    await expect(descInput).toBeVisible({ timeout: 10000 });

    // Change the description
    await descInput.fill('Platform and infrastructure engineering');
    // Blur to save (description saves on blur since Enter creates newlines in textarea)
    await descInput.blur();

    // Verify the description updated
    await expect(page.getByTestId('team-settings-description-value')).toContainText(
      'Platform and infrastructure engineering',
      { timeout: 15000 }
    );

    // Reload to verify persistence
    await page.reload();
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('team-settings-description-value')).toContainText(
      'Platform and infrastructure engineering',
      { timeout: 15000 }
    );
  });

  test('Inline edit team description can be cleared', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click on the description to enter edit mode
    await page.getByTestId('team-settings-description-value').click();
    const descInput = page.getByTestId('team-settings-description-input');
    await expect(descInput).toBeVisible({ timeout: 10000 });

    // Clear the description
    await descInput.fill('');
    await descInput.blur();

    // Description should show placeholder/empty state
    await expect(page.getByTestId('team-settings-description-value')).toContainText(
      'No description',
      { timeout: 15000 }
    );
  });

  test('Delete team button shows confirmation dialog', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click Delete Team button
    await page.getByTestId('team-settings-delete-btn').click();

    // Confirmation dialog should appear
    await expect(page.getByTestId('team-settings-delete-confirm')).toBeVisible({ timeout: 10000 });

    // Dialog should mention the team name
    await expect(page.getByTestId('team-settings-delete-confirm')).toContainText('Engineering');
    await expect(page.getByTestId('team-settings-delete-confirm')).toContainText('cannot be undone');

    // Confirm and Cancel buttons should be visible
    await expect(page.getByTestId('team-settings-confirm-delete-btn')).toBeVisible();
    await expect(page.getByTestId('team-settings-cancel-delete-btn')).toBeVisible();

    // Team should NOT be deleted yet - cancel and verify
    await page.getByTestId('team-settings-cancel-delete-btn').click();
    await expect(page.getByTestId('team-settings-delete-confirm')).toHaveCount(0, { timeout: 10000 });

    // Team settings should still be visible
    await expect(page.getByTestId('team-settings')).toBeVisible();
    await expect(page.getByTestId('team-settings-name-value')).toHaveText(/Engineering/);
  });

  test('Confirm delete team removes the team and navigates back', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');

    // Create a third team so workspace has 3 teams
    await fetch(`${baseURL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ name: `TestTeam ${Date.now()}`, identifier: 'TST', description: '' }),
    });

    // Count initial teams
    const initialTeams = await getTeams(baseURL!, data.token);
    const initialCount = initialTeams.length;
    expect(initialCount).toBeGreaterThanOrEqual(3);

    // Navigate to ENG team settings
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto('/settings/teams');
    await expect(page.getByTestId('teams-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    const engTeam = initialTeams.find((t: { identifier: string }) => t.identifier === 'ENG');
    expect(engTeam).toBeTruthy();
    await page.getByTestId(`team-card-${engTeam.id}`).click();
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });

    // Open delete confirmation and confirm
    await page.getByTestId('team-settings-delete-btn').click();
    await expect(page.getByTestId('team-settings-delete-confirm')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('team-settings-confirm-delete-btn').click();

    // Should navigate back to /settings/teams
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveURL(/\/settings\/teams/, { timeout: 30000 });

    // Team count should be reduced by 1
    await expect(page.locator('[data-testid^="team-card-"]')).toHaveCount(initialCount - 1, { timeout: 15000 });

    // "Engineering" should no longer appear in the grid
    await expect(
      page.locator('[data-testid^="team-card-"]').filter({ hasText: /Engineering/ })
    ).toHaveCount(0, { timeout: 15000 });

    // Sidebar should no longer show the Engineering team section
    await expect(page.getByTestId(`sidebar-team-${engTeam.id}`)).toHaveCount(0, { timeout: 15000 });
  });

  test('Cancel delete team keeps the team', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Open delete confirmation dialog
    await page.getByTestId('team-settings-delete-btn').click();
    await expect(page.getByTestId('team-settings-delete-confirm')).toBeVisible({ timeout: 10000 });

    // Click Cancel
    await page.getByTestId('team-settings-cancel-delete-btn').click();

    // Dialog should close
    await expect(page.getByTestId('team-settings-delete-confirm')).toHaveCount(0, { timeout: 10000 });

    // Team is not deleted — user remains on team settings page
    await expect(page.getByTestId('team-settings')).toBeVisible();
    await expect(page.getByTestId('team-settings-name-value')).toHaveText(/Engineering/);

    // Verify the team still exists via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { name: string }) => t.name === 'Engineering');
    expect(engTeam).toBeTruthy();
  });

  test('Back navigation from team settings returns to teams list', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Click the Back button
    await page.getByTestId('team-settings-back-btn').click();

    // Should navigate back to /settings/teams with the teams grid visible
    await expect(page).toHaveURL(/\/settings\/teams/, { timeout: 30000 });
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Team cards should be present
    await expect(page.locator('[data-testid^="team-card-"]')).toHaveCount(2, { timeout: 15000 });
  });

  test('Team settings changes are reflected in sidebar navigation', async ({ page, baseURL }) => {
    test.slow();
    const { token, team } = await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Sidebar should show "Engineering" team section
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });
    const teamHeader = page.getByTestId(`sidebar-team-header-${team.id}`);
    await expect(teamHeader).toContainText('Engineering', { timeout: 15000 });

    // Change the team name to "Platform"
    await page.getByTestId('team-settings-name-value').click();
    const nameInput = page.getByTestId('team-settings-name-input');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('Platform');
    await nameInput.press('Enter');

    // Verify the name updated in settings
    await expect(page.getByTestId('team-settings-name-value')).toHaveText(/Platform/, { timeout: 15000 });

    // Sidebar should now show "Platform" instead of "Engineering" without reload
    await expect(teamHeader).toContainText('Platform', { timeout: 15000 });
  });
});
