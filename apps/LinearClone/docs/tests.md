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

**Components**: NotificationList, NotificationRow

### NotificationList

#### Test: Inbox page renders with list of notifications
- **Initial state**: User is authenticated, has 3 notifications (1 assignment, 1 issue update, 1 mention)
- **Expected**: The page displays a header "Inbox" at the top. All 3 notifications are listed in reverse chronological order (newest first). Each notification is a distinct row.

#### Test: Inbox page shows empty state when no notifications
- **Initial state**: User is authenticated, has no notifications
- **Expected**: The page displays a friendly empty state message with an icon (e.g., "No notifications yet" or "You're all caught up!") instead of an empty list.

#### Test: Inbox shows unread notifications visually distinct from read
- **Initial state**: User is authenticated, has 2 unread notifications and 1 read notification
- **Expected**: Unread notifications appear with bold text and a left border accent (using the primary accent color `#5e6ad2`). Read notifications appear with normal weight text and no left border accent.

#### Test: Inbox page shows notification count in header
- **Initial state**: User is authenticated, has 5 unread notifications
- **Expected**: The inbox header or a badge near it indicates the number of unread notifications (e.g., "Inbox (5)" or a count badge).

#### Test: Inbox notification list updates sidebar badge when notifications change
- **Initial state**: User is authenticated, has 3 unread notifications, sidebar Inbox badge shows "3"
- **Action**: User marks one notification as read on the inbox page
- **Expected**: The sidebar Inbox badge updates to "2".

#### Test: Inbox notifications are ordered by newest first
- **Initial state**: User is authenticated, has notifications from 5 minutes ago, 1 hour ago, and 1 day ago
- **Expected**: Notifications appear in order: 5 minutes ago (top), 1 hour ago (middle), 1 day ago (bottom).

#### Test: Archiving a notification removes it from the list
- **Initial state**: User is authenticated, has 3 notifications visible in the inbox
- **Action**: User clicks the archive button/icon on the first notification
- **Expected**: The notification is removed from the inbox list. The list now shows 2 notifications. The archived notification does not reappear.

#### Test: Archiving multiple notifications works in sequence
- **Initial state**: User is authenticated, has 3 notifications visible
- **Action**: User archives the first notification, then archives what is now the first notification
- **Expected**: Both notifications are removed. The list shows 1 remaining notification. The archive action works correctly on repeated use.

#### Test: All notifications can be archived to reach empty state
- **Initial state**: User is authenticated, has 2 notifications visible
- **Action**: User archives both notifications one by one
- **Expected**: After all notifications are archived, the empty state message is displayed. The sidebar Inbox badge disappears (no unread count).

### NotificationRow

#### Test: Notification row displays assignment notification correctly
- **Initial state**: User is authenticated, has a notification for "Issue ENG-42 was assigned to you" created 5 minutes ago
- **Expected**: The notification row displays: an assignment-type icon (e.g., user-plus or assign icon), issue identifier "ENG-42", description text "assigned to you" or similar, and relative timestamp "5m ago". The row is visually complete and well-formatted.

#### Test: Notification row displays issue update notification correctly
- **Initial state**: User is authenticated, has a notification for "Issue ENG-15 status changed to Done" on a subscribed issue, created 1 hour ago
- **Expected**: The notification row displays: an update-type icon (e.g., refresh or edit icon), issue identifier "ENG-15", description "status changed to Done" or similar, and relative timestamp "1h ago".

#### Test: Notification row displays mention notification correctly
- **Initial state**: User is authenticated, has a notification for "You were mentioned in a comment on ENG-7" created 2 hours ago
- **Expected**: The notification row displays: a mention-type icon (e.g., at-sign icon), issue identifier "ENG-7", description "mentioned you in a comment" or similar, and relative timestamp "2h ago".

#### Test: Clicking an unread notification marks it as read
- **Initial state**: User is authenticated, has an unread notification for issue ENG-42 (bold text, left border accent)
- **Action**: User clicks on the notification row
- **Expected**: The notification's visual style changes from unread (bold, left border accent) to read (normal weight, no left border accent). The change is persisted to the database. The sidebar Inbox badge count decrements by 1.

#### Test: Clicking a read notification does not change its state
- **Initial state**: User is authenticated, has a read notification (normal weight, no accent)
- **Action**: User clicks on the notification row
- **Expected**: The notification remains in its read visual state. No redundant database update is made.

#### Test: Clicking a notification navigates to the related issue
- **Initial state**: User is authenticated, has a notification for issue ENG-42
- **Action**: User clicks on the notification row
- **Expected**: User is navigated to `/issue/<issueId>` for issue ENG-42. The issue detail page loads showing ENG-42.

#### Test: Notification row archive button is visible
- **Initial state**: User is authenticated, has a notification visible in the inbox
- **Expected**: Each notification row has an archive button/icon (e.g., an archive or x icon) visible on hover or always visible, allowing the user to archive the notification.

#### Test: Notification row archive button archives without navigating
- **Initial state**: User is authenticated, viewing the inbox with a notification for ENG-42
- **Action**: User clicks the archive button on the ENG-42 notification row
- **Expected**: The notification is archived and removed from the list. The user remains on the `/inbox` page — no navigation to the issue detail occurs. The archive action is persisted to the database.

#### Test: Notification row shows correct icon per notification type
- **Initial state**: User is authenticated, has one of each notification type: assignment, issue update, mention
- **Expected**: Each notification type has a distinct, recognizable icon: assignment uses a user/assign icon, issue update uses a refresh/change icon, mention uses an at-sign/@-symbol icon. The icons are visually differentiated by shape or style.

#### Test: Notification row displays relative timestamps that update
- **Initial state**: User is authenticated, has a notification created "just now"
- **Expected**: The timestamp shows "just now" or "1m ago" (relative format). Timestamps use relative format throughout (e.g., "5m ago", "1h ago", "2d ago") rather than absolute dates.

#### Test: Marking notification as read then archiving works correctly
- **Initial state**: User is authenticated, has an unread notification for ENG-42
- **Action**: User clicks the notification to mark as read, then clicks the archive button on the same notification
- **Expected**: The notification is first marked as read (visual change), then archived and removed from the list. Both actions succeed in sequence without conflict.

#### Test: Notification row click and archive button have separate hit targets
- **Initial state**: User is authenticated, has a notification in the inbox
- **Action**: User clicks specifically on the archive button area of a notification row
- **Expected**: Only the archive action fires — the notification is archived. The user does NOT navigate to the issue detail page. The click targets for "mark as read + navigate" and "archive" are clearly separated.

## Team Issues Page (`/team/:teamId/issues`)

**Components**: TeamIssuesList, BulkActions, GroupBySort, TeamFilters

### TeamIssuesList

#### Test: Team Issues page renders with header showing team name
- **Initial state**: User is authenticated, navigates to `/team/eng-1/issues` for team "Engineering"
- **Expected**: The page displays a header with the team name "Engineering" and an "Issues" label. A "New Issue" button is visible in the header area.

#### Test: Team Issues page shows issues grouped by status (default)
- **Initial state**: User is authenticated, "Engineering" team has issues in Backlog (3), In Progress (2), Done (1)
- **Expected**: Issues are grouped under status headers. Each group header shows the status icon, status name, and issue count in parentheses. Groups appear in status order: Backlog, Todo, In Progress, In Review, Done, Cancelled. Empty status groups are not displayed.

#### Test: Team Issues page shows all team issues, not just current user's
- **Initial state**: User "Alice" is authenticated, "Engineering" team has issues: ENG-1 (assigned to Alice), ENG-2 (assigned to Bob), ENG-3 (unassigned)
- **Expected**: All three issues (ENG-1, ENG-2, ENG-3) are visible on the team issues page.

#### Test: Team Issues page shows empty state when team has no issues
- **Initial state**: User is authenticated, "Engineering" team has no issues
- **Expected**: A friendly empty state message with an icon is displayed (e.g., "No issues yet. Create your first issue to get started.") and the "New Issue" button is visible.

#### Test: Issue row displays all required fields including checkbox and team prefix
- **Initial state**: User is authenticated, viewing team issues. Issue ENG-42 exists with title "Fix login bug", status "In Progress", priority "High", labels ["Bug"], assignee "Jane Doe" (with avatar), due date "2026-03-20", project "Auth Rewrite".
- **Expected**: The issue row displays: a checkbox for bulk selection (unchecked), High priority icon (orange arrow-up), identifier "ENG-42" with team prefix, title "Fix login bug", In Progress status icon (yellow half circle), "Bug" label as a small colored badge, assignee avatar, due date "Mar 20", and project name "Auth Rewrite".

#### Test: Issue row title is clickable and navigates to issue detail
- **Initial state**: User is authenticated, viewing team issues with issue ENG-42
- **Action**: User clicks on the title "Fix login bug" in the issue row
- **Expected**: User is navigated to `/issue/<issueId>` for issue ENG-42.

#### Test: Issue row status icon is clickable to change status
- **Initial state**: User is authenticated, viewing team issues. Issue ENG-42 has status "Todo".
- **Action**: User clicks the status icon on the ENG-42 issue row
- **Expected**: A dropdown/popover appears showing all available statuses (Backlog, Todo, In Progress, In Review, Done, Cancelled) with their respective icons and colors.

#### Test: Changing status via issue row status dropdown persists and moves issue between groups
- **Initial state**: User is authenticated, viewing team issues grouped by status. "Todo" group has ENG-42. "In Progress" group has 1 issue.
- **Action**: User clicks the status icon on ENG-42, selects "In Progress" from the dropdown
- **Expected**: The dropdown closes. ENG-42 moves from the "Todo" group to the "In Progress" group. Group counts update accordingly. The change is persisted to the database.

#### Test: Issue row status dropdown can be used multiple times
- **Initial state**: User is authenticated, issue ENG-42 has status "Todo"
- **Action**: User clicks status icon, changes to "In Progress", then clicks status icon again, changes to "Done"
- **Expected**: Both status changes work correctly. The issue ends up in the "Done" group with a green check circle icon. Each dropdown opens and closes cleanly.

#### Test: Status group headers are collapsible
- **Initial state**: User is authenticated, "In Progress" group is expanded with 2 issues
- **Action**: User clicks the "In Progress" group header
- **Expected**: The group collapses, hiding all issues within it. The group header remains visible with a collapse indicator (e.g., chevron rotates). Clicking again expands the group back.

#### Test: Status group collapse toggles multiple times
- **Initial state**: User is authenticated, "Backlog" group is expanded with 3 issues
- **Action**: User clicks the "Backlog" header to collapse, clicks it again to expand, then collapses once more
- **Expected**: Each click toggles correctly. After three clicks, the group is collapsed and its issues are hidden. The count in parentheses remains accurate.

#### Test: Multiple status groups can be independently collapsed
- **Initial state**: User is authenticated, has issues in Backlog, In Progress, and Done groups, all expanded
- **Action**: User collapses the "Backlog" group, then collapses the "Done" group
- **Expected**: "Backlog" and "Done" groups are collapsed while "In Progress" remains expanded showing its issues.

#### Test: Issue row displays priority icon with correct color
- **Initial state**: User is authenticated, viewing team issues with issues at different priorities
- **Expected**: Urgent shows red alert-triangle icon, High shows orange arrow-up, Medium shows yellow minus, Low shows blue arrow-down, No Priority shows gray dots-horizontal.

#### Test: Issue row displays labels as colored badges
- **Initial state**: User is authenticated, issue ENG-42 has labels "Bug" (red) and "Frontend" (blue)
- **Expected**: Both labels are shown as small colored badges in the issue row, each with the label's color and name text.

#### Test: Issue row shows assignee avatar
- **Initial state**: User is authenticated, issue ENG-42 is assigned to "Jane Doe" who has an avatar
- **Expected**: The issue row shows Jane Doe's avatar as a small circular image. If no avatar, shows initials.

#### Test: Issue row hides optional fields when not set
- **Initial state**: User is authenticated, issue ENG-43 has no labels, no due date, no project, no assignee
- **Expected**: The issue row does not show empty placeholders for labels, due date, project, or assignee. Only the present fields (checkbox, priority, identifier, title, status) are shown.

#### Test: New Issue button opens create issue modal with team pre-selected
- **Initial state**: User is authenticated, viewing `/team/eng-1/issues` for team "Engineering"
- **Action**: User clicks the "New Issue" button
- **Expected**: The create issue modal opens with the team selector pre-set to "Engineering". The title field is focused.

#### Test: New Issue button text and icon appearance
- **Initial state**: User is authenticated, viewing team issues page
- **Expected**: The "New Issue" button is visible with text "New Issue" and displays appropriately (e.g., with a plus icon). The button uses the primary accent style.

#### Test: Newly created issue appears in the list
- **Initial state**: User is authenticated, viewing team issues for "Engineering" with 3 issues
- **Action**: User clicks "New Issue", fills in the title "New feature request" with status "Backlog", and submits the form
- **Expected**: The modal closes. The new issue appears in the "Backlog" group with the next sequential identifier (e.g., ENG-44). The group count updates.

### BulkActions

#### Test: Issue row checkboxes are visible and unchecked by default
- **Initial state**: User is authenticated, viewing team issues with 5 issues
- **Expected**: Each issue row has a checkbox on the left side. All checkboxes are unchecked by default.

#### Test: Clicking a checkbox selects an issue
- **Initial state**: User is authenticated, viewing team issues with ENG-42 unchecked
- **Action**: User clicks the checkbox on ENG-42
- **Expected**: The checkbox becomes checked. The issue row has a selected visual style (e.g., highlighted background). A bulk action toolbar appears at the top or bottom of the list.

#### Test: Clicking a checked checkbox deselects the issue
- **Initial state**: User is authenticated, ENG-42 checkbox is checked, bulk action toolbar is visible
- **Action**: User clicks the checkbox on ENG-42 again
- **Expected**: The checkbox becomes unchecked. The selected visual style is removed from the row. If no other issues are selected, the bulk action toolbar disappears.

#### Test: Multiple issues can be selected via checkboxes
- **Initial state**: User is authenticated, viewing team issues with ENG-42, ENG-43, ENG-44
- **Action**: User clicks checkboxes on ENG-42 and ENG-44
- **Expected**: Both ENG-42 and ENG-44 are checked with selected visual style. ENG-43 remains unchecked. The bulk action toolbar shows "2 selected" or similar count indicator.

#### Test: Bulk action toolbar appears when issues are selected
- **Initial state**: User is authenticated, no issues selected, no bulk action toolbar visible
- **Action**: User clicks the checkbox on ENG-42
- **Expected**: A bulk action toolbar appears showing the selection count ("1 selected") and action buttons for: Status change, Priority change, Assignee change, and Label change.

#### Test: Bulk action toolbar disappears when all issues are deselected
- **Initial state**: User is authenticated, ENG-42 is selected, bulk action toolbar is visible
- **Action**: User unchecks ENG-42
- **Expected**: The bulk action toolbar disappears. No action buttons are visible.

#### Test: Bulk status change updates all selected issues
- **Initial state**: User is authenticated, ENG-42 (status "Todo") and ENG-43 (status "Backlog") are selected via checkboxes
- **Action**: User clicks the "Status" action in the bulk toolbar, selects "In Progress" from the dropdown
- **Expected**: Both ENG-42 and ENG-43 are updated to "In Progress" status. They move to the "In Progress" group. The changes are persisted to the database. The checkboxes are deselected and the bulk toolbar disappears.

#### Test: Bulk priority change updates all selected issues
- **Initial state**: User is authenticated, ENG-42 (priority "Low") and ENG-43 (priority "Medium") are selected
- **Action**: User clicks the "Priority" action in the bulk toolbar, selects "High" from the dropdown
- **Expected**: Both issues are updated to "High" priority. The priority icons change to orange arrow-up on both rows. Changes are persisted to the database.

#### Test: Bulk assignee change updates all selected issues
- **Initial state**: User is authenticated, ENG-42 (assigned to Alice) and ENG-43 (unassigned) are selected
- **Action**: User clicks the "Assignee" action in the bulk toolbar, selects "Bob" from the member selector
- **Expected**: Both issues are now assigned to Bob. The assignee avatars update on both rows. Changes are persisted to the database.

#### Test: Bulk label change updates all selected issues
- **Initial state**: User is authenticated, ENG-42 (no labels) and ENG-43 (label "Bug") are selected
- **Action**: User clicks the "Label" action in the bulk toolbar, selects "Feature" from the label picker
- **Expected**: Both issues now have the "Feature" label. ENG-43 retains its existing "Bug" label and also gains "Feature". Label badges update on both rows. Changes are persisted.

#### Test: Bulk actions can be performed multiple times in sequence
- **Initial state**: User is authenticated, viewing team issues with multiple issues
- **Action**: User selects ENG-42 and ENG-43, bulk-changes status to "In Progress", then selects ENG-44 and ENG-45, bulk-changes priority to "High"
- **Expected**: Both bulk actions complete successfully. The first pair is in "In Progress" status, the second pair has "High" priority. The bulk toolbar appears and disappears correctly each time.

#### Test: Select all checkbox in group header selects all issues in that group
- **Initial state**: User is authenticated, "Backlog" group has 3 issues, none selected
- **Action**: User clicks a "select all" checkbox in the "Backlog" group header
- **Expected**: All 3 issues in the Backlog group are selected (checkboxes checked, selected visual style). The bulk toolbar shows "3 selected". Issues in other groups remain unselected.

#### Test: Deselect all via group header checkbox
- **Initial state**: User is authenticated, all 3 issues in "Backlog" group are selected via group header checkbox
- **Action**: User clicks the group header checkbox again
- **Expected**: All 3 issues are deselected. If no other issues are selected, the bulk toolbar disappears.

### GroupBySort

#### Test: Group by control renders with default "Status" selected
- **Initial state**: User is authenticated, viewing team issues page
- **Expected**: A "Group by" control/dropdown is visible in the toolbar area. It shows "Status" as the currently selected grouping option.

#### Test: Group by dropdown shows all grouping options
- **Initial state**: User is authenticated, viewing team issues page
- **Action**: User clicks the "Group by" control
- **Expected**: A dropdown opens showing options: Status, Priority, Assignee, Project, Label, None. Each option is clickable.

#### Test: Group by Priority groups issues under priority headers
- **Initial state**: User is authenticated, team has issues with priorities: Urgent (1), High (2), Medium (1), Low (1), No Priority (1)
- **Action**: User selects "Priority" from the Group by dropdown
- **Expected**: Issues are regrouped under priority headers: Urgent, High, Medium, Low, No Priority. Each header shows the priority icon, name, and count. Empty priority groups are not shown.

#### Test: Group by Assignee groups issues under assignee headers
- **Initial state**: User is authenticated, team has issues assigned to Alice (2), Bob (1), and unassigned (1)
- **Action**: User selects "Assignee" from the Group by dropdown
- **Expected**: Issues are grouped under assignee name headers with their avatars. An "Unassigned" group shows issues with no assignee. Each header shows the assignee avatar, name, and issue count.

#### Test: Group by Project groups issues under project headers
- **Initial state**: User is authenticated, team has issues in project "Auth Rewrite" (2), "Dashboard v2" (1), and no project (1)
- **Action**: User selects "Project" from the Group by dropdown
- **Expected**: Issues are grouped under project name headers. A "No Project" group shows unassigned issues. Each header shows the project name and issue count.

#### Test: Group by Label groups issues under label headers
- **Initial state**: User is authenticated, team has issues with labels "Bug" (2), "Feature" (1), and no labels (1)
- **Action**: User selects "Label" from the Group by dropdown
- **Expected**: Issues are grouped under label name headers with colored dots. A "No Label" group shows unlabeled issues. Issues with multiple labels appear under each applicable label group.

#### Test: Group by None shows a flat list
- **Initial state**: User is authenticated, team has 6 issues in various statuses
- **Action**: User selects "None" from the Group by dropdown
- **Expected**: All issues are displayed in a flat list without any group headers. Issues are shown in the current sort order.

#### Test: Switching group by option re-renders immediately
- **Initial state**: User is authenticated, issues are grouped by Status
- **Action**: User changes Group by from "Status" to "Priority"
- **Expected**: The issue list immediately re-renders with priority-based grouping. No page reload is needed. The transition is smooth.

#### Test: Group by can be changed multiple times
- **Initial state**: User is authenticated, viewing team issues
- **Action**: User selects "Priority" grouping, then "Assignee", then back to "Status"
- **Expected**: Each change correctly re-groups the issues. After returning to "Status", the view matches the original default grouping.

#### Test: Sort by control renders with default option
- **Initial state**: User is authenticated, viewing team issues page
- **Expected**: A "Sort by" control/dropdown is visible in the toolbar area, showing the current sort option.

#### Test: Sort by dropdown shows all sorting options
- **Initial state**: User is authenticated, viewing team issues page
- **Action**: User clicks the "Sort by" control
- **Expected**: A dropdown opens showing options: Priority, Created date, Updated date, Status. Each option is clickable.

#### Test: Sort by Priority orders issues by priority level
- **Initial state**: User is authenticated, team has issues with mixed priorities within status groups
- **Action**: User selects "Priority" from the Sort by dropdown
- **Expected**: Within each group, issues are ordered by priority: Urgent first, then High, Medium, Low, No Priority last.

#### Test: Sort by Created date orders issues by creation time
- **Initial state**: User is authenticated, team has issues created at different times
- **Action**: User selects "Created date" from the Sort by dropdown
- **Expected**: Within each group, issues are ordered by creation date (newest first).

#### Test: Sort by Updated date orders issues by last update time
- **Initial state**: User is authenticated, team has issues updated at different times
- **Action**: User selects "Updated date" from the Sort by dropdown
- **Expected**: Within each group, issues are ordered by last update time (most recently updated first).

#### Test: Sort by Status orders issues by status progression
- **Initial state**: User is authenticated, group by is set to "None" (flat list)
- **Action**: User selects "Status" from the Sort by dropdown
- **Expected**: Issues are ordered by status progression: Backlog, Todo, In Progress, In Review, Done, Cancelled.

#### Test: Sort works correctly within groups
- **Initial state**: User is authenticated, grouped by Status, "In Progress" group has 3 issues with different priorities
- **Action**: User selects "Priority" from Sort by
- **Expected**: The 3 issues within the "In Progress" group are reordered by priority (Urgent first, No Priority last). Other groups are similarly sorted.

#### Test: Sort by can be changed multiple times
- **Initial state**: User is authenticated, viewing team issues
- **Action**: User sorts by "Priority", then by "Created date", then by "Updated date"
- **Expected**: Each sort change correctly reorders issues within their groups. The sort control updates to reflect the current selection.

### TeamFilters

#### Test: Team filters toolbar renders with all filter options
- **Initial state**: User is authenticated, viewing `/team/eng-1/issues`
- **Expected**: A toolbar at the top of the issue list displays filter controls: "Status", "Priority", "Assignee", "Label", "Project", and "Cycle" filters. Each shows as a button/chip that can be clicked to open a dropdown.

#### Test: Status filter dropdown shows all statuses with icons
- **Initial state**: User is authenticated, viewing team issues
- **Action**: User clicks the "Status" filter button
- **Expected**: A multi-select dropdown opens showing all statuses: Backlog (dotted circle, gray), Todo (circle, gray), In Progress (half circle, yellow), In Review (three-quarter circle, blue), Done (check circle, green), Cancelled (x-circle, red). Each option has a checkbox.

#### Test: Status filter filters issues by selected statuses
- **Initial state**: User is authenticated, team has issues in Backlog (3), In Progress (2), Done (1)
- **Action**: User opens the Status filter and selects only "In Progress"
- **Expected**: Only the "In Progress" group is displayed with its 2 issues. Backlog and Done groups are hidden. The Status filter button shows a visual indicator that a filter is active.

#### Test: Priority filter dropdown shows all priorities with icons
- **Initial state**: User is authenticated, viewing team issues
- **Action**: User clicks the "Priority" filter button
- **Expected**: A multi-select dropdown opens showing: Urgent (alert-triangle, red), High (arrow-up, orange), Medium (minus, yellow), Low (arrow-down, blue), No Priority (dots-horizontal, gray). Each option has a checkbox.

#### Test: Priority filter filters issues by selected priorities
- **Initial state**: User is authenticated, team has issues with priorities High (2), Medium (1), Low (1)
- **Action**: User opens Priority filter and selects "High"
- **Expected**: Only issues with High priority are displayed across all status groups. Issues with Medium and Low priority are hidden.

#### Test: Assignee filter dropdown shows all team members
- **Initial state**: User is authenticated, team "Engineering" has members Alice, Bob, and Charlie
- **Action**: User clicks the "Assignee" filter button
- **Expected**: A multi-select dropdown opens showing all team members with their avatars and names: Alice, Bob, Charlie, and an "Unassigned" option. Each option has a checkbox.

#### Test: Assignee filter filters issues by selected assignees
- **Initial state**: User is authenticated, team has issues: ENG-1 (Alice), ENG-2 (Bob), ENG-3 (Alice), ENG-4 (unassigned)
- **Action**: User opens Assignee filter and selects "Alice"
- **Expected**: Only issues assigned to Alice are shown (ENG-1 and ENG-3). Issues assigned to Bob and unassigned issues are hidden.

#### Test: Label filter dropdown shows all available labels
- **Initial state**: User is authenticated, workspace has labels "Bug" (red), "Feature" (green), "Improvement" (blue)
- **Action**: User clicks the "Label" filter button
- **Expected**: A multi-select dropdown opens showing all workspace labels with their colored dots and names. Each option has a checkbox.

#### Test: Label filter filters issues by selected labels
- **Initial state**: User is authenticated, team has issues: ENG-1 (labeled "Bug"), ENG-2 (labeled "Feature"), ENG-3 (labeled "Bug", "Feature")
- **Action**: User opens Label filter and selects "Bug"
- **Expected**: Only issues with the "Bug" label are shown (ENG-1 and ENG-3). ENG-2 is hidden.

#### Test: Project filter dropdown shows all team projects
- **Initial state**: User is authenticated, team has projects "Auth Rewrite" and "Dashboard v2"
- **Action**: User clicks the "Project" filter button
- **Expected**: A multi-select dropdown opens showing "Auth Rewrite", "Dashboard v2", and a "No Project" option. Each has a checkbox.

#### Test: Project filter filters issues by selected projects
- **Initial state**: User is authenticated, team has issues: ENG-1 (project "Auth Rewrite"), ENG-2 (project "Dashboard v2"), ENG-3 (no project)
- **Action**: User opens Project filter and selects "Auth Rewrite"
- **Expected**: Only ENG-1 is shown. ENG-2 and ENG-3 are hidden.

#### Test: Cycle filter dropdown shows team cycles
- **Initial state**: User is authenticated, team has cycles "Sprint 1" (active), "Sprint 2" (upcoming)
- **Action**: User clicks the "Cycle" filter button
- **Expected**: A multi-select dropdown opens showing "Sprint 1", "Sprint 2", and a "No Cycle" option. The active cycle is visually indicated. Each option has a checkbox.

#### Test: Cycle filter filters issues by selected cycle
- **Initial state**: User is authenticated, team has issues: ENG-1 (in "Sprint 1"), ENG-2 (in "Sprint 1"), ENG-3 (no cycle)
- **Action**: User opens Cycle filter and selects "Sprint 1"
- **Expected**: Only issues in Sprint 1 are shown (ENG-1 and ENG-2). ENG-3 is hidden.

#### Test: Multiple filters combine with AND logic
- **Initial state**: User is authenticated, team has issues: ENG-1 (High priority, Bug label, In Progress), ENG-2 (High priority, Feature label, In Progress), ENG-3 (Low priority, Bug label, Backlog)
- **Action**: User selects "High" in Priority filter and "Bug" in Label filter
- **Expected**: Only ENG-1 is shown (matches both High priority AND Bug label). ENG-2 and ENG-3 are hidden.

#### Test: Clearing a filter restores all issues
- **Initial state**: User has Status filter set to "In Progress" only, showing 2 issues out of 6 total
- **Action**: User opens Status filter and deselects "In Progress" (or clicks a "Clear" option)
- **Expected**: All 6 issues are shown again across all status groups, same as the unfiltered view.

#### Test: Filter state shows active filter indicators
- **Initial state**: User is authenticated, no filters applied
- **Action**: User selects "High" in Priority filter
- **Expected**: The Priority filter button shows a visual indicator that it is active (e.g., highlighted background, badge showing "1", or different styling). Other filter buttons remain in their default/inactive state.

#### Test: Filters can be used repeatedly after clearing
- **Initial state**: User is authenticated with multiple issues at various statuses and priorities
- **Action**: User applies Priority filter for "High", clears it, then applies Assignee filter for "Alice", clears it, then applies Status filter for "Done"
- **Expected**: Each filter application and clearing works correctly. After the final action, only "Done" issues are shown. All filter controls remain responsive and functional through multiple interactions.

#### Test: Filters work correctly with grouping options
- **Initial state**: User is authenticated, issues grouped by Priority, Assignee filter set to "Alice"
- **Expected**: Only Alice's issues are shown, grouped under their respective priority headers. Empty priority groups (where Alice has no issues) are not displayed.

#### Test: Filters persist while navigating within the page
- **Initial state**: User has Status filter set to "In Progress", viewing filtered results
- **Action**: User clicks an issue title to view detail, then navigates back to `/team/eng-1/issues`
- **Expected**: The filters are still applied showing only "In Progress" issues. The filter state is preserved across navigation.

#### Test: Assignee filter allows multi-select
- **Initial state**: User is authenticated, team has issues assigned to Alice (2), Bob (1), Charlie (1)
- **Action**: User opens Assignee filter, checks "Alice" and "Bob"
- **Expected**: Issues assigned to Alice and Bob are shown. Charlie's issues are hidden. The filter button indicates 2 assignees selected.

## Issue Detail Page (`/issue/:issueId`)

**Components**: IssueHeader, IssueDescription, SubIssues, ActivityComments, IssueSidebar

### IssueHeader

#### Test: Issue header renders identifier and title
- **Initial state**: User navigates to `/issue/:issueId` for an existing issue with identifier "ENG-42" and title "Fix login bug"
- **Expected**: The header displays the issue identifier "ENG-42" and the title "Fix login bug" in large font. The identifier is non-editable. The status selector is visible below the title showing the current status with its icon and color.

#### Test: Inline edit issue title
- **Initial state**: User is on the issue detail page for issue "ENG-42" with title "Fix login bug"
- **Action**: User clicks on the title text "Fix login bug"
- **Expected**: The title becomes an editable text input pre-filled with "Fix login bug". The input is focused and ready for editing.

#### Test: Save edited issue title
- **Initial state**: User has clicked the title and it is in edit mode, showing "Fix login bug"
- **Action**: User clears the field, types "Fix authentication bug", and presses Enter (or clicks away to blur)
- **Expected**: The title updates to "Fix authentication bug". The change is persisted to the database. The title returns to display mode. An activity entry is created recording the title change.

#### Test: Cancel title edit on Escape
- **Initial state**: User has clicked the title and it is in edit mode, showing "Fix login bug"
- **Action**: User types some characters, then presses Escape
- **Expected**: The title reverts to the original "Fix login bug" without saving. The field returns to display mode.

#### Test: Title edit validates non-empty
- **Initial state**: User has clicked the title and it is in edit mode
- **Action**: User clears the title field completely and presses Enter
- **Expected**: A validation error is shown (e.g., red border or tooltip) indicating the title cannot be empty. The original title is preserved.

#### Test: Inline status selector displays current status
- **Initial state**: User is on the issue detail page for an issue with status "In Progress"
- **Expected**: The status selector below the title shows a half-circle icon in yellow and the text "In Progress".

#### Test: Change status via inline selector
- **Initial state**: User is on the issue detail page for an issue with status "Todo"
- **Action**: User clicks the status selector
- **Expected**: A dropdown appears showing all statuses (Backlog, Todo, In Progress, In Review, Done, Cancelled) each with their respective icon and color.

#### Test: Select new status from dropdown
- **Initial state**: The status dropdown is open, current status is "Todo"
- **Action**: User clicks "In Progress" in the dropdown
- **Expected**: The dropdown closes. The status selector updates to show the half-circle icon in yellow with text "In Progress". The change is persisted to the database. An activity entry is created recording the status change from "Todo" to "In Progress". A notification is created for subscribers of this issue.

#### Test: Status dropdown closes on outside click
- **Initial state**: The status dropdown is open
- **Action**: User clicks outside the dropdown
- **Expected**: The dropdown closes without changing the status.

#### Test: Issue detail page shows correct layout with left and right panels
- **Initial state**: User navigates to `/issue/:issueId` for an existing issue
- **Expected**: The page displays a two-panel layout: the left panel (~70% width) contains the issue header, description, sub-issues, and activity/comments sections. The right panel (~30% width) contains the sidebar with issue properties.

### IssueDescription

#### Test: Description renders markdown content
- **Initial state**: User is on the issue detail page for an issue with a markdown description containing headings, bold text, code blocks, and bullet lists
- **Expected**: The description area renders the markdown as formatted HTML — headings are styled, bold text is bold, code blocks have monospace font with background, and bullet lists are properly indented.

#### Test: Description shows placeholder when empty
- **Initial state**: User is on the issue detail page for an issue with no description
- **Expected**: The description area shows a placeholder text (e.g., "Add a description...") in muted/gray text, indicating it is clickable to add content.

#### Test: Click to edit description
- **Initial state**: User is on the issue detail page with a description "This is a bug in the login flow"
- **Action**: User clicks on the description text
- **Expected**: The description changes to an editable rich text area (supporting markdown) pre-filled with the existing markdown content. The editor is focused and ready for editing.

#### Test: Save edited description
- **Initial state**: User has clicked the description and it is in edit mode showing "This is a bug in the login flow"
- **Action**: User changes the text to "This is a critical bug in the authentication flow that affects all users" and clicks outside the editor (or presses a save shortcut)
- **Expected**: The description updates to show the new rendered markdown. The change is persisted to the database. An activity entry is created recording the description change.

#### Test: Description supports markdown formatting
- **Initial state**: User has clicked the description and it is in edit mode
- **Action**: User types "## Steps to reproduce\n1. Go to login\n2. Enter invalid password\n3. **Error message** is missing" and saves
- **Expected**: The rendered description shows "Steps to reproduce" as a heading, a numbered list with three items, and "Error message" in bold.

#### Test: Cancel description edit on Escape
- **Initial state**: User has clicked the description and it is in edit mode
- **Action**: User makes changes to the text and presses Escape
- **Expected**: The description reverts to its original content without saving. The editor returns to display mode.

#### Test: Edit description multiple times in sequence
- **Initial state**: User is on the issue detail page with a description
- **Action**: User clicks the description, edits it, saves, then clicks it again to edit a second time
- **Expected**: The second edit works correctly — the editor opens with the updated content from the first edit, and subsequent saves persist correctly.

### SubIssues

#### Test: Sub-issues section renders with heading and add button
- **Initial state**: User is on the issue detail page for a parent issue with no sub-issues
- **Expected**: The sub-issues section is visible below the description with a heading "Sub-issues" and an "Add sub-issue" button. When there are no sub-issues, a message like "No sub-issues" is displayed.

#### Test: Sub-issues list displays child issues
- **Initial state**: A parent issue "ENG-10" has two sub-issues: "ENG-11" (title: "Design login form", status: "Done") and "ENG-12" (title: "Implement validation", status: "In Progress")
- **Expected**: The sub-issues section displays both child issues in a list. Each sub-issue row shows the issue identifier (e.g., "ENG-11"), title (clickable), status icon with color, and priority icon. "ENG-11" shows a green check-circle (Done) and "ENG-12" shows a yellow half-circle (In Progress).

#### Test: Click sub-issue navigates to its detail page
- **Initial state**: Parent issue "ENG-10" has sub-issue "ENG-11" displayed in the list
- **Action**: User clicks on the title "Design login form" of sub-issue "ENG-11"
- **Expected**: User is navigated to `/issue/ENG-11` (the detail page for the sub-issue). The sub-issue detail page loads showing its full details including a reference to its parent issue.

#### Test: Add sub-issue button opens create issue modal
- **Initial state**: User is on the issue detail page for issue "ENG-10"
- **Action**: User clicks the "Add sub-issue" button
- **Expected**: The create issue modal opens with the parent issue field pre-filled with "ENG-10". The team selector defaults to the same team as the parent issue. All other fields are in their default state.

#### Test: Newly created sub-issue appears in the list
- **Initial state**: User clicked "Add sub-issue", the create issue modal is open with parent set to "ENG-10"
- **Action**: User fills in title "Write unit tests", sets status to "Todo", and clicks "Create Issue"
- **Expected**: The modal closes. The new sub-issue (e.g., "ENG-13 Write unit tests") appears in the sub-issues list with a gray circle (Todo) status icon. The sub-issue is persisted with its parent reference.

#### Test: Sub-issue status icon updates when status changes
- **Initial state**: Sub-issue "ENG-12" has status "In Progress" (yellow half-circle) and is displayed in the parent's sub-issues list
- **Action**: User navigates to "ENG-12", changes its status to "Done", and navigates back to the parent issue
- **Expected**: The sub-issue "ENG-12" now shows a green check-circle (Done) icon in the parent's sub-issues list.

#### Test: Multiple sub-issues display in correct order
- **Initial state**: Parent issue has 4 sub-issues created in order: ENG-11, ENG-12, ENG-13, ENG-14
- **Expected**: All 4 sub-issues are displayed in the list in a consistent order (e.g., by creation date or identifier).

### ActivityComments

#### Test: Activity/Comments section renders with tab toggle
- **Initial state**: User is on the issue detail page, scrolled to the bottom of the left panel
- **Expected**: The Activity/Comments section is visible with two tab buttons: "Activity" and "Comments". One tab is active (visually highlighted). A comment input box with a "Comment" button is visible at the bottom.

#### Test: Activity tab shows chronological history
- **Initial state**: An issue has had its status changed from "Backlog" to "Todo", then assignee changed from unassigned to "Alice", then priority changed from "No Priority" to "High"
- **Action**: User clicks the "Activity" tab
- **Expected**: The activity tab displays three chronological entries: (1) status change from Backlog to Todo with timestamp and actor name, (2) assignee change to Alice with timestamp and actor name, (3) priority change to High with timestamp and actor name. Each entry shows the actor's avatar, their name, a description of the change, and a relative timestamp. Entries are ordered oldest first (top) to newest (bottom).

#### Test: Comments tab shows user comments
- **Initial state**: An issue has two comments: one by "Alice" saying "I'll look into this" posted 2 hours ago, and one by "Bob" saying "Found the root cause" posted 1 hour ago
- **Action**: User clicks the "Comments" tab
- **Expected**: Two comments are displayed, each showing the author's avatar, name, relative timestamp (e.g., "2h ago", "1h ago"), and the comment content. Comments are ordered oldest first.

#### Test: Add a new comment
- **Initial state**: User is on the issue detail page with the comments section visible. The comment input box is empty.
- **Action**: User types "This should be fixed in the next sprint" in the comment input and clicks the "Comment" button
- **Expected**: The new comment appears at the bottom of the comments list showing the current user's avatar, name, "just now" as the timestamp, and the comment text "This should be fixed in the next sprint". The comment input is cleared. The comment is persisted to the database. A notification is created for subscribers of this issue.

#### Test: Comment button is disabled when input is empty
- **Initial state**: User is on the issue detail page, the comment input box is empty
- **Expected**: The "Comment" button is disabled (grayed out, not clickable).

#### Test: Comment button enables when text is entered
- **Initial state**: User is on the issue detail page, the comment input box is empty and the button is disabled
- **Action**: User types "Test comment" in the comment input
- **Expected**: The "Comment" button becomes enabled (visually active, clickable).

#### Test: Submit comment via Enter key
- **Initial state**: User has typed "Quick fix needed" in the comment input
- **Action**: User presses Enter (or Ctrl+Enter / Cmd+Enter depending on implementation)
- **Expected**: The comment is submitted and appears in the comments list. The input is cleared.

#### Test: Switch between Activity and Comments tabs
- **Initial state**: User is on the "Comments" tab viewing comments
- **Action**: User clicks the "Activity" tab
- **Expected**: The view switches to show activity history entries. The "Activity" tab is now visually highlighted and "Comments" tab is not. Clicking "Comments" again switches back to the comments view with all comments still visible.

#### Test: Activity tab updates when issue properties change
- **Initial state**: User is on the issue detail page with the "Activity" tab selected, showing 2 existing activity entries
- **Action**: User changes the issue status from "Todo" to "In Progress" via the status selector
- **Expected**: A new activity entry appears at the bottom of the activity list showing "changed status from Todo to In Progress" with the current user's name, avatar, and "just now" timestamp. The total count is now 3 entries.

#### Test: Add multiple comments in sequence
- **Initial state**: User is on the issue detail page with the Comments tab active
- **Action**: User types "First comment" and clicks "Comment", then types "Second comment" and clicks "Comment"
- **Expected**: Both comments appear in the list in order. The input clears after each submission. Both comments are persisted correctly.

#### Test: Comment displays long text properly
- **Initial state**: User is on the issue detail page
- **Action**: User types a long comment (multiple paragraphs) and submits it
- **Expected**: The comment is displayed with proper text wrapping and paragraph spacing. No content is truncated or overflows the container.

### IssueSidebar

#### Test: Sidebar renders all property fields
- **Initial state**: User is on the issue detail page for an issue with status "In Progress", priority "High", assignee "Alice", labels ["Bug", "Frontend"], project "Auth Rewrite", cycle "Sprint 3", due date "2026-04-01"
- **Expected**: The right sidebar displays all property fields: Status showing "In Progress" with half-circle yellow icon, Priority showing "High" with orange arrow-up icon, Assignee showing "Alice" with avatar, Labels showing "Bug" and "Frontend" as colored badges, Project showing "Auth Rewrite", Cycle showing "Sprint 3", Due Date showing "Apr 1, 2026", Created timestamp (read-only), and Updated timestamp (read-only).

#### Test: Change status via sidebar dropdown
- **Initial state**: Issue has status "Todo". User is on the issue detail page.
- **Action**: User clicks the Status field in the sidebar
- **Expected**: A dropdown appears listing all statuses (Backlog, Todo, In Progress, In Review, Done, Cancelled) with their respective icons and colors.

#### Test: Select new status in sidebar
- **Initial state**: The status dropdown is open in the sidebar, current status is "Todo"
- **Action**: User clicks "Done"
- **Expected**: The dropdown closes. Status updates to "Done" with a green check-circle icon. The change is persisted. An activity entry is created. The inline status selector in the header also updates to "Done".

#### Test: Change priority via sidebar dropdown
- **Initial state**: Issue has priority "Medium". User is on the issue detail page.
- **Action**: User clicks the Priority field in the sidebar
- **Expected**: A dropdown appears listing all priorities (Urgent, High, Medium, Low, No Priority) with their respective icons and colors.

#### Test: Select new priority in sidebar
- **Initial state**: The priority dropdown is open, current priority is "Medium"
- **Action**: User clicks "Urgent"
- **Expected**: The dropdown closes. Priority updates to "Urgent" with a red alert-triangle icon. The change is persisted. An activity entry is created recording the priority change from "Medium" to "Urgent".

#### Test: Change assignee via searchable selector
- **Initial state**: Issue is unassigned. The workspace has members "Alice", "Bob", and "Charlie".
- **Action**: User clicks the Assignee field in the sidebar
- **Expected**: A searchable dropdown appears showing all workspace members with their avatars and names.

#### Test: Search and select assignee
- **Initial state**: The assignee dropdown is open showing all members
- **Action**: User types "Ali" in the search field
- **Expected**: The list filters to show only "Alice". User clicks "Alice".
- **Action**: User clicks "Alice"
- **Expected**: The dropdown closes. Assignee updates to show Alice's avatar and name. The change is persisted. An activity entry is created. A notification is sent to Alice that she was assigned to this issue.

#### Test: Remove assignee
- **Initial state**: Issue is assigned to "Alice"
- **Action**: User clicks the Assignee field, then clicks an "Unassign" or clear option
- **Expected**: The assignee is removed. The field shows as unassigned (e.g., "No assignee" or empty avatar placeholder). The change is persisted. An activity entry is created.

#### Test: Add labels via multi-select picker
- **Initial state**: Issue has no labels. Available labels include "Bug" (red), "Feature" (green), "Improvement" (blue).
- **Action**: User clicks the Labels field in the sidebar
- **Expected**: A multi-select dropdown appears showing all available labels with their colored dots and names. No labels are checked.

#### Test: Select multiple labels
- **Initial state**: The labels picker is open, no labels selected
- **Action**: User clicks "Bug", then clicks "Frontend"
- **Expected**: Both "Bug" and "Frontend" are checked in the dropdown. The sidebar field updates to show both labels as colored badges. The changes are persisted. Activity entries are created for each label addition.

#### Test: Remove a label
- **Initial state**: Issue has labels "Bug" and "Frontend". The labels picker is open.
- **Action**: User unchecks "Bug"
- **Expected**: "Bug" is removed from the issue. Only "Frontend" badge remains in the sidebar. The change is persisted. An activity entry is created recording the label removal.

#### Test: Change project via searchable selector
- **Initial state**: Issue has no project assigned. Available projects include "Auth Rewrite", "Performance Optimization", "Mobile App".
- **Action**: User clicks the Project field in the sidebar
- **Expected**: A searchable dropdown appears listing available projects.

#### Test: Search and select project
- **Initial state**: The project dropdown is open
- **Action**: User types "Auth" in the search field, then clicks "Auth Rewrite"
- **Expected**: The dropdown closes. Project updates to show "Auth Rewrite". The change is persisted. An activity entry is created.

#### Test: Remove project assignment
- **Initial state**: Issue is assigned to project "Auth Rewrite"
- **Action**: User clicks the Project field, then clicks a "Remove" or clear option
- **Expected**: The project is unassigned. The field shows as empty (e.g., "No project"). The change is persisted. An activity entry is created.

#### Test: Change cycle via dropdown
- **Initial state**: Issue belongs to team "Engineering" which has cycles "Sprint 2" (completed), "Sprint 3" (active), "Sprint 4" (upcoming). Issue has no cycle assigned.
- **Action**: User clicks the Cycle field in the sidebar
- **Expected**: A dropdown appears showing available cycles for the team: "Sprint 2", "Sprint 3", "Sprint 4" with their date ranges.

#### Test: Select cycle
- **Initial state**: The cycle dropdown is open
- **Action**: User clicks "Sprint 3"
- **Expected**: The dropdown closes. Cycle updates to show "Sprint 3". The change is persisted. An activity entry is created.

#### Test: Change due date via date picker
- **Initial state**: Issue has no due date set
- **Action**: User clicks the Due Date field in the sidebar
- **Expected**: A date picker opens allowing the user to select a date.

#### Test: Select due date
- **Initial state**: The date picker is open
- **Action**: User selects April 15, 2026
- **Expected**: The date picker closes. Due Date updates to show "Apr 15, 2026". The change is persisted. An activity entry is created.

#### Test: Clear due date
- **Initial state**: Issue has due date "Apr 15, 2026"
- **Action**: User clicks the Due Date field and clicks a "Clear" or remove option
- **Expected**: The due date is removed. The field shows as empty (e.g., "No due date"). The change is persisted. An activity entry is created.

#### Test: Created and Updated timestamps are read-only
- **Initial state**: User is on the issue detail page. The issue was created on "Mar 10, 2026" and last updated "Mar 14, 2026".
- **Expected**: The Created field shows "Mar 10, 2026" (or relative time like "4 days ago") and the Updated field shows "Mar 14, 2026" (or "today"). Both fields are not clickable/editable — they have no hover cursor change or click handler.

#### Test: Sidebar dropdowns close on outside click
- **Initial state**: The priority dropdown is open in the sidebar
- **Action**: User clicks outside the dropdown (e.g., on the description area)
- **Expected**: The dropdown closes without changing the priority value.

#### Test: Use assignee selector multiple times in sequence
- **Initial state**: Issue is assigned to "Alice"
- **Action**: User clicks the Assignee field, selects "Bob", then immediately clicks the Assignee field again and selects "Charlie"
- **Expected**: The assignee correctly updates to "Charlie" after the second selection. Both changes create separate activity entries. The search input resets between uses.

## Create Issue Modal

**Components**: CreateIssueForm, CreateIssueActions

### CreateIssueForm

#### Test: Create issue modal renders with all form fields
- **Initial state**: User is on Team Issues page for team "Engineering"
- **Expected**: Modal displays: Team selector dropdown, Title text input, Description text area, Status dropdown, Priority dropdown, Assignee searchable selector, Labels multi-select, Project searchable selector, Cycle dropdown, Due date picker, and Parent issue searchable selector. All fields are visible and properly labeled.

#### Test: Modal opens from New Issue button on team issues page
- **Initial state**: User is on `/team/:teamId/issues` for team "Engineering"
- **Action**: User clicks the "New Issue" button
- **Expected**: The create issue modal opens as an overlay. The Team selector is pre-selected to "Engineering". The Title input is focused.

#### Test: Modal opens from keyboard shortcut C
- **Initial state**: User is on `/my-issues`, no input fields are focused
- **Action**: User presses "C" key
- **Expected**: The create issue modal opens as an overlay.

#### Test: Team selector defaults to current team context
- **Initial state**: User opens create issue modal from team "Design" issues page
- **Expected**: The Team selector dropdown shows "Design" as the selected value.

#### Test: Team selector allows changing team
- **Initial state**: Create issue modal is open with team "Engineering" pre-selected. Teams "Engineering" and "Design" exist.
- **Action**: User clicks the Team selector dropdown and selects "Design"
- **Expected**: Team selector now shows "Design". The Cycle dropdown updates to show "Design" team's cycles instead of "Engineering" team's cycles.

#### Test: Title field is required
- **Initial state**: Create issue modal is open
- **Action**: User leaves the Title field empty and attempts to submit
- **Expected**: A validation error appears indicating that title is required. The issue is not created.

#### Test: Title field accepts text input
- **Initial state**: Create issue modal is open
- **Action**: User types "Implement user authentication" in the Title field
- **Expected**: The Title field displays "Implement user authentication".

#### Test: Description field supports markdown text entry
- **Initial state**: Create issue modal is open
- **Action**: User types "## Overview\nThis issue covers the auth flow" in the Description text area
- **Expected**: The Description field accepts and displays the markdown text.

#### Test: Status dropdown defaults to Backlog
- **Initial state**: Create issue modal is open
- **Expected**: The Status dropdown shows "Backlog" with a dotted circle icon in gray as the default selected value.

#### Test: Status dropdown shows all status options with icons
- **Initial state**: Create issue modal is open
- **Action**: User clicks the Status dropdown
- **Expected**: Dropdown shows all statuses: Backlog (dotted circle, gray), Todo (circle, gray), In Progress (half circle, yellow), In Review (three-quarter circle, blue), Done (check circle, green), Cancelled (x-circle, red).

#### Test: Status dropdown allows selecting a different status
- **Initial state**: Create issue modal is open, Status shows "Backlog"
- **Action**: User clicks Status dropdown and selects "Todo"
- **Expected**: Status dropdown now shows "Todo" with circle icon in gray.

#### Test: Priority dropdown defaults to No Priority
- **Initial state**: Create issue modal is open
- **Expected**: The Priority dropdown shows "No Priority" with dots-horizontal icon in gray as the default value.

#### Test: Priority dropdown shows all priority options with icons
- **Initial state**: Create issue modal is open
- **Action**: User clicks the Priority dropdown
- **Expected**: Dropdown shows: Urgent (alert-triangle, red), High (arrow-up, orange), Medium (minus, yellow), Low (arrow-down, blue), No Priority (dots-horizontal, gray).

#### Test: Priority dropdown allows selecting a priority
- **Initial state**: Create issue modal is open, Priority shows "No Priority"
- **Action**: User clicks Priority dropdown and selects "High"
- **Expected**: Priority dropdown now shows "High" with arrow-up icon in orange.

#### Test: Assignee selector is searchable
- **Initial state**: Create issue modal is open. Workspace has members "Alice Smith", "Bob Jones", "Carol Lee".
- **Action**: User clicks the Assignee selector and types "Ali"
- **Expected**: The selector filters to show only "Alice Smith" with her avatar.

#### Test: Assignee selector allows selecting a member
- **Initial state**: Create issue modal is open, Assignee field is empty
- **Action**: User clicks the Assignee selector, types "Bob", and clicks "Bob Jones"
- **Expected**: Assignee field shows "Bob Jones" with his avatar.

#### Test: Labels multi-select allows selecting multiple labels
- **Initial state**: Create issue modal is open. Labels "Bug", "Feature", "Improvement" exist.
- **Action**: User clicks Labels selector, selects "Bug", then selects "Feature"
- **Expected**: Both "Bug" and "Feature" appear as colored badges in the Labels field.

#### Test: Labels multi-select allows removing a selected label
- **Initial state**: Create issue modal is open with "Bug" and "Feature" labels selected
- **Action**: User clicks the remove button on the "Bug" label badge
- **Expected**: Only "Feature" remains selected in the Labels field.

#### Test: Project selector is searchable
- **Initial state**: Create issue modal is open. Projects "API Redesign", "Mobile App", "Dashboard" exist.
- **Action**: User clicks the Project selector and types "API"
- **Expected**: The selector filters to show only "API Redesign".

#### Test: Project selector allows selecting a project
- **Initial state**: Create issue modal is open, Project field is empty
- **Action**: User clicks the Project selector and selects "Mobile App"
- **Expected**: Project field shows "Mobile App".

#### Test: Cycle dropdown shows team's available cycles
- **Initial state**: Create issue modal is open with team "Engineering" selected. Team has cycles "Sprint 10" (active) and "Sprint 11" (upcoming).
- **Action**: User clicks the Cycle dropdown
- **Expected**: Dropdown shows "Sprint 10" and "Sprint 11". The active cycle is indicated.

#### Test: Cycle dropdown allows selecting a cycle
- **Initial state**: Create issue modal is open, Cycle field is empty
- **Action**: User clicks the Cycle dropdown and selects "Sprint 10"
- **Expected**: Cycle field shows "Sprint 10".

#### Test: Cycle dropdown updates when team is changed
- **Initial state**: Create issue modal is open with team "Engineering" selected showing its cycles
- **Action**: User changes team to "Design" via the Team selector
- **Expected**: The Cycle dropdown clears its selection and now shows "Design" team's cycles instead of "Engineering" cycles.

#### Test: Due date picker allows selecting a date
- **Initial state**: Create issue modal is open, Due date field is empty
- **Action**: User clicks the Due date picker and selects a date (e.g., March 25, 2026)
- **Expected**: Due date field shows "Mar 25, 2026".

#### Test: Due date picker allows clearing the date
- **Initial state**: Create issue modal is open with due date "Mar 25, 2026" set
- **Action**: User clicks the clear button on the Due date field
- **Expected**: Due date field is empty again.

#### Test: Parent issue selector is searchable
- **Initial state**: Create issue modal is open. Issues "ENG-1: Setup project", "ENG-2: Design database" exist.
- **Action**: User clicks the Parent issue selector and types "Setup"
- **Expected**: The selector filters to show "ENG-1: Setup project".

#### Test: Parent issue selector allows selecting a parent
- **Initial state**: Create issue modal is open, Parent issue field is empty
- **Action**: User clicks the Parent issue selector and selects "ENG-1: Setup project"
- **Expected**: Parent issue field shows "ENG-1: Setup project".

#### Test: Assignee selector can be used multiple times
- **Initial state**: Create issue modal is open with "Alice Smith" selected as assignee
- **Action**: User clicks the Assignee selector, clears the selection, types "Bob", selects "Bob Jones", then repeats to select "Carol Lee"
- **Expected**: Assignee field shows "Carol Lee" after the final selection. Each selection correctly replaces the previous one.

#### Test: Labels selector can be used multiple times in sequence
- **Initial state**: Create issue modal is open with no labels selected
- **Action**: User selects "Bug" label, then opens the selector again and adds "Feature", then opens again and removes "Bug" and adds "Improvement"
- **Expected**: Labels field shows "Feature" and "Improvement" as colored badges.

#### Test: Status dropdown can be changed multiple times
- **Initial state**: Create issue modal is open with Status "Backlog"
- **Action**: User changes status to "Todo", then changes it to "In Progress", then back to "Backlog"
- **Expected**: Status shows "Backlog" after the final change. Each intermediate state was correctly displayed.

### CreateIssueActions

#### Test: Create Issue button is visible and styled
- **Initial state**: Create issue modal is open
- **Expected**: A "Create Issue" button is visible at the bottom of the modal with primary styling (accent color background).

#### Test: Cancel button is visible
- **Initial state**: Create issue modal is open
- **Expected**: A "Cancel" button is visible at the bottom of the modal alongside the "Create Issue" button.

#### Test: Cancel button closes the modal
- **Initial state**: Create issue modal is open
- **Action**: User clicks the "Cancel" button
- **Expected**: The modal closes. No issue is created. The user returns to the previous page view.

#### Test: Cancel button discards form data
- **Initial state**: Create issue modal is open. User has entered title "Draft issue" and selected priority "High".
- **Action**: User clicks "Cancel", then opens the create issue modal again
- **Expected**: The modal opens with all fields reset to defaults (empty title, Backlog status, No Priority). The previously entered data is not retained.

#### Test: Create Issue button submits the form with all fields
- **Initial state**: Create issue modal is open. User has filled in: Title "Implement OAuth", Description "Add OAuth support", Status "Todo", Priority "High", Assignee "Alice Smith", Labels "Feature", Project "API Redesign", Cycle "Sprint 10", Due date "Mar 25, 2026".
- **Action**: User clicks "Create Issue"
- **Expected**: The issue is created with all specified field values. A brief confirmation showing the new issue identifier (e.g., "ENG-43") is displayed. The modal closes and the user is navigated to the issues list.

#### Test: Create Issue with only required fields
- **Initial state**: Create issue modal is open with team "Engineering" selected
- **Action**: User enters title "Quick bug fix" and clicks "Create Issue"
- **Expected**: The issue is created with title "Quick bug fix", status "Backlog", priority "No Priority", and no assignee/labels/project/cycle/due date. The new issue identifier is briefly shown. The modal closes.

#### Test: Created issue appears in the team issues list
- **Initial state**: User is on Team Issues page for "Engineering". The page shows existing issues.
- **Action**: User clicks "New Issue", enters title "New feature request", sets status to "Todo", and clicks "Create Issue"
- **Expected**: After modal closes, the Team Issues list updates to include "New feature request" under the "Todo" status group with the correct issue identifier (e.g., "ENG-44").

#### Test: Created issue with parent appears as sub-issue
- **Initial state**: Create issue modal is open. Issue "ENG-1: Setup project" exists.
- **Action**: User enters title "Write unit tests", selects "ENG-1: Setup project" as parent issue, and clicks "Create Issue"
- **Expected**: The issue is created. When navigating to "ENG-1: Setup project" detail page, "Write unit tests" appears in the sub-issues section.

#### Test: Created issue generates activity history entry
- **Initial state**: Create issue modal is open
- **Action**: User creates an issue with title "Track history" and clicks "Create Issue"
- **Expected**: When viewing the new issue's detail page, the Activity tab shows an initial "created this issue" entry with the current user's name and timestamp.

#### Test: Created issue generates inbox notification for assignee
- **Initial state**: Create issue modal is open. Current user is "Alice Smith".
- **Action**: User creates an issue with title "Review PR", assigns it to "Bob Jones", and clicks "Create Issue"
- **Expected**: When Bob Jones checks their inbox, a notification appears: "Alice Smith assigned you to [issue identifier]: Review PR" with the correct timestamp. The inbox badge count increases.

#### Test: Create Issue button is disabled during submission
- **Initial state**: Create issue modal is open with valid data entered
- **Action**: User clicks "Create Issue"
- **Expected**: The "Create Issue" button becomes disabled (to prevent duplicate submissions) while the request is processing. It re-enables after the operation completes (success or failure).

#### Test: Clicking outside the modal closes it
- **Initial state**: Create issue modal is open
- **Action**: User clicks on the overlay area outside the modal
- **Expected**: The modal closes without creating an issue.

#### Test: Pressing Escape closes the modal
- **Initial state**: Create issue modal is open
- **Action**: User presses the Escape key
- **Expected**: The modal closes without creating an issue.

#### Test: Creating multiple issues in sequence works correctly
- **Initial state**: User is on Team Issues page for "Engineering"
- **Action**: User creates issue "First task" via the modal, then opens the modal again and creates "Second task"
- **Expected**: Both issues appear in the team issues list with sequential identifiers (e.g., "ENG-43", "ENG-44"). The modal resets correctly between creations.

## Active Cycle Page (`/team/:teamId/cycles`)

**Components**: CycleList, CycleDetail, CreateCycle, BurndownChart

### CycleList

#### Test: Cycle list renders all team cycles with name, date range, progress bar, and issue count
- **Initial state**: User is authenticated, navigates to `/team/eng-1/cycles`. The "Engineering" team has 3 cycles: "Sprint 1" (Jan 1–Jan 14, 8/10 issues done), "Sprint 2" (Jan 15–Jan 28, 3/8 issues done, active), "Sprint 3" (Jan 29–Feb 11, 0/5 issues done).
- **Expected**: A list of 3 cycle rows is displayed. Each row shows the cycle name, date range (e.g., "Jan 1 – Jan 14"), a progress bar reflecting the completion percentage (e.g., 80% for Sprint 1), and the issue count (e.g., "10 issues"). Rows are ordered chronologically.

#### Test: Active cycle is visually highlighted in the list
- **Initial state**: User is on `/team/eng-1/cycles`. "Sprint 2" is the active cycle.
- **Expected**: The "Sprint 2" row has a distinct visual highlight (e.g., accent border, background color, or "Active" badge) that distinguishes it from the other cycles. Non-active cycles do not have this highlight.

#### Test: Clicking a cycle navigates to cycle detail view
- **Initial state**: User is on `/team/eng-1/cycles` viewing the cycle list.
- **Action**: User clicks on the "Sprint 2" cycle row.
- **Expected**: The cycle detail view for "Sprint 2" is displayed, showing the cycle name, date range, progress stats, issue list, and burndown chart.

#### Test: Cycle list shows empty state when team has no cycles
- **Initial state**: User is authenticated, navigates to `/team/design-1/cycles`. The "Design" team has no cycles.
- **Expected**: An empty state message is displayed (e.g., "No cycles yet. Create your first cycle to get started.") with an icon. The "New Cycle" button is still visible.

#### Test: Cycle list progress bar accurately reflects issue completion percentage
- **Initial state**: User is on `/team/eng-1/cycles`. "Sprint 1" has 8 of 10 issues done (80%), "Sprint 2" has 3 of 8 done (37.5%), "Sprint 3" has 0 of 5 done (0%).
- **Expected**: Each cycle's progress bar width corresponds to its completion percentage. Sprint 1 shows ~80% filled, Sprint 2 shows ~37.5% filled, Sprint 3 shows 0% filled (empty bar).

#### Test: Cycle list updates when a new cycle is created
- **Initial state**: User is on `/team/eng-1/cycles` with 2 existing cycles.
- **Action**: User creates a new cycle "Sprint 4" via the "New Cycle" button.
- **Expected**: The cycle list now shows 3 cycles, with "Sprint 4" appearing in the list with 0 issues and an empty progress bar.

#### Test: Clicking a different cycle after viewing one switches the detail view
- **Initial state**: User is on `/team/eng-1/cycles` and has clicked "Sprint 2" to view its detail.
- **Action**: User clicks back to the cycle list and clicks "Sprint 1".
- **Expected**: The detail view updates to show "Sprint 1" cycle information (name, date range, stats, issues, burndown chart). No stale data from "Sprint 2" is shown.

### CycleDetail

#### Test: Cycle detail view renders cycle name and date range
- **Initial state**: User is on `/team/eng-1/cycles` and clicks on "Sprint 2" (Jan 15–Jan 28).
- **Expected**: The detail view header displays the cycle name "Sprint 2" and the date range "Jan 15 – Jan 28" prominently at the top.

#### Test: Cycle detail shows progress stats (total, completed, in progress, remaining)
- **Initial state**: User views cycle detail for "Sprint 2" which has 8 total issues: 3 done, 2 in progress, 3 remaining (backlog/todo).
- **Expected**: Four progress stat cards/sections are displayed: "Total: 8", "Completed: 3", "In Progress: 2", "Remaining: 3". The stats are clearly labeled and visually distinct.

#### Test: Cycle detail shows progress bar with correct completion percentage
- **Initial state**: User views cycle detail for "Sprint 2" with 3 of 8 issues completed (37.5%).
- **Expected**: A progress bar is displayed showing approximately 37.5% completion. The percentage text "37.5%" (or "3 of 8") is visible near the progress bar.

#### Test: Cycle detail displays filtered issue list matching Team Issues layout
- **Initial state**: User views cycle detail for "Sprint 2" which has 8 issues across various statuses and priorities.
- **Expected**: An issue list is displayed below the progress stats using the same layout as the Team Issues page. Each issue row shows: priority icon, issue identifier (e.g., "ENG-42"), title (clickable), status icon, labels as colored badges, assignee avatar, due date, and project name. Issues are grouped by status by default.

#### Test: Clicking an issue in cycle detail navigates to issue detail page
- **Initial state**: User is viewing cycle detail for "Sprint 2" with issue "ENG-42" visible.
- **Action**: User clicks on the issue title "ENG-42".
- **Expected**: User is navigated to `/issue/<issueId>` showing the full issue detail page for ENG-42.

#### Test: Cycle detail issue list supports grouping by status, priority, assignee
- **Initial state**: User is viewing cycle detail for "Sprint 2" with 8 issues.
- **Action**: User changes the "Group by" option from "Status" to "Priority".
- **Expected**: Issues are regrouped by priority level (Urgent, High, Medium, Low, No Priority). Each group has a collapsible header showing the priority icon and name. Changing to "Assignee" regroups by assigned team member.

#### Test: Cycle detail issue list supports sorting
- **Initial state**: User is viewing cycle detail for "Sprint 2" with issues grouped by status.
- **Action**: User changes "Sort by" to "Priority".
- **Expected**: Issues within each group are reordered by priority (Urgent first, then High, Medium, Low, No Priority).

#### Test: Cycle detail issue list supports filtering
- **Initial state**: User is viewing cycle detail for "Sprint 2" with 8 issues. 2 issues have status "Done".
- **Action**: User opens the Status filter and selects "Done" only.
- **Expected**: The issue list shows only the 2 completed issues. Other issues are hidden. The filter is visually indicated as active.

#### Test: Cycle detail issue list supports bulk actions
- **Initial state**: User is viewing cycle detail for "Sprint 2" with multiple issues.
- **Action**: User selects checkboxes on 3 issues, then uses the bulk action to change status to "In Progress".
- **Expected**: All 3 selected issues update their status to "In Progress". The progress stats update accordingly (e.g., "In Progress" count increases by 3). Checkboxes are deselected after the action.

#### Test: Cycle detail progress stats update when an issue status changes
- **Initial state**: User is viewing cycle detail for "Sprint 2" with 3 completed and 5 remaining issues.
- **Action**: User changes one issue's status from "Todo" to "Done" via the status icon in the issue row.
- **Expected**: The progress stats update to show "Completed: 4", "Remaining: 4". The progress bar updates to reflect 4/8 = 50% completion.

#### Test: Cycle detail renders correctly for a cycle with no issues
- **Initial state**: User views a newly created cycle "Sprint 4" that has no issues.
- **Expected**: The progress stats show "Total: 0", "Completed: 0", "In Progress: 0", "Remaining: 0". The progress bar is empty (0%). The issue list shows an empty state message (e.g., "No issues in this cycle"). The burndown chart shows no data.

### CreateCycle

#### Test: "New Cycle" button is visible on the cycles page
- **Initial state**: User is authenticated, navigates to `/team/eng-1/cycles`.
- **Expected**: A "New Cycle" button is visible on the page, styled consistently with other create buttons in the app (e.g., primary accent color, plus icon or text label "New Cycle").

#### Test: Clicking "New Cycle" opens create cycle modal with correct fields
- **Initial state**: User is on `/team/eng-1/cycles`.
- **Action**: User clicks the "New Cycle" button.
- **Expected**: A modal dialog opens with: a "Name" text input field (required), a "Start date" date picker, an "End date" date picker, a "Create" button, and a "Cancel" button. The modal has a title like "New Cycle" or "Create Cycle".

#### Test: Successfully creating a cycle with all fields filled
- **Initial state**: Create cycle modal is open. Team has no active cycle.
- **Action**: User enters "Sprint 5" in the Name field, selects Feb 12 as Start date, selects Feb 25 as End date, and clicks "Create".
- **Expected**: The modal closes. The cycle list now includes "Sprint 5" with the date range "Feb 12 – Feb 25", 0 issues, and an empty progress bar. The new cycle appears in the list.

#### Test: Create cycle validates that name is required
- **Initial state**: Create cycle modal is open.
- **Action**: User leaves the Name field empty, sets start and end dates, and clicks "Create".
- **Expected**: A validation error message appears near the Name field (e.g., "Name is required"). The modal remains open. No cycle is created.

#### Test: Create cycle validates that end date is after start date
- **Initial state**: Create cycle modal is open.
- **Action**: User enters "Sprint 5" in Name, selects Feb 25 as Start date, selects Feb 12 as End date (before start), and clicks "Create".
- **Expected**: A validation error message appears (e.g., "End date must be after start date"). The modal remains open. No cycle is created.

#### Test: Create cycle validates start and end dates are required
- **Initial state**: Create cycle modal is open.
- **Action**: User enters "Sprint 5" in Name but does not set start or end dates, and clicks "Create".
- **Expected**: Validation error messages appear for both date fields (e.g., "Start date is required", "End date is required"). The modal remains open. No cycle is created.

#### Test: Cancel button closes the create cycle modal without creating
- **Initial state**: Create cycle modal is open. User has entered "Sprint 5" in the Name field.
- **Action**: User clicks "Cancel".
- **Expected**: The modal closes. No new cycle is added to the cycle list. The form data is discarded.

#### Test: Only one cycle can be active at a time per team
- **Initial state**: Team "Engineering" already has an active cycle "Sprint 2" (Jan 15–Jan 28). Create cycle modal is open.
- **Action**: User creates a new cycle "Sprint 5" with dates overlapping or within the active period.
- **Expected**: Either the system prevents setting the new cycle as active while another is active (showing an appropriate message), or the new cycle is created as inactive. Only one cycle at a time has the "active" highlight in the cycle list.

#### Test: Creating a cycle persists after page refresh
- **Initial state**: User has just created "Sprint 5" via the create cycle modal.
- **Action**: User refreshes the page.
- **Expected**: The cycle list still shows "Sprint 5" with the correct name, date range, and issue count of 0. The cycle was persisted to the database.

#### Test: Create cycle modal can be opened, cancelled, and reopened
- **Initial state**: User is on `/team/eng-1/cycles`.
- **Action**: User clicks "New Cycle", enters "Sprint X" in the Name field, clicks "Cancel". Then user clicks "New Cycle" again.
- **Expected**: The modal opens fresh with empty fields on the second open. No data from the previous attempt is retained. The modal functions correctly for creating a new cycle.

### BurndownChart

#### Test: Burndown chart renders as a bar chart showing issues completed per day
- **Initial state**: User views cycle detail for "Sprint 2" (Jan 15–Jan 28). Issues were completed on various days: Jan 15 (1 issue), Jan 17 (2 issues), Jan 20 (1 issue).
- **Expected**: A bar chart is displayed with the x-axis showing dates within the cycle range (Jan 15–Jan 28) and the y-axis showing the number of issues completed. Bars appear for Jan 15 (height 1), Jan 17 (height 2), Jan 20 (height 1). Days with no completions show no bar or a zero-height bar.

#### Test: Burndown chart shows correct date range matching the cycle
- **Initial state**: User views cycle detail for "Sprint 2" (Jan 15–Jan 28).
- **Expected**: The chart x-axis spans exactly from Jan 15 to Jan 28, matching the cycle's start and end dates. No dates outside this range are shown.

#### Test: Burndown chart updates when an issue is marked as done
- **Initial state**: User is viewing cycle detail for "Sprint 2". The burndown chart shows 3 issues completed so far. Today is Jan 22.
- **Action**: User changes an issue's status from "In Progress" to "Done".
- **Expected**: The burndown chart updates to show an additional completion for today (Jan 22). The bar for today increases by 1. The total completions reflected in the chart match the updated progress stats.

#### Test: Burndown chart shows empty state for cycle with no completed issues
- **Initial state**: User views cycle detail for a new cycle "Sprint 4" with 5 issues, all in "Todo" or "Backlog" status.
- **Expected**: The burndown chart renders with the correct date range but all bars at zero height (or an empty chart with a message like "No issues completed yet"). The chart axes and labels are still visible.

#### Test: Burndown chart has readable axis labels and chart title
- **Initial state**: User views cycle detail for "Sprint 2" with completions on multiple days.
- **Expected**: The chart has a visible title or section heading (e.g., "Burndown" or "Issues Completed per Day"). The x-axis shows date labels that are readable (not overlapping). The y-axis shows integer values for issue counts. The chart uses appropriate spacing and sizing.

#### Test: Burndown chart bar heights are proportional to issue counts
- **Initial state**: User views cycle detail for a cycle where Jan 15 had 1 completion, Jan 16 had 4 completions, and Jan 17 had 2 completions.
- **Expected**: The bar for Jan 16 is visibly taller than Jan 17, which is visibly taller than Jan 15. The relative heights accurately represent the completion counts (4:2:1 ratio).

#### Test: Burndown chart handles a cycle spanning a long date range
- **Initial state**: User views cycle detail for a cycle spanning 4 weeks (28 days) with completions spread across different days.
- **Expected**: The chart renders all 28 days on the x-axis without visual overflow. Date labels may be abbreviated or rotated to fit. All bars are visible and correctly positioned. The chart remains readable and scrollable if necessary.

## Projects Page (`/projects`)

**Components**: ProjectCard, ProjectFilters, CreateProjectModal

### ProjectCard

#### Test: Project card displays project name as clickable link
- **Initial state**: User is authenticated, viewing `/projects`. A project "Auth Rewrite" exists.
- **Expected**: The project card displays the project name "Auth Rewrite" as clickable text.
- **Action**: User clicks the project name "Auth Rewrite"
- **Expected**: User is navigated to `/project/<projectId>` for the "Auth Rewrite" project.

#### Test: Project card displays status badge with correct styling
- **Initial state**: User is authenticated, viewing `/projects`. Projects exist with statuses: "Planned", "In Progress", "Completed", "Cancelled".
- **Expected**: Each project card shows a status badge with the project's current status text. Each status has a visually distinct style (e.g., different background color or border color per status). "Planned" badge is visually different from "In Progress", "Completed", and "Cancelled".

#### Test: Project card displays lead with avatar and name
- **Initial state**: User is authenticated, viewing `/projects`. Project "Auth Rewrite" has lead "Jane Doe" with an avatar.
- **Expected**: The project card shows Jane Doe's avatar (small circular image) and name "Jane Doe" as the project lead. If no avatar is set, initials are shown instead.

#### Test: Project card displays target date
- **Initial state**: User is authenticated, viewing `/projects`. Project "Auth Rewrite" has a target date of 2026-04-15.
- **Expected**: The project card displays the target date in a readable format (e.g., "Apr 15, 2026" or "Apr 15").

#### Test: Project card displays progress bar based on issue completion
- **Initial state**: User is authenticated, viewing `/projects`. Project "Auth Rewrite" has 10 total issues, 6 completed.
- **Expected**: The project card shows a progress bar filled to 60%. The progress bar visually indicates the ratio of completed issues to total issues. A text label or tooltip shows "6/10" or "60%".

#### Test: Project card progress bar shows 0% when no issues completed
- **Initial state**: User is authenticated, viewing `/projects`. Project "New Feature" has 5 total issues, 0 completed.
- **Expected**: The progress bar is empty (0% filled). The display shows "0/5" or "0%".

#### Test: Project card progress bar shows 100% when all issues completed
- **Initial state**: User is authenticated, viewing `/projects`. Project "Bug Fixes" has 3 total issues, 3 completed.
- **Expected**: The progress bar is fully filled (100%). The display shows "3/3" or "100%". The progress bar may use a distinct color (e.g., green) to indicate completion.

#### Test: Project card displays team icons for participating teams
- **Initial state**: User is authenticated, viewing `/projects`. Project "Auth Rewrite" has issues from teams "Engineering" and "Design".
- **Expected**: The project card shows small icons or avatars representing the "Engineering" and "Design" teams, indicating which teams have issues in this project.

#### Test: Project card displays correctly with no lead assigned
- **Initial state**: User is authenticated, viewing `/projects`. Project "Research Spike" has no lead assigned.
- **Expected**: The project card either shows a placeholder (e.g., "No lead" or an empty avatar placeholder) or omits the lead field. The card does not break or show an error.

#### Test: Project card displays correctly with no target date
- **Initial state**: User is authenticated, viewing `/projects`. Project "Research Spike" has no target date set.
- **Expected**: The project card either shows "No target date" or omits the target date field. The card layout remains intact.

#### Test: Project card displays correctly with no issues
- **Initial state**: User is authenticated, viewing `/projects`. Project "New Initiative" has 0 issues.
- **Expected**: The progress bar shows 0% or is empty. The card does not show an error or division-by-zero artifact. Team icons section is empty or hidden.

#### Test: Projects page shows empty state when no projects exist
- **Initial state**: User is authenticated, viewing `/projects`. No projects exist in the workspace.
- **Expected**: A friendly empty state message is displayed with an icon (e.g., "No projects yet. Create your first project to get started.") instead of an empty grid/list.

#### Test: Projects page lists all projects across all teams
- **Initial state**: User is authenticated, viewing `/projects`. 3 projects exist: "Auth Rewrite" (Engineering), "Mobile App" (Design), "API v2" (Engineering + Design).
- **Expected**: All 3 project cards are displayed on the page. Projects from all teams are shown regardless of team membership.

#### Test: Projects page header and Create Project button are displayed
- **Initial state**: User is authenticated, viewing `/projects`
- **Expected**: The page shows a header/title "Projects" at the top. A "Create Project" button is visible in the header area.

### ProjectFilters

#### Test: Filters toolbar renders with Status, Lead, and Team filters
- **Initial state**: User is authenticated, viewing `/projects`
- **Expected**: A toolbar at the top of the project list displays three filter controls: "Status" dropdown, "Lead" dropdown, and "Team" dropdown. Each shows as a button/chip that can be clicked to open a dropdown.

#### Test: Status filter dropdown shows all project statuses
- **Initial state**: User is authenticated, viewing `/projects`
- **Action**: User clicks the "Status" filter button
- **Expected**: A dropdown opens showing all project statuses: Planned, In Progress, Completed, Cancelled. Each option has a checkbox for multi-select.

#### Test: Status filter filters projects by selected status
- **Initial state**: User is authenticated, viewing `/projects`. Projects exist: "Auth Rewrite" (In Progress), "Mobile App" (Planned), "Bug Fixes" (Completed).
- **Action**: User opens Status filter and selects "In Progress"
- **Expected**: Only "Auth Rewrite" is displayed. "Mobile App" and "Bug Fixes" are hidden. The Status filter button shows a visual indicator that a filter is active.

#### Test: Status filter allows multi-select
- **Initial state**: User is authenticated, viewing `/projects`. Projects exist with statuses: Planned (1), In Progress (1), Completed (1).
- **Action**: User opens Status filter and checks "Planned" and "In Progress"
- **Expected**: Projects with "Planned" and "In Progress" statuses are shown. "Completed" project is hidden. The filter button indicates 2 statuses selected.

#### Test: Lead filter dropdown shows all workspace members
- **Initial state**: User is authenticated, viewing `/projects`. Workspace has members "Alice", "Bob", "Charlie".
- **Action**: User clicks the "Lead" filter button
- **Expected**: A dropdown opens showing all workspace members with their avatars and names. Each option has a checkbox. A searchable input may be present to filter the member list.

#### Test: Lead filter filters projects by selected lead
- **Initial state**: User is authenticated, viewing `/projects`. "Auth Rewrite" has lead "Alice", "Mobile App" has lead "Bob", "API v2" has no lead.
- **Action**: User opens Lead filter and selects "Alice"
- **Expected**: Only "Auth Rewrite" is displayed. "Mobile App" and "API v2" are hidden. The Lead filter button shows an active indicator.

#### Test: Team filter dropdown shows all teams
- **Initial state**: User is authenticated, viewing `/projects`. Workspace has teams "Engineering" and "Design".
- **Action**: User clicks the "Team" filter button
- **Expected**: A dropdown opens showing all teams with their names. Each option has a checkbox.

#### Test: Team filter filters projects by selected team
- **Initial state**: User is authenticated, viewing `/projects`. "Auth Rewrite" has issues from Engineering only, "Mobile App" has issues from Design only, "API v2" has issues from both Engineering and Design.
- **Action**: User opens Team filter and selects "Engineering"
- **Expected**: "Auth Rewrite" and "API v2" are shown (both have Engineering team issues). "Mobile App" is hidden.

#### Test: Multiple filters combine with AND logic
- **Initial state**: User is authenticated, viewing `/projects`. "Auth Rewrite" (In Progress, lead Alice, Engineering), "Mobile App" (In Progress, lead Bob, Design), "API v2" (Planned, lead Alice, Engineering).
- **Action**: User selects "In Progress" in Status filter and "Alice" in Lead filter
- **Expected**: Only "Auth Rewrite" is shown (matches both In Progress status AND lead Alice). "Mobile App" and "API v2" are hidden.

#### Test: Clearing a filter restores all projects
- **Initial state**: User has Status filter set to "In Progress", showing 1 project
- **Action**: User opens Status filter and deselects "In Progress" (or clicks a "Clear" option)
- **Expected**: All projects are shown again, same as the unfiltered view.

#### Test: Filters can be used repeatedly after clearing
- **Initial state**: User is authenticated with multiple projects
- **Action**: User applies Status filter for "Planned", clears it, applies Lead filter for "Alice", clears it, then applies Team filter for "Design"
- **Expected**: Each filter application and clearing works correctly. After the final action, only projects with Design team issues are shown. Filters remain responsive through multiple interactions.

#### Test: Filter state shows active filter indicators
- **Initial state**: User is authenticated, no filters applied
- **Action**: User selects "In Progress" in Status filter
- **Expected**: The Status filter button shows a visual indicator that it is active (e.g., highlighted background, badge, or different styling). Lead and Team filter buttons remain in their default/inactive state.

### CreateProjectModal

#### Test: Create Project button opens the create project modal
- **Initial state**: User is authenticated, viewing `/projects`, no modal is open
- **Action**: User clicks the "Create Project" button
- **Expected**: A modal dialog opens with the title "Create Project" or similar. The modal overlays the page with a backdrop. The Name field is focused.

#### Test: Create project modal renders all required fields
- **Initial state**: User is authenticated, create project modal is open
- **Expected**: The modal displays the following fields: Name (text input, required), Description (text area), Status (dropdown), Lead (searchable member selector), Target date (date picker), Teams (multi-select). "Create Project" and "Cancel" buttons are visible at the bottom.

#### Test: Create project modal Status dropdown shows all project statuses
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User clicks the Status dropdown
- **Expected**: Dropdown shows options: Planned, In Progress, Completed, Cancelled. A default status is pre-selected (e.g., "Planned").

#### Test: Create project modal Lead selector is searchable
- **Initial state**: User is authenticated, create project modal is open. Workspace has members "Alice", "Bob", "Charlie".
- **Action**: User clicks the Lead selector and types "Ali"
- **Expected**: The member list filters to show only "Alice". User can select "Alice" as the lead. The selected lead shows their avatar and name.

#### Test: Create project modal Target date uses a date picker
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User clicks the Target date field
- **Expected**: A date picker opens allowing the user to select a date. After selecting a date (e.g., April 15, 2026), the field displays the selected date.

#### Test: Create project modal Teams selector allows multi-select
- **Initial state**: User is authenticated, create project modal is open. Workspace has teams "Engineering" and "Design".
- **Action**: User clicks the Teams selector, checks "Engineering" and "Design"
- **Expected**: Both teams are selected and shown as chips/badges in the Teams field. The user can deselect a team by clicking its chip or unchecking it in the dropdown.

#### Test: Successful project creation with all fields
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User enters "New Feature" in Name, "Build the new feature" in Description, selects "In Progress" status, selects "Alice" as lead, picks target date "2026-05-01", selects teams "Engineering" and "Design", clicks "Create Project"
- **Expected**: The modal closes. The new project "New Feature" appears in the project list with all the specified attributes (status badge "In Progress", lead "Alice", target date, progress bar at 0%, team icons for Engineering and Design). The project is persisted to the database.

#### Test: Successful project creation with only required fields
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User enters "Quick Spike" in Name, leaves all optional fields empty/default, clicks "Create Project"
- **Expected**: The modal closes. The project "Quick Spike" appears in the project list with the default status, no lead, no target date, and no teams. The project card handles missing optional fields gracefully.

#### Test: Create project modal validates name is required
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User leaves the Name field empty and clicks "Create Project"
- **Expected**: A validation error is shown for the Name field (e.g., "Name is required"). The modal remains open. No project is created.

#### Test: Cancel button closes create project modal without creating
- **Initial state**: User is authenticated, create project modal is open. User has entered "Draft Project" in Name.
- **Action**: User clicks the "Cancel" button
- **Expected**: The modal closes. No project named "Draft Project" is created. The project list remains unchanged.

#### Test: Create project modal can be closed by clicking backdrop
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User clicks the backdrop/overlay area outside the modal
- **Expected**: The modal closes. No project is created.

#### Test: Create project modal can be closed with Escape key
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User presses the Escape key
- **Expected**: The modal closes. No project is created.

#### Test: Creating a project and then opening modal again resets fields
- **Initial state**: User is authenticated, has just created a project via the modal
- **Action**: User clicks "Create Project" button again to open the modal
- **Expected**: All fields are reset to their defaults (Name is empty, Description is empty, Status is default, Lead is unset, Target date is unset, Teams is unset). No data from the previous creation persists in the form.

#### Test: Created project appears immediately in the project list
- **Initial state**: User is authenticated, viewing `/projects` with 2 existing projects
- **Action**: User creates a new project "API v3" via the create project modal
- **Expected**: The project list now shows 3 projects, including the newly created "API v3". The new project appears without requiring a page refresh.

#### Test: Create project modal Lead selector can be used multiple times
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User selects "Alice" as lead, then clicks the lead selector again and changes to "Bob"
- **Expected**: The lead is updated to "Bob". The selector works correctly on repeated use. Only one lead can be selected at a time.

#### Test: Create project modal Teams selector can be toggled multiple times
- **Initial state**: User is authenticated, create project modal is open
- **Action**: User selects "Engineering", then also selects "Design", then deselects "Engineering"
- **Expected**: Only "Design" remains selected. The multi-select works correctly through multiple toggle interactions.

## Project Detail Page (`/project/:projectId`)

**Components**: ProjectHeader, ProjectIssuesTab, ProjectOverviewTab

### ProjectHeader

#### Test: Project header renders all fields for an existing project
- **Initial state**: User is authenticated, viewing `/project/1`. Project "Auth Rewrite" exists with status "In Progress", lead "Jane Doe", target date 2026-04-15, and 10 issues (6 completed).
- **Expected**: The header displays the project name "Auth Rewrite" as an inline-editable text field. A status badge shows "In Progress" with appropriate styling. A progress bar shows 60% completion (6/10 issues). The target date "Apr 15, 2026" is displayed and inline-editable. The lead shows "Jane Doe" with avatar and is inline-editable.

#### Test: Inline edit project name
- **Initial state**: User is viewing `/project/1`. Project name is "Auth Rewrite".
- **Action**: User clicks on the project name text, clears it, types "Auth Rewrite v2", and presses Enter or clicks away to confirm.
- **Expected**: The project name updates to "Auth Rewrite v2". The change is persisted to the database. An activity entry is created recording the name change.

#### Test: Inline edit project name — cancel edit
- **Initial state**: User is viewing `/project/1`. Project name is "Auth Rewrite".
- **Action**: User clicks on the project name, types "Draft Name", then presses Escape.
- **Expected**: The project name reverts to "Auth Rewrite". No change is persisted.

#### Test: Inline edit project name — validation rejects empty name
- **Initial state**: User is viewing `/project/1`. Project name is "Auth Rewrite".
- **Action**: User clicks on the project name, clears the field entirely, and presses Enter.
- **Expected**: A validation error is shown (e.g., "Name is required"). The project name remains "Auth Rewrite". No change is persisted.

#### Test: Inline edit status badge
- **Initial state**: User is viewing `/project/1`. Project status is "Planned".
- **Action**: User clicks the status badge.
- **Expected**: A dropdown opens showing all project statuses: "Planned", "In Progress", "Completed", "Cancelled". Each option has distinct styling/color.

#### Test: Change project status via inline dropdown
- **Initial state**: User is viewing `/project/1`. Project status is "Planned". Status dropdown is open.
- **Action**: User selects "In Progress" from the dropdown.
- **Expected**: The status badge updates to "In Progress" with appropriate color styling. The dropdown closes. The change is persisted to the database. An activity entry is created recording the status change from "Planned" to "In Progress".

#### Test: Change project status multiple times in sequence
- **Initial state**: User is viewing `/project/1`. Project status is "Planned".
- **Action**: User clicks the status badge, selects "In Progress". Then clicks the status badge again and selects "Completed".
- **Expected**: After first change, status shows "In Progress". After second change, status shows "Completed". Both changes are persisted. Two separate activity entries are created (one for each change). The progress bar and status badge update correctly each time.

#### Test: Inline edit target date via date picker
- **Initial state**: User is viewing `/project/1`. Target date is "Apr 15, 2026".
- **Action**: User clicks the target date field.
- **Expected**: A date picker opens showing the current target date pre-selected.

#### Test: Change target date
- **Initial state**: User is viewing `/project/1`. Target date date picker is open.
- **Action**: User selects "May 1, 2026" from the date picker.
- **Expected**: The target date updates to "May 1, 2026". The date picker closes. The change is persisted. An activity entry is created recording the target date change.

#### Test: Clear target date
- **Initial state**: User is viewing `/project/1`. Target date is "Apr 15, 2026".
- **Action**: User clicks the target date field and clicks a "Clear" or remove option.
- **Expected**: The target date is removed, displaying a placeholder like "No target date". The change is persisted. An activity entry is created.

#### Test: Inline edit lead via searchable selector
- **Initial state**: User is viewing `/project/1`. Lead is "Jane Doe". Workspace members include "Jane Doe", "Alice Smith", "Bob Jones".
- **Action**: User clicks on the lead field.
- **Expected**: A searchable dropdown opens listing all workspace members with avatars and names. "Jane Doe" is shown as currently selected.

#### Test: Change project lead
- **Initial state**: User is viewing `/project/1`. Lead selector is open.
- **Action**: User types "Ali" in the search field, then selects "Alice Smith".
- **Expected**: The lead updates to "Alice Smith" with her avatar. The dropdown closes. The change is persisted. An activity entry is created recording the lead change from "Jane Doe" to "Alice Smith".

#### Test: Search lead selector filters results
- **Initial state**: User is viewing `/project/1`. Lead selector is open. Members: "Jane Doe", "Alice Smith", "Bob Jones".
- **Action**: User types "bob" in the search field.
- **Expected**: Only "Bob Jones" appears in the filtered results. Other members are hidden.

#### Test: Remove project lead
- **Initial state**: User is viewing `/project/1`. Lead is "Jane Doe".
- **Action**: User clicks the lead field and selects a "Remove" or "Unassign" option.
- **Expected**: The lead is cleared, showing a placeholder like "No lead". The change is persisted. An activity entry is created.

#### Test: Progress bar reflects issue completion accurately
- **Initial state**: User is viewing `/project/1`. Project has 10 issues total: 6 Done, 1 Cancelled, 3 In Progress.
- **Expected**: The progress bar shows 60% filled (6 completed out of 10 total). A text label or tooltip shows "6 of 10 issues completed" or similar.

#### Test: Progress bar shows 0% for project with no completed issues
- **Initial state**: User is viewing a project with 5 issues, none completed.
- **Expected**: The progress bar shows 0% filled. Text indicates "0 of 5 issues completed" or similar.

#### Test: Progress bar shows 100% for fully completed project
- **Initial state**: User is viewing a project with 4 issues, all with status "Done".
- **Expected**: The progress bar shows 100% filled with a fully colored bar.

#### Test: Progress bar handles project with no issues
- **Initial state**: User is viewing a project with 0 issues.
- **Expected**: The progress bar shows 0% or an empty state. No division-by-zero errors occur.

#### Test: Header displays tabs for Issues and Overview
- **Initial state**: User is viewing `/project/1`.
- **Expected**: Below the header fields, two tabs are visible: "Issues" and "Overview". The "Issues" tab is active/selected by default.

#### Test: Clicking Overview tab switches to overview content
- **Initial state**: User is viewing `/project/1` with the "Issues" tab active.
- **Action**: User clicks the "Overview" tab.
- **Expected**: The "Overview" tab becomes active/highlighted. The content area below switches to show the overview content (description, milestones, key metrics). The "Issues" tab is no longer highlighted.

#### Test: Clicking Issues tab switches back to issues content
- **Initial state**: User is viewing `/project/1` with the "Overview" tab active.
- **Action**: User clicks the "Issues" tab.
- **Expected**: The "Issues" tab becomes active/highlighted. The content area switches to show the project issues list. The "Overview" tab is no longer highlighted.

#### Test: Navigating to project detail page from project card
- **Initial state**: User is on `/projects`. Project "Auth Rewrite" exists.
- **Action**: User clicks on the "Auth Rewrite" project card/name.
- **Expected**: User is navigated to `/project/1` (or the correct project ID). The ProjectHeader displays "Auth Rewrite" with all its fields.

### ProjectIssuesTab

#### Test: Issues tab displays all project issues grouped by team
- **Initial state**: User is viewing `/project/1` with the "Issues" tab active. Project "Auth Rewrite" has issues from teams "Engineering" (3 issues) and "Design" (2 issues).
- **Expected**: Issues are grouped under team name headers: "Engineering" showing 3 issues and "Design" showing 2 issues. Each team header shows the team name and issue count.

#### Test: Issue rows display standard issue information
- **Initial state**: User is viewing `/project/1`, Issues tab. An issue exists: identifier "ENG-42", title "Fix login bug", status "In Progress" (half-circle yellow icon), priority "High" (orange arrow-up icon), assignee "Alice" with avatar, labels "Bug" (colored badge), due date "Apr 1, 2026".
- **Expected**: The issue row displays: priority icon (orange arrow-up), identifier "ENG-42", title "Fix login bug" (clickable), status icon (yellow half-circle), label badge "Bug", assignee avatar for Alice, and due date "Apr 1, 2026".

#### Test: Clicking issue title navigates to issue detail
- **Initial state**: User is viewing `/project/1`, Issues tab. Issue "ENG-42" is displayed.
- **Action**: User clicks on the title "Fix login bug" for issue ENG-42.
- **Expected**: User is navigated to `/issue/ENG-42` (or the appropriate issue detail URL). The Issue Detail page opens showing the full issue view.

#### Test: Clicking status icon on issue row changes status
- **Initial state**: User is viewing `/project/1`, Issues tab. Issue "ENG-42" has status "Todo" (gray circle icon).
- **Action**: User clicks the status icon on the issue row.
- **Expected**: A dropdown opens showing all status options: Backlog, Todo, In Progress, In Review, Done, Cancelled — each with its distinct icon and color.

#### Test: Change issue status from issue row
- **Initial state**: User is viewing `/project/1`, Issues tab. Issue status dropdown is open for "ENG-42" (currently "Todo").
- **Action**: User selects "In Progress" from the dropdown.
- **Expected**: The status icon updates to the yellow half-circle "In Progress" icon. The dropdown closes. The change is persisted. The project progress bar in the header updates if the status changed to/from Done.

#### Test: Issues tab shows empty state when project has no issues
- **Initial state**: User is viewing a project that has 0 issues, with the Issues tab active.
- **Expected**: A friendly empty state message is displayed (e.g., "No issues in this project yet.") with an appropriate icon.

#### Test: Team groups are collapsible
- **Initial state**: User is viewing `/project/1`, Issues tab. Issues are grouped by teams "Engineering" and "Design".
- **Action**: User clicks the "Engineering" team header.
- **Expected**: The Engineering group collapses, hiding its issues. The Design group remains expanded. Clicking the Engineering header again expands it back.

#### Test: Issue checkboxes enable bulk selection
- **Initial state**: User is viewing `/project/1`, Issues tab. Multiple issues are displayed.
- **Action**: User clicks the checkbox on issue "ENG-42" and "ENG-43".
- **Expected**: Both issues are visually selected (highlighted row or checked checkbox). A bulk actions toolbar appears at the top showing the count of selected issues (e.g., "2 selected").

#### Test: Bulk action — change status for multiple issues
- **Initial state**: User is viewing `/project/1`, Issues tab. Issues "ENG-42" and "ENG-43" are selected via checkboxes. Bulk actions toolbar is visible.
- **Action**: User clicks the "Status" bulk action button and selects "Done".
- **Expected**: Both issues update their status to "Done" with green check-circle icons. The changes are persisted. The project progress bar in the header updates to reflect the new completion count. Activity entries are created for each issue.

#### Test: Bulk action — change priority for multiple issues
- **Initial state**: User is viewing `/project/1`, Issues tab. Issues "ENG-42" and "ENG-43" are selected. Bulk actions toolbar is visible.
- **Action**: User clicks the "Priority" bulk action button and selects "Urgent".
- **Expected**: Both issues update their priority to "Urgent" with red alert-triangle icons. The changes are persisted.

#### Test: Bulk action — change assignee for multiple issues
- **Initial state**: User is viewing `/project/1`, Issues tab. Issues "ENG-42" and "ENG-43" are selected. Bulk actions toolbar is visible.
- **Action**: User clicks the "Assignee" bulk action button and selects "Bob Jones".
- **Expected**: Both issues update their assignee to "Bob Jones". The changes are persisted.

#### Test: Bulk action — change label for multiple issues
- **Initial state**: User is viewing `/project/1`, Issues tab. Issues "ENG-42" and "ENG-43" are selected. Bulk actions toolbar is visible.
- **Action**: User clicks the "Label" bulk action button and selects "Feature".
- **Expected**: Both issues have the "Feature" label added. The changes are persisted.

#### Test: Deselect all clears bulk selection
- **Initial state**: User is viewing `/project/1`, Issues tab. 2 issues are selected and bulk toolbar is showing.
- **Action**: User clicks a "Deselect all" button or unchecks both checkboxes.
- **Expected**: All issue selections are cleared. The bulk actions toolbar disappears.

#### Test: Changing status to Done updates project progress bar
- **Initial state**: User is viewing `/project/1` with 10 issues, 5 completed. Progress bar shows 50%.
- **Action**: User clicks the status icon on an issue currently marked "In Progress" and selects "Done".
- **Expected**: The progress bar updates to 60% (6/10). The issue row shows the green check-circle Done icon.

#### Test: Issues tab shows issue count per team group
- **Initial state**: User is viewing `/project/1`, Issues tab. "Engineering" has 5 issues, "Design" has 3 issues.
- **Expected**: The "Engineering" group header shows "(5)" or similar count. The "Design" group header shows "(3)" or similar count.

### ProjectOverviewTab

#### Test: Overview tab renders description, milestones, and key metrics sections
- **Initial state**: User is viewing `/project/1` with the "Overview" tab active. Project "Auth Rewrite" has a description "Rewrite the authentication system to support OAuth and SSO", 2 milestones, and key metrics.
- **Expected**: The overview displays three sections: a "Description" section showing the project description text, a "Milestones" section listing milestones, and a "Key Metrics" section showing project statistics.

#### Test: Description is inline editable
- **Initial state**: User is viewing `/project/1`, Overview tab. Description is "Rewrite the authentication system".
- **Action**: User clicks on the description text area.
- **Expected**: The description becomes editable (rich text area or markdown-supporting text area). The current description text is shown and editable.

#### Test: Edit and save description
- **Initial state**: User is viewing `/project/1`, Overview tab. Description field is in edit mode.
- **Action**: User clears the description, types "Updated auth system with OAuth2 and SAML support", and clicks away or presses a save action.
- **Expected**: The description updates to "Updated auth system with OAuth2 and SAML support". The change is persisted to the database. An activity entry is created recording the description change.

#### Test: Description supports markdown rendering
- **Initial state**: User is viewing `/project/1`, Overview tab. Description contains markdown: "## Goals\n- Support OAuth\n- Support SSO\n\n**Priority**: High".
- **Expected**: The description renders the markdown: "Goals" as a heading, bullet points for "Support OAuth" and "Support SSO", and "Priority" in bold.

#### Test: Cancel description edit reverts changes
- **Initial state**: User is viewing `/project/1`, Overview tab. Description is "Original description".
- **Action**: User clicks the description to edit, types "Changed text", then presses Escape.
- **Expected**: The description reverts to "Original description". No change is persisted.

#### Test: Description shows placeholder when empty
- **Initial state**: User is viewing `/project/1`, Overview tab. Project has no description.
- **Expected**: A placeholder text is shown (e.g., "Add a description...") indicating the field is editable.

#### Test: Milestones section displays existing milestones
- **Initial state**: User is viewing `/project/1`, Overview tab. Project has milestones: "Alpha Release" (target date Mar 15, 2026, completed) and "Beta Release" (target date Apr 1, 2026, not completed).
- **Expected**: The milestones section shows both milestones. "Alpha Release" shows its target date and a completed indicator (checkmark or strikethrough). "Beta Release" shows its target date and an incomplete indicator.

#### Test: Add a new milestone
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestones section is visible.
- **Action**: User clicks an "Add Milestone" button.
- **Expected**: An inline form or input appears with fields for milestone name and target date. A "Save" and "Cancel" button are visible.

#### Test: Save a new milestone
- **Initial state**: User is viewing `/project/1`, Overview tab. Add milestone form is visible.
- **Action**: User enters "GA Release" as the milestone name, selects "May 15, 2026" as the target date, and clicks "Save".
- **Expected**: The new milestone "GA Release" appears in the milestones list with target date "May 15, 2026" and an incomplete status. The change is persisted. An activity entry is created.

#### Test: Cancel adding a new milestone
- **Initial state**: User is viewing `/project/1`, Overview tab. Add milestone form is visible with "Draft" entered.
- **Action**: User clicks "Cancel".
- **Expected**: The form disappears. No new milestone is added. The milestones list remains unchanged.

#### Test: Toggle milestone completion status
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestone "Beta Release" is not completed.
- **Action**: User clicks the completion checkbox or toggle for "Beta Release".
- **Expected**: "Beta Release" is marked as completed with a checkmark or completed styling. The change is persisted. An activity entry is created.

#### Test: Toggle milestone back to incomplete
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestone "Alpha Release" is marked as completed.
- **Action**: User clicks the completion checkbox or toggle for "Alpha Release".
- **Expected**: "Alpha Release" is marked as incomplete. The completed styling is removed. The change is persisted.

#### Test: Delete a milestone with confirmation
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestone "Alpha Release" exists.
- **Action**: User clicks a delete button on the "Alpha Release" milestone.
- **Expected**: A confirmation dialog appears (e.g., "Are you sure you want to delete this milestone?"). The milestone is not yet deleted.

#### Test: Confirm milestone deletion
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestone delete confirmation dialog is showing for "Alpha Release".
- **Action**: User clicks "Confirm" or "Delete" in the dialog.
- **Expected**: "Alpha Release" is removed from the milestones list. The change is persisted. An activity entry is created.

#### Test: Cancel milestone deletion
- **Initial state**: Milestone delete confirmation dialog is showing for "Alpha Release".
- **Action**: User clicks "Cancel" in the dialog.
- **Expected**: The dialog closes. "Alpha Release" remains in the milestones list unchanged.

#### Test: Edit milestone name inline
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestone "Beta Release" exists.
- **Action**: User clicks on the milestone name "Beta Release", changes it to "Public Beta", and confirms.
- **Expected**: The milestone name updates to "Public Beta". The change is persisted.

#### Test: Edit milestone target date
- **Initial state**: User is viewing `/project/1`, Overview tab. Milestone "Beta Release" has target date "Apr 1, 2026".
- **Action**: User clicks the target date for "Beta Release" and selects "Apr 15, 2026".
- **Expected**: The target date updates to "Apr 15, 2026". The change is persisted.

#### Test: Milestones section shows empty state when no milestones
- **Initial state**: User is viewing `/project/1`, Overview tab. Project has no milestones.
- **Expected**: A friendly empty state message is shown (e.g., "No milestones yet. Add one to track progress.") with an "Add Milestone" button.

#### Test: Key metrics section displays project statistics
- **Initial state**: User is viewing `/project/1`, Overview tab. Project has 10 total issues: 6 Done, 1 In Progress, 2 Todo, 1 Backlog.
- **Expected**: The key metrics section displays: total issues (10), completed issues (6), in-progress issues (1), remaining issues (4 — Todo + Backlog + In Progress), and completion percentage (60%).

#### Test: Key metrics update when issue statuses change
- **Initial state**: User is viewing `/project/1`, Overview tab showing 6/10 completed (60%). User switches to Issues tab.
- **Action**: User changes an issue from "In Progress" to "Done" on the Issues tab, then switches back to the Overview tab.
- **Expected**: Key metrics now show 7/10 completed (70%). The completed count increased by 1 and the remaining count decreased by 1.

#### Test: Key metrics handle project with zero issues
- **Initial state**: User is viewing a project with 0 issues, Overview tab.
- **Expected**: Key metrics show: total issues 0, completed 0, remaining 0, completion percentage 0% or "N/A". No errors occur.

## Members Page (`/settings/members`)

**Components**: MemberList, InviteMemberModal, MemberActions

### MemberList

#### Test: Members page renders with list of all workspace members
- **Initial state**: Workspace has 3 members: Alice (Admin, Engineering team), Bob (Member, Engineering and Design teams), Carol (Member, Design team). User navigates to `/settings/members`.
- **Expected**: A list/table is displayed showing all 3 members. Each row shows the member's avatar, name, email, role badge (Admin or Member), and team badges. The "Invite Member" button is visible at the top of the page. The page title reads "Members".

#### Test: Member row displays avatar, name, email, role, and team badges
- **Initial state**: Workspace has a member named "Alice Smith" with email "alice@example.com", role "Admin", belonging to "Engineering" and "Design" teams. User is on `/settings/members`.
- **Expected**: Alice's row displays her avatar (initials or image), full name "Alice Smith", email "alice@example.com", an "Admin" role badge, and two team badges showing "Engineering" and "Design".

#### Test: Members list shows correct role badges with visual distinction
- **Initial state**: Workspace has members with Admin and Member roles. User is on `/settings/members`.
- **Expected**: Admin role badges are visually distinct from Member role badges (different color or styling). Admin badges clearly indicate elevated privileges.

#### Test: Members list shows team badges for each member
- **Initial state**: Workspace has a member belonging to 3 teams (Engineering, Design, QA). User is on `/settings/members`.
- **Expected**: The member's row displays 3 team badges, one for each team. Each badge shows the team name.

#### Test: Members list shows member with no teams
- **Initial state**: Workspace has a member who does not belong to any teams. User is on `/settings/members`.
- **Expected**: The member's row is displayed without any team badges. No error or placeholder is shown in the teams column.

#### Test: Members page shows empty state when no members exist
- **Initial state**: Workspace has only the current user (no other members). User is on `/settings/members`.
- **Expected**: The list shows only the current user. A friendly message or the invite button is prominently displayed to encourage adding members.

#### Test: Members list updates after inviting a new member
- **Initial state**: Workspace has 2 members. User is on `/settings/members`.
- **Action**: User invites a new member via the Invite Member modal (enters "newuser@example.com" and submits)
- **Expected**: The members list now shows 3 members including the newly invited member. The new member appears with their email and a default "Member" role.

#### Test: Members list updates after removing a member
- **Initial state**: Workspace has 3 members. User is on `/settings/members`.
- **Action**: User removes one member via the remove action (confirms removal in the confirmation dialog)
- **Expected**: The members list now shows 2 members. The removed member is no longer visible in the list.

### InviteMemberModal

#### Test: Invite Member button opens invite modal
- **Initial state**: User is on `/settings/members`.
- **Action**: User clicks the "Invite Member" button
- **Expected**: A modal dialog opens with a title (e.g., "Invite Member"), an email input field, a "Send Invite" (or "Invite") button, and a "Cancel" button. The modal has a backdrop overlay.

#### Test: Invite member with valid email
- **Initial state**: User has the Invite Member modal open. Workspace has 2 existing members.
- **Action**: User enters "newcolleague@example.com" in the email field and clicks "Send Invite"
- **Expected**: The modal closes. A success message is shown (e.g., "Invitation sent" or the member appears in the list). The new member appears in the members list with email "newcolleague@example.com", role "Member", and no team badges.

#### Test: Invite member with invalid email format
- **Initial state**: User has the Invite Member modal open.
- **Action**: User enters "not-an-email" in the email field and clicks "Send Invite"
- **Expected**: A validation error is displayed (e.g., "Please enter a valid email address"). The modal remains open. No member is added.

#### Test: Invite member with empty email field
- **Initial state**: User has the Invite Member modal open.
- **Action**: User clicks "Send Invite" without entering an email
- **Expected**: A validation error is displayed indicating the email field is required. The modal remains open.

#### Test: Invite member with already existing email
- **Initial state**: User has the Invite Member modal open. A member with email "existing@example.com" already exists in the workspace.
- **Action**: User enters "existing@example.com" in the email field and clicks "Send Invite"
- **Expected**: An error message is shown (e.g., "This email is already a member of the workspace"). The modal remains open. No duplicate member is created.

#### Test: Cancel invite member modal
- **Initial state**: User has the Invite Member modal open and has typed "someone@example.com" in the email field.
- **Action**: User clicks the "Cancel" button
- **Expected**: The modal closes. No new member is added to the workspace. The members list remains unchanged.

#### Test: Close invite modal by clicking backdrop
- **Initial state**: User has the Invite Member modal open.
- **Action**: User clicks outside the modal (on the backdrop overlay)
- **Expected**: The modal closes without sending an invite.

#### Test: Invite modal email field can be submitted via Enter key
- **Initial state**: User has the Invite Member modal open and has entered "newuser@example.com" in the email field.
- **Action**: User presses Enter while focused on the email field
- **Expected**: The form is submitted, same behavior as clicking "Send Invite". The new member is added if the email is valid.

#### Test: Invite member modal can be opened multiple times in sequence
- **Initial state**: User is on `/settings/members`.
- **Action**: User clicks "Invite Member", enters "first@example.com", clicks "Send Invite". Then clicks "Invite Member" again, enters "second@example.com", clicks "Send Invite".
- **Expected**: Both members are added to the workspace. The members list shows both new members. The modal opens cleanly with an empty email field the second time (no residual data from the first invite).

### MemberActions

#### Test: Change member role from Member to Admin
- **Initial state**: Workspace has a member "Bob" with role "Member". Current user is an Admin. User is on `/settings/members`.
- **Action**: User clicks the role dropdown for Bob and selects "Admin"
- **Expected**: Bob's role is updated to "Admin". The role badge in Bob's row changes to "Admin" with the Admin styling. The change is persisted (reloading the page still shows Admin).

#### Test: Change member role from Admin to Member
- **Initial state**: Workspace has a member "Alice" with role "Admin". Current user is an Admin. User is on `/settings/members`.
- **Action**: User clicks the role dropdown for Alice and selects "Member"
- **Expected**: Alice's role is updated to "Member". The role badge in Alice's row changes to "Member" with the Member styling.

#### Test: Role dropdown displays available roles
- **Initial state**: User is on `/settings/members`. A member row is visible.
- **Action**: User clicks the role dropdown for a member
- **Expected**: A dropdown menu appears showing the available roles: "Admin" and "Member". The currently assigned role is visually indicated (checked, highlighted, or selected).

#### Test: Role dropdown can be used multiple times in sequence
- **Initial state**: User is on `/settings/members`. A member "Bob" has role "Member".
- **Action**: User changes Bob's role to "Admin" via the dropdown. Then user changes Bob's role back to "Member" via the dropdown again.
- **Expected**: Bob's role first changes to "Admin", then back to "Member". Both changes are persisted correctly. The dropdown works correctly on the second use.

#### Test: Remove member button shows confirmation dialog
- **Initial state**: User is on `/settings/members`. Workspace has a member "Carol".
- **Action**: User clicks the remove/delete button for Carol
- **Expected**: A confirmation dialog appears asking the user to confirm the removal (e.g., "Are you sure you want to remove Carol from the workspace?"). The dialog has "Confirm" (or "Remove") and "Cancel" buttons. The member is NOT removed yet.

#### Test: Confirm member removal deletes the member
- **Initial state**: User is on `/settings/members`. The removal confirmation dialog is open for member "Carol". Workspace has 3 members.
- **Action**: User clicks "Confirm" (or "Remove") in the confirmation dialog
- **Expected**: The dialog closes. Carol is removed from the workspace. The members list now shows 2 members. Carol no longer appears in the list. The removal is persisted.

#### Test: Cancel member removal keeps the member
- **Initial state**: User is on `/settings/members`. The removal confirmation dialog is open for member "Carol".
- **Action**: User clicks "Cancel" in the confirmation dialog
- **Expected**: The dialog closes. Carol remains in the members list. No changes are made.

#### Test: Cannot remove yourself from the workspace
- **Initial state**: User is on `/settings/members`. The current user's row is visible.
- **Expected**: The remove button is either not shown or is disabled for the current user's own row. The user cannot remove themselves from the workspace.

#### Test: Cannot change your own role (or last Admin cannot be demoted)
- **Initial state**: User is on `/settings/members`. The current user is the only Admin in the workspace.
- **Action**: User attempts to change their own role to "Member"
- **Expected**: Either the role dropdown is disabled for the current user's own row, or an error is shown (e.g., "Cannot demote the last Admin"). The workspace must always have at least one Admin.

#### Test: Removed member's issues remain assigned but member is gone from selectors
- **Initial state**: Workspace has a member "Carol" who is assigned to 2 issues. User is on `/settings/members`.
- **Action**: User removes Carol (clicks remove, confirms in dialog)
- **Expected**: Carol is removed from the members list. The issues previously assigned to Carol retain their data but Carol no longer appears as a selectable assignee in issue forms or selectors.

## Teams Management Page (`/settings/teams`)

**Components**: TeamCard, CreateTeamModal, TeamSettings

### TeamCard

#### Test: Teams page renders with list of all teams as cards
- **Initial state**: Workspace has 3 teams: "Engineering" (prefix ENG, 5 members, active cycle "Sprint 10"), "Design" (prefix DES, 3 members, no active cycle), "QA" (prefix QA, 2 members, active cycle "QA Cycle 4"). User navigates to `/settings/teams`.
- **Expected**: The page displays 3 team cards. Each card shows the team name, identifier prefix, member count, and active cycle name (if any). A "Create Team" button is visible at the top of the page. The page title reads "Teams".

#### Test: Team card displays team name prominently
- **Initial state**: Workspace has a team named "Engineering". User is on `/settings/teams`.
- **Expected**: The team card displays "Engineering" as the primary text, prominently styled (larger or bolder font than other card details).

#### Test: Team card displays identifier prefix
- **Initial state**: Workspace has a team with identifier prefix "ENG". User is on `/settings/teams`.
- **Expected**: The team card shows the identifier prefix "ENG" clearly visible (e.g., as a badge or secondary text below the team name).

#### Test: Team card displays member count
- **Initial state**: Workspace has a team "Engineering" with 5 members. User is on `/settings/teams`.
- **Expected**: The team card shows the member count as "5 members" (or similar text like "5" with a members icon).

#### Test: Team card displays active cycle name when team has an active cycle
- **Initial state**: Workspace has a team "Engineering" with an active cycle named "Sprint 10". User is on `/settings/teams`.
- **Expected**: The team card shows the active cycle name "Sprint 10" (e.g., with a cycle icon or label like "Active: Sprint 10").

#### Test: Team card displays no cycle indicator when team has no active cycle
- **Initial state**: Workspace has a team "Design" with no active cycle. User is on `/settings/teams`.
- **Expected**: The team card does not show a cycle name. Either a "No active cycle" message is displayed or the cycle section is absent. No error or empty artifact is shown.

#### Test: Clicking a team card navigates to team settings
- **Initial state**: Workspace has a team "Engineering". User is on `/settings/teams`.
- **Action**: User clicks on the "Engineering" team card
- **Expected**: The user is navigated to the team settings view for "Engineering", showing editable fields for team name, description, identifier, and a section for managing team members.

#### Test: Teams page shows empty state when no teams exist
- **Initial state**: Workspace has no teams. User navigates to `/settings/teams`.
- **Expected**: A friendly empty state message is displayed (e.g., "No teams yet. Create your first team to get started." with an icon). The "Create Team" button is still visible.

#### Test: Teams page updates after creating a new team
- **Initial state**: Workspace has 2 teams. User is on `/settings/teams`.
- **Action**: User creates a new team "QA" via the Create Team modal
- **Expected**: The teams page now shows 3 team cards, including the newly created "QA" team with its identifier prefix, a member count of 0 (or 1 if the creator is auto-added), and no active cycle.

#### Test: Teams page updates after deleting a team from team settings
- **Initial state**: Workspace has 3 teams. User is on `/settings/teams`.
- **Action**: User clicks on a team card, deletes the team from team settings, and returns to the teams page
- **Expected**: The teams page now shows 2 team cards. The deleted team is no longer visible.

### CreateTeamModal

#### Test: Create Team button opens create team modal
- **Initial state**: User is on `/settings/teams`.
- **Action**: User clicks the "Create Team" button
- **Expected**: A modal dialog opens with a title (e.g., "Create Team"), fields for Name (text input, required), Identifier prefix (text input, required, uppercase, 2-5 chars), and Description (text area, optional). "Create Team" and "Cancel" buttons are visible at the bottom. The modal has a backdrop overlay.

#### Test: Create team modal Name field is required
- **Initial state**: Create Team modal is open. Name field is empty.
- **Action**: User fills in Identifier prefix "QA" and clicks "Create Team" without entering a Name
- **Expected**: A validation error is displayed indicating the Name field is required. The modal remains open. No team is created.

#### Test: Create team modal Identifier prefix is required
- **Initial state**: Create Team modal is open. Identifier field is empty.
- **Action**: User fills in Name "Quality Assurance" and clicks "Create Team" without entering an Identifier prefix
- **Expected**: A validation error is displayed indicating the Identifier prefix is required. The modal remains open. No team is created.

#### Test: Create team modal Identifier prefix must be uppercase
- **Initial state**: Create Team modal is open.
- **Action**: User types "eng" in the Identifier prefix field
- **Expected**: The input is automatically converted to uppercase "ENG", or a validation error is shown indicating the prefix must be uppercase.

#### Test: Create team modal Identifier prefix must be 2-5 characters
- **Initial state**: Create Team modal is open.
- **Action**: User enters "A" (1 char) in the Identifier prefix field and clicks "Create Team"
- **Expected**: A validation error is shown indicating the prefix must be between 2 and 5 characters. The modal remains open.

#### Test: Create team modal Identifier prefix rejects more than 5 characters
- **Initial state**: Create Team modal is open.
- **Action**: User enters "TOOLONG" (7 chars) in the Identifier prefix field and clicks "Create Team"
- **Expected**: A validation error is shown indicating the prefix must be between 2 and 5 characters, or the input is limited to 5 characters. The modal remains open.

#### Test: Create team modal Identifier prefix must be unique
- **Initial state**: Create Team modal is open. A team with identifier prefix "ENG" already exists.
- **Action**: User enters Name "Engineering 2", Identifier prefix "ENG", and clicks "Create Team"
- **Expected**: An error message is shown indicating the identifier prefix is already in use (e.g., "A team with prefix 'ENG' already exists"). The modal remains open. No duplicate team is created.

#### Test: Create team with all fields filled
- **Initial state**: Create Team modal is open. Workspace has 2 existing teams.
- **Action**: User enters Name "Quality Assurance", Identifier prefix "QA", Description "QA team for testing", and clicks "Create Team"
- **Expected**: The modal closes. The teams page now shows the new "Quality Assurance" team card with prefix "QA", member count of 0 (or 1), and no active cycle. The team is persisted (reloading shows the team).

#### Test: Create team with only required fields
- **Initial state**: Create Team modal is open.
- **Action**: User enters Name "DevOps", Identifier prefix "OPS", leaves Description empty, and clicks "Create Team"
- **Expected**: The modal closes. The new "DevOps" team card appears on the teams page with prefix "OPS" and no description issue.

#### Test: Cancel create team modal discards input
- **Initial state**: Create Team modal is open. User has entered Name "Test Team", Identifier prefix "TT".
- **Action**: User clicks the "Cancel" button
- **Expected**: The modal closes. No new team is created. The teams list remains unchanged.

#### Test: Close create team modal by clicking backdrop
- **Initial state**: Create Team modal is open.
- **Action**: User clicks outside the modal (on the backdrop overlay)
- **Expected**: The modal closes without creating a team.

#### Test: Create team modal form resets on reopen
- **Initial state**: User is on `/settings/teams`. User previously opened the Create Team modal, entered some data, and cancelled.
- **Action**: User clicks "Create Team" button again
- **Expected**: The modal opens with all fields empty/reset. No residual data from the previous attempt is present.

#### Test: Create team modal can be used multiple times in sequence
- **Initial state**: User is on `/settings/teams`.
- **Action**: User clicks "Create Team", enters Name "Team Alpha", prefix "ALPH", clicks "Create Team". Then clicks "Create Team" again, enters Name "Team Beta", prefix "BETA", clicks "Create Team".
- **Expected**: Both teams are created. The teams page shows both new team cards. The modal opens cleanly with empty fields the second time.

#### Test: Create team modal submits via Enter key
- **Initial state**: Create Team modal is open. User has entered Name "QA Team" and Identifier prefix "QA".
- **Action**: User presses Enter while focused on the form
- **Expected**: The form is submitted, same behavior as clicking "Create Team". The team is created if all validations pass.

### TeamSettings

#### Test: Team settings page renders with editable fields
- **Initial state**: Workspace has a team "Engineering" with prefix "ENG" and description "Core engineering team". User clicks the "Engineering" team card on `/settings/teams`.
- **Expected**: The team settings view displays: Team name field showing "Engineering" (inline editable), Identifier prefix field showing "ENG" (inline editable), Description field showing "Core engineering team" (inline editable), and a "Team Members" section listing current members. A "Back" or navigation link to return to the teams list is visible. A "Delete Team" button is also present.

#### Test: Inline edit team name
- **Initial state**: User is on team settings for "Engineering".
- **Action**: User clicks on the team name field, changes it from "Engineering" to "Platform Engineering", and confirms (blur or Enter)
- **Expected**: The team name updates to "Platform Engineering". The change is persisted (reloading the page still shows "Platform Engineering"). The sidebar team section also reflects the updated name.

#### Test: Inline edit team name with empty value rejected
- **Initial state**: User is on team settings for "Engineering".
- **Action**: User clicks on the team name field, clears the value, and attempts to confirm
- **Expected**: A validation error is shown indicating the team name cannot be empty. The name reverts to "Engineering" or the error blocks the save.

#### Test: Inline edit team identifier prefix
- **Initial state**: User is on team settings for "Engineering" with prefix "ENG".
- **Action**: User clicks on the identifier prefix field, changes it to "ENGR", and confirms
- **Expected**: The identifier prefix updates to "ENGR". The change is persisted. Existing issues retain their original identifiers (e.g., "ENG-42" does not change), but new issues will use the new prefix "ENGR".

#### Test: Inline edit team identifier prefix enforces uppercase and 2-5 char limit
- **Initial state**: User is on team settings for "Engineering" with prefix "ENG".
- **Action**: User clicks on the identifier prefix field and enters "a" (lowercase, 1 char)
- **Expected**: The input is either auto-uppercased to "A" or rejected as lowercase. A validation error indicates the prefix must be 2-5 uppercase characters. The prefix reverts to "ENG" if the edit is not valid.

#### Test: Inline edit team identifier prefix rejects duplicate prefix
- **Initial state**: User is on team settings for "Engineering" with prefix "ENG". Another team "Design" has prefix "DES".
- **Action**: User changes the identifier prefix from "ENG" to "DES" and confirms
- **Expected**: An error is shown indicating the prefix "DES" is already in use by another team. The prefix reverts to "ENG" or the save is blocked.

#### Test: Inline edit team description
- **Initial state**: User is on team settings for "Engineering" with description "Core engineering team".
- **Action**: User clicks on the description field, changes it to "Platform and infrastructure engineering", and confirms
- **Expected**: The description updates to "Platform and infrastructure engineering". The change is persisted.

#### Test: Inline edit team description can be cleared
- **Initial state**: User is on team settings for "Engineering" with description "Core engineering team".
- **Action**: User clicks on the description field, clears all text, and confirms
- **Expected**: The description is cleared. The field shows a placeholder or empty state. No error is shown (description is optional).

#### Test: Team members section lists all current team members
- **Initial state**: Team "Engineering" has 3 members: Alice, Bob, Carol. User is on team settings for "Engineering".
- **Expected**: The Team Members section displays a list of 3 members. Each member row shows their avatar and name. An "Add Member" button is visible.

#### Test: Add member to team via team settings
- **Initial state**: Team "Engineering" has 2 members. Workspace member "David" is not on this team. User is on team settings for "Engineering".
- **Action**: User clicks "Add Member", selects "David" from the member selector, and confirms
- **Expected**: David is added to the team. The Team Members section now shows 3 members including David. The team card on the teams page reflects the updated member count. David's member row on the Members page (`/settings/members`) now includes an "Engineering" team badge.

#### Test: Add member selector shows only non-team members
- **Initial state**: Team "Engineering" has members Alice and Bob. Workspace also has Carol and David who are not on this team. User is on team settings for "Engineering".
- **Action**: User clicks "Add Member"
- **Expected**: The member selector dropdown shows only Carol and David (members not already on the team). Alice and Bob are not shown in the dropdown since they are already team members.

#### Test: Remove member from team via team settings
- **Initial state**: Team "Engineering" has 3 members: Alice, Bob, Carol. User is on team settings for "Engineering".
- **Action**: User clicks the remove button next to Carol's name in the Team Members list
- **Expected**: A confirmation prompt appears (e.g., "Remove Carol from Engineering?"). User confirms. Carol is removed from the team members list. The section now shows 2 members. Carol remains a workspace member but is no longer on the "Engineering" team. The team card member count decreases.

#### Test: Cancel remove member from team
- **Initial state**: Team "Engineering" has 3 members. User is on team settings for "Engineering".
- **Action**: User clicks the remove button next to a member's name, then clicks "Cancel" in the confirmation prompt
- **Expected**: The member is not removed. The Team Members list still shows 3 members.

#### Test: Team members section shows empty state when team has no members
- **Initial state**: Team "QA" has no members. User is on team settings for "QA".
- **Expected**: The Team Members section shows an empty state message (e.g., "No members yet. Add members to this team."). The "Add Member" button is visible.

#### Test: Add member to team can be done multiple times in sequence
- **Initial state**: Team "Engineering" has 1 member. Workspace has 3 other members (Bob, Carol, David). User is on team settings for "Engineering".
- **Action**: User adds Bob via "Add Member", then adds Carol via "Add Member" again
- **Expected**: Both Bob and Carol are added to the team. The Team Members section now shows 3 members. The "Add Member" selector correctly filters out already-added members each time.

#### Test: Delete team button shows confirmation dialog
- **Initial state**: User is on team settings for "Engineering".
- **Action**: User clicks the "Delete Team" button
- **Expected**: A confirmation dialog appears (e.g., "Are you sure you want to delete the team 'Engineering'? This action cannot be undone."). The dialog has "Confirm" (or "Delete") and "Cancel" buttons. The team is NOT deleted yet.

#### Test: Confirm delete team removes the team and navigates back
- **Initial state**: User is on team settings for "Engineering". The delete confirmation dialog is open. Workspace has 3 teams.
- **Action**: User clicks "Confirm" (or "Delete") in the confirmation dialog
- **Expected**: The team "Engineering" is deleted. The user is navigated back to `/settings/teams`. The teams page now shows 2 team cards. "Engineering" no longer appears. The sidebar no longer shows the "Engineering" team section. Issues that belonged to this team are handled gracefully (either reassigned or still accessible).

#### Test: Cancel delete team keeps the team
- **Initial state**: User is on team settings for "Engineering". The delete confirmation dialog is open.
- **Action**: User clicks "Cancel" in the confirmation dialog
- **Expected**: The dialog closes. The team "Engineering" is not deleted. The user remains on the team settings page.

#### Test: Back navigation from team settings returns to teams list
- **Initial state**: User is on team settings for "Engineering".
- **Action**: User clicks the "Back" link or navigation button
- **Expected**: The user is navigated back to `/settings/teams` showing the full list of team cards.

#### Test: Team settings changes are reflected in sidebar navigation
- **Initial state**: User is on team settings for "Engineering". The sidebar shows "Engineering" as a team section.
- **Action**: User changes the team name from "Engineering" to "Platform"
- **Expected**: The sidebar team section header updates from "Engineering" to "Platform" without requiring a page reload.

## Labels Page (`/settings/labels`)

**Components**: LabelList, CreateLabel, EditDeleteLabel

### LabelList

#### Test: Labels page renders with list of all labels
- **Initial state**: Workspace has 3 labels: "Bug" (red), "Feature" (blue), "Improvement" (green). User navigates to `/settings/labels`.
- **Expected**: The page displays a list of 3 labels. Each label row shows a colored dot matching the label's color, the label name, and the issue count using that label. A "Create Label" button is visible at the top of the page. The page title indicates "Labels".

#### Test: Label row displays colored dot matching label color
- **Initial state**: Workspace has a label "Bug" with color red (#ef4444). User is on `/settings/labels`.
- **Expected**: The "Bug" label row displays a circular colored dot with the exact red color (#ef4444) next to the label name.

#### Test: Label row displays issue count for each label
- **Initial state**: Workspace has label "Bug" used by 5 issues, label "Feature" used by 12 issues, and label "Docs" used by 0 issues. User is on `/settings/labels`.
- **Expected**: The "Bug" row shows count "5", the "Feature" row shows count "12", and the "Docs" row shows count "0". The count is clearly visible next to or below the label name.

#### Test: Labels page shows empty state when no labels exist
- **Initial state**: Workspace has no labels. User navigates to `/settings/labels`.
- **Expected**: An empty state message is displayed (e.g., "No labels yet. Create your first label to get started.") with an icon. The "Create Label" button is still visible.

#### Test: Each label row has edit and delete action buttons
- **Initial state**: Workspace has 2 labels. User is on `/settings/labels`.
- **Expected**: Each label row displays an edit button (pencil/edit icon) and a delete button (trash/delete icon). The buttons are visible on the row (or appear on hover).

#### Test: Labels list updates after creating a new label
- **Initial state**: Workspace has 2 labels. User is on `/settings/labels`.
- **Action**: User creates a new label "Enhancement" with color purple via the Create Label form
- **Expected**: The labels list now shows 3 labels, including the newly created "Enhancement" label with a purple dot and issue count of 0. The new label appears in the list without requiring a page reload.

#### Test: Labels list updates after deleting a label
- **Initial state**: Workspace has 3 labels: "Bug", "Feature", "Improvement". User is on `/settings/labels`.
- **Action**: User deletes the "Improvement" label (clicks delete, confirms)
- **Expected**: The labels list now shows 2 labels. "Improvement" is no longer in the list. The remaining labels "Bug" and "Feature" are still displayed correctly.

#### Test: Labels list updates after editing a label
- **Initial state**: Workspace has label "Bug" with red color. User is on `/settings/labels`.
- **Action**: User edits "Bug" label, changing name to "Defect" and color to orange
- **Expected**: The labels list now shows "Defect" with an orange colored dot instead of "Bug" with red. The issue count remains unchanged.

#### Test: Label issue count reflects actual usage across issues
- **Initial state**: Workspace has label "Bug" used by 3 issues. User is on `/settings/labels`.
- **Action**: User navigates to an issue, adds the "Bug" label to it, then navigates back to `/settings/labels`
- **Expected**: The "Bug" label now shows issue count of 4, reflecting the newly tagged issue.

### CreateLabel

#### Test: Create Label button opens the create label form
- **Initial state**: User is on `/settings/labels`.
- **Action**: User clicks the "Create Label" button
- **Expected**: A create label form (inline or modal) appears with a name text input field, a color picker section showing preset color options and a custom hex input, and "Create" and "Cancel" buttons.

#### Test: Successfully create a new label with preset color
- **Initial state**: User is on `/settings/labels`. The create label form is open. Workspace has 2 existing labels.
- **Action**: User types "Bug" in the name field, selects the red preset color, and clicks "Create"
- **Expected**: The form closes. A new "Bug" label with red color appears in the labels list. The list now shows 3 labels. The new label has issue count 0.

#### Test: Successfully create a new label with custom hex color
- **Initial state**: User is on `/settings/labels`. The create label form is open.
- **Action**: User types "Custom Category" in the name field, enters "#ff6b2e" in the custom hex color input, and clicks "Create"
- **Expected**: The form closes. A new "Custom Category" label appears in the labels list with the exact custom color (#ff6b2e) displayed as its colored dot.

#### Test: Create label form validates required name field
- **Initial state**: User is on `/settings/labels`. The create label form is open.
- **Action**: User leaves the name field empty and clicks "Create"
- **Expected**: A validation error is shown indicating the name is required (e.g., "Label name is required"). The label is not created. The form remains open.

#### Test: Create label form prevents duplicate label names
- **Initial state**: Workspace has a label named "Bug". The create label form is open.
- **Action**: User types "Bug" in the name field, selects a color, and clicks "Create"
- **Expected**: An error message is displayed (e.g., "A label with this name already exists"). The label is not created. The form remains open.

#### Test: Cancel button closes create label form without creating
- **Initial state**: User is on `/settings/labels`. The create label form is open. User has typed "Draft Label" in the name field.
- **Action**: User clicks "Cancel"
- **Expected**: The form closes. No new label is created. The labels list remains unchanged. If the user opens the form again, the name field is empty (form state is reset).

#### Test: Color picker shows preset color options
- **Initial state**: User is on `/settings/labels`. The create label form is open.
- **Expected**: The color picker displays a set of preset color swatches (e.g., red, orange, yellow, green, blue, purple, pink, gray). Each swatch is clickable. A custom hex input field is also available.

#### Test: Selecting a preset color updates the color preview
- **Initial state**: User is on `/settings/labels`. The create label form is open.
- **Action**: User clicks the blue preset color swatch
- **Expected**: The selected color swatch is visually highlighted (e.g., ring/border). A color preview (colored dot or swatch) updates to show the selected blue color. The custom hex input shows the blue hex value.

#### Test: Custom hex input validates hex color format
- **Initial state**: User is on `/settings/labels`. The create label form is open.
- **Action**: User types "notacolor" in the custom hex input and clicks "Create" with a valid name
- **Expected**: A validation error is shown for the color field (e.g., "Invalid color format"). The label is not created.

#### Test: Create label form can be used multiple times in sequence
- **Initial state**: Workspace has 1 label. User is on `/settings/labels`.
- **Action**: User creates label "Bug" (red) via the form, then opens the form again and creates label "Feature" (blue)
- **Expected**: Both labels are created successfully. The labels list shows 3 labels total. The form resets correctly between uses — the second time the form opens, name field is empty and no color is pre-selected.

### EditDeleteLabel

#### Test: Clicking edit button on a label enters inline edit mode
- **Initial state**: Workspace has label "Bug" (red). User is on `/settings/labels`.
- **Action**: User clicks the edit button on the "Bug" label row
- **Expected**: The label row transforms into an inline edit mode. The name field becomes an editable text input pre-filled with "Bug". The color picker appears showing the current red color as selected. "Save" and "Cancel" buttons appear on the row.

#### Test: Successfully edit label name via inline edit
- **Initial state**: Workspace has label "Bug" (red) used by 3 issues. User is on `/settings/labels`. The "Bug" label is in inline edit mode.
- **Action**: User clears the name field, types "Defect", and clicks "Save"
- **Expected**: The label row exits edit mode. The label now shows "Defect" with the same red color. The issue count remains 3. Issues that had the "Bug" label now show "Defect" as their label.

#### Test: Successfully edit label color via inline edit
- **Initial state**: Workspace has label "Bug" (red). User is on `/settings/labels`. The "Bug" label is in inline edit mode.
- **Action**: User selects the blue preset color and clicks "Save"
- **Expected**: The label row exits edit mode. The label now shows "Bug" with a blue colored dot. The color change is reflected anywhere the label appears (e.g., issue rows, issue detail label badges).

#### Test: Edit both label name and color simultaneously
- **Initial state**: Workspace has label "Bug" (red). User is on `/settings/labels`. The "Bug" label is in inline edit mode.
- **Action**: User changes the name to "Critical Bug", selects orange color, and clicks "Save"
- **Expected**: The label row exits edit mode. The label now shows "Critical Bug" with an orange colored dot.

#### Test: Cancel inline edit reverts changes
- **Initial state**: Workspace has label "Bug" (red). User is on `/settings/labels`. The "Bug" label is in inline edit mode.
- **Action**: User changes name to "Something Else", selects blue color, then clicks "Cancel"
- **Expected**: The label row exits edit mode. The label still shows "Bug" with red color. No changes are saved.

#### Test: Edit label validates required name field
- **Initial state**: Workspace has label "Bug" (red). The "Bug" label is in inline edit mode.
- **Action**: User clears the name field completely and clicks "Save"
- **Expected**: A validation error is shown (e.g., "Label name is required"). The edit mode remains active. The label is not saved with an empty name.

#### Test: Edit label prevents duplicate label names
- **Initial state**: Workspace has labels "Bug" (red) and "Feature" (blue). The "Bug" label is in inline edit mode.
- **Action**: User changes the name to "Feature" and clicks "Save"
- **Expected**: An error message is shown (e.g., "A label with this name already exists"). The edit mode remains active. The label name is not changed.

#### Test: Edit label with custom hex color
- **Initial state**: Workspace has label "Bug" (red). The "Bug" label is in inline edit mode.
- **Action**: User enters "#22c55e" in the custom hex color input and clicks "Save"
- **Expected**: The label row exits edit mode. The label "Bug" now displays a green colored dot matching #22c55e.

#### Test: Clicking delete button shows confirmation dialog
- **Initial state**: Workspace has label "Bug" (red) used by 5 issues. User is on `/settings/labels`.
- **Action**: User clicks the delete button on the "Bug" label row
- **Expected**: A confirmation dialog appears (e.g., "Are you sure you want to delete the label 'Bug'? This label is used by 5 issues."). The dialog has "Confirm" (or "Delete") and "Cancel" buttons. The label is NOT deleted yet.

#### Test: Confirm delete removes the label
- **Initial state**: Workspace has 3 labels including "Bug" (red) used by 5 issues. The delete confirmation dialog for "Bug" is open.
- **Action**: User clicks "Confirm" (or "Delete") in the confirmation dialog
- **Expected**: The label "Bug" is deleted. The labels list now shows 2 labels. The 5 issues that had the "Bug" label no longer have it (the label is removed from their label list). The label filter dropdowns on issue pages no longer include "Bug".

#### Test: Cancel delete keeps the label
- **Initial state**: Workspace has label "Bug" (red). The delete confirmation dialog for "Bug" is open.
- **Action**: User clicks "Cancel" in the confirmation dialog
- **Expected**: The dialog closes. The "Bug" label is not deleted. The labels list remains unchanged.

#### Test: Delete label used by zero issues
- **Initial state**: Workspace has label "Archived" (gray) with 0 issues. User is on `/settings/labels`.
- **Action**: User clicks delete on "Archived", confirmation dialog shows (e.g., "Are you sure you want to delete the label 'Archived'?"), user confirms
- **Expected**: The label is deleted. The labels list no longer includes "Archived". No issues are affected since the label was unused.

#### Test: Only one label can be in edit mode at a time
- **Initial state**: Workspace has labels "Bug" (red) and "Feature" (blue). User is on `/settings/labels`. "Bug" is currently in inline edit mode.
- **Action**: User clicks the edit button on "Feature"
- **Expected**: "Bug" exits edit mode without saving changes. "Feature" enters inline edit mode. Only one label row is editable at a time.

#### Test: Edit mode is exited when delete is clicked on same label
- **Initial state**: Workspace has label "Bug" (red) in inline edit mode. User has changed name to "Defect" but not saved.
- **Action**: User clicks the delete button on the "Bug" row
- **Expected**: The inline edit mode is exited (unsaved changes are discarded). The delete confirmation dialog appears for "Bug" (the original name, not the unsaved "Defect").

## Settings Page (`/settings`)

<!-- Tests to be added by PlanPage task -->
