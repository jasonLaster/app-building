# Test Failures Report: app-building-wls8oa-20260309-182042

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 131 |
| Logs with test failures | 25 (19.1%) |
| Logs without test failures | 106 (80.9%) |
| Total distinct test failure entries | 32 |
| Total affected tests | 64 |
| Total test re-runs across all logs | 65 |
| Unique root causes | 32 |
| Pre-existing failure rate | 62.5% (20 of 32) |
| Self-inflicted failures | 5 (15.6%) |
| Infrastructure failure events | 2 logs, 5 events (~15 tests affected) |

### Replay & Debugging Metrics

| Metric | Value |
|--------|-------|
| Replay usage rate (all failures) | 37.5% (12 of 32) |
| Replay usage rate (debugged failures) | 37.5% (12 of 32) |
| Debugging success rate | 100% (32 of 32) |
| Replay-assisted success rate | 100% (12 of 12) |
| Recording availability rate | 90.6% (29 of 32) |
| Replay decision quality (REPLAY_NECESSARY=no / REPLAY_USED=yes) | 66.7% (8 of 12) |
| Replay genuinely necessary | 4 failures (12.5% of total) |
| Cascading fixes (single change resolving multiple tests) | 14 |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 28 | 87.5% |
| checkDirectives | 2 | 6.3% |
| other (JourneyQA) | 2 | 6.3% |
| writeTests | 0 | 0% |
| deployment | 0 | 0% |

### Failure Resolution Type Distribution

| Type | Count | % of Total |
|------|-------|------------|
| test-code | 24 | 75.0% |
| app-code | 4 | 12.5% |
| both | 4 | 12.5% |
| none | 0 | 0% |

### Test Isolation Score

**56.3%** (18 of 32 failures from data-contamination + strict-mode + seed-data-mismatch)

This exceeds the 50% threshold, indicating test isolation is the dominant failure mode. See dedicated analysis in Section 3.

### Diagnostic Source Effectiveness (among resolved failures)

| Source | Count | % of Total |
|--------|-------|------------|
| error-output | 27 | 84.4% |
| replay-necessary | 4 | 12.5% |
| page-snapshot | 1 | 3.1% |

### Fix Iteration Difficulty Distribution

| Iterations | Count | % of Total |
|------------|-------|------------|
| 1 | 23 | 71.9% |
| 2 | 4 | 12.5% |
| 3 | 3 | 9.4% |
| 4+ | 2 | 6.3% |

**4+ iteration outliers:**
- `notification-toggle-race` cluster (worker-83): 4 iterations — race condition with Redux state updates during rapid toggle clicks, complicated by data contamination from prior tests
- `upcoming-pm-data-contamination` cluster (worker-65): 3 iterations — interleaved data contamination and backend bug requiring both test-code and app-code fixes

### Fix Reuse Rate

1 distinct fix pattern applied to multiple spec files: `destructive-test-reordering` (used in dashboard-recent.spec.ts and dashboard-upcoming-pm.spec.ts)

---

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------|----|---------|-----------|
| worker-58 | w1/PropertyCare | netlify-api-redirect cluster (3 tests) | backend-bug | yes | yes | | yes | NetworkRequest + Screenshot | NetworkRequest, ConsoleMessages, Screenshot | yes | 845ecffa9c |
| worker-59 | w1/PropertyCare | categories-not-seeded cluster (2 tests) | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps + NetworkRequest + Screenshot | PlaywrightSteps, NetworkRequest, ConsoleMessages, Screenshot | yes | bf615b46b8 |
| worker-63 | w1/PropertyCare | dashboard-recent-data-contamination cluster (6 tests) | data-contamination | yes | no | error-output-sufficient — page snapshots showed missing rows | yes | | | yes | 440a24eb80 |
| worker-65 | w1/PropertyCare | upcoming-pm-data-contamination cluster (4 tests) | data-contamination | yes | no | error-output-sufficient — expected vs actual counts clear | yes | | | yes | 09b89db587 |
| worker-65 | w1/PropertyCare | Upcoming PM shows fewer than 5 when fewer schedules exist | backend-bug | yes | yes | | yes | NetworkRequest to inspect DELETE responses | NetworkRequest | yes | 09b89db587 |
| worker-67 | w1/PropertyCare | new-request-strict-mode cluster (2 tests) | strict-mode | yes | no | error-output-sufficient — strict mode errors clear | yes | | | yes | 66da816263 |
| worker-68 | w1/PropertyCare | work-order-strict-mode cluster (3 tests) | strict-mode | yes | no | error-output-sufficient — strict mode errors clear | yes | | | yes | 0e3bef27b5 |
| worker-70 | w1/PropertyCare | property-detail-name-edit-ordering cluster (3 tests) | data-contamination | yes | yes | | yes | PlaywrightSteps to find stuck step | PlaywrightSteps | yes | 77be1958c5 |
| worker-76 | w1/PropertyCare | request-list-destructive-ordering cluster (2 tests) | data-contamination | yes | no | error-output-sufficient — empty page with no data | yes | | | yes | f9e4bd37cd |
| worker-77 | w1/PropertyCare | schedule-detail-edit-renamed-records cluster (2 tests) | data-contamination | yes | no | error-output-sufficient — timeout on renamed records | yes | | | yes | 636a661781 |
| worker-78 | w1/PropertyCare | Generated work order creates an execution history entry | data-contamination | yes | yes | | yes | PlaywrightSteps to confirm count mismatch | PlaywrightSteps | yes | 7239669692 |
| worker-81 | w1/PropertyCare | destructive-test-ordering cluster (3 tests) | data-contamination | yes | no | error-output-sufficient — empty state after destructive test | yes | | | yes | c5c0815050 |
| worker-82 | w1/PropertyCare | Edit category updates the category details | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 0871f7305c |
| worker-82 | w1/PropertyCare | self-inflicted-data-contamination cluster (2 tests) | data-contamination | no | no | error-output-sufficient — stale data from now-passing tests | yes | | | yes | 0871f7305c |
| worker-83 | w1/PropertyCare | notification-toggle-race cluster (2 tests) | race-condition | yes | yes | | yes | NetworkRequest + PlaywrightSteps | NetworkRequest, PlaywrightSteps | yes | 0871f7305c |
| worker-84 | w1/PropertyCare | Staff Members section displays list of existing staff | race-condition | yes | yes | | yes | ConsoleMessages + NetworkRequest + Screenshot + Evaluate | ConsoleMessages, NetworkRequest, Screenshot, Evaluate | yes | 629d15c689 |
| worker-84 | w1/PropertyCare | Edit staff member updates their details | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 629d15c689 |
| worker-84 | w1/PropertyCare | Creating a new staff member adds them to the list | CSS/layout | yes | no | error-output-sufficient — dropdown intercepting Save button | yes | | | yes | 629d15c689 |
| worker-84 | w1/PropertyCare | Multiple add/delete operations on staff work correctly | data-contamination | yes | no | error-output-sufficient — alphabetical sort issue | yes | | | yes | 629d15c689 |
| worker-86 | w1/PropertyCare | Vacant units display Vacant in tenant column | strict-mode | yes | yes | | yes | Screenshot + Evaluate to inspect DOM text | PlaywrightSteps, Screenshot, Evaluate | yes | b3b5cd189f |
| worker-87 | w1/PropertyCare | Cancel button closes the Add Vendor modal without saving | data-contamination | yes | no | error-output-sufficient — row count mismatch | yes | | | yes | ddb2fc92e1 |
| worker-92 | w1/PropertyCare | Edited description reflects in the work order list | data-contamination | no | no | error-output-sufficient — expected vs received description | yes | | | yes | 86ef8727ac |
| worker-93 | w1/PropertyCare | Multiple status changes create separate activity log entries | data-contamination | no | no | error-output-sufficient — expected "Open" got "Assigned" | yes | | | yes | 3227956600 |
| worker-94 | w1/PropertyCare | activity-log-testid-selector cluster (2 tests) | missing-testid | no | no | error-output-sufficient — selector resolved to 0 elements | yes | | | yes | 0c88d9a505 |
| worker-95 | w1/PropertyCare | wo-detail-data-contamination cluster (3 tests) | data-contamination | no | no | error-output-sufficient — expected vs received values clear | yes | | | yes | b76a95ddb7 |
| worker-96 | w1/PropertyCare | Property dropdown filters by selected property | seed-data-mismatch | no | no | error-output-sufficient — seed data inspection | yes | | | yes | 339b8ef094 |
| worker-96 | w1/PropertyCare | Filters persist while interacting with the table | race-condition | no | no | error-output-sufficient — state reset by page navigation | yes | | | yes | 339b8ef094 |
| worker-97 | w1/PropertyCare | Priority column shows color-coded badges | CSS/layout | no | no | error-output-sufficient — CSS class mismatch | yes | | | yes | pending |
| worker-113 | w1/PropertyCare | jsx-comment-syntax cluster (8 tests) | other | no | no | error-output-sufficient — TypeScript parse error | no | | | yes | none |
| worker-119 | w1/PropertyCare | Toggle new requests notification on | race-condition | no | no | error-output-sufficient — "20px" vs "2px" timing | yes | | | yes | none |
| worker-4 (Mar 10) | w1/PropertyCare | Journey: Triage a maintenance request (wrong testid) | missing-testid | no | yes | | no | Attempted Replay upload, fell back to code inspection | (upload failed) | yes | none |
| worker-4 (Mar 10) | w1/PropertyCare | Journey: Triage a maintenance request (disabled button) | race-condition | no | yes | | no | Read error output, fill() vs keyboard.type() | (upload failed) | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| netlify-api-redirect | 3 tests | worker-58 | Fixed: added [[redirects]] in netlify.toml (845ecffa9c) |
| categories-not-seeded | 2 tests | worker-59 | Fixed: added category seeding to seed-db.ts (bf615b46b8) |
| dashboard-recent-data-contamination | 6 tests | worker-63 | Fixed: moved destructive tests to serial block at end (440a24eb80) |
| upcoming-pm-data-contamination | 4 tests | worker-65 | Fixed: moved destructive test to end (09b89db587) |
| new-request-strict-mode | 2 tests | worker-67 | Fixed: added .first() to locators (66da816263) |
| work-order-strict-mode | 3 tests | worker-68 | Fixed: unique descriptions with Date.now() (0e3bef27b5) |
| property-detail-name-edit-ordering | 3 tests | worker-70 | Fixed: moved name edit test to last (77be1958c5) |
| request-list-destructive-ordering | 2 tests | worker-76 | Fixed: moved destructive test to end (f9e4bd37cd) |
| schedule-detail-edit-renamed-records | 2 tests | worker-77 | Fixed: used different seed records (636a661781) |
| schedule-detail-hardcoded-count | 1 test | worker-78 | Fixed: relative assertions (7239669692) |
| destructive-test-ordering | 3 tests | worker-81 | Fixed: moved destructive test to end in serial section (c5c0815050) |
| self-inflicted-data-contamination | 2 tests | worker-82 | Fixed: dynamic assertions and unique names (0871f7305c) |
| notification-toggle-race | 2 tests | worker-83 | Fixed: optimistic state updates + data reset (0871f7305c) |
| staff-segments-index | 1 test | worker-84 | Fixed: corrected URL segment index (629d15c689) |
| activity-log-testid-selector | 2 tests | worker-94 | Fixed: changed to starts-with selectors (0c88d9a505) |
| wo-detail-data-contamination | 3 tests | worker-95 | Fixed: assigned each test a different unmodified work order (b76a95ddb7) |
| jsx-comment-syntax | 8 tests | worker-113 | Fixed: corrected JSX comment placement (self-inflicted) |

---

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 13 | 40.6% |
| race-condition | 5 | 15.6% |
| backend-bug | 4 | 12.5% |
| strict-mode | 3 | 9.4% |
| seed-data-mismatch | 2 | 6.3% |
| CSS/layout | 2 | 6.3% |
| missing-testid | 2 | 6.3% |
| other | 1 | 3.1% |

### When Was Replay Most Effective?

Replay was genuinely necessary (REPLAY_NECESSARY=yes) for **4 failures** — all involving backend bugs where the error was not visible from test output alone:

1. **netlify-api-redirect** (worker-58): NetworkRequest revealed /api/* returned HTML instead of JSON due to missing Netlify redirects. The test simply timed out waiting for data — error output showed no clue about the routing issue.
2. **categories-not-seeded** (worker-59): NetworkRequest + PlaywrightSteps showed /api/categories returned an empty array. The test timed out waiting for dropdown options — Replay revealed the truncate-without-reseed pattern.
3. **DELETE 405 bug** (worker-65): NetworkRequest showed all DELETE requests to /api/preventive-schedules/:id returned 405 Method Not Allowed — a URL segment index bug (segments[3] vs segments[2]).
4. **Staff list infrastructure** (worker-84): ConsoleMessages + NetworkRequest revealed ERR_CONNECTION_REFUSED from stale Replay recordings.log causing browser connection failures.

**Common tool sequences for effective Replay usage:** NetworkRequest → Screenshot (for backend issues), PlaywrightSteps → NetworkRequest (for interaction + API issues).

### When Was Replay NOT Used and Why?

20 of 32 failures (62.5%) did not use Replay. In all cases, the reason was **error-output-sufficient**:

- **Data contamination failures** (13): Error output clearly showed expected vs received values or empty states, making the test ordering issue immediately obvious.
- **Strict mode violations** (2 of 3): Error messages explicitly listed multiple matching elements.
- **Seed data mismatches** (1 of 2): Error showed wrong count with clear seed data explanation.
- **CSS/layout, missing-testid, other**: Error output provided sufficient diagnostic information.

### Common Debugging Strategies That Worked

1. **Destructive test reordering** — Moving tests that delete/modify seed data to the end of describe blocks (often in `test.describe.serial`). Resolved 4 clusters across 15+ tests.
2. **Unique identifiers per test** — Using `Date.now()` or unique names to prevent data accumulation collisions. Resolved strict-mode and data-contamination failures.
3. **Different seed records per test** — Assigning each test a unique, unmodified seed record to prevent cross-test data interference.
4. **NetworkRequest inspection** — For backend bugs, checking API response codes and payloads to identify routing/handler issues.

### Common Debugging Strategies That Failed

1. **Word boundary regex** (worker-86): First fix attempt used `\b202\b` but failed because DOM text was concatenated as "202Vacant" with no word boundary. Required digit-boundary lookaround `(?<!\d)202(?!\d)`.
2. **Multiple fix approaches for race conditions** (worker-83): Tried optimistic updates, debounce, and serialization before identifying the true root cause was data contamination from prior tests not resetting notification preferences. Consumed 4 iterations.

### Self-Inflicted Failure Rate

**15.6%** (5 of 32 failures) were self-inflicted — introduced by the agent's own fix attempts during the current session:

- worker-82: 2 data-contamination failures caused by making edit/delete tests pass, which then corrupted state for downstream tests
- worker-113: 8-test JSX comment syntax error introduced during a checkDirectives fix
- worker-119: 1 race-condition failure from adding CSS position assertions without waiting for animation
- worker-4: 2 failures from incorrect test IDs and fill() usage in journey test writing

This is below the 50% concern threshold, indicating generally good fix quality.

### Test Isolation Issues (>50% threshold exceeded)

**Test Isolation Score: 56.3%** — data-contamination (13) + strict-mode (3) + seed-data-mismatch (2) = 18 of 32 failures.

**Affected spec files with data contamination:**
- dashboard-recent.spec.ts (6 tests) — destructive test deleted seed data
- dashboard-upcoming-pm.spec.ts (4 tests) — destructive test deleted seed data
- property-detail.spec.ts (3 tests) — edit test renamed record used by later tests
- schedule-list.spec.ts (3 tests) — destructive test deleted all schedules
- wo-detail-status-priority-assign.spec.ts (3 tests) — tests shared same work order records
- schedule-detail-edit.spec.ts (2 tests) — edit tests renamed records
- schedule-detail.spec.ts (1 test) — hardcoded execution count
- settings-categories.spec.ts (2 tests) — self-inflicted from fix unblocking data-modifying tests
- request-list.spec.ts (2 tests) — destructive test ordering
- vendor-add-modal-form.spec.ts (1 test) — persisted data across tests
- wo-detail-fields-attach.spec.ts (1 test) — shared work order
- wo-detail-info-status.spec.ts (1 test) — shared work order

**Root cause pattern:** The dominant issue is **destructive test ordering** — tests that delete or modify seed data running before tests that depend on that data. This affected 6+ spec files. The tests run in Playwright's default parallel mode within a shared database.

**Isolation strategies that would have prevented these failures:**
1. **Per-test seed data isolation** — Each test creates its own data rather than relying on shared seed data. This would eliminate all data contamination failures.
2. **Serial execution for destructive tests** — The `test.describe.serial` pattern was applied as a fix multiple times. Making this a standard pattern in test writing would prevent these failures from occurring.
3. **Unique identifiers** — Using unique names/descriptions per test to avoid strict-mode collisions from accumulated data.

---

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "Check API response codes" pattern** — When a test times out waiting for data, inspect the network response first. 3 of 4 genuinely-Replay-necessary failures were backend routing bugs returning HTML or 405 instead of JSON. Add: "If test waits for data that never appears, check if the API endpoint returns the correct status code and content type."
2. **Add URL segment index pattern** — Document the recurring `segments[N]` off-by-one bug pattern in Netlify functions. Three separate backend functions (categories.ts, preventive-schedules.ts, staff.ts) had the same bug.
3. **Add "destructive test ordering" to known patterns** — When multiple tests fail with empty/missing data, check if a destructive test (delete all, modify shared records) runs before dependent tests.

### `skills/tasks/build/testing.md`

1. **Mandate destructive test isolation** — All tests that delete or significantly modify seed data MUST be placed in a `test.describe.serial` block at the end of the describe block. This single rule would have prevented 40.6% of all failures.
2. **Mandate unique identifiers for created data** — Tests that create new records should use `Date.now()` or similar unique values in descriptions/names to prevent strict-mode violations from accumulated data.
3. **Require per-test work order/record assignment** — When multiple tests modify records, each test must use a different seed record. Document the pattern of checking seed data to assign non-overlapping records.
4. **Add seed data verification step** — After writing seed-database functions, verify that all tables referenced in tests are properly seeded. The categories-not-seeded and seed-data-mismatch failures both stemmed from incomplete seeding.
5. **Validate Netlify function URL routing** — After writing backend functions, verify that [[redirects]] in netlify.toml includes all /api/* patterns and that URL segment parsing uses the correct index.

### `skills/review/reportTestFailures.md`

1. **Clarify TEST_FAILURES counting for clusters** — The current template says "TEST_FAILURES must equal the number of failure/cluster entries in the file" but some analysis files count individual tests within clusters. Add an explicit example showing: if there are 1 individual failure + 1 cluster of 3 tests = TEST_FAILURES: 2, not 4.
2. **Add REPLAY_NECESSARY to cluster template** — The cluster format currently omits REPLAY_NECESSARY, making it ambiguous when clusters have REPLAY_USED=yes. Add it as a required field for clusters where REPLAY_USED=yes.
3. **Consider adding a "fix quality" metric** — Track whether self-inflicted failures led to additional re-runs. Worker-82's self-inflicted failures added 1 re-run; worker-113's JSX error added 1 re-run. This helps quantify the cost of self-inflicted issues.

---

## 5. Replay Fixes Table

### Fix 1: netlify-api-redirect
INITIAL_CHANGESET: 845ecffa9c
FAILING_TEST: Successfully creating a new property
FINAL_CHANGESET: 845ecffa9c
ASSESSMENT: Replay NetworkRequest revealed /api/properties returned HTML instead of JSON due to missing Netlify redirects. Added [[redirects]] in netlify.toml. Cascading fix resolved 3 tests.

### Fix 2: categories-not-seeded
INITIAL_CHANGESET: bf615b46b8
FAILING_TEST: Category field is a dropdown with maintenance categories
FINAL_CHANGESET: bf615b46b8
ASSESSMENT: Replay NetworkRequest showed /api/categories returned empty array. Categories table was truncated but never re-seeded. Added category seeding to seed-db.ts. Cascading fix resolved 2 tests.

### Fix 3: DELETE 405 backend bug
INITIAL_CHANGESET: 09b89db587
FAILING_TEST: dashboard-upcoming-pm.spec.ts
FINAL_CHANGESET: 09b89db587
ASSESSMENT: Replay NetworkRequest showed DELETE requests to /api/preventive-schedules/:id returned 405 Method Not Allowed. URL segment index bug (segments[3] vs segments[2]) fixed in backend. Also resolved data contamination cluster in same changeset.

### Fix 4: property-detail-name-edit-ordering
INITIAL_CHANGESET: 77be1958c5
FAILING_TEST: Property address is editable inline with geocoding autocomplete
FINAL_CHANGESET: 77be1958c5
ASSESSMENT: Replay PlaywrightSteps confirmed test stuck waiting for "Sunset Apartments" which had been renamed to "Sunset Luxury Apartments" by prior test. Moved name edit test to last position. Replay confirmed diagnosis but error output would have sufficed.

### Fix 5: schedule-detail-hardcoded-count
INITIAL_CHANGESET: 7239669692
FAILING_TEST: Generated work order creates an execution history entry
FINAL_CHANGESET: 7239669692
ASSESSMENT: Replay PlaywrightSteps confirmed count mismatch (expected 2, found 3) due to prior test generating a work order. Fixed with relative assertions. Replay confirmed but error output would have sufficed.

### Fix 6: Edit category backend bug
INITIAL_CHANGESET: 0871f7305c
FAILING_TEST: Edit category updates the category details
FINAL_CHANGESET: 0871f7305c
ASSESSMENT: Replay PlaywrightSteps + NetworkRequest confirmed PUT request returned 405 "Method not allowed" due to segments[3] vs segments[2] bug. Same URL segment pattern as preventive-schedules fix. Replay confirmed but error output would have sufficed.

### Fix 7: notification-toggle-race
INITIAL_CHANGESET: 0871f7305c
FAILING_TEST: settings-notifications.spec.ts
FINAL_CHANGESET: 0871f7305c
ASSESSMENT: Replay NetworkRequest revealed initial GET returned stale notification preferences from prior tests, and showed out-of-order PUT responses. Required 4 iterations to fully resolve with optimistic state updates and data reset.

### Fix 8: Staff list infrastructure + backend
INITIAL_CHANGESET: 629d15c689
FAILING_TEST: Staff Members section displays list of existing staff
FINAL_CHANGESET: 629d15c689
ASSESSMENT: Replay ConsoleMessages + NetworkRequest revealed ERR_CONNECTION_REFUSED from stale Replay recordings.log file. Cleaning the recordings log resolved infrastructure issue. Staff API also had timing issue requiring test-code fix.

### Fix 9: Staff edit backend bug
INITIAL_CHANGESET: 629d15c689
FAILING_TEST: Edit staff member updates their details
FINAL_CHANGESET: 629d15c689
ASSESSMENT: Replay confirmed PUT/DELETE requests to staff API returned 405 Method Not Allowed — same segments[N] off-by-one pattern as categories and preventive-schedules. Fixed segment index in staff.ts.

### Fix 10: Strict-mode DOM text concatenation
INITIAL_CHANGESET: b3b5cd189f
FAILING_TEST: Vacant units display Vacant in tenant column
FINAL_CHANGESET: b3b5cd189f
ASSESSMENT: Replay Screenshot + Evaluate revealed DOM text concatenated as "202Vacant" with no separator, explaining why \b word boundary regex failed. Fixed with digit-boundary lookaround regex. Replay was helpful for the second fix attempt but error output would have sufficed for initial diagnosis.

---

## UpdateSkills Notes

The following recommendations were skipped because they are already covered by existing content:

- **debugging rec #3** ("destructive test ordering"): Already documented in `skills/debugging/README.md` under "Serial test data contamination" and "Anti-pattern: Destructive test ordering."
- **testing.md rec #1** ("mandate destructive test isolation"): Already exists as Test Isolation Mandates rule #2.
- **testing.md rec #2** ("mandate unique identifiers"): Already exists as Test Isolation Mandates rule #3.
- **testing.md rec #3** ("per-test record assignment"): Already exists as Test Isolation Mandates rule #6.
