# Test Failures Report: app-building-7tqkvw

**Generated:** 2026-03-06
**App:** catch-log (Charter fishing boat management)
**Branch:** app-building-7tqkvw

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 85 |
| Logs with test failures | 20 |
| Logs without test failures | 65 |
| Total distinct test failures | 54 |
| Total test re-runs to achieve all-pass | 22 |
| Replay usage rate (overall) | 71% (38 of 54 failures) |
| Replay usage rate (debugged failures) | 71% (38 of 54; all failures were debugged) |
| Debugging success rate | 100% (54/54 debugged successfully) |
| Replay-assisted success rate | 100% (38/38 Replay-used failures resolved) |
| Recording availability rate | 100% (54/54 had recordings) |
| Debugging efficiency (Replay used but unnecessary) | 43% (6 of 14 individually-assessed uses) |
| Cascading fixes | 9 events (single changes resolving 2-6 failures each) |
| Self-inflicted failures | 65% (35 of 54 failures introduced by the agent's own test code) |
| Unique root causes | ~25 (13 named clusters + ~12 unclustered) |
| Fix reuse rate | 3 patterns (wait-before-count, destructive-test-reordering, formatDate normalization) |
| Infrastructure failure events | 0 |

**Failure Phase Distribution:**

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 54 | 100% |

All failures occurred during the fixTests phase. No failures during writeTests, checkDirectives, or deployment.

**Test Isolation Score: 59%** (32 of 54 failures from data-contamination + strict-mode + seed-data-mismatch categories). This exceeds the 50% threshold, indicating test isolation is the dominant failure mode.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|-----------| ------|---------|-----------|
| worker-35 | 7tqkvw/catch-log | Successfully creating a new boat | timeout | no | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | none |
| worker-36 | 7tqkvw/catch-log | Successfully creating a new captain | strict-mode | no | yes | | yes | PlaywrightSteps + Screenshot for name collision | PlaywrightSteps, ConsoleMessages, Screenshot, NetworkRequest | yes | none |
| worker-37 | 7tqkvw/catch-log | Successfully creating a new customer | timeout | no | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | none |
| worker-38 | 7tqkvw/catch-log | Max party size accepts only positive integers | backend-bug | yes | yes | | yes | PlaywrightSteps + source inspection | PlaywrightSteps | yes | none |
| worker-38 | 7tqkvw/catch-log | Successfully creating a new trip type (+ 3 more) | timeout | no | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | none |
| worker-40 | 7tqkvw/catch-log | Status can be changed to On Trip (+ 1 more) | data-contamination | no | yes | | yes | PlaywrightSteps + error-context snapshots | PlaywrightSteps | yes | none |
| worker-43 | 7tqkvw/catch-log | Clicking a captain card navigates to CaptainDetail | data-contamination | yes | yes | | yes | PlaywrightSteps + source tracing | PlaywrightSteps | yes | pending |
| worker-44 | 7tqkvw/catch-log | Trip type card displays correct duration format (+ 5 more) | data-contamination | yes | no | Root cause obvious from error-context snapshots | yes | Test ordering analysis | | yes | pending |
| worker-45 | 7tqkvw/catch-log | Length field is optional | timeout | yes | yes | | yes | PlaywrightSteps step inspection | PlaywrightSteps | yes | pending |
| worker-46 | 7tqkvw/catch-log | Adding a catch with all fields creates new entry (+ 4 more) | timeout | yes | yes | | yes | PlaywrightSteps, NetworkRequest, Screenshot, ConsoleMessages | PlaywrightSteps, ConsoleMessages, NetworkRequest, Screenshot | yes | pending |
| worker-47 | 7tqkvw/catch-log | Trip history is sorted by date descending | backend-bug | yes | yes | | yes | PlaywrightSteps + Evaluate + NetworkRequest | PlaywrightSteps, Screenshot, Evaluate, NetworkRequest | yes | pending |
| worker-48 | 7tqkvw/catch-log | Last Trip Date | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest + Screenshot | PlaywrightSteps, NetworkRequest, Screenshot | yes | pending |
| worker-48 | 7tqkvw/catch-log | Search by name filters customers (+ 4 more) | data-contamination | yes | no | Root cause obvious from test ordering analysis | yes | Test ordering analysis | | yes | pending |
| worker-49 | 7tqkvw/catch-log | Fleet Status counts are accurate (+ 1 more) | data-contamination | yes | yes | | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | yes | pending |
| worker-50 | 7tqkvw/catch-log | Edit modal pre-populates with existing trip data | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest iterative | PlaywrightSteps, Screenshot, NetworkRequest | yes | pending |
| worker-51 | 7tqkvw/catch-log | Trip Type field is optional (+ 2 more) | backend-bug | yes | yes | | yes | PlaywrightSteps + Screenshot + NetworkRequest | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | yes | pending |
| worker-51 | 7tqkvw/catch-log | Price Override | backend-bug | yes | yes | | yes | (same as schema cluster) | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | yes | pending |
| worker-51 | 7tqkvw/catch-log | Successfully creating a new trip (+ 3 more) | backend-bug | yes | yes | | yes | error-context + NetworkRequest | PlaywrightSteps, Screenshot, NetworkRequest | yes | pending |
| worker-51 | 7tqkvw/catch-log | Successfully editing an existing trip | data-contamination | no | no | Diagnosed from error context as strict mode violation | yes | Error context analysis | | yes | pending |
| worker-51 | 7tqkvw/catch-log | Cancel button closes modal without saving | data-contamination | no | no | Same root cause as edit test | yes | Error context analysis | | yes | pending |
| worker-51 | 7tqkvw/catch-log | Closing modal via X button discards changes | data-contamination | no | no | Same root cause as edit test | yes | Error context analysis | | yes | pending |
| worker-54 | 7tqkvw/catch-log | Empty state when no trips exist for today | data-contamination | no | yes | | yes | PlaywrightSteps + test sequence | PlaywrightSteps, Screenshot, ConsoleMessages | yes | pending |
| worker-54 | 7tqkvw/catch-log | Clicking card navigates to trip detail | data-contamination | no | no | Same root cause as empty state test | yes | Test ordering analysis | | yes | pending |
| worker-55 | 7tqkvw/catch-log | Delete confirmation can be cancelled (+ 3 more) | data-contamination | no | yes | | yes | PlaywrightSteps on multiple recordings | PlaywrightSteps | yes | pending |
| worker-56 | 7tqkvw/catch-log | Clearing date range shows all trips | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, Screenshot, Evaluate, NetworkRequest | yes | pending |
| worker-57 | 7tqkvw/catch-log | Trip table shows Date in readable format (+ 2 more) | data-contamination | no | yes | | yes | PlaywrightSteps + Screenshot + Evaluate | PlaywrightSteps, Screenshot, Evaluate | yes | pending |
| worker-57 | 7tqkvw/catch-log | Captain name resolved from captains table | strict-mode | yes | yes | | yes | Evaluate to inspect captain names | PlaywrightSteps, Screenshot, Evaluate | yes | pending |
| worker-58 | 7tqkvw/catch-log | Status change updates trip list view | data-contamination | no | yes | | yes | PlaywrightSteps + Screenshot + Evaluate | PlaywrightSteps, Screenshot, Evaluate | yes | pending |
| worker-59 | 7tqkvw/catch-log | Clicking an upcoming trip navigates to trip detail | data-contamination | no | no | Diagnosed from test ordering analysis | yes | Test ordering analysis | | yes | pending |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| wait-before-count | 6 | worker-36, worker-37, worker-38 | Added visibility waits before count() calls; single pattern applied across multiple spec files |
| boat-status-parallel-isolation | 2 | worker-40 | Created dedicated boats per test via API |
| catalog-empty-state-data-contamination | 6 | worker-44 | Moved destructive test to end + added visibility waits |
| catch-log-actions-race-condition | 5 | worker-46 | Added visibility wait in navigateToTripWithCatches() helper |
| customer-list-formatDate-bug | 1 | worker-48 | Fixed formatDate to handle ISO timestamps |
| customer-list-empty-state-contamination | 5 | worker-48 | Moved destructive empty-state test to end |
| fleet-status-data-contamination | 2 | worker-49 | Added cleanup of test-created boats in beforeEach |
| schema-not-null-constraint | 4 | worker-51 | Made boat_id, captain_id, trip_type_id nullable in schema |
| invalid-date-formatting | 4 | worker-51 | Fixed formatDate across 6 components to handle ISO timestamps |
| serial-state-contamination | 2 | worker-51 | Used .first() and more specific selectors to avoid ambiguity |
| todays-trips-serial-contamination | 2 | worker-54 | Moved empty state test to end + added cleanup |
| delete-test-ordering | 4 | worker-55 | Moved destructive delete test to end of describe block |
| empty-state-deletes-data | 3 | worker-57 | Moved empty state test to end + added .first() for strict mode |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 30 | 56% |
| backend-bug | 12 | 22% |
| timeout | 10 | 19% |
| strict-mode | 2 | 4% |

**Note:** Entry counts (54 total in this table) are based on TEST_FAILURES totals per log. Some logs (worker-51) had failures with multiple overlapping root causes across re-runs.

### When Replay Was Most Effective

Replay was most valuable for **backend bugs** involving data format mismatches (ISO timestamps, seconds in time fields). The `NetworkRequest` tool was critical for revealing API response formats that differed from frontend expectations. Key examples:
- formatDate bug: NetworkRequest showed ISO timestamps while code expected YYYY-MM-DD
- departure_time: NetworkRequest revealed "06:00:00" vs expected "06:00"
- Schema NOT NULL constraints: NetworkRequest + Screenshot revealed 500 errors on POST

The `PlaywrightSteps` + `Evaluate` combination was effective for diagnosing ambiguous selector issues (data-contamination with multiple matching rows).

### When Replay Was NOT Used and Why

Replay was skipped for 16 of 54 failures (30%), always for the same reason: **root cause was obvious from Playwright error-context snapshots or test ordering analysis**. Specifically:
- Empty state data contamination (11 failures): error-context.md showed "No items available" in all failing tests, making destructive test ordering obvious
- State accumulation (5 failures): strict mode violations and row count mismatches were diagnosable from error output showing wrong counts

### Common Debugging Strategies That Worked

1. **PlaywrightSteps first** (used in 38/38 Replay-assisted debugs): Always the entry point. Identifies which step failed and provides timing context.
2. **PlaywrightSteps + NetworkRequest** for data format bugs: Confirms what the API actually returns vs what the frontend expects.
3. **PlaywrightSteps + Screenshot + Evaluate** for data contamination: Shows actual page state, counts matching elements, reveals accumulated test data.
4. **Test ordering analysis** (no Replay needed): When error-context.md shows empty state in all failures, the destructive test pattern is immediately obvious.

### Common Debugging Strategies That Failed

No debugging strategies outright failed in this session. However, the agent repeatedly re-diagnosed the same patterns (wait-before-count, destructive test ordering, formatDate) across multiple spec files rather than applying preventive fixes proactively. This suggests the debugging was effective per-instance but lacked cross-spec learning.

### Self-Inflicted Failure Rate: 65%

35 of 54 failures were self-inflicted (introduced by the agent's own test code). This is a high rate indicating systematic issues with how tests are written:

- **wait-before-count pattern** (12 failures): Tests called `count()` before API data loaded. This identical bug was written into 6+ spec files.
- **Destructive test ordering** (18 failures): Empty-state tests that delete all data were placed before tests that depend on that data. This pattern repeated across 7 spec files.
- **Strict mode selector ambiguity** (2 failures): Tests used substring matches that collided with seed data names.

The remaining 19 failures (35%) were **pre-existing app bugs** discovered by testing: formatDate handling ISO timestamps, schema NOT NULL constraints, React state batching in setSearchParams, and HTML5 form validation blocking custom validation.

### Test Isolation Issues

**Test Isolation Score: 59%** (data-contamination: 30 + strict-mode: 2 = 32 of 54 total failures)

This exceeds the 50% threshold, confirming test isolation is the dominant failure mode. Analysis:

**Affected spec files:** catalog-list, captain-list, customer-list, trip-list, trip-detail, trip-filters, trip-status-workflow, todays-trips, upcoming-trips, fleet-status, boat-detail-actions, new-edit-trip-modal-actions (12 of 25 spec files)

**Root causes:**
1. **Destructive empty-state tests** (18 failures across 7 files): Tests that delete all entities to verify empty state ran before other tests that needed that data. All tests in each spec file share a single database branch.
2. **Accumulated test data** (8 failures across 4 files): Tests that create entities via API polluted the database for subsequent tests expecting specific counts.
3. **Parallel worker interference** (2 failures): Multiple workers operating on shared boat status.
4. **Strict mode name collisions** (2 failures): Test-created entity names that partially matched seed data.

**Prevention strategies:**
- Write destructive tests at the end of describe blocks (or use `test.describe.serial`)
- Use `beforeEach` cleanup to remove test-created data
- Create dedicated entities per test instead of relying on shared seed data
- Use unique, non-colliding names for test-created entities (avoid substrings of seed data)

The checkDirectives phase (workers 65-80) later caught and fixed many of these issues by wrapping destructive tests in `test.describe.serial`, but the damage was already done during fixTests.

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "wait-before-count" as a known pattern**: Before calling `locator.count()` to capture an initial count, always wait for at least one element to be visible. This was the single most repeated bug (12 failures).
2. **Add "destructive test ordering" as a known anti-pattern**: Document that tests deleting all entities must run last in their describe block or use `test.describe.serial`. Reference the 18 failures caused by this.
3. **Add "formatDate ISO timestamp" pattern**: When the backend returns ISO timestamps (e.g., `2026-03-10T00:00:00.000Z`), component formatDate functions must strip the time component before formatting. This caused bugs across 6+ components.

### `skills/tasks/build/testing.md`

1. **Mandate `test.describe.serial` for destructive tests during test authoring** (not just checkDirectives): The writeTests phase should wrap any test that deletes entities in a serial describe block from the start, rather than fixing it later in checkDirectives. This would prevent ~18 failures (33% of all failures).
2. **Mandate visibility waits before count()**: Add an explicit rule that `count()` must be preceded by a wait for at least one matching element. This would prevent ~12 failures (22% of all failures).
3. **Use unique test entity names**: Require test-created entities to use names that cannot collide with seed data (e.g., prefix with "TEST-" or use UUIDs). This prevents strict-mode violations.
4. **Add beforeEach cleanup pattern**: When tests create entities via API, include cleanup in beforeEach/afterEach to prevent data accumulation across tests in the same spec file.
5. **Cross-spec learning**: When a fix pattern is discovered (e.g., wait-before-count), apply it proactively to all spec files in the same batch rather than fixing each file independently.

### `skills/review/reportTestFailures.md`

1. **Clarify TEST_FAILURES counting for multi-run failures**: When a test fails in run 1 for reason A and run 2 for reason B, the current template is ambiguous about whether this is 1 or 2 failures. Recommend counting it as 1 distinct test failure with multiple root causes noted.
2. **Add FAILURE_RESOLUTION_TYPE to cluster template**: The cluster template is missing FAILURE_RESOLUTION_TYPE, which makes synthesis harder. Add it as a required field.
3. **Add fix-pattern-reuse field**: A field like `FIX_PATTERN: wait-before-count` (distinct from ROOT_CAUSE_CLUSTER) would help the synthesizer identify reusable fixes across unrelated clusters.
