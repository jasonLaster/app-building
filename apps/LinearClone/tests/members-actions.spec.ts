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
});
