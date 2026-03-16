import { test, expect } from '@playwright/test';

// Helper to login via API and get token
async function loginViaApi(baseURL: string, email: string, password: string) {
  let lastError = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      if (response.ok) {
        const data = JSON.parse(text);
        if (data.token) return data;
      }
      lastError = `status=${response.status} body=${text.slice(0, 200)}`;
    } catch (e) {
      lastError = `fetch error: ${e}`;
    }
    if (attempt < 4) await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error(`loginViaApi failed after 5 attempts: ${lastError}`);
}

// Helper to get teams via API
async function getTeams(baseURL: string, token: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${baseURL}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.teams) return data.teams;
    } catch {
      // connection error, will retry
    }
    if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('getTeams failed after 3 attempts');
}

// Helper to login and navigate to team issues page
async function loginAndNavigateToTeamIssues(
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

  return { token: data.token, user: data.user, team, teams };
}

// Helper to login and open create issue modal from a team page
async function loginAndOpenCreateModal(
  page: import('@playwright/test').Page,
  baseURL: string,
  teamIdentifier = 'ENG',
  email = 'alice@acme.com',
  password = 'password123'
) {
  const result = await loginAndNavigateToTeamIssues(page, baseURL, teamIdentifier, email, password);

  await page.getByTestId('new-issue-btn').click();
  await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

  return result;
}

// Helper to delete all non-seed issues via API
async function deleteCreatedIssues(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/team-issues?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) {
    const data = await response.json();
    const issues = data.issues || [];
    // Seed data has issues numbered 1-8 for ENG; delete any with number > 8
    for (const issue of issues) {
      if (issue.number > 8) {
        try {
          await fetch(`${baseURL}/api/update-issue`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id: issue.id, status: 'cancelled' }),
          });
        } catch {
          // ignore
        }
      }
    }
  }
}

test.describe.serial('CreateIssueModalActions', () => {
  test('Create Issue button is visible and styled', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify Create Issue button is visible
    const submitBtn = page.getByTestId('create-issue-submit-btn');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Create Issue');

    // Verify it's in the actions area at the bottom of the modal
    await expect(page.getByTestId('create-issue-actions')).toBeVisible();

    // Verify the button has primary styling (cia-submit-btn class)
    await expect(submitBtn).toHaveClass(/cia-submit-btn/);
  });

  test('Cancel button is visible', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify Cancel button is visible alongside Create Issue button
    const cancelBtn = page.getByTestId('create-issue-cancel-btn');
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toContainText('Cancel');

    // Both buttons are in the actions area
    const submitBtn = page.getByTestId('create-issue-submit-btn');
    await expect(submitBtn).toBeVisible();
  });

  test('Cancel button closes the modal', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click the Cancel button
    await page.getByTestId('create-issue-cancel-btn').click();

    // Verify the modal closes
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 10000 });

    // Verify the user is still on the team issues page
    await expect(page.getByTestId('team-issues-page')).toBeVisible();
  });

  test('Cancel button discards form data', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Enter some data
    await page.getByTestId('create-issue-title-input').fill('Draft issue');

    // Change priority to High
    await page.getByTestId('create-issue-priority-selector').click();
    await expect(page.getByTestId('create-issue-priority-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-priority-option-high').click();
    await expect(page.getByTestId('create-issue-priority-selector')).toContainText('High');

    // Click Cancel
    await page.getByTestId('create-issue-cancel-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 10000 });

    // Re-open the modal
    await page.getByTestId('new-issue-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    // Verify all fields are reset to defaults
    await expect(page.getByTestId('create-issue-title-input')).toHaveValue('');
    await expect(page.getByTestId('create-issue-status-selector')).toContainText('Backlog');
    await expect(page.getByTestId('create-issue-priority-selector')).toContainText('No Priority');
  });

  test('Create Issue button submits the form with all fields', async ({ page, baseURL }) => {
    test.slow();
    const { token, team } = await loginAndOpenCreateModal(page, baseURL!);

    const uniqueTitle = `Implement OAuth ${Date.now()}`;

    // Fill in all fields
    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);
    await page.getByTestId('create-issue-description-input').fill('Add OAuth support');

    // Set status to Todo
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-todo').click();

    // Set priority to High
    await page.getByTestId('create-issue-priority-selector').click();
    await expect(page.getByTestId('create-issue-priority-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-priority-option-high').click();

    // Set assignee to Alice Johnson
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-assignee-search').fill('Alice');
    const aliceOption = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Alice Johnson/ });
    await expect(aliceOption).toBeVisible({ timeout: 10000 });
    await aliceOption.click();

    // Set label to Feature
    await page.getByTestId('create-issue-labels-selector').click();
    await expect(page.getByTestId('create-issue-labels-dropdown')).toBeVisible();
    const featureOption = page.getByTestId('create-issue-labels-dropdown').locator('button').filter({ hasText: /^Feature$/ });
    await featureOption.click();
    await page.getByTestId('create-issue-title-input').click(); // close labels dropdown

    // Set project to V2 Launch
    await page.getByTestId('create-issue-project-selector').click();
    await expect(page.getByTestId('create-issue-project-dropdown')).toBeVisible();
    const projectOption = page.getByTestId('create-issue-project-dropdown').locator('button').filter({ hasText: /V2 Launch/ });
    await expect(projectOption).toBeVisible({ timeout: 10000 });
    await projectOption.click();

    // Set cycle to Sprint 12
    await page.getByTestId('create-issue-cycle-selector').click();
    await expect(page.getByTestId('create-issue-cycle-dropdown')).toBeVisible();
    const cycleOption = page.getByTestId('create-issue-cycle-dropdown').locator('button').filter({ hasText: /Sprint 12/ });
    await expect(cycleOption).toBeVisible({ timeout: 10000 });
    await cycleOption.click();

    // Set due date
    await page.getByTestId('create-issue-due-date-input').fill('2026-03-25');

    // Click Create Issue
    await page.getByTestId('create-issue-submit-btn').click();

    // Verify success indicator with issue identifier
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-success')).toContainText('ENG-');

    // Verify modal closes
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });
  });

  test('Create Issue with only required fields', async ({ page, baseURL }) => {
    test.slow();
    await loginAndOpenCreateModal(page, baseURL!);

    // Verify the team is set to Engineering
    await expect(page.getByTestId('create-issue-team-selector')).toContainText('Engineering', { timeout: 10000 });

    const uniqueTitle = `Quick bug fix ${Date.now()}`;

    // Only fill in title (required) - team is already pre-selected
    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);

    // Click Create Issue
    await page.getByTestId('create-issue-submit-btn').click();

    // Verify success indicator with issue identifier
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-success')).toContainText('ENG-');

    // Verify modal closes
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });
  });

  test('Created issue appears in the team issues list', async ({ page, baseURL }) => {
    test.slow();
    await loginAndNavigateToTeamIssues(page, baseURL!);

    // Wait for issues to load
    await expect(page.getByTestId('team-issues-list')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid^="issue-row-"]').first()).toBeVisible({ timeout: 30000 });
    const initialCount = await page.locator('[data-testid^="issue-row-"]').count();

    const uniqueTitle = `New feature request ${Date.now()}`;

    // Open modal and create issue with status "Todo"
    await page.getByTestId('new-issue-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);

    // Set status to Todo
    await page.getByTestId('create-issue-status-selector').click();
    await expect(page.getByTestId('create-issue-status-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-status-option-todo').click();

    await page.getByTestId('create-issue-submit-btn').click();
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify the new issue appears in the list (count increased by 1)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(initialCount + 1, { timeout: 30000 });

    // Verify the issue title appears in the todo status group
    const todoGroup = page.getByTestId('team-issue-group-items-todo');
    await expect(todoGroup).toContainText(uniqueTitle, { timeout: 30000 });
  });

  test('Created issue with parent appears as sub-issue', async ({ page, baseURL }) => {
    test.slow();
    const { token, team } = await loginAndOpenCreateModal(page, baseURL!);

    const uniqueTitle = `Write unit tests ${Date.now()}`;

    // Fill title
    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);

    // Select parent issue: ENG-1 (Fix login session expiration bug)
    await page.getByTestId('create-issue-parent-selector').click();
    await expect(page.getByTestId('create-issue-parent-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-parent-search').fill('Fix login');
    const parentOption = page.getByTestId('create-issue-parent-dropdown').locator('button').filter({ hasText: /Fix login session expiration bug/ });
    await expect(parentOption).toBeVisible({ timeout: 30000 });
    await parentOption.click();
    await expect(page.getByTestId('create-issue-parent-selector')).toContainText('ENG-1');

    // Submit
    await page.getByTestId('create-issue-submit-btn').click();
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Navigate to the parent issue detail page (ENG-1)
    // First find the parent issue ID via search API
    const searchResp = await fetch(`${baseURL}/api/search-issues?q=Fix+login&teamId=${team.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const searchData = await searchResp.json();
    const parentIssue = searchData.issues.find((i: { identifier: string }) => i.identifier === 'ENG-1');

    await page.goto(`/issue/${parentIssue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Verify sub-issues section shows the new issue
    await expect(page.getByTestId('sub-issues')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sub-issues-list')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sub-issues-list')).toContainText(uniqueTitle, { timeout: 30000 });
  });

  test('Created issue generates activity history entry', async ({ page, baseURL }) => {
    test.slow();
    await loginAndOpenCreateModal(page, baseURL!);

    const uniqueTitle = `Track history ${Date.now()}`;

    // Create issue
    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);
    await page.getByTestId('create-issue-submit-btn').click();

    // Wait for success and get the identifier
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    const successText = await page.getByTestId('create-issue-success').textContent();
    // Extract identifier like "ENG-9" from "Created ENG-9"
    const identifierMatch = successText?.match(/(ENG-\d+)/);
    const identifier = identifierMatch ? identifierMatch[1] : '';

    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Find the issue ID via search API (with retry for eventual consistency)
    const loginData = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, loginData.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');

    let createdIssue: { id: string; title: string } | undefined;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const searchResp = await fetch(`${baseURL}/api/search-issues?q=${encodeURIComponent(uniqueTitle)}&teamId=${engTeam.id}`, {
          headers: { Authorization: `Bearer ${loginData.token}` },
        });
        const searchData = await searchResp.json();
        createdIssue = searchData.issues?.find((i: { title: string }) => i.title === uniqueTitle);
        if (createdIssue) break;
      } catch {
        // retry
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    expect(createdIssue).toBeTruthy();

    // Navigate to the issue detail page
    await page.goto(`/issue/${createdIssue!.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Click on Activity tab
    await page.getByTestId('activity-tab').click();

    // Verify "created this issue" activity entry exists
    await expect(page.getByTestId('activity-list')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('activity-list')).toContainText('created this issue', { timeout: 30000 });
    await expect(page.getByTestId('activity-list')).toContainText('Alice Johnson', { timeout: 30000 });

    // Verify there's exactly one activity entry (the creation)
    const activityEntries = page.getByTestId('activity-list').locator('[data-testid^="activity-entry-"]');
    await expect(activityEntries).toHaveCount(1, { timeout: 30000 });
  });

  test('Create Issue button is disabled during submission', async ({ page, baseURL }) => {
    test.slow();
    await loginAndOpenCreateModal(page, baseURL!);

    const uniqueTitle = `Disabled btn test ${Date.now()}`;
    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);

    const submitBtn = page.getByTestId('create-issue-submit-btn');

    // Click Create Issue
    await submitBtn.click();

    // The button should become disabled while submitting
    await expect(submitBtn).toBeDisabled({ timeout: 10000 });
    await expect(submitBtn).toContainText('Creating...');

    // After submission completes, wait for success or the modal to close
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });
  });

  test('Clicking outside the modal closes it', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Click on the overlay (outside the modal)
    const overlay = page.getByTestId('create-issue-modal-overlay');
    // Click the overlay at position near the edge to ensure it's outside the modal
    await overlay.click({ position: { x: 10, y: 10 } });

    // Verify the modal closes without creating an issue
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 10000 });

    // Verify we're still on the team issues page
    await expect(page.getByTestId('team-issues-page')).toBeVisible();
  });

  test('Pressing Escape closes the modal', async ({ page, baseURL }) => {
    await loginAndOpenCreateModal(page, baseURL!);

    // Press the Escape key
    await page.keyboard.press('Escape');

    // Verify the modal closes without creating an issue
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 10000 });

    // Verify we're still on the team issues page
    await expect(page.getByTestId('team-issues-page')).toBeVisible();
  });

  test('Creating multiple issues in sequence works correctly', async ({ page, baseURL }) => {
    test.slow();
    const { token, team } = await loginAndNavigateToTeamIssues(page, baseURL!);

    const firstTitle = `First task ${Date.now()}`;
    const secondTitle = `Second task ${Date.now()}`;

    // Create first issue
    await page.getByTestId('new-issue-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });
    await page.getByTestId('create-issue-title-input').fill(firstTitle);
    await page.getByTestId('create-issue-submit-btn').click();

    // Wait for success and capture identifier
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    const firstSuccessText = await page.getByTestId('create-issue-success').textContent();
    const firstIdentifierMatch = firstSuccessText?.match(/(ENG-\d+)/);
    const firstIdentifier = firstIdentifierMatch ? firstIdentifierMatch[1] : '';
    expect(firstIdentifier).toBeTruthy();

    // Wait for modal to close
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Create second issue
    await page.getByTestId('new-issue-btn').click();
    await expect(page.getByTestId('create-issue-modal')).toBeVisible({ timeout: 30000 });

    // Verify the modal has reset - title should be empty
    await expect(page.getByTestId('create-issue-title-input')).toHaveValue('');

    await page.getByTestId('create-issue-title-input').fill(secondTitle);
    await page.getByTestId('create-issue-submit-btn').click();

    // Wait for success and capture identifier
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    const secondSuccessText = await page.getByTestId('create-issue-success').textContent();
    const secondIdentifierMatch = secondSuccessText?.match(/(ENG-\d+)/);
    const secondIdentifier = secondIdentifierMatch ? secondIdentifierMatch[1] : '';
    expect(secondIdentifier).toBeTruthy();

    // Verify sequential identifiers
    const firstNum = parseInt(firstIdentifier.replace('ENG-', ''));
    const secondNum = parseInt(secondIdentifier.replace('ENG-', ''));
    expect(secondNum).toBe(firstNum + 1);

    // Wait for modal to close
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Verify both issues appear in the team issues list
    await expect(page.getByTestId('team-issues-list')).toContainText(firstTitle, { timeout: 30000 });
    await expect(page.getByTestId('team-issues-list')).toContainText(secondTitle, { timeout: 30000 });
  });

  test('Created issue generates inbox notification for assignee', async ({ page, baseURL }) => {
    test.slow();

    // Login as Alice and create an issue assigned to Bob
    const { token, team } = await loginAndOpenCreateModal(page, baseURL!);

    const uniqueTitle = `Review PR ${Date.now()}`;

    await page.getByTestId('create-issue-title-input').fill(uniqueTitle);

    // Assign to Bob Smith
    await page.getByTestId('create-issue-assignee-selector').click();
    await expect(page.getByTestId('create-issue-assignee-dropdown')).toBeVisible();
    await page.getByTestId('create-issue-assignee-search').fill('Bob');
    const bobOption = page.getByTestId('create-issue-assignee-dropdown').locator('button').filter({ hasText: /Bob Smith/ });
    await expect(bobOption).toBeVisible({ timeout: 10000 });
    await bobOption.click();
    await expect(page.getByTestId('create-issue-assignee-selector')).toContainText('Bob Smith');

    // Submit
    await page.getByTestId('create-issue-submit-btn').click();
    await expect(page.getByTestId('create-issue-success')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('create-issue-modal')).toHaveCount(0, { timeout: 30000 });

    // Now login as Bob and verify notification via API first
    const bobData = await loginViaApi(baseURL!, 'bob@acme.com', 'password123');

    // Verify notification exists via API (with retry for eventual consistency)
    let notificationsFound = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const resp = await fetch(`${baseURL}/api/notifications`, {
          headers: { Authorization: `Bearer ${bobData.token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.notifications && data.notifications.length > 0) {
            const hasNotif = data.notifications.some((n: { description: string }) =>
              n.description.includes('assigned you to') && n.description.includes(uniqueTitle)
            );
            if (hasNotif) {
              notificationsFound = true;
              break;
            }
          }
        }
      } catch {
        // retry
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    expect(notificationsFound).toBe(true);

    // Navigate to inbox as Bob
    await page.evaluate((t) => localStorage.setItem('session_token', t), bobData.token);
    await page.goto('/inbox');
    await expect(page.getByTestId('inbox-page')).toBeVisible({ timeout: 30000 });

    // Wait for notification list to render (may need reload due to React state)
    await expect(async () => {
      await expect(page.getByTestId('notification-list-items')).toBeVisible({ timeout: 10000 });
    }).toPass({ timeout: 30000, intervals: [5000] });

    // The notification message should contain the assignment info
    const notificationItems = page.getByTestId('notification-list-items');
    await expect(notificationItems).toContainText('assigned you to', { timeout: 30000 });
    await expect(notificationItems).toContainText(uniqueTitle, { timeout: 30000 });
  });
});
