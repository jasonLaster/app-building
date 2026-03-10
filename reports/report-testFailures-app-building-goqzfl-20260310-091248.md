# Test Failures Report: app-building-goqzfl — 2026-03-10

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 109 |
| Logs with test failures | 22 |
| Logs without test failures | 87 |
| Total distinct test failure entries | 30 |
| Total affected tests | 67 |
| Replay usage rate (all failures) | 23.3% (7/30) |
| Replay usage rate (debugged failures) | 23.3% (7/30) |
| Debugging success rate | 100% (30/30) |
| Replay-assisted success rate | 100% (7/7) |
| Recording availability rate | 100% (30/30) |
| Debugging efficiency (Replay used but unnecessary) | 100% (7/7 had REPLAY_NECESSARY=no) |
| Replay decision quality | 100% unnecessary (7/7 REPLAY_NECESSARY=no among REPLAY_USED=yes) |
| Cascading fixes | 7 changesets resolved multiple failures |
| Self-inflicted failures | 2 (6.7% of 30) |
| Self-inflicted fix quality cost | 5 additional re-runs (W45: 2, W60: 3) |
| Total test re-runs across all logs | 36 |
| Unique root causes | 29 (12 distinct clusters + 17 unclustered) |
| Fix reuse rate | 3 patterns reused across multiple spec files |
| Pre-existing failure rate | 100% (30/30 PRE_EXISTING=yes) |
| Test Isolation Score | 66.7% (20/30 — data-contamination: 17, strict-mode: 3) |
| Infrastructure failure events | 1 event, 15 affected tests (W86) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 30 | 100% |

### Failure Resolution Type Distribution

| Type | Count | % of Total |
|------|-------|-----------|
| test-code | 22 | 73.3% |
| app-code | 2 | 6.7% |
| both | 6 | 20.0% |
| none | 0 | 0% |

### Diagnostic Source Effectiveness

| Source | Count | % of Total |
|--------|-------|-----------|
| error-output | 29 | 96.7% |
| error-context-snapshot | 1 | 3.3% |

### Fix Iteration Difficulty Distribution

| Iterations | Count | % of Total |
|-----------|-------|-----------|
| 1 | 18 | 60.0% |
| 2 | 6 | 20.0% |
| 3 | 5 | 16.7% |
| 4+ | 1 | 3.3% |

**4+ iteration failures:** notification-data-contamination cluster (W67) — settings notification preferences test contamination required 4 re-runs to fully resolve across toggle and persistence tests.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| W42 | goqzfl/property-rent-ledger | Edit tenant modal opens with pre-populated data | strict-mode | yes | no | error-output-sufficient | yes | — | — | yes | 680cd57897 |
| W43 | goqzfl/property-rent-ledger | Cluster: hardcoded-expense-row-count (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | — |
| W44 | goqzfl/property-rent-ledger | Category summary chart reflects combined filters | data-contamination | yes | yes | — | yes | PlaywrightSteps→NetworkRequest→ConsoleMessages | PlaywrightSteps, NetworkRequest, ConsoleMessages | yes | 80c1836e51 |
| W45 | goqzfl/property-rent-ledger | Cluster: destructive-empty-state-ordering (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | fd6d76a3d8 |
| W45 | goqzfl/property-rent-ledger | Editing an expense updates the list | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | fd6d76a3d8 |
| W46 | goqzfl/property-rent-ledger | Cluster: empty-state-payment-contamination (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 631551929f |
| W47 | goqzfl/property-rent-ledger | Key metric cards update after recording a payment | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 260825d120 |
| W50 | goqzfl/property-rent-ledger | Cluster: hardcoded-payment-count-and-ordering (13 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 0067fae0de |
| W50 | goqzfl/property-rent-ledger | Payment list count mismatch | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 0067fae0de |
| W52 | goqzfl/property-rent-ledger | Cluster: strict-mode-financials-tab (3 tests) | strict-mode | yes | no | error-output-sufficient | yes | — | — | yes | b9d76e256b |
| W54 | goqzfl/property-rent-ledger | Cluster: notes-data-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 89302cd16e |
| W57 | goqzfl/property-rent-ledger | Recent Activity Feed updates after action | missing-testid | yes | yes | — | yes | PlaywrightSteps→ConsoleMessages | PlaywrightSteps, ConsoleMessages | yes | 76983e825a |
| W58 | goqzfl/property-rent-ledger | Cancel button closes modal without saving | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3af5e1a2ba |
| W60 | goqzfl/property-rent-ledger | Delinquency Report updates after late notices | data-contamination | yes | yes | — | yes | PlaywrightSteps→NetworkRequest→Screenshot | PlaywrightSteps, NetworkRequest, ConsoleMessages, Screenshot | yes | none |
| W60 | goqzfl/property-rent-ledger | Delinquency Report updates after payment | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| W61 | goqzfl/property-rent-ledger | Income & Expense shows income by type | CSS/layout | yes | no | error-output-sufficient | yes | — | — | yes | 817fbfcb57 |
| W61 | goqzfl/property-rent-ledger | Income & Expense Export CSV downloads file | other | yes | no | error-output-sufficient | yes | — | — | yes | 817fbfcb57 |
| W62 | goqzfl/property-rent-ledger | Owner Statement displays Property dropdown | strict-mode | yes | no | error-output-sufficient | yes | — | — | yes | f770e5dfc5 |
| W62 | goqzfl/property-rent-ledger | Owner Statement Export CSV downloads file | other | yes | no | error-output-sufficient | yes | — | — | yes | f770e5dfc5 |
| W63 | goqzfl/property-rent-ledger | Rent Roll Export CSV downloads file | other | yes | no | error-output-sufficient | yes | — | — | yes | 5411cfc8a3 |
| W63 | goqzfl/property-rent-ledger | Rent Roll shows correct lease status values | backend-bug | yes | no | error-output-sufficient | yes | — | — | yes | 5411cfc8a3 |
| W66 | goqzfl/property-rent-ledger | Cluster: settings-page-remount-race (4 tests) | race-condition | yes | yes | — | yes | PlaywrightSteps→ConsoleMessages→NetworkRequest | PlaywrightSteps, ConsoleMessages, NetworkRequest | yes | 34e199bfed |
| W66 | goqzfl/property-rent-ledger | Cluster: late-fee-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 34e199bfed |
| W67 | goqzfl/property-rent-ledger | Cluster: notification-toggle-remount (4 tests) | race-condition | yes | yes | — | yes | PlaywrightSteps→ConsoleMessages→NetworkRequest | PlaywrightSteps, ConsoleMessages, NetworkRequest | yes | 9ccc8e44f1 |
| W67 | goqzfl/property-rent-ledger | Cluster: notification-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 9ccc8e44f1 |
| W68 | goqzfl/property-rent-ledger | Cluster: payment-checkbox-double-toggle (5 tests) | race-condition | yes | no | error-context-snapshot | yes | — | — | yes | 8dffda4a1b |
| W68 | goqzfl/property-rent-ledger | PaymentSettings default values data leak | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 8dffda4a1b |
| W70 | goqzfl/property-rent-ledger | Balance Summary shows positive balance in red | CSS/layout | yes | yes | — | yes | PlaywrightSteps→InspectElement→NetworkRequest | PlaywrightSteps, InspectElement, NetworkRequest | yes | e010895325 |
| W71 | goqzfl/property-rent-ledger | Cluster: search-term-substring-match (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | — |
| W72 | goqzfl/property-rent-ledger | Clicking lease expiring item navigates to detail | data-contamination | yes | yes | — | yes | PlaywrightSteps→Screenshot | PlaywrightSteps, Screenshot | yes | none |

### Infrastructure Failures

| Log | Worker/App | Category | Affected Tests | Recording Available | Notes |
|-----|-----------|----------|---------------|-------------------|-------|
| W86 | goqzfl/property-rent-ledger | infrastructure | All 15 sidebar.spec.ts tests | no | ERR_CONNECTION_REFUSED after removing webServer config from playwright.config.ts. Self-inflicted; fixed by updating test script. |

### Root Cause Clusters

| Cluster | Count (entries) | Affected Tests | Logs | Resolution |
|---------|----------------|----------------|------|------------|
| settings-page-remount-race | 2 | 8 | W66, W67 | Per-section loaded counters + conditional rendering to prevent React StrictMode double-fire remounting |
| destructive-empty-state-ordering | 1 | 4 | W45 | Moved destructive tests to end in serial block |
| empty-state-payment-contamination | 1 | 3 | W46 | Moved destructive tests to end in serial block |
| hardcoded-payment-count-and-destructive-ordering | 1 | 13 | W50 | Dynamic counting + relative assertions + reordering |
| strict-mode-financials-tab | 1 | 3 | W52 | Scoped locators to avoid ambiguous matches |
| notes-data-contamination | 1 | 4 | W54 | Added DELETE endpoint + beforeEach cleanup |
| delinquency-test-ordering | 1 | 1 | W60 | Test reordering to prevent cross-test contamination |
| late-fee-data-contamination | 1 | 2 | W66 | beforeEach API reset to seed defaults |
| notification-data-contamination | 1 | 2 | W67 | beforeEach API reset to seed defaults |
| payment-checkbox-double-toggle | 1 | 5 | W68 | Changed button to div inside label to prevent double-toggle |
| hardcoded-expense-row-count | 1 | 2 | W43 | Relative count assertions |
| search-term-substring-match | 1 | 3 | W71 | More specific search term ("smith" instead of "john") |

**Unclustered pattern: toEndWith assertion bug** — 3 failures across W61, W62, W63 all used the non-existent `toEndWith` Playwright assertion. Same root cause (invalid assertion API) but in different spec files.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 17 | 56.7% |
| race-condition | 3 | 10.0% |
| strict-mode | 3 | 10.0% |
| other (toEndWith) | 3 | 10.0% |
| CSS/layout | 2 | 6.7% |
| backend-bug | 1 | 3.3% |
| missing-testid | 1 | 3.3% |

### When Was Replay Most Effective?

Replay was used in 7 out of 30 failures (23.3%), but in **all 7 cases REPLAY_NECESSARY=no** — error output alone would have been sufficient. Replay provided confirmation but did not reveal new diagnostic information in any case.

The most common Replay usage pattern was:
1. **PlaywrightSteps** to trace test execution flow (used in all 7)
2. **NetworkRequest** to check API responses (used in 4/7)
3. **ConsoleMessages** to check for errors (used in 4/7)
4. **Screenshot** to verify page state (used in 2/7)
5. **InspectElement** to check DOM state (used in 1/7)

### When Was Replay NOT Used and Why?

23 of 30 failures (76.7%) did not use Replay. In every case the reason was **error-output-sufficient** — the Playwright error messages, expected vs. received values, and page snapshots contained enough information to diagnose the root cause immediately.

The dominant pattern: data-contamination failures produce clear count mismatches (e.g., "expected 5 but received 8") that immediately point to accumulated data from prior tests. No Replay needed.

### Common Debugging Strategies That Worked

1. **Destructive test reordering** — Moving tests that delete/modify all data to the end in `test.describe.serial` blocks. Applied across 3+ spec files (expenses, payments, late notices).
2. **Relative count assertions** — Replacing hardcoded `toHaveCount(N)` with capturing initial count and asserting relative changes. Applied across multiple spec files.
3. **beforeEach API reset** — Resetting settings/config to seed defaults via API before each test. Applied across 3 settings spec files.
4. **Conditional rendering on load** — Preventing React StrictMode double-fire remounting by using per-section loaded flags instead of shared counters. Applied to settings page components.

### Common Debugging Strategies That Failed

No debugging strategies outright failed, but **multi-iteration fixes** occurred when:
- Initial fix addressed one symptom but exposed another (W47: 3 iterations for key-metric-cards)
- Data contamination had cascading effects across multiple test assertions (W60: 3 iterations for delinquency reports)
- React StrictMode interactions required multiple fix attempts before finding the right pattern (W66, W67: 3-4 iterations)

### Self-Inflicted Failure Rate

**6.7%** (2/30) of failures were self-inflicted — introduced by the agent's own fix attempts during the session:
- W45: Editing expense test — hardcoded count after reordering fix created new count mismatch (2 re-runs)
- W60: Delinquency payment test — test ordering fix exposed secondary contamination path (3 re-runs)

This is a low self-inflicted rate, indicating generally good fix quality.

### Test Isolation Issues

**Test Isolation Score: 66.7%** (>50% threshold) — data-contamination (56.7%) + strict-mode (10.0%) account for two-thirds of all failures.

**Analysis of test isolation patterns:**

- **data-contamination (17 entries, 56.7%)**: The dominant failure mode. Root causes fall into three sub-patterns:
  1. **Destructive test ordering** (7 entries): Tests that delete all records via API run before tests that need seed data. Affected: expenses-list-table, generate-late-notices, payment-list-table, upcoming-items, delinquency reports.
  2. **Accumulated data from prior tests** (7 entries): Tests create new records that persist and inflate counts for subsequent tests. Affected: expenses-add-edit-modal, key-metric-cards, record-payment-modal, payment-list-table, tenant-list-table.
  3. **Settings contamination** (3 entries): Settings save tests modify shared config that affects subsequent tests expecting defaults. Affected: settings-late-fee, settings-notification, settings-payment.

- **strict-mode (3 entries, 10.0%)**: Ambiguous locators matching multiple DOM elements. Affected: add-edit-tenant-modal, property-detail-financials-tab, reports-owner-statement.

**Isolation strategies that would have prevented these failures:**
- **Per-test data cleanup via beforeEach hooks** — API calls to reset or scope test data before each test
- **Test-scoped data creation** — Instead of relying on shared seed data, each test creates its own data
- **Serial blocks for destructive operations** — Already applied as the primary fix pattern
- **Scoped locators** — Using `page.getByTestId('modal').getByTestId('field')` instead of global selectors

All tests run in parallel mode (`fullyParallel: true`) within a shared database, making isolation critical. The current fix approach (reordering + cleanup hooks) works but is fragile — adding new tests can re-introduce ordering issues.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "data-contamination diagnostic shortcut"**: When error output shows count mismatches (expected N, received N+M) or "No X found" messages, skip Replay and diagnose directly from error output. This would have saved time in 7/7 Replay uses.
- **Add "toEndWith is not a Playwright assertion" note**: Three failures used `toEndWith` which doesn't exist. Add to a common test-writing pitfalls section.

### `skills/tasks/build/testing.md`

- **Mandate beforeEach cleanup for stateful tests**: Require tests that modify shared state (create/delete records, change settings) to include API cleanup in `beforeEach` hooks. This would prevent the majority of data-contamination failures.
- **Require serial blocks for destructive tests**: Any test that deletes all records or resets state should be in a `test.describe.serial` block at the end of the spec file. Document this as a hard rule.
- **Ban hardcoded count assertions**: Replace all `toHaveCount(N)` with relative assertions (capture initial count, assert delta). This single change would have prevented ~30% of failures.
- **Add Replay decision heuristic**: "Use Replay only when error output does not contain the failing assertion's expected/received values or when the failure involves visual/layout issues not captured in error snapshots." In this report, 100% of Replay uses were unnecessary — error output was always sufficient.

### `skills/review/reportTestFailures.md`

- **Add "toEndWith" and similar invalid-assertion categories**: The current `other` category captured 3 failures that were all the same root cause (invalid Playwright assertion API). Consider adding a `bad-assertion-api` category.
- **Clarify cluster counting for analysis files**: W71 reported TEST_FAILURES: 3 for a single cluster of 3 tests, which should have been TEST_FAILURES: 1. Add explicit guidance that cluster entries count as 1 in the TEST_FAILURES tally.
- **Add sub-categories for data-contamination**: The 56.7% data-contamination rate would be more actionable if broken into: destructive-ordering, accumulated-data, settings-contamination.

## 5. Replay Fixes Table

### Fix 1
INITIAL_CHANGESET: none
FAILING_TEST: Category summary chart reflects combined date range and property filters (expenses-category-summary.spec.ts)
FINAL_CHANGESET: 80c1836e51
ASSESSMENT: Replay confirmed empty API responses after destructive test deleted all expenses. Error output showing "No expenses found" was sufficient — Replay added confirmation but no new diagnostic value.

### Fix 2
INITIAL_CHANGESET: none
FAILING_TEST: recent-activity-feed.spec.ts — Recent Activity Feed updates after a new action is performed
FINAL_CHANGESET: 76983e825a
ASSESSMENT: Replay confirmed modal remained open due to missing date field. PlaywrightSteps showed the save button validation blocked submission. Error output would have sufficed.

### Fix 3
INITIAL_CHANGESET: none
FAILING_TEST: reports-delinquency.spec.ts — Delinquency Report updates after generating late notices
FINAL_CHANGESET: none
ASSESSMENT: Replay confirmed Tom Garcia was removed by payment tests running before this test, and identified event type mismatch (late_notice vs late_notice_sent) in backend. Multi-iteration fix (3 re-runs). Error output was sufficient for initial diagnosis.

### Fix 4
INITIAL_CHANGESET: none
FAILING_TEST: settings-late-fee-config.spec.ts — settings-page-remount-race cluster (4 tests)
FINAL_CHANGESET: 34e199bfed
ASSESSMENT: Replay confirmed React StrictMode double-firing useEffect, causing shared loadedSections counter to increment twice and remounting all settings components. NetworkRequest showed duplicate fetch pattern. Per-section loaded flags + conditional rendering fixed the race. Error output hinted at the issue but Replay provided clearer confirmation of the double-fire pattern.

### Fix 5
INITIAL_CHANGESET: none
FAILING_TEST: settings-notification-preferences.spec.ts — notification-toggle-remount cluster (4 tests)
FINAL_CHANGESET: 9ccc8e44f1
ASSESSMENT: Same root cause as Fix 4 (settings-page-remount-race). Replay confirmed duplicate network fetches from StrictMode double-firing. Applied same conditional-render-on-load pattern. Error output was sufficient.

### Fix 6
INITIAL_CHANGESET: none
FAILING_TEST: tenant-detail.spec.ts — Balance Summary shows positive balance in red
FINAL_CHANGESET: e010895325
ASSESSMENT: Replay confirmed component uses CSS variable `var(--color-status-error)` but `el.style.color` returns empty string since the variable is resolved by the browser. InspectElement showed the DOM state. Fixed by using getComputedStyle. Error output hinted at the issue but Replay provided clearer DOM inspection.

### Fix 7
INITIAL_CHANGESET: none
FAILING_TEST: Clicking a lease expiring item navigates to Tenant Detail (upcoming-items.spec.ts)
FINAL_CHANGESET: none
ASSESSMENT: Replay confirmed "No leases expiring soon" page state after prior destructive test modified lease dates. Screenshot matched error output exactly. Replay added no new diagnostic value — reordering tests to run before destructive tests was the obvious fix.
