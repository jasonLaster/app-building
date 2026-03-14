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
    members: Array<{ id: string; name: string; email: string }>;
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

test.describe('Project Header — Lead', () => {
  test('Inline edit lead via searchable selector', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Verify current lead is displayed
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('Alice Johnson');

    // Click lead button to open dropdown
    await page.getByTestId('project-header-lead-btn').click();
    const dropdown = page.getByTestId('project-header-lead-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Verify search input is visible
    await expect(page.getByTestId('project-header-lead-search')).toBeVisible();

    // Verify all members are listed (Alice, Bob, Carol) plus Remove option
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    for (const member of detail.members) {
      await expect(page.getByTestId(`project-header-lead-option-${member.id}`)).toBeVisible();
      await expect(page.getByTestId(`project-header-lead-option-${member.id}`)).toContainText(member.name);
    }

    // Verify the current lead option has active styling
    const aliceMember = detail.members.find((m) => m.name === 'Alice Johnson')!;
    await expect(page.getByTestId(`project-header-lead-option-${aliceMember.id}`)).toHaveClass(/project-header-lead-option-active/);
  });

  test('Change project lead', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { members } = await getProjectsData(baseURL!, data.token);
    const alice = members.find((m) => m.name === 'Alice Johnson')!;

    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Lead Change Test ${Date.now()}`,
      status: 'planned',
      leadId: alice.id,
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify initial lead
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('Alice Johnson', { timeout: 10000 });

    // Open lead dropdown
    await page.getByTestId('project-header-lead-btn').click();
    await expect(page.getByTestId('project-header-lead-dropdown')).toBeVisible({ timeout: 5000 });

    // Type to search for Bob
    await page.getByTestId('project-header-lead-search').fill('Bob');

    // Select Bob Smith
    const bob = members.find((m) => m.name === 'Bob Smith')!;
    await page.getByTestId(`project-header-lead-option-${bob.id}`).click();

    // Verify lead updated in UI with avatar
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('Bob Smith', { timeout: 10000 });
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('BS');

    // Verify dropdown closed
    await expect(page.getByTestId('project-header-lead-dropdown')).toHaveCount(0);

    // Verify persisted and activity created
    const detail = await getProjectDetail(baseURL!, data.token, proj.id);
    expect(detail.project.leadId).toBe(bob.id);
    expect(detail.project.leadName).toBe('Bob Smith');
    expect(detail.activity.length).toBeGreaterThan(0);
    expect(detail.activity[0].action).toContain('lead');
  });

  test('Search lead selector filters results', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects, members } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Open lead dropdown
    await page.getByTestId('project-header-lead-btn').click();
    await expect(page.getByTestId('project-header-lead-dropdown')).toBeVisible({ timeout: 5000 });

    // Type "bob" in search
    await page.getByTestId('project-header-lead-search').fill('bob');

    // Verify only Bob is shown
    const bob = members.find((m) => m.name === 'Bob Smith')!;
    await expect(page.getByTestId(`project-header-lead-option-${bob.id}`)).toBeVisible();

    // Verify other members are hidden
    const alice = members.find((m) => m.name === 'Alice Johnson')!;
    const carol = members.find((m) => m.name === 'Carol Davis')!;
    await expect(page.getByTestId(`project-header-lead-option-${alice.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`project-header-lead-option-${carol.id}`)).toHaveCount(0);
  });

  test('Remove project lead', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { members } = await getProjectsData(baseURL!, data.token);
    const alice = members.find((m) => m.name === 'Alice Johnson')!;

    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Remove Lead Test ${Date.now()}`,
      status: 'planned',
      leadId: alice.id,
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify initial lead
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('Alice Johnson', { timeout: 10000 });

    // Open lead dropdown and click Remove
    await page.getByTestId('project-header-lead-btn').click();
    await expect(page.getByTestId('project-header-lead-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-header-lead-option-remove').click();

    // Verify lead is cleared
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('No lead', { timeout: 10000 });

    // Verify persisted and activity created
    const detail = await getProjectDetail(baseURL!, data.token, proj.id);
    expect(detail.project.leadId).toBeNull();
    expect(detail.activity.length).toBeGreaterThan(0);
    expect(detail.activity[0].action).toContain('removed lead');
  });
});

test.describe('Project Header — Progress Bar', () => {
  test('Progress bar reflects issue completion accurately', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Get actual data from API
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const { completedIssues, totalIssues } = detail.project;
    const percentage = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    // Verify progress text
    const expectedText = `${completedIssues} of ${totalIssues} issues completed`;
    await expect(page.getByTestId('project-header-progress-text')).toHaveText(expectedText, { timeout: 10000 });

    // Verify the progress bar fill width matches the percentage
    const fill = page.getByTestId('project-header-progress').locator('.project-header-progress-fill');
    await expect(fill).toHaveAttribute('style', new RegExp(`width:\\s*${percentage}%`), { timeout: 5000 });
  });

  test('Progress bar shows 0% for project with no completed issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { teams } = await getProjectsData(baseURL!, data.token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Create project with only non-done issues
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Zero Progress ${Date.now()}`,
      status: 'planned',
    });

    for (let i = 0; i < 5; i++) {
      await createIssueViaApi(baseURL!, data.token, {
        teamId: engTeam.id,
        title: `Todo Issue ${i} ${Date.now()}`,
        status: 'todo',
        priority: 'medium',
        projectId: proj.id,
      });
    }

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify 0% progress text
    await expect(page.getByTestId('project-header-progress-text')).toHaveText('0 of 5 issues completed', { timeout: 10000 });
  });

  test('Progress bar shows 100% for fully completed project', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { teams } = await getProjectsData(baseURL!, data.token);
    const engTeam = teams.find((t) => t.identifier === 'ENG')!;

    // Create project with all done issues
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `All Done ${Date.now()}`,
      status: 'completed',
    });

    for (let i = 0; i < 4; i++) {
      await createIssueViaApi(baseURL!, data.token, {
        teamId: engTeam.id,
        title: `Done Issue ${i} ${Date.now()}`,
        status: 'done',
        priority: 'medium',
        projectId: proj.id,
      });
    }

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify 100% progress text
    await expect(page.getByTestId('project-header-progress-text')).toHaveText('4 of 4 issues completed', { timeout: 10000 });

    // Verify complete styling class
    const fill = page.getByTestId('project-header-progress').locator('.project-header-progress-fill');
    await expect(fill).toHaveClass(/project-header-progress-complete/);
  });

  test('Progress bar handles project with no issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);

    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `No Issues ${Date.now()}`,
      status: 'planned',
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify 0 of 0 with no errors
    await expect(page.getByTestId('project-header-progress-text')).toHaveText('0 of 0 issues completed', { timeout: 10000 });

    // Verify the progress section is visible (no crash)
    await expect(page.getByTestId('project-header-progress')).toBeVisible();
  });
});

test.describe('Project Header — Tabs', () => {
  test('Header displays tabs for Issues and Overview', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Verify both tabs are visible
    await expect(page.getByTestId('project-tab-issues')).toBeVisible();
    await expect(page.getByTestId('project-tab-overview')).toBeVisible();

    await expect(page.getByTestId('project-tab-issues')).toHaveText('Issues');
    await expect(page.getByTestId('project-tab-overview')).toHaveText('Overview');

    // Verify Issues tab is active by default
    await expect(page.getByTestId('project-tab-issues')).toHaveClass(/project-header-tab-active/);
    await expect(page.getByTestId('project-tab-overview')).not.toHaveClass(/project-header-tab-active/);
  });

  test('Clicking Overview tab switches to overview content', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Verify Issues tab is active initially
    await expect(page.getByTestId('project-tab-issues')).toHaveClass(/project-header-tab-active/);

    // Click Overview tab
    await page.getByTestId('project-tab-overview').click();

    // Verify Overview tab becomes active
    await expect(page.getByTestId('project-tab-overview')).toHaveClass(/project-header-tab-active/, { timeout: 5000 });
    await expect(page.getByTestId('project-tab-issues')).not.toHaveClass(/project-header-tab-active/);

    // Verify overview content is displayed
    await expect(page.getByTestId('project-overview-tab')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('project-overview-description-section')).toBeVisible();
    await expect(page.getByTestId('project-overview-milestones-section')).toBeVisible();
    await expect(page.getByTestId('project-overview-metrics-section')).toBeVisible();
  });
});
