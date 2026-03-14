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

// Helper to login and navigate to /my-issues
async function loginAndNavigate(
  page: import('@playwright/test').Page,
  baseURL: string,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/my-issues');
  await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });
  return data;
}

// Alice's seed issues (assigned to her):
// ENG-1: status=in_progress, priority=high, label=Bug
// ENG-6: status=todo, priority=urgent, label=Bug
// DES-3: status=todo, priority=low, label=Improvement
// Total: 3 issues

test.describe('MyIssues Filters', () => {
  test('Filters toolbar renders with Status, Priority, and Label filters', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Verify filters toolbar is visible
    await expect(page.getByTestId('filters-toolbar')).toBeVisible({ timeout: 30000 });

    // Verify all three filter buttons are present
    await expect(page.getByTestId('filter-btn-status')).toBeVisible();
    await expect(page.getByTestId('filter-btn-status')).toContainText('Status');

    await expect(page.getByTestId('filter-btn-priority')).toBeVisible();
    await expect(page.getByTestId('filter-btn-priority')).toContainText('Priority');

    await expect(page.getByTestId('filter-btn-label')).toBeVisible();
    await expect(page.getByTestId('filter-btn-label')).toContainText('Label');
  });

  test('Status filter dropdown shows all statuses with icons', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Click the Status filter button
    await page.getByTestId('filter-btn-status').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('filter-dropdown-status')).toBeVisible();

    // Verify all 6 statuses are shown
    await expect(page.getByTestId('filter-option-status-backlog')).toBeVisible();
    await expect(page.getByTestId('filter-option-status-backlog')).toContainText('Backlog');

    await expect(page.getByTestId('filter-option-status-todo')).toBeVisible();
    await expect(page.getByTestId('filter-option-status-todo')).toContainText('Todo');

    await expect(page.getByTestId('filter-option-status-in_progress')).toBeVisible();
    await expect(page.getByTestId('filter-option-status-in_progress')).toContainText('In Progress');

    await expect(page.getByTestId('filter-option-status-in_review')).toBeVisible();
    await expect(page.getByTestId('filter-option-status-in_review')).toContainText('In Review');

    await expect(page.getByTestId('filter-option-status-done')).toBeVisible();
    await expect(page.getByTestId('filter-option-status-done')).toContainText('Done');

    await expect(page.getByTestId('filter-option-status-cancelled')).toBeVisible();
    await expect(page.getByTestId('filter-option-status-cancelled')).toContainText('Cancelled');

    // Each option should have an SVG icon (StatusIcon component)
    for (const status of ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']) {
      await expect(page.getByTestId(`filter-option-status-${status}`).locator('svg')).toHaveCount(1);
    }
  });

  test('Status filter filters issues by selected statuses', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Alice has: todo (2: ENG-6, DES-3), in_progress (1: ENG-1)
    // Verify initial state - 3 issues total
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Open Status filter and select "In Progress"
    await page.getByTestId('filter-btn-status').click();
    await page.getByTestId('filter-option-status-in_progress').click();

    // Only in_progress group should be visible with 1 issue
    await expect(page.getByTestId('issue-group-in_progress')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1);

    // Todo group should be hidden
    await expect(page.getByTestId('issue-group-todo')).toHaveCount(0);

    // Status filter button should show badge "1"
    await expect(page.getByTestId('filter-badge-status')).toBeVisible();
    await expect(page.getByTestId('filter-badge-status')).toHaveText('1');
  });

  test('Status filter allows multi-select', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Wait for issues to load
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Open Status filter and select "Todo" and "In Progress"
    await page.getByTestId('filter-btn-status').click();
    await page.getByTestId('filter-option-status-todo').click();
    await page.getByTestId('filter-option-status-in_progress').click();

    // Both groups should be visible, showing all 3 issues
    await expect(page.getByTestId('issue-group-todo')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('issue-group-in_progress')).toBeVisible();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3);

    // Filter badge should show "2"
    await expect(page.getByTestId('filter-badge-status')).toBeVisible();
    await expect(page.getByTestId('filter-badge-status')).toHaveText('2');
  });

  test('Priority filter dropdown shows all priorities with icons', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Click the Priority filter button
    await page.getByTestId('filter-btn-priority').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('filter-dropdown-priority')).toBeVisible();

    // Verify all 5 priorities are shown
    await expect(page.getByTestId('filter-option-priority-urgent')).toBeVisible();
    await expect(page.getByTestId('filter-option-priority-urgent')).toContainText('Urgent');

    await expect(page.getByTestId('filter-option-priority-high')).toBeVisible();
    await expect(page.getByTestId('filter-option-priority-high')).toContainText('High');

    await expect(page.getByTestId('filter-option-priority-medium')).toBeVisible();
    await expect(page.getByTestId('filter-option-priority-medium')).toContainText('Medium');

    await expect(page.getByTestId('filter-option-priority-low')).toBeVisible();
    await expect(page.getByTestId('filter-option-priority-low')).toContainText('Low');

    await expect(page.getByTestId('filter-option-priority-none')).toBeVisible();
    await expect(page.getByTestId('filter-option-priority-none')).toContainText('No Priority');

    // Each option should have an SVG icon (PriorityIcon component)
    for (const priority of ['urgent', 'high', 'medium', 'low', 'none']) {
      await expect(page.getByTestId(`filter-option-priority-${priority}`).locator('svg')).toHaveCount(1);
    }
  });

  test('Priority filter filters issues by selected priorities', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Alice has: high (ENG-1), urgent (ENG-6), low (DES-3)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Open Priority filter and select "High"
    await page.getByTestId('filter-btn-priority').click();
    await page.getByTestId('filter-option-priority-high').click();

    // Only ENG-1 should be visible (high priority)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);

    // Other issues should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^DES-3$/ })).toHaveCount(0);
  });

  test('Label filter dropdown shows all available labels', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Click the Label filter button
    await page.getByTestId('filter-btn-label').click();

    // Verify dropdown is visible
    await expect(page.getByTestId('filter-dropdown-label')).toBeVisible();

    // Seed labels: Bug (red), Documentation (purple), Feature (green), Improvement (blue)
    // Labels are ordered by name ASC, so: Bug, Documentation, Feature, Improvement
    // Each label option has a colored dot and the label name
    const dropdown = page.getByTestId('filter-dropdown-label');
    await expect(dropdown.locator('button')).toHaveCount(4);

    await expect(dropdown).toContainText('Bug');
    await expect(dropdown).toContainText('Feature');
    await expect(dropdown).toContainText('Improvement');
    await expect(dropdown).toContainText('Documentation');
  });

  test('Label filter filters issues by selected labels', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Alice's issues: ENG-1 (Bug), ENG-6 (Bug), DES-3 (Improvement)
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Open Label filter and select "Bug"
    await page.getByTestId('filter-btn-label').click();

    // Find the Bug option in the dropdown
    const bugOption = page.getByTestId('filter-dropdown-label').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    // Only Bug-labeled issues should show: ENG-1 and ENG-6
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(2, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(1);

    // DES-3 (Improvement) should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^DES-3$/ })).toHaveCount(0);
  });

  test('Multiple filters combine with AND logic', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    // Alice's issues:
    // ENG-1: priority=high, label=Bug, status=in_progress
    // ENG-6: priority=urgent, label=Bug, status=todo
    // DES-3: priority=low, label=Improvement, status=todo
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Select "High" in Priority filter
    await page.getByTestId('filter-btn-priority').click();
    await page.getByTestId('filter-option-priority-high').click();
    // Close priority dropdown by clicking elsewhere
    await page.getByTestId('my-issues-title').click();

    // Select "Bug" in Label filter
    await page.getByTestId('filter-btn-label').click();
    const bugOption = page.getByTestId('filter-dropdown-label').locator('button').filter({ hasText: /^Bug$/ });
    await bugOption.click();

    // Only ENG-1 matches both High priority AND Bug label
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);

    // ENG-6 (urgent, Bug) and DES-3 (low, Improvement) should be hidden
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-6$/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^DES-3$/ })).toHaveCount(0);
  });

  test('Clearing a filter restores all issues', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Apply Status filter for "In Progress"
    await page.getByTestId('filter-btn-status').click();
    await page.getByTestId('filter-option-status-in_progress').click();

    // Only 1 issue visible
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });

    // Deselect "In Progress" to clear the filter
    await page.getByTestId('filter-option-status-in_progress').click();

    // All 3 issues should be restored
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 15000 });

    // Badge should be gone
    await expect(page.getByTestId('filter-badge-status')).toHaveCount(0);
  });

  test('Filters can be used repeatedly after clearing', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Apply Priority filter for "High"
    await page.getByTestId('filter-btn-priority').click();
    await page.getByTestId('filter-option-priority-high').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });

    // Clear it
    await page.getByTestId('filter-option-priority-high').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 15000 });

    // Close priority dropdown
    await page.getByTestId('my-issues-title').click();

    // Apply Priority filter for "Low"
    await page.getByTestId('filter-btn-priority').click();
    await page.getByTestId('filter-option-priority-low').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^DES-3$/ })).toHaveCount(1);

    // Clear it
    await page.getByTestId('filter-option-priority-low').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 15000 });

    // Close priority dropdown
    await page.getByTestId('my-issues-title').click();

    // Apply Status filter for "In Progress" (only ENG-1 is done status... actually ENG-1 is in_progress)
    await page.getByTestId('filter-btn-status').click();
    await page.getByTestId('filter-option-status-in_progress').click();
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });
    await expect(page.locator('[data-testid^="issue-identifier-"]').filter({ hasText: /^ENG-1$/ })).toHaveCount(1);
  });

  test('Filter state shows active filter indicators', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Initially, no badges should be visible
    await expect(page.getByTestId('filter-badge-status')).toHaveCount(0);
    await expect(page.getByTestId('filter-badge-priority')).toHaveCount(0);
    await expect(page.getByTestId('filter-badge-label')).toHaveCount(0);

    // Select "High" in Priority filter
    await page.getByTestId('filter-btn-priority').click();
    await page.getByTestId('filter-option-priority-high').click();

    // Priority filter button should show active indicator (badge with "1")
    await expect(page.getByTestId('filter-badge-priority')).toBeVisible();
    await expect(page.getByTestId('filter-badge-priority')).toHaveText('1');

    // Priority button should have active class
    await expect(page.getByTestId('filter-btn-priority')).toHaveClass(/filters-toolbar-btn-active/);

    // Status and Label filter buttons should remain inactive
    await expect(page.getByTestId('filter-badge-status')).toHaveCount(0);
    await expect(page.getByTestId('filter-badge-label')).toHaveCount(0);
    await expect(page.getByTestId('filter-btn-status')).not.toHaveClass(/filters-toolbar-btn-active/);
    await expect(page.getByTestId('filter-btn-label')).not.toHaveClass(/filters-toolbar-btn-active/);
  });

  test('Filters persist while navigating within the page', async ({ page, baseURL }) => {
    await loginAndNavigate(page, baseURL!);

    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(3, { timeout: 30000 });

    // Apply Status filter for "In Progress"
    await page.getByTestId('filter-btn-status').click();
    await page.getByTestId('filter-option-status-in_progress').click();

    // Close dropdown
    await page.getByTestId('my-issues-title').click();

    // Verify filter is applied - only 1 issue
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });

    // Click on the issue title to navigate to detail page
    const issueTitle = page.locator('[data-testid^="issue-title-"]').first();
    await issueTitle.click();

    // Wait for issue detail page to load
    await expect(page.locator('[data-testid="issue-detail-page"]')).toBeVisible({ timeout: 30000 });

    // Navigate back to /my-issues
    await page.goBack();

    // Verify we're back on my-issues page
    await expect(page.getByTestId('my-issues-page')).toBeVisible({ timeout: 30000 });

    // Verify filter is still applied - still showing only "In Progress" issues
    await expect(page.locator('[data-testid^="issue-row-"]')).toHaveCount(1, { timeout: 15000 });

    // Verify filter badge is still showing
    await expect(page.getByTestId('filter-badge-status')).toBeVisible();
    await expect(page.getByTestId('filter-badge-status')).toHaveText('1');
  });
});
