import { test, expect } from '@playwright/test';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  teams: { id: string; name: string }[];
}

async function loginViaApi(baseURL: string) {
  const response = await fetch(`${baseURL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@acme.com', password: 'password123' }),
  });
  return response.json();
}

async function getMembers(baseURL: string, token: string): Promise<{ members: Member[]; currentUserId: string }> {
  const response = await fetch(`${baseURL}/api/members`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

async function authenticatePage(page: import('@playwright/test').Page, baseURL: string): Promise<{ token: string; members: Member[]; currentUserId: string }> {
  const data = await loginViaApi(baseURL);
  const token = data.token as string;
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  const membersData = await getMembers(baseURL, token);
  return { token, members: membersData.members, currentUserId: membersData.currentUserId };
}

test.describe('MemberActions', () => {
  test('Change member role from Member to Admin', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Find Bob (Member role)
    const bob = members.find((m) => m.email === 'bob@acme.com')!;
    await expect(page.getByTestId(`member-row-${bob.id}`)).toBeVisible({ timeout: 10000 });

    // Verify Bob is currently a Member
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Member');

    // Click role dropdown button for Bob
    await page.getByTestId(`member-role-dropdown-btn-${bob.id}`).click();

    // Verify dropdown is visible
    await expect(page.getByTestId(`member-role-dropdown-${bob.id}`)).toBeVisible({ timeout: 10000 });

    // Select Admin
    await page.getByTestId(`member-role-option-admin-${bob.id}`).click();

    // Verify Bob's role badge changes to Admin
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Admin', { timeout: 10000 });
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveClass(/member-role-badge-admin/);

    // Verify persistence by reloading page
    await page.reload();
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Admin', { timeout: 10000 });
  });

  test('Change member role from Admin to Member', async ({ page, baseURL }) => {
    const { token, members } = await authenticatePage(page, baseURL!);

    // First, promote Bob to Admin via API so Alice is not the last admin
    const bob = members.find((m) => m.email === 'bob@acme.com')!;
    await fetch(`${baseURL}/api/members/${bob.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'admin' }),
    });

    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Verify Bob is now Admin
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Admin', { timeout: 10000 });

    // Click role dropdown for Bob and change to Member
    await page.getByTestId(`member-role-dropdown-btn-${bob.id}`).click();
    await expect(page.getByTestId(`member-role-dropdown-${bob.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`member-role-option-member-${bob.id}`).click();

    // Verify Bob's role badge changes to Member
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Member', { timeout: 10000 });
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveClass(/member-role-badge-member/);
  });

  test('Role dropdown displays available roles', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Find Bob (a non-current-user member)
    const bob = members.find((m) => m.email === 'bob@acme.com')!;
    await expect(page.getByTestId(`member-row-${bob.id}`)).toBeVisible({ timeout: 10000 });

    // Click role dropdown button
    await page.getByTestId(`member-role-dropdown-btn-${bob.id}`).click();

    // Verify dropdown is visible
    const dropdown = page.getByTestId(`member-role-dropdown-${bob.id}`);
    await expect(dropdown).toBeVisible({ timeout: 10000 });

    // Verify both role options are available
    await expect(page.getByTestId(`member-role-option-admin-${bob.id}`)).toBeVisible();
    await expect(page.getByTestId(`member-role-option-admin-${bob.id}`)).toContainText('Admin');

    await expect(page.getByTestId(`member-role-option-member-${bob.id}`)).toBeVisible();
    await expect(page.getByTestId(`member-role-option-member-${bob.id}`)).toContainText('Member');

    // Verify the current role (Member) is visually indicated with a checkmark
    // Bob is a Member, so the Member option should have the active class
    await expect(page.getByTestId(`member-role-option-member-${bob.id}`)).toHaveClass(/member-actions-role-option-active/);

    // Admin option should not have the active class
    await expect(page.getByTestId(`member-role-option-admin-${bob.id}`)).not.toHaveClass(/member-actions-role-option-active/);
  });

  test('Role dropdown can be used multiple times in sequence', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    const bob = members.find((m) => m.email === 'bob@acme.com')!;
    await expect(page.getByTestId(`member-row-${bob.id}`)).toBeVisible({ timeout: 10000 });

    // Verify Bob starts as Member
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Member');

    // First change: Member -> Admin
    await page.getByTestId(`member-role-dropdown-btn-${bob.id}`).click();
    await expect(page.getByTestId(`member-role-dropdown-${bob.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`member-role-option-admin-${bob.id}`).click();
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Admin', { timeout: 10000 });

    // Second change: Admin -> Member
    await page.getByTestId(`member-role-dropdown-btn-${bob.id}`).click();
    await expect(page.getByTestId(`member-role-dropdown-${bob.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`member-role-option-member-${bob.id}`).click();
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Member', { timeout: 10000 });

    // Verify persistence
    await page.reload();
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Member', { timeout: 10000 });
  });

  test('Remove member button shows confirmation dialog', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    const carol = members.find((m) => m.email === 'carol@acme.com')!;
    await expect(page.getByTestId(`member-row-${carol.id}`)).toBeVisible({ timeout: 10000 });

    // Click remove button for Carol
    await page.getByTestId(`member-remove-btn-${carol.id}`).click();

    // Verify confirmation dialog appears
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).toBeVisible({ timeout: 10000 });

    // Verify dialog contains Carol's name
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).toContainText('Carol Davis');

    // Verify Confirm and Cancel buttons are present
    await expect(page.getByTestId(`member-remove-confirm-btn-${carol.id}`)).toBeVisible();
    await expect(page.getByTestId(`member-remove-confirm-cancel-${carol.id}`)).toBeVisible();

    // Verify Carol is NOT yet removed
    await expect(page.getByTestId(`member-row-${carol.id}`)).toBeVisible();
  });

  test('Confirm member removal deletes the member', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    const carol = members.find((m) => m.email === 'carol@acme.com')!;
    await expect(page.getByTestId(`member-row-${carol.id}`)).toBeVisible({ timeout: 10000 });

    // Capture initial member count
    const initialCount = await page.locator('[data-testid^="member-row-"]').count();

    // Click remove and confirm
    await page.getByTestId(`member-remove-btn-${carol.id}`).click();
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`member-remove-confirm-btn-${carol.id}`).click();

    // Verify dialog closes and Carol is removed
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`member-row-${carol.id}`)).not.toBeVisible({ timeout: 10000 });

    // Verify member count decreased by 1
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount - 1, { timeout: 10000 });

    // Verify persistence
    await page.reload();
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId(`member-row-${carol.id}`)).not.toBeVisible({ timeout: 10000 });
  });

  test('Cancel member removal keeps the member', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    const carol = members.find((m) => m.email === 'carol@acme.com')!;
    await expect(page.getByTestId(`member-row-${carol.id}`)).toBeVisible({ timeout: 10000 });

    // Click remove button
    await page.getByTestId(`member-remove-btn-${carol.id}`).click();
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).toBeVisible({ timeout: 10000 });

    // Click cancel
    await page.getByTestId(`member-remove-confirm-cancel-${carol.id}`).click();

    // Verify dialog closes
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).not.toBeVisible({ timeout: 10000 });

    // Verify Carol is still in the list
    await expect(page.getByTestId(`member-row-${carol.id}`)).toBeVisible();
    await expect(page.getByTestId(`member-name-${carol.id}`)).toHaveText('Carol Davis');
  });

  test('Cannot remove yourself from the workspace', async ({ page, baseURL }) => {
    const { members, currentUserId } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // The current user is Alice (admin)
    const alice = members.find((m) => m.id === currentUserId)!;
    await expect(page.getByTestId(`member-row-${alice.id}`)).toBeVisible({ timeout: 10000 });

    // Verify the remove button is NOT shown for the current user
    await expect(page.getByTestId(`member-remove-btn-${alice.id}`)).not.toBeVisible();
  });

  test('Cannot change your own role (or last Admin cannot be demoted)', async ({ page, baseURL }) => {
    const { members, currentUserId } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Alice is the only Admin
    const alice = members.find((m) => m.id === currentUserId)!;
    await expect(page.getByTestId(`member-row-${alice.id}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`member-role-badge-${alice.id}`)).toHaveText('Admin');

    // Verify the role dropdown button is disabled for the last admin
    await expect(page.getByTestId(`member-role-dropdown-btn-${alice.id}`)).toBeDisabled();
  });

  test("Removed member's issues remain assigned but member is gone from selectors", async ({ page, baseURL }) => {
    test.slow();
    const { token, members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    const carol = members.find((m) => m.email === 'carol@acme.com')!;
    await expect(page.getByTestId(`member-row-${carol.id}`)).toBeVisible({ timeout: 10000 });

    // Remove Carol via UI
    await page.getByTestId(`member-remove-btn-${carol.id}`).click();
    await expect(page.getByTestId(`member-remove-confirm-dialog-${carol.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`member-remove-confirm-btn-${carol.id}`).click();
    await expect(page.getByTestId(`member-row-${carol.id}`)).not.toBeVisible({ timeout: 10000 });

    // Carol was assigned to "Optimize database queries for issue list" (Engineering issue #4)
    // Fetch team issues to find Carol's issue
    const teamsResponse = await fetch(`${baseURL}/api/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const teamsData = await teamsResponse.json();
    const engTeam = teamsData.teams.find((t: { name: string }) => t.name === 'Engineering');

    const issuesResponse = await fetch(`${baseURL}/api/team-issues?teamId=${engTeam.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const issuesData = await issuesResponse.json();

    // Find the issue that was assigned to Carol (assignee_id still points to Carol's UUID)
    const carolIssue = issuesData.issues.find(
      (i: { title: string }) => i.title === 'Optimize database queries for issue list'
    );
    expect(carolIssue).toBeTruthy();
    // The issue still exists and retains its assignee_id
    expect(carolIssue.assigneeId).toBe(carol.id);

    // Navigate to the issue detail page
    await page.goto(`/issue/${carolIssue.id}`);
    await expect(page.getByTestId('issue-detail-page')).toBeVisible({ timeout: 30000 });

    // Open the assignee selector dropdown
    await page.getByTestId('sidebar-assignee-btn').click();
    await expect(page.getByTestId('sidebar-assignee-dropdown')).toBeVisible({ timeout: 10000 });

    // Verify Carol is NOT in the assignee options
    await expect(page.getByTestId(`sidebar-assignee-option-${carol.id}`)).not.toBeVisible();
  });
});
