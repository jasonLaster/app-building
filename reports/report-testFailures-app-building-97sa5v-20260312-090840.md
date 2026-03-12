# Test Failures Report: app-building-97sa5v-20260312-090840

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 116 |
| Logs with test failures | 26 |
| Logs without test failures | 90 |
| Total distinct test failure entries | 35 |
| Total affected tests | 104 |
| Replay usage rate | 0/35 (0%) |
| Replay usage rate among debugged failures | 0/34 (0%) |
| Debugging success rate | 34/34 (100%) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 35/35 (100%) |
| Debugging efficiency (Replay used but error output sufficed) | N/A (Replay never used) |
| Cascading fixes | 11 changesets resolving multiple failures |
| Self-inflicted failures | 3/35 (8.6%) |
| Self-inflicted fix quality cost | 3 additional test re-runs |
| Total test re-runs across all logs | 63 |
| Unique root causes | 33 (22 clusters + 11 unclustered) |
| Fix reuse rate | 1 pattern (beforeEach-reset-payments) applied across 3 spec files |
| Test Isolation Score | 22/35 (62.9%) — data-contamination (19) + strict-mode (1) + seed-data-mismatch (2) |
| Pre-existing failure rate | 32/35 (91.4%) |
| Replay decision quality | N/A (Replay never used) |
| Infrastructure failure events | 30 events affecting 182 tests |

**Failure phase distribution:**

| Phase | Count | % |
|-------|-------|---|
| fixTests | 29 | 82.9% |
| other (JourneyQA) | 6 | 17.1% |

**Failure resolution type distribution:**

| Resolution Type | Count | % |
|-----------------|-------|---|
| test-code | 23 | 65.7% |
| app-code | 7 | 20.0% |
| both | 4 | 11.4% |
| none | 1 | 2.9% |

**Diagnostic source effectiveness (among 34 resolved failures):**

| Source | Count | % |
|--------|-------|---|
| error-output | 32 | 94.1% |
| error-context-snapshot | 1 | 2.9% |
| code-inspection | 1 | 2.9% |

**Fix iteration difficulty distribution:**

| Iterations | Count | Tests |
|------------|-------|-------|
| 0 (unresolved) | 1 | quote-list-sort-failures cluster (out of scope) |
| 1 | 22 | — |
| 2 | 3 | — |
| 3 | 6 | invoice-filter-race-condition, Outstanding balance updates, Negative revenue change, invoice-detail-data-contamination, order-status-contamination cluster, Edit button visible, Edit order modify line items |
| 4 | 2 | menu-item-sort-race-condition cluster, Negative revenue change |
| 5 | 1 | order-list-sort-failures cluster |

**Resolution effort distribution (TOOL_CALL_COUNT):**

| Tool Calls | Count | % |
|------------|-------|---|
| 1–5 | 11 | 31.4% |
| 6–9 | 8 | 22.9% |
| 10–15 | 9 | 25.7% |
| 16–25 | 6 | 17.1% |
| 26–30 | 1 | 2.9% |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| w1-16:32 | W1/cafe-catering | Monetary values display correctly in order list | seed-data-mismatch | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w2-16:41 | W2/cafe-catering | Quote Detail panel displays event details | date-format | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w5-17:02 | W5/cafe-catering | Convert accepted quote to order (+ 2 cascading) | strict-mode | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w6-17:10 | W6/cafe-catering | Status column shows correct status badges | backend-bug | yes | no | error-output-sufficient | yes | — | — | yes | ccedcca14c |
| w6-17:10 | W6/cafe-catering | Quote list shows all quotes from database | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | ccedcca14c |
| w35-19:56 | W35/cafe-catering | Sort orders by * column (6 tests) | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w36-20:13 | W36/cafe-catering | Sort quotes by * column (6 tests) | race-condition | yes | no | out-of-scope | yes | — | — | no (not attempted) | none |
| w37-20:59 | W37/cafe-catering | Sort menu items by * column (5 tests) | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w37-20:59 | W37/cafe-catering | Sort clients by * column (4 tests) | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w37-20:59 | W37/cafe-catering | Search clients (4 tests) | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w38-21:30 | W38/cafe-catering | Filter invoices (4 tests) | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w50-11:50 | W50/cafe-catering | Inline edit client * (5 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w51-12:12 | W51/cafe-catering | Outstanding balance updates after recording a payment | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w54-12:26 | W54/cafe-catering | client-list-add tests (6 tests) | test-setup-error | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w57-12:46 | W57/cafe-catering | Pending quotes count updates when status changes | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w58-13:09 | W58/cafe-catering | Negative revenue change displays as decrease | backend-bug | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w58-13:09 | W58/cafe-catering | Revenue summary handles zero previous month | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w59-13:14 | W59/cafe-catering | Today's prep entries (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w60-13:25 | W60/cafe-catering | Clicking an upcoming order navigates to Order Detail | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 944cea09e2 |
| w61-13:47 | W61/cafe-catering | Invoice detail tests (14 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w64-14:07 | W64/cafe-catering | Invoice payment actions (7 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w65-14:11 | W65/cafe-catering | Invoice payment effects (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w66-14:14 | W66/cafe-catering | Invoice payment button (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| w68-14:23 | W68/cafe-catering | Bulk deactivate contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | e7f288497b |
| w69-14:35 | W69/cafe-catering | Menu item edit stale data (7 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 1f9ad645ff |
| w72-14:53 | W72/cafe-catering | Order status change updates Dashboard upcoming orders | bad-assertion-api | yes | no | error-output-sufficient | yes | — | — | yes | 2d936d55a2 |
| w72-14:53 | W72/cafe-catering | Order status change to Cancelled updates Dashboard | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 2d936d55a2 |
| w73-15:13 | W73/cafe-catering | Status update button advances (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3b51a2b2ca |
| w73-15:13 | W73/cafe-catering | Edit button is visible for Confirmed orders | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3b51a2b2ca |
| w73-15:13 | W73/cafe-catering | Edit order - modify line items | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3b51a2b2ca |
| w74-15:28 | W74/cafe-catering | Order display stale data (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3ea73360e3 |
| w74-15:28 | W74/cafe-catering | Order detail panel displays event details | backend-bug | yes | no | error-output-sufficient | yes | — | — | yes | 3ea73360e3 |
| w75-15:39 | W75/cafe-catering | Order edit add/remove line item (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3ea73360e3 |
| w77-16:05 | W77/cafe-catering | Monetary values display correctly in order list | seed-data-mismatch | no | no | error-output-sufficient | yes | — | — | yes | none |
| w77-16:05 | W77/cafe-catering | Sort orders by Order # column | bad-assertion-api | no | no | error-output-sufficient | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| order-list-sort-failures | 6 tests | w35-19:56 | Fixed — setState race + concurrent API overwrites in Orders.tsx |
| quote-list-sort-failures | 6 tests | w36-20:13 | Not fixed (out of scope) — same root cause as order-list-sort |
| menu-item-sort-race-condition | 5 tests | w37-20:59 | Fixed — same sort pattern in MenuItems.tsx |
| client-sort-race-condition | 4 tests | w37-20:59 | Fixed — client-side sort memo in Clients.tsx |
| client-search-race-condition | 4 tests | w37-20:59 | Fixed — client-side search filter in Clients.tsx |
| invoice-filter-race-condition | 4 tests | w38-21:30 | Fixed — consolidated dual-useEffect into single effect |
| convert-quote-seed-data-strict-mode | 3 tests | w5-17:02 | Fixed — replaced seed data dependency with unique test data |
| seed-client-rename-contamination | 5 tests | w50-11:50 | Fixed — beforeEach restores renamed seed client |
| api-response-parsing | 6 tests | w54-12:26 | Fixed — handle { data: [...] } wrapper in test cleanup |
| parallel-test-contamination | 1 test | w58-13:09 | Fixed — changed to test.describe.serial |
| destructive-test-ordering | 2 tests | w59-13:14 | Fixed — reordered destructive test to run last |
| invoice-detail-data-contamination | 14 tests | w61-13:47 | Fixed — beforeAll resets invoice data via API |
| invoice-payment-data-contamination | 7 tests | w64-14:07 | Fixed — beforeEach resets payment state |
| invoice-effects-data-contamination | 3 tests | w65-14:11 | Fixed — beforeEach resets payment state |
| invoice-button-data-contamination | 2 tests | w66-14:14 | Fixed — beforeEach resets payment state |
| bulk-deactivate-contamination | 2 tests | w68-14:23 | Fixed — reordered destructive test to run last |
| menu-item-edit-stale-data | 7 tests | w69-14:35 | Fixed — beforeEach resets seed menu items via API |
| dashboard-url-regex | 1 test | w72-14:53 | Fixed — corrected toHaveURL regex |
| order-status-contamination | 4 tests | w72-14:53, w73-15:13 | Fixed — beforeEach resets order statuses via API |
| order-lineitem-contamination | 1 test | w73-15:13 | Fixed — beforeEach resets line items |
| order-display-stale-data | 3 tests | w74-15:28 | Fixed — beforeEach resets order data |
| order-edit-more-stale-data | 2 tests | w75-15:39 | Fixed — beforeEach resets ORD-1001 to seed state |

**Note:** The sort-related clusters (order-list-sort-failures, quote-list-sort-failures, menu-item-sort-race-condition, client-sort-race-condition) all stem from the same systemic architectural issue: nested `setState` in `handleSort` causing stale closures, combined with concurrent API requests overwriting locally-sorted results. The fix pattern was the same across all pages — replace async sort-then-refetch with client-side `useMemo` sorting. The invoice-filter-race-condition and client-search-race-condition share a related root cause (dual-useEffect patterns dispatching overlapping API fetches).

**Note:** The invoice payment clusters (invoice-payment-data-contamination, invoice-effects-data-contamination, invoice-button-data-contamination) all stem from the same systemic issue: invoice payment state accumulating across test runs without reset. All three were fixed with the same `beforeEach-reset-payments` pattern.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 19 | 54.3% |
| race-condition | 6 | 17.1% |
| backend-bug | 3 | 8.6% |
| seed-data-mismatch | 2 | 5.7% |
| bad-assertion-api | 2 | 5.7% |
| strict-mode | 1 | 2.9% |
| test-setup-error | 1 | 2.9% |
| date-format | 1 | 2.9% |

### Data-Contamination Sub-Categories

Data contamination is the dominant failure category at 54.3% (>40%), warranting breakdown:

| Sub-Category | Count | % of Data-Contamination |
|-------------|-------|------------------------|
| destructive-ordering | 10 | 52.6% |
| accumulated-data | 9 | 47.4% |
| settings-contamination | 0 | 0% |

**destructive-ordering** (10): Tests that modify/delete shared seed data (change order statuses, rename clients, cancel orders, decline quotes) corrupt state for subsequent tests. The most common fix was reordering destructive tests to run last or adding beforeEach hooks to reset modified data.

**accumulated-data** (9): Tests create records (payments, line items, invoices) that persist across runs and inflate counts for subsequent tests. The fix pattern was adding beforeEach hooks to reset accumulated data via API calls.

### Test Isolation Issues

The Test Isolation Score is **62.9%** (>50%), indicating test isolation is the dominant failure mode.

**Affected spec files:** client-detail-edit, client-detail-interactions, client-list-add, dashboard-pending-quotes, dashboard-revenue, dashboard-todays-prep, dashboard-upcoming-orders, invoice-detail, invoice-record-payment, invoice-record-payment-actions, invoice-record-payment-effects, menu-item-bulk-actions, menu-item-edit, order-dashboard-integration, order-detail-actions, order-detail-display, order-detail-edit-more, quote-list

**Root cause analysis:** The cafe-catering app uses a shared Neon database branch for all tests within a test run. Tests that modify seed data (status changes, edits, deletions, payments) leave the database in a dirty state for subsequent tests. The test framework uses `test.describe.serial` but does not enforce beforeEach cleanup by default.

**Isolation strategies that would have prevented these failures:**
1. Mandatory `beforeEach` cleanup helpers in all spec files that modify data
2. API-based seed data reset functions available as test utilities
3. Per-spec database branching (Neon branch-per-spec) for complete isolation
4. Placing all destructive tests in a dedicated "cleanup" describe block that runs last

### Self-Inflicted Failure Rate

**3/35 (8.6%)** of failures were self-inflicted. This is a low rate indicating good fix quality overall. The self-inflicted failures were:
- Worker 5: strict-mode cluster — test was written using seed data "Sarah Chen" which matched multiple rows
- Worker 6: backend-bug — status badges test used wrong API field casing (camelCase vs snake_case)
- Worker 6: data-contamination — status badges test created extra quotes that contaminated the count assertion

### When Was Replay Most Effective?

Replay was never used in this session. All 35 failures were diagnosed from error output alone (32), error-context-snapshot (1), or code-inspection (1). The 100% debugging success rate without Replay suggests that for this app's failure profile (dominated by data-contamination and race-conditions), error output provides sufficient diagnostic information.

### When Was Replay NOT Used and Why?

| Reason | Count |
|--------|-------|
| error-output-sufficient | 33 |
| out-of-scope | 1 |
| code-inspection | 1 |

### Common Debugging Strategies That Worked

1. **Read error output → identify data mismatch → add beforeEach cleanup** (19 failures) — Most effective for data-contamination. Error messages clearly showed expected vs actual values pointing to stale/accumulated data.
2. **Read error output → trace to app code → fix logic bug** (6 failures) — Effective for race-conditions. Sort indicator and data ordering mismatches pointed directly to setState/useEffect patterns.
3. **Reorder destructive tests to run last** (4 failures) — Quick fix for destructive-ordering contamination.
4. **Read error output → fix test expectations** (4 failures) — For seed-data-mismatch and bad-assertion-api.

### Common Debugging Strategies That Failed

No strategies consistently failed. The main difficulty pattern was **iterative fixes for race conditions** — the order-list-sort-failures cluster required 5 iterations because the initial fix (setState correction) exposed a secondary issue (concurrent API overwrites), which required a more fundamental architectural change (client-side useMemo sorting).

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "data-contamination → beforeEach API reset"** — When test failures show unexpected counts or stale values, check if a prior test modified seed data. The fix is almost always a beforeEach hook that resets the relevant entities via API PUT/DELETE calls.
- **Add pattern: "sort race-condition → client-side useMemo"** — When sort tests fail with wrong ordering after clicking column headers, check for nested setState in handleSort and concurrent API fetches overwriting local sort. Replace with client-side sorting via `useMemo`.
- **Add pattern: "dual-useEffect race → consolidated effect"** — When filter/search tests fail with stale results, check for two useEffects dispatching overlapping API fetches. Consolidate into a single effect.

### `skills/tasks/build/testing.md`

- **Mandate beforeEach cleanup in all spec files that modify data.** The test isolation score of 62.9% shows that data contamination is the dominant failure mode. Every spec file that creates, updates, or deletes records should include a beforeEach hook that resets the relevant data to seed state. This should be a writing directive, not a fixTests concern.
- **Provide a shared test utility for seed data reset.** Multiple spec files independently implemented API-based reset logic. A shared `resetSeedData(entityType)` utility would reduce boilerplate and ensure consistent cleanup.
- **Default to `test.describe.serial` for all spec files.** Parallel test execution within a shared database caused data-contamination failures (e.g., dashboard-revenue). Since all tests share a database branch, serial execution should be the default.
- **Place destructive tests last.** Tests that cancel orders, decline quotes, or deactivate all items should always be the last test in their describe block. Add this as a writing directive.

### `skills/review/reportTestFailures.md`

- **Add a "sort race-condition" FAILURE_CATEGORY.** Six failures (17.1%) were race-conditions caused specifically by sort/filter state management patterns. A dedicated category would enable more targeted analysis.
- **Add DATA_CONTAMINATION_SUBCATEGORY for "cross-run-accumulation"** — distinguish between within-run contamination (test A modifies data test B needs) and cross-run accumulation (payments/records accumulate across repeated test runs without cleanup). Nine failures were cross-run accumulation (accumulated-data), which requires different mitigation (beforeEach API resets) vs within-run (test reordering).
- **Consider tracking "fix pattern reuse across sessions"** — The beforeEach-reset-payments pattern was applied 3 times in this session. Tracking whether the same patterns recur across sessions would help prioritize which patterns to codify as shared utilities.

## 5. Replay Fixes Table

No Replay-assisted fixes were made in this session. All 35 failures were diagnosed and resolved without using Replay tools.
