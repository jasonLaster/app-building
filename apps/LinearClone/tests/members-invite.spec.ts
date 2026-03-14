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

async function deleteAllNonSeedMembers(baseURL: string, token: string) {
  const seedEmails = ['alice@acme.com', 'bob@acme.com', 'carol@acme.com'];
  const { members } = await getMembers(baseURL, token);
  for (const member of members) {
    if (!seedEmails.includes(member.email)) {
      await fetch(`${baseURL}/api/members/${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }
}

async function authenticatePage(page: import('@playwright/test').Page, baseURL: string): Promise<string> {
  const data = await loginViaApi(baseURL);
  const token = data.token as string;
  await page.goto('/login');
  await page.evaluate((t: string) => localStorage.setItem('session_token', t), token);
  return token;
}

test.describe('InviteMemberModal', () => {
  test('Invite Member button opens invite modal', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Click invite button
    await page.getByTestId('invite-member-btn').click();

    // Verify modal opens with all expected elements
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('invite-member-modal-overlay')).toBeVisible();
    await expect(page.getByTestId('invite-member-email-input')).toBeVisible();
    await expect(page.getByTestId('invite-member-submit-btn')).toBeVisible();
    await expect(page.getByTestId('invite-member-cancel-btn')).toBeVisible();

    // Verify modal title
    await expect(page.getByTestId('invite-member-modal')).toContainText('Invite Member');
  });

  test('Invite member with valid email', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await deleteAllNonSeedMembers(baseURL!, token);

    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('member-list')).toBeVisible({ timeout: 10000 });

    const initialCount = await page.locator('[data-testid^="member-row-"]').count();
    const inviteEmail = `newcolleague-${Date.now()}@example.com`;

    // Open modal and submit valid email
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('invite-member-email-input').fill(inviteEmail);
    await page.getByTestId('invite-member-submit-btn').click();

    // Verify modal closes
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });

    // Verify new member appears in list
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount + 1, { timeout: 10000 });

    // Verify the new member details
    const { members } = await getMembers(baseURL!, token);
    const newMember = members.find((m) => m.email === inviteEmail)!;
    expect(newMember).toBeTruthy();

    await expect(page.getByTestId(`member-email-${newMember.id}`)).toHaveText(inviteEmail);
    await expect(page.getByTestId(`member-role-badge-${newMember.id}`)).toHaveText('Member');
  });

  test('Invite member with invalid email format', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Open modal
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });

    // Enter invalid email
    await page.getByTestId('invite-member-email-input').fill('not-an-email');
    await page.getByTestId('invite-member-submit-btn').click();

    // Verify validation error
    await expect(page.getByTestId('invite-member-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('invite-member-error')).toContainText('valid email');

    // Verify modal stays open
    await expect(page.getByTestId('invite-member-modal')).toBeVisible();
  });

  test('Invite member with empty email field', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Open modal
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });

    // Click submit without entering email
    await page.getByTestId('invite-member-submit-btn').click();

    // Verify validation error
    await expect(page.getByTestId('invite-member-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('invite-member-error')).toContainText('required');

    // Verify modal stays open
    await expect(page.getByTestId('invite-member-modal')).toBeVisible();
  });

  test('Invite member with already existing email', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Open modal and enter existing email
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('invite-member-email-input').fill('bob@acme.com');
    await page.getByTestId('invite-member-submit-btn').click();

    // Verify error about existing member
    await expect(page.getByTestId('invite-member-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('invite-member-error')).toContainText('already a member');

    // Verify modal stays open
    await expect(page.getByTestId('invite-member-modal')).toBeVisible();
  });

  test('Cancel invite member modal', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('member-list')).toBeVisible({ timeout: 10000 });

    const initialCount = await page.locator('[data-testid^="member-row-"]').count();

    // Open modal and type something
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('invite-member-email-input').fill('someone@example.com');

    // Click cancel
    await page.getByTestId('invite-member-cancel-btn').click();

    // Verify modal closes
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });

    // Verify no new member was added
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount);
  });

  test('Close invite modal by clicking backdrop', async ({ page, baseURL }) => {
    await authenticatePage(page, baseURL!);
    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });

    // Open modal
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });

    // Click the overlay (backdrop) - click at position 10,10 which is outside the modal
    await page.getByTestId('invite-member-modal-overlay').click({ position: { x: 10, y: 10 } });

    // Verify modal closes
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });
  });

  test('Invite modal email field can be submitted via Enter key', async ({ page, baseURL }) => {
    const token = await authenticatePage(page, baseURL!);
    await deleteAllNonSeedMembers(baseURL!, token);

    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('member-list')).toBeVisible({ timeout: 10000 });

    const initialCount = await page.locator('[data-testid^="member-row-"]').count();
    const inviteEmail = `enterkey-${Date.now()}@example.com`;

    // Open modal and type email
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('invite-member-email-input').fill(inviteEmail);

    // Submit via Enter key
    await page.getByTestId('invite-member-email-input').press('Enter');

    // Verify modal closes and member is added
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount + 1, { timeout: 10000 });
  });

  test('Invite member modal can be opened multiple times in sequence', async ({ page, baseURL }) => {
    test.slow();
    const token = await authenticatePage(page, baseURL!);
    await deleteAllNonSeedMembers(baseURL!, token);

    await page.goto('/settings/members');
    await expect(page.getByTestId('members-page')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('member-list')).toBeVisible({ timeout: 10000 });

    const initialCount = await page.locator('[data-testid^="member-row-"]').count();

    // First invite
    const firstEmail = `first-${Date.now()}@example.com`;
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('invite-member-email-input').fill(firstEmail);
    await page.getByTestId('invite-member-submit-btn').click();
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount + 1, { timeout: 10000 });

    // Second invite - verify modal opens cleanly with empty email field
    const secondEmail = `second-${Date.now()}@example.com`;
    await page.getByTestId('invite-member-btn').click();
    await expect(page.getByTestId('invite-member-modal')).toBeVisible({ timeout: 10000 });

    // Verify email field is empty (no residual data)
    await expect(page.getByTestId('invite-member-email-input')).toHaveValue('');

    await page.getByTestId('invite-member-email-input').fill(secondEmail);
    await page.getByTestId('invite-member-submit-btn').click();
    await expect(page.getByTestId('invite-member-modal')).not.toBeVisible({ timeout: 10000 });

    // Verify both members were added
    await expect(page.locator('[data-testid^="member-row-"]')).toHaveCount(initialCount + 2, { timeout: 10000 });
  });
});
