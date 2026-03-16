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

async function deleteAllProjectsViaApi(baseURL: string, token: string) {
  const { projects } = await getProjectsData(baseURL, token);
  for (const project of projects) {
    await fetch(`${baseURL}/api/projects?id=${project.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
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

test.describe('ProjectsPage', () => {
  test('Projects page shows empty state when no projects exist', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    // Delete all projects
    await deleteAllProjectsViaApi(baseURL!, token);

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    // Verify empty state
    await expect(page.getByTestId('projects-empty')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('projects-empty')).toContainText(
      'No projects yet. Create your first project to get started.'
    );
  });

  test('Projects page lists all projects across all teams', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    // Seed has V2 Launch. Create 2 more projects.
    const _p2 = await createProjectViaApi(baseURL!, token, {
      name: `Mobile App ${Date.now()}`,
      status: 'planned',
    });
    const _p3 = await createProjectViaApi(baseURL!, token, {
      name: `API v2 ${Date.now()}`,
      status: 'in_progress',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    // Verify all 3 project cards are displayed
    const { projects } = await getProjectsData(baseURL!, token);
    expect(projects.length).toBe(3);

    for (const project of projects) {
      await expect(page.getByTestId(`project-card-${project.id}`)).toBeVisible({ timeout: 10000 });
    }
  });

  test('Projects page header and Create Project button are displayed', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);

    // Verify header title
    await expect(page.getByTestId('projects-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('projects-title')).toHaveText('Projects');

    // Verify Create Project button
    await expect(page.getByTestId('create-project-btn')).toBeVisible();
    await expect(page.getByTestId('create-project-btn')).toContainText('Create Project');
  });
});

test.describe('ProjectFilters', () => {
  test('Filters toolbar renders with Status, Lead, and Team filters', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);

    await expect(page.getByTestId('project-filters-toolbar')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('project-filter-btn-status')).toBeVisible();
    await expect(page.getByTestId('project-filter-btn-lead')).toBeVisible();
    await expect(page.getByTestId('project-filter-btn-team')).toBeVisible();
  });

  test('Status filter dropdown shows all project statuses', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);

    await page.getByTestId('project-filter-btn-status').click();
    await expect(page.getByTestId('project-filter-dropdown-status')).toBeVisible({ timeout: 10000 });

    // All 4 statuses should have checkbox options
    await expect(page.getByTestId('project-filter-option-status-planned')).toBeVisible();
    await expect(page.getByTestId('project-filter-option-status-in_progress')).toBeVisible();
    await expect(page.getByTestId('project-filter-option-status-completed')).toBeVisible();
    await expect(page.getByTestId('project-filter-option-status-cancelled')).toBeVisible();

    // Verify labels
    await expect(page.getByTestId('project-filter-option-status-planned')).toContainText('Planned');
    await expect(page.getByTestId('project-filter-option-status-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('project-filter-option-status-completed')).toContainText('Completed');
    await expect(page.getByTestId('project-filter-option-status-cancelled')).toContainText('Cancelled');
  });

  test('Status filter filters projects by selected status', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    // Seed has V2 Launch (in_progress). Create projects with other statuses.
    const planned = await createProjectViaApi(baseURL!, token, {
      name: `Planned Filter ${Date.now()}`,
      status: 'planned',
    });
    const completed = await createProjectViaApi(baseURL!, token, {
      name: `Completed Filter ${Date.now()}`,
      status: 'completed',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const { projects } = await getProjectsData(baseURL!, token);
    const v2Launch = projects.find((p) => p.name === 'V2 Launch')!;

    // Apply "In Progress" filter
    await page.getByTestId('project-filter-btn-status').click();
    await page.getByTestId('project-filter-option-status-in_progress').click();

    // Only V2 Launch (in_progress) should be visible
    await expect(page.getByTestId(`project-card-${v2Launch.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`project-card-${planned.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`project-card-${completed.id}`)).toHaveCount(0);

    // Status filter should show active indicator
    await expect(page.getByTestId('project-filter-badge-status')).toBeVisible();
  });

  test('Status filter allows multi-select', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    // Seed: V2 Launch (in_progress). Create planned and completed.
    const planned = await createProjectViaApi(baseURL!, token, {
      name: `Planned Multi ${Date.now()}`,
      status: 'planned',
    });
    const completed = await createProjectViaApi(baseURL!, token, {
      name: `Completed Multi ${Date.now()}`,
      status: 'completed',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const { projects } = await getProjectsData(baseURL!, token);
    const v2Launch = projects.find((p) => p.name === 'V2 Launch')!;

    // Open status filter and select both Planned and In Progress
    await page.getByTestId('project-filter-btn-status').click();
    await page.getByTestId('project-filter-option-status-planned').click();
    await page.getByTestId('project-filter-option-status-in_progress').click();

    // V2 Launch (in_progress) and planned project should be visible
    await expect(page.getByTestId(`project-card-${v2Launch.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`project-card-${planned.id}`)).toBeVisible();
    // Completed should be hidden
    await expect(page.getByTestId(`project-card-${completed.id}`)).toHaveCount(0);

    // Badge should show 2 selected
    await expect(page.getByTestId('project-filter-badge-status')).toHaveText('2');
  });

  test('Lead filter dropdown shows all workspace members', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { members } = await getProjectsData(baseURL!, token);

    await page.getByTestId('project-filter-btn-lead').click();
    await expect(page.getByTestId('project-filter-dropdown-lead')).toBeVisible({ timeout: 10000 });

    // Each member should appear with avatar and name
    for (const member of members) {
      const option = page.getByTestId(`project-filter-option-lead-${member.id}`);
      await expect(option).toBeVisible();
      await expect(option).toContainText(member.name);
    }

    // Verify we have the expected 3 members
    expect(members.length).toBe(3);
  });

  test('Lead filter filters projects by selected lead', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { members } = await getProjectsData(baseURL!, token);

    const alice = members.find((m) => m.name === 'Alice Johnson')!;
    const bob = members.find((m) => m.name === 'Bob Smith')!;

    // Seed: V2 Launch (lead: Alice). Create project with lead Bob and one with no lead.
    const bobProject = await createProjectViaApi(baseURL!, token, {
      name: `Bob Project ${Date.now()}`,
      status: 'planned',
      leadId: bob.id,
    });
    const noLeadProject = await createProjectViaApi(baseURL!, token, {
      name: `No Lead ${Date.now()}`,
      status: 'planned',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const { projects } = await getProjectsData(baseURL!, token);
    const v2Launch = projects.find((p) => p.name === 'V2 Launch')!;

    // Open lead filter and select Alice
    await page.getByTestId('project-filter-btn-lead').click();
    await page.getByTestId(`project-filter-option-lead-${alice.id}`).click();

    // Only V2 Launch (lead: Alice) should be visible
    await expect(page.getByTestId(`project-card-${v2Launch.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`project-card-${bobProject.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`project-card-${noLeadProject.id}`)).toHaveCount(0);

    // Lead filter should show active indicator
    await expect(page.getByTestId('project-filter-badge-lead')).toBeVisible();
  });

  test('Team filter dropdown shows all teams', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { teams } = await getProjectsData(baseURL!, token);

    await page.getByTestId('project-filter-btn-team').click();
    await expect(page.getByTestId('project-filter-dropdown-team')).toBeVisible({ timeout: 10000 });

    // Each team should appear with a checkbox option
    for (const team of teams) {
      const option = page.getByTestId(`project-filter-option-team-${team.id}`);
      await expect(option).toBeVisible();
      await expect(option).toContainText(team.name);
    }

    // Verify we have the expected 2 teams (Engineering, Design)
    expect(teams.length).toBe(2);
  });

  test('Team filter filters projects by selected team', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { teams } = await getProjectsData(baseURL!, token);

    const engTeam = teams.find((t) => t.name === 'Engineering')!;
    const desTeam = teams.find((t) => t.name === 'Design')!;

    // Seed: V2 Launch has issues from both Engineering and Design.
    // Create a project with issues only from Engineering.
    const engOnlyProject = await createProjectViaApi(baseURL!, token, {
      name: `Eng Only ${Date.now()}`,
      status: 'planned',
    });
    await createIssueViaApi(baseURL!, token, {
      teamId: engTeam.id,
      title: `Eng Issue ${Date.now()}`,
      status: 'todo',
      priority: 'medium',
      projectId: engOnlyProject.id,
    });

    // Create a project with issues only from Design.
    const desOnlyProject = await createProjectViaApi(baseURL!, token, {
      name: `Des Only ${Date.now()}`,
      status: 'planned',
    });
    await createIssueViaApi(baseURL!, token, {
      teamId: desTeam.id,
      title: `Des Issue ${Date.now()}`,
      status: 'todo',
      priority: 'medium',
      projectId: desOnlyProject.id,
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const { projects } = await getProjectsData(baseURL!, token);
    const v2Launch = projects.find((p) => p.name === 'V2 Launch')!;

    // Apply Engineering team filter
    await page.getByTestId('project-filter-btn-team').click();
    await page.getByTestId(`project-filter-option-team-${engTeam.id}`).click();

    // V2 Launch (both teams) and Eng Only should be visible
    await expect(page.getByTestId(`project-card-${v2Launch.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`project-card-${engOnlyProject.id}`)).toBeVisible();
    // Des Only should be hidden
    await expect(page.getByTestId(`project-card-${desOnlyProject.id}`)).toHaveCount(0);
  });

  test('Multiple filters combine with AND logic', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { members } = await getProjectsData(baseURL!, token);

    const alice = members.find((m) => m.name === 'Alice Johnson')!;
    const bob = members.find((m) => m.name === 'Bob Smith')!;

    // Seed: V2 Launch (in_progress, lead: Alice).
    // Create: in_progress + lead Bob, planned + lead Alice
    const bobInProgress = await createProjectViaApi(baseURL!, token, {
      name: `Bob InProgress ${Date.now()}`,
      status: 'in_progress',
      leadId: bob.id,
    });
    const alicePlanned = await createProjectViaApi(baseURL!, token, {
      name: `Alice Planned ${Date.now()}`,
      status: 'planned',
      leadId: alice.id,
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const { projects } = await getProjectsData(baseURL!, token);
    const v2Launch = projects.find((p) => p.name === 'V2 Launch')!;

    // Apply Status filter: In Progress
    await page.getByTestId('project-filter-btn-status').click();
    await page.getByTestId('project-filter-option-status-in_progress').click();
    // Close status dropdown by clicking status button again
    await page.getByTestId('project-filter-btn-status').click();

    // Apply Lead filter: Alice
    await page.getByTestId('project-filter-btn-lead').click();
    await page.getByTestId(`project-filter-option-lead-${alice.id}`).click();

    // Only V2 Launch matches both (in_progress AND lead Alice)
    await expect(page.getByTestId(`project-card-${v2Launch.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`project-card-${bobInProgress.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`project-card-${alicePlanned.id}`)).toHaveCount(0);
  });

  test('Clearing a filter restores all projects', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    // Create an extra project with different status
    const planned = await createProjectViaApi(baseURL!, token, {
      name: `Planned Clear ${Date.now()}`,
      status: 'planned',
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    const { projects } = await getProjectsData(baseURL!, token);
    const _initialCount = projects.length;

    // Apply In Progress filter
    await page.getByTestId('project-filter-btn-status').click();
    await page.getByTestId('project-filter-option-status-in_progress').click();

    // Planned project should be hidden
    await expect(page.getByTestId(`project-card-${planned.id}`)).toHaveCount(0);

    // Clear the filter by deselecting In Progress
    await page.getByTestId('project-filter-option-status-in_progress').click();

    // All projects should be visible again
    for (const project of projects) {
      await expect(page.getByTestId(`project-card-${project.id}`)).toBeVisible({ timeout: 10000 });
    }
  });

  test('Filters can be used repeatedly after clearing', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { teams } = await getProjectsData(baseURL!, token);

    const desTeam = teams.find((t) => t.name === 'Design')!;

    // Create projects with different statuses
    const planned = await createProjectViaApi(baseURL!, token, {
      name: `Planned Repeat ${Date.now()}`,
      status: 'planned',
    });
    const _completed = await createProjectViaApi(baseURL!, token, {
      name: `Completed Repeat ${Date.now()}`,
      status: 'completed',
    });
    // Create a Design-only project
    const desProject = await createProjectViaApi(baseURL!, token, {
      name: `Des Repeat ${Date.now()}`,
      status: 'planned',
    });
    await createIssueViaApi(baseURL!, token, {
      teamId: desTeam.id,
      title: `Des Repeat Issue ${Date.now()}`,
      status: 'todo',
      priority: 'medium',
      projectId: desProject.id,
    });

    await page.goto('/projects');
    await expect(page.getByTestId('projects-page')).toBeVisible({ timeout: 30000 });

    // 1st: Apply Status filter for Planned, then clear
    await page.getByTestId('project-filter-btn-status').click();
    await page.getByTestId('project-filter-option-status-planned').click();
    await expect(page.getByTestId(`project-card-${planned.id}`)).toBeVisible({ timeout: 10000 });
    // Clear
    await page.getByTestId('project-filter-option-status-planned').click();

    // 2nd: Apply Team filter for Design
    await page.getByTestId('project-filter-btn-status').click(); // close status dropdown
    await page.getByTestId('project-filter-btn-team').click();
    await page.getByTestId(`project-filter-option-team-${desTeam.id}`).click();

    // Design projects should be visible (V2 Launch has design issues too)
    await expect(page.getByTestId(`project-card-${desProject.id}`)).toBeVisible({ timeout: 10000 });

    // Filters remain responsive
    await expect(page.getByTestId('project-filter-badge-team')).toBeVisible();
  });

  test('Filter state shows active filter indicators', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);

    // Initially no badges are visible
    await expect(page.getByTestId('project-filter-badge-status')).toHaveCount(0);
    await expect(page.getByTestId('project-filter-badge-lead')).toHaveCount(0);
    await expect(page.getByTestId('project-filter-badge-team')).toHaveCount(0);

    // Select In Progress in Status filter
    await page.getByTestId('project-filter-btn-status').click();
    await page.getByTestId('project-filter-option-status-in_progress').click();

    // Status badge should show "1"
    await expect(page.getByTestId('project-filter-badge-status')).toBeVisible();
    await expect(page.getByTestId('project-filter-badge-status')).toHaveText('1');

    // Lead and Team filter buttons should remain without badges
    await expect(page.getByTestId('project-filter-badge-lead')).toHaveCount(0);
    await expect(page.getByTestId('project-filter-badge-team')).toHaveCount(0);
  });
});
