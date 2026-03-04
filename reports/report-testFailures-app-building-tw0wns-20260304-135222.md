# Test Failures Report: app-building-tw0wns — 2026-03-04

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 133 |
| Logs with test failures | 18 |
| Logs without test failures | 115 |
| Total distinct test failures | 47 |
| Total failure entries (clusters counted once) | 35 |
| Replay usage rate (entries) | 20/35 (57.1%) |
| Replay usage rate among debugged failures | 20/34 (58.8%) |
| Debugging success rate | 34/34 (100%) |
| Replay-assisted success rate | 20/20 (100%) |
| Recording availability rate | 30/35 (85.7%) |
| Total test re-runs across all logs | 28 |

**Notes:**
- Two workers were active: **tw0wns** (106 logs, building NoteBoard — a music studio management app) and **gu9tow** (27 logs, building a todo app).
- 115 of 133 logs had zero test failures (mostly planning, code generation, test writing, deployment, and directive-compliance tasks).
- All 5 gu9tow failures had no recordings available (infrastructure/setup issues during first test runs).
- All debugging attempts that were made succeeded (100% success rate). The one undebuggged failure (worker tw0wns-99) was a pre-existing timeout skipped as out of scope.

## 2. Failure Table

| Log | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|
| gu9tow-20 | Modal opens with all fields pre-filled | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| gu9tow-20 | Set due date | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| gu9tow-20 | Clear existing due date | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| gu9tow-20 | Save all changes | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| gu9tow-22 | New todo appears at the top of the list | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | none |
| tw0wns-37 | Student dropdown is searchable and lists active students | seed-data-mismatch | no | yes | | yes | PlaywrightSteps → NetworkRequest to inspect students API | PlaywrightSteps, NetworkRequest | yes | none |
| tw0wns-37 | Successfully creating a lesson adds it to the calendar | backend-bug | yes | yes | | yes | NetworkRequest to inspect lessons API response format | PlaywrightSteps, NetworkRequest | yes | none |
| tw0wns-38 | Edit Instructor modal opens pre-filled with current instructor data | backend-bug | yes | yes | | yes | NetworkRequest to inspect PUT request/response | NetworkRequest | yes | none |
| tw0wns-38 | Edit Instructor modal updates bio | backend-bug | yes | yes | | yes | NetworkRequest to compare PUT body with expected values | NetworkRequest | yes | none |
| tw0wns-38 | Edit Instructor modal successfully updates instructor details | backend-bug | yes | no | root cause already identified from previous failures | yes | — | — | yes | none |
| tw0wns-38 | Edit Instructor modal updates instruments | backend-bug | yes | no | same root cause as modal form reset | yes | — | — | yes | none |
| tw0wns-38 | Edit Instructor modal instrument changes update Instructors list page | timeout | yes | no | same instrument selection issue | yes | — | — | yes | none |
| tw0wns-44 | Search bar shows no results state | backend-bug | yes | yes | | yes | NetworkRequest to inspect API call ordering | PlaywrightSteps, InspectElement, NetworkRequest | yes | aaf7976 |
| tw0wns-45 | **Cluster: iso-date-parsing** (6 tests) | backend-bug | yes | yes | | yes | NetworkRequest to check API response format | PlaywrightSteps, NetworkRequest | yes | none |
| tw0wns-45 | **Cluster: seed-data-mismatch** (3 tests) | seed-data-mismatch | yes | no | diagnosed from seed data analysis | yes | — | — | yes | none |
| tw0wns-46 | **Cluster: fixture-data-conflict** (6 tests) | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps, NetworkRequest, Screenshot, Evaluate + multiple iterations | PlaywrightSteps, NetworkRequest, Screenshot, SearchSources, ConsoleMessages, ListSources, ReadSource, Logpoint, Evaluate, InspectElement | yes | cb04e5c |
| tw0wns-46 | Edit button opens an edit form pre-filled with lesson data | missing-testid | yes | no | diagnosed from error output | yes | — | — | yes | cb04e5c |
| tw0wns-46 | **Cluster: time-collision** (2 tests) | seed-data-mismatch | yes | no | diagnosed from error output | yes | — | — | yes | cb04e5c |
| tw0wns-47 | AddProgramModal validates Lesson Rate is a positive number | backend-bug | yes | yes | | yes | PlaywrightSteps, NetworkRequest, Screenshot, Evaluate | PlaywrightSteps, NetworkRequest, Screenshot, Evaluate | yes | none |
| tw0wns-50 | Programs list table shows correct active student counts | seed-data-mismatch | yes | no | diagnosed from error output | yes | — | — | yes | none |
| tw0wns-51 | Recent activity feed is in reverse chronological order | data-contamination | yes | yes | | yes | PlaywrightSteps, InspectElement, Evaluate | PlaywrightSteps, InspectElement, Evaluate | yes | none |
| tw0wns-51 | Recent activity limits displayed entries | data-contamination | yes | yes | | yes | Leveraged prior Replay analysis | PlaywrightSteps | yes | none |
| tw0wns-52 | AddRoomModal validates Capacity is a positive integer | backend-bug | yes | yes | | yes | PlaywrightSteps, SearchSources to verify handleSubmit had 0 hits | PlaywrightSteps, SearchSources | yes | none |
| tw0wns-54 | EditRoomModal validates Capacity is a positive integer | backend-bug | yes | yes | | yes | Confirmed same pattern as AddRoomModal | PlaywrightSteps | yes | none |
| tw0wns-54 | EditRoomModal can change status from Unavailable to Available | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| tw0wns-56 | Filtering by instructor shows only that instructor's lessons | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps + seed data analysis | PlaywrightSteps | yes | none |
| tw0wns-60 | Enrollment info displays enrollment date | backend-bug | no | yes | | yes | NetworkRequest to inspect API response | NetworkRequest | yes | none |
| tw0wns-62 | Student list table shows empty state | seed-data-mismatch | no | yes | | yes | PlaywrightSteps, NetworkRequest to check soft-delete | PlaywrightSteps, NetworkRequest | yes | none |
| tw0wns-64 | Search bar shows no results state | backend-bug | no | yes | | yes | PlaywrightSteps, NetworkRequest, Logpoint, Evaluate — traced fetch race | PlaywrightSteps, NetworkRequest, InspectElement, ConsoleMessages, Screenshot, SearchSources, ReadSource, Logpoint, Evaluate, DescribePoint | yes | none |
| tw0wns-64 | Search bar works in combination with status filter | strict-mode | no | yes | | yes | Replay confirmed DOM structure | PlaywrightSteps | yes | none |
| tw0wns-65 | **Cluster: active-inactive-substring-match** (3 tests) | strict-mode | no | no | diagnosed from error output — strict mode message clear | yes | — | — | yes | none |
| tw0wns-99 | Edit Student modal changes reflect on Students list page | timeout | yes | no | pre-existing, diagnosed by reverting changes | yes | — | — | no | none |

## 3. Patterns

### When Replay Was Most Effective

- **Backend bugs with non-obvious root causes** — Replay excelled at diagnosing race conditions (stale-fetch-race-condition in tw0wns-64), API response format mismatches (iso-date-parsing cluster in tw0wns-45), and backend handler bugs (put-api-nulls-fields in tw0wns-38). These required inspecting actual network responses and component state at runtime.
- **Seed data mismatches requiring API inspection** — When test expectations didn't match actual database state, NetworkRequest was the fastest path to understanding the discrepancy (tw0wns-37, tw0wns-46, tw0wns-62).
- **Most effective tool sequences:**
  1. `PlaywrightSteps → NetworkRequest` — the dominant pattern (used in 10+ failures). Identifies the failing step, then inspects the API layer.
  2. `PlaywrightSteps → InspectElement → Evaluate` — for DOM/state debugging (tw0wns-51).
  3. `PlaywrightSteps → NetworkRequest → Screenshot → Evaluate` — heavy-duty debugging for complex multi-step failures (tw0wns-46, tw0wns-47).

### When Replay Was NOT Used and Why

| Reason | Count (entries) |
|---|---|
| Diagnosed from error output alone | 9 |
| Root cause already identified from a prior failure | 3 |
| No recording available | 5 |
| Pre-existing, out of scope | 1 |

- **Error output was sufficient** in 9/15 non-Replay entries. Strict-mode violations, clear assertion mismatches (expected "1" got "2"), and missing test-id errors have self-explanatory Playwright output.
- **All 5 gu9tow failures** lacked recordings due to infrastructure setup (first-time env issues). Once infrastructure was stable, all tests were diagnosed from error output (date format mismatches).
- **3 entries** in tw0wns-38 reused root cause analysis from earlier failures in the same log — efficient deduplication.

### Common Debugging Strategies That Worked

1. **NetworkRequest-first debugging** — Checking API responses immediately narrows root cause to backend vs frontend. Used successfully in 12+ entries.
2. **Cluster deduplication** — When multiple failures shared a root cause (e.g., date parsing, modal form reset), fixing one fixed all. The agent correctly identified clusters and avoided redundant debugging.
3. **Error output triage** — For strict-mode and missing-testid failures, the Playwright error message alone was sufficient. Not using Replay here was the correct decision.

### Common Debugging Strategies That Failed

- No debugging strategies failed in this report. All 34 attempted debugging efforts succeeded. The one unresolved failure (tw0wns-99, timeout) was correctly identified as pre-existing and skipped.

### Recurring Failure Categories

| Category | Failure Count | % of Total |
|---|---|---|
| backend-bug | 22 | 46.8% |
| seed-data-mismatch | 14 | 29.8% |
| strict-mode | 6 | 12.8% |
| data-contamination | 3 | 6.4% |
| timeout | 2 | 4.3% |
| missing-testid | 1 | 2.1% |

- **Backend bugs** dominated (47%), often involving date format mismatches (ISO strings not parsed), PUT handlers nullifying fields, form validation blocked by native browser behavior, and race conditions in fetch calls.
- **Seed data mismatches** (30%) were the second most common — test expectations not matching actual fixture data counts or relationships. These are inherently a test-writing quality issue.
- **Strict-mode violations** (13%) occurred when Playwright's strict mode found multiple matching elements (e.g., "Active" matching both "Active" and "Inactive" text).

## 4. Recommendations

### `skills/debugging/*.md`

- **Add a "NetworkRequest-first" pattern**: For any test failure involving data assertions, check the API response first via `mcp__replay__NetworkRequest`. This was the single most productive debugging step across all failures.
- **Add date format debugging pattern**: ISO date string mismatches (timestamps vs YYYY-MM-DD) were a recurring root cause. Add a checklist: verify API returns the expected format, check component parsing logic, verify date inputs use `YYYY-MM-DD` format.
- **Add race condition debugging pattern**: Document the `NetworkRequest → Logpoint → Evaluate` sequence for diagnosing stale-fetch/race-condition bugs. Two separate failures required tracing fetch ordering.
- **Add cluster-aware debugging**: When 3+ failures share a spec file, check for a shared root cause before debugging individually. This saves significant time.

### `skills/tasks/build/testing.md`

- **Seed data validation step**: Before writing tests, verify test expectations against actual seed data counts. 30% of failures were seed-data-mismatch — tests assumed wrong counts or relationships.
- **Form validation awareness**: When building forms with custom validation, always add `noValidate` to the `<form>` element to prevent native browser validation from blocking custom logic. This caused failures in both AddRoomModal and AddProgramModal.
- **Date handling standard**: Establish a convention for date handling — components should always format dates from ISO timestamps and date inputs should always use `YYYY-MM-DD`. This was a recurring backend-bug pattern.
- **Strict-mode-safe selectors**: When filtering by status values like "Active"/"Inactive", use exact text matching (e.g., `getByRole('option', { name: /^Active$/ })`) to avoid substring collisions.
- **Test isolation**: Ensure tests don't leak state. The data-contamination failures (3 total) were caused by race conditions with prior tests' API calls.

### `skills/review/reportTestFailures.md`

- **Add a "Worker" column to distinguish multi-worker reports**: This report covered two workers building different apps. Adding a worker/app column would improve readability.
- **Consider a "Debugging Efficiency" metric**: Track whether Replay was used when a recording was available but error output alone would have sufficed. This would help optimize when to reach for Replay vs when to trust error output.
- **Track "cascading fix" patterns**: When one fix resolves multiple failures, this is valuable signal. The current template captures ROOT_CAUSE_CLUSTER but doesn't explicitly track how many test failures a single code change resolved.
