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

// Helper to get workspace via API
async function getWorkspace(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/workspace`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.workspace;
}

// Helper to reset workspace name via API
async function resetWorkspaceName(baseURL: string, token: string, name: string) {
  await fetch(`${baseURL}/api/workspace`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
}

// Helper to get teams via API
async function getTeams(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.teams;
}

// Helper to create a team via API
async function _createTeamViaApi(
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

// Helper to reset workspace default team via API
async function resetDefaultTeam(baseURL: string, token: string, teamId: string | null) {
  await fetch(`${baseURL}/api/workspace`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ default_team_id: teamId }),
  });
}

// Helper to login and navigate to settings page
async function loginAndNavigateToSettings(
  page: import('@playwright/test').Page,
  baseURL: string,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/settings');
  await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user };
}

test.describe.serial('Settings Page', () => {
  test('Settings page renders workspace name and default team fields', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    // Verify the page heading
    await expect(page.getByTestId('settings-title')).toBeVisible();
    await expect(page.getByTestId('settings-title')).toHaveText('Settings');

    // Verify workspace settings section is visible
    await expect(page.getByTestId('workspace-settings')).toBeVisible({ timeout: 30000 });

    // Verify workspace name input is pre-filled with seed workspace name
    const workspace = await getWorkspace(baseURL!, token);
    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(workspace.name);

    // Verify default team dropdown is visible and shows configured default team
    const teamSelector = page.getByTestId('workspace-default-team-selector');
    await expect(teamSelector).toBeVisible();

    // Get the default team name
    const teams = await getTeams(baseURL!, token);
    const defaultTeam = teams.find((t: { id: string }) => t.id === workspace.default_team_id);
    if (defaultTeam) {
      await expect(teamSelector).toContainText(defaultTeam.name);
    }
  });

  test('Edit workspace name inline', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    // Get current workspace name for cleanup
    const workspace = await getWorkspace(baseURL!, token);

    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible({ timeout: 30000 });

    // Clear and type new name
    const newName = `Acme Corp ${Date.now()}`;
    await nameInput.clear();
    await nameInput.fill(newName);

    // Click save
    await page.getByTestId('workspace-settings-save-btn').click();

    // Verify success message
    await expect(page.getByTestId('workspace-settings-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('workspace-settings-success')).toHaveText('Settings saved');

    // Verify sidebar workspace name is updated
    await expect(page.getByTestId('sidebar-workspace-name')).toContainText(newName, { timeout: 15000 });

    // Reset workspace name
    await resetWorkspaceName(baseURL!, token, workspace.name);
  });

  test('Workspace name cannot be saved as empty', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    const workspace = await getWorkspace(baseURL!, token);
    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible({ timeout: 30000 });

    // Clear the workspace name
    await nameInput.clear();

    // Attempt to save
    await page.getByTestId('workspace-settings-save-btn').click();

    // Verify validation error is shown
    await expect(page.getByTestId('workspace-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('workspace-name-error')).toContainText('required');

    // Verify workspace name is unchanged via API
    const updatedWorkspace = await getWorkspace(baseURL!, token);
    expect(updatedWorkspace.name).toBe(workspace.name);
  });

  test('Edit workspace name and verify persistence after navigation', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    const workspace = await getWorkspace(baseURL!, token);
    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible({ timeout: 30000 });

    // Change the name
    const newName = `New Name ${Date.now()}`;
    await nameInput.clear();
    await nameInput.fill(newName);
    await page.getByTestId('workspace-settings-save-btn').click();

    // Wait for success
    await expect(page.getByTestId('workspace-settings-success')).toBeVisible({ timeout: 30000 });

    // Navigate to My Issues via sidebar
    await page.getByTestId('sidebar-link-my-issues').click();
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Navigate back to settings via sidebar
    await page.getByTestId('sidebar-link-settings').click();
    await expect(page).toHaveURL(/\/settings$/, { timeout: 30000 });

    // Verify workspace name persisted
    await expect(page.getByTestId('workspace-name-input')).toHaveValue(newName, { timeout: 30000 });

    // Reset workspace name
    await resetWorkspaceName(baseURL!, token, workspace.name);
  });

  test('Change default team for new issues', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    const workspace = await getWorkspace(baseURL!, token);
    const teams = await getTeams(baseURL!, token);

    // Find a team that is NOT the current default
    const otherTeam = teams.find((t: { id: string }) => t.id !== workspace.default_team_id);
    expect(otherTeam).toBeTruthy();

    // Open the default team dropdown
    await page.getByTestId('workspace-default-team-selector').click();
    await expect(page.getByTestId('workspace-default-team-dropdown')).toBeVisible({ timeout: 10000 });

    // Select the other team
    await page.getByTestId(`workspace-default-team-option-${otherTeam.id}`).click();

    // Save
    await page.getByTestId('workspace-settings-save-btn').click();
    await expect(page.getByTestId('workspace-settings-success')).toBeVisible({ timeout: 30000 });

    // Verify the selector now shows the other team
    await expect(page.getByTestId('workspace-default-team-selector')).toContainText(otherTeam.name);

    // Navigate to a team issues page and open create issue modal to verify default
    await page.getByTestId(`sidebar-link-team-issues-${otherTeam.id}`).click();
    await expect(page.getByTestId('new-issue-btn')).toBeVisible({ timeout: 30000 });
    await page.getByTestId('new-issue-btn').click();
    await expect(page.getByTestId('create-issue-team-selector')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-issue-team-selector')).toContainText(otherTeam.name);

    // Reset default team
    await resetDefaultTeam(baseURL!, token, workspace.default_team_id);
  });

  test('Default team dropdown lists all available teams', async ({ page, baseURL }) => {
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    const teams = await getTeams(baseURL!, token);

    // Open the dropdown
    await page.getByTestId('workspace-default-team-selector').click();
    await expect(page.getByTestId('workspace-default-team-dropdown')).toBeVisible({ timeout: 10000 });

    // Verify all teams are listed
    for (const team of teams) {
      await expect(
        page.getByTestId(`workspace-default-team-option-${team.id}`)
      ).toBeVisible();
      await expect(
        page.getByTestId(`workspace-default-team-option-${team.id}`)
      ).toHaveText(team.name);
    }

    // Also verify the "No default team" option exists
    await expect(page.getByTestId('workspace-default-team-option-none')).toBeVisible();
  });

  test('Change default team and verify it affects issue creation', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    const workspace = await getWorkspace(baseURL!, token);
    const teams = await getTeams(baseURL!, token);
    const desTeam = teams.find((t: { identifier: string }) => t.identifier === 'DES');
    expect(desTeam).toBeTruthy();

    // Change default team to Design
    await page.getByTestId('workspace-default-team-selector').click();
    await expect(page.getByTestId('workspace-default-team-dropdown')).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`workspace-default-team-option-${desTeam.id}`).click();
    await page.getByTestId('workspace-settings-save-btn').click();
    await expect(page.getByTestId('workspace-settings-success')).toBeVisible({ timeout: 30000 });

    // Navigate to Design team issues page
    await page.getByTestId(`sidebar-link-team-issues-${desTeam.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/team/${desTeam.id}/issues`), { timeout: 30000 });

    // Click New Issue button
    await expect(page.getByTestId('new-issue-btn')).toBeVisible({ timeout: 30000 });
    await page.getByTestId('new-issue-btn').click();

    // Verify the team selector in the create issue modal defaults to Design
    await expect(page.getByTestId('create-issue-team-selector')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Design');

    // Reset default team
    await resetDefaultTeam(baseURL!, token, workspace.default_team_id);
  });

  test('Settings page is accessible from sidebar navigation', async ({ page, baseURL }) => {
    // Login and go to my-issues first
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Click Settings in the sidebar
    await page.getByTestId('sidebar-link-settings').click();

    // Verify navigation to /settings
    await expect(page).toHaveURL(/\/settings$/, { timeout: 30000 });

    // Verify the settings page loads with workspace settings
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('workspace-settings')).toBeVisible({ timeout: 30000 });
  });

  test('Workspace name edit can be cancelled', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndNavigateToSettings(page, baseURL!);

    const workspace = await getWorkspace(baseURL!, token);
    const nameInput = page.getByTestId('workspace-name-input');
    await expect(nameInput).toBeVisible({ timeout: 30000 });

    // Type a new name without saving
    await nameInput.clear();
    await nameInput.fill('Changed Name');

    // Navigate away without saving by clicking My Issues in sidebar
    await page.getByTestId('sidebar-link-my-issues').click();
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Navigate back to settings
    await page.getByTestId('sidebar-link-settings').click();
    await expect(page).toHaveURL(/\/settings$/, { timeout: 30000 });

    // Verify original name is shown (unsaved changes discarded)
    await expect(page.getByTestId('workspace-name-input')).toHaveValue(workspace.name, { timeout: 30000 });
  });

  test('Settings page shows appropriate heading and layout', async ({ page, baseURL }) => {
    await loginAndNavigateToSettings(page, baseURL!);

    // Verify heading
    await expect(page.getByTestId('settings-title')).toBeVisible();
    await expect(page.getByTestId('settings-title')).toHaveText('Settings');

    // Verify workspace name field with label
    const nameField = page.getByTestId('workspace-name-field');
    await expect(nameField).toBeVisible();
    await expect(nameField).toContainText('Workspace name');
    await expect(page.getByTestId('workspace-name-input')).toBeVisible();

    // Verify default team field with label
    const teamField = page.getByTestId('workspace-default-team-field');
    await expect(teamField).toBeVisible();
    await expect(teamField).toContainText('Default team for new issues');
    await expect(page.getByTestId('workspace-default-team-selector')).toBeVisible();

    // Verify save button is present
    await expect(page.getByTestId('workspace-settings-save-btn')).toBeVisible();
  });
});
