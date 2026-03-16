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

async function _deleteAllMilestones(baseURL: string, token: string, projectId: string) {
  const detail = await getProjectDetail(baseURL, token, projectId);
  for (const ms of detail.milestones) {
    await fetch(`${baseURL}/api/project-milestones?milestoneId=${ms.id}&projectId=${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

test.describe.serial('Project Overview - Milestones', () => {
  test('Milestones section displays existing milestones', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    expect(v2).toBeTruthy();

    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(detail.milestones.length).toBeGreaterThanOrEqual(2);

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify milestones list is visible
    await expect(page.getByTestId('project-overview-milestones-list')).toBeVisible({ timeout: 10000 });

    // Verify each milestone is displayed with name and date
    for (const ms of detail.milestones) {
      const milestoneEl = page.getByTestId(`project-overview-milestone-${ms.id}`);
      await expect(milestoneEl).toBeVisible();
      await expect(page.getByTestId(`project-overview-milestone-name-${ms.id}`)).toContainText(ms.name);
      if (ms.targetDate) {
        await expect(page.getByTestId(`project-overview-milestone-date-${ms.id}`)).toBeVisible();
      }
    }
  });

  test('Add a new milestone', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click Add Milestone button
    await page.getByTestId('project-overview-add-milestone-btn').click();

    // Verify form appears with name input, date input, Save and Cancel buttons
    await expect(page.getByTestId('project-overview-milestone-form')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('project-overview-milestone-name-input')).toBeVisible();
    await expect(page.getByTestId('project-overview-milestone-date-input')).toBeVisible();
    await expect(page.getByTestId('project-overview-milestone-save-btn')).toBeVisible();
    await expect(page.getByTestId('project-overview-milestone-cancel-btn')).toBeVisible();
  });

  test('Save a new milestone', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    const detailBefore = await getProjectDetail(baseURL!, data.token, v2.id);
    const initialCount = detailBefore.milestones.length;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click Add Milestone
    await page.getByTestId('project-overview-add-milestone-btn').click();
    await expect(page.getByTestId('project-overview-milestone-form')).toBeVisible({ timeout: 5000 });

    // Fill in milestone name and date
    const milestoneName = `GA Release ${Date.now()}`;
    await page.getByTestId('project-overview-milestone-name-input').fill(milestoneName);
    await page.getByTestId('project-overview-milestone-date-input').fill('2026-05-15');

    // Click Save
    await page.getByTestId('project-overview-milestone-save-btn').click();

    // Verify milestone appears in list
    await expect(page.getByTestId('project-overview-milestones-list')).toContainText(milestoneName, { timeout: 10000 });

    // Verify form closed
    await expect(page.getByTestId('project-overview-milestone-form')).toHaveCount(0, { timeout: 5000 });

    // Verify persisted and activity created
    const detailAfter = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(detailAfter.milestones.length).toBe(initialCount + 1);
    const newMs = detailAfter.milestones.find((m) => m.name === milestoneName);
    expect(newMs).toBeTruthy();
    expect(newMs!.targetDate).toBe('2026-05-15');
    expect(newMs!.completed).toBe(false);

    const addActivity = detailAfter.activity.find((a) => a.action.includes(milestoneName));
    expect(addActivity).toBeTruthy();
  });

  test('Cancel adding a new milestone', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    const detailBefore = await getProjectDetail(baseURL!, data.token, v2.id);
    const initialCount = detailBefore.milestones.length;

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click Add Milestone
    await page.getByTestId('project-overview-add-milestone-btn').click();
    await expect(page.getByTestId('project-overview-milestone-form')).toBeVisible({ timeout: 5000 });

    // Type a draft name
    await page.getByTestId('project-overview-milestone-name-input').fill('Draft');

    // Click Cancel
    await page.getByTestId('project-overview-milestone-cancel-btn').click();

    // Verify form disappeared
    await expect(page.getByTestId('project-overview-milestone-form')).toHaveCount(0, { timeout: 5000 });

    // Verify no new milestone added
    const detailAfter = await getProjectDetail(baseURL!, data.token, v2.id);
    expect(detailAfter.milestones.length).toBe(initialCount);
  });

  test('Toggle milestone completion status', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    // Find an incomplete milestone
    const incompleteMilestone = detail.milestones.find((m) => !m.completed);
    expect(incompleteMilestone).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify milestone is not completed (checkbox unchecked)
    const toggle = page.getByTestId(`project-overview-milestone-toggle-${incompleteMilestone!.id}`);
    await expect(toggle).toBeVisible({ timeout: 10000 });
    const checkbox = toggle.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    // Click to toggle complete
    await checkbox.click();

    // Verify it becomes checked and has completed styling
    await expect(checkbox).toBeChecked({ timeout: 10000 });
    await expect(
      page.getByTestId(`project-overview-milestone-${incompleteMilestone!.id}`)
    ).toHaveClass(/project-overview-milestone-completed/, { timeout: 10000 });

    // Verify persisted
    const afterDetail = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedMs = afterDetail.milestones.find((m) => m.id === incompleteMilestone!.id);
    expect(updatedMs!.completed).toBe(true);

    // Verify activity entry
    const completeActivity = afterDetail.activity.find(
      (a) => a.action.includes('completed') && a.action.includes(incompleteMilestone!.name)
    );
    expect(completeActivity).toBeTruthy();
  });

  test('Toggle milestone back to incomplete', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);

    // Find a completed milestone (the previous test may have toggled one)
    let completedMilestone = detail.milestones.find((m) => m.completed);
    if (!completedMilestone) {
      // Mark one as completed via API first
      const ms = detail.milestones[0];
      await fetch(`${baseURL}/api/project-milestones`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ milestoneId: ms.id, projectId: v2.id, completed: true }),
      });
      completedMilestone = { ...ms, completed: true };
    }

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify milestone is completed (checkbox checked)
    const toggle = page.getByTestId(`project-overview-milestone-toggle-${completedMilestone.id}`);
    await expect(toggle).toBeVisible({ timeout: 10000 });
    const checkbox = toggle.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked({ timeout: 10000 });

    // Click to toggle back to incomplete
    await checkbox.click();

    // Verify checkbox is now unchecked
    await expect(checkbox).not.toBeChecked({ timeout: 10000 });

    // Verify completed class removed
    await expect(
      page.getByTestId(`project-overview-milestone-${completedMilestone.id}`)
    ).not.toHaveClass(/project-overview-milestone-completed/, { timeout: 10000 });

    // Verify persisted
    const afterDetail = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedMs = afterDetail.milestones.find((m) => m.id === completedMilestone!.id);
    expect(updatedMs!.completed).toBe(false);
  });

  test('Delete a milestone with confirmation', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const milestone = detail.milestones[0];
    expect(milestone).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click delete button on the milestone
    await page.getByTestId(`project-overview-milestone-delete-btn-${milestone.id}`).click();

    // Verify confirmation dialog appears
    await expect(page.getByTestId('project-overview-delete-dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('project-overview-delete-dialog')).toContainText(
      'Are you sure you want to delete this milestone?'
    );

    // Verify milestone is NOT yet deleted
    await expect(page.getByTestId(`project-overview-milestone-${milestone.id}`)).toBeVisible();
  });

  test('Confirm milestone deletion', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;

    // Create a milestone specifically for deletion
    const msName = `Delete Me ${Date.now()}`;
    const createResp = await fetch(`${baseURL}/api/project-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ projectId: v2.id, name: msName, targetDate: '2026-06-01' }),
    });
    const { milestone: createdMs } = await createResp.json();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Verify the milestone is visible
    await expect(page.getByTestId(`project-overview-milestone-name-${createdMs.id}`)).toContainText(msName, { timeout: 10000 });

    // Click delete, then confirm
    await page.getByTestId(`project-overview-milestone-delete-btn-${createdMs.id}`).click();
    await expect(page.getByTestId('project-overview-delete-dialog')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('project-overview-delete-confirm-btn').click();

    // Verify milestone is removed from list
    await expect(page.getByTestId(`project-overview-milestone-${createdMs.id}`)).toHaveCount(0, { timeout: 10000 });

    // Verify persisted and activity created
    const afterDetail = await getProjectDetail(baseURL!, data.token, v2.id);
    const deletedMs = afterDetail.milestones.find((m) => m.id === createdMs.id);
    expect(deletedMs).toBeUndefined();
    const deleteActivity = afterDetail.activity.find((a) => a.action.includes('deleted milestone') && a.action.includes(msName));
    expect(deleteActivity).toBeTruthy();
  });

  test('Cancel milestone deletion', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const milestone = detail.milestones[0];
    expect(milestone).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click delete button
    await page.getByTestId(`project-overview-milestone-delete-btn-${milestone.id}`).click();
    await expect(page.getByTestId('project-overview-delete-dialog')).toBeVisible({ timeout: 5000 });

    // Click Cancel
    await page.getByTestId('project-overview-delete-cancel-btn').click();

    // Verify dialog closed
    await expect(page.getByTestId('project-overview-delete-dialog')).toHaveCount(0, { timeout: 5000 });

    // Verify milestone still exists
    await expect(page.getByTestId(`project-overview-milestone-${milestone.id}`)).toBeVisible();
  });

  test('Edit milestone name inline', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const milestone = detail.milestones[0];
    expect(milestone).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click milestone name to start editing
    await page.getByTestId(`project-overview-milestone-name-${milestone.id}`).click();

    // Verify edit inputs appear
    const nameInput = page.getByTestId(`project-overview-milestone-edit-name-${milestone.id}`);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await expect(nameInput).toHaveValue(milestone.name);

    // Change name
    const newName = `Public Beta ${Date.now()}`;
    await nameInput.clear();
    await nameInput.fill(newName);

    // Save
    await page.getByTestId(`project-overview-milestone-edit-save-${milestone.id}`).click();

    // Verify name updated in UI
    await expect(page.getByTestId(`project-overview-milestone-name-${milestone.id}`)).toContainText(newName, { timeout: 10000 });

    // Verify persisted
    const afterDetail = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedMs = afterDetail.milestones.find((m) => m.id === milestone.id);
    expect(updatedMs!.name).toBe(newName);
  });

  test('Edit milestone target date', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    const { projects } = await getProjectsData(baseURL!, data.token);
    const v2 = projects.find((p) => p.name === 'V2 Launch')!;
    const detail = await getProjectDetail(baseURL!, data.token, v2.id);
    const milestone = detail.milestones.find((m) => m.targetDate != null);
    expect(milestone).toBeTruthy();

    await loginAndGoToProject(page, baseURL!, v2.id);
    await goToOverviewTab(page);

    // Click date to start editing
    await page.getByTestId(`project-overview-milestone-date-${milestone!.id}`).click();

    // Verify edit mode
    const dateInput = page.getByTestId(`project-overview-milestone-edit-date-${milestone!.id}`);
    await expect(dateInput).toBeVisible({ timeout: 5000 });

    // Change date
    await dateInput.fill('2026-04-15');

    // Save
    await page.getByTestId(`project-overview-milestone-edit-save-${milestone!.id}`).click();

    // Verify date updated in UI
    await expect(page.getByTestId(`project-overview-milestone-date-${milestone!.id}`)).toContainText('Apr 15, 2026', { timeout: 10000 });

    // Verify persisted
    const afterDetail = await getProjectDetail(baseURL!, data.token, v2.id);
    const updatedMs = afterDetail.milestones.find((m) => m.id === milestone!.id);
    expect(updatedMs!.targetDate).toBe('2026-04-15');
  });

  test('Milestones section shows empty state when no milestones', async ({ page, baseURL }) => {
    const data = await loginViaApi(baseURL!);
    // Create a project with no milestones
    const createResp = await fetch(`${baseURL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify({ name: `No Milestones Project ${Date.now()}`, status: 'planned' }),
    });
    const proj = await createResp.json();

    await loginAndGoToProject(page, baseURL!, proj.id);
    await goToOverviewTab(page);

    // Verify empty state message
    await expect(page.getByTestId('project-overview-milestones-empty')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('project-overview-milestones-empty')).toContainText(
      'No milestones yet. Add one to track progress.'
    );

    // Verify Add Milestone button is still visible
    await expect(page.getByTestId('project-overview-add-milestone-btn')).toBeVisible();
  });
});
