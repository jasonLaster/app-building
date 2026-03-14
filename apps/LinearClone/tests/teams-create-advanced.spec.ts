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

test.describe('Create Team Modal Advanced', () => {
  test.beforeEach(async ({ baseURL }) => {
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    await deleteTestTeams(baseURL!, data.token);
  });

  test('Close create team modal by clicking backdrop', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    // Open the modal
    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Click on the overlay (backdrop) outside the modal
    const overlay = page.getByTestId('create-team-modal-overlay');
    // Click at the top-left corner of the overlay which is outside the modal
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox).toBeTruthy();
    await page.mouse.click(overlayBox!.x + 5, overlayBox!.y + 5);

    // Modal should close
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 10000 });

    // No new team should have been created - teams grid should still show seed teams only
    const teamCards = page.locator('[data-testid^="team-card-"]:not([data-testid*="-prefix-"]):not([data-testid*="-name-"]):not([data-testid*="-members-"]):not([data-testid*="-cycle-"])');
    await expect(teamCards).toHaveCount(2, { timeout: 15000 });
  });

  test('Create team modal form resets on reopen', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    // Open the modal and enter some data
    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-team-name-input').fill('Some Team Name');
    await page.getByTestId('create-team-identifier-input').fill('STN');
    await page.getByTestId('create-team-description-input').fill('Some description');

    // Cancel
    await page.getByTestId('create-team-cancel-btn').click();
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 10000 });

    // Reopen the modal
    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // All fields should be empty/reset
    await expect(page.getByTestId('create-team-name-input')).toHaveValue('');
    await expect(page.getByTestId('create-team-identifier-input')).toHaveValue('');
    await expect(page.getByTestId('create-team-description-input')).toHaveValue('');

    // No validation errors should be visible
    await expect(page.getByTestId('create-team-name-error')).toHaveCount(0);
    await expect(page.getByTestId('create-team-identifier-error')).toHaveCount(0);
    await expect(page.getByTestId('create-team-server-error')).toHaveCount(0);
  });

  test('Create team modal can be used multiple times in sequence', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToTeams(page, baseURL!);

    const teamCards = page.locator('[data-testid^="team-card-"]:not([data-testid*="-prefix-"]):not([data-testid*="-name-"]):not([data-testid*="-members-"]):not([data-testid*="-cycle-"])');
    const initialCount = await teamCards.count();

    // Create first team
    const name1 = `Team Alpha ${Date.now()}`;
    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('create-team-name-input').fill(name1);
    await page.getByTestId('create-team-identifier-input').fill('ALPH');
    await page.getByTestId('create-team-submit-btn').click();
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 15000 });

    // Verify first team appears
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: name1 })
    ).toHaveCount(1, { timeout: 15000 });

    // Create second team
    const name2 = `Team Beta ${Date.now()}`;
    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    // Fields should be empty (form reset)
    await expect(page.getByTestId('create-team-name-input')).toHaveValue('');
    await expect(page.getByTestId('create-team-identifier-input')).toHaveValue('');

    await page.getByTestId('create-team-name-input').fill(name2);
    await page.getByTestId('create-team-identifier-input').fill('BETA');
    await page.getByTestId('create-team-submit-btn').click();
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 15000 });

    // Both teams should now appear
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: name2 })
    ).toHaveCount(1, { timeout: 15000 });
    await expect(teamCards).toHaveCount(initialCount + 2, { timeout: 15000 });
  });

  test('Create team modal submits via Enter key', async ({ page, baseURL }) => {
    await loginAndNavigateToTeams(page, baseURL!);

    const teamCards = page.locator('[data-testid^="team-card-"]:not([data-testid*="-prefix-"]):not([data-testid*="-name-"]):not([data-testid*="-members-"]):not([data-testid*="-cycle-"])');
    const initialCount = await teamCards.count();

    const uniqueName = `QA Team ${Date.now()}`;

    await page.getByTestId('create-team-btn').click();
    await expect(page.getByTestId('create-team-modal')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('create-team-name-input').fill(uniqueName);
    await page.getByTestId('create-team-identifier-input').fill('QA');

    // Press Enter while focused on the form
    await page.getByTestId('create-team-identifier-input').press('Enter');

    // Modal should close after successful submission
    await expect(page.getByTestId('create-team-modal')).toHaveCount(0, { timeout: 15000 });

    // Verify the team was created
    await expect(
      page.locator('[data-testid^="team-card-name-"]').filter({ hasText: uniqueName })
    ).toHaveCount(1, { timeout: 15000 });
    await expect(teamCards).toHaveCount(initialCount + 1, { timeout: 15000 });
  });
});
