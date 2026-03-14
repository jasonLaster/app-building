import { test, expect } from '@playwright/test';

interface MemberTeam {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  teams: MemberTeam[];
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

test.describe('MemberList', () => {
  test('Members page renders with list of all workspace members', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Verify page title
    await expect(page.getByTestId('members-title')).toHaveText('Members');

    // Verify invite button
    await expect(page.getByTestId('invite-member-btn')).toBeVisible();

    // Verify all 3 seeded members are displayed
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(members.length, { timeout: 10000 });

    // Verify each member row has key elements
    for (const member of members) {
      await expect(page.getByTestId(`member-row-${member.id}`)).toBeVisible();
      await expect(page.getByTestId(`member-name-${member.id}`)).toBeVisible();
      await expect(page.getByTestId(`member-email-${member.id}`)).toBeVisible();
      await expect(page.getByTestId(`member-role-badge-${member.id}`)).toBeVisible();
    }
  });

  test('Member row displays avatar, name, email, role, and team badges', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Find Alice (admin with Engineering and Design teams)
    const alice = members.find((m) => m.email === 'alice@acme.com')!;
    const aliceRow = page.getByTestId(`member-row-${alice.id}`);
    await expect(aliceRow).toBeVisible({ timeout: 10000 });

    // Verify avatar with initials
    await expect(page.getByTestId(`member-avatar-${alice.id}`)).toBeVisible();
    await expect(page.getByTestId(`member-avatar-${alice.id}`)).toContainText('AJ');

    // Verify name
    await expect(page.getByTestId(`member-name-${alice.id}`)).toHaveText('Alice Johnson');

    // Verify email
    await expect(page.getByTestId(`member-email-${alice.id}`)).toHaveText('alice@acme.com');

    // Verify role badge
    await expect(page.getByTestId(`member-role-badge-${alice.id}`)).toHaveText('Admin');

    // Verify team badges (Engineering and Design)
    const teamsContainer = page.getByTestId(`member-teams-${alice.id}`);
    await expect(teamsContainer.locator('[data-testid^="member-team-badge-"]')).toHaveCount(2);
    await expect(teamsContainer).toContainText('Engineering');
    await expect(teamsContainer).toContainText('Design');
  });

  test('Members list shows correct role badges with visual distinction', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    const alice = members.find((m) => m.email === 'alice@acme.com')!;
    const bob = members.find((m) => m.email === 'bob@acme.com')!;

    // Wait for member rows to load
    await expect(page.getByTestId(`member-role-badge-${alice.id}`)).toBeVisible({ timeout: 10000 });

    // Verify Alice has Admin badge
    await expect(page.getByTestId(`member-role-badge-${alice.id}`)).toHaveText('Admin');

    // Verify Bob has Member badge
    await expect(page.getByTestId(`member-role-badge-${bob.id}`)).toHaveText('Member');

    // Verify visual distinction via CSS classes
    const adminBadge = page.getByTestId(`member-role-badge-${alice.id}`);
    const memberBadge = page.getByTestId(`member-role-badge-${bob.id}`);

    await expect(adminBadge).toHaveClass(/member-role-badge-admin/);
    await expect(memberBadge).toHaveClass(/member-role-badge-member/);
  });

  test('Members list shows team badges for each member', async ({ page, baseURL }) => {
    const { members } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Alice belongs to Engineering and Design (2 teams)
    const alice = members.find((m) => m.email === 'alice@acme.com')!;
    const aliceTeams = page.getByTestId(`member-teams-${alice.id}`);
    await expect(aliceTeams.locator('[data-testid^="member-team-badge-"]')).toHaveCount(alice.teams.length, { timeout: 10000 });

    for (const team of alice.teams) {
      await expect(page.getByTestId(`member-team-badge-${alice.id}-${team.id}`)).toHaveText(team.name);
    }
  });

  test('Members list shows member with no teams', async ({ page, baseURL }) => {
    const { token } = await authenticatePage(page, baseURL!);

    // Invite a new member via API (new members have no teams)
    const inviteEmail = `noteams-${Date.now()}@test.com`;
    await fetch(`${baseURL}/api/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: inviteEmail }),
    });

    // Get updated members to find the new member's ID
    const { members } = await getMembers(baseURL!, token);
    const newMember = members.find((m) => m.email === inviteEmail)!;

    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Verify the new member row is visible
    await expect(page.getByTestId(`member-row-${newMember.id}`)).toBeVisible({ timeout: 10000 });

    // Verify no team badges in their row
    const teamsContainer = page.getByTestId(`member-teams-${newMember.id}`);
    await expect(teamsContainer.locator('[data-testid^="member-team-badge-"]')).toHaveCount(0);
  });

  test('Members page shows empty state when no members exist', async ({ page, baseURL }) => {
    const { token, members, currentUserId } = await authenticatePage(page, baseURL!);

    // Delete all members except the current user via API
    for (const member of members) {
      if (member.id !== currentUserId) {
        await fetch(`${baseURL}/api/members/${member.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    }

    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Verify only the current user is shown
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(1, { timeout: 10000 });

    // Verify the invite button is prominently displayed
    await expect(page.getByTestId('invite-member-btn')).toBeVisible();
  });

  test('Members list updates after inviting a new member', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('member-list')).toBeVisible({ timeout: 10000 });

    // Count initial members
    const initialCount = await page.locator('[data-testid^="member-row-"]').count();

    // Open invite modal and invite new member
    const inviteEmail = `invited-${Date.now()}@test.com`;
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('invite-member-email-input').fill(inviteEmail);
    await page.getByTestId('invite-member-submit-btn').click();

    // Verify modal closes
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });

    // Verify member count increased by 1
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount + 1, { timeout: 10000 });
  });

  test('Members list updates after removing a member', async ({ page, baseURL }) => {
    const { members, currentUserId } = await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('member-list')).toBeVisible({ timeout: 10000 });

    // Count initial members
    const initialCount = await page.locator('[data-testid^="member-row-"]').count();

    // Find a member that is not the current user to remove
    const memberToRemove = members.find((m) => m.id !== currentUserId)!;

    // Click remove button
    await page.getByTestId(`member-remove-btn-${memberToRemove.id}`).click();

    // Confirm removal in the confirmation dialog
    await expect(page.getByTestId(`member-remove-confirm-dialog-${memberToRemove.id}`)).toBeVisible({ timeout: 10000 });
    await page.getByTestId(`member-remove-confirm-btn-${memberToRemove.id}`).click();

    // Verify member count decreased by 1
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount - 1, { timeout: 10000 });

    // Verify the removed member is gone
    await expect(page.getByTestId(`member-row-${memberToRemove.id}`)).not.toBeVisible({ timeout: 10000 });
  });
});
