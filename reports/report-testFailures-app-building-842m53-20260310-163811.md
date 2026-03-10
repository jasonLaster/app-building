# Test Failures Report: app-building-842m53

**Generated:** 2026-03-10
**App:** moving-concierge

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 78 |
| Logs with test failures | 10 |
| Logs without test failures | 68 |
| Total distinct test failures | 12 |
| Total affected tests | 37 |
| Replay usage rate | 33.3% (4 / 12) |
| Replay usage rate among debugged failures | 33.3% (4 / 12) |
| Debugging success rate | 100.0% (12 / 12) |
| Replay-assisted success rate | 100.0% (4 / 4) |
| Recording availability rate | 83.3% (10 / 12) |
| Debugging efficiency (Replay used, error output would have sufficed) | 3 of 4 Replay uses (75.0%) |
| Cascading fixes (single change fixing multiple failures) | 6 |
| Self-inflicted failures | 6 (50.0%) |
| Total test re-runs across all logs | 12 |
| Unique root causes | 12 (6 clusters + 6 unclustered) |
| Fix reuse rate | 0 (no fix pattern applied across multiple spec files) |
| Pre-existing failure rate | 50.0% (6 / 12) |
| Replay decision quality (REPLAY_NECESSARY=no among REPLAY_USED=yes) | 75.0% (3 / 4) |
| Test Isolation Score | 50.0% (6 / 12: 4 data-contamination + 1 strict-mode + 1 seed-data-mismatch) |
| Infrastructure failure events | 1 event, 1 affected test (recording-upload-failure) |

**Failure phase distribution:**

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 9 | 75.0% |
| other (JourneyQA) | 3 | 25.0% |

**Failure resolution type distribution:**

| Resolution Type | Count | % of Total |
|-----------------|-------|------------|
| test-code | 9 | 75.0% |
| app-code | 1 | 8.3% |
| both | 2 | 16.7% |
| none | 0 | 0.0% |

**Diagnostic source effectiveness (among resolved failures):**

| Source | Count | % of Total |
|--------|-------|------------|
| error-output | 11 | 91.7% |
| replay-necessary | 1 | 8.3% |

**Self-inflicted fix quality cost:**

6 self-inflicted failures caused 6 total additional test re-runs (each resolved in 1 iteration).

**Fix iteration difficulty distribution:**

| Iterations | Count | Tests |
|------------|-------|-------|
| 1 | 11 | All except "Adding an item updates the catalog and summary" |
| 2 | 1 | Adding an item updates the catalog and summary |

No failures required 4+ iterations.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------|----|---------|-----------|
| worker-35 | 842m53 / moving-concierge | schema-cli-import (14 tests) | infrastructure | yes | no | error-output-sufficient | yes | — | — | yes | 7d26b06918 |
| worker-35 | 842m53 / moving-concierge | Edit item form loads existing item data | backend-bug | yes | yes | — | yes | NetworkRequest + code inspection | PlaywrightSteps, ConsoleMessages, Screenshot, UncaughtException, NetworkRequest | yes | 7d26b06918 |
| worker-36 | 842m53 / moving-concierge | mike-chen-data-contamination (2 tests) | data-contamination | no | no | error-output-sufficient | no | — | — | yes | 8068070fd8 |
| worker-37 | 842m53 / moving-concierge | — | — | — | — | — | — | — | — | — | — |
| worker-39 | 842m53 / moving-concierge | item-card-hasText-mismatch (2 tests) | strict-mode | no | yes | — | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot, NetworkRequest | yes | 18a5919df5 |
| worker-41 | 842m53 / moving-concierge | seed-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 04e5901b64 |
| worker-42 | 842m53 / moving-concierge | Adding an item updates the catalog and summary | missing-testid | yes | yes | — | yes | NetworkRequest + InspectElement | NetworkRequest, InspectElement | yes | 81eaeaded4 |
| worker-44 | 842m53 / moving-concierge | Click item navigates to Item Detail page | CSS/layout | yes | yes | — | yes | PlaywrightSteps + code inspection | PlaywrightSteps | yes | 852c5a3f38 |
| worker-45 | 842m53 / moving-concierge | destructive-test-ordering (7 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | e58ef88aaf |
| worker-50 | 842m53 / moving-concierge | netlify-functions-404 (4 tests) | infrastructure | no | no | error-output-sufficient | no | — | — | yes | d381ba5776 |
| worker-75 | 842m53 / moving-concierge | Weight field assertion | seed-data-mismatch | no | no | error-output-sufficient | yes | — | — | yes | none |
| worker-77 | 842m53 / moving-concierge | Find a Specific Project — row count mismatch | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | none |
| worker-77 | 842m53 / moving-concierge | Delete a Project — wrong test-id | missing-testid | no | no | error-output-sufficient | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| schema-cli-import | 14 tests | worker-35 | Resolved — guarded schema.ts main() with CLI entry point check (7d26b06918) |
| mike-chen-data-contamination | 2 tests | worker-36 | Resolved — tests set up their own data instead of relying on shared seed (8068070fd8) |
| item-card-hasText-mismatch | 2 tests | worker-39 | Resolved — switched from anchored regex `hasText` to child element locator (18a5919df5) |
| seed-data-contamination | 2 tests | worker-41 | Resolved — tests switched to use unmodified seed data (04e5901b64) |
| destructive-test-ordering | 7 tests | worker-45 | Resolved — moved destructive empty-state test to end of file in serial block (e58ef88aaf) |
| netlify-functions-404 | 4 tests | worker-50 | Resolved — added `--functions` flag to netlify dev command in test script (d381ba5776) |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 4 | 33.3% |
| infrastructure | 2 | 16.7% |
| missing-testid | 2 | 16.7% |
| strict-mode | 1 | 8.3% |
| backend-bug | 1 | 8.3% |
| CSS/layout | 1 | 8.3% |
| seed-data-mismatch | 1 | 8.3% |

### When was Replay most effective?

Replay was genuinely necessary in only 1 of 4 uses — the **backend-bug** case (Edit item form loads existing item data), where NetworkRequest revealed a URL parsing bug in the items API that wasn't obvious from error output alone. This was the only case where REPLAY_NECESSARY=yes.

### When was Replay NOT used and why?

Replay was not used in 8 of 12 failures. In all cases, the reason was **error-output-sufficient** — the error messages and test output clearly indicated the root cause without needing visual/runtime debugging. This was particularly true for:
- **Data contamination** (4 failures): Error messages showing missing elements or wrong counts directly pointed to data modification by prior tests
- **Infrastructure** (2 failures): Server logs and error messages clearly showed the configuration issue
- **Seed data mismatch** (1 failure): Expected vs actual values in test output immediately revealed the mismatch

### Common debugging strategies that worked

1. **Error output analysis**: The dominant and most effective strategy — 91.7% of failures were diagnosed from error output alone. Test frameworks provide sufficient context (expected vs actual, locator timeouts, server error messages) for most failure categories.
2. **Code inspection after error**: Reading test execution order to identify data contamination patterns (destructive tests before dependent tests).
3. **Destructive test reordering**: Moving destructive tests (those that delete all records) to the end of spec files in isolated serial blocks.
4. **Self-contained test data setup**: Making tests create their own data instead of relying on shared seed data.

### Common debugging strategies that failed

No debugging strategies failed in this session — all 12 failures were successfully resolved, most on the first iteration.

### Self-inflicted failure rate

**50.0%** of failures (6 / 12) were self-inflicted — introduced by the agent's own code during the current session. Breakdown:
- 3 data-contamination failures from tests that didn't properly isolate data
- 1 strict-mode failure from using overly-specific regex locators
- 1 infrastructure failure from misconfigured test script
- 1 seed-data-mismatch from incorrect test assertions

While 50% is at the boundary of concern, the saving grace is that all self-inflicted failures were resolved in 1 iteration each, so the total cost was modest (6 additional re-runs).

### Test Isolation Issues

Test isolation categories (data-contamination + strict-mode + seed-data-mismatch) account for exactly 50% of all failures (6/12). The dominant pattern is **data-contamination** (4 failures, 33.3%), with three sub-patterns:
- **Destructive ordering** (2 failures): Tests that delete all records run before dependent tests (destructive-test-ordering, mike-chen-data-contamination)
- **Accumulated data** (1 failure): Journey test data persisting across journey spec files sharing a database (Find a Specific Project)
- **Settings contamination** (1 failure): A test renaming a seed record causes downstream tests to fail (seed-data-contamination)

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: "Error output first"** — Document that 91.7% of failures in this session were diagnosed from error output alone. Recommend checking error output before reaching for Replay, especially for data-contamination, infrastructure, and missing-testid categories.
- **Add pattern: "Data contamination diagnosis"** — When tests fail with "element not found" or wrong counts, first check if a prior test in the same spec file modifies or deletes shared data.

### `skills/tasks/build/testing.md`
- **Enforce test data isolation**: Tests should create their own data via API setup rather than depending on shared seed data. This would have prevented 4 of 12 failures.
- **Destructive tests last**: Any test that deletes all records must be placed in a separate `test.describe.serial` block at the end of the spec file. Consider adding this as a directive check.
- **JourneyQA database isolation**: Journey tests sharing a database branch experience cross-spec contamination. Consider resetting seed data between journey specs or using per-spec database branches.
- **Validate test-ids before writing tests**: 2 failures were from wrong or colliding test-ids. Tests should verify the actual DOM test-ids (e.g., via component code inspection) before using them in locators.

### `skills/review/reportTestFailures.md`
- **Consider adding a "resolution effort" metric**: All failures in this session were resolved in 1-2 iterations, making the FIX_ITERATIONS distribution uninformative. Consider tracking wall-clock debugging time or number of tool calls as a complementary difficulty metric.
- **Clarify CSS/layout vs strict-mode boundary**: The "Click item navigates" failure was categorized as CSS/layout but shares the same root cause (anchored regex on composite text) as the strict-mode failure. Consider adding guidance on when locator matching issues are CSS/layout vs strict-mode.

## 5. Replay Fixes Table

### Fix 1: Edit item form loads existing item data

INITIAL_CHANGESET: 7d26b06918
FAILING_TEST: Edit item form loads existing item data
FINAL_CHANGESET: 7d26b06918
ASSESSMENT: Replay was genuinely necessary. NetworkRequest revealed the items API returned 400 because URL segment parsing used segments[3] assuming rewritten URL format, but Netlify dev passes the original URL where the ID is at segments[2]. Error output showed a generic failure without pinpointing the API parsing issue.

### Fix 2: item-card-hasText-mismatch (Large photo is displayed for the item)

INITIAL_CHANGESET: 18a5919df5
FAILING_TEST: Large photo is displayed for the item
FINAL_CHANGESET: 18a5919df5
ASSESSMENT: Replay was not strictly necessary. Error output showed a timeout on a locator with anchored regex `^Leather Sofa$`, which was sufficient to suspect text mismatch. Replay confirmed the card contained additional text (room + category) but the diagnosis was reachable from error output alone.

### Fix 3: Adding an item updates the catalog and summary

INITIAL_CHANGESET: 81eaeaded4
FAILING_TEST: Adding an item updates the catalog and summary
FINAL_CHANGESET: 81eaeaded4
ASSESSMENT: Replay was not strictly necessary. Error output showed 8 matches instead of expected 2 for `[data-testid^="item-card-"]`, which pointed to a testid prefix collision. Replay confirmed the API returned correct data, ruling out backend issues, but the selector collision was diagnosable from the error alone.

### Fix 4: Click item navigates to Item Detail page

INITIAL_CHANGESET: 852c5a3f38
FAILING_TEST: Click item navigates to Item Detail page
FINAL_CHANGESET: 852c5a3f38
ASSESSMENT: Replay was not strictly necessary. The timeout error on a locator with anchored regex was the same pattern as Fix 2. PlaywrightSteps confirmed the stuck step, but the root cause (regex anchor mismatch on composite element text) was diagnosable from error output and code inspection.
