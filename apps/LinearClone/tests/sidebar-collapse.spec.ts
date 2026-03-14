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

// Helper to authenticate page as Alice
async function authenticatePage(page: any, baseURL: string): Promise<string> {
  const token = await loginAsAlice(baseURL);
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  return token;
}

test.describe('SidebarCollapse', () => {
  test('Sidebar collapse toggle button is visible', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    await expect(page.getByTestId('sidebar-collapse-toggle')).toBeVisible({ timeout: 10000 });
  });

  test('Sidebar collapses to icon-only mode', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Verify sidebar is expanded (has text labels)
    await expect(page.getByTestId('sidebar-link-my-issues')).toContainText('My Issues', { timeout: 10000 });

    // Click collapse toggle
    await page.getByTestId('sidebar-collapse-toggle').click();

    // Sidebar should have collapsed class
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Text labels should be hidden - "My Issues" text should not be visible
    await expect(page.getByTestId('sidebar-link-my-issues').locator('span')).not.toBeVisible({ timeout: 10000 });
  });

  test('Sidebar expands from icon-only mode', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Collapse first
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Now expand
    await page.getByTestId('sidebar-collapse-toggle').click();

    // Sidebar should no longer have collapsed class
    await expect(page.getByTestId('sidebar')).not.toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Text labels should be visible again
    await expect(page.getByTestId('sidebar-link-my-issues')).toContainText('My Issues', { timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-inbox')).toContainText('Inbox', { timeout: 10000 });
  });

  test('Sidebar collapse state persists across navigation', async ({ page, baseURL }) => {
    test.slow();
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Collapse the sidebar
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Navigate to Inbox by clicking the icon
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });

    // Sidebar should still be collapsed
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Navigate to My Issues by clicking the icon
    await page.getByTestId('sidebar-link-my-issues').click();
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Sidebar should still be collapsed
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });
  });

  test('Sidebar icons are still clickable in collapsed mode', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Collapse the sidebar
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Click Inbox icon in collapsed sidebar
    await page.getByTestId('sidebar-link-inbox').click();
    await expect(page).toHaveURL(/\/inbox/, { timeout: 30000 });
  });

  test('Sidebar collapse toggle works multiple times in sequence', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Click 1: collapse
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Click 2: expand
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).not.toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Click 3: collapse again
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });
  });

  test('Sidebar team sections visible in collapsed mode', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    const teams = await getTeams(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Collapse the sidebar
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Team section and links should still be visible
    await expect(page.getByTestId('sidebar-teams-section')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`sidebar-link-team-issues-${engTeam.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`sidebar-link-team-cycles-${engTeam.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`sidebar-link-team-projects-${engTeam.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`sidebar-link-team-views-${engTeam.id}`)).toBeVisible({ timeout: 10000 });
  });

  test('Sidebar workspace section visible in collapsed mode', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/my-issues');
    await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 30000 });

    // Collapse the sidebar
    await page.getByTestId('sidebar-collapse-toggle').click();
    await expect(page.getByTestId('sidebar')).toHaveClass(/sidebar-collapsed/, { timeout: 10000 });

    // Workspace section links should still be visible as icons
    await expect(page.getByTestId('sidebar-workspace-section')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-all-projects')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-all-teams')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-members')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-labels')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sidebar-link-settings')).toBeVisible({ timeout: 10000 });
  });
});
