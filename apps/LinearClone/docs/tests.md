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

**Components**: Sidebar, SidebarCollapse, KeyboardShortcuts

### Sidebar

#### Test: Sidebar renders workspace header
- **Initial state**: User is authenticated and on `/my-issues`
- **Expected**: The sidebar displays the workspace name at the top. The workspace name is clickable.

#### Test: Sidebar workspace header navigates to home
- **Initial state**: User is authenticated and viewing `/team/1/issues`
- **Action**: User clicks the workspace name in the sidebar header
- **Expected**: User is navigated to `/my-issues` (home page).

#### Test: Sidebar renders main navigation links
- **Initial state**: User is authenticated and on `/my-issues`
- **Expected**: The sidebar shows "My Issues" with a user-circle icon and "Inbox" with an inbox icon. Both are clickable navigation links.

#### Test: Sidebar My Issues link navigates correctly
- **Initial state**: User is authenticated and on `/inbox`
- **Action**: User clicks "My Issues" in the sidebar
- **Expected**: User is navigated to `/my-issues`. The "My Issues" link appears selected/active with visual distinction (e.g., highlighted background).

#### Test: Sidebar Inbox link navigates correctly
- **Initial state**: User is authenticated and on `/my-issues`
- **Action**: User clicks "Inbox" in the sidebar
- **Expected**: User is navigated to `/inbox`. The "Inbox" link appears selected/active.

#### Test: Sidebar Inbox shows unread notification count badge
- **Initial state**: User is authenticated, has 3 unread notifications
- **Expected**: The "Inbox" link in the sidebar displays a badge showing "3". The badge is visually distinct (e.g., accent color background).

#### Test: Sidebar Inbox badge updates when notifications are read
- **Initial state**: User is authenticated, has 3 unread notifications, badge shows "3"
- **Action**: User navigates to `/inbox` and marks one notification as read
- **Expected**: The badge count updates to "2". If all notifications are read, the badge disappears.

#### Test: Sidebar Inbox badge not shown when no unread notifications
- **Initial state**: User is authenticated, has 0 unread notifications
- **Expected**: No badge is shown next to the "Inbox" link.

#### Test: Sidebar renders team sections
- **Initial state**: User is authenticated, workspace has teams "Engineering" and "Design"
- **Expected**: The sidebar displays a "Team Section" with each team name as a collapsible section header. Under each team: "Issues" (list icon), "Active Cycle" (refresh-cw icon), "Projects" (folder icon), "Views" (layout icon).

#### Test: Sidebar team section is collapsible
- **Initial state**: User is authenticated, "Engineering" team section is expanded
- **Action**: User clicks the "Engineering" team section header
- **Expected**: The team section collapses, hiding Issues, Active Cycle, Projects, and Views sub-links. Clicking again expands it back.

#### Test: Sidebar team section collapse toggles multiple times
- **Initial state**: User is authenticated, "Engineering" team section is expanded
- **Action**: User clicks the "Engineering" header to collapse, then clicks it again to expand, then collapses it once more
- **Expected**: Each click toggles the section correctly. After three clicks the section is collapsed.

#### Test: Sidebar team Issues link navigates to team issues page
- **Initial state**: User is authenticated, "Engineering" team has id "eng-1"
- **Action**: User clicks "Issues" under the "Engineering" team section
- **Expected**: User is navigated to `/team/eng-1/issues`. The link appears selected/active.

#### Test: Sidebar team Active Cycle link navigates to cycles page
- **Initial state**: User is authenticated, "Engineering" team has id "eng-1"
- **Action**: User clicks "Active Cycle" under the "Engineering" team section
- **Expected**: User is navigated to `/team/eng-1/cycles`.

#### Test: Sidebar team Projects link navigates to team projects
- **Initial state**: User is authenticated, "Engineering" team has id "eng-1"
- **Action**: User clicks "Projects" under the "Engineering" team section
- **Expected**: User is navigated to the projects page filtered by this team, or to `/projects` with the team filter applied.

#### Test: Sidebar team Views link navigates to saved views
- **Initial state**: User is authenticated, "Engineering" team has id "eng-1"
- **Action**: User clicks "Views" under the "Engineering" team section
- **Expected**: User is navigated to a views page for the team showing saved filtered views.

#### Test: Sidebar renders workspace section links
- **Initial state**: User is authenticated
- **Expected**: The sidebar displays a "Workspace" section with links: "All Projects" (folder icon), "All Teams" (users icon), "Members" (user-plus icon), "Labels" (tag icon), "Settings" (settings icon).

#### Test: Sidebar All Projects link navigates correctly
- **Initial state**: User is authenticated, on `/my-issues`
- **Action**: User clicks "All Projects" in the workspace section
- **Expected**: User is navigated to `/projects`.

#### Test: Sidebar All Teams link navigates correctly
- **Initial state**: User is authenticated, on `/my-issues`
- **Action**: User clicks "All Teams" in the workspace section
- **Expected**: User is navigated to `/settings/teams`.

#### Test: Sidebar Members link navigates correctly
- **Initial state**: User is authenticated, on `/my-issues`
- **Action**: User clicks "Members" in the workspace section
- **Expected**: User is navigated to `/settings/members`.

#### Test: Sidebar Labels link navigates correctly
- **Initial state**: User is authenticated, on `/my-issues`
- **Action**: User clicks "Labels" in the workspace section
- **Expected**: User is navigated to `/settings/labels`.

#### Test: Sidebar Settings link navigates correctly
- **Initial state**: User is authenticated, on `/my-issues`
- **Action**: User clicks "Settings" in the workspace section
- **Expected**: User is navigated to `/settings`.

#### Test: Sidebar highlights current page link
- **Initial state**: User is authenticated and on `/my-issues`
- **Expected**: The "My Issues" link in the sidebar has an active/selected visual style (e.g., highlighted background, different text color). Other links do not have the active style.

#### Test: Sidebar active highlight updates on navigation
- **Initial state**: User is authenticated, on `/my-issues`, "My Issues" is highlighted
- **Action**: User clicks "Inbox" in the sidebar
- **Expected**: "Inbox" becomes highlighted and "My Issues" loses its highlight.

#### Test: Sidebar is present on all authenticated pages
- **Initial state**: User is authenticated
- **Action**: User navigates to `/my-issues`, then `/inbox`, then `/settings`
- **Expected**: The sidebar is visible and functional on all three pages with consistent layout and content.

#### Test: Sidebar is not shown on login page
- **Initial state**: User is not authenticated
- **Action**: User navigates to `/login`
- **Expected**: The sidebar is not visible. Only the login form is shown.

#### Test: Sidebar is not shown on signup page
- **Initial state**: User is not authenticated
- **Action**: User navigates to `/signup`
- **Expected**: The sidebar is not visible. Only the signup form is shown.

### SidebarCollapse

#### Test: Sidebar collapse toggle button is visible
- **Initial state**: User is authenticated, sidebar is expanded
- **Expected**: A toggle button is visible on the sidebar (e.g., a chevron-left icon or hamburger icon) that can collapse the sidebar.

#### Test: Sidebar collapses to icon-only mode
- **Initial state**: User is authenticated, sidebar is fully expanded showing labels and icons
- **Action**: User clicks the sidebar collapse toggle button
- **Expected**: The sidebar collapses to icon-only mode. Navigation items show only their icons without text labels. The sidebar width is significantly reduced. The main content area expands to fill the freed space.

#### Test: Sidebar expands from icon-only mode
- **Initial state**: User is authenticated, sidebar is in icon-only (collapsed) mode
- **Action**: User clicks the sidebar expand toggle button
- **Expected**: The sidebar expands back to full width showing both icons and text labels. The main content area shrinks accordingly.

#### Test: Sidebar collapse state persists across navigation
- **Initial state**: User is authenticated, sidebar is collapsed to icon-only mode
- **Action**: User clicks the "My Issues" icon in the collapsed sidebar, then clicks the "Inbox" icon
- **Expected**: The sidebar remains in collapsed icon-only mode through both navigations. It does not re-expand on page change.

#### Test: Sidebar icons are still clickable in collapsed mode
- **Initial state**: User is authenticated, sidebar is in icon-only mode, user is on `/my-issues`
- **Action**: User clicks the Inbox icon in the collapsed sidebar
- **Expected**: User is navigated to `/inbox`. The navigation works identically to the expanded sidebar.

#### Test: Sidebar collapse toggle works multiple times in sequence
- **Initial state**: User is authenticated, sidebar is expanded
- **Action**: User clicks the collapse toggle, then clicks it again, then clicks it once more
- **Expected**: Sidebar collapses, then expands, then collapses again. Each transition is smooth (animated, ~150ms). The toggle works reliably on repeated use.

#### Test: Sidebar team sections visible in collapsed mode
- **Initial state**: User is authenticated, sidebar is in icon-only mode, workspace has team "Engineering"
- **Expected**: Team navigation items are still accessible in icon-only mode (icons for Issues, Active Cycle, Projects, Views are visible and clickable).

#### Test: Sidebar workspace section visible in collapsed mode
- **Initial state**: User is authenticated, sidebar is in icon-only mode
- **Expected**: Workspace section items (All Projects, All Teams, Members, Labels, Settings) are visible as icons and remain clickable.

### KeyboardShortcuts

#### Test: Pressing C opens create issue modal
- **Initial state**: User is authenticated and on `/my-issues`, no modal is open, focus is not in a text input
- **Action**: User presses the "C" key
- **Expected**: The create issue modal opens with the title field focused.

#### Test: Pressing C does not open modal when typing in input
- **Initial state**: User is authenticated, focus is in a text input field (e.g., a search field or comment box)
- **Action**: User presses the "C" key
- **Expected**: The character "c" is typed into the input field. The create issue modal does NOT open.

#### Test: G then I navigates to My Issues
- **Initial state**: User is authenticated and on `/inbox`, focus is not in a text input
- **Action**: User presses "G" key, then presses "I" key
- **Expected**: User is navigated to `/my-issues`.

#### Test: G then N navigates to Inbox
- **Initial state**: User is authenticated and on `/my-issues`, focus is not in a text input
- **Action**: User presses "G" key, then presses "N" key
- **Expected**: User is navigated to `/inbox`.

#### Test: G then I does not navigate when typing in input
- **Initial state**: User is authenticated, focus is in a text input field
- **Action**: User presses "G" key, then "I" key
- **Expected**: The characters "gi" are typed into the input. No navigation occurs.

#### Test: G chord times out if second key is delayed
- **Initial state**: User is authenticated and on `/my-issues`, focus is not in a text input
- **Action**: User presses "G" key, waits 2 seconds, then presses "I" key
- **Expected**: No navigation occurs. The chord is cancelled after a short timeout (~1 second).

#### Test: G followed by unrecognized key does nothing
- **Initial state**: User is authenticated and on `/my-issues`, focus is not in a text input
- **Action**: User presses "G" key, then presses "X" key
- **Expected**: Nothing happens. No navigation or modal opens. The app does not error.

#### Test: Keyboard shortcuts work from different pages
- **Initial state**: User is authenticated and on `/settings`
- **Action**: User presses "C" key
- **Expected**: The create issue modal opens, same as from any other page.

#### Test: Keyboard shortcuts do not fire when modal is open
- **Initial state**: User is authenticated, create issue modal is open
- **Action**: User presses "G" then "I"
- **Expected**: No navigation occurs. The modal remains open. The keystrokes do not trigger navigation shortcuts.

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
