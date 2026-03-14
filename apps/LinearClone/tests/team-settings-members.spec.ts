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

// Helper to get team detail via API
async function getTeamDetail(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/teams/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
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

// Helper to reset ENG team members to seed state (Alice, Bob, Carol)
async function resetEngTeamMembers(baseURL: string, token: string) {
  const teams = await getTeams(baseURL, token);
  const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
  if (!engTeam) return;

  const detail = await getTeamDetail(baseURL, token, engTeam.id);
  // Remove all current members
  for (const member of detail.members) {
    await fetch(`${baseURL}/api/team-members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teamId: engTeam.id, memberIdToRemove: member.id }),
    });
  }

  // Get all workspace members
  const allDetail = await getTeamDetail(baseURL, token, engTeam.id);
  const allMembers = [...allDetail.members, ...allDetail.availableMembers];

  // Add back Alice, Bob, Carol
  for (const member of allMembers) {
    if (['Alice Johnson', 'Bob Smith', 'Carol Davis'].includes(member.name)) {
      await fetch(`${baseURL}/api/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: engTeam.id, memberIdToAdd: member.id }),
      });
    }
  }
}

// Helper to create a team with no members via API
async function createEmptyTeam(baseURL: string, token: string, name: string, identifier: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, identifier, description: '' }),
  });
  return response.json();
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

  const teams = await getTeams(baseURL, data.token);
  const team = teams.find((t: { identifier: string }) => t.identifier === teamIdentifier);
  expect(team).toBeTruthy();

  await page.getByTestId(`team-card-${team.id}`).click();
  await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });

  return { token: data.token, team };
}

test.describe.serial('Team Settings Members', () => {
  test.beforeEach(async ({ baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await deleteTestTeams(baseURL!, data.token);
    await resetEngTeamMembers(baseURL!, data.token);
  });

  test('Team members section lists all current team members', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Members section should be visible
    await expect(page.getByTestId('team-settings-members-section')).toBeVisible();

    // Members list should be visible
    await expect(page.getByTestId('team-settings-members-list')).toBeVisible({ timeout: 15000 });

    // Should show 3 members (Alice, Bob, Carol from seed)
    const memberRows = page.locator('[data-testid^="team-settings-member-"]:not([data-testid*="-remove-"]):not([data-testid*="-confirm-"]):not([data-testid*="-cancel-"])');
    await expect(memberRows).toHaveCount(3, { timeout: 15000 });

    // Each member row should have a name visible
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Alice Johnson');
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Bob Smith');
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Carol Davis');

    // Add Member button should be visible
    await expect(page.getByTestId('team-settings-add-member-btn')).toBeVisible();
  });

  test('Add member to team via team settings', async ({ page, baseURL }) => {
    test.slow();
    // First, remove one member so we have someone to add
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const detail = await getTeamDetail(baseURL!, data.token, engTeam.id);
    // Remove Carol so we can add her back via UI
    const carol = detail.members.find((m: { name: string }) => m.name === 'Carol Davis');
    if (carol) {
      await fetch(`${baseURL}/api/team-members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ teamId: engTeam.id, memberIdToRemove: carol.id }),
      });
    }

    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Should show 2 members initially
    const memberRows = page.locator('[data-testid^="team-settings-member-"]:not([data-testid*="-remove-"]):not([data-testid*="-confirm-"]):not([data-testid*="-cancel-"])');
    await expect(memberRows).toHaveCount(2, { timeout: 15000 });

    // Click Add Member
    await page.getByTestId('team-settings-add-member-btn').click();

    // Selector should appear
    await expect(page.getByTestId('team-settings-member-selector')).toBeVisible({ timeout: 10000 });

    // Click Carol's option
    const carolOption = page.getByTestId('team-settings-member-selector').locator('button').filter({ hasText: 'Carol Davis' });
    await expect(carolOption).toBeVisible({ timeout: 10000 });
    await carolOption.click();

    // Members list should now show 3 members
    await expect(memberRows).toHaveCount(3, { timeout: 15000 });

    // Carol should be in the list
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Carol Davis', { timeout: 15000 });
  });

  test('Add member selector shows only non-team members', async ({ page, baseURL }) => {
    // ENG team has Alice, Bob, Carol - no one to add since all workspace members are on the team
    // First remove Bob and Carol so there are available members
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const detail = await getTeamDetail(baseURL!, data.token, engTeam.id);

    // Remove Bob and Carol
    for (const member of detail.members) {
      if (member.name === 'Bob Smith' || member.name === 'Carol Davis') {
        await fetch(`${baseURL}/api/team-members`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ teamId: engTeam.id, memberIdToRemove: member.id }),
        });
      }
    }

    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Only Alice is on the team now
    const memberRows = page.locator('[data-testid^="team-settings-member-"]:not([data-testid*="-remove-"]):not([data-testid*="-confirm-"]):not([data-testid*="-cancel-"])');
    await expect(memberRows).toHaveCount(1, { timeout: 15000 });

    // Click Add Member
    await page.getByTestId('team-settings-add-member-btn').click();
    await expect(page.getByTestId('team-settings-member-selector')).toBeVisible({ timeout: 10000 });

    // Should show Bob and Carol (not already on team)
    const selectorOptions = page.getByTestId('team-settings-member-selector').locator('button');
    await expect(selectorOptions).toHaveCount(2, { timeout: 10000 });

    // Alice should NOT be in the dropdown
    await expect(page.getByTestId('team-settings-member-selector')).not.toContainText('Alice Johnson');

    // Bob and Carol should be in the dropdown
    await expect(page.getByTestId('team-settings-member-selector')).toContainText('Bob Smith');
    await expect(page.getByTestId('team-settings-member-selector')).toContainText('Carol Davis');
  });

  test('Remove member from team via team settings', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Should start with 3 members
    const memberRows = page.locator('[data-testid^="team-settings-member-"]:not([data-testid*="-remove-"]):not([data-testid*="-confirm-"]):not([data-testid*="-cancel-"])');
    await expect(memberRows).toHaveCount(3, { timeout: 15000 });

    // Find Carol's member row and click remove
    const carolRow = memberRows.filter({ hasText: 'Carol Davis' });
    await expect(carolRow).toHaveCount(1, { timeout: 10000 });
    const carolRemoveBtn = carolRow.locator('[data-testid^="team-settings-remove-member-"]');
    await carolRemoveBtn.click();

    // Confirmation should appear
    const carolConfirmBtn = carolRow.locator('[data-testid^="team-settings-confirm-remove-"]');
    await expect(carolConfirmBtn).toBeVisible({ timeout: 10000 });

    // Confirm removal
    await carolConfirmBtn.click();

    // Should now show 2 members
    await expect(memberRows).toHaveCount(2, { timeout: 15000 });

    // Carol should no longer be in the list
    await expect(page.getByTestId('team-settings-members-list')).not.toContainText('Carol Davis');
  });

  test('Cancel remove member from team', async ({ page, baseURL }) => {
    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    // Should start with 3 members
    const memberRows = page.locator('[data-testid^="team-settings-member-"]:not([data-testid*="-remove-"]):not([data-testid*="-confirm-"]):not([data-testid*="-cancel-"])');
    await expect(memberRows).toHaveCount(3, { timeout: 15000 });

    // Find a member row and click remove
    const bobRow = memberRows.filter({ hasText: 'Bob Smith' });
    const bobRemoveBtn = bobRow.locator('[data-testid^="team-settings-remove-member-"]');
    await bobRemoveBtn.click();

    // Confirmation should appear
    const cancelBtn = bobRow.locator('[data-testid^="team-settings-cancel-remove-"]');
    await expect(cancelBtn).toBeVisible({ timeout: 10000 });

    // Click Cancel
    await cancelBtn.click();

    // Member should still be present - still 3 members
    await expect(memberRows).toHaveCount(3, { timeout: 15000 });
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Bob Smith');
  });

  test('Team members section shows empty state when team has no members', async ({ page, baseURL }) => {
    // Create a team with no members
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const uniqueName = `QA ${Date.now()}`;
    await createEmptyTeam(baseURL!, data.token, uniqueName, 'QA');

    // Navigate to the QA team settings
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto('/settings/teams');
    await expect(page.getByTestId('teams-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('teams-grid')).toBeVisible({ timeout: 30000 });

    // Find and click the QA team card
    const teams = await getTeams(baseURL!, data.token);
    const qaTeam = teams.find((t: { identifier: string }) => t.identifier === 'QA');
    expect(qaTeam).toBeTruthy();
    await page.getByTestId(`team-card-${qaTeam.id}`).click();
    await expect(page.getByTestId('team-settings')).toBeVisible({ timeout: 30000 });

    // Should show empty state
    await expect(page.getByTestId('team-settings-members-empty')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('team-settings-members-empty')).toContainText('No members yet');

    // Add Member button should still be visible
    await expect(page.getByTestId('team-settings-add-member-btn')).toBeVisible();
  });

  test('Add member to team can be done multiple times in sequence', async ({ page, baseURL }) => {
    test.slow();
    // Set up ENG team with only Alice
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const detail = await getTeamDetail(baseURL!, data.token, engTeam.id);

    // Remove Bob and Carol
    for (const member of detail.members) {
      if (member.name !== 'Alice Johnson') {
        await fetch(`${baseURL}/api/team-members`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ teamId: engTeam.id, memberIdToRemove: member.id }),
        });
      }
    }

    await loginAndNavigateToTeamSettings(page, baseURL!, 'ENG');

    const memberRows = page.locator('[data-testid^="team-settings-member-"]:not([data-testid*="-remove-"]):not([data-testid*="-confirm-"]):not([data-testid*="-cancel-"])');
    await expect(memberRows).toHaveCount(1, { timeout: 15000 });

    // Add Bob
    await page.getByTestId('team-settings-add-member-btn').click();
    await expect(page.getByTestId('team-settings-member-selector')).toBeVisible({ timeout: 10000 });
    const bobOption = page.getByTestId('team-settings-member-selector').locator('button').filter({ hasText: 'Bob Smith' });
    await bobOption.click();
    await expect(memberRows).toHaveCount(2, { timeout: 15000 });

    // Add Carol
    await page.getByTestId('team-settings-add-member-btn').click();
    await expect(page.getByTestId('team-settings-member-selector')).toBeVisible({ timeout: 10000 });

    // Bob should no longer be in the selector
    await expect(page.getByTestId('team-settings-member-selector')).not.toContainText('Bob Smith');

    const carolOption = page.getByTestId('team-settings-member-selector').locator('button').filter({ hasText: 'Carol Davis' });
    await carolOption.click();
    await expect(memberRows).toHaveCount(3, { timeout: 15000 });

    // Verify both are in the list
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Bob Smith');
    await expect(page.getByTestId('team-settings-members-list')).toContainText('Carol Davis');
  });
});
