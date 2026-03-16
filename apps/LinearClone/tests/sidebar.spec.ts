import { test, expect } from '@playwright/test';

// Helper to login as Alice and return token
async function loginAsAlice(baseURL: string): Promise<string> {
  const response = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@acme.com', password: 'password123' }),
  });
  const data = await response.json();
  return data.token;
}

// Helper to get teams via API
async function getTeams(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.teams as Array<{ id: string; name: string; identifier: string }>;
}

// Helper to get notifications via API
async function getNotifications(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.notifications as Array<{ id: string; read: boolean }>;
}

// Helper to mark notification as read via API
async function markNotificationRead(baseURL: string, token: string, notificationId: string) {
  await fetch(`${baseURL}/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Helper to authenticate page as Alice
async function authenticatePage(page: unknown, baseURL: string): Promise<string> {
  const token = await loginAsAlice(baseURL);
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  return token;
}

test.describe('Sidebar', () => {
  test('Sidebar renders workspace header', async ({ page, baseURL }) => {
    const _token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sidebar-workspace-name')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sidebar-workspace-name')).toContainText('Acme Corp');
  });

  test('Sidebar workspace header navigates to home', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    await page.goto(`/team/${engTeam.id}/issues`);
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-workspace-name').click();
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });
  });

  test('Sidebar renders main navigation links', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId('sidebar-link-my-issues')).toBeVisible();
    await expect(page.getByTestId('sidebar-link-my-issues')).toContainText('My Issues');

    await expect(page.getByTestId('sidebar-link-inbox')).toBeVisible();
    await expect(page.getByTestId('sidebar-link-inbox')).toContainText('Inbox');
  });

  test('Sidebar My Issues link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-my-issues').click();
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Verify active state
    await expect(page.getByTestId('sidebar-link-my-issues')).toHaveClass(/sidebar-link-active/, { timeout: 10000 });
  });

  test('Sidebar Inbox link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });

    // Verify active state
    await expect(page.getByTestId('sidebar-link-inbox')).toHaveClass(/sidebar-link-active/, { timeout: 10000 });
  });

  test('Sidebar Inbox shows unread notification count badge', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Alice has 3 unread notifications in seed
    await expect(page.getByTestId('sidebar-inbox-badge')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('sidebar-inbox-badge')).toHaveText('3');
  });

  test('Sidebar Inbox badge updates when notifications are read', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Verify initial badge shows 3
    await expect(page.getByTestId('sidebar-inbox-badge')).toHaveText('3', { timeout: 30000 });

    // Navigate to inbox
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });

    // Wait for notifications to load
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // Get notifications to find an unread one
    const notifications = await getNotifications(baseURL!, token);
    const unreadNotification = notifications.find((n) => !n.read);

    if (unreadNotification) {
      // Click the notification row to mark it as read
      await page.getByTestId(`notification-row-${unreadNotification.id}`).click();

      // Badge should update to 2
      await expect(page.getByTestId('sidebar-inbox-badge')).toHaveText('2', { timeout: 30000 });
    }
  });

  test('Sidebar Inbox badge not shown when no unread notifications', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);

    // Mark all notifications as read via API
    const notifications = await getNotifications(baseURL!, token);
    for (const notification of notifications) {
      if (!notification.read) {
        await markNotificationRead(baseURL!, token, notification.id);
      }
    }

    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Badge should not be visible
    await expect(page.getByTestId('sidebar-inbox-badge')).not.toBeVisible({ timeout: 10000 });
  });

  test('Sidebar renders team sections', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Teams section should be visible
    await expect(page.getByTestId('sidebar-teams-section')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;
    const desTeam = teams.find((t) => t.identifier === 'DES')!;

    // Both team headers should be visible
    await expect(page.getByTestId(`sidebar-team-header-${engTeam.id}`)).toBeVisible();
    await expect(page.getByTestId(`sidebar-team-header-${desTeam.id}`)).toBeVisible();

    // Sub-links should be visible (teams start expanded)
    await expect(page.getByTestId(`sidebar-link-team-issues-${engTeam.id}`)).toBeVisible();
    await expect(page.getByTestId(`sidebar-link-team-cycles-${engTeam.id}`)).toBeVisible();
    await expect(page.getByTestId(`sidebar-link-team-projects-${engTeam.id}`)).toBeVisible();
    await expect(page.getByTestId(`sidebar-link-team-views-${engTeam.id}`)).toBeVisible();
  });

  test('Sidebar team section is collapsible', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Team links should be visible initially (expanded)
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).toBeVisible({ timeout: 30000 });

    // Collapse by clicking header
    await page.getByTestId(`sidebar-team-header-${engTeam.id}`).click();
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).not.toBeVisible({ timeout: 10000 });

    // Expand again
    await page.getByTestId(`sidebar-team-header-${engTeam.id}`).click();
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).toBeVisible({ timeout: 10000 });
  });

  test('Sidebar team section collapse toggles multiple times', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Initially expanded
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).toBeVisible({ timeout: 30000 });

    // Click 1: collapse
    await page.getByTestId(`sidebar-team-header-${engTeam.id}`).click();
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).not.toBeVisible({ timeout: 10000 });

    // Click 2: expand
    await page.getByTestId(`sidebar-team-header-${engTeam.id}`).click();
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).toBeVisible({ timeout: 10000 });

    // Click 3: collapse again
    await page.getByTestId(`sidebar-team-header-${engTeam.id}`).click();
    await expect(page.getByTestId(`sidebar-team-links-${engTeam.id}`)).not.toBeVisible({ timeout: 10000 });
  });

  test('Sidebar team Issues link navigates to team issues page', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    await page.getByTestId(`sidebar-link-team-issues-${engTeam.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/team/${engTeam.id}/issues`), { timeout: 30000 });

    // Verify active state
    await expect(page.getByTestId(`sidebar-link-team-issues-${engTeam.id}`)).toHaveClass(/sidebar-link-active/, { timeout: 10000 });
  });

  test('Sidebar team Active Cycle link navigates to cycles page', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    await page.getByTestId(`sidebar-link-team-cycles-${engTeam.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/team/${engTeam.id}/cycles`), { timeout: 30000 });
  });

  test('Sidebar team Projects link navigates to team projects', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    await page.getByTestId(`sidebar-link-team-projects-${engTeam.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/team/${engTeam.id}/projects`), { timeout: 30000 });
  });

  test('Sidebar team Views link navigates to saved views', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    await page.getByTestId(`sidebar-link-team-views-${engTeam.id}`).click();
    await expect(page).toHaveURL(new RegExp(`/team/${engTeam.id}/views`), { timeout: 30000 });
  });

  test('Sidebar renders workspace section links', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId('sidebar-workspace-section')).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId('sidebar-link-all-projects')).toBeVisible();
    await expect(page.getByTestId('sidebar-link-all-projects')).toContainText('All Projects');

    await expect(page.getByTestId('sidebar-link-all-teams')).toBeVisible();
    await expect(page.getByTestId('sidebar-link-all-teams')).toContainText('All Teams');

    await expect(page.getByTestId('sidebar-link-members')).toBeVisible();
    await expect(page.getByTestId('sidebar-link-members')).toContainText('Members');

    await expect(page.getByTestId('sidebar-link-labels')).toBeVisible();
    await expect(page.getByTestId('sidebar-link-labels')).toContainText('Labels');
  });

  test('Sidebar All Projects link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-all-projects').click();
    await expect(page).toHaveURL(/\/projects/, { timeout: 30000 });
  });

  test('Sidebar All Teams link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-all-teams').click();
    await expect(page).toHaveURL(/\/settings\/teams/, { timeout: 30000 });
  });

  test('Sidebar Members link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-members').click();
    await expect(page).toHaveURL(/\/settings\/members/, { timeout: 30000 });
  });

  test('Sidebar Labels link navigates correctly', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('sidebar-link-labels').click();
    await expect(page).toHaveURL(/\/settings\/labels/, { timeout: 30000 });
  });
});
