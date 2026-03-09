# Test Failures Report: app-building-jl45v9-20260307-114114

**App:** MedScript (med-script) -- Prescription Manager for Medical/Family Practice
**Date:** 2026-03-07
**Worker:** app-building-jl45v9

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 80 |
| Logs with test failures | 10 |
| Logs without test failures | 70 |
| Total distinct test failure entries | 11 |
| Total affected tests | 26 |
| Replay usage rate (all failures) | 36.4% (4/11) |
| Replay usage rate (debugged failures) | 40.0% (4/10) |
| Debugging success rate | 100% (10/10) |
| Replay-assisted success rate | 100% (4/4) |
| Recording availability rate | 90.9% (10/11) |
| Debugging efficiency (Replay used but unnecessary) | 50% (2/4) |
| Cascading fixes | 3 (fixing 15 tests total via single changesets) |
| Self-inflicted failures | 0 (0%) |
| Total test re-runs across all logs | 16 |
| Unique root causes | 11 (3 clusters + 8 unclustered) |
| Fix reuse rate | 0 (no fix pattern applied to multiple spec files) |
| Infrastructure failure events | 1 (16 tests affected) |
| Test Isolation Score | 27.3% (3/11: 2 strict-mode + 1 seed-data-mismatch) |

**Failure phase distribution:**

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 10 | 90.9% |
| checkDirectives | 1 | 9.1% |

**Failure resolution type distribution:**

| Resolution Type | Count | % of Total |
|----------------|-------|-----------|
| test-code | 7 | 63.6% |
| app-code | 1 | 9.1% |
| both | 2 | 18.2% |
| none | 1 | 9.1% |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| 45 | jl45v9/med-script | Cluster: med-script-netlify-404 (11 tests) | backend-bug | yes | yes | | yes | ConsoleMessages + NetworkRequest to find 404s | ConsoleMessages, NetworkRequest | yes | none |
| 51 | jl45v9/med-script | Log table displays Schedule classification correctly | test-bug | yes | no | diagnosed from error output | yes | | | yes | pending |
| 53 | jl45v9/med-script | Discontinuing a medication decreases Active Medications count | race-condition | yes | no | diagnosed from error output | yes | | | yes | pending |
| 54 | jl45v9/med-script | Cluster: strict-mode-medication-row-filter (2 tests) | strict-mode | yes | no | diagnosed from error output | yes | | | yes | 584ff72 |
| 56 | jl45v9/med-script | Cluster: ambiguous-search-term (2 tests) | test-bug | yes | no | diagnosed from error output | yes | | | yes | f6f5f31 |
| 57 | jl45v9/med-script | Patient table shows empty state when no patients exist | backend-bug | yes | yes | | yes | PlaywrightSteps + Screenshot + NetworkRequest | PlaywrightSteps, Screenshot, NetworkRequest | yes | pending |
| 61 | jl45v9/med-script | Add Provider saves new provider successfully | race-condition | yes | no | diagnosed from error output | yes | | | yes | none |
| 61 | jl45v9/med-script | Remove Provider confirmed deletes provider | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest to find 500 | PlaywrightSteps, NetworkRequest | yes | none |
| 62 | jl45v9/med-script | All tab shows all refill requests regardless of status | race-condition | yes | yes | | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | yes | af15fa4 |
| 63 | jl45v9/med-script | Refill request list shows status badges | strict-mode | yes | no | diagnosed from error output | yes | | | yes | 5ccc9f4 |
| 73 | jl45v9/med-script | Cluster: pre-existing-prescription-data (4 tests) | seed-data-mismatch | yes | no | pre-existing and out of scope | no | | | no | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|-----------|
| med-script-netlify-404 | 11 tests | 45 | Fixed -- netlify.toml `base` setting prevented function discovery; also fixed schema.ts auto-run, fixtures.ts ESM __dirname, .env setup |
| strict-mode-medication-row-filter | 2 tests | 54 | Fixed -- added name column filter to disambiguate medication rows |
| ambiguous-search-term | 2 tests | 56 | Fixed -- changed search term from "John" to "John Smith" to avoid matching "Johnson" |
| pre-existing-prescription-data | 4 tests | 73 | Unresolved -- seed data mismatch for prescription dashboard tests; skipped as out of scope during checkDirectives |

### Infrastructure Failures

| Log | Category | Affected Tests | Notes |
|-----|----------|---------------|-------|
| 73 | network-error | 16 (all in prescription-dashboard.spec.ts) | Dev server not running; agent started netlify dev and re-ran |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| backend-bug | 3 | 27.3% |
| race-condition | 3 | 27.3% |
| test-bug | 2 | 18.2% |
| strict-mode | 2 | 18.2% |
| seed-data-mismatch | 1 | 9.1% |

### When Replay Was Most Effective

Replay was used on 4 of 11 failures (36.4%) and was genuinely necessary for 2 of those 4 (50%):

1. **Backend-bug with 404s (Log 45):** Replay's `ConsoleMessages` and `NetworkRequest` tools were essential to identify that API calls returned 404 due to netlify.toml `base` config preventing function discovery. Error output alone showed "0 rows" but didn't reveal the HTTP 404 root cause.

2. **FK constraint on provider delete (Log 61):** Replay's `NetworkRequest` identified a 500 error from the DELETE endpoint caused by foreign key constraint violations across 3 tables. The error output only showed a timeout, not the underlying API failure.

### When Replay Was NOT Used and Why

7 of 11 failures (63.6%) were diagnosed without Replay:
- **6 failures:** "diagnosed from error output" -- Playwright error messages were sufficiently descriptive (strict mode violations show element counts, race conditions show expected vs. received counts, test bugs show assertion mismatches)
- **1 failure:** "pre-existing and out of scope" -- seed-data-mismatch cluster was not debugged during the checkDirectives task

### When Replay Was Used but Unnecessary

2 of 4 Replay uses (50%) were not strictly necessary:
- **Log 57 (patient empty state):** Replay confirmed DELETE requests weren't working, but the error output showing "patients still visible after delete" combined with the FK constraint pattern (same as Log 61) could have been diagnosed from output alone.
- **Log 62 (refill request race condition):** Replay confirmed the container loaded before data populated, but the classic `toHaveCount expected N, received 0` pattern is a well-known race condition diagnosable from output.

### Common Debugging Strategies That Worked

1. **PlaywrightSteps + NetworkRequest:** Used to trace test execution flow and inspect API responses (Logs 57, 61). Effective for backend bugs where the UI looks correct but API calls fail silently.
2. **Error output pattern matching:** Race conditions (expected N, received 0) and strict-mode violations (resolved to N elements) were consistently diagnosable from Playwright error output alone.
3. **Single-fix cascading resolution:** The netlify-404 fix in Log 45 resolved all 11 tests in the spec file simultaneously by fixing the root infrastructure issue.

### Common Debugging Strategies That Failed

No debugging strategies failed outright. All 10 debugged failures were resolved successfully. The only unresolved failure cluster (pre-existing-prescription-data) was intentionally skipped, not a debugging failure.

### Self-Inflicted Failure Rate

**0%** -- No failures were caused by the agent's own fix attempts. All 11 failures were pre-existing issues in the initially generated test code or app code. This indicates high fix quality during this session.

### Notable Observations

- **100% pre-existing failures:** Every failure was pre-existing, meaning the initial writeTests and writeApp phases produced code with latent bugs that were only discovered during fixTests.
- **63.6% test-code fixes:** The majority of failures required only test code changes, indicating the app code was generally correct but tests had issues with selectors, race conditions, and ambiguous queries.
- **Backend FK constraints were a recurring theme:** 3 of 11 failures (27.3%) were backend-bug category, and 2 of those involved foreign key constraint violations on DELETE operations. This pattern (Log 45 netlify config, Log 57 patient delete, Log 61 provider delete) suggests the initial writeApp phase doesn't adequately handle cascading deletes.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "race-condition: count-before-load"** -- When a test captures element count immediately after navigation/container visibility but before async data loads, the fix is to use `waitFor` or assert with `toHaveCount` with a timeout. This pattern appeared in Logs 53, 61, and 62.
- **Add pattern: "backend-bug: FK constraint on delete"** -- When DELETE endpoints return 500, check for foreign key constraints in related tables. Fix with `ON DELETE CASCADE` in schema and/or cascading deletes in the endpoint. This appeared in Logs 57 and 61.
- **Add guidance: "Skip Replay for strict-mode and race-condition categories"** -- Error output is consistently sufficient for these categories. Reserve Replay for backend-bug and infrastructure failures where the HTTP response or server-side behavior is opaque.

### `skills/tasks/build/testing.md`

- **Add FK constraint check to writeApp phase:** Before writing tests, verify that all DELETE endpoints handle foreign key constraints (either via `ON DELETE CASCADE` or explicit cascading deletes). This would have prevented 2 of 11 failures.
- **Add strict-mode awareness to writeTests phase:** Tests should use filtered locators (e.g., `getByRole('row').filter({ hasText: 'unique-value' })`) by default rather than broad `getByTestId` when multiple matching elements could exist. This would have prevented 2 of 11 failures.
- **Add race-condition guard to writeTests template:** All tests that count elements after navigation should use `waitFor` with a minimum count assertion before capturing `initialCount`. This would have prevented 3 of 11 failures.

### `skills/review/reportTestFailures.md`

- **Consider adding a "Pre-existing Rate" metric** to Summary Statistics. In this report 100% of failures were pre-existing, which is a useful signal about writeTests/writeApp quality that the current template captures per-failure but doesn't aggregate.
- **Clarify CASCADING_FIX_COUNT semantics:** Log 45 used `CASCADING_FIX_COUNT: 4` to mean "4 distinct issues fixed" rather than "4 tests fixed by one changeset." The template says "number of distinct test failures resolved by this changeset" but the cluster already had 11 tests. Consider distinguishing between "issues fixed" and "tests unblocked."
- **The DEBUGGING_SUCCESSFUL field was missing from some cluster entries** (Log 54, 56) while present in individual entries. The cluster template should explicitly include this field.
