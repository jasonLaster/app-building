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
      labels: Array<{ id: string; name: string; color: string }>;
      dueDate: string | null;
    }>;
    members: Array<{ id: string; name: string; email: string }>;
    labels: Array<{ id: string; name: string; color: string }>;
    activity: Array<{ id: string; action: string }>;
  }>;
}

async function createProjectViaApi(
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

async function loginAndGoToProjects(
  page: import('@playwright/test').Page,
  baseURL: string
) {
  const data = await loginViaApi(baseURL);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/projects');
  await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token };
}

test.describe('Project Issues Tab', () => {
  test('Clicking Issues tab switches back to issues content', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Switch to Overview tab first
    await page.getByTestId('project-tab-overview').click();
    await expect(page.getByTestId('project-tab-overview')).toHaveClass(/project-header-tab-active/, { timeout: 5000 });
    await expect(page.getByTestId('project-overview-tab')).toBeVisible({ timeout: 10000 });

    // Click Issues tab to switch back
    await page.getByTestId('project-tab-issues').click();

    // Verify Issues tab is active/highlighted
    await expect(page.getByTestId('project-tab-issues')).toHaveClass(/project-header-tab-active/, { timeout: 5000 });
    // Verify Overview tab is no longer highlighted
    await expect(page.getByTestId('project-tab-overview')).not.toHaveClass(/project-header-tab-active/);
    // Verify issues content is displayed
    await expect(page.getByTestId('project-issues-tab')).toBeVisible({ timeout: 10000 });
  });

  test('Navigating to project detail page from project card', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    // Click on the V2 Launch project card name
    await page.getByTestId(`project-card-name-${v2.id}`).click();

    // Verify navigated to the project detail page
    await expect(page).toHaveURL(new RegExp(`/project/${v2.id}`), { timeout: 10000 });

    // Verify the ProjectHeader displays the project name
    await expect(page.getByTestId('project-header')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('project-header-name')).toHaveText('V2 Launch', { timeout: 10000 });
  });

  test('Issues tab displays all project issues grouped by team', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Verify issues tab is visible
    await expect(page.getByTestId('project-issues-tab')).toBeVisible({ timeout: 10000 });

    // Group issues by team from API data
    const teamMap = new Map<string, { teamId: string; teamName: string; count: number }>();
    for (const issue of detail.issues) {
      if (!teamMap.has(issue.teamId)) {
        teamMap.set(issue.teamId, { teamId: issue.teamId, teamName: issue.teamName, count: 0 });
      }
      teamMap.get(issue.teamId)!.count++;
    }

    // Verify each team group exists with correct count
    for (const [teamId, info] of Array.from(teamMap.entries())) {
      await expect(page.getByTestId(`project-team-group-${teamId}`)).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId(`project-team-header-${teamId}`)).toContainText(info.teamName);
      await expect(page.getByTestId(`project-team-count-${teamId}`)).toContainText(`(${info.count})`);
    }
  });

  test('Issue rows display standard issue information', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick an issue that has assignee and labels for comprehensive check
    const issue = detail.issues.find((i) => i.assigneeName && i.labels.length > 0)!;
    expect(issue).toBeTruthy();

    // Verify identifier
    await expect(page.getByTestId(`issue-identifier-${issue.id}`)).toHaveText(issue.identifier, { timeout: 10000 });

    // Verify title is displayed and clickable
    await expect(page.getByTestId(`issue-title-${issue.id}`)).toHaveText(issue.title);

    // Verify priority icon is present
    await expect(page.getByTestId(`issue-priority-${issue.id}`)).toBeVisible();

    // Verify status button is present
    await expect(page.getByTestId(`issue-status-btn-${issue.id}`)).toBeVisible();

    // Verify assignee initials are displayed
    if (issue.assigneeName) {
      await expect(page.getByTestId(`issue-assignee-${issue.id}`)).toBeVisible();
    }

    // Verify label badge
    if (issue.labels.length > 0) {
      await expect(page.getByTestId(`issue-labels-${issue.id}`)).toBeVisible();
      await expect(page.getByTestId(`issue-label-${issue.id}-${issue.labels[0].id}`)).toContainText(issue.labels[0].name);
    }
  });

  test('Clicking issue title navigates to issue detail', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick the first issue
    const issue = detail.issues[0];

    // Click the issue title
    await page.getByTestId(`issue-title-${issue.id}`).click();

    // Verify navigation to issue detail URL
    await expect(page).toHaveURL(new RegExp(`/issue/${issue.id}`), { timeout: 10000 });
  });

  test('Clicking status icon on issue row changes status', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick an issue
    const issue = detail.issues[0];

    // Click the status icon
    await page.getByTestId(`issue-status-btn-${issue.id}`).click();

    // Verify dropdown opens with all status options
    const dropdown = page.getByTestId(`issue-status-dropdown-${issue.id}`);
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId('issue-status-option-backlog')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-todo')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-in_review')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-done')).toBeVisible();
    await expect(page.getByTestId('issue-status-option-cancelled')).toBeVisible();

    // Verify labels
    await expect(page.getByTestId('issue-status-option-backlog')).toContainText('Backlog');
    await expect(page.getByTestId('issue-status-option-todo')).toContainText('Todo');
    await expect(page.getByTestId('issue-status-option-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('issue-status-option-in_review')).toContainText('In Review');
    await expect(page.getByTestId('issue-status-option-done')).toContainText('Done');
    await expect(page.getByTestId('issue-status-option-cancelled')).toContainText('Cancelled');
  });

  test('Change issue status from issue row', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick an issue that is NOT done (so we can change it to in_progress)
    const issue = detail.issues.find((i) => i.status === 'todo')!;
    expect(issue).toBeTruthy();

    // Click the status icon to open dropdown
    await page.getByTestId(`issue-status-btn-${issue.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${issue.id}`)).toBeVisible({ timeout: 5000 });

    // Select "In Progress"
    await page.getByTestId('issue-status-option-in_progress').click();

    // Verify dropdown closed
    await expect(page.getByTestId(`issue-status-dropdown-${issue.id}`)).toHaveCount(0, { timeout: 5000 });

    // Verify the status button is still visible (the icon updated)
    await expect(page.getByTestId(`issue-status-btn-${issue.id}`)).toBeVisible();
  });

  test('Issues tab shows empty state when project has no issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);

    // Create a project with no issues
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Empty Project ${Date.now()}`,
      status: 'planned',
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify empty state message
    await expect(page.getByTestId('project-issues-empty')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('project-issues-empty')).toContainText('No issues in this project yet.');
  });

  test('Team groups are collapsible', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Get two teams from the data
    const teamIds = Array.from(new Set(detail.issues.map((i) => i.teamId)));
    expect(teamIds.length).toBeGreaterThanOrEqual(2);
    const firstTeamId = teamIds[0];
    const secondTeamId = teamIds[1];

    // Verify both team groups' issues are visible initially
    await expect(page.getByTestId(`project-team-issues-${firstTeamId}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`project-team-issues-${secondTeamId}`)).toBeVisible({ timeout: 10000 });

    // Click the first team header to collapse it
    await page.getByTestId(`project-team-header-${firstTeamId}`).click();

    // Verify first team issues are hidden
    await expect(page.getByTestId(`project-team-issues-${firstTeamId}`)).toHaveCount(0, { timeout: 5000 });
    // Verify second team issues are still visible
    await expect(page.getByTestId(`project-team-issues-${secondTeamId}`)).toBeVisible();

    // Click the first team header again to expand
    await page.getByTestId(`project-team-header-${firstTeamId}`).click();

    // Verify first team issues are visible again
    await expect(page.getByTestId(`project-team-issues-${firstTeamId}`)).toBeVisible({ timeout: 5000 });
  });

  test('Issue checkboxes enable bulk selection', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Pick two issues
    const issue1 = detail.issues[0];
    const issue2 = detail.issues[1];

    // Click checkbox on first issue
    await page.getByTestId(`issue-checkbox-${issue1.id}`).click();

    // Verify bulk toolbar appears with count 1
    await expect(page.getByTestId('project-issues-bulk-toolbar')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('1 selected');

    // Click checkbox on second issue
    await page.getByTestId(`issue-checkbox-${issue2.id}`).click();

    // Verify count updated to 2
    await expect(page.getByTestId('project-issues-bulk-count')).toHaveText('2 selected', { timeout: 5000 });

    // Verify rows are visually selected (have selected class)
    await expect(page.getByTestId(`issue-row-${issue1.id}`)).toHaveClass(/issue-row-selected/);
    await expect(page.getByTestId(`issue-row-${issue2.id}`)).toHaveClass(/issue-row-selected/);
  });
});
