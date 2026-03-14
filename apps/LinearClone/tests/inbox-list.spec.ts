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

// Helper to get notifications via API
async function getNotifications(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.notifications as Array<{
    id: string;
    type: string;
    issue_id: string;
    description: string;
    read: boolean;
    issue_identifier: string;
    created_at: string;
  }>;
}

// Helper to archive notification via API
async function archiveNotificationAPI(baseURL: string, token: string, id: string) {
  await fetch(`${baseURL}/api/notifications/${id}/archive`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Helper to authenticate page as Alice
async function authenticatePage(page: any, baseURL: string): Promise<string> {
  const token = await loginAsAlice(baseURL);
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  return token;
}

// Cleanup: archive all notifications before each test so we start from seed state
async function archiveAllNotifications(baseURL: string, token: string) {
  const notifications = await getNotifications(baseURL, token);
  for (const n of notifications) {
    await archiveNotificationAPI(baseURL, token, n.id);
  }
}

test.describe('Inbox List', () => {
  test('Inbox page renders with list of notifications', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');

    await expect(page.getByTestId('inbox-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // Alice has 3 notifications in seed (assignment, update, mention)
    const notifications = await getNotifications(baseURL!, token);
    const rows = page.locator('[data-testid^="notification-row-"]');
    await expect(rows).toHaveCount(notifications.length, { timeout: 15000 });

    // Each notification is a distinct row
    for (const n of notifications) {
      await expect(page.getByTestId(`notification-row-${n.id}`)).toBeVisible();
    }
  });

  test('Inbox page shows empty state when no notifications', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);

    // Archive all notifications via API
    await archiveAllNotifications(baseURL!, token);

    await page.goto('/inbox');
    await expect(page.getByTestId('inbox-page')).toBeVisible({ timeout: 30000 });

    // Empty state should be shown
    await expect(page.getByTestId('notification-list-empty')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('notification-list-empty')).toContainText("You're all caught up!");
  });

  test('Inbox shows unread notifications visually distinct from read', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const unreadNotifications = notifications.filter((n) => !n.read);
    const readNotifications = notifications.filter((n) => n.read);

    // Unread notifications should have the unread class (bold text, left border accent)
    for (const n of unreadNotifications) {
      await expect(page.getByTestId(`notification-row-${n.id}`)).toHaveClass(/notification-row-unread/, { timeout: 10000 });
    }

    // Read notifications should NOT have the unread class
    for (const n of readNotifications) {
      await expect(page.getByTestId(`notification-row-${n.id}`)).not.toHaveClass(/notification-row-unread/, { timeout: 10000 });
    }
  });

  test('Inbox page shows notification count in header', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('inbox-page')).toBeVisible({ timeout: 30000 });

    // Get unread count from API
    const notifications = await getNotifications(baseURL!, token);
    const unreadCount = notifications.filter((n) => !n.read).length;

    // Header should show count
    await expect(page.getByTestId('inbox-title')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('inbox-title-count')).toContainText(`(${unreadCount})`, { timeout: 15000 });
  });

  test('Inbox notification list updates sidebar badge when notifications change', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // Sidebar badge should show initial unread count
    const notifications = await getNotifications(baseURL!, token);
    const unreadCount = notifications.filter((n) => !n.read).length;
    await expect(page.getByTestId('sidebar-inbox-badge')).toHaveText(String(unreadCount), { timeout: 15000 });

    // Click an unread notification to mark it as read
    const unreadNotification = notifications.find((n) => !n.read);
    if (unreadNotification) {
      await page.getByTestId(`notification-row-${unreadNotification.id}`).click();
      // Navigate back to inbox
      await page.getByTestId('sidebar-link-inbox').click();
      await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });

      // Badge should decrement
      await expect(page.getByTestId('sidebar-inbox-badge')).toHaveText(String(unreadCount - 1), { timeout: 15000 });
    }
  });

  test('Inbox notifications are ordered by newest first', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // API returns newest first (ORDER BY created_at DESC)
    const notifications = await getNotifications(baseURL!, token);

    // Verify order by checking rows appear in same order as API response
    const rows = page.locator('[data-testid^="notification-row-"]');
    const rowCount = await rows.count();
    expect(rowCount).toBe(notifications.length);

    for (let i = 0; i < notifications.length; i++) {
      const rowTestId = await rows.nth(i).getAttribute('data-testid');
      expect(rowTestId).toBe(`notification-row-${notifications[i].id}`);
    }
  });

  test('Archiving a notification removes it from the list', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const initialCount = notifications.length;
    const targetNotification = notifications[0];

    // Archive the first notification
    await page.getByTestId(`notification-archive-btn-${targetNotification.id}`).click({ force: true });

    // Notification should be removed
    await expect(page.getByTestId(`notification-row-${targetNotification.id}`)).not.toBeVisible({ timeout: 15000 });

    // List should have one fewer item
    const rows = page.locator('[data-testid^="notification-row-"]');
    await expect(rows).toHaveCount(initialCount - 1, { timeout: 15000 });
  });

  test('Archiving multiple notifications works in sequence', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const initialCount = notifications.length;
    expect(initialCount).toBeGreaterThanOrEqual(2);

    // Archive first notification
    await page.getByTestId(`notification-archive-btn-${notifications[0].id}`).click({ force: true });
    await expect(page.getByTestId(`notification-row-${notifications[0].id}`)).not.toBeVisible({ timeout: 15000 });

    // Archive second notification (now it's still identifiable by its ID)
    await page.getByTestId(`notification-archive-btn-${notifications[1].id}`).click({ force: true });
    await expect(page.getByTestId(`notification-row-${notifications[1].id}`)).not.toBeVisible({ timeout: 15000 });

    // Remaining count
    const rows = page.locator('[data-testid^="notification-row-"]');
    await expect(rows).toHaveCount(initialCount - 2, { timeout: 15000 });
  });

  test('All notifications can be archived to reach empty state', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);

    // Archive all notifications one by one
    for (const n of notifications) {
      await page.getByTestId(`notification-archive-btn-${n.id}`).click({ force: true });
      await expect(page.getByTestId(`notification-row-${n.id}`)).not.toBeVisible({ timeout: 15000 });
    }

    // Empty state should appear
    await expect(page.getByTestId('notification-list-empty')).toBeVisible({ timeout: 15000 });

    // Sidebar badge should disappear
    await expect(page.getByTestId('sidebar-inbox-badge')).not.toBeVisible({ timeout: 15000 });
  });
});
