# Test Failures Report: app-building-1f19qf

**Generated:** 2026-03-15
**Period:** 2026-03-13 14:41 — 2026-03-14 23:31 UTC
**App:** project-tracker

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 296 |
| Logs with test failures | 70 (23.6%) |
| Logs without test failures | 226 (76.4%) |
| Total distinct test failure entries | 125 |
| Total affected tests (cluster-expanded) | 245 |
| Total test re-runs across all logs | 125 |
| Unique root causes | 112 (19 clustered + 93 unclustered) |
| Replay usage rate (all failures) | 20/125 (16.0%) |
| Replay usage rate (debugged failures) | 17/117 (14.5%) |
| Debugging success rate | 115/117 (98.3%) |
| Replay-assisted success rate | 17/17 (100.0%) |
| Recording availability rate | 96/125 (76.8%) |
| Replay decision quality (unnecessary usage) | 12/20 (60.0%) — Replay used but error output would have sufficed |
| Cascading fixes | 25 changesets resolved multiple failures |
| Self-inflicted failures | 3/125 (2.4%) — all fix-regression subtype |
| Self-inflicted fix quality cost | 3 extra re-runs |
| Pre-existing failure rate | 120/125 (96.0%) |
| Infrastructure failure events | 67 events across 22 logs, affecting 267 tests |
| Test Isolation Score | 58/125 (46.4%) — data-contamination + strict-mode + seed-data-mismatch |
| Test Isolation Score trend | 46.4% (first report) |

### Failure Phase Distribution

| Phase | Count | % |
|-------|-------|---|
| fixTests | 114 | 91.2% |
| other (journeyQA) | 10 | 8.0% |
| checkDirectives | 1 | 0.8% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % |
|----------------|-------|---|
| test-code | 59 | 47.2% |
| app-code | 31 | 24.8% |
| both | 23 | 18.4% |
| none (unresolved) | 12 | 9.6% |

### Diagnostic Source Effectiveness

| Source | Count | % |
|--------|-------|---|
| error-output | 100 | 80.0% |
| code-inspection | 8 | 6.4% |
| replay-necessary | 6 | 4.8% |
| page-snapshot | 5 | 4.0% |
| error-context-snapshot | 3 | 2.4% |
| unknown | 3 | 2.4% |

### Fix Iteration Difficulty Distribution

| Iterations | Count |
|-----------|-------|
| 0 (unresolved) | 12 |
| 1 | 79 |
| 2 | 22 |
| 3 | 8 |
| 4+ | 4 |

4+ iteration failures: backlog-drag-stale-coordinates (log 122), Remove a member from workspace (log 205), and complex multi-spec debugging sessions.

### Resolution Effort Distribution (n=125)

| Tool Calls | Count |
|-----------|-------|
| 1–3 | 14 |
| 4–9 | 69 |
| 10+ | 42 |

### Infrastructure Failure Sub-categories

| Category | Count |
|----------|-------|
| other (Netlify auth expired, agent workflow errors) | 15 |
| port-conflict | 6 |
| navigation-timeout | 1 |

**Agent workflow errors**: Several infrastructure events were caused by the agent running `npx playwright test` directly instead of `npm run test`, resulting in missing DATABASE_URL. These are process compliance gaps, not environmental problems.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Rec Avail | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-----------|----------|-------|---------|-----------|
| 119 | app-building-1f19qf | Login fails — fabricated bcrypt hash | seed-data-mismatch | yes | yes | | yes | NetworkRequest to check auth | NetworkRequest | yes | none |
| 119 | app-building-1f19qf | Active Sprint progress bar | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | none |
| 119 | app-building-1f19qf | Active Sprint progress updates | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | none |
| 120 | app-building-1f19qf | Activity feed label changes | race-condition | yes | no | code-inspection | yes | | | yes | none |
| 120 | app-building-1f19qf | Activity feed ordering | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 121 | app-building-1f19qf | assigned-row-count-contamination | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 122 | app-building-1f19qf | backlog-drag-stale-coordinates (2) | race-condition | yes | yes | | yes | PlaywrightSteps + Evaluate | PlaywrightSteps, Evaluate | yes | none |
| 122 | app-building-1f19qf | Drop target highlights | CSS/layout | yes | yes | | yes | Evaluate isOver state | Evaluate, Screenshot | yes | none |
| 122 | app-building-1f19qf | Invalid area drag cancel | race-condition | yes | yes | | yes | NetworkRequest | NetworkRequest | yes | none |
| 123 | app-building-1f19qf | Backlog section count | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 124 | app-building-1f19qf | Backlog label filter | strict-mode | yes | no | error-output-sufficient | yes | | | yes | none |
| 124 | app-building-1f19qf | Backlog breadcrumbs | strict-mode | yes | no | error-output-sufficient | yes | | | yes | none |
| 125 | app-building-1f19qf | board-column-seed-data (3) | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | none |
| 125 | app-building-1f19qf | Column WIP limit warning | api-routing | yes | no | error-output-sufficient | yes | | | yes | none |
| 125 | app-building-1f19qf | Column issue count updates | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 126 | app-building-1f19qf | Drag updates WIP indicator | wrong-url | yes | no | error-output-sufficient | yes | | | yes | 903f6765bf |
| 126 | app-building-1f19qf | Drag reorder same column | data-contamination | no | no | error-output-sufficient | yes | | | yes | 903f6765bf |
| 126 | app-building-1f19qf | Drag activity log entry | strict-mode | no | no | error-output-sufficient | yes | | | yes | 903f6765bf |
| 128 | app-building-1f19qf | Issue card label dots | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | 35459b762b |
| 128 | app-building-1f19qf | Issue card opens detail | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 35459b762b |
| 129 | app-building-1f19qf | swimlane-seed-data (2) | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | 286df2db72 |
| 131 | app-building-1f19qf | duplicate-breadcrumbs (2) | strict-mode | yes | no | error-output-sufficient | yes | | | yes | 542b3178db |
| 131 | app-building-1f19qf | Breadcrumbs on project pages | strict-mode | yes | yes | | yes | PlaywrightSteps | PlaywrightSteps | yes | 542b3178db |
| 132 | app-building-1f19qf | bulk-assign-text-assertion | CSS/layout | yes | no | error-output-sufficient | yes | | | yes | 15b8038238 |
| 133 | app-building-1f19qf | chart-rendering-issues (3) | CSS/layout | yes | no | error-output-sufficient | yes | | | yes | 397815639f |
| 134 | app-building-1f19qf | @mentions autocomplete | missing-testid | yes | no | error-output-sufficient | yes | | | no | none |
| 134 | app-building-1f19qf | comment-action-testids (2) | missing-testid | yes | no | error-output-sufficient | yes | | | no | none |
| 135 | app-building-1f19qf | auth-api-routing | api-routing | no | no | error-output-sufficient | no | | | yes | none |
| 136 | app-building-1f19qf | Lead selector dropdown | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | 80d7087fd9 |
| 136 | app-building-1f19qf | Escape closes CreateProjectModal | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 80d7087fd9 |
| 136 | app-building-1f19qf | CreateProjectModal uniqueness | race-condition | yes | no | error-output-sufficient | yes | | | yes | 80d7087fd9 |
| 137 | app-building-1f19qf | sprint-not-appearing (2) | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 3c5dca5d68 |
| 138 | app-building-1f19qf | dashboard-widget-count (3) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | c03b28299c |
| 139 | app-building-1f19qf | dashboard-data-contamination (2) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 37b1fb8966 |
| 139 | app-building-1f19qf | dashboard-login-failure | api-routing | no | no | error-output-sufficient | yes | | | yes | 37b1fb8966 |
| 140 | app-building-1f19qf | Widget switching contamination | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 2c2b5e59d4 |
| 141 | app-building-1f19qf | Sprint Burndown config | race-condition | yes | no | error-output-sufficient | yes | | | yes | 4de09a232d |
| 141 | app-building-1f19qf | Status Distribution config | bad-assertion-api | yes | no | error-output-sufficient | yes | | | yes | 4de09a232d |
| 141 | app-building-1f19qf | Widget config persistence | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 4de09a232d |
| 142 | app-building-1f19qf | dashboard-widget-display (2) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 53f977331a |
| 142 | app-building-1f19qf | Dashboard six widgets | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 53f977331a |
| 143 | app-building-1f19qf | issue-count-mismatch (2) | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | none |
| 144 | app-building-1f19qf | Filter "is not" operator | race-condition | yes | no | recording crashed | no | | | yes | none |
| 146 | app-building-1f19qf | Single filter condition | race-condition | yes | yes | | yes | NetworkRequest timing | NetworkRequest | yes | none |
| 146 | app-building-1f19qf | Multiple filter AND logic | race-condition | yes | yes | | yes | Same as companion | NetworkRequest | yes | none |
| 148 | app-building-1f19qf | Linked issues table | data-contamination | yes | no | error-output-sufficient | no | | | yes | none |
| 150 | app-building-1f19qf | goals-detail-destructive (2) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 151 | app-building-1f19qf | goals-list-destructive (4) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 153 | app-building-1f19qf | Upload via drag-and-drop | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 043cb0f56b |
| 153 | app-building-1f19qf | Upload multiple files | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 043cb0f56b |
| 155 | app-building-1f19qf | activity-feed-not-refreshed (2) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 1b77c457ac |
| 155 | app-building-1f19qf | Breadcrumbs navigation path | bad-assertion-api | yes | no | error-output-sufficient | yes | | | yes | 1b77c457ac |
| 155 | app-building-1f19qf | Delete issue via overflow | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 1b77c457ac |
| 156 | app-building-1f19qf | Status dropdown transitions | data-contamination | yes | no | error-output-sufficient | yes | | | yes | d091b2ae86 |
| 156 | app-building-1f19qf | Change version selector | data-contamination | yes | no | error-output-sufficient | yes | | | yes | d091b2ae86 |
| 160 | app-building-1f19qf | Issue row hover state | CSS/layout | yes | yes | | yes | PlaywrightSteps | PlaywrightSteps | yes | 7ce5998141 |
| 161 | app-building-1f19qf | Issues from all projects | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | 7ce5998141 |
| 161 | app-building-1f19qf | Only one column sorted | CSS/layout | yes | no | error-output-sufficient | yes | | | yes | 7ce5998141 |
| 162 | app-building-1f19qf | Pagination page count | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 162 | app-building-1f19qf | Loading state during fetch | test-setup-error | yes | no | error-output-sufficient | yes | | | yes | none |
| 163 | app-building-1f19qf | Filters applied updates | data-contamination | yes | no | error-output-sufficient | no | | | yes | 136eefd2b1 |
| 163 | app-building-1f19qf | State lost on navigation | race-condition | yes | no | code-inspection | no | | | yes | 136eefd2b1 |
| 165 | app-building-1f19qf | sort-race-condition | sort-race-condition | yes | no | code-inspection | no | | | yes | fa200e2b22 |
| 165 | app-building-1f19qf | hardcoded-sort-assertions | data-contamination | yes | no | error-output-sufficient | no | | | yes | fa200e2b22 |
| 166 | app-building-1f19qf | Escape closes detail drawer | backend-bug | yes | no | code-inspection | no | | | yes | bf68ef9730 |
| 167 | app-building-1f19qf | Sidebar project nav | strict-mode | yes | no | error-output-sufficient | yes | | | yes | f355c7317b |
| 168 | app-building-1f19qf | Create issue link | backend-bug | yes | no | code-inspection | no | | | yes | 0cb77b008c |
| 168 | app-building-1f19qf | linked-issues-contamination | data-contamination | yes | no | error-output-sufficient | no | | | yes | 0cb77b008c |
| 170 | app-building-1f19qf | Notification icon type | strict-mode | yes | no | error-output-sufficient | yes | | | yes | none |
| 170 | app-building-1f19qf | notification-contamination (2) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 170 | app-building-1f19qf | Notification navigates | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 172 | app-building-1f19qf | notifications-mark-read (2) | data-contamination | yes | no | error-output-sufficient | no | | | yes | ba5e02dced |
| 173 | app-building-1f19qf | Project card navigates | missing-testid | yes | no | error-output-sufficient | no | | | yes | c967fe411c |
| 173 | app-building-1f19qf | Project empty state | backend-bug | yes | no | error-output-sufficient | no | | | yes | c967fe411c |
| 173 | app-building-1f19qf | New project appears | data-contamination | yes | no | error-output-sufficient | no | | | yes | c967fe411c |
| 174 | app-building-1f19qf | Breadcrumb workspace nav | backend-bug | yes | no | error-output-sufficient | no | | | yes | c347080174 |
| 174 | app-building-1f19qf | Sidebar navigation | missing-testid | yes | no | code-inspection | no | | | yes | c347080174 |
| 174 | app-building-1f19qf | overview-metric-counts (2) | data-contamination | yes | no | error-output-sufficient | no | | | yes | c347080174 |
| 174 | app-building-1f19qf | Key Metrics updates | missing-testid | yes | no | error-output-sufficient | no | | | yes | c347080174 |
| 175 | app-building-1f19qf | Automation tab list | missing-testid | yes | no | error-output-sufficient | no | | | yes | 63c614c40d |
| 175 | app-building-1f19qf | Create automation rule | race-condition | no | yes | | yes | NetworkRequest verify API | NetworkRequest | yes | 63c614c40d |
| 177 | app-building-1f19qf | Component uniqueness | backend-bug | yes | no | error-output-sufficient | yes | | | yes | aafcb6f51e |
| 179 | app-building-1f19qf | Settings breadcrumbs | missing-testid | yes | no | error-output-sufficient | no | | | yes | none |
| 179 | app-building-1f19qf | settings-general-reset | data-contamination | yes | no | error-output-sufficient | no | | | yes | none |
| 179 | app-building-1f19qf | Project key uniqueness | backend-bug | yes | no | error-output-sufficient | no | | | yes | none |
| 180 | app-building-1f19qf | Version name uniqueness | backend-bug | yes | no | error-output-sufficient | yes | | | yes | c729dc4fca |
| 181 | app-building-1f19qf | Workflow editor nodes | seed-data-mismatch | yes | no | error-output-sufficient | no | | | yes | ffe45dc7a6 |
| 181 | app-building-1f19qf | Status node colors | data-contamination | yes | no | error-output-sufficient | yes | | | yes | ffe45dc7a6 |
| 181 | app-building-1f19qf | Workflow affects status dropdown | wrong-url | yes | no | code-inspection | yes | | | yes | ffe45dc7a6 |
| 185 | app-building-1f19qf | Recent Activity feed icons | data-contamination | yes | yes | | yes | NetworkRequest inspect API | NetworkRequest | yes | 70927ad75e |
| 186 | app-building-1f19qf | Recent Issues assignee | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 4e17f377d5 |
| 186 | app-building-1f19qf | project-key-collision | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 4e17f377d5 |
| 187 | app-building-1f19qf | reports-sql-syntax (2) | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkReq | PlaywrightSteps, NetworkReq | yes | 4e17f377d5 |
| 187 | app-building-1f19qf | recharts-selector-mismatch | CSS/layout | yes | yes | | yes | InspectElement SVG | InspectElement, Screenshot | yes | 4e17f377d5 |
| 187 | app-building-1f19qf | Sprint Burndown chart | backend-bug | yes | yes | | yes | NetworkRequest inspect API | NetworkRequest | yes | 4e17f377d5 |
| 191 | app-building-1f19qf | saved-filter-conditions | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| 192 | app-building-1f19qf | sprint-progress-contamination (2) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 193 | app-building-1f19qf | Sprint story points | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 193 | app-building-1f19qf | sprint-section-contamination (3) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 196 | app-building-1f19qf | Dependency arrows update | race-condition | yes | no | code-inspection | yes | | | yes | none |
| 197 | app-building-1f19qf | Drag bar move date range | data-contamination | yes | yes | | yes | NetworkRequest check API | PlaywrightSteps, NetworkReq | yes | none |
| 198 | app-building-1f19qf | Empty state no match | backend-bug | yes | yes | | yes | PlaywrightSteps find stuck | PlaywrightSteps, Screenshot | yes | none |
| 199 | app-building-1f19qf | Left panel epics | backend-bug | yes | no | error-output-sufficient | no | | | yes | 70e8ded127 |
| 201 | app-building-1f19qf | notifications-badge-cross-run (2) | data-contamination | yes | no | error-output-sufficient | no | | | yes | 46fa5c1e5d |
| 203 | app-building-1f19qf | Non-admin access | backend-bug | yes | no | error-output-sufficient | no | | | yes | e280cdec77 |
| 204 | app-building-1f19qf | Cancel label deletion | data-contamination | yes | no | error-output-sufficient | yes | | | yes | c4f063e242 |
| 204 | app-building-1f19qf | Label uniqueness | backend-bug | yes | no | error-output-sufficient | yes | | | yes | c4f063e242 |
| 205 | app-building-1f19qf | rtk-serialized-error (3) | backend-bug | yes | no | error-output-sufficient | no | | | yes | f7c02e452d |
| 205 | app-building-1f19qf | Remove workspace member | backend-bug | yes | no | error-output-sufficient | no | | | yes | f7c02e452d |
| 205 | app-building-1f19qf | Members tab list | data-contamination | yes | no | error-output-sufficient | no | | | yes | f7c02e452d |
| 206 | app-building-1f19qf | Cancel status deletion | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| 206 | app-building-1f19qf | Status uniqueness | backend-bug | yes | no | error-output-sufficient | yes | | | yes | none |
| 207 | app-building-1f19qf | Workflow uniqueness | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 798842dd35 |
| 207 | app-building-1f19qf | Workflow editor statuses | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 798842dd35 |
| 224 | app-building-1f19qf | Drag between sprints | race-condition | yes | no | out-of-scope | yes | | | N/A | none |
| 291 | app-building-1f19qf | Drag between sprints | race-condition | yes | yes | | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | partial | none |
| 292 | app-building-1f19qf | Issue card opens drawer | bad-assertion-api | yes | yes | | yes | PlaywrightSteps | PlaywrightSteps | yes | none |
| 293 | app-building-1f19qf | Sort by Key descending | other | yes | yes | | yes | Error output only | | N/A | none |
| 293 | app-building-1f19qf | Sort by Story Points | other | yes | yes | | yes | Error output only | | N/A | none |
| 293 | app-building-1f19qf | Filter pagination persist | race-condition | yes | yes | | yes | Error output only | | N/A | none |
| 294 | app-building-1f19qf | css-display-inline-block (2) | CSS/layout | yes | no | error-output-sufficient | yes | | | yes | 44a5eaa0df |
| 295 | app-building-1f19qf | Breadcrumb workspace nav | other | yes | no | error-output-sufficient | yes | | | N/A | none |
| 295 | app-building-1f19qf | Project sidebar nav | missing-testid | yes | no | error-output-sufficient | yes | | | N/A | none |
| 295 | app-building-1f19qf | Tooltip on hover | timeout | yes | no | error-output-sufficient | yes | | | N/A | none |
| 295 | app-building-1f19qf | dashboard-selector (2) | timeout | yes | no | error-output-sufficient | yes | | | N/A | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| dashboard-seed-contamination | 6 | 138, 139, 140, 142 | 53f977331a, 4de09a232d, 37b1fb8966, 2c2b5e59d4, c03b28299c |
| rtk-serialized-error-handling | 3 | 204, 205, 206 | f7c02e452d, c4f063e242 |
| sprint-issue-count-mismatch | 2 | 119 | none (fixed via seed data) |
| backlog-drag-stale-coordinates | 2 | 122 | none (partially diagnosed) |
| board-drag-drop-serial-contamination | 2 | 126 | 903f6765bf |
| filter-race-condition | 2 | 146 | none (diagnosed via Replay) |
| hardcoded-issue-count-44 | 2 | 163, 165 | 136eefd2b1 |
| seed-data-not-restored-after-delete | 2 | 204, 206 | c4f063e242 |

**Note:** The `rtk-serialized-error-handling` and `seed-data-not-restored-after-delete` clusters both stem from a systemic issue with RTK Query's SerializedError stripping the original error `message` field. The fix was to extract the message from `data?.message` in catch blocks across labels, statuses, and members settings pages. The delete-ordering clusters share a common pattern: destructive tests run before assertion tests, requiring beforeEach seed restoration.

**Note:** The `dashboard-seed-contamination` cluster (6 failures across 4 logs) represents the largest single root cause. Dashboard widget tests accumulated data across runs because `truncateAndSeed` didn't reset dashboard-specific tables. Each log in this sequence progressively identified and fixed different tables (dashboards, dashboard_widgets, etc.).

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 41 | 32.8% |
| backend-bug | 22 | 17.6% |
| race-condition | 15 | 12.0% |
| seed-data-mismatch | 10 | 8.0% |
| missing-testid | 8 | 6.4% |
| CSS/layout | 7 | 5.6% |
| strict-mode | 7 | 5.6% |
| api-routing | 3 | 2.4% |
| bad-assertion-api | 3 | 2.4% |
| other | 3 | 2.4% |
| wrong-url | 2 | 1.6% |
| timeout | 2 | 1.6% |
| test-setup-error | 1 | 0.8% |
| sort-race-condition | 1 | 0.8% |

### Data-Contamination Sub-categories

Data-contamination is not dominant (32.8% < 40% threshold), but is still the single largest category:

| Sub-category | Count | % of DC |
|-------------|-------|---------|
| destructive-ordering | 18 | 43.9% |
| cross-run-accumulation | 13 | 31.7% |
| accumulated-data | 10 | 24.4% |

**Destructive-ordering** (43.9% of DC) is the dominant sub-pattern — tests that delete/modify records run before tests that assert on those records. The fix pattern is consistently to add `beforeEach` API calls that restore seed data.

**Cross-run-accumulation** (31.7% of DC) — records accumulate across test re-runs because `truncateAndSeed` doesn't cover all tables. The dashboard tables were the primary offender, requiring progressive table additions to the seed function.

### When Was Replay Most Effective?

Replay was most valuable for:
1. **Race conditions with timing-dependent DOM state** — e.g., filter race condition (log 146) where NetworkRequest revealed the module was loaded twice, causing stale requestId.
2. **Complex CSS/layout issues** — e.g., hover state (log 160) where PlaywrightSteps confirmed CSS :hover wasn't applied, and recharts SVG structure (log 187) where InspectElement revealed hidden axis elements.
3. **Backend data issues** — e.g., report charts (log 187) where NetworkRequest revealed empty `dailyData` arrays and SQL syntax errors; drag-and-drop coordinate issues (log 122).
4. **JourneyQA verification** — e.g., issue card drawer (log 292) confirming the app's drawer UX is correct but the test expectation is wrong.

Most effective tool combinations:
- `PlaywrightSteps` → `Screenshot` (visual state verification)
- `NetworkRequest` → `Evaluate` (API + runtime state)
- `PlaywrightSteps` → `NetworkRequest` (step identification + data verification)

### When Was Replay NOT Used and Why?

105 out of 125 failures (84%) did not use Replay:
- **error-output-sufficient** (86 cases): Error messages + page snapshots provided enough context. This was particularly true for data-contamination (expected count vs actual count), backend-bug (error message text mismatches), and strict-mode (ambiguous selector) failures.
- **code-inspection** (8 cases): Reading the source code revealed the root cause faster than Replay analysis.
- **no-recording / recording crashed** (5 cases): Recording not available.
- **out-of-scope** (1 case): Pre-existing flaky test unrelated to current work.

### Self-Inflicted Failure Rate

**3/125 (2.4%)** — All three were **fix-regression** subtype: a fix attempt during debugging introduced a new failure. This is a healthy rate indicating good fix quality.

### Test Isolation Issues

The Test Isolation Score is 46.4% (58/125), just below the 50% threshold but still significant. The breakdown:
- data-contamination: 41 (32.8%)
- seed-data-mismatch: 10 (8.0%)
- strict-mode: 7 (5.6%)

Most affected spec files:
- Dashboard-related specs (dashboard-selector, dashboard-widget-grid, dashboard-widget-config) — 6 failures from accumulated widget/dashboard data
- Workspace settings specs (labels, statuses, members, workflows) — 5 failures from destructive-ordering
- Sprint/backlog specs — 4 failures from cross-run accumulation
- Notification specs — 3 failures from accumulated notification data

The primary isolation strategy needed is `beforeEach` seed reset calls. The `truncateAndSeed` function was progressively expanded during the session to cover more tables.

### Common Debugging Strategies That Worked

1. **Error output + code inspection** — The dominant strategy (80%+ of resolved failures). Error messages from Playwright were rich enough to identify: wrong counts, missing elements, wrong text content.
2. **Progressive seed function expansion** — Each data-contamination fix identified missing tables in `truncateAndSeed`, building up comprehensive cleanup.
3. **RTK SerializedError pattern** — Once identified in labels (log 204), the same fix was applied to statuses and members, resolving 3 cluster entries.

### Common Debugging Strategies That Failed

1. **Assuming CSS issues are visual** — Several strict-mode failures were initially suspected as CSS/layout but were actually selector ambiguity issues.
2. **Replay for simple count mismatches** — 12/20 Replay usages were unnecessary (60% decision quality gap). Error output alone would have sufficed.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "error-output-first" heuristic**: For data-contamination and backend-bug categories, error output is sufficient 90%+ of the time. Add guidance to check error output and page snapshots before invoking Replay MCP tools. This would have saved Replay invocations in 12 of 20 cases.
- **Add "RTK SerializedError" pattern**: When error messages show generic "X failed" instead of specific backend messages, check RTK Query catch blocks for `SerializedError` stripping the `message` field. Fix: extract from `(error as any).data?.message || error.message`.
- **Add "truncateAndSeed checklist"**: When adding new database tables, always add them to the seed function's truncation list. Missing tables cause cross-run-accumulation failures that are hard to diagnose.

### `skills/tasks/build/testing.md`

- **Mandate `beforeEach` seed restoration for destructive tests**: Any spec file that includes delete/modify operations should have a `beforeEach` that calls the truncateAndSeed API. This addresses the 18 destructive-ordering failures (14.4% of all failures).
- **Require `test.describe.serial()` audit**: When a spec file has both destructive and read-only tests, either reorder tests or add `beforeEach` cleanup. The pattern of "delete test runs first, assertion test fails" recurred across goals, labels, statuses, and members specs.
- **Add dashboard table seeding**: Dashboard tables (dashboards, dashboard_widgets) must be included in truncateAndSeed from the start. The 6-failure dashboard cluster was the largest single root cause.

### `skills/review/reportTestFailures.md`

- **Add "Replay decision quality" metric to template**: The 60% unnecessary-usage rate is a key efficiency signal. Consider adding guidance to the analysis template to explicitly justify Replay usage when error output is available.
- **Add "infrastructure sub-category: agent-workflow-error"**: Several infra events were caused by running `npx playwright test` directly instead of `npm run test`. This should be a distinct sub-category to distinguish process compliance issues from real infrastructure problems.
- **Consider adding FAILURE_RESOLUTION_SCOPE field**: Track whether a fix was localized to one spec file or required cross-spec changes. This would help identify systemic issues earlier.

## 5. Replay Fixes Table

INITIAL_CHANGESET: N/A
FAILING_TEST: all 8 tests in active-sprint.spec.ts
FINAL_CHANGESET: none
ASSESSMENT: Confirmed login POST returned 401 Unauthorized — bcrypt hash in seed data was fabricated and didn't match "demo123"

INITIAL_CHANGESET: N/A
FAILING_TEST: backlog-drag-drop.spec.ts — multiple drag tests
FINAL_CHANGESET: none
ASSESSMENT: Revealed that performDragDrop function's source element coordinates became stale after scrolling target into view. Main container scrollTop changed between getting source bbox and clicking. Also revealed collision detection resolving to sortable items inside droppables instead of containers.

INITIAL_CHANGESET: N/A
FAILING_TEST: Drop target highlights when dragging over a section
FINAL_CHANGESET: none
ASSESSMENT: useDroppable's isOver never becomes true because closestCorners resolves to sortable items inside the droppable, not the container itself. Required adding onDragOver handler with overContainerId state tracking.

INITIAL_CHANGESET: N/A
FAILING_TEST: Dropping in an invalid area cancels the drag
FINAL_CHANGESET: none
ASSESSMENT: closestCorners collision detection resolved to Sprint 2 droppable even though pointer was on the toolbar. Required custom collision detection using pointerWithin + closestCorners hybrid, plus fixing toolbar scroll coordinates in test.

INITIAL_CHANGESET: N/A
FAILING_TEST: breadcrumbs.spec.ts
FINAL_CHANGESET: 542b3178db
ASSESSMENT: PlaywrightSteps showed test completed through List page but stopped at Reports nav click — confirmed ambiguous nav-reports selector

INITIAL_CHANGESET: N/A
FAILING_TEST: Applying a single filter condition filters the table
FINAL_CHANGESET: none
ASSESSMENT: Revealed that the requestId module variable was unreliable because the module was loaded twice (2 hits on import), and showed timing of network requests vs DOM assertions confirming race condition between stale and filtered responses.

INITIAL_CHANGESET: N/A
FAILING_TEST: Issue row shows hover state
FINAL_CHANGESET: 7ce5998141
ASSESSMENT: Confirmed that both bgBefore and bgAfter were rgba(0,0,0,0) — CSS :hover not applied by Playwright hover in Replay Chromium

INITIAL_CHANGESET: N/A
FAILING_TEST: Create a new automation rule
FINAL_CHANGESET: 63c614c40d
ASSESSMENT: Confirmed that API calls succeeded (POST 201, GET 200 returning 2 rules) but the test captured initialCount=0 because navigateToAutomationTab returned during loading state before rules rendered

INITIAL_CHANGESET: N/A
FAILING_TEST: tests/recent-activity.spec.ts
FINAL_CHANGESET: 70927ad75e
ASSESSMENT: Confirmed that the API returned only "created" activity entries — no "assigned" or "status_changed" entries in top 20 due to accumulated test-created issues

INITIAL_CHANGESET: N/A
FAILING_TEST: tests/report-charts.spec.ts
FINAL_CHANGESET: 4e17f377d5
ASSESSMENT: Confirmed API responses returned empty data arrays and SQL syntax errors; later confirmed burndown dailyData was empty due to date parsing bug

INITIAL_CHANGESET: N/A
FAILING_TEST: tests/report-charts.spec.ts — recharts selectors
FINAL_CHANGESET: 4e17f377d5
ASSESSMENT: Revealed that Recharts SVG tick elements have 0px width (hidden to Playwright), labels are in separate z-index layer not inside axis groups, and .recharts-surface matches both chart and legend icons

INITIAL_CHANGESET: N/A
FAILING_TEST: tests/report-charts.spec.ts — Sprint Burndown
FINAL_CHANGESET: 4e17f377d5
ASSESSMENT: Confirmed burndown API returned dailyData: [] despite valid sprint data, due to neon driver returning Date objects that String() converted incorrectly

INITIAL_CHANGESET: N/A
FAILING_TEST: Drag bar to move entire date range
FINAL_CHANGESET: none
ASSESSMENT: Confirmed that PLAT-5's dates were modified by prior tests — the start_date was 2026-02-26 (not the expected seed value 2026-03-05) at the point of the failing assertion

INITIAL_CHANGESET: N/A
FAILING_TEST: Empty state when filters match no items
FINAL_CHANGESET: none
ASSESSMENT: Confirmed that the assignee dropdown only contained Alex Kim, Emily Rodriguez, and Sarah Chen — not Taylor Swift. The backend timeline API query joined users on assigned issues, excluding workspace members not assigned to any project issues.

INITIAL_CHANGESET: N/A
FAILING_TEST: Drag issue between two different sprints
FINAL_CHANGESET: none
ASSESSMENT: Replay screenshots revealed that the drag operation's mouse coordinates missed the empty Sprint 3 droppable section — the drop landed on another issue's droppable area instead of the Sprint 3 container

INITIAL_CHANGESET: N/A
FAILING_TEST: Clicking an issue card opens the issue detail drawer
FINAL_CHANGESET: none
ASSESSMENT: Replay analysis revealed the test expected URL navigation to /issues/PLAT-8 after clicking a board card, but the app opens a drawer overlay instead (setDrawerIssueKey). The page URL stays on /projects/PLAT/board. This is the intended UX pattern for boards — the test expectation is wrong, not the app.
