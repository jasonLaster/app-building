# LinearClone Test Specification

## Login Page (`/login`)

**Components**: LoginForm

### LoginForm

#### Test: Login form renders with email and password fields
- **Initial state**: User navigates to `/login` (not authenticated)
- **Expected**: The page displays an email input field, a password input field, a "Sign in" button, and a "Sign up" link. The form has a clean, centered layout with the app branding.

#### Test: Successful login with valid credentials
- **Initial state**: A user account exists with email "user@test.com" and password "password123"
- **Action**: User enters "user@test.com" in the email field, "password123" in the password field, and clicks the "Sign in" button
- **Expected**: User is redirected to `/my-issues`. A session token is stored in localStorage. The sidebar navigation is visible.

#### Test: Login fails with invalid email
- **Initial state**: User is on `/login`
- **Action**: User enters "nonexistent@test.com" in the email field, "password123" in the password field, and clicks "Sign in"
- **Expected**: An error message is displayed (e.g., "Invalid email or password"). The user remains on the login page. No session token is stored.

#### Test: Login fails with incorrect password
- **Initial state**: A user account exists with email "user@test.com". User is on `/login`.
- **Action**: User enters "user@test.com" in email, "wrongpassword" in password, and clicks "Sign in"
- **Expected**: An error message is displayed (e.g., "Invalid email or password"). The user remains on the login page.

#### Test: Login form validates required fields
- **Initial state**: User is on `/login`
- **Action**: User clicks "Sign in" without entering email or password
- **Expected**: Validation errors are shown for both email and password fields indicating they are required.

#### Test: Login form validates email format
- **Initial state**: User is on `/login`
- **Action**: User enters "notanemail" in the email field and clicks "Sign in"
- **Expected**: A validation error is shown indicating the email format is invalid.

#### Test: Navigate to sign up page from login
- **Initial state**: User is on `/login`
- **Action**: User clicks the "Sign up" link
- **Expected**: User is navigated to `/signup`.

#### Test: Password field masks input
- **Initial state**: User is on `/login`
- **Action**: User types in the password field
- **Expected**: The input is masked (displayed as dots/bullets), the field type is "password".

#### Test: Login form can be submitted via Enter key
- **Initial state**: User is on `/login`, has entered valid email and password
- **Action**: User presses Enter while focused on the password field
- **Expected**: The form is submitted, same behavior as clicking "Sign in".

#### Test: Login redirects authenticated users
- **Initial state**: User is already authenticated (valid session token in localStorage)
- **Action**: User navigates to `/login`
- **Expected**: User is redirected to `/my-issues` instead of seeing the login form.

## Sign Up Page (`/signup`)

**Components**: SignUpForm

### SignUpForm

#### Test: Sign up form renders with name, email, and password fields
- **Initial state**: User navigates to `/signup` (not authenticated)
- **Expected**: The page displays a name input field, an email input field, a password input field, a "Create account" button, and a "Log in" link. The form has a clean, centered layout.

#### Test: Successful account creation
- **Initial state**: No account exists for "newuser@test.com". User is on `/signup`.
- **Action**: User enters "Jane Doe" in name, "newuser@test.com" in email, "securepass123" in password, and clicks "Create account"
- **Expected**: Account is created. A default workspace is created for the user. User is redirected to `/my-issues`. A session token is stored in localStorage.

#### Test: Sign up fails with existing email
- **Initial state**: An account already exists with email "existing@test.com". User is on `/signup`.
- **Action**: User enters "John Doe" in name, "existing@test.com" in email, "password123" in password, and clicks "Create account"
- **Expected**: An error message is displayed (e.g., "An account with this email already exists"). The user remains on the sign up page.

#### Test: Sign up form validates required fields
- **Initial state**: User is on `/signup`
- **Action**: User clicks "Create account" without filling in any fields
- **Expected**: Validation errors are shown for name, email, and password fields indicating they are required.

#### Test: Sign up form validates email format
- **Initial state**: User is on `/signup`
- **Action**: User enters "Jane Doe" in name, "bademail" in email, "password123" in password, and clicks "Create account"
- **Expected**: A validation error is shown indicating the email format is invalid.

#### Test: Sign up form validates password minimum length
- **Initial state**: User is on `/signup`
- **Action**: User enters "Jane Doe" in name, "jane@test.com" in email, "abc" in password, and clicks "Create account"
- **Expected**: A validation error is shown indicating the password is too short (minimum 8 characters).

#### Test: Navigate to login page from sign up
- **Initial state**: User is on `/signup`
- **Action**: User clicks the "Log in" link
- **Expected**: User is navigated to `/login`.

#### Test: Password field masks input on sign up
- **Initial state**: User is on `/signup`
- **Action**: User types in the password field
- **Expected**: The input is masked (displayed as dots/bullets), the field type is "password".

#### Test: Sign up form can be submitted via Enter key
- **Initial state**: User is on `/signup`, has entered valid name, email, and password
- **Action**: User presses Enter while focused on the password field
- **Expected**: The form is submitted, same behavior as clicking "Create account".

#### Test: Sign up redirects authenticated users
- **Initial state**: User is already authenticated (valid session token in localStorage)
- **Action**: User navigates to `/signup`
- **Expected**: User is redirected to `/my-issues` instead of seeing the sign up form.

## Navigation Sidebar

<!-- Tests to be added by PlanPage task -->

## My Issues Page (`/my-issues`)

<!-- Tests to be added by PlanPage task -->

## Inbox Page (`/inbox`)

<!-- Tests to be added by PlanPage task -->

## Team Issues Page (`/team/:teamId/issues`)

<!-- Tests to be added by PlanPage task -->

## Issue Detail Page (`/issue/:issueId`)

<!-- Tests to be added by PlanPage task -->

## Create Issue Modal

<!-- Tests to be added by PlanPage task -->

## Active Cycle Page (`/team/:teamId/cycles`)

<!-- Tests to be added by PlanPage task -->

## Projects Page (`/projects`)

<!-- Tests to be added by PlanPage task -->

## Project Detail Page (`/project/:projectId`)

<!-- Tests to be added by PlanPage task -->

## Members Page (`/settings/members`)

<!-- Tests to be added by PlanPage task -->

## Teams Management Page (`/settings/teams`)

<!-- Tests to be added by PlanPage task -->

## Labels Page (`/settings/labels`)

<!-- Tests to be added by PlanPage task -->

## Settings Page (`/settings`)

<!-- Tests to be added by PlanPage task -->
