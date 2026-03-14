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
    projects: Array<{ id: string; name: string }>;
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
      totalIssues: number;
      completedIssues: number;
      inProgressIssues: number;
    };
    issues: Array<{ id: string; title: string; status: string }>;
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

async function createProject(baseURL: string, token: string, name: string) {
  const response = await fetch(`${baseURL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, status: 'planned' }),
  });
  return response.json() as Promise<{ id: string; name: string }>;
}

async function deleteProject(baseURL: string, token: string, projectId: string) {
  await fetch(`${baseURL}/api/projects?id=${projectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

test.describe('Project Overview - Key Metrics', () => {
  test('Key metrics section displays project statistics', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    expect(v2).toBeTruthy();

    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const { totalIssues, completedIssues, inProgressIssues } = detail.project;
    const remainingIssues = totalIssues - completedIssues;
    const completionPercentage = totalIssues > 0
      ? Math.round((completedIssues / totalIssues) * 100)
      : 0;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify metrics section is visible
    await expect(page.getByTestId('project-overview-metrics')).toBeVisible({ timeout: 10000 });

    // Verify total issues
    await expect(
      page.getByTestId('project-overview-metric-total').locator('.project-overview-metric-value')
    ).toHaveText(String(totalIssues), { timeout: 10000 });

    // Verify completed issues
    await expect(
      page.getByTestId('project-overview-metric-completed').locator('.project-overview-metric-value')
    ).toHaveText(String(completedIssues), { timeout: 10000 });

    // Verify in-progress issues
    await expect(
      page.getByTestId('project-overview-metric-in-progress').locator('.project-overview-metric-value')
    ).toHaveText(String(inProgressIssues), { timeout: 10000 });

    // Verify remaining issues
    await expect(
      page.getByTestId('project-overview-metric-remaining').locator('.project-overview-metric-value')
    ).toHaveText(String(remainingIssues), { timeout: 10000 });

    // Verify completion percentage
    await expect(
      page.getByTestId('project-overview-metric-percentage').locator('.project-overview-metric-value')
    ).toHaveText(`${completionPercentage}%`, { timeout: 10000 });
  });

  test('Key metrics update when issue statuses change', async ({ page, baseURL }) => {
    test.slow();
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const { totalIssues, completedIssues } = detail.project;
    const initialPercentage = totalIssues > 0
      ? Math.round((completedIssues / totalIssues) * 100)
      : 0;

    await loginAndGoToProject(page, baseURL!, v2.id);

    // Go to overview tab first to verify initial metrics
    await goToOverviewTab(page);
    await expect(
      page.getByTestId('project-overview-metric-completed').locator('.project-overview-metric-value')
    ).toHaveText(String(completedIssues), { timeout: 10000 });
    await expect(
      page.getByTestId('project-overview-metric-percentage').locator('.project-overview-metric-value')
    ).toHaveText(`${initialPercentage}%`, { timeout: 10000 });

    // Switch to Issues tab
    await page.getByTestId('project-tab-issues').click();
    await expect(page.getByTestId('project-tab-issues')).toHaveClass(/project-header-tab-active/, { timeout: 5000 });

    // Find an issue that is NOT done and change it to Done
    const nonDoneIssue = detail.issues.find((i) => i.status !== 'done');
    expect(nonDoneIssue).toBeTruthy();

    // Click the status button on the issue to open dropdown
    await page.getByTestId(`issue-status-btn-${nonDoneIssue!.id}`).click();
    await expect(page.getByTestId(`issue-status-dropdown-${nonDoneIssue!.id}`)).toBeVisible({ timeout: 5000 });

    // Select "Done"
    await page.getByTestId('issue-status-option-done').click();
    await expect(page.getByTestId(`issue-status-dropdown-${nonDoneIssue!.id}`)).toHaveCount(0, { timeout: 5000 });

    // Switch back to Overview tab
    await goToOverviewTab(page);

    // Verify metrics updated: completed increased by 1
    const newCompleted = completedIssues + 1;
    const newPercentage = Math.round((newCompleted / totalIssues) * 100);

    await expect(
      page.getByTestId('project-overview-metric-completed').locator('.project-overview-metric-value')
    ).toHaveText(String(newCompleted), { timeout: 15000 });
    await expect(
      page.getByTestId('project-overview-metric-percentage').locator('.project-overview-metric-value')
    ).toHaveText(`${newPercentage}%`, { timeout: 10000 });
  });

  test('Key metrics handle project with zero issues', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const projectName = `Empty Project ${Date.now()}`;
    const created = await createProject(baseURL!, data.token, projectName);

    try {
      await loginAndGoToProject(page, baseURL!, created.id);
      await goToOverviewTab(page);

      // Verify metrics section is visible
      await expect(page.getByTestId('project-overview-metrics')).toBeVisible({ timeout: 10000 });

      // Verify total issues is 0
      await expect(
        page.getByTestId('project-overview-metric-total').locator('.project-overview-metric-value')
      ).toHaveText('0', { timeout: 10000 });

      // Verify completed issues is 0
      await expect(
        page.getByTestId('project-overview-metric-completed').locator('.project-overview-metric-value')
      ).toHaveText('0', { timeout: 10000 });

      // Verify in-progress issues is 0
      await expect(
        page.getByTestId('project-overview-metric-in-progress').locator('.project-overview-metric-value')
      ).toHaveText('0', { timeout: 10000 });

      // Verify remaining issues is 0
      await expect(
        page.getByTestId('project-overview-metric-remaining').locator('.project-overview-metric-value')
      ).toHaveText('0', { timeout: 10000 });

      // Verify completion percentage is 0% (not NaN or error)
      await expect(
        page.getByTestId('project-overview-metric-percentage').locator('.project-overview-metric-value')
      ).toHaveText('0%', { timeout: 10000 });
    } finally {
      await deleteProject(baseURL!, data.token, created.id);
    }
  });
});
