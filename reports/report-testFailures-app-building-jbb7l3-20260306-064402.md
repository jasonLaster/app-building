# Test Failures Report: app-building-jbb7l3 (2026-03-06)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 104 |
| Logs with test failures | 26 (25.0%) |
| Logs without test failures | 78 (75.0%) |
| Total distinct test failures | 49 |
| Total test re-runs to achieve all-pass | 45 |
| Infrastructure failure events | 1 event (19 tests affected, W113 — ERR_CONNECTION_REFUSED, dev server not running) |
| Replay usage rate (all failures) | 1/49 (2.0%) |
| Replay usage rate (debugged failures only) | 1/36 (2.8%) |
| Debugging attempted | 36/49 (73.5%) |
| Debugging success rate (attempted) | 36/36 (100%) |
| Replay-assisted success rate | 1/1 (100%) |
| Recording availability rate | 37/49 (75.5%) |
| Debugging efficiency (Replay used but unnecessary) | 1/1 (100% — the single Replay use was not necessary; error output would have sufficed) |
| Cascading fixes | 6 clusters fixed multiple tests with single changes (seed-data-missing-recurrence: 3, weather-alert: 5, route-stop-list-selector: 7, route-view-selector: 7, service-call-list: 5, technician-list: 4) |
| Self-inflicted failures | 12/49 (24.5%) |
| Unique root causes | 34 (15 clusters + 19 unclustered) |
| Fix reuse rate | 1 pattern reused across 3+ spec files (`exclude-container-from-testid-prefix-selector`) |
| **Test Isolation Score** | **57.5% (23/40 failure entries are data-contamination + strict-mode + seed-data-mismatch)** |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 39 | 79.6% |
| other (journeyQA) | 5 | 10.2% |
| writeTests | 4 | 8.2% |
| deployment | 1 | 2.0% |

### Failure Resolution Type Distribution

| Resolution Type | Count |
|-----------------|-------|
| test-code | 31 |
| both (test + app) | 6 |
| app-code | 5 |
| none (unresolved) | 2 |

Note: 5 failures resolved by app-code changes were all in a single seed-data-mismatch cluster (W51). The majority (31/44 resolved = 70.5%) were pure test-code fixes.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------|----|---------|-----------|
| W49 | jbb7l3/PestRoutes | AddEditTechnicianModal cancel discards changes | data-contamination | yes | no | diagnosed from error output | yes | — | — | — | test edit |
| W51 | jbb7l3/PestRoutes | AddEditVisitModal status change to completed (cluster: 3 tests) | seed-data-mismatch | yes | no | diagnosed from DOM snapshot | no | — | — | — | seed fix |
| W54 | jbb7l3/PestRoutes | AddEditCustomerModal cancel discards changes | data-contamination | yes | no | diagnosed from error output | yes | — | — | — | test edit |
| W57 | jbb7l3/PestRoutes | CustomerList count mismatch (multiple tests) | data-contamination | yes | no | no recording available | no | — | — | — | test edit |
| W58 | jbb7l3/PestRoutes | TechnicianStatus status indicators | backend-bug | yes | no | diagnosed from code inspection | no | — | — | — | test edit |
| W58 | jbb7l3/PestRoutes | TechnicianStatus visit counts | data-contamination | yes | no | diagnosed from test logs | no | — | — | — | test edit |
| W59 | jbb7l3/PestRoutes | TodaysSummary updates when visits completed | data-contamination | yes | no | diagnosed from code analysis | no | — | — | — | both |
| W60 | jbb7l3/PestRoutes | UpcomingUrgentCalls excludes completed/cancelled | seed-data-mismatch | yes | no | diagnosed from code analysis | no | — | — | — | test edit |
| W60 | jbb7l3/PestRoutes | UpcomingUrgentCalls updates after assign | seed-data-mismatch | yes | no | diagnosed from code analysis | no | — | — | — | test edit |
| W61 | jbb7l3/PestRoutes | Weather alert cluster (5 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W62 | jbb7l3/PestRoutes | NewEditServiceCallModal customer selection (3 tests) | CSS/layout | yes | no | diagnosed from page snapshots | no | — | — | yes | test edit |
| W62 | jbb7l3/PestRoutes | NewEditServiceCallModal row by description | missing-testid | yes | no | diagnosed from page snapshots | no | — | — | yes | test edit |
| W63 | jbb7l3/PestRoutes | RouteActions reassign stop | data-contamination | yes | no | no recording available | no | — | — | yes | test edit |
| W64 | jbb7l3/PestRoutes | RouteStopList selector overcount (6 tests) | missing-testid | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W64 | jbb7l3/PestRoutes | RouteStopList clicking stop shows details | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W65 | jbb7l3/PestRoutes | RouteSummary updates when stop added | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W66 | jbb7l3/PestRoutes | RouteSummary stop skipped | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | both |
| W66 | jbb7l3/PestRoutes | RouteSummary zeros for empty route | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | both |
| W66 | jbb7l3/PestRoutes | RouteSummary drag-and-drop reorder | missing-testid | yes | no | diagnosed from error output | yes | — | — | yes | both |
| W67 | jbb7l3/PestRoutes | RouteView selector+data cluster (7 tests) | missing-testid | yes | no | same pattern as route-stop-list | yes | — | — | yes | test edit |
| W71 | jbb7l3/PestRoutes | Completed calls disable action buttons | CSS/layout | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W71 | jbb7l3/PestRoutes | Cancelled calls disable action buttons | CSS/layout | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W71 | jbb7l3/PestRoutes | Completing a call updates Dashboard | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W72 | jbb7l3/PestRoutes | ServiceCallList filter cluster (5 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W74 | jbb7l3/PestRoutes | TechnicianDetailPanel workload overloaded | backend-bug | yes | no | diagnosed from code inspection | yes | — | — | yes | app-code |
| W74 | jbb7l3/PestRoutes | TechnicianDetailPanel service history details | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W75 | jbb7l3/PestRoutes | TechnicianList data contamination (4 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | test edit |
| W77 | jbb7l3/PestRoutes | Deployment: app displays data | spa-redirect | yes | yes | — | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | yes | app-code |
| W98 | jbb7l3/PestRoutes | AddEditVisitModal edit pre-populates fields | strict-mode | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W109 | jbb7l3/PestRoutes | Urgent service call appears on Dashboard | missing-testid | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W110 | jbb7l3/PestRoutes | Complete a Route Stop (overlay intercept) | CSS/layout | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W110 | jbb7l3/PestRoutes | Skip or Reassign a Stop (overlay intercept) | CSS/layout | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W110 | jbb7l3/PestRoutes | Review Daily Route (state contamination) | strict-mode | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W110 | jbb7l3/PestRoutes | Review Daily Route (selector mismatch) | other | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W111 | jbb7l3/PestRoutes | Update Technician Availability | CSS/layout | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W112 | jbb7l3/PestRoutes | Manage Customer Records (strict mode) | strict-mode | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W112 | jbb7l3/PestRoutes | Add a New Customer and Property | CSS/layout | no | no | diagnosed from error output | yes | — | — | yes | test edit |
| W113 | jbb7l3/PestRoutes | CustomerDetailPanel Service History section | data-contamination | yes | no | diagnosed from error output | yes | — | — | — | none |
| W113 | jbb7l3/PestRoutes | CustomerDetailPanel Service History details | seed-data-mismatch | yes | no | diagnosed from error output | yes | — | — | — | none |
| W114 | jbb7l3/PestRoutes | Build and Optimize a Technician's Route | CSS/layout | no | no | diagnosed from error output | yes | — | — | yes | test edit |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| seed-data-missing-recurrence | 3 tests | W51 | Single seed data fix (added `recurrence: 'monthly'`) |
| seed-data-ordering-dashboard-urgent-calls | 2 tests | W60 | Reordered destructive tests, made tests self-contained |
| weather-alert-data-contamination | 5 tests | W61 | Added beforeEach DELETE cleanup |
| service-call-modal-customer-selection | 3 tests | W62 | Changed to data-testid selector for customer option |
| service-call-row-filter-by-description | 2 tests | W62 | Changed row filtering to use visible fields |
| route-stop-list-selector-overcount | 7 tests | W64 | Fixed `[data-testid^="route-stop-"]` to exclude container |
| route-summary-selector-and-data | 3 entries | W66 | Fixed selector + added beforeEach cleanup |
| route-view-selector-and-data | 7 tests | W67 | Same selector fix + beforeEach cleanup |
| service-call-actions-empty-div | 2 tests | W71 | Fixed assertion to handle empty action div |
| service-call-list-data-contamination | 5 tests | W72 | Added delete-all-before-test cleanup |
| technician-list-data-contamination | 4 tests | W75 | Used relative ordering assertions |
| overlay-intercept-run1 | 2 tests | W110 | Dismissed overlay before clicking action buttons |
| test-state-contamination | 1 test | W110 | Reset route data between tests |
| selector-mismatch | 1 test | W110 | Fixed CSS selector for checked option |
| customer-detail-panel-data | 1 test | W113 | Unresolved (pre-existing, out of scope) |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 15 | 37.5% |
| CSS/layout | 8 | 20.0% |
| missing-testid | 5 | 12.5% |
| seed-data-mismatch | 4 | 10.0% |
| strict-mode | 4 | 10.0% |
| backend-bug | 2 | 5.0% |
| spa-redirect | 1 | 2.5% |
| other | 1 | 2.5% |

### When was Replay most effective?
Replay was used in only 1 of 49 failures (the deployment test in W77). It confirmed the app was working correctly after fixing the SPA redirect issue but was **not necessary** — the error output (404 on direct route access) was diagnostic on its own.

### When was Replay NOT used and why?
Replay was not used in 48/49 failures. The primary reasons:
- **Diagnosed from error output** (most common): Playwright error messages, DOM snapshots, and count mismatches were sufficient to identify root causes, especially for data-contamination and selector issues.
- **No recording available** (12 failures): Test script cleaned up recordings before upload, or infrastructure issues prevented recording creation.
- **Diagnosed from code inspection**: For backend bugs and seed data issues, reading the source code was more direct than analyzing recordings.

### Common debugging strategies that worked
1. **Error output analysis**: Reading Playwright's error context snapshots (DOM state at failure point) was the single most effective strategy, resolving the vast majority of failures without any additional tools.
2. **Selector refinement**: Identifying over-matching `[data-testid^="route-stop-"]` selectors that matched container elements — consistently resolved by adding `:not()` exclusions.
3. **Data isolation via beforeEach cleanup**: Adding API DELETE calls in `beforeEach` hooks to clear accumulated test data.
4. **Relative assertions**: Replacing hardcoded count expectations (`toHaveCount(3)`) with relative checks (capture initial count, verify delta).
5. **Reordering destructive tests**: Moving tests that delete all data to the end of the spec file.

### Common debugging strategies that failed
No strategies were outright failures, but some took multiple iterations:
- **W63** (RouteActions reassign): Took 4 reruns because initial fix addressed count assertions but missed that reassign creates a new stop with a different ID.
- **W64** (RouteStopList): Took 5 reruns — agent initially suspected data contamination and added a `clear-route` API, but the real issue was the selector overcount bug.
- **W66** (RouteSummary): Took 3 reruns and 72 turns investigating database queries before discovering the selector issue.

### Self-inflicted failure rate
**24.5% (12/49)** of failures were self-inflicted — caused by the agent's own test-writing or fix attempts during the current session. All 12 self-inflicted failures occurred in the `writeTests` (4) and `other`/journeyQA (5) phases, plus 2 in `fixTests` (W60) and 1 in `fixTests` (W98). This is below the 50% threshold, indicating the test-writing process is reasonably reliable, though journeyQA tests (written from scratch against a live app) had a higher self-inflicted rate.

### Test Isolation Issues

**Test isolation is the dominant failure mode** at 57.5% of failure entries (data-contamination: 37.5% + strict-mode: 10.0% + seed-data-mismatch: 10.0%).

**Affected spec files:**
- Route-related specs (route-view, route-stop-list, route-summary, route-actions): 10+ failures from accumulated stops across serial test execution
- Dashboard specs (technician-status, todays-summary, urgent-calls, weather-alert): 6+ failures from prior tests creating/deleting seed data
- List specs (customer-list, service-call-list, technician-list): 10+ failures from prior tests creating extra entities

**Root cause analysis:**
- All tests run serially within each spec file, sharing the same database
- Tests that create entities (POST) without cleanup contaminate subsequent tests
- Tests that delete all entities (destructive empty-state tests) break subsequent tests that depend on seed data
- Hardcoded count assertions (`toHaveCount(3)`) are fragile when test execution order matters

**Isolation strategies that would have prevented these failures:**
1. **Mandatory beforeEach cleanup**: Every spec file should DELETE relevant entities and re-seed before each test, ensuring a known starting state.
2. **Relative assertions**: Replace all hardcoded count expectations with relative checks (capture baseline, verify delta).
3. **Unique test data**: Use timestamp-based or random names for test-created entities to avoid collisions.
4. **Destructive test isolation**: Tests that delete all data should create their own data first rather than relying on seed data, or run last.

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: "Error output first"** — Document that 98% of failures in this report were diagnosed from Playwright error output alone. Recommend checking error output, DOM snapshots, and assertion messages before reaching for Replay. Reserve Replay for failures where the page state at failure time is ambiguous or the failure involves complex async timing.
- **Add pattern: "Selector overcount"** — When using `[data-testid^="prefix-"]` selectors, always check whether a container element also matches the prefix. Add `:not()` exclusions or use more specific selectors.
- **Add pattern: "Data contamination triage"** — When count assertions fail, first check if prior tests in the same file create or delete entities. This is the #1 failure category.

### `skills/tasks/build/testing.md`
- **Mandate beforeEach cleanup**: Require every spec file to include a `beforeEach` hook that resets the relevant data domain via API DELETE calls before each test. This single change would prevent 37.5% of all failures.
- **Ban hardcoded count assertions**: Add a directive prohibiting `toHaveCount(N)` with literal numbers for entities that can be created/deleted by other tests. Require relative assertions or filtered counts.
- **Destructive test ordering**: Tests that delete all entities of a type must be the last test in the file, or must create their own data first.
- **Test data naming convention**: Require test-created entities to use unique, timestamped names (e.g., `Test Customer ${Date.now()}`) to prevent cross-test name collisions.
- **Selector validation**: Add a directive to check that `data-testid` prefix selectors don't accidentally match container elements.

### `skills/review/reportTestFailures.md`
- **Add FAILURE_RESOLUTION_TYPE distribution** to the Summary Statistics section — this report manually computed it and it provides valuable signal about whether the testing process or app-building process needs improvement.
- **Clarify TEST_FAILURES counting for clusters**: Some analyses counted a cluster of N tests as 1 TEST_FAILURE, others counted each test individually. Add explicit guidance: "When using the cluster format, TEST_FAILURES should equal the count of distinct failure entries (clusters count as 1), not the total affected tests."
- **Add "Affected Tests Count" metric**: Separately track total affected tests (including all tests within clusters) to complement the distinct failure count.
- **Track fix iteration count**: Add a field for how many test re-runs were needed to fully resolve a failure. This report shows some failures took 4-5 iterations (W63, W64), indicating debugging difficulty that isn't captured by success/failure alone.
