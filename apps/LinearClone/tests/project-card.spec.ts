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
      teams: Array<{ id: string; name: string; identifier: string }>;
    }>;
    members: Array<{ id: string; name: string; email: string }>;
    teams: Array<{ id: string; name: string; identifier: string }>;
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

async function deleteProjectViaApi(baseURL: string, token: string, projectId: string) {
  await fetch(`${baseURL}/api/projects?id=${projectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function createIssueViaApi(
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

async function loginAndGoToProjects(
  page: import('@playwright/test').Page,
  baseURL: string
) {
  const data = await loginViaApi(baseURL);
  await page.goto('/login');
  await page.evaluate((t) => localStorage.setItem('session_token', t), data.token);
  await page.goto('/projects');
  await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });
  return { token: data.token, user: data.user };
}

test.describe('ProjectCard', () => {
  test('Project card displays project name as clickable link', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);
    const project = projects.find((p) => p.name === 'V2 Launch');
    expect(project).toBeTruthy();

    const nameLink = page.getByTestId(`project-card-name-${project!.id}`);
    await expect(nameLink).toBeVisible({ timeout: 10000 });
    await expect(nameLink).toContainText('V2 Launch');

    await nameLink.click();
    await expect(page).toHaveURL(new RegExp(`/project/${project!.id}`), { timeout: 15000 });
  });

  test('Project card displays status badge with correct styling', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);

    // Seed has V2 Launch (in_progress). Create projects for other statuses.
    const planned = await createProjectViaApi(baseURL!, token, {
      name: `Planned ${Date.now()}`,
      status: 'planned',
    });
    const completed = await createProjectViaApi(baseURL!, token, {
      name: `Completed ${Date.now()}`,
      status: 'completed',
    });
    const cancelled = await createProjectViaApi(baseURL!, token, {
      name: `Cancelled ${Date.now()}`,
      status: 'cancelled',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const v2Launch = projects.find((p) => p.name === 'V2 Launch')!;

    // Verify badge text
    await expect(page.getByTestId(`project-card-status-${v2Launch.id}`)).toContainText('In Progress');
    await expect(page.getByTestId(`project-card-status-${planned.id}`)).toContainText('Planned');
    await expect(page.getByTestId(`project-card-status-${completed.id}`)).toContainText('Completed');
    await expect(page.getByTestId(`project-card-status-${cancelled.id}`)).toContainText('Cancelled');

    // Verify distinct styling classes
    await expect(page.getByTestId(`project-card-status-${v2Launch.id}`)).toHaveClass(/project-badge-in-progress/);
    await expect(page.getByTestId(`project-card-status-${planned.id}`)).toHaveClass(/project-badge-planned/);
    await expect(page.getByTestId(`project-card-status-${completed.id}`)).toHaveClass(/project-badge-completed/);
    await expect(page.getByTestId(`project-card-status-${cancelled.id}`)).toHaveClass(/project-badge-cancelled/);
  });

  test('Project card displays lead with avatar and name', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);
    const project = projects.find((p) => p.name === 'V2 Launch')!;

    const leadSection = page.getByTestId(`project-card-lead-${project.id}`);
    await expect(leadSection).toBeVisible({ timeout: 10000 });

    // Lead is Alice Johnson - verify initials and name
    await expect(leadSection).toContainText('AJ');
    await expect(leadSection).toContainText('Alice Johnson');
  });

  test('Project card displays target date', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);
    const project = projects.find((p) => p.name === 'V2 Launch')!;

    const dateSection = page.getByTestId(`project-card-date-${project.id}`);
    await expect(dateSection).toBeVisible({ timeout: 10000 });

    // Target date is 2026-06-30, formatted as "Jun 30, 2026"
    await expect(dateSection).toContainText('Jun 30, 2026');
  });

  test('Project card displays progress bar based on issue completion', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);
    const project = projects.find((p) => p.name === 'V2 Launch')!;

    const progressSection = page.getByTestId(`project-card-progress-${project.id}`);
    await expect(progressSection).toBeVisible({ timeout: 10000 });

    // Verify the progress text matches API data
    const expectedPct = Math.round((project.completedIssues / project.totalIssues) * 100);
    await expect(progressSection).toContainText(
      `${project.completedIssues}/${project.totalIssues} (${expectedPct}%)`
    );
  });

  test('Project card progress bar shows 0% when no issues completed', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { teams } = await getProjectsData(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Create a project and add non-done issues to it
    const project = await createProjectViaApi(baseURL!, token, {
      name: `Zero Progress ${Date.now()}`,
      status: 'planned',
    });

    for (let i = 0; i < 3; i++) {
      await createIssueViaApi(baseURL!, token, {
        teamId: engTeam.id,
        title: `Todo Issue ${i} ${Date.now()}`,
        status: 'todo',
        priority: 'medium',
        projectId: project.id,
      });
    }

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const progressSection = page.getByTestId(`project-card-progress-${project.id}`);
    await expect(progressSection).toBeVisible({ timeout: 10000 });
    await expect(progressSection).toContainText('0/3 (0%)');
  });

  test('Project card progress bar shows 100% when all issues completed', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { teams } = await getProjectsData(baseURL!, token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Create a project and add all-done issues
    const project = await createProjectViaApi(baseURL!, token, {
      name: `All Done ${Date.now()}`,
      status: 'completed',
    });

    for (let i = 0; i < 3; i++) {
      await createIssueViaApi(baseURL!, token, {
        teamId: engTeam.id,
        title: `Done Issue ${i} ${Date.now()}`,
        status: 'done',
        priority: 'medium',
        projectId: project.id,
      });
    }

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const progressSection = page.getByTestId(`project-card-progress-${project.id}`);
    await expect(progressSection).toBeVisible({ timeout: 10000 });
    await expect(progressSection).toContainText('3/3 (100%)');

    // Verify complete styling class on progress fill
    const progressFill = page.getByTestId(`project-card-progress-${project.id}`)
      .locator('.project-card-progress-fill');
    await expect(progressFill).toHaveClass(/project-card-progress-complete/);
  });

  test('Project card displays team icons for participating teams', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { projects } = await getProjectsData(baseURL!, token);
    const project = projects.find((p) => p.name === 'V2 Launch')!;

    // V2 Launch has issues from Engineering (ENG) and Design (DES) teams
    const teamsSection = page.getByTestId(`project-card-teams-${project.id}`);
    await expect(teamsSection).toBeVisible({ timeout: 10000 });

    // Verify both team icons are shown
    for (const team of project.teams) {
      const teamIcon = page.getByTestId(`project-card-team-${project.id}-${team.id}`);
      await expect(teamIcon).toBeVisible();
      await expect(teamIcon).toContainText(team.identifier.slice(0, 2));
    }
  });

  test('Project card displays correctly with no lead assigned', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const project = await createProjectViaApi(baseURL!, token, {
      name: `No Lead Project ${Date.now()}`,
      status: 'planned',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const leadSection = page.getByTestId(`project-card-lead-${project.id}`);
    await expect(leadSection).toBeVisible({ timeout: 10000 });
    await expect(leadSection).toContainText('No lead');
  });

  test('Project card displays correctly with no target date', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const project = await createProjectViaApi(baseURL!, token, {
      name: `No Date Project ${Date.now()}`,
      status: 'planned',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const dateSection = page.getByTestId(`project-card-date-${project.id}`);
    await expect(dateSection).toBeVisible({ timeout: 10000 });
    await expect(dateSection).toContainText('No target date');
  });

  test('Project card displays correctly with no issues', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const project = await createProjectViaApi(baseURL!, token, {
      name: `Empty Project ${Date.now()}`,
      status: 'planned',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    // Progress should show 0/0 (0%) with no error
    const progressSection = page.getByTestId(`project-card-progress-${project.id}`);
    await expect(progressSection).toBeVisible({ timeout: 10000 });
    await expect(progressSection).toContainText('0/0 (0%)');

    // Teams section should not be visible (no issues = no teams)
    await expect(page.getByTestId(`project-card-teams-${project.id}`)).toHaveCount(0);
  });
});
