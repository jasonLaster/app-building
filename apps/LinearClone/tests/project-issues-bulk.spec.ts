import { test, expect } from '@playwright/test';

async function loginViaApi(baseURL: string) {
  const response = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@acme.com', password: 'password123' }),
  });
  return response.json();
}

async function getProjectsData(baseURL: string, token: string) {
  const response = await fetch(`${baseURL}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json() as Promise<{
    projects: Array<{
      id: string;
      name: string;
      status: string;
      leadId: string | null;
      leadName: string | null;
      targetDate: string | null;
      totalIssues: number;
      completedIssues: number;
    }>;
    members: Array<{ id: string; name: string; email: string }>;
    teams: Array<{ id: string; name: string; identifier: string }>;
  }>;
}

async function getProjectDetail(baseURL: string, token: string, projectId: string) {
  const response = await fetch(`${baseURL}/api/project-detail?projectId=${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json() as Promise<{
    project: {
      id: string;
      name: string;
      description: string | null;
      status: string;
      targetDate: string | null;
      leadId: string | null;
      leadName: string | null;
      totalIssues: number;
      completedIssues: number;
      inProgressIssues: number;
    };
    issues: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      identifier: string;
      teamId: string;
      teamName: string;
      assigneeName: string | null;
      assigneeId: string | null;
      labels: Array<{ id: string; name: string; color: string }>;
      dueDate: string | null;
    }>;
    members: Array<{ id: string; name: string; email: string }>;
    labels: Array<{ id: string; name: string; color: string }>;
    activity: Array<{ id: string; action: string }>;
  }>;
}

async function _createProjectViaApi(
  baseURL: string,
  token: string,
  data: Record<string, unknown>
) {
  const response = await fetch(`${baseURL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function _createIssueViaApi(
  baseURL: string,
  token: string,
  data: Record<string, unknown>
) {
  const response = await fetch(`${baseURL}/api/create-issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function loginAndGoToProject(
  page: import('@playwright/test').Page,
  baseURL: string,
  projectId: string
) {
  const data = await loginViaApi(baseURL);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto(`/project/${projectId}`);
  await expect(page.getByTestId('project-header')).toBeVisible({ timeout: 30000 });
  return { token: data.token };
}

test.describe('Project Issues — Bulk Actions', () => {
  test('Bulk action — change status for multiple issues', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detailBefore = await getProjectDetail(baseURL!, data.token, v2.id);
    const completedBefore = detailBefore.project.completedIssues;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick two issues that are not done
    const nonDoneIssues = detailBefore.issues.filter((i) => i.status !== 'done');
    expect(nonDoneIssues.length).toBeGreaterThanOrEqual(2);
    const issue1 = nonDoneIssues[0];
    const issue2 = nonDoneIssues[1];

    // Select both issues
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();
    await page.getByTestId(`issue-checkbox-${issue2.id}`).click();
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('2 selected', { timeout: 5000 });

    // Click Status bulk action and select Done
    await page.getByTestId('project-bulk-action-status').click();
    await expect(page.getByTestId('project-bulk-status-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-bulk-status-option-done').click();

    // Verify bulk toolbar disappears (selection cleared after bulk action)
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toHaveCount(0, { timeout: 15000 });

    // Verify the progress bar updated — completedIssues increased by 2
    const expectedCompleted = completedBefore + 2;
    const expectedTotal = detailBefore.project.totalIssues;
    await expect(page.getByTestId('project-header-progress-text')).toHaveText(
      `${expectedCompleted} of ${expectedTotal} issues completed`,
      { timeout: 15000 }
    );
  });

  test('Bulk action — change priority for multiple issues', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick two issues
    const issue1 = detail.issues[0];
    const issue2 = detail.issues[1];

    // Select both
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();
    await page.getByTestId(`issue-checkbox-${issue2.id}`).click();
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('2 selected', { timeout: 5000 });

    // Click Priority bulk action and select Urgent
    await page.getByTestId('project-bulk-action-priority').click();
    await expect(page.getByTestId('project-bulk-priority-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-bulk-priority-option-urgent').click();

    // Verify bulk toolbar disappears (selection cleared)
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toHaveCount(0, { timeout: 15000 });

    // Verify changes persisted by re-fetching
    const detailAfter = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedIssue1 = detailAfter.issues.find((i) => i.id === issue1.id);
    const updatedIssue2 = detailAfter.issues.find((i) => i.id === issue2.id);
    expect(updatedIssue1?.priority).toBe('urgent');
    expect(updatedIssue2?.priority).toBe('urgent');
  });

  test('Bulk action — change assignee for multiple issues', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick two issues
    const issue1 = detail.issues[0];
    const issue2 = detail.issues[1];

    // Find Bob Smith in members
    const bob = detail.members.find((m) => m.name === 'Bob Smith')!;
    expect(bob).toBeTruthy();

    // Select both
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();
    await page.getByTestId(`issue-checkbox-${issue2.id}`).click();
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('2 selected', { timeout: 5000 });

    // Click Assignee bulk action and select Bob Smith
    await page.getByTestId('project-bulk-action-assignee').click();
    await expect(page.getByTestId('project-bulk-assignee-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId(`project-bulk-assignee-option-${bob.id}`).click();

    // Verify bulk toolbar disappears
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toHaveCount(0, { timeout: 15000 });

    // Verify changes persisted
    const detailAfter = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedIssue1 = detailAfter.issues.find((i) => i.id === issue1.id);
    const updatedIssue2 = detailAfter.issues.find((i) => i.id === issue2.id);
    expect(updatedIssue1?.assigneeName).toBe('Bob Smith');
    expect(updatedIssue2?.assigneeName).toBe('Bob Smith');
  });

  test('Bulk action — change label for multiple issues', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick two issues
    const issue1 = detail.issues[0];
    const issue2 = detail.issues[1];

    // Find "Feature" label
    const featureLabel = detail.labels.find((l) => l.name === 'Feature')!;
    expect(featureLabel).toBeTruthy();

    // Select both
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();
    await page.getByTestId(`issue-checkbox-${issue2.id}`).click();
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('2 selected', { timeout: 5000 });

    // Click Label bulk action and select Feature
    await page.getByTestId('project-bulk-action-label').click();
    await expect(page.getByTestId('project-bulk-label-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId(`project-bulk-label-option-${featureLabel.id}`).click();

    // Verify bulk toolbar disappears
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toHaveCount(0, { timeout: 15000 });

    // Verify changes persisted — both issues should have "Feature" label
    const detailAfter = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedIssue1 = detailAfter.issues.find((i) => i.id === issue1.id);
    const updatedIssue2 = detailAfter.issues.find((i) => i.id === issue2.id);
    expect(updatedIssue1?.labels.some((l) => l.name === 'Feature')).toBeTruthy();
    expect(updatedIssue2?.labels.some((l) => l.name === 'Feature')).toBeTruthy();
  });

  test('Deselect all clears bulk selection', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Select two issues
    const issue1 = detail.issues[0];
    const issue2 = detail.issues[1];
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();
    await page.getByTestId(`issue-checkbox-${issue2.id}`).click();
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('2 selected');

    // Click Deselect all
    await page.getByTestId('project-issues-deselect-all').click();

    // Verify bulk toolbar disappears
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toHaveCount(0, { timeout: 5000 });

    // Verify checkboxes are unchecked (rows no longer selected)
    await expect(page.getByTestId(`issue-row-${issue1.id}`)).not.toHaveClass(/issue-row-selected/);
    await expect(page.getByTestId(`issue-row-${issue2.id}`)).not.toHaveClass(/issue-row-selected/);
  });

  test('Changing status to Done updates project progress bar', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    const completedBefore = detail.project.completedIssues;
    const totalIssues = detail.project.totalIssues;

    // Verify initial progress
    await expect(page.getByTestId('project-header-progress-text')).toHaveText(
      `${completedBefore} of ${totalIssues} issues completed`,
      { timeout: 10000 }
    );

    // Find an issue that is NOT done (e.g., in_progress)
    const issue = detail.issues.find((i) => i.status !== 'done')!;
    expect(issue).toBeTruthy();

    // Click status icon and select Done
    await page.getByTestId(`issue-status-btn-${issue.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${issue.id}`)).toBeVisible({ timeout: 5000 });
    await page.getByTestId('issue-status-option-done').click();

    // Verify progress bar updated to reflect one more completed issue
    const expectedCompleted = completedBefore + 1;
    const expectedPercentage = Math.round((expectedCompleted / totalIssues) * 100);
    await expect(page.getByTestId('project-header-progress-text')).toHaveText(
      `${expectedCompleted} of ${totalIssues} issues completed`,
      { timeout: 10000 }
    );

    // Verify progress bar fill width
    const fill = page.getByTestId('project-header-progress').locator('.project-header-progress-fill');
    await expect(fill).toHaveAttribute('style', new RegExp(`width:\\s*${expectedPercentage}%`), { timeout: 5000 });
  });

  test('Issues tab shows issue count per team group', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Count issues per team from API data
    const teamCounts = new Map<string, number>();
    for (const issue of detail.issues) {
      teamCounts.set(issue.teamId, (teamCounts.get(issue.teamId) || 0) + 1);
    }

    // Verify each team header shows the correct count
    for (const [teamId, count] of Array.from(teamCounts.entries())) {
      await expect(page.getByTestId(`project-team-count-${teamId}`)).toHaveText(`(${count})`, { timeout: 10000 });
    }
  });
});
