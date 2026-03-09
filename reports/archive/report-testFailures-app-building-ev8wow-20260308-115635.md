# Test Failures Report: app-building-ev8wow (2026-03-08)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 123 |
| Logs with test failures | 30 |
| Logs without test failures | 93 |
| Total distinct test failures | 46 |
| Total affected tests | 83 |
| Total test re-runs across all logs | 44 |
| Unique root causes | 39 (17 clusters + 22 unclustered) |
| Replay usage rate | 37.0% (17/46) |
| Replay usage rate among debugged failures | 37.0% (17/46) |
| Debugging success rate | 100% (46/46) |
| Replay-assisted success rate | 100% (17/17) |
| Recording availability rate | 93.5% (43/46) |
| Debugging efficiency (Replay used but error output sufficed) | 94.1% (16/17) |
| Replay decision quality (REPLAY_NECESSARY=no among REPLAY_USED=yes) | 94.1% (16/17) |
| Cascading fixes | 10 single changesets resolving multiple failures |
| Self-inflicted failures | 5 (10.9%) |
| Pre-existing failure rate | 89.1% (41/46) |
| Test Isolation Score | 50.0% (23/46 — data-contamination + strict-mode + seed-data-mismatch) |
| Infrastructure failure events | 0 |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 43 | 93.5% |
| other (JourneyQA) | 3 | 6.5% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|----------------|-------|-----------|
| test-code | 36 | 78.3% |
| app-code | 6 | 13.0% |
| both | 4 | 8.7% |
| none | 0 | 0% |

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 17 | 37.0% |
| race-condition | 10 | 21.7% |
| backend-bug | 5 | 10.9% |
| CSS/layout | 4 | 8.7% |
| strict-mode | 4 | 8.7% |
| other | 3 | 6.5% |
| seed-data-mismatch | 2 | 4.3% |
| spa-redirect | 1 | 2.2% |

### Fix Reuse Rate

4 distinct fix patterns applied to 2+ spec files:
- **destructive-test-reordering**: 5 spec files (dashboard-low-stock-alerts, dashboard-pending-deliveries, inventory-table-display, po-table, receive-against-po-flow)
- **wait-before-count**: 4 spec files (inventory-add-item, log-delivery-flow, vendor-add-modal, vendor-table)
- **close-detail-panel-before-nav**: 3 spec files (dashboard-low-stock-alerts, dashboard-metric-cards-updates, dashboard-recent-activity)
- **independent-test-data**: 2 spec files (receive-delivery-effects, receive-delivery)

### Fix Iteration Difficulty Distribution

| Iterations | Count |
|-----------|-------|
| 1 | 37 |
| 2 | 5 (Repeated Filter, Select Category, Create Multiple Vendors, vendor-detail-contact, receive-po-shared-state) |
| 3 | 1 (Add Inventory Item journey) |
| 4+ | 3 (dashboard-low-stock-alerts: 4 reruns, Create PO journey: 4, vendor-add-modal: 2 reruns for 3 distinct issues) |

**4+ iteration failures:** dashboard-low-stock-alerts.spec.ts required 4 re-runs due to cascading infrastructure issues (netlify routing + data contamination + overlay blocking); Create Purchase Order journey required 4 iterations due to unfamiliarity with the app's custom div-based grid layout.

### Diagnostic Source Effectiveness

| Source | Count | % |
|--------|-------|---|
| error-output | 18 | 62.1% |
| error-context-snapshot | 4 | 13.8% |
| (Replay used instead) | 17 | — |

Among non-Replay resolved failures, error output alone was sufficient in 82% of cases, confirming it is the primary diagnostic source.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------|----|---------|-----------|
| 51 | ev8wow/BrewSupply | netlify-api-routing (7 tests) | backend-bug | yes | yes | | yes | Screenshot + NetworkRequest | Screenshot, PlaywrightSteps, NetworkRequest, ConsoleMessages | yes | 8ca9bb310b |
| 51 | ev8wow/BrewSupply | destructive-test-ordering (2 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | 8ca9bb310b |
| 51 | ev8wow/BrewSupply | Low Stock Alerts Update After Stock Adjustment (overlay) | CSS/layout | yes | no | diagnosed from error output | yes | | | yes | 8ca9bb310b |
| 53 | ev8wow/BrewSupply | Metric Cards Update After Stock Falls Below Reorder | CSS/layout | yes | yes | | yes | PlaywrightSteps to find stuck step | PlaywrightSteps, NetworkRequest | yes | 383acbf023 |
| 53 | ev8wow/BrewSupply | Metric Cards Update After PO Created | race-condition | yes | yes | | yes | PlaywrightSteps + NetworkRequest timing | PlaywrightSteps, NetworkRequest | yes | 383acbf023 |
| 55 | ev8wow/BrewSupply | destructive-empty-state-ordering (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | eb85639eaf |
| 56 | ev8wow/BrewSupply | dashboard-union-all-duplicates (2 tests) | strict-mode | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 0eaee65a47 |
| 56 | ev8wow/BrewSupply | Recent Activity Updates After New Action | CSS/layout | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 0eaee65a47 |
| 59 | ev8wow/BrewSupply | Preferred Vendor Searchable Dropdown | race-condition | yes | no | diagnosed from error output | yes | | | yes | 1441dfebd3 |
| 59 | ev8wow/BrewSupply | wait-before-count (3 tests) | race-condition | yes | no | diagnosed from error output | yes | | | yes | 1441dfebd3 |
| 62 | ev8wow/BrewSupply | Repeated Filter Interaction Works Correctly | race-condition | yes | no | diagnosed from error-context-snapshot | yes | | | yes | 0dfe21e465 |
| 63 | ev8wow/BrewSupply | Empty Stock Adjustment History | data-contamination | yes | no | diagnosed from error-context-snapshot | yes | | | yes | e41e9fe4e4 |
| 64 | ev8wow/BrewSupply | numeric-string-comparison (4 tests) | backend-bug | yes | no | diagnosed from error output + page snapshots | yes | | | yes | — |
| 66 | ev8wow/BrewSupply | Multiple Stock Adjustments in Sequence | data-contamination | yes | yes | | yes | PlaywrightSteps + page snapshot | PlaywrightSteps | yes | e0c8e41 |
| 67 | ev8wow/BrewSupply | numeric-string-comparison-display (2 tests) | backend-bug | yes | no | diagnosed from error output | yes | | | yes | ee6b8ecd49 |
| 67 | ev8wow/BrewSupply | destructive-test-ordering (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | ee6b8ecd49 |
| 68 | ev8wow/BrewSupply | wait-before-count-delivery (3 tests) | race-condition | yes | no | diagnosed from error output | yes | | | yes | fcd8d0e6d7 |
| 69 | ev8wow/BrewSupply | PO Creation Creates Activity Entry | data-contamination | yes | yes | | yes | PlaywrightSteps + Screenshot + NetworkRequest | PlaywrightSteps, Screenshot, NetworkRequest, InspectElement | yes | 308aa0ae00 |
| 72 | ev8wow/BrewSupply | Return to All Tab After Filtering | race-condition | yes | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | f43a691143 |
| 73 | ev8wow/BrewSupply | PO Number Format | race-condition | yes | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | 2f5d1bb2ff |
| 73 | ev8wow/BrewSupply | destructive-test-ordering (2 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 74 | ev8wow/BrewSupply | Category with No Vendor Pricing | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | 03edcb4520 |
| 76 | ev8wow/BrewSupply | price-change-contamination (2 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 76 | ev8wow/BrewSupply | Select Category and View Comparison Table | data-contamination | yes | no | diagnosed from error output | yes | | | yes | 6f189c7be7 |
| 77 | ev8wow/BrewSupply | Receive Against PO Flow from PO Detail | strict-mode | yes | no | diagnosed from error output | yes | | | yes | f2bf833025 |
| 77 | ev8wow/BrewSupply | po-status-contamination (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 79 | ev8wow/BrewSupply | shared-po-contamination (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 80 | ev8wow/BrewSupply | Add Discrepancy Notes When Receiving | data-contamination | yes | no | diagnosed from error output | yes | | | yes | d8b310fd1d |
| 81 | ev8wow/BrewSupply | spa-no-url-routing (7 tests) | spa-redirect | yes | yes | | yes | Screenshot + code inspection | Screenshot, PlaywrightSteps | yes | — |
| 82 | ev8wow/BrewSupply | Export Purchase Order History as CSV | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps + error output | PlaywrightSteps | yes | — |
| 82 | ev8wow/BrewSupply | Export Both Data Sets Sequentially | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 83 | ev8wow/BrewSupply | Default Unit Affects New Item Creation | backend-bug | yes | yes | | yes | PlaywrightSteps + Redux inspection | PlaywrightSteps | yes | 9cea6fa4 |
| 84 | ev8wow/BrewSupply | notification-toggle-contamination (2 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 86 | ev8wow/BrewSupply | AddVendorModal Categories Supplied Deselect | CSS/layout | yes | no | diagnosed from error output | yes | | | yes | — |
| 86 | ev8wow/BrewSupply | vendor-row-count-before-load (3 tests) | race-condition | yes | yes | | yes | PlaywrightSteps data load timing | PlaywrightSteps | yes | — |
| 86 | ev8wow/BrewSupply | Create Multiple Vendors Sequentially | strict-mode | yes | no | diagnosed from error output | yes | | | yes | — |
| 87 | ev8wow/BrewSupply | vendor-put-wipes-fields (4 tests) | backend-bug | yes | yes | | yes | PlaywrightSteps + page snapshots + API inspection | PlaywrightSteps | yes | — |
| 87 | ev8wow/BrewSupply | Edit Vendor Email Inline Validation | data-contamination | yes | no | diagnosed from error output | yes | | | yes | — |
| 90 | ev8wow/BrewSupply | Empty State When No Vendors Exist | race-condition | yes | yes | | yes | PlaywrightSteps + NetworkRequest timing | PlaywrightSteps, NetworkRequest | yes | — |
| 102 | ev8wow/BrewSupply | receive-po-shared-state (2 tests) | data-contamination | no | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 4be0a6a677 |
| 108 | ev8wow/BrewSupply | Preferred Vendor Searchable Dropdown | race-condition | yes | yes | | yes | PlaywrightSteps + NetworkRequest API timing | PlaywrightSteps, NetworkRequest | yes | affc10f729 |
| 119 | ev8wow/BrewSupply | Add Inventory Item journey | other | no | no | diagnosed from error output; no recording | no | | | yes | — |
| 120 | ev8wow/BrewSupply | Create Purchase Order journey | other | no | no | diagnosed from error-context-snapshot; no recording | no | | | yes | — |
| 120 | ev8wow/BrewSupply | Vendor Management journey | other | no | no | diagnosed from error-context-snapshot; no recording | no | | | yes | — |

### Root Cause Clusters

| Cluster | Count | Affected Tests | Logs | Resolution |
|---------|-------|----------------|------|-----------|
| data-contamination / destructive-test-ordering | 4 entries | 10 tests | 51, 67, 73, 82 | Moved destructive tests to end using `test.describe.serial` |
| item-detail-overlay-blocking | 3 entries | 3 tests | 51, 53, 56 | Close detail panel before sidebar navigation |
| wait-before-count | 4 entries | 12 tests | 59, 68, 86, 90 | Wait for first data row before capturing count |
| numeric-string-comparison | 2 entries | 6 tests | 64, 67 | Cast NUMERIC columns to numbers in inventory API |
| destructive-empty-state-ordering | 1 entry | 3 tests | 55 | Reordered destructive empty-state test to end |
| dashboard-union-all-duplicates | 1 entry | 2 tests | 56 | Fixed UNION ALL query to use UNION/dedup |
| price-change-contamination | 1 entry | 2 tests | 76 | Used dynamic value capture instead of hardcoded prices |
| po-status-contamination | 1 entry | 3 tests | 77 | Used distinct PO IDs per test |
| shared-po-contamination | 1 entry | 3 tests | 79 | Assigned each test its own PO |
| spa-no-url-routing | 1 entry | 7 tests | 81 | Fixed App.tsx to derive page from URL pathname |
| netlify-api-routing | 1 entry | 7 tests | 51 | Added API redirect rules to netlify.toml |
| notification-toggle-contamination | 1 entry | 2 tests | 84 | Tests check and reset toggle state before assertions |
| vendor-put-wipes-fields | 1 entry | 4 tests | 87 | Fixed PUT API to use COALESCE instead of `?? null` |
| vendor-row-count-before-load | 1 entry | 3 tests | 86 | Wait for data load before counting rows |
| receive-po-shared-state | 1 entry | 2 tests | 102 | Used distinct PO record IDs per test |

## 3. Patterns

### When Replay Was Most Effective

Replay was genuinely necessary in only **1 of 17 uses** (worker 108) — a race condition where two unfiltered `/api/vendors-list` requests fired concurrently, and a stale response overwrote filtered search results. This required NetworkRequest timing analysis to identify the interleaved API calls. The fix involved adding `AbortController` to cancel stale requests.

The most common Replay tool combination was **PlaywrightSteps + NetworkRequest**, used to trace test execution flow and inspect API response timing. This pattern was effective for race conditions and backend bugs but was rarely the only way to reach the diagnosis.

### When Replay Was NOT Used and Why

29 of 46 failures (63%) were diagnosed without Replay:
- **Error output alone** was sufficient in 62% of non-Replay cases. Test assertion messages, stack traces, and strict-mode violation messages typically contained enough information to identify the root cause.
- **Error context snapshots** supplemented error output in ~14% of cases, providing page state (e.g., "Loading inventory..." confirming a race condition).
- **Data contamination** failures were overwhelmingly diagnosed from error output: expected vs. actual values clearly showed state leaked from prior tests.

### Common Debugging Strategies That Worked

1. **Error output analysis → targeted fix** (most common): Read the assertion failure message, identify whether it's a data contamination, race condition, or bug, apply the known fix pattern. This resolved ~63% of failures without needing Replay.
2. **PlaywrightSteps → NetworkRequest**: Trace test execution to the failing step, then inspect API timing to identify race conditions or incorrect responses. Used in 12 of 17 Replay sessions.
3. **Screenshot → code inspection**: Take a screenshot to see page state (e.g., wrong page rendered), then inspect source code for the bug. Effective for spa-redirect and overlay issues.

### Common Debugging Strategies That Failed

No debugging strategies failed in this session — all 46 failures were successfully resolved. However, the initial approach in worker 51 (dashboard-low-stock-alerts) cascaded through 4 re-runs as each fix revealed the next underlying issue, suggesting that multi-layered infrastructure problems benefit from more thorough initial investigation.

### Self-Inflicted Failure Rate

**10.9%** (5/46) of failures were self-inflicted — introduced by the agent's own fix attempts during the session:
- Worker 86: `Create Multiple Vendors Sequentially` — strict-mode violation from duplicate vendor names in test fix
- Worker 102: `receive-po-shared-state` (2 tests) — newly written tests shared PO state
- Worker 119: `Add Inventory Item journey` — incorrect selectors for custom dropdowns
- Worker 120: `Create Purchase Order journey` + `Vendor Management journey` — wrong assumptions about page structure (div grid vs HTML table)

The JourneyQA self-inflicted failures (workers 119-120) are qualitatively different from fixTests failures — they stem from writing new Playwright scripts against an unfamiliar page structure without upfront page inspection.

### Test Isolation Issues

Test isolation issues (data-contamination + strict-mode + seed-data-mismatch) account for exactly **50%** of all failures (23/46). This is at the threshold for warranting dedicated process improvements.

**Breakdown:**
- **data-contamination (17 failures, 37.0%)**: The dominant failure mode. Tests share a single database branch seeded once per spec file, so destructive operations (receiving deliveries, deleting all records) corrupt state for subsequent tests.
- **strict-mode (4 failures, 8.7%)**: Duplicate DOM elements from UNION ALL queries or duplicate seed data names.
- **seed-data-mismatch (2 failures, 4.3%)**: Hardcoded counts/values that don't match actual seed data after other tests modify it.

**Affected patterns:**
- Destructive "Empty State" tests placed mid-suite (5 spec files)
- Multiple tests operating on the same PO/vendor record (receive-against-po, receive-delivery, vendor-detail)
- Hardcoded assertion values instead of dynamic capture (price-tracker-pricing)

**Effective isolation strategies used:**
1. `test.describe.serial` + move destructive tests to end
2. Assign each test its own database record (distinct PO IDs, vendor IDs)
3. Dynamic value capture instead of hardcoded seed data values
4. Check/reset state before assertions (notification toggles)

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "wait-before-count" as a documented race condition pattern**: This was the most reused fix pattern (4 spec files). When tests capture `count()` immediately after a container becomes visible, the API data hasn't loaded yet. The fix is to `waitFor` a specific data row before counting. Add this as a first-check pattern for any "expected N, got 0" failures.
- **Add "close-detail-panel-before-nav" as a documented CSS/layout pattern**: The item-detail-overlay intercepted sidebar navigation clicks in 3 spec files. Document that overlay panels must be explicitly closed before navigating away.
- **Add NetworkRequest timing analysis as the go-to strategy for race conditions**: In the one case where Replay was genuinely necessary (worker 108), `NetworkRequest` revealed interleaved API calls. Document this as the definitive tool for diagnosing async timing bugs.

### `skills/tasks/build/testing.md`

- **Mandate distinct test data records**: The most impactful process improvement would be requiring each test to operate on its own database record (vendor, PO, delivery). This single change would have prevented 10+ data-contamination failures across receive-delivery, vendor-detail, and PO-related spec files.
- **Require destructive tests at end of suite**: Enforce that any test deleting all records (Empty State tests) must be in a `test.describe.serial` block at the end of the spec file. This was the fix for 5 different spec files.
- **Ban hardcoded seed data counts**: Tests should never assert exact row counts from seed data. Instead, capture the initial count dynamically and assert relative changes. This prevents seed-data-mismatch and data-contamination failures.
- **Add wait-for-data-load boilerplate**: All tests that interact with async-loaded tables should include a `waitFor` on the first data row before any count or interaction. This is the "wait-before-count" pattern that was independently rediscovered 4 times.
- **JourneyQA should inspect page structure first**: JourneyQA scripts should use a Screenshot or page snapshot to understand the actual DOM structure before writing selectors. The 3 JourneyQA failures all stemmed from incorrect assumptions about page layout.

### `skills/review/reportTestFailures.md`

- **Add DIAGNOSED_FROM as REQUIRED when REPLAY_USED is no**: Currently optional, but this field is critical for understanding diagnostic source effectiveness. Make it mandatory for non-Replay failures to improve the quality of the "Diagnostic Source Effectiveness" metric.
- **Clarify TEST_FAILURES counting for clusters**: Some analysis files counted cluster member tests individually in TEST_FAILURES while using the cluster format for entries. The instruction says "each cluster counts as 1 failure entry" but the TEST_FAILURES count sometimes diverged. Add explicit guidance: "TEST_FAILURES should equal the number of failure/cluster entries in the file."
- **Add DEBUGGING_SUCCESSFUL as REQUIRED for all cluster entries**: Several cluster entries omitted this field. It should be mandatory to avoid gaps in the debugging success rate calculation.
