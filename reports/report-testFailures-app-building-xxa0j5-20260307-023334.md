# Test Failures Report: app-building-xxa0j5

**Generated:** 2026-03-07
**App:** Mechanic Estimator Pro (mechanic-estimator)
**Branch:** app-building-xxa0j5

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 133 |
| Logs with test failures | 15 |
| Logs without test failures | 118 |
| Total distinct test failure entries | 18 |
| Total affected tests | 34 |
| Replay usage rate | 50.0% (9/18) |
| Replay usage rate among debugged failures | 56.3% (9/16) |
| Debugging success rate | 93.8% (15/16 — 14 successful + 1 partial) |
| Replay-assisted success rate | 100% (9/9 successful+partial among Replay-used) |
| Recording availability rate | 100% (18/18) |
| Debugging efficiency (Replay used but unnecessary) | 66.7% (6/9 — error output alone would have sufficed) |
| Cascading fixes | 7 (single changes resolving multiple test failures) |
| Self-inflicted failures | 2 (11.1% of all failures) |
| Total test re-runs across all logs | 21 |
| Unique root causes | 15 (7 distinct clusters + 8 unclustered) |
| Fix reuse rate | 1 reused fix pattern (destructive-test-reordering applied across 3 spec files) |
| Failure phase distribution | fixTests: 18 (100%) |
| Failure resolution type distribution | test-code: 12, app-code: 3, both: 3, none: 0 |
| Test Isolation Score | 61.1% (11/18 — data-contamination: 8 + seed-data-mismatch: 3) |
| Infrastructure failure events | 0 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------:|-------|---------|-----------|
| worker-61 | xxa0j5/mechanic-estimator | Edit Customer modal can be cancelled without saving | data-contamination | yes | no | diagnosed from error output | yes | — | — | — | none |
| worker-76 | xxa0j5/mechanic-estimator | Revision entry is displayed after edit | seed-data-mismatch | yes | yes | — | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest, ConsoleMessages | yes | 2fef61a |
| worker-76 | xxa0j5/mechanic-estimator | History entries are in chronological order | seed-data-mismatch | yes | yes | — | yes | Page snapshot + seed data inspection | PlaywrightSteps, NetworkRequest | yes | 2fef61a |
| worker-79 | xxa0j5/mechanic-estimator | Labor line rate defaults to shop rate | race-condition | yes | yes | — | yes | PlaywrightSteps + NetworkRequest timing | PlaywrightSteps, NetworkRequest | yes | 4b0c879 |
| worker-81 | xxa0j5/mechanic-estimator | Click Add Labor adds a labor line form | race-condition | yes | no | diagnosed from error output (expected 105 vs received 95) | yes | — | — | yes | b60c9b9 |
| worker-82 | xxa0j5/mechanic-estimator | Notes are saved with the estimate | backend-bug | yes | yes | — | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 3db06ef |
| worker-83 | xxa0j5/mechanic-estimator | vehicle-id-not-null cluster (3 tests) | backend-bug | yes | yes | — | yes | NetworkRequest to inspect API response | NetworkRequest | partial | none |
| worker-83 | xxa0j5/mechanic-estimator | Nested sql template serialization | backend-bug | yes | no | diagnosed from error output after first fix | yes | — | — | yes | none |
| worker-89 | xxa0j5/mechanic-estimator | destructive-test-ordering cluster (6 tests) | data-contamination | yes | yes | — | yes | Screenshot at multiple test points | PlaywrightSteps, Screenshot | yes | none |
| worker-93 | xxa0j5/mechanic-estimator | payment-method-first-vs-last cluster (2 tests) | data-contamination | yes | no | diagnosed from error output (Expected/Received mismatch) | yes | — | — | yes | none |
| worker-95 | xxa0j5/mechanic-estimator | shared-db-state-test-ordering cluster (6 tests) | data-contamination | yes | yes | — | yes | Screenshot + PlaywrightSteps | Screenshot, PlaywrightSteps | yes | none |
| worker-98 | xxa0j5/mechanic-estimator | Due on Receipt sets due date to issue date | other (test-bug) | yes | no | straightforward -0 vs 0 floating-point issue in error output | yes | — | — | — | fad8fb3 |
| worker-101 | xxa0j5/mechanic-estimator | destructive-test-ordering cluster (5 tests) | data-contamination | yes | yes | — | yes | NetworkRequest + PlaywrightSteps | NetworkRequest, PlaywrightSteps | yes | none |
| worker-102 | xxa0j5/mechanic-estimator | Settings pre-fills fields with current values | seed-data-mismatch | yes | no | diagnosed from error output (105 vs 105.00) | yes | — | — | yes | none |
| worker-103 | xxa0j5/mechanic-estimator | Edit shop name | data-contamination | yes | yes | — | yes | NetworkRequest + PlaywrightSteps | NetworkRequest, PlaywrightSteps | yes | 4b10de2 |
| worker-117 | xxa0j5/mechanic-estimator | Table displays all columns | race-condition | no | no | test structure issue diagnosed from log output | yes | — | — | yes | none |
| worker-123 | xxa0j5/mechanic-estimator | edit-customer-failures cluster (2 tests) | data-contamination | yes | no | diagnosed from error messages in test output | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| seed-data-timestamps | 2 tests | worker-76 | Fixed seed data to use explicit timestamps; single commit (2fef61a) resolved both |
| vehicle-id-not-null | 3 tests | worker-83 | Fixed backend to handle nullable vehicle_id; resolved 3 test failures |
| nested-sql-template | 1 test | worker-83 | Fixed nested sql template literal serialization in estimates backend |
| destructive-test-ordering | 11 tests | worker-89, worker-101 | Moved destructive tests to end of describe blocks or separate serial wrappers |
| payment-method-first-vs-last | 2 tests | worker-93 | Changed `.first()` to `.last()` locator to find most recently created payment |
| shared-db-state-test-ordering | 6 tests | worker-95 | Reordered tests using `test.describe.serial` — non-destructive first, destructive last |
| edit-customer-failures | 2 tests | worker-123 | Fixed header text stripping to account for Delete button; added email-based fallback |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 8 | 44.4% |
| seed-data-mismatch | 3 | 16.7% |
| race-condition | 3 | 16.7% |
| backend-bug | 3 | 16.7% |
| other (test-bug) | 1 | 5.6% |

### When Replay Was Most Effective

Replay was genuinely necessary in 3 of 9 uses (33.3%):
- **seed-data-timestamps (worker-76):** NetworkRequest revealed that PUT requests returned 500 errors and that timestamp ordering in seed data was incorrect — not obvious from test output alone.
- **race-condition (worker-79):** NetworkRequest timing analysis revealed the settings API response arrived 85ms after the Add Labor button click, causing a fallback to the hardcoded default. The timing dimension was not visible in test output.
- **data-contamination (worker-103):** NetworkRequest revealed the settings API returned null values because a prior test cleared them — the error output only showed "expected X, received empty" without explaining why.

### When Replay Was NOT Used and Why

In 9 of 18 failures (50%), Replay was not used:
- **6 cases:** Error output clearly indicated the root cause (expected vs received values, constraint violation messages, floating-point -0 vs 0)
- **2 cases:** Test structure issues diagnosed from log output (Playwright serial block ordering, header text parsing)
- **1 case:** Debugging was not attempted (W61 — error message made root cause obvious)

The agent consistently made good judgments about when Replay was unnecessary. Error messages containing expected/received mismatches or SQL constraint violations were reliably diagnosed without recordings.

### Common Debugging Strategies That Worked

1. **PlaywrightSteps + NetworkRequest** (most common): Used to trace test execution and inspect API response bodies/status codes. Effective for backend bugs and race conditions.
2. **Screenshot at test failure points**: Used to verify page state (empty tables, missing buttons). Effective for data contamination issues.
3. **Error output analysis**: Direct diagnosis from test failure messages. Fastest approach, used successfully for 9/18 failures without Replay.

### Common Debugging Strategies That Failed

- **Adding longer timeouts** (worker-103): The agent first tried increasing timeout before using Replay to discover the real issue (null API values from data contamination). Timeouts are rarely the actual root cause.

### Self-Inflicted Failure Rate

**2 of 18 failures (11.1%) were self-inflicted** — a low rate indicating good fix quality:
- Worker 61: Test wrote hardcoded expected value that didn't account for prior test's DB mutations
- Worker 117: Refactored test structure (adding separate describe blocks) caused Playwright serial block ordering issue

Both were test-code issues resolved quickly (1-2 iterations).

### Test Isolation Issues

**Test Isolation Score: 61.1%** (data-contamination + seed-data-mismatch = 11 of 18 failures)

This exceeds the 50% threshold, indicating test isolation is the dominant failure mode.

**Affected spec files:**
- `estimates-list-table.spec.ts` — destructive "delete all" test ran before data-dependent tests
- `invoices-list-table.spec.ts` — same pattern as above
- `invoice-detail-payment-recording.spec.ts` — first test paid invoice in full, hiding Record Payment button for subsequent tests
- `invoice-detail-payment-display.spec.ts` — `.first()` locator matched stale payment from prior test
- `customer-detail-edit-customer.spec.ts` — prior test renamed customer, breaking hardcoded name assertions
- `settings-shop-info.spec.ts` — prior test cleared settings, breaking subsequent seed-value assertions
- `settings-default-rates.spec.ts` — Postgres NUMERIC format (105.00) vs expected (105)
- `estimate-detail-revision-history.spec.ts` — seed data timestamps defaulted to NOW() instead of explicit values

**Root cause pattern:** The database is seeded once per spec file, not per test. Tests that mutate shared state (deleting records, updating settings, recording payments) corrupt the environment for subsequent tests in the same file.

**Isolation strategies that would have prevented these failures:**
1. **Destructive test reordering** — already applied as a fix pattern in 3 spec files. Should be a writeTests directive.
2. **Per-test data isolation** — `beforeEach` hooks that restore seed state, or using `test.describe.serial` with explicit ordering.
3. **Dynamic assertions** — capturing current state before asserting (e.g., reading header text dynamically rather than hardcoding expected values).

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "Check error output first"** — In 50% of failures, Replay was unnecessary because the error output contained sufficient diagnostic information (expected/received mismatches, SQL constraint violations, HTTP status codes). Add a triage step: "Before launching Replay, check if the test failure message contains an expected-vs-received comparison or a clear error string. If so, diagnose directly."
- **Add pattern: "NetworkRequest for API timing"** — When the error suggests a default/fallback value was used instead of an API-provided value, use `PlaywrightSteps` to check timing of button clicks relative to API responses via `NetworkRequest`. This was the key insight for the race-condition fixes.

### `skills/tasks/build/testing.md`

- **Add directive: destructive tests must be last** — Tests that delete all records or fully consume a resource (e.g., paying an invoice in full) must be placed in a `test.describe.serial` block at the end of the spec file. This was the single most common failure pattern (3 spec files, 17 affected tests).
- **Add directive: avoid hardcoded seed values in assertions** — Tests should capture current state dynamically (e.g., reading the current customer name from the page) rather than hardcoding seed data values. This prevents data-contamination failures when test ordering changes or prior tests mutate state.
- **Add directive: use `.last()` for newly-created records** — When a test creates a record (payment, line item) and then asserts on it, use `.last()` not `.first()` since prior tests may have created similar records in the same spec run.
- **Add directive: explicit timestamps in seed data** — Seed data should use explicit timestamps rather than `NOW()` or `NOW() - INTERVAL` to ensure deterministic ordering. This prevents seed-data-mismatch failures.

### `skills/review/reportTestFailures.md`

- **Add "test-bug" to FAILURE_CATEGORY enum** — Worker 98 used "test-bug" for a floating-point comparison issue that doesn't fit neatly into existing categories. Consider adding it or clarifying that such issues fall under "other".
- **Normalize FAILURE_PHASE values** — Worker 98 used "assertion" instead of a standard value. The template should clarify that all test-fixing phase failures use "fixTests" regardless of whether the failure is in setup, execution, or assertion.
- **Normalize FAILURE_RESOLUTION_TYPE values** — Worker 98 used "test-fix" instead of "test-code". The template should enumerate allowed values more prominently.
