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

**Components**: MyIssuesList, IssueRow, FiltersToolbar

### MyIssuesList

#### Test: My Issues page renders with issues grouped by status
- **Initial state**: User is authenticated, has issues assigned in statuses: Backlog (2 issues), In Progress (1 issue), Done (1 issue)
- **Expected**: The page displays issues grouped under status headers. Each group header shows the status icon, status name, and issue count in parentheses. Groups appear in status order: Backlog, Todo, In Progress, In Review, Done, Cancelled. Empty status groups are not displayed.

#### Test: My Issues page shows empty state when no issues assigned
- **Initial state**: User is authenticated, has no issues assigned to them
- **Expected**: The page displays a friendly empty state message with an icon (e.g., "No issues assigned to you yet") instead of an empty list.

#### Test: Status group is collapsible
- **Initial state**: User is authenticated, has issues in "In Progress" status, the group is expanded
- **Action**: User clicks the "In Progress" group header
- **Expected**: The group collapses, hiding all issues within it. The group header remains visible with a collapse indicator (e.g., chevron rotates). Clicking again expands the group back.

#### Test: Status group collapse toggles multiple times
- **Initial state**: User is authenticated, "Backlog" group is expanded with 2 issues
- **Action**: User clicks the "Backlog" header to collapse, clicks it again to expand, then collapses once more
- **Expected**: Each click toggles correctly. After three clicks, the group is collapsed and its issues are hidden. The count in parentheses remains accurate.

#### Test: Multiple status groups can be independently collapsed
- **Initial state**: User is authenticated, has issues in Backlog, In Progress, and Done groups, all expanded
- **Action**: User collapses the "Backlog" group, then collapses the "Done" group
- **Expected**: "Backlog" and "Done" groups are collapsed while "In Progress" remains expanded showing its issues.

#### Test: My Issues page only shows issues assigned to current user
- **Initial state**: User "Alice" is authenticated. Issue ENG-1 is assigned to Alice, Issue ENG-2 is assigned to "Bob", Issue ENG-3 is unassigned.
- **Expected**: Only ENG-1 appears on Alice's My Issues page. ENG-2 and ENG-3 do not appear.

#### Test: My Issues page updates when issue is assigned to user
- **Initial state**: User is authenticated, viewing `/my-issues` with 2 issues
- **Action**: Another user assigns a new issue to the current user (or user creates an issue assigned to themselves via the create modal)
- **Expected**: The new issue appears in the appropriate status group on the My Issues page without requiring a manual refresh.

#### Test: My Issues page title and header are displayed
- **Initial state**: User is authenticated, navigates to `/my-issues`
- **Expected**: The page shows a header/title "My Issues" at the top of the main content area, clearly identifying the current page.

### IssueRow

#### Test: Issue row displays all required fields
- **Initial state**: User is authenticated, viewing My Issues. Issue ENG-42 exists with title "Fix login bug", status "In Progress", priority "High", labels ["Bug"], assignee avatar, due date "2026-03-20", project "Auth Rewrite".
- **Expected**: The issue row displays: High priority icon (orange arrow-up), identifier "ENG-42", title "Fix login bug", In Progress status icon (yellow half circle), "Bug" label as a small colored badge, assignee avatar, due date "Mar 20", and project name "Auth Rewrite".

#### Test: Issue row title is clickable and navigates to issue detail
- **Initial state**: User is authenticated, viewing My Issues with issue ENG-42
- **Action**: User clicks on the title "Fix login bug" in the issue row
- **Expected**: User is navigated to `/issue/<issueId>` for issue ENG-42. The issue detail page loads.

#### Test: Issue row status icon is clickable to change status
- **Initial state**: User is authenticated, viewing My Issues. Issue ENG-42 has status "Todo" (circle icon, gray).
- **Action**: User clicks the status icon on the ENG-42 issue row
- **Expected**: A dropdown/popover appears showing all available statuses (Backlog, Todo, In Progress, In Review, Done, Cancelled) with their respective icons and colors.

#### Test: Changing status via issue row status dropdown persists
- **Initial state**: User is authenticated, viewing My Issues. Issue ENG-42 has status "Todo". User has clicked the status icon and the dropdown is open.
- **Action**: User selects "In Progress" from the status dropdown
- **Expected**: The dropdown closes. The issue row now shows the In Progress icon (yellow half circle). The issue moves from the "Todo" group to the "In Progress" group. The change is persisted to the database.

#### Test: Issue row status change updates group membership
- **Initial state**: User is authenticated, "Todo" group has 3 issues including ENG-42, "In Progress" group has 1 issue
- **Action**: User changes ENG-42's status from "Todo" to "In Progress" via the status icon dropdown
- **Expected**: ENG-42 moves from the "Todo" group to the "In Progress" group. "Todo" group now shows count of 2, "In Progress" shows count of 2.

#### Test: Issue row status dropdown can be used multiple times
- **Initial state**: User is authenticated, issue ENG-42 has status "Todo"
- **Action**: User clicks status icon, changes to "In Progress", then clicks status icon again, changes to "Done"
- **Expected**: Both status changes work correctly. The issue ends up in the "Done" group with a green check circle icon. Each dropdown opens and closes cleanly.

#### Test: Issue row displays priority icon with correct color
- **Initial state**: User is authenticated, viewing My Issues with issues at different priorities
- **Expected**: Urgent shows red alert-triangle icon, High shows orange arrow-up, Medium shows yellow minus, Low shows blue arrow-down, No Priority shows gray dots-horizontal.

#### Test: Issue row displays labels as colored badges
- **Initial state**: User is authenticated, issue ENG-42 has labels "Bug" (red) and "Frontend" (blue)
- **Expected**: Both labels are shown as small colored badges in the issue row, each with the label's color and name text.

#### Test: Issue row shows assignee avatar
- **Initial state**: User is authenticated, issue ENG-42 is assigned to "Jane Doe" who has an avatar
- **Expected**: The issue row shows Jane Doe's avatar as a small circular image. If no avatar, shows initials.

#### Test: Issue row shows due date
- **Initial state**: User is authenticated, issue ENG-42 has a due date of 2026-03-20
- **Expected**: The issue row displays the due date in a short format (e.g., "Mar 20").

#### Test: Issue row shows project name when assigned
- **Initial state**: User is authenticated, issue ENG-42 is assigned to project "Auth Rewrite"
- **Expected**: The project name "Auth Rewrite" is displayed in the issue row.

#### Test: Issue row hides optional fields when not set
- **Initial state**: User is authenticated, issue ENG-43 has no labels, no due date, no project
- **Expected**: The issue row does not show empty placeholders for labels, due date, or project. Only the present fields (priority, identifier, title, status, assignee) are shown.

### FiltersToolbar

#### Test: Filters toolbar renders with Status, Priority, and Label filters
- **Initial state**: User is authenticated, viewing `/my-issues`
- **Expected**: A toolbar at the top of the issue list displays three filter controls: "Status" dropdown, "Priority" dropdown, and "Label" dropdown. Each shows as a button/chip that can be clicked to open a multi-select dropdown.

#### Test: Status filter dropdown shows all statuses with icons
- **Initial state**: User is authenticated, viewing `/my-issues`
- **Action**: User clicks the "Status" filter button
- **Expected**: A multi-select dropdown opens showing all statuses: Backlog (dotted circle, gray), Todo (circle, gray), In Progress (half circle, yellow), In Review (three-quarter circle, blue), Done (check circle, green), Cancelled (x-circle, red). Each option has a checkbox.

#### Test: Status filter filters issues by selected statuses
- **Initial state**: User is authenticated, has issues in Backlog (2), In Progress (1), Done (1)
- **Action**: User opens the Status filter and selects only "In Progress"
- **Expected**: Only the "In Progress" group is displayed with its 1 issue. Backlog and Done groups are hidden. The Status filter button shows a visual indicator that a filter is active (e.g., highlighted, badge count "1").

#### Test: Status filter allows multi-select
- **Initial state**: User is authenticated, has issues in Backlog (2), In Progress (1), Done (1)
- **Action**: User opens Status filter, checks "In Progress" and "Done"
- **Expected**: Both "In Progress" and "Done" groups are displayed. "Backlog" group is hidden. The filter button indicates 2 statuses selected.

#### Test: Priority filter dropdown shows all priorities with icons
- **Initial state**: User is authenticated, viewing `/my-issues`
- **Action**: User clicks the "Priority" filter button
- **Expected**: A multi-select dropdown opens showing: Urgent (alert-triangle, red), High (arrow-up, orange), Medium (minus, yellow), Low (arrow-down, blue), No Priority (dots-horizontal, gray). Each option has a checkbox.

#### Test: Priority filter filters issues by selected priorities
- **Initial state**: User is authenticated, has issues with priorities High (2), Medium (1), Low (1)
- **Action**: User opens Priority filter and selects "High"
- **Expected**: Only issues with High priority are displayed across all status groups. Issues with Medium and Low priority are hidden.

#### Test: Label filter dropdown shows all available labels
- **Initial state**: User is authenticated, workspace has labels "Bug" (red), "Feature" (green), "Improvement" (blue)
- **Action**: User clicks the "Label" filter button
- **Expected**: A multi-select dropdown opens showing all workspace labels with their colored dots and names. Each option has a checkbox.

#### Test: Label filter filters issues by selected labels
- **Initial state**: User is authenticated, has 3 issues: ENG-1 (labeled "Bug"), ENG-2 (labeled "Feature"), ENG-3 (labeled "Bug", "Feature")
- **Action**: User opens Label filter and selects "Bug"
- **Expected**: Only issues with the "Bug" label are shown (ENG-1 and ENG-3). ENG-2 is hidden.

#### Test: Multiple filters combine with AND logic
- **Initial state**: User is authenticated, has issues: ENG-1 (High priority, Bug label, In Progress), ENG-2 (High priority, Feature label, In Progress), ENG-3 (Low priority, Bug label, Backlog)
- **Action**: User selects "High" in Priority filter and "Bug" in Label filter
- **Expected**: Only ENG-1 is shown (it matches both High priority AND Bug label). ENG-2 and ENG-3 are hidden.

#### Test: Clearing a filter restores all issues
- **Initial state**: User has Status filter set to "In Progress" only, showing 1 issue
- **Action**: User opens Status filter and deselects "In Progress" (or clicks a "Clear" option)
- **Expected**: All issues are shown again across all status groups, same as the unfiltered view.

#### Test: Filters can be used repeatedly after clearing
- **Initial state**: User is authenticated with multiple issues at various statuses and priorities
- **Action**: User applies Priority filter for "High", clears it, then applies Priority filter for "Low", clears it, then applies Status filter for "Done"
- **Expected**: Each filter application and clearing works correctly. After the final action, only "Done" issues are shown. Filters remain responsive and functional through multiple interactions.

#### Test: Filter state shows active filter indicators
- **Initial state**: User is authenticated, no filters applied
- **Action**: User selects "High" in Priority filter
- **Expected**: The Priority filter button shows a visual indicator that it is active (e.g., highlighted background, badge showing "1", or different styling). Status and Label filter buttons remain in their default/inactive state.

#### Test: Filters persist while navigating within the page
- **Initial state**: User has Status filter set to "In Progress", viewing filtered results
- **Action**: User clicks an issue title to view detail, then navigates back to `/my-issues`
- **Expected**: The filters are still applied showing only "In Progress" issues. The filter state is preserved across navigation.

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
