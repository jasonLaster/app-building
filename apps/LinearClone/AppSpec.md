# LinearClone — Project Management App

A project management application inspired by Linear, designed for software development teams to track issues, plan sprints, and manage projects with a clean, fast, keyboard-friendly interface.

## Core Concepts

- **Workspace**: The top-level container. Each workspace has its own projects, teams, and members. For this app, there is a single workspace.
- **Team**: A group of members working together (e.g., "Engineering", "Design"). Each team has its own set of issues, cycles, and views.
- **Project**: A cross-team initiative that groups related issues toward a larger goal. Projects have a status, target date, lead, and progress bar based on completed issues.
- **Issue**: The fundamental unit of work. Issues have a title, description, status, priority, assignee, labels, project, and cycle.
- **Cycle**: A time-boxed iteration (like a sprint). Each team can have one active cycle at a time.
- **Label**: Tags for categorizing issues (e.g., "Bug", "Feature", "Improvement").
- **Member**: A user in the workspace who can be assigned issues and belong to teams.

## Authentication

Simple email-based authentication (no OAuth). Users sign up with name, email, and password. On first login, a default workspace is created. Sessions are managed via a session token stored in localStorage.

### Pages

- **Login Page** (`/login`): Email + password fields, "Sign in" button, link to sign up.
- **Sign Up Page** (`/signup`): Name, email, password fields, "Create account" button, link to login.

## Navigation

A collapsible left sidebar present on all authenticated pages:

### Sidebar Sections

1. **Workspace Header** — Workspace name at top, clickable to go to home.
2. **Main Navigation**:
   - My Issues (icon: user-circle)
   - Inbox (icon: inbox) — Shows notification count badge
3. **Team Section** — For each team:
   - Team name as section header (collapsible)
   - Issues (icon: list)
   - Active Cycle (icon: refresh-cw)
   - Projects (icon: folder)
   - Views (icon: layout) — Saved filtered views
4. **Workspace Section**:
   - All Projects (icon: folder)
   - All Teams (icon: users)
   - Members (icon: user-plus)
   - Labels (icon: tag)
   - Settings (icon: settings)

The sidebar should be collapsible to icon-only mode via a toggle button.

## Issue Statuses

Issues flow through these statuses (each with a distinct icon and color):

| Status       | Icon         | Color   |
|-------------|-------------|---------|
| Backlog      | dotted circle | gray    |
| Todo         | circle       | gray    |
| In Progress  | half circle  | yellow  |
| In Review    | three-quarter circle | blue |
| Done         | check circle | green   |
| Cancelled    | x-circle     | red     |

## Issue Priorities

| Priority | Icon            | Color  |
|----------|----------------|--------|
| Urgent   | alert-triangle  | red    |
| High     | arrow-up        | orange |
| Medium   | minus           | yellow |
| Low      | arrow-down      | blue   |
| No Priority | dots-horizontal | gray |

## Pages

### My Issues Page (`/my-issues`)

A filtered view showing all issues assigned to the current user, grouped by status. Each group is collapsible.

**Issue Row** displays:
- Priority icon
- Issue identifier (e.g., `ENG-42`)
- Title (clickable, navigates to issue detail)
- Status icon (clickable to change status)
- Labels as small colored badges
- Assignee avatar
- Due date (if set)
- Project name (if assigned)

**Filters toolbar** at top:
- Status filter (multi-select dropdown)
- Priority filter (multi-select dropdown)
- Label filter (multi-select dropdown)

### Inbox Page (`/inbox`)

Shows notifications for the current user:
- Issue assigned to you
- Issue you're subscribed to was updated
- You were mentioned in a comment

Each notification row shows: icon for type, issue identifier, brief description, relative timestamp.
Notifications can be marked as read (click) or archived. Unread notifications are visually distinct (bold, left border accent).

### Team Issues Page (`/team/:teamId/issues`)

The primary issue list for a team. Similar layout to My Issues but shows all team issues.

**Features**:
- Group by: Status (default), Priority, Assignee, Project, Label, None
- Sort by: Priority, Created date, Updated date, Status
- Filter by: Status, Priority, Assignee, Label, Project, Cycle
- Bulk actions: Select multiple issues via checkboxes, then change status/priority/assignee/label
- "New Issue" button opens a create issue modal

**Issue Row** (same as My Issues but also shows):
- Checkbox for bulk selection
- Team identifier prefix (e.g., `ENG-42`)

### Issue Detail Page (`/issue/:issueId`)

Full issue view with inline editing for all fields.

**Left Panel** (main content, ~70% width):
- Issue identifier and title (inline editable, large font)
- Status selector (inline dropdown)
- Description (rich text area, supports markdown, inline editable)
- **Activity / Comments section** at bottom:
  - Tab toggle: "Activity" | "Comments"
  - Activity tab shows chronological history of all changes (status changes, assignee changes, etc.)
  - Comments tab shows user comments with avatar, name, timestamp
  - Comment input box with "Comment" button at bottom
  - Each comment shows author avatar, name, relative timestamp, and content

**Right Panel** (sidebar, ~30% width):
- **Status**: Dropdown selector showing current status with icon
- **Priority**: Dropdown selector showing current priority with icon
- **Assignee**: Searchable member selector with avatar
- **Labels**: Multi-select label picker with colored dots
- **Project**: Searchable project selector
- **Cycle**: Dropdown showing available cycles for the team
- **Due Date**: Date picker
- **Created**: Timestamp (read-only)
- **Updated**: Timestamp (read-only)

**Sub-issues section** (below description):
- List of child issues
- "Add sub-issue" button

### Create Issue Modal

Triggered from any issues list page via "New Issue" button or keyboard shortcut.

**Fields**:
- Team selector (dropdown, defaults to current team if on a team page)
- Title (text input, required)
- Description (text area, supports markdown)
- Status (dropdown, defaults to "Backlog")
- Priority (dropdown, defaults to "No Priority")
- Assignee (searchable member selector)
- Labels (multi-select)
- Project (optional, searchable selector)
- Cycle (optional, dropdown of team's cycles)
- Due date (date picker)
- Parent issue (optional, searchable issue selector for sub-issues)

**Actions**: "Create Issue" button, "Cancel" button. After creation, show the new issue identifier briefly and navigate to the issues list.

### Active Cycle Page (`/team/:teamId/cycles`)

Shows the team's cycles.

**Cycle List**:
- Each cycle shows: Name, date range, progress bar (% of issues done), issue count
- Active cycle is highlighted
- Click a cycle to view its issues

**Cycle Detail View**:
- Cycle name and date range at top
- Progress stats: Total issues, completed, in progress, remaining
- Progress bar showing completion percentage
- Issue list (same layout as Team Issues, filtered to this cycle)
- Burndown-style summary: issues completed per day as a simple bar chart

**Create Cycle**:
- "New Cycle" button
- Fields: Name, Start date, End date
- Only one cycle can be active at a time per team

### Projects Page (`/projects`)

Lists all projects across all teams.

**Project Card** displays:
- Project name (clickable)
- Status badge (Planned, In Progress, Completed, Cancelled)
- Lead (avatar + name)
- Target date
- Progress bar (issues completed / total)
- Team icons showing which teams have issues in this project

**Filters**: Status filter, Lead filter, Team filter

**Create Project** button opens a modal:
- Name (required)
- Description (text area)
- Status (dropdown)
- Lead (searchable member selector)
- Target date (date picker)
- Teams (multi-select)

### Project Detail Page (`/project/:projectId`)

**Header**:
- Project name (inline editable)
- Status badge (inline editable)
- Progress bar
- Target date (inline editable)
- Lead (inline editable)

**Tabs**:
- **Issues**: All issues in this project, grouped by team, with standard issue list layout
- **Overview**: Description (editable), milestones, key metrics

### Members Page (`/settings/members`)

List of all workspace members.

**Member Row**:
- Avatar
- Name
- Email
- Role (Admin, Member)
- Teams they belong to (as badges)

**Actions**:
- "Invite Member" button → modal with email field
- Change role dropdown
- Remove member (with confirmation)

### Teams Management Page (`/settings/teams`)

**Team Card**:
- Team name
- Identifier prefix (e.g., "ENG")
- Member count
- Active cycle name (if any)

**Create Team** button → modal:
- Name (required)
- Identifier prefix (required, uppercase, 2-5 chars)
- Description

Click a team card to see team settings:
- Edit name, description, identifier
- Manage team members (add/remove)

### Labels Page (`/settings/labels`)

**Label List**:
- Each label shows: Colored dot, name, issue count using this label
- Edit button (inline edit name and color)
- Delete button (with confirmation)

**Create Label** button:
- Name field
- Color picker (preset colors + custom hex)

### Settings Page (`/settings`)

Workspace-level settings:
- Workspace name (editable)
- Default team for new issues

## Keyboard Shortcuts

The app supports keyboard shortcuts for power users:
- `C` — Open create issue modal
- `G` then `I` — Go to My Issues
- `G` then `N` — Go to Inbox

## Visual Design

The app has a clean, minimal, modern design:

- **Color scheme**: Dark mode by default. Background `#0f1117`, surface `#1a1d24`, borders `#2a2d35`, primary accent `#5e6ad2` (Linear's signature purple-blue).
- **Typography**: System font stack (Inter preferred). Issue titles 14px medium, descriptions 13px regular, labels/metadata 12px.
- **Spacing**: Compact but readable. Issue rows ~36px height. Generous whitespace in detail views.
- **Animations**: Subtle transitions on hover states and dropdown opens (150ms ease).
- **Empty states**: Friendly messages with icons when lists are empty (e.g., "No issues yet. Create your first issue to get started.")
