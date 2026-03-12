# Test Failures Report: app-building-iyum5y

**Generated:** 2026-03-12
**App:** project-pulse (Project Management)
**Worker:** app-building-iyum5y

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 171 |
| Logs with test failures | 13 |
| Logs without test failures | 158 |
| Total distinct test failure entries | 25 |
| Total affected tests | 49 |
| Replay usage rate | 12.0% (3/25) |
| Replay usage rate among debugged failures | 13.6% (3/22) |
| Debugging success rate | 100% (22/22) |
| Replay-assisted success rate | 100% (3/3) |
| Recording availability rate | 92.0% (23/25) |
| Debugging efficiency (Replay used, error output sufficed) | 3 (100% of Replay-used) |
| Cascading fixes | 7 (resolved 26 tests via single changesets) |
| Self-inflicted failures | 1 (4.0%) |
| Total test re-runs across all logs | 37 |
| Unique root causes | 25 (8 clusters + 17 unclustered) |
| Fix reuse rate | 1 (destructive-test-reordering across 2 spec files) |
| Pre-existing failure rate | 96.0% (24/25) |
| Replay decision quality | 100% REPLAY_NECESSARY=no among REPLAY_USED=yes (3/3) |
| Test Isolation Score | 56.0% (14/25: data-contamination + strict-mode + seed-data-mismatch) |
| Self-inflicted fix quality cost | 1 additional re-run |
| Infrastructure failure events | 6 events affecting 133 tests |

**Failure phase distribution:**

| Phase | Count | % |
|-------|-------|---|
| fixTests | 19 | 76.0% |
| other (JourneyQA) | 5 | 20.0% |
| deployment | 1 | 4.0% |

**Failure resolution type distribution:**

| Type | Count | % |
|------|-------|---|
| test-code | 15 | 60.0% |
| app-code | 5 | 20.0% |
| both | 2 | 8.0% |
| none | 3 | 12.0% |

**Diagnostic source effectiveness (among 22 resolved failures):**

| Source | Count | % |
|--------|-------|---|
| error-output | 12 | 54.5% |
| page-snapshot | 6 | 27.3% |
| error-context-snapshot | 2 | 9.1% |
| code-inspection | 2 | 9.1% |

**Fix iteration difficulty distribution:**

| Iterations | Count | Tests |
|------------|-------|-------|
| 0 (unresolved) | 3 | VelocityChart, Create Project modal roadmap, journeyqa-timeline-group-ids cluster |
| 1 | 18 | — |
| 2 | 2 | neon-date-string-format cluster, NotificationList unread styling (JourneyQA) |
| 4 | 1 | GroupBy dropdown can be changed multiple times |

**Resolution effort distribution (15 entries with TOOL_CALL_COUNT):**

| Tool Calls | Count |
|------------|-------|
| 4-5 | 8 |
| 6-9 | 5 |
| 10+ | 2 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|-----------| ------|---------|-----------|
| 70 | iyum5y/project-pulse | deployment: app displays data and supports updates | strict-mode | no | yes | | yes | Screenshot + code-inspection of existing tests | Screenshot, PlaywrightSteps | yes | none |
| 72 | iyum5y/project-pulse | Removing a project from the roadmap | CSS/layout | yes | no | error-output-sufficient — error-context snapshot showed remove button has display:none | yes | | | yes | 62c4b978c7 |
| 73 | iyum5y/project-pulse | Successfully creating a new group | strict-mode | yes | no | error-output-sufficient — page snapshot showed duplicate rows | yes | | | yes | 97f8a9e9da |
| 74 | iyum5y/project-pulse | StatusDonutChart hover/tooltip shows count details | CSS/layout | yes | no | error-output-sufficient — hover on SVG timed out, center-label blocking pointer events | yes | | | yes | aa0d6c762f |
| 75 | iyum5y/project-pulse | dashboard-fetch-race-condition (4 tests) | race-condition | yes | no | error-output-sufficient — page snapshots showed "No open issues" despite creation | yes | | | yes | 81a9ccece8 |
| 78 | iyum5y/project-pulse | group-detail-data-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient — page snapshots showed renamed group name and extra members | yes | | | yes | 545fe77a44 |
| 79 | iyum5y/project-pulse | inbox-user-fetch-bug (7 tests) | backend-bug | yes | no | error-output-sufficient — code inspection revealed users API response destructuring bug | yes | | | yes | 4aa0cea5fc |
| 81 | iyum5y/project-pulse | NotificationList shows unread notifications with bold styling | strict-mode | yes | no | error-output-sufficient — strict mode violation showed substring collision | yes | | | yes | a982e56 |
| 84 | iyum5y/project-pulse | Comments section shows empty state when no comments exist | data-contamination | yes | no | error-output-sufficient — page snapshot showed 3 comments from prior test | yes | | | yes | none |
| 85 | iyum5y/project-pulse | Circular dependencies are prevented | backend-bug | yes | no | error-output-sufficient — error showed global error instead of dependency-error element | yes | | | yes | none |
| 88 | iyum5y/project-pulse | Multiple metadata fields can be changed on same page | timeout | yes | no | error-output-sufficient — error context showed labels picker blocking due date trigger | yes | | | yes | f55faf9 |
| 90 | iyum5y/project-pulse | neon-date-string-format (3 tests) | date-format | yes | no | error-output-sufficient — page snapshots showed all issues visible despite date filter | yes | | | yes | none |
| 91 | iyum5y/project-pulse | GroupBy dropdown can be changed multiple times | timeout | yes | yes | | yes | PlaywrightSteps→Screenshot→Evaluate→ConsoleMessages→NetworkRequest→Logpoint | PlaywrightSteps, Screenshot, Evaluate, ConsoleMessages, NetworkRequest, Logpoint | yes | faea95a |
| 94 | iyum5y/project-pulse | Issues table shows assignee avatars | strict-mode | yes | no | error-output-sufficient — empty div resolved by locator considered hidden | yes | | | yes | 0a8b23df1d |
| 108 | iyum5y/project-pulse | Roadmap detail page shows 404 for non-existent roadmap | backend-bug | yes | no | error-output-sufficient — "Failed to fetch" instead of "not found", missing UUID validation | yes | | | yes | 5421d48eed |
| 108 | iyum5y/project-pulse | Roadmap description is displayed and editable inline | test-setup-error | yes | no | error-output-sufficient — error context showed textarea still active after click | yes | | | yes | 5421d48eed |
| 112 | iyum5y/project-pulse | notification-prefs-contamination (4 tests) | data-contamination | yes | yes | | yes | PlaywrightSteps→Screenshot→NetworkRequest | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | yes | c07c3f30ec |
| 113 | iyum5y/project-pulse | Edit user name validation — empty name rejected | data-contamination | yes | no | error-output-sufficient — expected "Alice Chen" vs received "Alice Smith" | yes | | | yes | e31346dd6b |
| 114 | iyum5y/project-pulse | Switching between Users and Groups tabs preserves state | data-contamination | yes | no | error-output-sufficient — page snapshot showed "No groups yet" empty state | yes | | | yes | b15cec2dd5 |
| 115 | iyum5y/project-pulse | team-users-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient — page snapshots showed wrong role and missing users | yes | | | yes | d53d122b6f |
| 168 | iyum5y/project-pulse | VelocityChart shows correct weekly completion counts | seed-data-mismatch | yes | no | error-output-sufficient — tooltip mismatch due to same-moment issue creation | yes | | | no | none |
| 168 | iyum5y/project-pulse | Create Project modal roadmap field shows available roadmaps | seed-data-mismatch | yes | no | error-output-sufficient — beforeEach cleanup deletes seed roadmaps this test depends on | yes | | | no | none |
| 168 | iyum5y/project-pulse | journeyqa-timeline-group-ids (3 tests) | seed-data-mismatch | yes | no | error-output-sufficient — hardcoded group IDs don't exist in deployed database | yes | | | no | none |
| 170 | iyum5y/project-pulse | slack-toggle-aria-label (5 tests) | missing-testid | yes | no | error-output-sufficient — aria-label attribute value mismatch | no | | | yes | none |
| 170 | iyum5y/project-pulse | NotificationList shows unread notifications with bold styling | strict-mode | yes | no | error-output-sufficient — strict mode violation from substring collision | no | | | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| dashboard-fetch-race-condition | 4 tests | 75 | Resolved — fixed currentUser fetch race in Dashboard (81a9ccece8) |
| group-detail-data-contamination | 4 tests | 78 | Resolved — reordered destructive tests (545fe77a44) |
| inbox-user-fetch-bug | 7 tests | 79 | Resolved — fixed users API response destructuring (4aa0cea5fc) |
| neon-date-string-format | 3 tests | 90 | Resolved — normalized dates to YYYY-MM-DD and getTime() comparisons |
| notification-prefs-contamination | 4 tests | 112 | Resolved — added beforeEach reset for notification preferences (c07c3f30ec) |
| team-users-data-contamination | 2 tests | 115 | Resolved — reordered destructive tests (d53d122b6f) |
| journeyqa-timeline-group-ids | 3 tests | 168 | Unresolved — JourneyQA tests hardcode UUIDs not present in deployed DB |
| slack-toggle-aria-label | 5 tests | 170 | Resolved — fixed aria-label on/off suffix in Slack toggle component |

**Note:** The data-contamination clusters (group-detail, notification-prefs, team-users) plus the individual data-contamination failures in logs 84, 113, and 114 all stem from the same systemic issue: test files share mutable database state without cleanup/isolation. Serial test execution within spec files means mutations in earlier tests contaminate later tests.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 6 | 24.0% |
| strict-mode | 5 | 20.0% |
| seed-data-mismatch | 3 | 12.0% |
| backend-bug | 3 | 12.0% |
| CSS/layout | 2 | 8.0% |
| timeout | 2 | 8.0% |
| date-format | 1 | 4.0% |
| race-condition | 1 | 4.0% |
| test-setup-error | 1 | 4.0% |
| missing-testid | 1 | 4.0% |

### Data-Contamination Sub-Categories

Data-contamination accounts for 24.0% of failures (6/25). Sub-category breakdown:

| Sub-Category | Count | Description |
|-------------|-------|-------------|
| destructive-ordering | 4 | Tests that delete/modify/rename records run before dependent tests (group-detail, settings-profile, team-groups, team-users) |
| accumulated-data | 2 | Tests create records that persist and inflate counts (issue-detail-comments, notification-prefs) |

### Test Isolation Issues

The Test Isolation Score of **56.0%** (data-contamination: 6, strict-mode: 5, seed-data-mismatch: 3) exceeds the 50% threshold, indicating test isolation is the dominant failure mode.

**Affected spec files:**
- group-detail.spec.ts — destructive ordering (rename, member changes)
- issue-detail-comments.spec.ts — accumulated data (comments persist)
- settings-notifications.spec.ts — accumulated data (preference mutations)
- settings-profile.spec.ts — destructive ordering (name change)
- team-groups.spec.ts — destructive ordering (delete-all test)
- team-users.spec.ts — destructive ordering (role changes, delete-all test)
- inbox-notification-list.spec.ts — strict-mode substring collision
- issues-table.spec.ts — strict-mode empty div visibility
- create-group-modal.spec.ts — strict-mode seed data collision

**Pattern:** 4 of 6 data-contamination failures were caused by destructive tests (delete-all, rename, role-change) running before tests that depend on the original state. The fix in all cases was test reordering or adding beforeEach cleanup. This is a structural issue with serial test execution and no per-test isolation.

### Self-Inflicted Failure Rate

**4.0%** (1/25) — only the deployment test in Log 70 where the agent wrote a test with incorrect selectors for the modal submit button. This is a low self-infliction rate indicating good fix quality.

### When Was Replay Most Effective?

Replay was used on 3 failures (12.0%), all successfully resolved. However, in all 3 cases REPLAY_NECESSARY=no — error output alone would have sufficed:
- **Log 70 (deployment/strict-mode):** Screenshot confirmed modal state but code-inspection of existing tests was the actual fix source
- **Log 91 (timeout):** Extensive Replay investigation (25 tool calls) confirmed the app was functioning correctly and the issue was Playwright/Replay browser instrumentation interaction. The fix was using `page.evaluate()` JavaScript clicks instead of CDP clicks
- **Log 112 (data-contamination):** NetworkRequest confirmed database contamination but error output already showed the symptom clearly

Replay was most useful for confirming hypotheses rather than discovering root causes. The timeout case (Log 91) was the most complex investigation.

### When Was Replay NOT Used and Why?

22 of 25 failures were resolved without Replay. Reasons:
- **error-output-sufficient** (majority): Error messages, page snapshots, and error-context snapshots provided enough diagnostic information
- **code-inspection**: 2 cases where reading the source code revealed the bug directly

### Common Debugging Strategies That Worked

1. **Error output → code inspection → fix** (most common): Read the error message, identify the mismatched expectation or missing element, inspect the relevant source code, apply fix
2. **Page snapshot analysis**: Error-context snapshots showing the actual page state were sufficient to diagnose data contamination (stale data visible) and strict-mode (duplicate elements visible)
3. **Destructive test reordering**: Moving delete/modify-all tests to end of describe blocks — used as a fix pattern across multiple spec files

### Common Debugging Strategies That Failed

1. **Replay for simple issues**: All 3 Replay uses were unnecessary (REPLAY_NECESSARY=no), adding overhead without unique diagnostic value
2. **Repeated retries for timeout** (Log 91): 5 re-runs needed before finding the right fix — initial approaches tried fixing selectors rather than the underlying CDP click issue

### Recurring Failure Categories

The top 3 categories (data-contamination, strict-mode, seed-data-mismatch) collectively represent **56.0%** of all failures and are all test isolation issues. This indicates the testing process itself — not the application — is the primary source of failures. The 60.0% test-code resolution rate confirms this.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "destructive-test-reordering"** — When a test deletes all records, renames entities, or changes roles, move it to the end of the describe block or add beforeEach cleanup. This pattern resolved 4 data-contamination failures across multiple spec files.
- **Add pattern: "CDP click workaround"** — When Playwright clicks stall on the 3rd+ rapid interaction cycle (especially with Replay browser), use `page.evaluate(() => element.click())` instead of `locator.click()`. Saves the extensive investigation seen in Log 91.
- **Add guidance: "Skip Replay for data-contamination and strict-mode"** — These categories are diagnosable from error output alone. Error messages showing duplicate elements, wrong counts, or stale data point directly to the root cause without needing visual debugging.

### `skills/tasks/build/testing.md`

- **Mandate beforeEach cleanup helpers** for all spec files that modify data. The Test Isolation Score of 56.0% signals a systemic issue. Rather than fixing isolation reactively per-file, require a standard cleanup pattern (e.g., API-based reset to seed state) in every spec file's beforeEach hook.
- **Add JourneyQA data strategy guidance** — 3 seed-data-mismatch failures in JourneyQA (Log 168) resulted from hardcoded UUIDs and assumptions about deployed database state. JourneyQA tests should dynamically discover IDs from API responses rather than hardcoding them.
- **Avoid Replay for simple error-output-diagnosable failures** — 100% of Replay uses in this run were unnecessary. Reserve Replay for visual/layout issues and complex race conditions where the page state cannot be inferred from error output.

### `skills/review/reportTestFailures.md`

- **Clarify TEST_FAILURES count for clusters** — Log 90's analysis reported TEST_FAILURES: 3 for a single cluster of 3 tests, which should have been TEST_FAILURES: 1 per the rules. Consider adding an explicit example: "1 cluster of 3 tests = TEST_FAILURES: 1".
- **Add TOOL_CALL_COUNT to cluster template** — The cluster format doesn't include TOOL_CALL_COUNT, making resolution effort analysis incomplete for clustered failures.

## 5. Replay Fixes Table

### Fix 1: deployment — strict-mode selector mismatch

INITIAL_CHANGESET: none
FAILING_TEST: deployment: app displays data and supports updates
FINAL_CHANGESET: none
ASSESSMENT: Replay Screenshot confirmed modal overlay was open but test clicked wrong submit button. Fix was changing selector to match existing test patterns. Replay was not strictly necessary — code-inspection of existing test files would have sufficed.

### Fix 2: timeout — CDP click stalling on rapid dropdown interactions

INITIAL_CHANGESET: none
FAILING_TEST: GroupBy dropdown can be changed multiple times
FINAL_CHANGESET: faea95a
ASSESSMENT: Extensive Replay investigation (PlaywrightSteps, Screenshot, Evaluate, ConsoleMessages, NetworkRequest, Logpoint — 25 tool calls) confirmed the dropdown menu was visible in the DOM but Playwright's CDP-based click was stalling on the third rapid interaction cycle. Fix was replacing Playwright click() with page.evaluate()-based JavaScript clicks. Replay was not necessary — error output indicated the timeout location and the fix pattern (JS click workaround) could have been applied directly.

### Fix 3: data-contamination — notification preferences not reset between tests

INITIAL_CHANGESET: none
FAILING_TEST: tests/settings-notifications.spec.ts
FINAL_CHANGESET: c07c3f30ec
ASSESSMENT: Replay PlaywrightSteps, Screenshot, and NetworkRequest confirmed database state was contaminated — API response showed notification_email_preference: "off" instead of seeded "instant" value. Fix was adding beforeEach hook to reset preferences via API. Replay was not necessary — error output already showed the symptom clearly.
