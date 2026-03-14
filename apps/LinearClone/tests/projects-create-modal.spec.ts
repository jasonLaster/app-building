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

async function deleteAllProjectsViaApi(baseURL: string, token: string) {
  const { projects } = await getProjectsData(baseURL, token);
  for (const project of projects) {
    await fetch(`${baseURL}/api/projects?id=${project.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
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

async function openCreateProjectModal(page: import('@playwright/test').Page) {
  await page.getByTestId('create-project-btn').click();
  await expect(page.getByTestId('create-project-modal')).toBeVisible({ timeout: 10000 });
}

test.describe('CreateProjectModal', () => {
  test('Create Project button opens the create project modal', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);

    // Verify modal is not visible initially
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0);

    // Click Create Project button
    await page.getByTestId('create-project-btn').click();

    // Modal should be visible with backdrop
    await expect(page.getByTestId('create-project-modal')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('create-project-modal-overlay')).toBeVisible();

    // Name field should be focused
    await expect(page.getByTestId('create-project-name-input')).toBeFocused({ timeout: 5000 });
  });

  test('Create project modal renders all required fields', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);
    await openCreateProjectModal(page);

    // Name field (text input)
    await expect(page.getByTestId('create-project-name-field')).toBeVisible();
    await expect(page.getByTestId('create-project-name-input')).toBeVisible();

    // Description field (textarea)
    await expect(page.getByTestId('create-project-description-field')).toBeVisible();
    await expect(page.getByTestId('create-project-description-input')).toBeVisible();

    // Status dropdown
    await expect(page.getByTestId('create-project-status-field')).toBeVisible();
    await expect(page.getByTestId('create-project-status-selector')).toBeVisible();

    // Lead selector
    await expect(page.getByTestId('create-project-lead-field')).toBeVisible();
    await expect(page.getByTestId('create-project-lead-selector')).toBeVisible();

    // Target date picker
    await expect(page.getByTestId('create-project-target-date-field')).toBeVisible();
    await expect(page.getByTestId('create-project-target-date-input')).toBeVisible();

    // Teams multi-select
    await expect(page.getByTestId('create-project-teams-field')).toBeVisible();
    await expect(page.getByTestId('create-project-teams-selector')).toBeVisible();

    // Buttons
    await expect(page.getByTestId('create-project-submit-btn')).toBeVisible();
    await expect(page.getByTestId('create-project-submit-btn')).toContainText('Create Project');
    await expect(page.getByTestId('create-project-cancel-btn')).toBeVisible();
    await expect(page.getByTestId('create-project-cancel-btn')).toContainText('Cancel');
  });

  test('Create project modal Status dropdown shows all project statuses', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);
    await openCreateProjectModal(page);

    // Default status should be Planned
    await expect(page.getByTestId('create-project-status-selector')).toContainText('Planned');

    // Open status dropdown
    await page.getByTestId('create-project-status-selector').click();
    await expect(page.getByTestId('create-project-status-dropdown')).toBeVisible({ timeout: 5000 });

    // All 4 statuses should be available
    await expect(page.getByTestId('create-project-status-option-planned')).toBeVisible();
    await expect(page.getByTestId('create-project-status-option-planned')).toContainText('Planned');
    await expect(page.getByTestId('create-project-status-option-in_progress')).toBeVisible();
    await expect(page.getByTestId('create-project-status-option-in_progress')).toContainText('In Progress');
    await expect(page.getByTestId('create-project-status-option-completed')).toBeVisible();
    await expect(page.getByTestId('create-project-status-option-completed')).toContainText('Completed');
    await expect(page.getByTestId('create-project-status-option-cancelled')).toBeVisible();
    await expect(page.getByTestId('create-project-status-option-cancelled')).toContainText('Cancelled');
  });

  test('Create project modal Lead selector is searchable', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);
    await openCreateProjectModal(page);

    // Open lead selector
    await page.getByTestId('create-project-lead-selector').click();
    await expect(page.getByTestId('create-project-lead-dropdown')).toBeVisible({ timeout: 5000 });

    // Search for "Ali"
    await page.getByTestId('create-project-lead-search').fill('Ali');

    // Only Alice should be visible, Bob and Carol should be filtered out
    const { token } = await loginViaApi(baseURL!);
    const { members } = await getProjectsData(baseURL!, token);
    const alice = members.find((m) => m.name === 'Alice Johnson')!;
    const bob = members.find((m) => m.name === 'Bob Smith')!;
    const carol = members.find((m) => m.name === 'Carol Davis')!;

    await expect(page.getByTestId(`create-project-lead-option-${alice.id}`)).toBeVisible();
    await expect(page.getByTestId(`create-project-lead-option-${bob.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`create-project-lead-option-${carol.id}`)).toHaveCount(0);

    // Select Alice
    await page.getByTestId(`create-project-lead-option-${alice.id}`).click();

    // Selector should show Alice's name
    await expect(page.getByTestId('create-project-lead-selector')).toContainText('Alice Johnson');
  });

  test('Create project modal Target date uses a date picker', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);
    await openCreateProjectModal(page);

    // Target date input should be a date type input
    const dateInput = page.getByTestId('create-project-target-date-input');
    await expect(dateInput).toBeVisible();

    // Set a date value
    await dateInput.fill('2026-04-15');

    // Verify the value is set
    await expect(dateInput).toHaveValue('2026-04-15');
  });

  test('Create project modal Teams selector allows multi-select', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { teams } = await getProjectsData(baseURL!, token);

    await openCreateProjectModal(page);

    // Open teams dropdown
    await page.getByTestId('create-project-teams-selector').click();
    await expect(page.getByTestId('create-project-teams-dropdown')).toBeVisible({ timeout: 5000 });

    // Select Engineering
    const eng = teams.find((t) => t.name === 'Engineering')!;
    const des = teams.find((t) => t.name === 'Design')!;

    await page.getByTestId(`create-project-team-option-${eng.id}`).click();
    // Select Design
    await page.getByTestId(`create-project-team-option-${des.id}`).click();

    // Both should appear as chips
    await expect(page.getByTestId(`create-project-team-chip-${eng.id}`)).toBeVisible();
    await expect(page.getByTestId(`create-project-team-chip-${des.id}`)).toBeVisible();

    // Deselect Engineering by clicking its chip remove button
    await page.getByTestId(`create-project-team-remove-${eng.id}`).click();

    // Only Design chip should remain
    await expect(page.getByTestId(`create-project-team-chip-${eng.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`create-project-team-chip-${des.id}`)).toBeVisible();
  });

  test('Successful project creation with all fields', async ({ page, baseURL }) => {
    test.slow();
    const { token } = await loginAndGoToProjects(page, baseURL!);
    const { members, teams } = await getProjectsData(baseURL!, token);

    const alice = members.find((m) => m.name === 'Alice Johnson')!;
    const eng = teams.find((t) => t.name === 'Engineering')!;
    const des = teams.find((t) => t.name === 'Design')!;

    const projectName = `New Feature ${Date.now()}`;

    await openCreateProjectModal(page);

    // Fill in all fields
    await page.getByTestId('create-project-name-input').fill(projectName);
    await page.getByTestId('create-project-description-input').fill('Build the new feature');

    // Select In Progress status
    await page.getByTestId('create-project-status-selector').click();
    await page.getByTestId('create-project-status-option-in_progress').click();

    // Select Alice as lead
    await page.getByTestId('create-project-lead-selector').click();
    await page.getByTestId(`create-project-lead-option-${alice.id}`).click();

    // Set target date
    await page.getByTestId('create-project-target-date-input').fill('2026-05-01');

    // Select both teams
    await page.getByTestId('create-project-teams-selector').click();
    await page.getByTestId(`create-project-team-option-${eng.id}`).click();
    await page.getByTestId(`create-project-team-option-${des.id}`).click();

    // Submit
    await page.getByTestId('create-project-submit-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 15000 });

    // New project should appear in the list
    const { projects: updatedProjects } = await getProjectsData(baseURL!, token);
    const newProject = updatedProjects.find((p) => p.name === projectName);
    expect(newProject).toBeTruthy();

    await expect(page.getByTestId(`project-card-${newProject!.id}`)).toBeVisible({ timeout: 15000 });
  });

  test('Successful project creation with only required fields', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const projectName = `Quick Spike ${Date.now()}`;

    await openCreateProjectModal(page);

    // Only fill name (required)
    await page.getByTestId('create-project-name-input').fill(projectName);

    // Submit
    await page.getByTestId('create-project-submit-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 15000 });

    // New project should appear in the list
    const { projects: updatedProjects } = await getProjectsData(baseURL!, token);
    const newProject = updatedProjects.find((p) => p.name === projectName);
    expect(newProject).toBeTruthy();

    await expect(page.getByTestId(`project-card-${newProject!.id}`)).toBeVisible({ timeout: 15000 });
  });

  test('Create project modal validates name is required', async ({ page, baseURL }) => {
    await loginAndGoToProjects(page, baseURL!);
    await openCreateProjectModal(page);

    // Leave name empty and click submit
    await page.getByTestId('create-project-submit-btn').click();

    // Error should appear
    await expect(page.getByTestId('create-project-name-error')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('create-project-name-error')).toHaveText('Name is required');

    // Modal should remain open
    await expect(page.getByTestId('create-project-modal')).toBeVisible();
  });

  test('Cancel button closes create project modal without creating', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const initialData = await getProjectsData(baseURL!, token);
    const initialCount = initialData.projects.length;

    await openCreateProjectModal(page);

    // Enter some data
    await page.getByTestId('create-project-name-input').fill('Draft Project');

    // Click cancel
    await page.getByTestId('create-project-cancel-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 10000 });

    // No new project should have been created
    const afterData = await getProjectsData(baseURL!, token);
    expect(afterData.projects.length).toBe(initialCount);
  });

  test('Create project modal can be closed by clicking backdrop', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const initialData = await getProjectsData(baseURL!, token);
    const initialCount = initialData.projects.length;

    await openCreateProjectModal(page);

    // Click the overlay (top-left corner outside the modal)
    await page.getByTestId('create-project-modal-overlay').click({ position: { x: 10, y: 10 } });

    // Modal should close
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 10000 });

    // No project created
    const afterData = await getProjectsData(baseURL!, token);
    expect(afterData.projects.length).toBe(initialCount);
  });

  test('Create project modal can be closed with Escape key', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const initialData = await getProjectsData(baseURL!, token);
    const initialCount = initialData.projects.length;

    await openCreateProjectModal(page);

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 10000 });

    // No project created
    const afterData = await getProjectsData(baseURL!, token);
    expect(afterData.projects.length).toBe(initialCount);
  });

  test('Creating a project and then opening modal again resets fields', async ({ page, baseURL }) => {
    test.slow();
    await loginAndGoToProjects(page, baseURL!);
    await openCreateProjectModal(page);

    // Fill in fields
    await page.getByTestId('create-project-name-input').fill(`Reset Test ${Date.now()}`);
    await page.getByTestId('create-project-description-input').fill('Some description');

    // Submit to create project
    await page.getByTestId('create-project-submit-btn').click();
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 15000 });

    // Open modal again
    await openCreateProjectModal(page);

    // All fields should be reset
    await expect(page.getByTestId('create-project-name-input')).toHaveValue('');
    await expect(page.getByTestId('create-project-description-input')).toHaveValue('');
    await expect(page.getByTestId('create-project-status-selector')).toContainText('Planned');
    await expect(page.getByTestId('create-project-lead-selector')).toContainText('No lead');
    await expect(page.getByTestId('create-project-target-date-input')).toHaveValue('');
    await expect(page.getByTestId('create-project-selected-teams')).toHaveCount(0);
  });

  test('Created project appears immediately in the project list', async ({ page, baseURL }) => {
    const { token } = await loginAndGoToProjects(page, baseURL!);

    const initialData = await getProjectsData(baseURL!, token);
    const initialCount = initialData.projects.length;

    const projectName = `API v3 ${Date.now()}`;

    await openCreateProjectModal(page);
    await page.getByTestId('create-project-name-input').fill(projectName);
    await page.getByTestId('create-project-submit-btn').click();

    // Modal should close
    await expect(page.getByTestId('create-project-modal')).toHaveCount(0, { timeout: 15000 });

    // The new project should appear without page refresh
    const { projects: updatedProjects } = await getProjectsData(baseURL!, token);
    const newProject = updatedProjects.find((p) => p.name === projectName);
    expect(newProject).toBeTruthy();
    expect(updatedProjects.length).toBe(initialCount + 1);

    await expect(page.getByTestId(`project-card-${newProject!.id}`)).toBeVisible({ timeout: 15000 });
  });
});
