# Test Failures Report: app-building-ye6jma (2026-03-09)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 110 |
| Logs with test failures | 24 |
| Logs without test failures | 86 |
| Total distinct test failures | 36 |
| Total affected tests | 113 |
| Total test re-runs across all logs | 37 |
| Unique root causes | 31 (19 clusters + 12 unclustered) |
| Replay usage rate | 38.9% (14/36) |
| Replay usage rate among debugged failures | 42.4% (14/33) |
| Debugging success rate | 93.9% (31/33 successful+partial where attempted) |
| Replay-assisted success rate | 100% (14/14) |
| Recording availability rate | 88.6% (31/35) |
| Debugging efficiency (Replay used but unnecessary) | 35.7% (5/14 where REPLAY_NECESSARY=no) |
| Cascading fixes | 8 (single changes resolving multiple failures) |
| Self-inflicted failures | 3 (8.6% of total) |
| Pre-existing failure rate | 88.6% (31/35 PRE_EXISTING=yes) |
| Replay decision quality | 41.7% REPLAY_NECESSARY=no among REPLAY_USED=yes (5/12 where field stated) |
| Test Isolation Score | 62.9% (22/35 — data-contamination + seed-data-mismatch) |
| Infrastructure failure events | 2 events, ~6 affected tests (reported separately, not in failure counts) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 28 | 80.0% |
| checkDirectives | 4 | 11.4% |
| other (JourneyQA) | 3 | 8.6% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|-----------------|-------|------------|
| test-code | 23 | 65.7% |
| app-code | 6 | 17.1% |
| both | 2 | 5.7% |
| none (unresolved) | 4 | 11.4% |

### Diagnostic Source Effectiveness (among successfully resolved)

| Source | Count | % |
|--------|-------|---|
| error-output | 20 | 64.5% |
| replay-necessary | 8 | 25.8% |
| code-inspection | 2 | 6.5% |
| page-snapshot | 1 | 3.2% |

### Fix Iteration Difficulty Distribution

| Iterations | Count | % |
|------------|-------|---|
| 1 | 23 | 65.7% |
| 2 | 4 | 11.4% |
| 3 | 1 | 2.9% |
| 4+ | 2 | 5.7% |
| 0 (unresolved) | 5 | 14.3% |

**4+ iteration failures:**
- `parallel-test-pagination` cluster in bulk-actions.spec.ts (log 49) — 4 iterations, data contamination from parallel execution
- `Hovering over a donut/pie segment shows category cost details` in cost-analysis.spec.ts (log 51) — 4 iterations, Recharts SVG hover coordinate issues

### Fix Reuse Rate

1 reused fix pattern: `destructive-test-reordering` applied across item-list-table.spec.ts (log 59) and top-used-items.spec.ts (log 76).

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------:|-------|---------|-----------|
| 48 | ye6jma/detailing-supply-tracker | Supplier dropdown is populated from suppliers list | seed-data-mismatch | yes | yes | | yes | NetworkRequest to check API response vs seed data | NetworkRequest | yes | 60575978fb |
| 48 | ye6jma/detailing-supply-tracker | Newly created item appears in the table immediately | data-contamination | yes | yes | | yes | PlaywrightSteps + NetworkRequest to check item count and pagination | PlaywrightSteps, NetworkRequest | yes | 60575978fb |
| 48 | ye6jma/detailing-supply-tracker | Creating an item that is immediately low stock triggers dashboard alert | infrastructure | yes | yes | | yes | PlaywrightSteps + NetworkRequest found HTML returned instead of JSON | PlaywrightSteps, NetworkRequest | yes | 60575978fb |
| 49 | ye6jma/detailing-supply-tracker | Cluster: parallel-test-pagination (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 149a6400de |
| 50 | ye6jma/detailing-supply-tracker | Cluster: parallel-test-pagination (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | pending |
| 51 | ye6jma/detailing-supply-tracker | Hovering over a donut/pie segment shows category cost details | CSS/layout | yes | yes | | yes | PlaywrightSteps → Screenshot → InspectElement for SVG coordinates | PlaywrightSteps, Screenshot, InspectElement | yes | 4e4cd7df55 |
| 54 | ye6jma/detailing-supply-tracker | Date range with no usage data shows empty states | race-condition | yes | yes | | yes | PlaywrightSteps + NetworkRequest to compare request timing | PlaywrightSteps, NetworkRequest | yes | d17095f6c6 |
| 55 | ye6jma/detailing-supply-tracker | Export button downloads report data as CSV | other | yes | no | error-output-sufficient — toEndWith not a valid matcher | yes | | | yes | 467e3756a7 |
| 55 | ye6jma/detailing-supply-tracker | Exported CSV contains correct columns and data | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | 467e3756a7 |
| 57 | ye6jma/detailing-supply-tracker | Cluster: item-edit-useeffect-reset (5 tests) | race-condition | yes | yes | | yes | Replay diagnosed useEffect resetting form during editing | Replay tools | yes | a8b4d12937 |
| 57 | ye6jma/detailing-supply-tracker | Editing item notes updates the displayed notes (notes mismatch) | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | a8b4d12937 |
| 59 | ye6jma/detailing-supply-tracker | Cluster: parallel-destructive-test (4 tests) | data-contamination | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 92d072557a |
| 59 | ye6jma/detailing-supply-tracker | Item list table sorts by Name column ascending and descending | seed-data-mismatch | yes | yes | | yes | Confirmed wrong sort expectation via API response | PlaywrightSteps, NetworkRequest | yes | 92d072557a |
| 61 | ye6jma/detailing-supply-tracker | Cluster: incorrect-seed-data-expectations (5 tests) | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | none |
| 62 | ye6jma/detailing-supply-tracker | Cluster: order-delete-test-ordering (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | pending |
| 64 | ye6jma/detailing-supply-tracker | Cluster: order-list-test-ordering (4 tests) | data-contamination | yes | no | error-output-sufficient | no | | | yes | none |
| 64 | ye6jma/detailing-supply-tracker | paginates at 20 rows per page | data-contamination | no | no | error-output-sufficient | no | | | yes | none |
| 65 | ye6jma/detailing-supply-tracker | Cluster: order-receive-shared-state (4 tests) | data-contamination | yes | yes | | yes | PlaywrightSteps confirmed stuck on missing button | PlaywrightSteps | yes | pending |
| 66 | ye6jma/detailing-supply-tracker | Mark as Received button is not available for Draft orders | data-contamination | yes | no | code-inspection | yes | | | yes | pending |
| 70 | ye6jma/detailing-supply-tracker | Cluster: stock-adjustment-row-count-race (4 tests) | race-condition | yes | no | error-output-sufficient | yes | | | yes | pending |
| 72 | ye6jma/detailing-supply-tracker | Summary stats show zero for total value when no items exist | seed-data-mismatch | yes | yes | | yes | NetworkRequest checked dashboard API and deletion behavior | NetworkRequest | yes | a94de89a50 |
| 73 | ye6jma/detailing-supply-tracker | Cluster: formatQty-crash (14 tests) | backend-bug | yes | yes | | yes | PlaywrightSteps → Screenshot → ConsoleMessages → NetworkRequest | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | yes | edb96fdb4d |
| 73 | ye6jma/detailing-supply-tracker | Supplier detail view shows linked inventory items | seed-data-mismatch | yes | yes | | yes | NetworkRequest checked API item count | NetworkRequest | yes | edb96fdb4d |
| 73 | ye6jma/detailing-supply-tracker | Test ordering causing data corruption | data-contamination | yes | no | code-inspection | yes | | | yes | edb96fdb4d |
| 75 | ye6jma/detailing-supply-tracker | Cluster: test-ordering-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | yes | 9f9225714c |
| 76 | ye6jma/detailing-supply-tracker | Cluster: destructive-test-ordering (2 tests) | data-contamination | yes | yes | | yes | PlaywrightSteps confirmed soft-delete cleared data | PlaywrightSteps | yes | c3a59e0300 |
| 77 | ye6jma/detailing-supply-tracker | Chart only counts used type movements, not added movements | seed-data-mismatch | yes | no | error-output-sufficient | yes | | | yes | 0fe74aac87 |
| 78 | ye6jma/detailing-supply-tracker | Usage history table updates immediately after a stock adjustment | race-condition | yes | yes | | yes | PlaywrightSteps showed count captured before data loaded | PlaywrightSteps | yes | 50c32e9db7 |
| 92 | ye6jma/detailing-supply-tracker | order-receive-effects.spec.ts — ERR_CONNECTION_REFUSED | infrastructure | no | no | error-output-sufficient | no | | | yes | 0190a01c30 |
| 94 | ye6jma/detailing-supply-tracker | Cluster: item-delete-data-contamination (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | N/A (not attempted) | none |
| 97 | ye6jma/detailing-supply-tracker | item-edit.spec.ts — Babel parse error | other | no | no | error-output-sufficient | no | | | yes | ba5dbe4ee0 |
| 97 | ye6jma/detailing-supply-tracker | item-edit.spec.ts — notes field showing "No notes" | backend-bug | no | no | error-output-sufficient | yes | | | yes | ba5dbe4ee0 |
| 109 | ye6jma/detailing-supply-tracker | Cluster: cross-spec-data-contamination (19 tests) | data-contamination | yes | no | error-output-sufficient | yes | | | partial | none |
| 109 | ye6jma/detailing-supply-tracker | Cluster: item-info-header-timeout (2 tests) | timeout | yes | no | error-output-sufficient | yes | | | N/A (not attempted) | none |
| 109 | ye6jma/detailing-supply-tracker | Cluster: item-delete-timeout (4 tests) | timeout | yes | no | error-output-sufficient | yes | | | no | none |

### Root Cause Clusters

| Cluster | Count (entries) | Affected Tests | Logs | Resolution |
|---------|----------------|----------------|------|------------|
| parallel-test-pagination | 3 | 8 | 48, 49, 50 | Fixed — test isolation with page-scoped data, early-alphabet items |
| neon-inherited-data | 1 | 1 | 48 | Fixed — seed truncation before insert |
| netlify-api-routing | 1 | 1 | 48 | Fixed — netlify.toml redirect ordering |
| item-edit-useeffect-reset | 1 | 5 | 57 | Fixed — editing guard in useEffect |
| parallel-destructive-test | 1 | 4 | 59 | Fixed — workers:1 + test reordering |
| incorrect-seed-data-expectations | 1 | 5 | 61 | Fixed — corrected test assertions |
| order-delete-test-ordering | 1 | 2 | 62 | Fixed — test reordering + serial block |
| order-list-test-ordering | 1 | 4 | 64 | Fixed — test reordering + dynamic pagination |
| order-receive-shared-state | 1 | 4 | 65 | Fixed — serial execution |
| stock-adjustment-row-count-race | 1 | 4 | 70 | Fixed — content-based assertions |
| formatQty-crash | 1 | 14 | 73 | Fixed — Number() parsing for PostgreSQL NUMERIC strings |
| item-count-mismatch | 1 | 1 | 73 | Fixed — corrected expected count |
| test-ordering-data-contamination | 1 | 2 | 75 | Fixed — test reordering + cleanup |
| destructive-test-ordering | 1 | 2 | 76 | Fixed — destructive tests in serial block at end |
| partial-update-overwrites-nulls | 1 | 1 | 97 | Fixed — backend preserves unset fields |
| item-delete-data-contamination | 1 | 3 | 94 | Unresolved — pre-existing, out of scope |
| cross-spec-data-contamination | 1 | 19 | 109 | Unresolved — JourneyQA batch contamination |
| item-info-header-timeout | 1 | 2 | 109 | Unresolved — infrastructure exhaustion |
| item-delete-timeout | 1 | 4 | 109 | Unresolved — infrastructure exhaustion |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 14 | 40.0% |
| seed-data-mismatch | 8 | 22.9% |
| race-condition | 4 | 11.4% |
| timeout | 2 | 5.7% |
| infrastructure | 2 | 5.7% |
| backend-bug | 2 | 5.7% |
| other | 2 | 5.7% |
| CSS/layout | 1 | 2.9% |

### When Replay Was Most Effective

Replay was most effective for:
- **Race conditions and async timing** (logs 54, 57, 78): PlaywrightSteps revealed exact timing of operations relative to data loading, enabling precise diagnosis of stale response overwrites and premature count captures.
- **Backend bugs with cascading DOM effects** (log 73): ConsoleMessages revealed `qty.toFixed is not a function` crash that detached all DOM elements — error output alone wouldn't have connected the API type mismatch to the complete component crash.
- **Complex SVG/chart interactions** (log 51): Screenshot + InspectElement revealed that Recharts SVG surface intercepts pointer events and arc bounding box centers land in the donut hole, requiring coordinate calculation.
- **Netlify routing issues** (log 48): NetworkRequest revealed HTML returned instead of JSON from API paths due to catch-all redirect interference.

Most effective tool sequences:
1. `PlaywrightSteps → NetworkRequest` (most common — 5 uses)
2. `PlaywrightSteps → Screenshot → ConsoleMessages → NetworkRequest` (most thorough — log 73)
3. `PlaywrightSteps → Screenshot → InspectElement` (for visual/CSS issues — log 51)

### When Replay Was NOT Used

| Reason | Count | % |
|--------|-------|---|
| error-output-sufficient | 17 | 81.0% |
| code-inspection | 2 | 9.5% |
| Other (no recording, etc.) | 2 | 9.5% |

Error output was sufficient for the majority of non-Replay diagnoses, particularly for:
- **Seed data mismatches**: Expected vs actual values in error messages directly pointed to wrong test assertions
- **Data contamination with clear symptoms**: Count mismatches, missing elements, and empty states clearly indicated test ordering issues
- **Invalid Playwright matchers**: Error messages explicitly named the invalid method

### Common Debugging Strategies That Worked

1. **Test reordering + serial blocks**: Moved destructive tests (delete-all, empty-state) to end in `test.describe.serial` blocks — resolved 8+ data contamination failures
2. **Content-based over count-based assertions**: Replaced `expect(count).toBe(N)` with `expect(row).toContainText(value)` — more resilient to parallel data
3. **Wait-before-count pattern**: Added `waitFor` before capturing initial counts to avoid race conditions with async data loading
4. **Request ID counters**: Added monotonic request IDs to Redux slices to discard stale API responses

### Common Debugging Strategies That Failed

1. **Running tests in parallel with shared database**: Every batch that ran multiple spec files against a single Neon branch experienced data contamination (log 109 JourneyQA had 19 affected tests)
2. **Assuming seed data values without verification**: Multiple tests hardcoded expected values (e.g., Car Soap usage=25 when actual=30) without consulting seed-db.ts

### Self-Inflicted Failure Rate

**3 self-inflicted failures (8.6%)** — a low rate indicating good fix quality:
1. Log 64: Pagination count off by 1 after fixing test ordering (trivial)
2. Log 97: Babel parse error from nullish coalescing syntax (build tooling gap)
3. Log 97: Backend partial update overwriting unset fields with null (introduced during inline editing refactor)

All 3 were quickly resolved (1 iteration each). The low self-inflicted rate suggests the agent's fixes are generally correct on first attempt.

### Test Isolation Issues

**Test Isolation Score: 62.9%** (>50% threshold) — test isolation is the dominant failure mode.

**Breakdown:**
- data-contamination: 14 failures (40.0%)
- seed-data-mismatch: 8 failures (22.9%)
- strict-mode: 0 failures

**Affected patterns:**
- **Destructive tests running before dependent tests**: Tests that delete all items/orders/suppliers polluted state for subsequent tests in the same spec file. Affected: item-list-table, order-list, order-delete, top-used-items, supplier-list, item-delete specs.
- **Parallel execution with shared database**: Multiple workers creating items pushed data past pagination boundaries (20/page), causing tests to fail to find expected items. Affected: add-item, bulk-actions, bulk-selection specs.
- **Cross-spec contamination in batch runs**: JourneyQA batches running multiple spec files against a single Neon branch caused 19 failures (log 109).
- **Seed data assumptions**: 8 failures where tests assumed specific seed values without verifying against actual seed-db.ts totals.

**Isolation strategies that would have prevented failures:**
1. **Per-spec database branching**: Each spec file should get its own Neon branch, ensuring full isolation
2. **Serial blocks for destructive tests**: Already adopted in fixes — all destructive tests should be wrapped in `test.describe.serial` at the end of the file
3. **Relative assertions**: Tests should capture initial state and assert relative changes rather than hardcoding absolute values
4. **Seed data constants**: Shared test constants derived from seed-db.ts would prevent mismatches

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "wait-before-count"** — When tests capture row counts or element counts immediately after page load, add `waitFor` to ensure async data has loaded before capturing the baseline count. This resolved failures in logs 70 and 78.
- **Add pattern: "content-over-count assertions"** — Prefer asserting on specific content (text, test-ids) rather than element counts, which are fragile in shared database environments.
- **Add tool sequence: "ConsoleMessages for component crashes"** — When multiple tests fail with the same locator timeout, check `ConsoleMessages` first for JavaScript runtime errors that may have crashed the component tree (log 73 formatQty example).
- **Add category guidance: "PostgreSQL type coercion"** — NUMERIC columns return strings from the API. Always use `Number()` or `parseFloat()` before calling numeric methods like `.toFixed()`.

### `skills/tasks/build/testing.md`

- **Enforce destructive test ordering**: All tests that modify or delete shared data (delete-all, empty-state scenarios) MUST be placed in a `test.describe.serial` block at the end of the spec file. This was the single most common fix pattern (8+ failures).
- **Require seed data verification**: Test writers should read `seed-db.ts` and compute expected values rather than guessing. 8 seed-data-mismatch failures (22.9%) could have been prevented.
- **Add JourneyQA isolation guidance**: JourneyQA batches must create per-spec Neon branches or run specs sequentially with database resets between them. The batch approach in log 109 caused 19 failures.
- **Recommend relative assertions for count-based tests**: Tests checking counts after mutations should capture initial values and assert `initialCount ± delta` rather than hardcoded absolute values.

### `skills/review/reportTestFailures.md`

- **Clarify TEST_FAILURES count for clusters spanning multiple rounds**: Log 49 had TEST_FAILURES: 2 but only 1 documented cluster entry. The counting rule for failures that manifest across multiple test runs within the same log should be explicit.
- **Add REPLAY_NECESSARY as strictly required**: Several analyses with REPLAY_USED=yes omitted REPLAY_NECESSARY (logs 57 cluster, 59 cluster). Enforcement should be stronger.
- **Consider adding a "batch contamination" infrastructure category**: Cross-spec data contamination in batch runs (log 109) is qualitatively different from within-spec contamination. A dedicated category would improve analysis.

## 5. Replay Fixes Table

INITIAL_CHANGESET: none
FAILING_TEST: Supplier dropdown is populated from suppliers list
FINAL_CHANGESET: 60575978fb
ASSESSMENT: Replay NetworkRequest revealed API returned inherited Neon parent branch data ("AutoFinish Pro") instead of seed data ("ToolPro Supplies") due to ON CONFLICT DO NOTHING. Fixed by adding table truncation before seeding.

INITIAL_CHANGESET: none
FAILING_TEST: Newly created item appears in the table immediately
FINAL_CHANGESET: 60575978fb
ASSESSMENT: Replay PlaywrightSteps + NetworkRequest revealed parallel tests created extra items pushing count above 20 (page size), so new item landed on page 2. Fixed with test-scoped data isolation.

INITIAL_CHANGESET: none
FAILING_TEST: Creating an item that is immediately low stock triggers dashboard alert
FINAL_CHANGESET: 60575978fb
ASSESSMENT: Replay NetworkRequest revealed /api/dashboard/* endpoints returned HTML instead of JSON because netlify.toml catch-all redirect intercepted API paths. Fixed redirect ordering.

INITIAL_CHANGESET: none
FAILING_TEST: Hovering over a donut/pie segment shows category cost details
FINAL_CHANGESET: 4e4cd7df55
ASSESSMENT: Replay Screenshot + InspectElement revealed SVG surface intercepts pointer events and arc bounding box centers land in the donut hole. Fixed by computing coordinates on the SVG surface directly.

INITIAL_CHANGESET: none
FAILING_TEST: Date range with no usage data shows empty states
FINAL_CHANGESET: d17095f6c6
ASSESSMENT: Replay NetworkRequest revealed race condition where intermediate API request (date range during input change) returned data at 3354ms, overwriting correct empty response at 3480ms. Fixed with request ID counter in Redux slice.

INITIAL_CHANGESET: none
FAILING_TEST: tests/item-edit.spec.ts
FINAL_CHANGESET: a8b4d12937
ASSESSMENT: Replay diagnosed useEffect resetting form state during editing — a race condition where component re-render overwrote user input. Fixed with editing guard in useEffect and corrected test data expectations. Cascading fix resolved 6 tests.

INITIAL_CHANGESET: none
FAILING_TEST: tests/item-list-table.spec.ts
FINAL_CHANGESET: 92d072557a
ASSESSMENT: Replay PlaywrightSteps + NetworkRequest confirmed destructive empty-state test ran concurrently with other tests, and confirmed correct Z→A sort order vs wrong test expectation. Fixed with workers:1, test reordering, and sort assertion correction. Cascading fix resolved 5 tests.

INITIAL_CHANGESET: none
FAILING_TEST: order-receive-effects
FINAL_CHANGESET: pending commit
ASSESSMENT: Replay PlaywrightSteps confirmed tests stuck waiting for mark-received button that was absent because PO-0002 was already received by a prior test. Fixed with serial execution.

INITIAL_CHANGESET: none
FAILING_TEST: Summary stats show zero for total value when no items exist
FINAL_CHANGESET: a94de89a50
ASSESSMENT: Replay NetworkRequest confirmed dashboard API returned open_orders=1 even after test attempted to delete all purchase orders. DELETE endpoint only allows draft orders. Fixed by setting non-draft orders to draft before deletion.

INITIAL_CHANGESET: none
FAILING_TEST: Inline edit supplier name
FINAL_CHANGESET: edb96fdb4d
ASSESSMENT: Replay ConsoleMessages revealed "qty.toFixed is not a function" — PostgreSQL NUMERIC type returned as string from API. Component crash detached all DOM elements. Fixed with Number() parsing. Cascading fix resolved 14 tests.

INITIAL_CHANGESET: none
FAILING_TEST: Supplier detail view shows linked inventory items
FINAL_CHANGESET: edb96fdb4d
ASSESSMENT: Replay NetworkRequest confirmed API returned 6 items vs test expected 5. Simple seed data count mismatch. Fixed test assertion.

INITIAL_CHANGESET: none
FAILING_TEST: top-used-items.spec.ts
FINAL_CHANGESET: c3a59e0300
ASSESSMENT: Replay PlaywrightSteps confirmed soft-delete from empty-state test removed all active items for subsequent tests. Fixed with destructive test reordering into serial block. Cascading fix resolved 2 tests.

INITIAL_CHANGESET: none
FAILING_TEST: Usage history table updates immediately after a stock adjustment
FINAL_CHANGESET: 50c32e9db7
ASSESSMENT: Replay PlaywrightSteps showed initialRowCount captured at 1851ms before API data loaded, resulting in count=0. After stock adjustment, newRowCount=20 (paginated). Fixed by adding waitFor before initial count capture.
