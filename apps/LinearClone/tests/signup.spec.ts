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

test.describe('SignUpForm', () => {
  test('Sign up form renders with name, email, and password fields', async ({ page }) => {
    await page.goto('/signup');

    // Verify the signup form is visible
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Verify name input
    await expect(page.getByTestId('signup-name-input')).toBeVisible();

    // Verify email input
    await expect(page.getByTestId('signup-email-input')).toBeVisible();

    // Verify password input
    await expect(page.getByTestId('signup-password-input')).toBeVisible();

    // Verify Create account button
    await expect(page.getByTestId('signup-submit-button')).toBeVisible();
    await expect(page.getByTestId('signup-submit-button')).toHaveText('Create account');

    // Verify Log in link
    await expect(page.getByTestId('signup-login-link')).toBeVisible();
    await expect(page.getByTestId('signup-login-link')).toHaveText('Log in');
  });

  test('Successful account creation', async ({ page, baseURL: _baseURL }) => {
    test.slow();

    const email = `newuser-${Date.now()}@test.com`;

    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Fill in registration fields
    await page.getByTestId('signup-name-input').fill('Jane Doe');
    await page.getByTestId('signup-email-input').fill(email);
    await page.getByTestId('signup-password-input').fill('securepass123');
    await page.getByTestId('signup-submit-button').click();

    // Verify redirect to /my-issues
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Verify session token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('session_token'));
    expect(token).toBeTruthy();

    // Verify authenticated layout is visible
    await expect(page.getByTestId('app-layout')).toBeVisible({ timeout: 30000 });
  });

  test('Sign up fails with existing email', async ({ page, baseURL }) => {
    test.slow();

    // Create an existing user first
    const email = `existing-${Date.now()}@test.com`;
    await createTestUser(baseURL!, 'Existing User', email, 'password123');

    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Try to sign up with the same email
    await page.getByTestId('signup-name-input').fill('John Doe');
    await page.getByTestId('signup-email-input').fill(email);
    await page.getByTestId('signup-password-input').fill('password123');
    await page.getByTestId('signup-submit-button').click();

    // Verify error message
    await expect(page.getByTestId('signup-error')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('signup-error')).toContainText('An account with this email already exists');

    // Verify still on signup page
    await expect(page).toHaveURL(/\/signup/);
  });

  test('Sign up form validates required fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Click Create account without entering anything
    await page.getByTestId('signup-submit-button').click();

    // Verify validation errors for all fields
    await expect(page.getByTestId('signup-name-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('signup-name-error')).toContainText('required');

    await expect(page.getByTestId('signup-email-error')).toBeVisible();
    await expect(page.getByTestId('signup-email-error')).toContainText('required');

    await expect(page.getByTestId('signup-password-error')).toBeVisible();
    await expect(page.getByTestId('signup-password-error')).toContainText('required');
  });

  test('Sign up form validates email format', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Enter valid name, invalid email, valid password
    await page.getByTestId('signup-name-input').fill('Jane Doe');
    await page.getByTestId('signup-email-input').fill('bademail');
    await page.getByTestId('signup-password-input').fill('password123');
    await page.getByTestId('signup-submit-button').click();

    // Verify email format validation error
    await expect(page.getByTestId('signup-email-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('signup-email-error')).toContainText('valid email');
  });

  test('Sign up form validates password minimum length', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Enter valid name, valid email, short password
    await page.getByTestId('signup-name-input').fill('Jane Doe');
    await page.getByTestId('signup-email-input').fill('jane@test.com');
    await page.getByTestId('signup-password-input').fill('abc');
    await page.getByTestId('signup-submit-button').click();

    // Verify password length validation error
    await expect(page.getByTestId('signup-password-error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('signup-password-error')).toContainText('at least 8 characters');
  });

  test('Navigate to login page from sign up', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Click the Log in link
    await page.getByTestId('signup-login-link').click();

    // Verify navigation to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 30000 });

    // Verify the login page content is shown
    await expect(page.getByTestId('login-form')).toBeVisible({ timeout: 30000 });
  });

  test('Password field masks input on sign up', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    const passwordInput = page.getByTestId('signup-password-input');

    // Verify the field type is "password" (masks input)
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Type something to confirm it accepts input while masked
    await passwordInput.fill('secretpassword');
    await expect(passwordInput).toHaveValue('secretpassword');
  });

  test('Sign up form can be submitted via Enter key', async ({ page, baseURL: _baseURL }) => {
    test.slow();

    const email = `enterkey-${Date.now()}@test.com`;

    await page.goto('/signup');
    await expect(page.getByTestId('signup-form')).toBeVisible({ timeout: 30000 });

    // Fill in registration fields
    await page.getByTestId('signup-name-input').fill('Enter Key User');
    await page.getByTestId('signup-email-input').fill(email);
    await page.getByTestId('signup-password-input').fill('securepass123');

    // Press Enter on the password field
    await page.getByTestId('signup-password-input').press('Enter');

    // Verify redirect to /my-issues (same as clicking Create account)
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Verify session token stored
    const token = await page.evaluate(() => localStorage.getItem('session_token'));
    expect(token).toBeTruthy();
  });

  test('Sign up redirects authenticated users', async ({ page, baseURL }) => {
    test.slow();

    // Create a user and get a valid token
    const email = `redirect-${Date.now()}@test.com`;
    const password = 'password123';
    const data = await createTestUser(baseURL!, 'Redirect User', email, password);
    const token = data.token;

    // Set the session token in localStorage before navigating
    await page.goto('/signup');
    await page.evaluate((t) => localStorage.setItem('session_token', t), token);

    // Navigate to /signup
    await page.goto('/signup');

    // Should be redirected to /my-issues
    await expect(page).toHaveURL(/\/my-issues/, { timeout: 30000 });

    // Should not see the signup form
    await expect(page.getByTestId('signup-form')).not.toBeVisible();
  });
});
