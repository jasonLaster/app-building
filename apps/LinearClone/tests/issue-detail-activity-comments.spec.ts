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

// Helper to update issue field via API
async function updateIssueField(
  baseURL: string,
  token: string,
  issueId: string,
  field: string,
  value: string | null
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

// Helper to add comment via API
async function addCommentViaApi(
  baseURL: string,
  token: string,
  issueId: string,
  content: string
) {
  const response = await fetch(`${baseURL}/api/add-comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ issueId, content }),
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
  const issue = issues.find((i: { number: number }) => i.number === issueNumber);

  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/issue/${issue.id}`);
  await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('activity-comments')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user, engTeam, issue };
}

test.describe('IssueDetailActivityComments', () => {
  test('Activity/Comments section renders with tab toggle', async ({ page, baseURL }) => {
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify the section is visible
    await expect(page.getByTestId('activity-comments')).toBeVisible();

    // Verify both tab buttons exist
    await expect(page.getByTestId('activity-tab')).toBeVisible();
    await expect(page.getByTestId('activity-tab')).toHaveText('Activity');
    await expect(page.getByTestId('comments-tab')).toBeVisible();
    await expect(page.getByTestId('comments-tab')).toHaveText('Comments');

    // Verify one tab is active (Activity is default)
    await expect(page.getByTestId('activity-tab')).toHaveClass(/activity-comments-tab-active/);

    // Verify comment input box is visible
    await expect(page.getByTestId('comment-input')).toBeVisible();
    await expect(page.getByTestId('comment-submit-btn')).toBeVisible();
    await expect(page.getByTestId('comment-submit-btn')).toContainText('Comment');
  });

  test('Activity tab shows chronological history', async ({ page, baseURL }) => {
    // Use ENG-7 (backlog, unassigned) to make controlled changes via API
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 7);

    // Create activity entries via API: status change, assignee change, priority change
    await updateIssueField(baseURL!, data.token, issue.id, 'status', 'todo');

    // Get alice's member ID for assignee
    const members = await (await fetch(`${baseURL!}/api/team-issues?teamId=${engTeam.id}`, {
      headers: { Authorization: `Bearer ${data.token}` },
    })).json();
    const alice = members.members.find((m: { name: string }) => m.name === 'Alice Johnson');
    await updateIssueField(baseURL!, data.token, issue.id, 'assigneeId', alice.id);

    await updateIssueField(baseURL!, data.token, issue.id, 'priority', 'high');

    // Navigate to the issue
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Verify Activity tab is active by default
    await expect(page.getByTestId('activity-tab')).toHaveClass(/activity-comments-tab-active/);

    // Verify activity entries exist
    await expect(page.getByTestId('activity-list')).toBeVisible({ timeout: 30000 });
    const entries = page.locator('[data-testid^="activity-entry-"]');
    await expect(entries).toHaveCount(3, { timeout: 30000 });

    // Verify entries contain expected action text (oldest first)
    const activityList = page.getByTestId('activity-list');
    await expect(activityList).toContainText('status', { timeout: 30000 });
    await expect(activityList).toContainText('assignee', { timeout: 30000 });
    await expect(activityList).toContainText('priority', { timeout: 30000 });
  });

  test('Comments tab shows user comments', async ({ page, baseURL }) => {
    // Use ENG-8 for comments
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 8);

    // Add two comments via API
    await addCommentViaApi(baseURL!, data.token, issue.id, "I'll look into this");

    // Login as Bob for second comment
    const bobData = await loginViaApi(baseURL!, 'bob@acme.com', 'password123');
    await addCommentViaApi(baseURL!, bobData.token, issue.id, 'Found the root cause');

    // Navigate to the issue
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Switch to Comments tab
    await page.getByTestId('comments-tab').click();
    await expect(page.getByTestId('comments-tab')).toHaveClass(/activity-comments-tab-active/);

    // Verify comments list is visible
    await expect(page.getByTestId('comments-list')).toBeVisible({ timeout: 30000 });

    // Verify two comments displayed
    const commentEntries = page.locator('[data-testid^="comment-entry-"]');
    await expect(commentEntries).toHaveCount(2, { timeout: 30000 });

    // Verify comment content
    const commentsList = page.getByTestId('comments-list');
    await expect(commentsList).toContainText("I'll look into this");
    await expect(commentsList).toContainText('Found the root cause');

    // Verify author names are displayed
    await expect(commentsList).toContainText('Alice Johnson');
    await expect(commentsList).toContainText('Bob Smith');
  });

  test('Add a new comment', async ({ page, baseURL }) => {
    // Use ENG-3
    const { token: _token, issue: _issue } = await loginAndNavigateToIssue(page, baseURL!, 3);

    // Switch to Comments tab
    await page.getByTestId('comments-tab').click();
    await expect(page.getByTestId('comments-tab')).toHaveClass(/activity-comments-tab-active/);

    // Verify no comments initially
    await expect(page.getByTestId('comments-empty')).toBeVisible();

    // Type a comment
    const commentText = 'This should be fixed in the next sprint';
    await page.getByTestId('comment-input').fill(commentText);

    // Click the Comment button
    await page.getByTestId('comment-submit-btn').click();

    // Verify new comment appears
    const commentEntries = page.locator('[data-testid^="comment-entry-"]');
    await expect(commentEntries).toHaveCount(1, { timeout: 30000 });

    // Verify comment content
    const commentsList = page.getByTestId('comments-list');
    await expect(commentsList).toContainText(commentText);

    // Verify author name is shown (logged in as Alice)
    await expect(commentsList).toContainText('Alice Johnson');

    // Verify timestamp shows "just now"
    await expect(commentsList).toContainText('just now');

    // Verify input is cleared
    await expect(page.getByTestId('comment-input')).toHaveValue('');
  });

  test('Comment button is disabled when input is empty', async ({ page, baseURL }) => {
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify comment input is empty
    await expect(page.getByTestId('comment-input')).toHaveValue('');

    // Verify Comment button is disabled
    await expect(page.getByTestId('comment-submit-btn')).toBeDisabled();
  });

  test('Comment button enables when text is entered', async ({ page, baseURL }) => {
    await loginAndNavigateToIssue(page, baseURL!, 1);

    // Verify button starts disabled
    await expect(page.getByTestId('comment-submit-btn')).toBeDisabled();

    // Type text
    await page.getByTestId('comment-input').fill('Test comment');

    // Verify button is now enabled
    await expect(page.getByTestId('comment-submit-btn')).toBeEnabled();
  });

  test('Submit comment via Enter key', async ({ page, baseURL }) => {
    // Use ENG-4
    const { token: _token, issue: _issue } = await loginAndNavigateToIssue(page, baseURL!, 4);

    // Switch to Comments tab
    await page.getByTestId('comments-tab').click();

    // Type a comment
    const commentText = `Quick fix needed ${Date.now()}`;
    await page.getByTestId('comment-input').fill(commentText);

    // Submit via Ctrl+Enter (the component uses metaKey or ctrlKey + Enter)
    await page.getByTestId('comment-input').press('Control+Enter');

    // Verify comment appears
    const commentsList = page.getByTestId('comments-list');
    await expect(commentsList).toContainText(commentText, { timeout: 30000 });

    // Verify input is cleared
    await expect(page.getByTestId('comment-input')).toHaveValue('');
  });

  test('Switch between Activity and Comments tabs', async ({ page, baseURL }) => {
    // Use ENG-5 - add both activity and comments
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 5);

    // Create some activity
    await updateIssueField(baseURL!, data.token, issue.id, 'priority', 'urgent');

    // Create a comment
    await addCommentViaApi(baseURL!, data.token, issue.id, 'Tab switch test comment');

    // Navigate
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Start on Activity tab (default)
    await expect(page.getByTestId('activity-tab')).toHaveClass(/activity-comments-tab-active/);
    await expect(page.getByTestId('activity-list')).toBeVisible();

    // Switch to Comments tab
    await page.getByTestId('comments-tab').click();
    await expect(page.getByTestId('comments-tab')).toHaveClass(/activity-comments-tab-active/);
    await expect(page.getByTestId('comments-list')).toBeVisible();
    await expect(page.getByTestId('comments-list')).toContainText('Tab switch test comment');

    // Activity tab should no longer be highlighted
    await expect(page.getByTestId('activity-tab')).not.toHaveClass(/activity-comments-tab-active/);

    // Switch back to Activity tab
    await page.getByTestId('activity-tab').click();
    await expect(page.getByTestId('activity-tab')).toHaveClass(/activity-comments-tab-active/);
    await expect(page.getByTestId('activity-list')).toBeVisible();
    await expect(page.getByTestId('comments-tab')).not.toHaveClass(/activity-comments-tab-active/);
  });

  test('Activity tab updates when issue properties change', async ({ page, baseURL }) => {
    // Use ENG-2 (status: todo)
    const data = await loginViaApi(baseURL!, 'alice@acme.com', 'password123');
    const teams = await getTeams(baseURL!, data.token);
    const engTeam = teams.find((t: { identifier: string }) => t.identifier === 'ENG');
    const issues = await getTeamIssues(baseURL!, data.token, engTeam.id);
    const issue = issues.find((i: { number: number }) => i.number === 2);

    // Create 2 initial activity entries via API
    await updateIssueField(baseURL!, data.token, issue.id, 'priority', 'high');
    await updateIssueField(baseURL!, data.token, issue.id, 'priority', 'medium');

    // Navigate
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
    await page.goto(`/issue/${issue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Verify Activity tab shows 2 initial entries
    await expect(page.getByTestId('activity-tab')).toHaveClass(/activity-comments-tab-active/);
    const entriesBefore = page.locator('[data-testid^="activity-entry-"]');
    await expect(entriesBefore).toHaveCount(2, { timeout: 30000 });

    // Change status from Todo to In Progress via the UI
    await page.getByTestId('issue-header-status-btn').click();
    await expect(page.getByTestId('issue-header-status-dropdown')).toBeVisible();
    await page.getByTestId('issue-header-status-option-in_progress').click();

    // Wait for status to update
    await expect(page.getByTestId('issue-header-status-btn')).toContainText('In Progress', { timeout: 30000 });

    // Verify new activity entry appeared
    const entriesAfter = page.locator('[data-testid^="activity-entry-"]');
    await expect(entriesAfter).toHaveCount(3, { timeout: 30000 });

    // Verify the new entry mentions the status change
    const activityList = page.getByTestId('activity-list');
    await expect(activityList).toContainText('status');
    await expect(activityList).toContainText('In Progress');
  });

  test('Add multiple comments in sequence', async ({ page, baseURL }) => {
    // Use ENG-6
    const { token: _token, issue: _issue } = await loginAndNavigateToIssue(page, baseURL!, 6);

    // Switch to Comments tab
    await page.getByTestId('comments-tab').click();
    await expect(page.getByTestId('comments-tab')).toHaveClass(/activity-comments-tab-active/);

    // Verify no comments initially
    await expect(page.getByTestId('comments-empty')).toBeVisible();

    // Add first comment
    const firstComment = `First comment ${Date.now()}`;
    await page.getByTestId('comment-input').fill(firstComment);
    await page.getByTestId('comment-submit-btn').click();

    // Verify first comment appears
    const commentEntries = page.locator('[data-testid^="comment-entry-"]');
    await expect(commentEntries).toHaveCount(1, { timeout: 30000 });
    await expect(page.getByTestId('comment-input')).toHaveValue('');

    // Add second comment
    const secondComment = `Second comment ${Date.now()}`;
    await page.getByTestId('comment-input').fill(secondComment);
    await page.getByTestId('comment-submit-btn').click();

    // Verify both comments appear
    await expect(commentEntries).toHaveCount(2, { timeout: 30000 });

    // Verify both comment contents are visible
    const commentsList = page.getByTestId('comments-list');
    await expect(commentsList).toContainText(firstComment);
    await expect(commentsList).toContainText(secondComment);

    // Verify input cleared after second submission
    await expect(page.getByTestId('comment-input')).toHaveValue('');
  });

  test('Comment displays long text properly', async ({ page, baseURL }) => {
    // Use ENG-3
    const { token: _token, issue: _issue } = await loginAndNavigateToIssue(page, baseURL!, 3);

    // Switch to Comments tab
    await page.getByTestId('comments-tab').click();

    // Type a long multi-paragraph comment
    const longComment = 'This is a very long comment that spans multiple paragraphs. ' +
      'It includes detailed technical analysis of the issue at hand. ' +
      'The root cause appears to be related to the session management layer ' +
      'where tokens are not being properly refreshed upon expiration. ' +
      'We need to implement a token refresh mechanism that handles edge cases ' +
      'such as concurrent requests, network failures, and race conditions. ' +
      'Additionally, we should add comprehensive logging to track token lifecycle events.';

    await page.getByTestId('comment-input').fill(longComment);
    await page.getByTestId('comment-submit-btn').click();

    // Verify comment appears with full text
    const commentEntries = page.locator('[data-testid^="comment-entry-"]');
    await expect(commentEntries).toHaveCount(1, { timeout: 30000 });

    // Verify the full text is displayed (not truncated)
    const commentContent = page.locator('[data-testid^="comment-content-"]').first();
    await expect(commentContent).toContainText('This is a very long comment');
    await expect(commentContent).toContainText('comprehensive logging to track token lifecycle events');

    // Verify the comment element is visible and not overflowing (content accessible)
    await expect(commentContent).toBeVisible();

    // Verify input is cleared
    await expect(page.getByTestId('comment-input')).toHaveValue('');
  });
});
