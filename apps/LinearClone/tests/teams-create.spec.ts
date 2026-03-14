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
    // Keep seed teams ENG and DES, delete everything else
    if (team.identifier !== 'ENG' && team.identifier !== 'DES') {
      await fetch(`${baseURL}/api/teams/${team.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }
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

test.describe('Create Team Modal', () => {
  test.beforeEach(async ({ baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await deleteTestTeams(baseURL!, data.token);
  });

  test('Create Team button opens create team modal', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    // Verify modal is not visible initially
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0);

    // Click Create Team button
    await page.getByTestId('create-team-btn').click();

    // Verify modal is now visible
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Verify modal has the expected fields
    await expect(page.getByTestId('create-team-name-input')).toBeVisible();
    await expect(page.getByTestId('create-team-identifier-input')).toBeVisible();
    await expect(page.getByTestId('create-team-description-input')).toBeVisible();
    await expect(page.getByTestId('create-team-submit-btn')).toBeVisible();
    await expect(page.getByTestId('create-team-cancel-btn')).toBeVisible();
  });

  test('Create team modal Name field is required', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Fill identifier but leave name empty
    await page.getByTestId('create-team-identifier-input').fill('TST');

    // Click submit
    await page.getByTestId('create-team-submit-btn').click();

    // Verify name error is shown
    await expect(page.getByTestId('create-team-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-team-name-error')).toContainText('required');

    // Modal should still be open
    await expect(page.getByTestId('create-team-modal')).toBeVisible();
  });

  test('Create team modal Identifier prefix is required', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Fill name but leave identifier empty
    await page.getByTestId('create-team-name-input').fill('Test Team');

    // Click submit
    await page.getByTestId('create-team-submit-btn').click();

    // Verify identifier error is shown
    await expect(page.getByTestId('create-team-identifier-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-team-identifier-error')).toContainText('required');

    // Modal should still be open
    await expect(page.getByTestId('create-team-modal')).toBeVisible();
  });

  test('Create team modal Identifier prefix must be uppercase', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Type lowercase letters
    await page.getByTestId('create-team-identifier-input').fill('abc');

    // Verify the input value is auto-converted to uppercase
    await expect(page.getByTestId('create-team-identifier-input')).toHaveValue('ABC');
  });

  test('Create team modal Identifier prefix must be 2-5 characters', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Fill name and a single-character identifier
    await page.getByTestId('create-team-name-input').fill('Test Team');
    await page.getByTestId('create-team-identifier-input').fill('A');

    // Submit
    await page.getByTestId('create-team-submit-btn').click();

    // Verify identifier error about length
    await expect(page.getByTestId('create-team-identifier-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-team-identifier-error')).toContainText('2');
    await expect(page.getByTestId('create-team-identifier-error')).toContainText('5');
  });

  test('Create team modal Identifier prefix rejects more than 5 characters', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Try to type 6 characters
    await page.getByTestId('create-team-identifier-input').fill('ABCDEF');

    // Verify only 5 characters are accepted (maxLength=5)
    await expect(page.getByTestId('create-team-identifier-input')).toHaveValue('ABCDE');
  });

  test('Create team modal Identifier prefix must be unique', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Try to create a team with the same identifier as an existing team (ENG)
    await page.getByTestId('create-team-name-input').fill('Duplicate Team');
    await page.getByTestId('create-team-identifier-input').fill('ENG');

    await page.getByTestId('create-team-submit-btn').click();

    // Verify server error about duplicate prefix
    await expect(page.getByTestId('create-team-server-error')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('create-team-server-error')).toContainText('ENG');
    await expect(page.getByTestId('create-team-server-error')).toContainText('already exists');

    // Modal should still be open
    await expect(page.getByTestId('create-team-modal')).toBeVisible();
  });

  test('Create team with all fields filled', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    const uniqueName = `Full Team ${Date.now()}`;
    const uniquePrefix = `FT${Date.now()}`.slice(0, 3).toUpperCase();
    const description = 'A fully configured team with all fields';

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-team-name-input').fill(uniqueName);
    await page.getByTestId('create-team-identifier-input').fill(uniquePrefix);
    await page.getByTestId('create-team-description-input').fill(description);
    await page.getByTestId('create-team-submit-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 15000 });

    // New team card should appear with the correct name
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(1, { timeout: 15000 });

    // Verify the prefix is shown
    const teamCards = page.locator('[data-testid^="team-card-prefix-"]').filter({ hasText: new RegExp(`^${uniquePrefix}$`) });
    await expect(teamCards).toHaveCount(1, { timeout: 15000 });
  });

  test('Create team with only required fields', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    const uniqueName = `Min Team ${Date.now()}`;
    const uniquePrefix = `MN${Date.now()}`.slice(0, 3).toUpperCase();

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Only fill name and identifier, leave description empty
    await page.getByTestId('create-team-name-input').fill(uniqueName);
    await page.getByTestId('create-team-identifier-input').fill(uniquePrefix);
    // Do NOT fill description

    await page.getByTestId('create-team-submit-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 15000 });

    // New team card should appear
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(1, { timeout: 15000 });
  });

  test('Cancel create team modal discards input', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Fill in some data
    await page.getByTestId('create-team-name-input').fill('Should Not Be Created');
    await page.getByTestId('create-team-identifier-input').fill('NOPE');
    await page.getByTestId('create-team-description-input').fill('This should be discarded');

    // Click cancel
    await page.getByTestId('create-team-cancel-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 10000 });

    // Verify no team with that name was created
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: 'Should Not Be Created' })
    ).toHaveCount(0);

    // Reopen modal and verify fields are reset
    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('create-team-name-input')).toHaveValue('');
    await expect(page.getByTestId('create-team-identifier-input')).toHaveValue('');
    await expect(page.getByTestId('create-team-description-input')).toHaveValue('');
  });
});
