# App Revisions

## 2026-03-16: Dropdown overlay mask for click-outside-to-close

All dropdown menus now use a transparent fixed overlay mask (`dropdown-mask` class in `index.css`) instead of `document.addEventListener('mousedown', handleClickOutside)` to capture outside clicks and close the dropdown. This ensures reliable click-to-close behavior across all dropdowns.

Affected components: TeamFilters, GroupBySort, ProjectFilters, MemberActions, ProjectHeader, IssueSidebar, CreateIssueForm, BulkActions, FiltersToolbar, IssueRow, IssueHeader, WorkspaceSettings, CycleDetail, CreateProjectModal, ProjectIssuesTab.
