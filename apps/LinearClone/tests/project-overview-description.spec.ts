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
      totalIssues: number;
      completedIssues: number;
    }>;
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
      totalIssues: number;
      completedIssues: number;
      inProgressIssues: number;
    };
    milestones: Array<{ id: string; name: string; targetDate: string | null; completed: boolean }>;
    activity: Array<{ id: string; action: string }>;
  }>;
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

async function goToOverviewTab(page: import('@playwright/test').Page) {
  await page.getByTestId('project-tab-overview').click();
  await expect(page.getByTestId('project-overview-tab')).toBeVisible({ timeout: 10000 });
}

test.describe('Project Overview - Description', () => {
  test('Overview tab renders description, milestones, and key metrics sections', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    expect(v2).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify Description section
    await expect(page.getByTestId('project-overview-description-section')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('project-overview-description')).toContainText(
      'Version 2.0 product launch with new features'
    );

    // Verify Milestones section
    await expect(page.getByTestId('project-overview-milestones-section')).toBeVisible();

    // Verify Key Metrics section
    await expect(page.getByTestId('project-overview-metrics-section')).toBeVisible();
    await expect(page.getByTestId('project-overview-metrics')).toBeVisible();
  });

  test('Description is inline editable', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify description text is visible
    await expect(page.getByTestId('project-overview-description')).toBeVisible({ timeout: 10000 });

    // Click to edit
    await page.getByTestId('project-overview-description').click();

    // Verify textarea appears with current description
    const textarea = page.getByTestId('project-overview-description-input');
    await expect(textarea).toBeVisible({ timeout: 5000 });
    await expect(textarea).toHaveValue('Version 2.0 product launch with new features');
  });

  test('Edit and save description', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click to edit
    await page.getByTestId('project-overview-description').click();
    const textarea = page.getByTestId('project-overview-description-input');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // Clear and type new description
    const newDesc = `Updated auth system with OAuth2 and SAML support ${Date.now()}`;
    await textarea.clear();
    await textarea.fill(newDesc);

    // Click away to save (blur)
    await page.getByTestId('project-overview-milestones-section').click();

    // Verify the description updated in UI
    await expect(page.getByTestId('project-overview-description')).toContainText(newDesc, { timeout: 10000 });

    // Verify persisted to database and activity entry created
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(detail.project.description).toBe(newDesc);
    const descActivity = detail.activity.find((a) => a.action.includes('description'));
    expect(descActivity).toBeTruthy();
  });

  test('Description supports markdown rendering', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Set markdown description via edit
    await page.getByTestId('project-overview-description').click();
    const textarea = page.getByTestId('project-overview-description-input');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    const markdownText = '## Goals\n- Support OAuth\n- Support SSO\n\n**Priority**: High';
    await textarea.clear();
    await textarea.fill(markdownText);

    // Blur to save
    await page.getByTestId('project-overview-milestones-section').click();

    // Wait for the rendered description to appear
    await expect(page.getByTestId('project-overview-description')).toBeVisible({ timeout: 10000 });

    // Verify markdown rendering: heading, list items, bold
    const descEl = page.getByTestId('project-overview-description');
    await expect(descEl.locator('h3')).toContainText('Goals');
    await expect(descEl.locator('li').first()).toContainText('Support OAuth');
    await expect(descEl.locator('li').nth(1)).toContainText('Support SSO');
    await expect(descEl.locator('strong')).toContainText('Priority');
  });

  test('Cancel description edit reverts changes', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const originalDesc = detail.project.description || '';

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click to edit
    await page.getByTestId('project-overview-description').click();
    const textarea = page.getByTestId('project-overview-description-input');
    await expect(textarea).toBeVisible({ timeout: 5000 });

    // Type changed text
    await textarea.clear();
    await textarea.fill('Changed text that should not save');

    // Press Escape to cancel
    await textarea.press('Escape');

    // Verify reverted to original
    await expect(page.getByTestId('project-overview-description')).toContainText(originalDesc, { timeout: 10000 });

    // Verify no change persisted
    const afterDetail = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(afterDetail.project.description).toBe(originalDesc);
  });

  test('Description shows placeholder when empty', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    // Create a project with no description
    const createResp = await fetch(`${baseURL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ name: `Empty Desc Project ${Date.now()}`, status: 'planned' }),
    });
    const proj = await createResp.json();

    await loginAndGoToProject(page, baseURL!, proj.id);
    await goToOverviewTab(page);

    // Verify placeholder text is shown
    await expect(page.getByTestId('project-overview-description')).toContainText('Add a description...', { timeout: 10000 });
  });
});
