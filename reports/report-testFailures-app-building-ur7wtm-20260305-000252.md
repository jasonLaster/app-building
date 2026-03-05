# Test Failures Report: app-building-ur7wtm-20260305-000252

**App:** WatchWorks (watch and clock repair shop management)
**Period:** 2026-03-05 00:04 – 04:17 UTC (77 worker iterations)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 77 |
| Logs with test failures | 7 |
| Logs without test failures | 70 |
| Total distinct test failures | 9 |
| Total test re-runs | 9 |
| Pre-existing failures | 8 of 9 (89%) |
| Replay usage rate (all failures) | 8 of 9 (89%) |
| Replay usage rate (debugged failures) | 8 of 9 (89%) |
| Debugging attempted | 9 of 9 (100%) |
| Debugging success rate | 9 of 9 (100%) |
| Replay-assisted success rate | 8 of 8 (100%) |
| Recording availability rate | 8 of 9 (89%) |
| Debugging efficiency (Replay used where error output may have sufficed) | 2 of 8 (25%) |
| Cascading fixes | 1 (log 57: single changeset fixed 2 failures) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------| ------|---------|-----------|
| 38 | ur7wtm / WatchWorks | Edit order via modal preserves existing data | strict-mode | yes | yes | | yes | PlaywrightSteps → InspectElement → Screenshot → SearchSources → Logpoint | PlaywrightSteps, InspectElement, Screenshot, SearchSources, Logpoint | yes | none |
| 42 | ur7wtm / WatchWorks | Customer list shows empty state when no customers exist | backend-bug | yes | yes | | yes | PlaywrightSteps → NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 2198193 |
| 50 | ur7wtm / WatchWorks | Order history updates immediately after status change | spa-redirect | yes | yes | | yes | PlaywrightSteps → Screenshot → ConsoleMessages → NetworkRequest → ReactComponentTree → SearchSources → ReadSource | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest, ReactComponentTree, SearchSources, ReadSource | yes | none |
| 51 | ur7wtm / WatchWorks | Clicking New Order button opens create order modal | strict-mode | no | yes | | yes | PlaywrightSteps to confirm modal title mismatch | PlaywrightSteps | yes | none |
| 53 | ur7wtm / WatchWorks | All service-list tests (initial crash) | backend-bug | yes | yes | | yes | ConsoleMessages to identify runtime error | ConsoleMessages | yes | none |
| 53 | ur7wtm / WatchWorks | Service list shows empty state when no services exist | backend-bug | yes | yes | | yes | PlaywrightSteps → NetworkRequest | PlaywrightSteps, NetworkRequest | yes | none |
| 57 | ur7wtm / WatchWorks | All technician-detail tests (initial timeout) | missing-testid | yes | yes | | yes | PlaywrightSteps → Screenshot → NetworkRequest | PlaywrightSteps, Screenshot, NetworkRequest | yes | 74a6a11 |
| 57 | ur7wtm / WatchWorks | Clicking an order in current workload navigates to that order | strict-mode | yes | yes | | yes | PlaywrightSteps to identify strict mode conflict | PlaywrightSteps | yes | 74a6a11 |
| 68 | ur7wtm / WatchWorks | order-detail-actions tests (seed failure) | seed-data-mismatch | yes | no | diagnosed from error output — duplicate key constraint error in seed script was clear from stack trace | no | Error output analysis | N/A | yes | none |

## 3. Patterns

### When Replay was most effective
- **Backend bugs with FK constraints** (logs 42, 53): PlaywrightSteps + NetworkRequest was an effective combo for identifying silent API failures (500 errors on DELETE due to foreign key constraints). Error output alone didn't reveal the root cause — the tests just timed out waiting for state changes.
- **Route mismatches / SPA redirects** (log 50): Replay's Screenshot + ReactComponentTree combo quickly revealed the page wasn't rendering the expected components because the URL path was wrong (`/orders` vs `/repair-orders`).
- **Selector mismatches** (log 57): PlaywrightSteps + Screenshot identified that `locator('tr')` didn't match the `<div>`-based row layout, which wouldn't be obvious from timeout errors alone.
- **Strict mode violations with duplicate testids** (log 38): Deep investigation with InspectElement + SearchSources + Logpoint was needed to identify that two elements in different parts of the DOM shared the same `data-testid`.

### When Replay was NOT used and why
- **Seed data mismatch** (log 68): The duplicate key constraint error was fully visible in the stack trace output. No recording was available since the test infrastructure failed before any browser actions. This was the correct decision.

### When Replay may have been unnecessary
- **Simple assertion mismatches** (log 51): The "New Order" vs "Create" title mismatch could likely have been diagnosed from the Playwright error output showing expected vs actual text. Replay was used but only PlaywrightSteps was needed.
- **Runtime errors visible in console** (log 53, first failure): `price.toFixed is not a function` appeared in ConsoleMessages but this type of error often also appears in the test runner output.

### Common debugging strategies that worked
1. **PlaywrightSteps first** — Used in 7 of 8 Replay-assisted debugs. Provides a quick overview of where the test got stuck.
2. **PlaywrightSteps → NetworkRequest** — Effective for backend bugs where API calls fail silently (2 cases).
3. **PlaywrightSteps → Screenshot** — Effective for understanding page state when elements aren't found (2 cases).
4. **Deep investigation chain** (PlaywrightSteps → InspectElement → SearchSources → Logpoint) — Effective for strict-mode violations with non-obvious causes (1 case).

### Common debugging strategies that failed
- None — all debugging attempts were successful in this session.

### Recurring failure categories
| Category | Count | Notes |
|----------|-------|-------|
| strict-mode | 3 | Duplicate testids (1), selector matching multiple elements (1), assertion mismatch (1) |
| backend-bug | 3 | FK constraint preventing DELETE (2), NUMERIC→string type coercion (1) |
| missing-testid | 1 | Test used `tr` selector but component renders `div` rows |
| spa-redirect | 1 | Test navigated to wrong URL path |
| seed-data-mismatch | 1 | Duplicate key from missing truncate before seed |

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: "FK constraint silent failures"** — When tests time out waiting for empty state after DELETE calls, check NetworkRequest for 500 errors from foreign key constraint violations. Resolution: add ON DELETE CASCADE or update test to clean up dependent records first.
- **Add pattern: "PostgreSQL NUMERIC string coercion"** — PostgreSQL returns NUMERIC columns as strings in JS. When seeing `X.toFixed is not a function`, wrap values with `Number()` or `parseFloat()` before calling number methods.
- **Add tool sequence recommendation:** Start with PlaywrightSteps in almost all cases — it was the entry point for 7/8 Replay-assisted debugs and immediately reveals where the test is stuck.

### `skills/tasks/build/testing.md`
- **Selector discipline:** Tests should never use raw HTML element selectors (`tr`, `td`) — always use `data-testid` attributes. The technician-detail timeout (log 57) was caused by `locator('tr')` not matching `<div>` rows.
- **Unique testid enforcement:** Strict-mode violations from duplicate `data-testid` values across page and modal (log 38) suggest a naming convention is needed — e.g., prefix testids with component name (`modal-technician-select` vs `detail-technician-select`).
- **Seed data idempotency:** Always call `truncateAllTables()` before `seedDatabase()` to prevent duplicate key errors on re-runs (log 68).

### `skills/review/reportTestFailures.md`
- **Consider adding a "Replay Unnecessary" field** — Currently there's no structured way to capture when Replay was used but wasn't needed. The "Debugging efficiency" metric in Summary Statistics attempts this but relies on subjective judgment. A per-failure `REPLAY_NECESSARY: yes/no` field would make this more systematic.
- **Add ROOT_CAUSE_CLUSTER summary to synthesis** — The template defines ROOT_CAUSE_CLUSTER but the synthesis instructions don't call for a cluster summary table. Adding one would highlight systemic issues (e.g., the FK constraint pattern appeared in 2 separate logs).
