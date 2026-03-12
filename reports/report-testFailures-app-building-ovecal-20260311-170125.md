# Test Failures Report: app-building-ovecal-20260311-170125

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 157 |
| Logs with test failures | 28 |
| Logs without test failures | 129 |
| Total distinct test failure entries | 42 |
| Total affected tests | 87 |
| Replay usage rate | 4.8% (2/42) |
| Replay usage rate among debugged failures | 4.9% (2/41) |
| Debugging success rate | 100% (41/41) |
| Replay-assisted success rate | 100% (2/2) |
| Recording availability rate | 95.2% (40/42) |
| Debugging efficiency (Replay used but error output sufficed) | 100% (2/2) |
| Cascading fixes | 14 (single changes resolving multiple failures) |
| Self-inflicted failures | 7 (16.7% of total) |
| Total test re-runs across all logs | 60 |
| Unique root causes | 40 (21 named clusters + 19 unclustered) |
| Fix reuse rate | 0 (no fix pattern applied to multiple spec files) |
| Pre-existing failure rate | 88.1% (37/42) |
| Test Isolation Score | 43.2% (19/42 — data-contamination + strict-mode + seed-data-mismatch) |
| Replay decision quality | 100% unnecessary (2/2 REPLAY_NECESSARY=no among REPLAY_USED=yes) |
| Infrastructure failure events | 20 events across 10 logs, affecting 225 total test runs |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 31 | 73.8% |
| checkDirectives | 6 | 14.3% |
| other (JourneyQA) | 3 | 7.1% |
| deployment | 2 | 4.8% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|-----------------|-------|------------|
| test-code | 25 | 59.5% |
| app-code | 10 | 23.8% |
| both | 6 | 14.3% |
| none | 1 | 2.4% |

### Diagnostic Source Effectiveness (among resolved failures)

| Source | Count | % of Total |
|--------|-------|------------|
| error-output | 38 | 92.7% |
| code-inspection | 3 | 7.3% |
| page-snapshot | 1 | 2.4% |

### Self-Inflicted Fix Quality Cost

- 7 self-inflicted failures, each resolved in 1 iteration
- Total additional re-runs caused: 7

### Fix Iteration Difficulty Distribution

| Iterations | Count | Notes |
|------------|-------|-------|
| 0 | 1 | Transient timeout, not debugged |
| 1 | 35 | 83.3% resolved on first attempt |
| 2 | 2 | group-rename-contamination, notification-state-contamination |
| 3 | 1 | Notification assigned race-condition |
| 4+ | 3 | velocity-chart-date-mismatch (4), @mention race x2 (6 each) |

**4+ iteration failures (outliers):**
- `@mention a user in a comment` / `@mention autocomplete works on repeated use` (Worker 2, issue-detail-filtersLoaded-race): 6 iterations, 25 tool calls — race condition in comment textarea requiring filtersLoaded guard
- `velocity-chart-date-mismatch` cluster (Worker 6): 4 iterations, 15 tool calls — backend date comparison bug in velocity stats query

### Resolution Effort Distribution (TOOL_CALL_COUNT, 30 entries with data)

| Tool Calls | Count | % |
|------------|-------|---|
| 1-3 | 4 | 13.3% |
| 4-9 | 18 | 60.0% |
| 10+ | 8 | 26.7% |

---

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| W1-23-26 | W1/planwise | Notification is created when user is assigned to an issue | race-condition | yes | no | code-inspection | yes | | | yes | none |
| W2-20-34 | W2/planwise | Cluster: dashboard-blocked-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-22-03 | W2/planwise | @mention a user in a comment | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-22-03 | W2/planwise | Comments display in chronological order | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-22-03 | W2/planwise | @mention autocomplete works on repeated use | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-23-41 | W2/planwise | Notifications are ordered by most recent first | backend-bug | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-00-58 | W2/planwise | Cluster: project-comments-duplicate-push (4 tests) | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-00-58 | W2/planwise | @mention autocomplete in project comments | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-01-40 | W2/planwise | Cluster: projects-put-nullifies-fields (8 tests) | backend-bug | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-01-40 | W2/planwise | Cluster: project-data-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-01-40 | W2/planwise | Clear start date / Clear target date | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W2-02-39 | W2/planwise | Cluster: settings-user-data-contamination (9 tests) | data-contamination | yes | no | page-snapshot | yes | | | yes | none |
| W2-02-39 | W2/planwise | Cancel display name edit by pressing Escape | race-condition | yes | no | code-inspection | yes | | | yes | none |
| W3-20-40 | W3/planwise | Category breakdown handles issues with multiple labels | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 9ff056fc16 |
| W3-22-10 | W3/planwise | Cluster: dependency-data-contamination (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 46ae02211b |
| W3-01-02 | W3/planwise | Viewer cannot edit project name | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 1b87f21ffb |
| W4-20-50 | W4/planwise | Progress chart updates after changing an issue status | backend-bug | yes | no | error-output-sufficient | yes | | | yes | 2c2fe9ec81 |
| W4-01-08 | W4/planwise | Issues tab displays mixed statuses and priorities correctly | data-contamination | no | no | error-output-sufficient | yes | | | yes | none |
| W4-02-53 | W4/planwise | production app (missing _redirects) | api-routing | yes | yes | | yes | NetworkRequest → Screenshot | NetworkRequest, ConsoleMessages, Screenshot | yes | none |
| W4-02-53 | W4/planwise | production app (ESM require) | backend-bug | yes | yes | | yes | NetworkRequest → curl → grep | NetworkRequest, Screenshot | yes | none |
| W5-22-24 | W5/planwise | Status selector displays current status and allows change | strict-mode | yes | no | error-output-sufficient | yes | | | yes | none |
| W5-22-24 | W5/planwise | Labels selector supports multiple selection | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W5-22-24 | W5/planwise | Cluster: seed-data-and-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W6-21-05 | W6/planwise | Cluster: velocity-chart-date-mismatch (4 tests) | backend-bug | yes | no | error-output-sufficient | no | | | yes | none |
| W6-22-30 | W6/planwise | Bulk action with filters active | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W6-01-59 | W6/planwise | Create a new group | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W6-01-59 | W6/planwise | Cluster: group-rename-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W7-22-35 | W7/planwise | Filter by due date range | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | none |
| W7-02-04 | W7/planwise | Cluster: label-count-race-condition (4 tests) | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W8-02-10 | W8/planwise | Invite a new user | race-condition | yes | no | error-output-sufficient | yes | | | yes | fe5280e2b9 |
| W8-02-10 | W8/planwise | User list shows all seeded users with correct information | data-contamination | yes | no | error-output-sufficient | yes | | | yes | fe5280e2b9 |
| W9-22-49 | W9/planwise | Cluster: issues-table-sorting (3 tests) | race-condition | yes | no | error-output-sufficient | yes | | | yes | none |
| W11-23-03 | W11/planwise | Cluster: notification-state-contamination (8 tests) | data-contamination | yes | no | code-inspection | yes | | | yes | none |
| W20-04-12 | W20/planwise | Cluster: project-date-data-contamination (2 tests) | data-contamination | no | no | error-output-sufficient | yes | | | yes | none |
| W20-04-12 | W20/planwise | Comments display in chronological order on projects | timeout | no | no | error-output-sufficient | yes | | | — | none |
| W22-04-39 | W22/planwise | Cluster: velocity-hardcoded-color-selector (2 tests) | missing-testid | yes | no | error-output-sufficient | yes | | | yes | none |
| W22-04-39 | W22/planwise | Summary card values update after creating a new issue | other | yes | no | error-output-sufficient | yes | | | yes | none |
| W22-04-39 | W22/planwise | Cluster: blocked-issues-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | none |
| W26-05-02 | W26/planwise | Cluster: custom-select-interaction (2 tests) | strict-mode | no | no | error-output-sufficient | yes | | | yes | none |
| W54-07-01 | W54/planwise | Admin cannot change their own role to non-admin | strict-mode | yes | no | error-output-sufficient | no | | | yes | none |
| W55-07-23 | W55/planwise | Assignee selector supports multiple users and groups | race-condition | yes | no | error-output-sufficient | yes | | | yes | 96bfd8c735 |
| W58-07-46 | W58/planwise | Viewer reviews dashboard with summary cards and charts | missing-testid | no | no | error-output-sufficient | yes | | | yes | 3d9d662f93 |

### Root Cause Clusters

| Cluster | Count | Affected Tests | Logs | Resolution |
|---------|-------|----------------|------|------------|
| issue-detail-filtersLoaded-race | 2 entries | 2 | W2-22-03 | Fixed with filtersLoaded guard in comment textarea — both resolved |
| project-comments-duplicate-push | 1 entry | 4 | W2-00-58 | Fixed duplicate push in app-code — all 4 resolved |
| project-detail-filtersLoaded-race | 1 entry | 1 | W2-00-58 | Fixed with same filtersLoaded pattern — resolved |
| projects-put-nullifies-fields | 1 entry | 8 | W2-01-40 | Fixed PUT handler to use COALESCE — all 8 resolved |
| dashboard-blocked-data-contamination | 1 entry | 2 | W2-20-34 | Test-code cleanup — resolved |
| project-data-contamination | 1 entry | 4 | W2-01-40 | Test isolation fix — resolved |
| settings-user-data-contamination | 1 entry | 9 | W2-02-39 | Test isolation: moved password-change test to end — resolved |
| settings-user-row-count | 2 entries | 2 | W8-02-10 | Flexible row-count assertions — resolved |
| dependency-data-contamination | 1 entry | 3 | W3-22-10 | API cleanup in beforeEach — resolved |
| seed-data-and-contamination | 1 entry | 2 | W5-22-24 | Test isolation fix — resolved |
| velocity-chart-date-mismatch | 1 entry | 4 | W6-21-05 | Backend date-comparison fix in velocity query — resolved |
| group-rename-contamination | 1 entry | 4 | W6-01-59 | Test isolation: create fresh group per test — resolved |
| label-count-race-condition | 1 entry | 4 | W7-02-04 | Wait-before-count pattern — resolved |
| issues-table-sorting | 1 entry | 3 | W9-22-49 | Wait + flexible assertions — resolved |
| notification-state-contamination | 1 entry | 8 | W11-23-03 | API-based beforeEach reset of notification state — resolved |
| project-date-data-contamination | 1 entry | 2 | W20-04-12 | Test isolation fix (self-inflicted) — resolved |
| velocity-hardcoded-color-selector | 1 entry | 2 | W22-04-39 | Added data-testid after CSS variable migration (self-inflicted) — resolved |
| blocked-issues-data-contamination | 1 entry | 2 | W22-04-39 | Data restoration after destructive test (self-inflicted) — resolved |
| custom-select-interaction | 1 entry | 2 | W26-05-02 | Updated test selectors for custom dropdown (self-inflicted) — resolved |
| netlify-api-routing | 1 entry | 1 | W4-02-53 | Added _redirects file for /api/* proxy — resolved |
| netlify-esm-require | 1 entry | 1 | W4-02-53 | Converted require() to dynamic import() in 13 functions — resolved |

**Note:** The `netlify-api-routing` and `netlify-esm-require` clusters share a systemic root cause: deployment infrastructure configuration. Both manifested in the same deployment test and were fixed sequentially — the _redirects fix exposed the ESM require issue that was previously masked by the routing failure.

---

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 15 | 35.7% |
| race-condition | 13 | 31.0% |
| backend-bug | 5 | 11.9% |
| strict-mode | 3 | 7.1% |
| missing-testid | 2 | 4.8% |
| api-routing | 1 | 2.4% |
| seed-data-mismatch | 1 | 2.4% |
| timeout | 1 | 2.4% |
| other | 1 | 2.4% |

### Data-Contamination Sub-Categories

Data-contamination is the dominant failure category at 35.7%. Sub-category breakdown:

| Sub-Category | Count | % of data-contamination |
|-------------|-------|------------------------|
| destructive-ordering | 11 | 73.3% |
| accumulated-data | 4 | 26.7% |

**Destructive-ordering** is the overwhelmingly dominant sub-type: tests that modify or delete data (rename groups, change passwords, clear properties) run before tests that depend on the original data state. This is a systemic isolation problem.

**Accumulated-data** failures occur when tests create records without cleanup, inflating counts for subsequent tests expecting specific row counts.

### Self-Inflicted Failure Rate

**16.7% (7/42)** of failures were self-inflicted. Breakdown:

| Pattern | Count | Description |
|---------|-------|-------------|
| checkDirectives refactoring | 4 | CSS variable migration broke hardcoded selectors; destructive test ordering introduced during test isolation fixes |
| JourneyQA test assumptions | 2 | New tests assumed specific testid names or button states that didn't match deployed components |
| fixTests ordering | 1 | New test data setup created ordering dependency |

The most common self-inflicted pattern: **refactoring that breaks selectors**. When checkDirectives tasks replace hardcoded colors with CSS variables, existing tests using color-based selectors (e.g., `path[stroke="#4d7c5e"]`) fail. The fix is straightforward (add data-testid), but the pattern is preventable.

### When Was Replay Most Effective?

Replay was used in only 2 failures (both deployment-related). In both cases, `REPLAY_NECESSARY=no` — error output alone would have sufficed. The NetworkRequest tool confirmed 401 errors that were already visible in console output.

**Verdict:** Replay provided no unique diagnostic value in this run. All 42 failures were diagnosable from error output (92.7%), code inspection (7.3%), or page snapshots (2.4%).

### When Was Replay NOT Used and Why?

| Reason | Count |
|--------|-------|
| error-output-sufficient | 36 |
| code-inspection | 3 |
| page-snapshot sufficient | 1 |

The error output from Playwright (expected/received values, locator errors, timeout messages) was sufficient for diagnosis in 92.7% of cases. This is consistent with the failure categories — data-contamination and race-condition failures produce clear error messages showing count mismatches or timing issues.

### Common Debugging Strategies That Worked

1. **Error-output → code-inspection → test-code fix** (most common): Read the Playwright error (expected vs received), inspect the test file to understand the assertion, fix the test isolation or timing issue.
2. **API cleanup in beforeEach**: For data-contamination, adding DELETE/POST API calls in beforeEach to reset state before each test.
3. **Wait-before-count**: For race-conditions with row counts, adding `waitForResponse` or explicit waits before counting elements.
4. **Flexible assertions**: Replacing exact-count assertions with `toBeGreaterThanOrEqual` or filtering to test-specific records.

### Common Debugging Strategies That Failed

1. **Fixing one failure without checking downstream tests**: Several cascading failures (e.g., projects-put-nullifies cluster of 8) required understanding the full test file ordering, not just the immediate failure.
2. **CSS variable migration without selector audit**: checkDirectives tasks that replaced hardcoded colors didn't audit test selectors that depended on those colors.

### Test Isolation Issues

Test isolation categories (data-contamination + strict-mode + seed-data-mismatch) account for **43.2%** of failures — just below the 50% threshold but still a dominant pattern.

**Affected spec files** (most frequently impacted by isolation issues):
- `project-detail-properties.spec.ts` — destructive-ordering (clear dates, roadmap removal)
- `settings-user.spec.ts` — destructive-ordering (password change breaks login)
- `notifications-actions.spec.ts` — destructive-ordering (mark-all-read wipes state)
- `settings-admin-group.spec.ts` — destructive-ordering (rename group breaks lookups)
- `dashboard-blocked.spec.ts` — destructive-ordering (complete blocker removes test data)

**Root cause**: Tests that modify shared database state run in serial within a spec file but share a single Neon database branch. Destructive operations (delete all, rename, change password) cascade to subsequent tests.

---

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "error-output-first" debugging principle**: Given that 92.7% of failures were diagnosed from error output alone, establish a rule: always analyze Playwright error messages before reaching for Replay. Only use Replay when error output is ambiguous or points to visual/timing issues that can't be confirmed from text.
2. **Add data-contamination diagnostic pattern**: When error shows unexpected counts or missing elements, check test ordering for destructive operations (DELETE, UPDATE, rename) that modify shared state.
3. **Add race-condition wait pattern**: Document the `waitForResponse` + `waitForSelector` pattern as the standard fix for count-based race conditions.

### `skills/tasks/build/testing.md`

1. **Mandate beforeEach data reset for destructive tests**: Any test that modifies or deletes shared data (status changes, renames, deletions) must either (a) create its own data in beforeEach or (b) restore original state in afterEach. This would prevent the 73.3% of data-contamination failures caused by destructive-ordering.
2. **Require data-testid for all assertable elements**: Tests should never rely on CSS selectors tied to colors, styles, or computed attributes. This prevents the checkDirectives self-inflicted pattern.
3. **Add selector audit step to refactoring tasks**: When checkDirectives removes hardcoded colors, the task should grep test files for affected selectors before committing.
4. **Reduce port-conflict infrastructure failures**: The 20 infrastructure events (225 affected test runs) from port conflicts are significant wasted effort. Add a pre-test cleanup step that kills stale `netlify dev` processes before running tests.

### `skills/review/reportTestFailures.md`

1. **Add DATA_CONTAMINATION_SUBCATEGORY to cluster format**: The cluster template doesn't explicitly include this field, but it was used in individual entries. Making it explicit in clusters would improve sub-category analysis.
2. **Clarify TEST_FAILURES counting rule**: Several analysis files had TEST_FAILURES counts that didn't match the actual number of failure/cluster entries. Adding an explicit validation reminder ("count the ### Failure and ### Failure Cluster headings to verify") would improve accuracy.
3. **Add INFRA_TOTAL_EVENTS metric**: Currently infrastructure failures report per-log counts. A standardized total across the log would help with the synthesis roll-up.

---

## 5. Replay Fixes Table

Only 2 failures used Replay, both in the same deployment test session (Worker 4). Neither had separate INITIAL_CHANGESET/FINAL_CHANGESET entries in the analysis (CHANGESET_REVISION: none for both — fixes were applied during the same session without separate commits).

INITIAL_CHANGESET: none
FAILING_TEST: production app displays data and supports updates
FINAL_CHANGESET: none
ASSESSMENT: Replay (NetworkRequest, ConsoleMessages, Screenshot) confirmed 401 errors on API calls, leading to discovery of missing _redirects file and ESM require() failures in Netlify Functions. However, REPLAY_NECESSARY=no for both — the 401 errors were visible in error output. Replay provided confirmation but not unique diagnostic insight.
