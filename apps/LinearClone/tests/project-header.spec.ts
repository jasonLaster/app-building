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

async function deleteAllProjects(baseURL: string, token: string) {
  const { projects } = await getProjectsData(baseURL, token);
  for (const p of projects) {
    await fetch(`${baseURL}/api/projects?id=${p.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
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

test.describe('Project Header', () => {
  test('Project header renders all fields for an existing project', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    expect(v2).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Verify project name is displayed
    await expect(page.getByTestId('project-header-name')).toHaveText('V2 Launch');

    // Verify status badge shows "In Progress"
    await expect(page.getByTestId('project-header-status-badge')).toHaveText('In Progress');

    // Verify progress bar text shows correct completion
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const expectedText = `${detail.project.completedIssues} of ${detail.project.totalIssues} issues completed`;
    await expect(page.getByTestId('project-header-progress-text')).toHaveText(expectedText, { timeout: 10000 });

    // Verify target date is displayed (Jun 30, 2026)
    await expect(page.getByTestId('project-header-date-btn')).toContainText('Jun 30, 2026');

    // Verify lead shows Alice Johnson with avatar
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('Alice Johnson');
    await expect(page.getByTestId('project-header-lead-btn')).toContainText('AJ');
  });

  test('Inline edit project name', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Click on project name to start editing
    await page.getByTestId('project-header-name').click();
    const input = page.getByTestId('project-header-name-input');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Clear and type new name
    await input.clear();
    const newName = `V2 Launch Renamed ${Date.now()}`;
    await input.fill(newName);
    await input.press('Enter');

    // Verify the name updated in UI
    await expect(page.getByTestId('project-header-name')).toHaveText(newName, { timeout: 10000 });

    // Verify persisted to database and activity entry created
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(detail.project.name).toBe(newName);
    expect(detail.activity.length).toBeGreaterThan(0);
    expect(detail.activity[0].action).toContain('changed name');
  });

  test('Inline edit project name — cancel edit', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    const originalName = await page.getByTestId('project-header-name').textContent();

    // Click name to start editing
    await page.getByTestId('project-header-name').click();
    const input = page.getByTestId('project-header-name-input');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Type a draft name then press Escape
    await input.fill('Draft Name That Should Not Save');
    await input.press('Escape');

    // Verify the name reverted
    await expect(page.getByTestId('project-header-name')).toHaveText(originalName!, { timeout: 10000 });

    // Verify no change persisted
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(detail.project.name).toBe(originalName);
  });

  test('Inline edit project name — validation rejects empty name', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    const originalName = await page.getByTestId('project-header-name').textContent();

    // Click name to start editing
    await page.getByTestId('project-header-name').click();
    const input = page.getByTestId('project-header-name-input');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Clear the field entirely and press Enter
    await input.clear();
    await input.press('Enter');

    // Verify validation error is shown
    await expect(page.getByTestId('project-header-name-error')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('project-header-name-error')).toHaveText('Name is required');

    // Press escape to exit editing
    await input.press('Escape');

    // Verify the project name remains unchanged
    await expect(page.getByTestId('project-header-name')).toHaveText(originalName!, { timeout: 10000 });
  });

  test('Inline edit status badge', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Click the status badge to open dropdown
    await page.getByTestId('project-header-status-badge').click();

    // Verify dropdown is visible with all status options
    const dropdown = page.getByTestId('project-header-status-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    await expect(page.getByTestId('project-header-status-option-planned')).toBeVisible();
    await expect(page.getByTestId('project-header-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('project-header-status-option-completed')).toBeVisible();
    await expect(page.getByTestId('project-header-status-option-cancelled')).toBeVisible();

    // Verify each option text
    await expect(page.getByTestId('project-header-status-option-planned')).toContainText('Planned');
    await expect(page.getByTestId('project-header-status-option-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('project-header-status-option-completed')).toContainText('Completed');
    await expect(page.getByTestId('project-header-status-option-cancelled')).toContainText('Cancelled');
  });

  test('Change project status via inline dropdown', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    // Create a dedicated project for this test to avoid mutating seed data
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Status Change Test ${Date.now()}`,
      status: 'planned',
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify initial status
    await expect(page.getByTestId('project-header-status-badge')).toHaveText('Planned', { timeout: 10000 });

    // Open dropdown and select In Progress
    await page.getByTestId('project-header-status-badge').click();
    await expect(page.getByTestId('project-header-status-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-header-status-option-in_progress').click();

    // Verify badge updated
    await expect(page.getByTestId('project-header-status-badge')).toHaveText('In Progress', { timeout: 10000 });
    await expect(page.getByTestId('project-header-status-badge')).toHaveClass(/project-header-badge-in-progress/);

    // Verify dropdown closed
    await expect(page.getByTestId('project-header-status-dropdown')).toHaveCount(0);

    // Verify persisted and activity created
    const detail = await getProjectDetail(baseURL!, data.token, proj.id);
    expect(detail.project.status).toBe('in_progress');
    expect(detail.activity.length).toBeGreaterThan(0);
    expect(detail.activity[0].action).toContain('changed status');
    expect(detail.activity[0].action).toContain('Planned');
    expect(detail.activity[0].action).toContain('In Progress');
  });

  test('Change project status multiple times in sequence', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!);
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Multi Status Test ${Date.now()}`,
      status: 'planned',
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // First change: Planned → In Progress
    await page.getByTestId('project-header-status-badge').click();
    await expect(page.getByTestId('project-header-status-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-header-status-option-in_progress').click();
    await expect(page.getByTestId('project-header-status-badge')).toHaveText('In Progress', { timeout: 10000 });

    // Second change: In Progress → Completed
    await page.getByTestId('project-header-status-badge').click();
    await expect(page.getByTestId('project-header-status-dropdown')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-header-status-option-completed').click();
    await expect(page.getByTestId('project-header-status-badge')).toHaveText('Completed', { timeout: 10000 });
    await expect(page.getByTestId('project-header-status-badge')).toHaveClass(/project-header-badge-completed/);

    // Verify both changes persisted with two separate activity entries
    const detail = await getProjectDetail(baseURL!, data.token, proj.id);
    expect(detail.project.status).toBe('completed');
    const statusActivities = detail.activity.filter((a) => a.action.includes('changed status'));
    expect(statusActivities.length).toBe(2);
  });

  test('Inline edit target date via date picker', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Verify target date button shows current date
    await expect(page.getByTestId('project-header-date-btn')).toContainText('Jun 30, 2026');

    // Click to open date picker
    await page.getByTestId('project-header-date-btn').click();

    // Verify date input is visible with the current date pre-selected
    const dateInput = page.getByTestId('project-header-date-input');
    await expect(dateInput).toBeVisible({ timeout: 5000 });
    await expect(dateInput).toHaveValue('2026-06-30');
  });

  test('Change target date', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Date Change Test ${Date.now()}`,
      status: 'planned',
      targetDate: '2026-06-30',
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Click target date to open date picker
    await page.getByTestId('project-header-date-btn').click();
    const dateInput = page.getByTestId('project-header-date-input');
    await expect(dateInput).toBeVisible({ timeout: 5000 });

    // Set new date
    await dateInput.fill('2026-05-01');
    // Trigger change event
    await dateInput.dispatchEvent('change');

    // Verify the date updated in UI
    await expect(page.getByTestId('project-header-date-btn')).toContainText('May 1, 2026', { timeout: 10000 });

    // Verify persisted and activity created
    const detail = await getProjectDetail(baseURL!, data.token, proj.id);
    expect(detail.project.targetDate).toBe('2026-05-01');
    expect(detail.activity.length).toBeGreaterThan(0);
    expect(detail.activity[0].action).toContain('target date');
  });

  test('Clear target date', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const proj = await createProjectViaApi(baseURL!, data.token, {
      name: `Clear Date Test ${Date.now()}`,
      status: 'planned',
      targetDate: '2026-06-30',
    });

    await loginAndGoToProject(page, baseURL!, proj.id);

    // Verify date is shown
    await expect(page.getByTestId('project-header-date-btn')).toContainText('Jun 30, 2026');

    // Click to open date picker
    await page.getByTestId('project-header-date-btn').click();
    await expect(page.getByTestId('project-header-date-input')).toBeVisible({ timeout: 5000 });

    // Click the Clear button
    await page.getByTestId('project-header-date-clear').click();

    // Verify date is cleared and shows placeholder
    await expect(page.getByTestId('project-header-date-btn')).toContainText('No target date', { timeout: 10000 });

    // Verify persisted and activity created
    const detail = await getProjectDetail(baseURL!, data.token, proj.id);
    expect(detail.project.targetDate).toBeNull();
    expect(detail.activity.length).toBeGreaterThan(0);
    expect(detail.activity[0].action).toContain('removed target date');
  });
});
