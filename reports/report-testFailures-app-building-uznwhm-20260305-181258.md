# Test Failures Report: app-building-uznwhm (2026-03-05)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 93 |
| Logs with test failures | 20 |
| Logs without test failures | 73 |
| Total distinct test failures | 45 |
| Total test re-runs across all logs | 21 |
| Infrastructure failure events | 0 |
| Unique root causes | 21 (16 clusters + 5 unclustered) |
| **Replay usage rate** | **26.7%** (12/45) |
| Replay usage rate among debugged failures | 29.3% (12/41) |
| Debugging success rate | 100% (41/41) |
| Replay-assisted success rate | 100% (12/12) |
| Recording availability rate | 100% (45/45) |
| Debugging efficiency (Replay used but unnecessary) | 58.3% (7/12 Replay-used failures could have been diagnosed from error output alone) |
| Cascading fixes | 8 (single changes resolving 2-5 failures each) |
| Self-inflicted failures | 5 (11.1%) |
| Fix reuse rate | 4 distinct fix patterns applied across multiple spec files |
| **Failure phase distribution** | fixTests: 45 (100%) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-46 | uznwhm/hive-track | Successfully create a new apiary | backend-bug | no | yes | | yes | PlaywrightSteps + NetworkRequest to find 404 | PlaywrightSteps, NetworkRequest | yes | none |
| worker-46 | uznwhm/hive-track | Create apiary with Inactive status | backend-bug | no | no | Same root cause as sibling failure | yes | | | | none |
| worker-46 | uznwhm/hive-track | Edit apiary via modal pre-populates fields | missing-testid | no | no | Same root cause as sibling failure (API 404) | yes | | | | none |
| worker-47 | uznwhm/hive-track | Newly added hive appears in Recent Activity | backend-bug | yes | yes | | yes | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | yes | pending |
| worker-48 | uznwhm/hive-track | Validation prevents duplicate hive names | backend-bug | yes | yes | | yes | Network + frontend error handling trace | PlaywrightSteps, NetworkRequest, ConsoleMessages | yes | committed |
| worker-51 | uznwhm/hive-track | 5 tests (serial-delete-contaminates-subsequent) | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-52 | uznwhm/hive-track | Display inspection events in activity feed | data-contamination | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest, Screenshot | yes | none |
| worker-52 | uznwhm/hive-track | Display harvest events in activity feed | data-contamination | yes | yes | | yes | (same cluster) | | yes | none |
| worker-52 | uznwhm/hive-track | New events appear at top after actions | data-contamination | yes | yes | | yes | (same cluster) | | yes | none |
| worker-53 | uznwhm/hive-track | Display Total Honey Harvested for season | backend-bug | yes | no | Diagnosed from error output (expected vs actual) | yes | | | yes | none |
| worker-54 | uznwhm/hive-track | Last Inspected date displays correctly | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest, Screenshot | yes | none |
| worker-55 | uznwhm/hive-track | Edit mode pre-fills all fields | backend-bug | yes | no | Diagnosed from error output (ISO timestamp format) | yes | | | yes | none |
| worker-56 | uznwhm/hive-track | 3 tests (hardcoded-counts-in-serial-tests) | data-contamination | yes | no | Diagnosed from error output (count mismatches) | yes | | | yes | none |
| worker-57 | uznwhm/hive-track | Click harvest row navigates to detail | data-contamination | yes | yes | | yes | NetworkRequest | NetworkRequest | yes | none |
| worker-58 | uznwhm/hive-track | 2 tests (date-collision-in-row-selection) | data-contamination | yes | no | Diagnosed from error output + code inspection | yes | | | yes | 97f9521 |
| worker-59 | uznwhm/hive-track | 2 tests (stale-redux-state-on-navigation) | backend-bug | yes | yes | | yes | PlaywrightSteps + Screenshot + NetworkRequest | PlaywrightSteps, Screenshot, NetworkRequest | yes | 741a811 |
| worker-60 | uznwhm/hive-track | Combine all three filters | data-contamination | yes | no | Diagnosed from error output (strict mode + dupes) | yes | | | yes | none |
| worker-60 | uznwhm/hive-track | Reset filters shows all hives | data-contamination | yes | no | Diagnosed from error output (count mismatch) | yes | | | yes | none |
| worker-61 | uznwhm/hive-track | Apiary Name column shows correct apiary | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | d6a3fa7 |
| worker-61 | uznwhm/hive-track | Status column displays correct labels | data-contamination | yes | no | Same root cause as above | yes | | | yes | d6a3fa7 |
| worker-62 | uznwhm/hive-track | Click hive row navigates to detail | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-62 | uznwhm/hive-track | Edit button opens edit form for hive | data-contamination | yes | no | Same root cause as above | yes | | | yes | none |
| worker-64 | uznwhm/hive-track | Filter inspections by hive | data-contamination | yes | yes | | yes | PlaywrightSteps | PlaywrightSteps | yes | e3c75ba |
| worker-64 | uznwhm/hive-track | Hive dropdown filters by selected apiary | strict-mode | yes | no | Diagnosed from error output (strict mode) | yes | | | yes | e3c75ba |
| worker-64 | uznwhm/hive-track | Changing apiary resets hive filter | strict-mode | yes | no | Diagnosed from error output | yes | | | yes | e3c75ba |
| worker-64 | uznwhm/hive-track | Combine multiple filters | strict-mode | yes | no | Diagnosed from error output | yes | | | yes | e3c75ba |
| worker-65 | uznwhm/hive-track | Issues Found shows No badge | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-65 | uznwhm/hive-track | Health Score displays numeric value 1-5 | strict-mode | yes | no | Diagnosed from error output (strict mode) | yes | | | yes | none |
| worker-65 | uznwhm/hive-track | Inspections sorted by date descending | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-65 | uznwhm/hive-track | Click inspection row navigates to detail | CSS/layout | yes | no | Diagnosed from error output (textContent mismatch) | yes | | | yes | none |
| worker-66 | uznwhm/hive-track | Newly logged harvest appears in Recent Activity | data-contamination | yes | no | Diagnosed from error output (count mismatch) | yes | | | yes | none |
| worker-66 | uznwhm/hive-track | Newly logged harvest appears in Hive Detail | data-contamination | yes | no | Diagnosed from error output (count mismatch) | yes | | | yes | none |
| worker-68 | uznwhm/hive-track | Submit inspection with all optional fields | strict-mode | yes | yes | | yes | PlaywrightSteps | PlaywrightSteps | yes | 7b59007 |
| worker-68 | uznwhm/hive-track | Updates hive health score | backend-bug | yes | no | Diagnosed from error output + source code | yes | | | yes | 7b59007 |
| worker-68 | uznwhm/hive-track | Updates Dashboard upcoming inspections | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | 7b59007 |
| worker-85 | uznwhm/hive-track | settings-health-score test 1 (bg expected 'white') | CSS/layout | no | no | Obvious from test output | yes | | | | none |
| worker-85 | uznwhm/hive-track | settings-health-score test 2 (bg expected 'white') | CSS/layout | no | no | Obvious from test output | yes | | | | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| netlify-functions-404 | 3 | worker-46 | Fixed by adding `--functions ./netlify/functions` flag to netlify dev |
| serial-delete-contaminates-subsequent | 5 | worker-51 | Reordered tests, added visibility waits |
| seed-hives-deleted-by-prior-tests | 3 | worker-52 | Created hives via API in each test |
| postgres-date-serialization | 2 | worker-54, worker-55 | SQL `::text` cast + frontend date parsing fix |
| hardcoded-counts-in-serial-tests | 3 | worker-56 | Replaced with relative assertions |
| date-collision-in-row-selection | 2 | worker-58 | Used unique dates to avoid seed data collision |
| stale-redux-state-on-navigation | 2 | worker-59 | Added mount-time effect to clear selectedHive |
| name-collision-in-serial-tests | 2 | worker-60 | Used unique apiary/hive names |
| hive-list-actions-delete-ordering | 2 | worker-61 | Reordered describe blocks |
| hive-list-display-empty-state-ordering | 2 | worker-62 | Moved destructive test to end |
| inspection-filters-data-accumulation | 4 | worker-64 | Used unique names and relative assertions |
| inspection-list-data-accumulation | 3 | worker-65 | Test isolation fixes + selector improvements |
| log-harvest-hardcoded-counts | 2 | worker-66 | Replaced with relative assertions |
| record-inspection-submit-data-accumulation | 2 | worker-68 | Used unique inspection data per test |
| test-expectations-stale-after-css-variable-refactor | 2 | worker-85 | Updated test expectations |
| redux-error-handling | 1 | worker-48 | Fixed catch block to handle plain objects |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 26 | 57.8% |
| backend-bug | 10 | 22.2% |
| strict-mode | 5 | 11.1% |
| CSS/layout | 3 | 6.7% |
| missing-testid | 1 | 2.2% |

### Test Isolation Issues

Data-contamination (26), strict-mode (5), and seed-data-mismatch (0) collectively account for **68.9%** of all failures — well above the 50% threshold warranting dedicated analysis.

**Root pattern:** All tests run serially against a shared database. Destructive operations (deleting all entities, creating entities with non-unique names) in earlier tests contaminate state for later tests. This manifests as:

1. **Empty-state tests destroy seed data** (workers 51, 61, 62): Tests that delete all records to verify empty-state UI leave the DB empty for subsequent tests.
2. **Name collisions from accumulated data** (workers 60, 64): Tests create entities with names matching seed data or other tests, causing strict-mode violations when dropdowns/selectors find duplicates.
3. **Hardcoded count assertions** (workers 56, 66): Tests assert exact row counts that become stale as earlier tests add records.
4. **Hardcoded seed data IDs** (workers 52, 53): Tests reference specific seed record UUIDs that may be deleted by earlier tests via cascade.

**Affected spec files:** apiary-list, hive-list-actions, hive-list-display, hive-filter-bar, harvest-filters, harvest-list-summary, inspection-filters, inspection-list, log-harvest-modal, dashboard-recent-activity, dashboard-stats-cards, record-inspection-submit, hive-detail (13 of 27 spec files).

**Mitigation strategies that worked:**
- Move destructive tests to end of describe blocks
- Use `test.describe.serial` for files with destructive operations
- Replace hardcoded counts with relative assertions (e.g., "at least N" or "count increased by 1")
- Create fresh test data via API calls instead of relying on seed data
- Use unique, timestamped entity names to avoid collisions

### When Was Replay Most Effective?

Replay was genuinely necessary in **5 of 12 uses** (41.7%):
- **Backend bugs with no frontend error messages** (workers 46, 47, 48): API returning 404/500 errors that the frontend silently swallowed. NetworkRequest was essential to see the actual HTTP response.
- **Stale Redux state** (worker 59): Screenshot + PlaywrightSteps confirmed the page rendered a detail view instead of list view, revealing a state management bug not visible in test output.

### When Was Replay NOT Used and Why?

33 of 45 failures (73.3%) were diagnosed without Replay:
- **Data contamination with clear count mismatches** (18 failures): Error output like "expected 1, got 3" combined with serial test execution made the cause obvious.
- **Strict-mode violations** (5 failures): Error messages explicitly state "resolved to N elements" — the cause (duplicate entities) is self-evident.
- **Known sibling root cause** (2 failures in worker 46): Once the first failure was diagnosed via Replay, the remaining failures in the same cluster needed no further investigation.

### Common Debugging Strategies That Worked

1. **Error output triage first** — 73% of failures were solved from Playwright error output alone, without needing Replay. This is the right default for data-contamination and strict-mode failures.
2. **NetworkRequest for backend bugs** — When the error suggests an API issue (blank page, missing data), checking the network response body immediately reveals 404/500 errors and SQL errors.
3. **PlaywrightSteps as entry point** — Used as the first Replay tool in every session to identify which test step failed and narrow the investigation scope.
4. **Cluster diagnosis** — Fixing one failure in a cluster and re-running resolved all related failures, saving significant debugging time.

### Common Debugging Strategies That Failed

No debugging strategies failed outright. However, Replay was used unnecessarily in 7/12 cases where error output alone would have sufficed, representing wasted time.

### Self-Inflicted Failure Rate

**11.1%** (5/45) of failures were self-inflicted:
- **3 failures** (worker 46): Caused by incorrect Playwright config importing a non-existent `replayDevices` export, leading to netlify dev not serving functions. This was an infrastructure setup error in the test script.
- **2 failures** (worker 85): Test expectations hardcoded `backgroundColor: 'white'` but a CSS variable refactor changed the computed value. Tests should have asserted behavior, not implementation.

This is a low self-inflicted rate, indicating good fix quality overall.

### Failure Phase Distribution

All 45 failures (100%) occurred during the **fixTests** phase. No failures occurred during writeTests, checkDirectives, or deployment. This is expected — writeTests only authors test files without executing them, and the fixTests phase is when tests first run against the actual application.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add a "data-contamination triage" pattern:** When error output shows count mismatches or strict-mode violations in serial test files, skip Replay and go straight to test ordering and data isolation fixes. This would have saved Replay calls in 7 of 12 Replay-used failures.
- **Add NetworkRequest as a first tool for blank-page / missing-data failures:** The pattern "PlaywrightSteps -> NetworkRequest -> check response body" was the most effective strategy for backend bugs.

### `skills/tasks/build/testing.md`

- **Mandate test data isolation by default:** Every spec file should create its own test data via API calls in `beforeEach`/`beforeAll` rather than relying on seed data. 57.8% of all failures came from data contamination — this is the single highest-impact improvement.
- **Require unique, timestamped entity names:** Tests creating entities should use names like `Test-Apiary-${Date.now()}` to avoid collisions with seed data or other tests.
- **Require `test.describe.serial` for files with destructive operations:** Any test that deletes all records must be wrapped in a serial describe block with the destructive test last.
- **Ban hardcoded count assertions in serial tests:** Use relative assertions (`toBeGreaterThanOrEqual`, "count increased by N") instead of exact counts.
- **Ban hardcoded seed data UUIDs:** Always discover entity IDs via API by name rather than assuming seed UUIDs exist.

### `skills/review/reportTestFailures.md`

- **Add a "Test Isolation Score" metric:** Calculate the percentage of failures attributable to test isolation issues (data-contamination + strict-mode + seed-data-mismatch). This session's 68.9% rate highlights the dominant failure mode clearly.
- **Add FAILURE_RESOLUTION_TYPE field:** Track whether the fix was to test code, app code, or both. This session showed a mix but the distinction helps identify whether the testing process or the app-building process needs improvement.
