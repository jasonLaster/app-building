import { test, expect } from '@playwright/test';

// Helper to create a test user via signup API
async function createTestUser(baseURL: string, name: string, email: string, password: string) {
  const response = await fetch(`${baseURL}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

// Helper to delete all sessions and members created by tests
async function _cleanupTestUsers(_baseURL: string) {
  // We rely on the test script's between-test DB reset (truncate + re-seed)
  // No additional cleanup needed since seed data is restored each test
}

test.describe('LoginForm', () => {
  test('Login form renders with email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Verify the login form is visible
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Verify email input
    await expect(page.getByTestId('login-email-input')).toBeVisible();

    // Verify password input
    await expect(page.getByTestId('login-password-input')).toBeVisible();

    // Verify Sign in button
    await expect(page.getByTestId('login-submit-button')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toHaveText('Sign in');

    // Verify Sign up link
    await expect(page.getByTestId('login-signup-link')).toBeVisible();
    await expect(page.getByTestId('login-signup-link')).toHaveText('Sign up');
  });

  test('Successful login with valid credentials', async ({ page, baseURL }) => {
    test.slow();

    // Create a test user via API
    const email = `user-${Date.now()}@test.com`;
    const password = 'password123';
    await createTestUser(baseURL!, 'Test User', email, password);

    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Fill in credentials
    await page.getByTestId('login-email-input').fill(email);
    await page.getByTestId('login-password-input').fill(password);
    await page.getByTestId('login-submit-button').click();

    // Verify redirect to /my-issues
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Verify session token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('session_token'));
    expect(token).toBeTruthy();

    // Verify sidebar is visible (authenticated layout)
    await expect(page.getByTestId('app-layout')).toBeVisible({ timeout: 30000 });
  });

  test('Login fails with invalid email', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Enter non-existent email
    await page.getByTestId('login-email-input').fill('nonexistent@test.com');
    await page.getByTestId('login-password-input').fill('password123');
    await page.getByTestId('login-submit-button').click();

    // Verify error message
    await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('login-error')).toContainText('Invalid email or password');

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);

    // Verify no session token
    const token = await page.evaluate(() => localStorage.getItem('session_token'));
    expect(token).toBeFalsy();
  });

  test('Login fails with incorrect password', async ({ page, baseURL: _baseURL }) => {
    // Use seeded user alice@acme.com
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('login-email-input').fill('alice@acme.com');
    await page.getByTestId('login-password-input').fill('wrongpassword');
    await page.getByTestId('login-submit-button').click();

    // Verify error message
    await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('login-error')).toContainText('Invalid email or password');

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login form validates required fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Click sign in without entering anything
    await page.getByTestId('login-submit-button').click();

    // Verify validation errors for both fields
    await expect(page.getByTestId('login-email-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('login-email-error')).toContainText('required');

    await expect(page.getByTestId('login-password-error')).toBeVisible();
    await expect(page.getByTestId('login-password-error')).toContainText('required');
  });

  test('Login form validates email format', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Enter invalid email format
    await page.getByTestId('login-email-input').fill('notanemail');
    await page.getByTestId('login-submit-button').click();

    // Verify email format validation error
    await expect(page.getByTestId('login-email-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('login-email-error')).toContainText('valid email');
  });

  test('Navigate to sign up page from login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Click the sign up link
    await page.getByTestId('login-signup-link').click();

    // Verify navigation to /signup
    await expect(page).toHaveURL(/\/signup/, { timeout: 30000 });

    // Verify the signup page content is shown
    await expect(page.getByTestId('signup-page')).toBeVisible({ timeout: 30000 });
  });

  test('Password field masks input', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    const passwordInput = page.getByTestId('login-password-input');

    // Verify the field type is "password" (masks input)
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Type something to confirm it accepts input while masked
    await passwordInput.fill('secretpassword');
    await expect(passwordInput).toHaveValue('secretpassword');
  });

  test('Login form can be submitted via Enter key', async ({ page, baseURL }) => {
    test.slow();

    // Create a test user via API
    const email = `enterkey-${Date.now()}@test.com`;
    const password = 'password123';
    await createTestUser(baseURL!, 'Enter Key User', email, password);

    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });

    // Fill in credentials
    await page.getByTestId('login-email-input').fill(email);
    await page.getByTestId('login-password-input').fill(password);

    // Press Enter on the password field
    await page.getByTestId('login-password-input').press('Enter');

    // Verify redirect to /my-issues (same as clicking Sign in)
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Verify session token stored
    const token = await page.evaluate(() => localStorage.getItem('session_token'));
    expect(token).toBeTruthy();
  });

  test('Login redirects authenticated users', async ({ page, baseURL }) => {
    test.slow();

    // Create a user and get a valid token
    const email = `redirect-${Date.now()}@test.com`;
    const password = 'password123';
    const data = await createTestUser(baseURL!, 'Redirect User', email, password);
    const token = data.token;

    // Set the session token in localStorage before navigating
    await page.goto('/login');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);

    // Navigate to /login
    await page.goto('/login');

    // Should be redirected to /my-issues
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Should not see the login form
    await expect(page.getByTestId('login-form')).not.toBeVisible();
  });
});
