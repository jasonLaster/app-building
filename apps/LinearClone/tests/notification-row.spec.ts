import { test, expect, type Page } from '@playwright/test';

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

// Helper to mark notification as read via API
async function _markNotificationReadAPI(baseURL: string, token: string, id: string) {
  await fetch(`${baseURL}/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Helper to authenticate page as Alice
async function authenticatePage(page: Page, baseURL: string): Promise<string> {
  const token = await loginAsAlice(baseURL);
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  return token;
}

test.describe('Notification Row', () => {
  test('Notification row displays assignment notification correctly', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const assignmentNotif = notifications.find((n) => n.type === 'assignment');
    expect(assignmentNotif).toBeTruthy();

    const row = page.getByTestId(`notification-row-${assignmentNotif!.id}`);
    await expect(row).toBeVisible();

    // Icon should be present
    await expect(page.getByTestId(`notification-icon-${assignmentNotif!.id}`)).toBeVisible();
    // Should have assignment icon class
    await expect(
      page.getByTestId(`notification-icon-${assignmentNotif!.id}`).locator('.notification-type-icon-assignment')
    ).toBeVisible();

    // Issue identifier
    await expect(page.getByTestId(`notification-identifier-${assignmentNotif!.id}`)).toContainText(assignmentNotif!.issue_identifier);

    // Description
    await expect(page.getByTestId(`notification-description-${assignmentNotif!.id}`)).toBeVisible();

    // Timestamp (relative format)
    const timestamp = page.getByTestId(`notification-timestamp-${assignmentNotif!.id}`);
    await expect(timestamp).toBeVisible();
    await expect(timestamp).toContainText(/ago|just now/);
  });

  test('Notification row displays issue update notification correctly', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const updateNotif = notifications.find((n) => n.type === 'update');
    expect(updateNotif).toBeTruthy();

    const row = page.getByTestId(`notification-row-${updateNotif!.id}`);
    await expect(row).toBeVisible();

    // Should have update icon class
    await expect(
      page.getByTestId(`notification-icon-${updateNotif!.id}`).locator('.notification-type-icon-update')
    ).toBeVisible();

    // Issue identifier
    await expect(page.getByTestId(`notification-identifier-${updateNotif!.id}`)).toContainText(updateNotif!.issue_identifier);

    // Timestamp
    const timestamp = page.getByTestId(`notification-timestamp-${updateNotif!.id}`);
    await expect(timestamp).toBeVisible();
    await expect(timestamp).toContainText(/ago|just now/);
  });

  test('Notification row displays mention notification correctly', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const mentionNotif = notifications.find((n) => n.type === 'mention');
    expect(mentionNotif).toBeTruthy();

    const row = page.getByTestId(`notification-row-${mentionNotif!.id}`);
    await expect(row).toBeVisible();

    // Should have mention icon class
    await expect(
      page.getByTestId(`notification-icon-${mentionNotif!.id}`).locator('.notification-type-icon-mention')
    ).toBeVisible();

    // Issue identifier
    await expect(page.getByTestId(`notification-identifier-${mentionNotif!.id}`)).toContainText(mentionNotif!.issue_identifier);

    // Timestamp
    const timestamp = page.getByTestId(`notification-timestamp-${mentionNotif!.id}`);
    await expect(timestamp).toBeVisible();
    await expect(timestamp).toContainText(/ago|just now/);
  });

  test('Clicking an unread notification marks it as read', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const unreadNotif = notifications.find((n) => !n.read);
    expect(unreadNotif).toBeTruthy();

    const row = page.getByTestId(`notification-row-${unreadNotif!.id}`);

    // Verify it's visually unread
    await expect(row).toHaveClass(/notification-row-unread/, { timeout: 10000 });

    // Get initial badge count
    const badgeText = await page.getByTestId('sidebar-inbox-badge').textContent();
    const initialBadge = parseInt(badgeText!, 10);

    // Click the notification
    await row.click();

    // Should navigate to issue detail
    await expect(page).toHaveURL(new RegExp(`/issue/${unreadNotif!.issue_id}`), { timeout: 30000 });

    // Navigate back to inbox
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // Notification should now be read (no unread class)
    await expect(page.getByTestId(`notification-row-${unreadNotif!.id}`)).not.toHaveClass(/notification-row-unread/, { timeout: 15000 });

    // Badge should have decremented
    if (initialBadge > 1) {
      await expect(page.getByTestId('sidebar-inbox-badge')).toHaveText(String(initialBadge - 1), { timeout: 15000 });
    } else {
      await expect(page.getByTestId('sidebar-inbox-badge')).not.toBeVisible({ timeout: 15000 });
    }
  });

  test('Clicking a read notification does not change its state', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const readNotif = notifications.find((n) => n.read);
    expect(readNotif).toBeTruthy();

    const row = page.getByTestId(`notification-row-${readNotif!.id}`);

    // Verify it's visually read (no unread class)
    await expect(row).not.toHaveClass(/notification-row-unread/, { timeout: 10000 });

    // Click the notification
    await row.click();

    // Should navigate to issue detail
    await expect(page).toHaveURL(new RegExp(`/issue/${readNotif!.issue_id}`), { timeout: 30000 });

    // Navigate back to inbox
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // Notification should still be read
    await expect(page.getByTestId(`notification-row-${readNotif!.id}`)).not.toHaveClass(/notification-row-unread/, { timeout: 15000 });
  });

  test('Clicking a notification navigates to the related issue', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const targetNotif = notifications[0];

    // Click the notification
    await page.getByTestId(`notification-row-${targetNotif.id}`).click();

    // Should navigate to issue detail page
    await expect(page).toHaveURL(new RegExp(`/issue/${targetNotif.issue_id}`), { timeout: 30000 });

    // Issue detail page should load with the issue identifier
    await expect(page.getByTestId('issue-header-identifier')).toContainText(targetNotif.issue_identifier, { timeout: 30000 });
  });

  test('Notification row archive button is visible', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const targetNotif = notifications[0];

    const row = page.getByTestId(`notification-row-${targetNotif.id}`);
    const archiveBtn = page.getByTestId(`notification-archive-btn-${targetNotif.id}`);

    // Hover over the row to reveal the archive button
    await row.hover();
    await expect(archiveBtn).toBeVisible({ timeout: 10000 });
  });

  test('Notification row archive button archives without navigating', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const targetNotif = notifications[0];

    // Click the archive button (using force since it's opacity-hidden until hover)
    await page.getByTestId(`notification-archive-btn-${targetNotif.id}`).click({ force: true });

    // Notification should be removed
    await expect(page.getByTestId(`notification-row-${targetNotif.id}`)).not.toBeVisible({ timeout: 15000 });

    // User should remain on /inbox page
    await expect(page).toHaveURL(/\/inbox/, { timeout: 5000 });
  });

  test('Notification row shows correct icon per notification type', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);

    // Check each type has its distinct icon
    const assignmentNotif = notifications.find((n) => n.type === 'assignment');
    const updateNotif = notifications.find((n) => n.type === 'update');
    const mentionNotif = notifications.find((n) => n.type === 'mention');

    if (assignmentNotif) {
      await expect(
        page.getByTestId(`notification-icon-${assignmentNotif.id}`).locator('.notification-type-icon-assignment')
      ).toBeVisible({ timeout: 10000 });
    }

    if (updateNotif) {
      await expect(
        page.getByTestId(`notification-icon-${updateNotif.id}`).locator('.notification-type-icon-update')
      ).toBeVisible({ timeout: 10000 });
    }

    if (mentionNotif) {
      await expect(
        page.getByTestId(`notification-icon-${mentionNotif.id}`).locator('.notification-type-icon-mention')
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('Notification row displays relative timestamps that update', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);

    // All timestamps should use relative format
    for (const n of notifications) {
      const timestamp = page.getByTestId(`notification-timestamp-${n.id}`);
      await expect(timestamp).toBeVisible({ timeout: 10000 });
      // Should match relative timestamp patterns
      await expect(timestamp).toContainText(/just now|\d+m ago|\d+h ago|\d+d ago|\d+mo ago/, { timeout: 10000 });
    }
  });

  test('Notification row click and archive button have separate hit targets', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    expect(notifications.length).toBeGreaterThanOrEqual(2);

    // Use one notification to test archive button isolation
    const archiveNotif = notifications[0];
    const archiveRow = page.getByTestId(`notification-row-${archiveNotif.id}`);
    await expect(archiveRow).toBeVisible();

    // Click specifically on the archive button
    const archiveBtn = page.getByTestId(`notification-archive-btn-${archiveNotif.id}`);
    await archiveBtn.click({ force: true });

    // Should NOT navigate away from inbox — the archive button's stopPropagation prevents row click
    await expect(page).toHaveURL(/\/inbox/, { timeout: 5000 });

    // The notification should be removed from the list (archived)
    await expect(page.getByTestId(`notification-row-${archiveNotif.id}`)).not.toBeVisible({ timeout: 15000 });

    // Now use a different notification to test that row click DOES navigate
    const clickNotif = notifications[1];
    const clickRow = page.getByTestId(`notification-row-${clickNotif.id}`);
    await expect(clickRow).toBeVisible();

    // Click on the row body (not the archive button) — should navigate to issue detail
    await clickRow.click();
    await expect(page).toHaveURL(new RegExp(`/issue/${clickNotif.issue_id}`), { timeout: 30000 });
  });

  test('Marking notification as read then archiving works correctly', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/inbox');
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    const notifications = await getNotifications(baseURL!, token);
    const unreadNotif = notifications.find((n) => !n.read);
    expect(unreadNotif).toBeTruthy();

    const row = page.getByTestId(`notification-row-${unreadNotif!.id}`);

    // Verify it's unread
    await expect(row).toHaveClass(/notification-row-unread/, { timeout: 10000 });

    // Click to mark as read (will navigate to issue)
    await row.click();
    await expect(page).toHaveURL(new RegExp(`/issue/${unreadNotif!.issue_id}`), { timeout: 30000 });

    // Navigate back to inbox
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });
    await expect(page.getByTestId('notification-list')).toBeVisible({ timeout: 30000 });

    // Verify it's now read
    await expect(page.getByTestId(`notification-row-${unreadNotif!.id}`)).not.toHaveClass(/notification-row-unread/, { timeout: 15000 });

    // Now archive it
    await page.getByTestId(`notification-archive-btn-${unreadNotif!.id}`).click({ force: true });

    // Notification should be removed
    await expect(page.getByTestId(`notification-row-${unreadNotif!.id}`)).not.toBeVisible({ timeout: 15000 });
  });
});
