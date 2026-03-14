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

// Helper to get team issues via API
async function getTeamIssues(baseURL: string, token: string, teamId: string) {
  const response = await fetch(`${baseURL}/api/team-issues?teamId=${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.issues;
}

// Helper to update an issue field via API
async function updateIssueField(
  baseURL: string,
  token: string,
  issueId: string,
  field: string,
  value: string
) {
  const response = await fetch(`${baseURL}/api/update-issue`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ issueId, field, value }),
  });
  return response.json();
}

// Helper to login and navigate to an issue detail page
async function loginAndNavigateToIssue(
  page: import('@playwright/test').Page,
  baseURL: string,
  issueNumber: number,
  email = 'alice@acme.com',
  password = 'password123'
) {
  const data = await loginViaApi(baseURL, email, password);
  const teams = await getTeams(baseURL, data.token);
  const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
  const issues = await getTeamIssues(baseURL, data.token, engTeam.id);

  // Find the issue by number
  const issue = issues.find((i: { number: number }) => i.number === issueNumber);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/issue/${issue.id}`);
  await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, engTeam, issue };
}

test.describe('IssueDetailLayout', () => {
  test('Issue detail page shows correct layout with left and right panels', async ({ page, baseURL }) => {
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify the two-panel layout exists
    const layout = page.getByTestId('issue-detail-layout');
    await expect(layout).toBeVisible();

    // Verify left panel (main content) is visible
    const mainPanel = page.getByTestId('issue-detail-main');
    await expect(mainPanel).toBeVisible();

    // Verify right panel (sidebar) is visible
    const sidebar = page.getByTestId('issue-detail-sidebar');
    await expect(sidebar).toBeVisible();

    // Verify left panel contains the expected sections
    await expect(page.getByTestId('issue-header')).toBeVisible();
    await expect(page.getByTestId('issue-description')).toBeVisible();

    // Verify the sidebar is to the right of the main panel
    const mainBox = await mainPanel.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    expect(mainBox).not.toBeNull();
    expect(sidebarBox).not.toBeNull();
    expect(sidebarBox!.x).toBeGreaterThan(mainBox!.x);
  });
});

test.describe('IssueDetailDescription', () => {
  test('Description renders markdown content', async ({ page, baseURL }) => {
    // Setup: set markdown description via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 4);

    const markdownContent = '## Bug Details\n\nThis is **important** and has `inline code`.\n\n- Item one\n- Item two\n\n```\nconst x = 1;\n```';
    await updateIssueField(baseURL!, data.token, issue.id, 'description', markdownContent);

    // Navigate to the issue
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    // Verify markdown is rendered as HTML
    const rendered = page.getByTestId('issue-description-rendered');
    await expect(rendered).toBeVisible();

    // Verify heading is rendered
    await expect(rendered.locator('h2')).toContainText('Bug Details');

    // Verify bold text is rendered
    await expect(rendered.locator('strong')).toContainText('important');

    // Verify inline code is rendered
    await expect(rendered.locator('code.md-inline-code')).toContainText('inline code');

    // Verify list items
    await expect(rendered.locator('ul li')).toHaveCount(2);

    // Verify code block
    await expect(rendered.locator('pre.md-code-block')).toBeVisible();
  });

  test('Description shows placeholder when empty', async ({ page, baseURL }) => {
    // ENG-3 has no description in seed data
    // First clear any description via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 3);
    await updateIssueField(baseURL!, data.token, issue.id, 'description', '');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    // Verify placeholder is shown
    const placeholder = page.getByTestId('issue-description-empty');
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toHaveText('Add a description...');

    // Verify the content area has placeholder styling
    await expect(page.getByTestId('issue-description-content')).toHaveClass(/issue-description-placeholder/);
  });

  test('Click to edit description', async ({ page, baseURL }) => {
    // Set a description first via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 5);
    await updateIssueField(baseURL!, data.token, issue.id, 'description', 'This is a bug in the login flow');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    // Click the description content
    await page.getByTestId('issue-description-content').click();

    // Verify editor appears with existing content
    const editor = page.getByTestId('issue-description-editor');
    await expect(editor).toBeVisible();
    await expect(editor).toHaveValue('This is a bug in the login flow');
    await expect(editor).toBeFocused();
  });

  test('Save edited description', async ({ page, baseURL }) => {
    // Set initial description via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 6);
    await updateIssueField(baseURL!, data.token, issue.id, 'description', 'This is a bug in the login flow');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    // Click to edit
    await page.getByTestId('issue-description-content').click();
    const editor = page.getByTestId('issue-description-editor');
    await expect(editor).toBeVisible();

    const uniqueSuffix = Date.now();
    const newDescription = `This is a critical bug affecting all users ${uniqueSuffix}`;

    // Clear and type new description
    await editor.fill(newDescription);

    // Click outside to save (blur)
    await page.getByTestId('issue-header').click();

    // Verify description updated in display mode
    await expect(page.getByTestId('issue-description-content')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('issue-description-rendered')).toContainText(newDescription);

    // Verify editor is gone
    await expect(page.getByTestId('issue-description-editor')).toHaveCount(0);
  });

  test('Description supports markdown formatting', async ({ page, baseURL }) => {
    // Use ENG-8
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 8);
    // Start with empty description
    await updateIssueField(baseURL!, data.token, issue.id, 'description', '');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    // Click to edit (placeholder state)
    await page.getByTestId('issue-description-content').click();
    const editor = page.getByTestId('issue-description-editor');
    await expect(editor).toBeVisible();

    // Type markdown content
    const markdownText = '## Steps to reproduce\n1. Go to login\n2. Enter invalid password\n3. **Error message** is missing';
    await editor.fill(markdownText);

    // Save by clicking outside
    await page.getByTestId('issue-header').click();

    // Verify rendered output
    const rendered = page.getByTestId('issue-description-rendered');
    await expect(rendered).toBeVisible({ timeout: 30000 });

    // Verify heading
    await expect(rendered.locator('h2')).toContainText('Steps to reproduce');

    // Verify ordered list with 3 items
    await expect(rendered.locator('ol li')).toHaveCount(3);

    // Verify bold text
    await expect(rendered.locator('strong')).toContainText('Error message');
  });

  test('Cancel description edit on Escape', async ({ page, baseURL }) => {
    // Set initial description via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 1);
    const originalDesc = 'Original description content';
    await updateIssueField(baseURL!, data.token, issue.id, 'description', originalDesc);

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    // Click to edit
    await page.getByTestId('issue-description-content').click();
    const editor = page.getByTestId('issue-description-editor');
    await expect(editor).toBeVisible();

    // Modify text
    await editor.fill('Some changed text that should not be saved');

    // Press Escape to cancel
    await editor.press('Escape');

    // Verify reverted to original in display mode
    await expect(page.getByTestId('issue-description-content')).toBeVisible();
    await expect(page.getByTestId('issue-description-rendered')).toContainText(originalDesc);

    // Verify editor is gone
    await expect(page.getByTestId('issue-description-editor')).toHaveCount(0);
  });

  test('Edit description multiple times in sequence', async ({ page, baseURL }) => {
    // Set initial description via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 2);
    await updateIssueField(baseURL!, data.token, issue.id, 'description', 'Initial description');

    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-header')).toBeVisible({ timeout: 30000 });

    const uniqueSuffix = Date.now();

    // First edit
    const firstEdit = `First edit ${uniqueSuffix}`;
    await page.getByTestId('issue-description-content').click();
    const editor = page.getByTestId('issue-description-editor');
    await expect(editor).toBeVisible();
    await editor.fill(firstEdit);

    // Save by clicking outside
    await page.getByTestId('issue-header').click();

    // Verify first edit saved
    await expect(page.getByTestId('issue-description-rendered')).toContainText(firstEdit, { timeout: 30000 });

    // Second edit
    const secondEdit = `Second edit ${uniqueSuffix}`;
    await page.getByTestId('issue-description-content').click();
    const editor2 = page.getByTestId('issue-description-editor');
    await expect(editor2).toBeVisible();

    // Verify editor has updated content from first edit
    await expect(editor2).toHaveValue(firstEdit);

    // Make second edit
    await editor2.fill(secondEdit);

    // Save by clicking outside
    await page.getByTestId('issue-header').click();

    // Verify second edit saved
    await expect(page.getByTestId('issue-description-rendered')).toContainText(secondEdit, { timeout: 30000 });
  });
});
