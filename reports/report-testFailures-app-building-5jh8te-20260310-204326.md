# Test Failures Report: app-building-5jh8te

**Generated**: 2026-03-11
**App**: PestPatrol (Pest Control Customer & Property Database)
**Period**: 2026-03-10T20:44 – 2026-03-11T06:15 (135 worker logs)

---

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 135 |
| Logs with test failures | 12 |
| Logs without test failures | 123 |
| Total distinct test failures | 16 |
| Total affected tests | 26 |
| Replay usage rate | 12.5% (2/16) |
| Replay usage rate (debugged only) | 12.5% (2/16) |
| Debugging success rate | 100% (16/16) |
| Replay-assisted success rate | 100% (2/2) |
| Recording availability rate | 93.8% (15/16) |
| Debugging efficiency (Replay used but unnecessary) | 0% (0/2) |
| Cascading fixes | 4 (changesets resolving multiple failures) |
| Self-inflicted failures | 3 (18.8% of total) |
| Total test re-runs | 20 |
| Unique root causes | 15 (6 clusters + 9 unclustered) |
| Fix reuse rate | 0 (no shared fix patterns across spec files) |
| Pre-existing failure rate | 81.3% (13/16) |
| Replay decision quality | 0% unnecessary (0/2 REPLAY_NECESSARY=no) |
| Test Isolation Score | 56.3% (9/16 — data-contamination + strict-mode) |
| Self-inflicted fix quality cost | 3 additional re-runs |
| Infrastructure failure events | 2 events (5 total infra failures, ~32 test executions impacted) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 14 | 87.5% |
| other (JourneyQA) | 2 | 12.5% |

### Failure Resolution Type Distribution

| Type | Count | % of Total |
|------|-------|-----------|
| test-code | 11 | 68.8% |
| app-code | 1 | 6.3% |
| both | 3 | 18.8% |
| none | 1 | 6.3% |

### Diagnostic Source Effectiveness (all resolved failures)

| Source | Count | % of Total |
|--------|-------|-----------|
| error-output | 12 | 75.0% |
| error-context-snapshot | 2 | 12.5% |
| replay-necessary | 2 | 12.5% |

### Fix Iteration Difficulty Distribution

| Iterations | Count | % of Total |
|-----------|-------|-----------|
| 1 | 14 | 87.5% |
| 2 | 2 | 12.5% |
| 3 | 0 | 0% |
| 4+ | 0 | 0% |

### Resolution Effort Distribution (where TOOL_CALL_COUNT available, 9/16 failures)

| Tool Calls | Count |
|-----------|-------|
| 1-3 | 4 |
| 4-9 | 5 |
| 10+ | 0 |

---

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|------------|----------------------|-------------------|----------|-------|---------|-----------|
| 53 | worker-5jh8te/PestPatrol | Cluster: address-autocomplete-obstruction (3 tests) | race-condition | yes | yes | | yes | PlaywrightSteps → Screenshot → InspectElement | PlaywrightSteps, Screenshot, InspectElement, NetworkRequest, ConsoleMessages, UncaughtException, ReactException | yes | 8fd4282af8 |
| 53 | worker-5jh8te/PestPatrol | AddEditCustomerModal Save button updates existing customer in edit mode | data-contamination | yes | no | error-output-sufficient — duplicate "Jane Smith" rows | yes | | | yes | 8fd4282af8 |
| 56 | worker-5jh8te/PestPatrol | AddEditFindingModal cancel discards changes | data-contamination | yes | no | error-output-sufficient — accumulated findings from prior tests | yes | | | yes | 75a9eea230 |
| 57 | worker-5jh8te/PestPatrol | AddEditPropertyModal Save button updates existing property in edit mode | data-contamination | yes | no | error-output-sufficient — duplicate "456 Oak Ave" rows | yes | | | yes | bb36776770 |
| 57 | worker-5jh8te/PestPatrol | AddEditPropertyModal Cancel in edit mode preserves original data | other | yes | no | error-output-sufficient — sqft formatting "2,200" vs "2200" | yes | | | yes | bb36776770 |
| 65 | worker-5jh8te/PestPatrol | Cluster: customer-detail-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient — stale data from earlier edit tests | yes | | | yes | none |
| 69 | worker-5jh8te/PestPatrol | CustomerVisitHistoryTab reflects newly completed visit | other | yes | no | error-output-sufficient — wrong URL path /visits/ vs /service-visits/ | yes | | | yes | none |
| 72 | worker-5jh8te/PestPatrol | Cluster: attachment-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient — accumulated attachment counts | yes | | | yes | none |
| 78 | worker-5jh8te/PestPatrol | Cluster: sqft-formatting-mismatch (3 tests) | bad-assertion-api | yes | no | error-output-sufficient — comma formatting difference | yes | | | yes | none |
| 78 | worker-5jh8te/PestPatrol | PropertyOverviewTab inline editing of special requirements | race-condition | yes | yes | | yes | NetworkRequest → PlaywrightSteps | NetworkRequest, PlaywrightSteps | yes | 7e65f89af9 |
| 80 | worker-5jh8te/PestPatrol | PropertyServiceScheduleTab reflects newly scheduled visit | strict-mode | yes | no | error-output-sufficient — two rows matching "Apr" text | yes | | | yes | none |
| 81 | worker-5jh8te/PestPatrol | Cluster: page-evaluate-before-navigation (2 tests) | other | yes | no | error-output-sufficient — fetch URL parse error at about:blank | yes | | | yes | cdeef34948 |
| 89 | worker-5jh8te/PestPatrol | Cluster: hardcoded-dates-in-seed-and-tests (3 tests) | date-format | yes | no | error-output-sufficient — dates showed "No upcoming visits" | yes | | | yes | 4a3baf5f13 |
| 108 | worker-5jh8te/PestPatrol | VisitList multiple filters combine correctly | data-contamination | no | no | error-output-sufficient — count mismatch from status patch | no | | | yes | none |
| 135 | worker-5jh8te/PestPatrol | Dashboard Overview — office manager checks day schedule | strict-mode | no | no | error-output-sufficient — "Upcoming Visits" matched multiple elements | yes | | | yes | none |
| 135 | worker-5jh8te/PestPatrol | Customer Management — browse, view detail, add customer | data-contamination | no | no | error-output-sufficient — duplicate customer from previous run | yes | | | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|-----------|
| address-autocomplete-obstruction | 3 tests | 53 | Fixed by mocking Nominatim API to prevent dropdown obstruction (8fd4282af8) |
| customer-detail-data-contamination | 2 tests | 65 | Fixed by reordering tests and making assertions data-independent |
| attachment-data-contamination | 2 tests | 72 | Fixed with bulk-delete endpoint and cleanup calls in tests |
| sqft-formatting-mismatch | 3 tests | 78 | Fixed test assertions to expect comma-formatted numbers |
| page-evaluate-before-navigation | 2 tests | 81 | Fixed by adding page.goto before page.evaluate calls (cdeef34948) |
| hardcoded-dates-in-seed-and-tests | 3 tests | 89 | Fixed seed data to use relative dates and tests to use dynamic formatting (4a3baf5f13) |

---

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 7 | 43.8% |
| other | 3 | 18.8% |
| race-condition | 2 | 12.5% |
| strict-mode | 2 | 12.5% |
| bad-assertion-api | 1 | 6.3% |
| date-format | 1 | 6.3% |

### Data-Contamination Sub-Categories

Data-contamination is the dominant failure category at 43.8%, warranting sub-category analysis:

| Sub-Category | Count | Examples |
|-------------|-------|---------|
| accumulated-data | 5 | Duplicate customer/property rows from create tests persisting for subsequent tests (logs 53, 56, 57, 72, 135) |
| destructive-ordering | 2 | Edit/modify tests changing data that subsequent tests depend on (logs 65, 108) |

The primary pattern is tests creating records without cleanup, causing subsequent tests to find duplicate entries or unexpected counts. This is a structural issue with test isolation in serial spec files.

### Test Isolation Issues

Test isolation categories (data-contamination + strict-mode) account for 56.3% of all failures, exceeding the 50% threshold.

**Affected spec files**: add-edit-customer-modal, add-edit-finding-modal, add-edit-property-modal-actions, customer-detail, property-attachments-tab, property-service-schedule-modal, visit-list, journey-qa tests.

**Root cause**: Most specs run tests serially within a shared database state. Tests that create records (customers, properties, findings, attachments) pollute the state for subsequent tests that expect specific counts or unique text matches.

**Isolation strategies that would have prevented these failures**:
1. Use unique, timestamped identifiers in test data (already applied as a fix in several specs)
2. Add cleanup/reset in `beforeEach` or `afterEach` hooks
3. Use relative assertions (count-before + count-after) instead of absolute counts
4. Add `test.describe.serial` with proper data reset for destructive tests

### When Was Replay Most Effective?

Replay was used in only 2 of 16 failures, but both times it was genuinely necessary (100% REPLAY_NECESSARY rate). It was most effective for:
- **Race conditions** involving UI element obstruction (autocomplete dropdown blocking clicks) — PlaywrightSteps + Screenshot + InspectElement was the key strategy
- **React StrictMode double-fetch bugs** causing state resets during editing — NetworkRequest to trace payloads + PlaywrightSteps for timing

### When Was Replay NOT Used?

14 of 16 failures (87.5%) were diagnosed without Replay:
- **error-output** alone was sufficient for 12/16 (75%) — strict mode violations, count mismatches, and format differences all produce clear error messages
- **error-context-snapshot** was sufficient for 2/16 (12.5%) — page snapshots showing accumulated data or duplicate rows

### Common Debugging Strategies That Worked

1. **Error output inspection** (most common): Strict mode violation messages directly indicate the duplicate element, making root cause obvious
2. **Unique test data**: Using timestamps or unique strings in test data (e.g., `Test Customer ${Date.now()}`) to avoid cross-test contamination
3. **Relative assertions**: Counting records before and after operations instead of expecting absolute counts
4. **API-driven test setup/cleanup**: Using `page.evaluate(fetch(...))` for test data management

### Common Debugging Strategies That Failed

None — all debugging attempts were successful (100% success rate). The agent consistently chose appropriate strategies.

### Self-Inflicted Failure Rate

**3 out of 16 failures (18.8%) were self-inflicted** — introduced by the agent's own actions during the session. All 3 occurred late in the build cycle:
- Log 108: FixViolation task patched a visit status for badge verification, contaminating filter count for subsequent test
- Log 135: JourneyQA tests used non-unique data and text matchers that collided with existing seed data

All self-inflicted failures were resolved in 1 iteration each, costing 3 additional re-runs total. The rate is within acceptable bounds (<20%) but indicates the agent should apply learned data-isolation patterns (unique names, relative counts) proactively when writing new tests.

---

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "data-contamination quick-check" pattern**: When error output shows strict mode violations or unexpected counts, first check if prior tests in the same file create/modify matching data before opening Replay. This would have correctly skipped Replay for 7/16 failures.
2. **Add "PlaywrightSteps → InspectElement" sequence** for timeout/stuck failures: When a test times out waiting for a click, use PlaywrightSteps to find the stuck step, then InspectElement to check for obstructing elements (dropdowns, modals, tooltips).

### `skills/tasks/build/testing.md`

1. **Mandate unique test data identifiers**: All test data created by tests (customer names, addresses, etc.) must include `Date.now()` or `crypto.randomUUID()` suffixes to prevent cross-test contamination. This single practice would have prevented 5 of 7 data-contamination failures.
2. **Mandate relative count assertions**: Tests verifying record counts should capture count before the operation and assert `count + 1` rather than expecting an absolute number. This would prevent accumulated-data contamination.
3. **Require `page.goto()` before `page.evaluate(fetch(...))` in `beforeEach`**: Tests using API calls for setup must navigate to the app first, as `fetch()` with relative URLs fails at `about:blank`.
4. **Add date-sensitive seed data guidance**: Seed data with dates should use relative offsets from `new Date()` rather than hardcoded date strings, to prevent failures when tests run on different days.

### `skills/review/reportTestFailures.md`

1. **Add "data-contamination sub-category" as a standard field**: Given that data-contamination is consistently the dominant failure category across reports, adding a `DATA_CONTAMINATION_SUBCATEGORY` field (accumulated-data, destructive-ordering, settings-contamination) to the per-failure template would make sub-category analysis automatic rather than manual.
2. **Add guidance for "other" category refinement**: Three failures were categorized as "other" (URL path mismatch, sqft formatting, page.evaluate at about:blank). Consider adding categories like "wrong-url" and "test-setup-error" to reduce reliance on "other".

---

## 5. Replay Fixes Table

### Fix 1: address-autocomplete-obstruction

INITIAL_CHANGESET: none (pre-existing in initial test code)
FAILING_TEST: AddEditCustomerModal Save button creates a new customer
FINAL_CHANGESET: 8fd4282af8
ASSESSMENT: Replay was essential. The autocomplete dropdown overlay was invisible in error output — only PlaywrightSteps (finding stuck step 14) and InspectElement (confirming dropdown obstruction) could reveal the root cause. Fix mocked the Nominatim API to prevent dropdown from appearing, resolving 3 tests simultaneously.

### Fix 2: PropertyOverviewTab special requirements race condition

INITIAL_CHANGESET: none (pre-existing app bug in useEffect)
FAILING_TEST: PropertyOverviewTab inline editing of special requirements
FINAL_CHANGESET: 7e65f89af9
ASSESSMENT: Replay was essential. The test showed an empty PATCH payload but the UI appeared correct. NetworkRequest revealed the empty `special_requirements` array being sent, and PlaywrightSteps identified the timing — React StrictMode's double-fetch triggered a useEffect that reset checkbox state during editing. Fix added an `isEditing` guard to the useEffect. This was the only app-code bug found by Replay.
