# Test Failures Report: app-building-rgrcr9-20260306-151852

**App:** pest-control-billing
**Container:** app-building-rgrcr9
**Date:** 2026-03-06

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 100 |
| Logs with test failures | 25 |
| Logs without test failures | 75 |
| Total distinct test failure entries | 48 |
| Total affected tests | 84 |
| Infrastructure failure events | 1 event (9 tests affected) |
| Replay usage rate | 39.6% (19/48) |
| Replay usage rate among debugged failures | 42.2% (19/45) |
| Debugging success rate | 100% (45/45) |
| Replay-assisted success rate | 100% (19/19) |
| Recording availability rate | 100% (48/48) |
| Debugging efficiency (Replay used but unnecessary) | 47.4% (9/19 Replay-used failures could have been diagnosed from error output alone) |
| Cascading fixes | 4 changesets resolved multiple failures (b9c783f: 5+, 33e2a8b: 4, ad1660f: 8, customer-list-not-refreshed: 2) |
| Self-inflicted failures | 27.1% (13/48) |
| Total test re-runs | 41 |
| Unique root causes | ~39 (15 distinct clusters + ~24 unclustered) |
| Fix reuse rate | 3 patterns reused across multiple spec files |
| Test Isolation Score | 64.6% (31/48 — data-contamination + strict-mode + seed-data-mismatch) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 46 | 95.8% |
| writeTests | 2 | 4.2% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|-----------------|-------|------------|
| test-code | 37 | 77.1% |
| app-code | 8 | 16.7% |
| both | 3 | 6.3% |
| none | 0 | 0% |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------| ------|---------|-----------|
| w49 | rgrcr9/pest-control-billing | Aging report shows individual invoice details within each bucket | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| w50 | rgrcr9/pest-control-billing | Callback-contract-options-race (2 tests: Creating a callback appears in dashboard, Callback number auto-generates) | timeout | yes | yes | | yes | PlaywrightSteps to find stuck step | PlaywrightSteps | yes | none |
| w52 | rgrcr9/pest-control-billing | Callback form pest type dropdown populates from contract's covered pests | strict-mode | yes | yes | | yes | PlaywrightSteps + NetworkRequest timing | PlaywrightSteps, NetworkRequest | yes | b9c783f |
| w52 | rgrcr9/pest-control-billing | Callback form updates status from Open to Scheduled | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest for duplicate GETs | PlaywrightSteps, NetworkRequest, Screenshot | yes | b9c783f |
| w52 | rgrcr9/pest-control-billing | Callback form auto-calculates guarantee window status | strict-mode | yes | no | same root cause as pest type dropdown (wait-before-count) | yes | — | — | yes | b9c783f |
| w53 | rgrcr9/pest-control-billing | Callback list displays status with visual styling | data-contamination | yes | no | expected 4 rows but got 7, clearly accumulated data | yes | — | — | yes | none |
| w53 | rgrcr9/pest-control-billing | Callback list is sortable by columns | data-contamination | yes | no | expected CB-002 but got CB-00008, shifted sort order | yes | — | — | yes | none |
| w54 | rgrcr9/pest-control-billing | Creating a contract appears in dashboard recent activity feed | strict-mode | yes | yes | | yes | PlaywrightSteps + NetworkRequest + Screenshot | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest | yes | 9267b3e |
| w55 | rgrcr9/pest-control-billing | Contract detail Edit Contract action opens form in edit mode | backend-bug | yes | yes | | yes | Page snapshot showed ISO date format in input | PlaywrightSteps, Screenshot, NetworkRequest | yes | none |
| w55 | rgrcr9/pest-control-billing | Destructive-test-ordering (3 tests: Renew, CreateCallback, GenerateInvoice) | data-contamination | yes | no | Cancel test ran as #2, cancelling CTR-001 before others needed it | yes | — | — | yes | none |
| w58 | rgrcr9/pest-control-billing | Contract form customer dropdown shows all customers | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps + NetworkRequest confirmed 5 customers | PlaywrightSteps, NetworkRequest | yes | 6dc51d0 |
| w58 | rgrcr9/pest-control-billing | Wait-before-count-dropdown-plan (2 tests: auto-fills fields, auto-filled editable) | strict-mode | yes | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps, NetworkRequest | yes | 6dc51d0 |
| w59 | rgrcr9/pest-control-billing | Contract form creates a new contract successfully | strict-mode | yes | yes | | yes | PlaywrightSteps + Screenshot validation error | PlaywrightSteps, ConsoleMessages, Screenshot | yes | 33e2a8b |
| w59 | rgrcr9/pest-control-billing | Contract form creates correct visits for each frequency (strict) | strict-mode | yes | yes | | yes | Error output identified the violation | PlaywrightSteps | yes | 33e2a8b |
| w59 | rgrcr9/pest-control-billing | Contract form creates correct visits for each frequency (timeout) | timeout | no | yes | | yes | Screenshot to see progress | PlaywrightSteps, Screenshot | yes | 33e2a8b |
| w59 | rgrcr9/pest-control-billing | Contract form edits an existing contract successfully | backend-bug | yes | yes | | yes | NetworkRequest to inspect PUT body showing old price | PlaywrightSteps, NetworkRequest | yes | 33e2a8b |
| w60 | rgrcr9/pest-control-billing | Hardcoded-seed-count (12 tests: all contract-list tests) | seed-data-mismatch | yes | yes | | yes | Replay confirmed 6 contracts vs expected 4 | PlaywrightSteps | yes | none |
| w67 | rgrcr9/pest-control-billing | Customer-list-not-refreshed (2 tests: create Residential, create Commercial) | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest for missing GET | PlaywrightSteps, NetworkRequest, Screenshot | yes | none |
| w67 | rgrcr9/pest-control-billing | Customer form creates Commercial customer (strict-mode on duplicate name) | seed-data-mismatch | no | no | duplicate "Bob Wilson" obvious from error | yes | — | — | n/a | none |
| w67 | rgrcr9/pest-control-billing | Customer form edits an existing customer | backend-bug | yes | yes | | yes | PlaywrightSteps + ConsoleMessages for null crash | PlaywrightSteps, ConsoleMessages, NetworkRequest, Screenshot | yes | none |
| w67 | rgrcr9/pest-control-billing | Customer form edit mode cancel button discards changes | data-contamination | no | no | hardcoded phone "555-0101" changed by prior test | yes | — | — | n/a | none |
| w72 | rgrcr9/pest-control-billing | Missing-cascade-delete (3 tests: active count, renewals, no contracts) | data-contamination | yes | no | page snapshots showed wrong counts | yes | — | — | yes | none |
| w73 | rgrcr9/pest-control-billing | Destructive-test-ordering (3 tests: timestamps, invoice nav, callback nav) | data-contamination | yes | no | empty feeds after destructive test | yes | — | — | yes | none |
| w73 | rgrcr9/pest-control-billing | Recent activity feed shows callback created entries | data-contamination | yes | no | callback entries not in top 10 | yes | — | — | yes | none |
| w74 | rgrcr9/pest-control-billing | MRR excludes expired and cancelled contracts | backend-bug | yes | no | MRR showed $600 instead of $300 | yes | — | — | yes | none |
| w76 | rgrcr9/pest-control-billing | Strict-mode-multiple-elements (2 tests: correct columns, auto-renew indicator) | strict-mode | yes | no | strict mode violation clear from error | yes | — | — | yes | none |
| w76 | rgrcr9/pest-control-billing | Expiring contracts handles no expiring contracts gracefully | data-contamination | yes | no | empty state not found due to persisted data | yes | — | — | yes | none |
| w77 | rgrcr9/pest-control-billing | Creating an invoice from a contract appears in billing history | CSS/layout | yes | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | none |
| w77 | rgrcr9/pest-control-billing | Creating an invoice appears in dashboard recent activity feed | CSS/layout | yes | yes | | yes | PlaywrightSteps timing analysis | PlaywrightSteps | yes | none |
| w78 | rgrcr9/pest-control-billing | Invoice detail displays line items (quantity format) | CSS/layout | yes | no | expected "1" but received "1.00" | yes | — | — | yes | none |
| w78 | rgrcr9/pest-control-billing | Mutating-test-state-corruption (3 tests: Record Payment, Void, Void confirm) | data-contamination | yes | no | INV-002 showed Paid instead of Sent | yes | — | — | yes | none |
| w79 | rgrcr9/pest-control-billing | Select-helper-race-condition (5 tests: create, due date, line items, sequential number, validation) | CSS/layout | yes | yes | | yes | PlaywrightSteps timing | PlaywrightSteps | yes | ad1660f |
| w79 | rgrcr9/pest-control-billing | Seed-data-mismatch (3 tests: customer dropdown, contract dropdown, sequential number) | seed-data-mismatch | yes | no | test expected 3 customers but seed has 5 | yes | — | — | yes | ad1660f |
| w79 | rgrcr9/pest-control-billing | Invoice form editing a draft invoice | backend-bug | yes | no | total showed $150 instead of $175 after edit | yes | — | — | yes | ad1660f |
| w80 | rgrcr9/pest-control-billing | Seed-data-invoice-count-mismatch (10 tests: all invoice-list tests) | seed-data-mismatch | yes | no | every test expected count 5 but received 9 | yes | — | — | yes | none |
| w81 | rgrcr9/pest-control-billing | Plan form creates a new plan successfully | strict-mode | yes | yes | | yes | PlaywrightSteps verified UI state | PlaywrightSteps | yes | 4e96f2d |
| w81 | rgrcr9/pest-control-billing | Plan form deactivating a plan shows warning | data-contamination | yes | no | plan name changed by prior edit test | yes | — | — | n/a | 4e96f2d |
| w83 | rgrcr9/pest-control-billing | Revenue chart for last 12 months | strict-mode | yes | no | strict mode violation from error output | yes | — | — | yes | none |
| w83 | rgrcr9/pest-control-billing | Revenue chart correctly categorizes contract vs one-time revenue | data-contamination | yes | no | dollar amounts showed seed data contamination | yes | — | — | yes | none |
| w83 | rgrcr9/pest-control-billing | Revenue report only counts paid invoices | data-contamination | yes | no | clearSeedInvoices didn't delete all invoices | yes | — | — | yes | none |
| w83 | rgrcr9/pest-control-billing | Revenue report handles months with no revenue | data-contamination | yes | no | same clearSeedInvoices pattern | yes | — | — | yes | none |
| w96 | rgrcr9/pest-control-billing | Expiring contracts display correct columns | CSS/layout | no | no | contract detail still loading when assertion fired | yes | — | — | yes | none |
| w102 | rgrcr9/pest-control-billing | Voiding invoice updates customer outstanding balance | data-contamination | no | no | INV-002 already Paid from preceding test | yes | — | — | yes | none |
| w104 | rgrcr9/pest-control-billing | Plan form edits an existing plan successfully | backend-bug | no | yes | | yes | PlaywrightSteps + NetworkRequest + Logpoint | PlaywrightSteps, NetworkRequest, Logpoint, ListSources, ReadSource | yes | none |
| w111 | rgrcr9/pest-control-billing | Recent activity feed clicking invoice entry navigates to detail | data-contamination | no | no | draft invoice consumed by earlier test | yes | — | — | yes | none |
| w117 | rgrcr9/pest-control-billing | Renew an Expiring Contract | backend-bug | yes | no | expected "Active" but received "Expired" | yes | — | — | yes | d7cf5ce |
| w117 | rgrcr9/pest-control-billing | Manage Service Plans - create a new plan | strict-mode | no | no | "Monthly" matched both "Monthly" and "Bi-Monthly" | yes | — | — | yes | d7cf5ce |

### Root Cause Clusters

| Cluster | Count | Affected Tests | Logs | Resolution |
|---------|-------|----------------|------|------------|
| wait-before-count-dropdown | 4 entries | ~10 tests | w52, w54, w59 | Fixed by adding waits for dropdown options to load before counting. Applied across callback-form, contract-cross-cutting, contract-form-actions |
| wait-before-count | 4 entries | ~13 tests | w50, w77, w79 | Fixed by waiting for elements to render before calling .count(). Applied across callback-cross-cutting, invoice-cross-cutting, invoice-form |
| form-populate-overwrites-edits | 2 entries | 2 tests | w52, w59 | App bug — React useEffect re-ran when Redux state updated, overwriting user edits. Fixed by adding formPopulated/editInitialized flags |
| hardcoded-row-counts | 1 entry | 2 tests | w53 | Test used hardcoded row counts instead of relative assertions |
| destructive-test-ordering | 3 entries | 9 tests | w55, w73, w78 | Tests with side effects (cancel, delete, pay) ran before tests needing original state. Fixed by reordering destructive tests to end |
| hardcoded-seed-count | 1 entry | 12 tests | w60 | All contract-list tests expected 4 contracts but seed had 6. Rewrote with relative assertions |
| customer-list-not-refreshed | 1 entry | 2 tests | w67 | App bug — navigation didn't re-fetch customer list. Fixed in App.tsx |
| missing-cascade-delete | 1 entry | 3 tests | w72 | App bug — contracts DELETE endpoint didn't cascade to related records |
| strict-mode-multiple-elements | 1 entry | 2 tests | w76 | Tests matched multiple table sections. Fixed by scoping assertions |
| mutating-test-state-corruption | 1 entry | 3 tests | w78 | Record Payment test mutated INV-002 to Paid before other tests. Fixed by reordering |
| seed-data-mismatch (invoice-form) | 1 entry | 3 tests | w79 | Test expected 3 customers, seed has 5. Updated counts |
| seed-data-invoice-count-mismatch | 1 entry | 10 tests | w80 | Test expected 5 invoices, seed has 9. Updated all counts |
| data-contamination-clearSeedInvoices | 1 entry | 2 tests | w83 | clearSeedInvoices only changed status instead of deleting. Fixed to actually delete |

### Infrastructure Failures

| Event | Category | Affected Tests | Log | Notes |
|-------|----------|----------------|-----|-------|
| 1 | other | 9 tests (plan-list.spec.ts, plan-form.spec.ts) | w104 | Agent ran `npx playwright test` directly instead of `npm run test`, bypassing ephemeral Neon branch and seed data setup. Fixed by using proper test script |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 16 | 33.3% |
| strict-mode | 11 | 22.9% |
| backend-bug | 8 | 16.7% |
| seed-data-mismatch | 5 | 10.4% |
| CSS/layout | 5 | 10.4% |
| timeout | 2 | 4.2% |
| infrastructure | 1 | (separate) |

### When Replay Was Most Effective

Replay was most valuable for diagnosing **race conditions and app-level state bugs**:

- **Form populate-overwrites-edits bugs** (w52, w59, w104): Replay's NetworkRequest tool was essential for tracing the timing of API responses vs. user input, revealing that React useEffect hooks re-ran and overwrote form fields. These required inspecting request bodies and response timing — information not available from error output alone.
- **Customer list not refreshing** (w67): PlaywrightSteps + NetworkRequest revealed missing GET requests after navigation, confirming a stale-cache bug in the app.
- **Contract dropdown race conditions** (w54): PlaywrightSteps confirmed that customer option count was 0 because the API hadn't returned yet.

Tool sequences that worked well:
1. **PlaywrightSteps -> NetworkRequest** — most common effective pattern for race conditions
2. **PlaywrightSteps -> Screenshot -> ConsoleMessages** — for UI state + crash diagnosis
3. **PlaywrightSteps -> NetworkRequest -> Logpoint** — for deep React state tracing (w104)

### When Replay Was NOT Used and Why

29 of 48 failures (60.4%) were diagnosed without Replay:
- **Diagnosed from error output** (most common): Strict-mode violations, data-contamination with clear expected-vs-actual mismatches, and seed-data-mismatch counts were all self-explanatory from Playwright error messages
- **Same root cause already diagnosed**: Several failures shared root causes with previously Replay-diagnosed issues (e.g., wait-before-count pattern)
- **Debugging not attempted**: 3 failures where the error was immediately obvious (duplicate names, data contamination from prior tests)

### Common Debugging Strategies That Worked

1. **Wait-before-count pattern**: The most reused fix — adding `waitFor` or polling before calling `.count()` on dropdown options or table rows that load asynchronously. Applied across 4+ spec files.
2. **Destructive test reordering**: Moving tests with side effects (cancel, delete, pay) to the end of the test suite. Applied across 3 spec files.
3. **Relative/dynamic assertions**: Replacing hardcoded counts (e.g., `toHaveCount(5)`) with relative assertions or API-discovered values. Applied across 2+ spec files.
4. **formPopulated flags**: Adding boolean refs to prevent React useEffect from re-populating forms after initial load.

### Common Debugging Strategies That Failed

- No clear pattern of *failed* debugging strategies — all 45 attempted debugs succeeded. However, the high FIX_ITERATIONS count for some failures (w104: 4 iterations for plan-form edit) suggests that React state management bugs are harder to diagnose on the first attempt.

### Self-Inflicted Failure Rate

**27.1% (13/48)** of failures were self-inflicted — introduced by the agent's own fix attempts during the session.

Common self-inflicted patterns:
- **Strict-mode violations from hasText matching** (w59, w83, w117): Using `hasText: 'Monthly'` which also matches "Bi-Monthly"
- **Data contamination from test modifications** (w67, w83, w102, w111): Modifying seed data or test behavior that broke subsequent tests in the same serial block
- **React useEffect bug introduced during fix** (w104): Fix attempt changed component behavior, introducing a new form-state-reset bug

The 27.1% rate is below the 50% concern threshold but still significant — roughly 1 in 4 failures required fixing the agent's own mistakes.

### Test Isolation Issues

**Test Isolation Score: 64.6%** — data-contamination (33.3%) + strict-mode (22.9%) + seed-data-mismatch (10.4%) collectively account for nearly two-thirds of all failures. This exceeds the 50% threshold, warranting dedicated analysis.

**Affected spec files** (by test isolation failures):
- callback-list.spec.ts (hardcoded row counts)
- contract-detail-actions.spec.ts (destructive test ordering)
- contract-list.spec.ts (hardcoded seed counts)
- dashboard-activity-feed.spec.ts (destructive test ordering)
- expiring-contracts.spec.ts (strict-mode + data contamination)
- invoice-detail.spec.ts (mutating test state)
- invoice-form.spec.ts (race conditions + seed mismatch)
- invoice-list.spec.ts (seed count mismatch)
- plan-form.spec.ts (strict-mode + data contamination)
- revenue-report.spec.ts (incomplete cleanup)

**Root causes:**
1. **No database reset between tests**: The test script creates an ephemeral Neon branch per spec file but does not reset between individual tests. Tests that create, modify, or delete records contaminate state for subsequent tests.
2. **Serial test dependencies**: Tests in `describe.serial` blocks share state intentionally, but destructive operations (cancel, void, pay) at wrong positions break downstream tests.
3. **Hardcoded expectations**: Tests hardcode row counts, invoice numbers, or customer names that break when seed data evolves or prior tests create records.

**Isolation strategies that would have prevented these failures:**
- Per-test cleanup hooks (beforeEach/afterEach) to restore database state
- Dynamic/relative assertions instead of hardcoded counts
- Creating dedicated test data per test rather than relying on shared seed data
- Ordering destructive operations last in serial blocks by convention

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "wait-before-count" as a standard debugging pattern**: When dropdown options or table rows show count of 0, the first check should be whether an API response has arrived before the count operation. This was the #1 recurring root cause.
- **Add "form-populate-overwrites-edits" pattern**: When form fields show old values after user input, check for React useEffect hooks that re-run when Redux state reference changes. Fix with a `formPopulated` ref guard.
- **Add PlaywrightSteps -> NetworkRequest as the recommended first tool sequence** for race condition debugging.

### `skills/tasks/build/testing.md`

- **Mandate relative assertions**: Tests should never hardcode expected row counts. Use patterns like `toHaveCount(initialCount + 1)` or `count >= expectedMinimum`.
- **Mandate destructive-test-last ordering**: In serial describe blocks, tests that cancel/void/delete/pay should always be last. Add this as a writeTests directive.
- **Add exact text matching directive**: When selecting options containing common words (e.g., "Monthly"), always use `{ hasText: /^Monthly$/ }` or `getByText('Monthly', { exact: true })` to avoid matching "Bi-Monthly".
- **Consider per-test data isolation**: The current pattern of shared seed data per spec file causes 33% of all failures. Investing in per-test setup/teardown or test-specific data creation would significantly reduce the failure rate.

### `skills/review/reportTestFailures.md`

- **Clarify CSS/layout category**: Several failures categorized as CSS/layout (w77, w79) were actually race conditions (count before load). Consider adding a "race-condition" category or guidance to prefer more specific categories.
- **Add guidance for cluster counting with <5 tests**: The template says clusters are for 5+ failures, but several analyses used cluster format for 2-3 test clusters. Clarify whether small clusters should use the full individual template or if 2+ is acceptable.
- **Add REPLAY_NECESSARY as a required field**: Some analyses omitted this field for REPLAY_USED: yes entries. Making it strictly required would improve debugging efficiency tracking.
