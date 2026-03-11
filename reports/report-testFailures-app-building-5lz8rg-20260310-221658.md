# Test Failures Report: app-building-5lz8rg

**Generated**: 2026-03-11
**App**: realty-show (Open House & Showing Manager)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 97 |
| Logs with test failures | 10 |
| Logs without test failures | 87 |
| Total distinct test failures | 13 |
| Total affected tests | 46 |
| Replay usage rate | 15.4% (2/13) |
| Replay usage rate among debugged failures | 15.4% (2/13) |
| Debugging success rate | 100% (13/13) |
| Replay-assisted success rate | 100% (2/2) |
| Recording availability rate | 84.6% (11/13) |
| Debugging efficiency (Replay used but error output sufficed) | 100% (2/2) |
| Cascading fixes | 3 (changesets fixing multiple tests) |
| Self-inflicted failures | 1 (7.7%) |
| Total test re-runs across all logs | 19 |
| Unique root causes | 13 |
| Fix reuse rate | 0 (no FIX_PATTERN reused across spec files) |
| Pre-existing failure rate | 100% (13/13) |
| Replay decision quality | 100% unnecessary (2/2 REPLAY_NECESSARY=no) |
| Test Isolation Score | 46.2% (6/13 — data-contamination: 3, seed-data-mismatch: 3) |
| Self-inflicted fix quality cost | 1 additional re-run |
| Infrastructure failure events | 5 events (~45 affected tests) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|------------|
| fixTests | 12 | 92.3% |
| checkDirectives | 1 | 7.7% |

### Failure Resolution Type Distribution

| Type | Count | % of Total |
|------|-------|------------|
| test-code | 7 | 53.8% |
| app-code | 4 | 30.8% |
| both | 2 | 15.4% |
| none | 0 | 0% |

### Diagnostic Source Effectiveness (among resolved failures)

| Source | Count | % of Total |
|--------|-------|------------|
| error-output | 11 | 84.6% |
| error-context-snapshot | 1 | 7.7% |
| code-inspection | 1 | 7.7% |

### Fix Iteration Difficulty Distribution

| Iterations | Count | Tests |
|-----------|-------|-------|
| 1 | 10 | seed-data-count-mismatch, stale-seed-dates, edits existing feedback, toggle marketing checklist items, property-list-data-contamination, follow-up status change, config SyntaxError, neon-branch-duplication, netlify-path-parsing, displays all form fields |
| 2 | 3 | inline edit beds/baths/sqft, sort by Address column, seed-data-future-dates |
| 3+ | 0 | — |

### Resolution Effort Distribution (TOOL_CALL_COUNT, 7 entries available)

| Tool Calls | Count |
|-----------|-------|
| 1–3 | 3 |
| 4–9 | 3 |
| 10+ | 1 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-...-2-..T05-00-14 | W2/realty-show | seed-data-count-mismatch (4 tests) | seed-data-mismatch | yes | no | error output sufficient | yes | — | — | yes | none |
| worker-...-3-..T02-31-10 | W3/realty-show | stale-seed-dates (7 tests) | seed-data-mismatch | yes | no | error output sufficient | yes | — | — | yes | none |
| worker-...-4-..T02-36-46 | W4/realty-show | edits existing feedback | race-condition | yes | no | error output sufficient | yes | — | — | yes | 6971b910c8 |
| worker-...-7-..T02-52-54 | W7/realty-show | toggle marketing checklist items | race-condition | yes | no | error output + code inspection | no | — | — | yes | 623f7ef |
| worker-...-10-..T03-10-49 | W10/realty-show | inline edit beds, baths, sqft | backend-bug | yes | no | error output sufficient | yes | — | — | yes | a1a5a9a128 |
| worker-...-11-..T03-25-59 | W11/realty-show | property-list-data-contamination (8 tests) | data-contamination | yes | no | error output sufficient | yes | — | — | yes | none |
| worker-...-11-..T03-25-59 | W11/realty-show | sort by Address column | bad-assertion-api | yes | no | error output sufficient | yes | — | — | yes | none |
| worker-...-16-..T03-47-36 | W16/realty-show | follow-up status change dashboard | race-condition | yes | no | error-context-snapshot sufficient | yes | — | — | yes | none |
| worker-...-38-..T01-20-55 | W38/realty-show | config SyntaxError (replayDevices) | infrastructure | yes | no | error output sufficient | no | — | — | yes | 2cf83d2304 |
| worker-...-38-..T01-20-55 | W38/realty-show | seed-data-future-dates (4 tests) | seed-data-mismatch | yes | yes | — | yes | NetworkRequest + PlaywrightSteps | mcp__replay__NetworkRequest, mcp__replay__PlaywrightSteps | yes | 2cf83d2304 |
| worker-...-38-..T01-20-55 | W38/realty-show | neon-branch-duplication | data-contamination | yes | no | code inspection — seedDatabase vs truncateAndSeed | yes | — | — | yes | 2cf83d2304 |
| worker-...-39-..T01-36-11 | W39/realty-show | netlify-path-parsing (3 tests) | backend-bug | yes | yes | — | yes | NetworkRequest + PlaywrightSteps | mcp__replay__NetworkRequest, mcp__replay__PlaywrightSteps | yes | 8519d11135 |
| worker-...-41-..T01-51-27 | W41/realty-show | displays all form fields in create mode | data-contamination | yes | no | error output sufficient | yes | — | — | yes | 33e82f8a9b |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| seed-data-count-mismatch | 4 tests | W2 | Fixed test assertions to match actual seed data counts |
| stale-seed-dates | 7 tests | W3 | Fixed seed-db.ts to use relative dates; added DB isolation |
| property-list-data-contamination | 8 tests | W11 | Moved destructive "empty state" test to serial describe block |
| seed-data-future-dates | 4 tests | W38 | Adjusted seed dates to be in the past relative to today |
| neon-branch-duplication | all tests | W38 | Changed seedDatabase to truncateAndSeed in test script |
| netlify-path-parsing | 3 tests | W39 | Fixed path segment index in all 6 Netlify functions |
| controlled-component-async-state | 1 test | W7 | Added optimistic local state for checkbox updates |

### Infrastructure Failures

| Log | Worker | Category | Affected Tests | Notes |
|-----|--------|----------|---------------|-------|
| worker-...-5-..T02-41-19 | W5 | port-conflict | follow-up-summary.spec.ts (4 tests) | Port 8888 occupied by prior netlify dev process |
| worker-...-25-..T04-14-59 | W25 | navigation-timeout | dashboard.spec.ts (16 tests) | NETLIFY_SITE_ID in .env caused site lookup failure |
| worker-...-40-..T01-39-38 | W40 | port-conflict | add-edit-property.spec.ts | Stale netlify dev process on port 8888 |
| worker-...-41-..T01-51-27 | W41 | port-conflict | add-edit-showing.spec.ts | Stale netlify process, required kill -9 |
| worker-...-42-..T02-01-41 | W42 | port-conflict | add-follow-up-dialog.spec.ts (9 tests) | Zombie netlify processes invisible to lsof; traced via /proc/net/tcp6 |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| seed-data-mismatch | 3 | 23.1% |
| race-condition | 3 | 23.1% |
| data-contamination | 3 | 23.1% |
| backend-bug | 2 | 15.4% |
| bad-assertion-api | 1 | 7.7% |
| infrastructure | 1 | 7.7% |

### When Was Replay Most Effective?

Replay was used in only 2 of 13 failures (15.4%), and in both cases it was **not necessary** — error output alone would have sufficed. The two uses were:

1. **seed-data-future-dates** (W38): NetworkRequest confirmed API was correctly excluding future-dated seed data. Error output showed expected vs actual values that pointed to the same conclusion.
2. **netlify-path-parsing** (W39): NetworkRequest confirmed DELETE returning 405 due to null ID. The error output and 405 status codes already indicated the backend bug.

Both used the same strategy: `mcp__replay__NetworkRequest` + `mcp__replay__PlaywrightSteps`. While Replay provided confirmation, the diagnoses could have been made from error output alone.

### When Was Replay NOT Used and Why?

In 11 of 13 failures, Replay was not used:
- **error-output-sufficient** (9 failures): Assertion errors with expected/actual values, SyntaxErrors, and page snapshots provided enough information to diagnose and fix.
- **code-inspection** (1 failure): The neon-branch-duplication issue was found by inspecting the seed script (seedDatabase vs truncateAndSeed).
- **error-context-snapshot** (1 failure): Page snapshot in the Playwright error context showed the data was present but the assertion was fragile.

### Common Debugging Strategies That Worked

1. **Error output analysis** — Reading Playwright assertion errors with expected/actual values was the dominant successful strategy (84.6% of failures).
2. **Destructive test isolation** — Moving tests that delete all data to serial describe blocks at the end of the file resolved data-contamination clusters immediately.
3. **Seed data date fixing** — Changing hardcoded dates to relative dates (e.g., `new Date()` minus offsets) resolved stale seed data issues.
4. **Optimistic UI updates** — Adding local state for async operations resolved race conditions where the UI reset before API responses arrived.

### Common Debugging Strategies That Failed

No debugging strategies failed outright — all 13 failures were successfully resolved. However, Replay was used unnecessarily in 2 cases where error output was sufficient, representing wasted time.

### Self-Inflicted Failure Rate

**7.7%** (1/13) — Worker 7's "toggle marketing checklist items" failure was self-inflicted during the fix session. The controlled checkbox issue was introduced when fixing other tests. This required 1 additional re-run, representing a low self-inflicted cost.

### Test Isolation Issues

Data-contamination (3) + seed-data-mismatch (3) = 6 failures, representing **46.2%** of all failures. While just below the 50% threshold, this is the dominant failure pattern. Key observations:

- **Destructive test ordering** (2 clusters): Tests that delete all records (deleteAllProperties, empty state assertions) ran in parallel with tests expecting data to exist. Fix: serial describe blocks.
- **Stale/incorrect seed data** (3 clusters): Hardcoded dates became stale, seed counts didn't match expectations, and Neon branch inheritance caused data duplication. Fix: relative dates, truncateAndSeed.
- **Positional assertions** (1 failure): Test assumed creation order for dropdown options but API returned different ordering. Fix: content-based locators instead of nth().

**Affected spec files**: property-list.spec.ts, dashboard.spec.ts, activity-summary.spec.ts, add-edit-showing.spec.ts

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "Check seed data dates first"** — When date-filtered queries return unexpected counts, check whether seed dates have become stale relative to today's date. This was the root cause of 3 failures.
- **Add pattern: "Verify truncateAndSeed vs seedDatabase"** — When Neon branch tests show doubled data, check whether the test runner calls truncateAndSeed (which truncates first) rather than seedDatabase (which appends to inherited branch data).
- **Add pattern: "Check Netlify function path parsing"** — When API calls return 405 or unexpected responses, verify the segment index used for ID extraction matches the actual URL structure under /api/* redirects.

### `skills/tasks/build/testing.md`

- **Stale netlify process cleanup**: Add a pre-test step that kills any existing netlify dev processes on port 8888 before starting the test server. This would have prevented 4 of 5 infrastructure failures (Workers 5, 40, 41, 42) that collectively wasted significant debugging time.
- **Enforce truncateAndSeed in test runners**: The test.ts script should always use truncateAndSeed (not seedDatabase) when running on Neon branches to avoid data duplication from branch inheritance.
- **Default to serial execution for destructive tests**: When a spec file contains tests that delete all records, the writeTests skill should automatically place them in a serial describe block at the end of the file.
- **Use content-based locators over positional**: Tests should use `filter({ hasText })` or `getByText()` instead of `nth()` for dropdown/list assertions to avoid ordering-dependent failures.

### `skills/review/reportTestFailures.md`

- **Add port-conflict as an INFRA_CATEGORY value**: Port conflicts from stale netlify dev processes were the most common infrastructure failure (4 of 5 events) but had to be categorized as "other". Adding a dedicated `port-conflict` category would enable better tracking.
- **Add INFRA_AFFECTED_TEST_COUNT**: The current format says "all tests in <spec file>" but doesn't capture the actual count, making it harder to compute total affected tests for infrastructure failures.
- **Clarify infrastructure vs test failure boundary for config errors**: The Worker 38 playwright config SyntaxError was categorized as `infrastructure` (FAILURE_CATEGORY) but counted in TEST_FAILURES rather than INFRA_FAILURE_COUNT. The template should clarify that config/import errors that prevent test execution belong in the infrastructure section.

## 5. Replay Fixes Table

INITIAL_CHANGESET
2cf83d2304
FAILING_TEST
activity-summary.spec.ts (multiple)
FINAL_CHANGESET
2cf83d2304
ASSESSMENT
Replay confirmed API correctly excluded future-dated seed data. NetworkRequest and PlaywrightSteps were used but error output showing expected vs actual counts would have been sufficient for diagnosis. Fix involved adjusting seed dates to be in the past and switching to truncateAndSeed.

INITIAL_CHANGESET
8519d11135
FAILING_TEST
add-edit-open-house.spec.ts (multiple)
FINAL_CHANGESET
8519d11135
ASSESSMENT
Replay confirmed DELETE requests returned 405 due to null ID from path parsing bug in Netlify functions using segments[3]. NetworkRequest and PlaywrightSteps were used but the 405 error codes in test output already pointed to the backend issue. Fix changed path parsing in all 6 Netlify functions. Cascading fix resolved 3 tests.
