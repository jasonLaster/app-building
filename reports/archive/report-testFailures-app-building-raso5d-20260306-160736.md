# Test Failures Report: app-building-raso5d

**Generated:** 2026-03-06
**App:** patient-portal (Patient Portal & Communication — Medical / Family Practice)
**Worker:** app-building-raso5d

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 83 |
| Logs with test failures | 18 |
| Logs without test failures | 65 |
| Total distinct test failure entries | 41 |
| Total affected tests | ~165 (132 from localStorage clusters + 33 individual/small-cluster) |
| Replay usage rate | 0/41 (0%) |
| Replay usage rate among debugged failures | 0/30 (0%) |
| Debugging attempted | 30/41 (73.2%) |
| Debugging success rate | 30/30 (100%) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 12/41 (29.3%) |
| Debugging efficiency (Replay unnecessary) | N/A (Replay never used) |
| Cascading fixes | 2 (empty-state-patient-missing: 1 fix resolved 2 tests; empty-state-testid-missing: 1 fix resolved 2 tests) |
| Self-inflicted failures | 18/41 (43.9%) |
| Total test re-runs across all logs | 37 |
| Unique root causes | ~26 (7 clusters + ~19 unclustered) |
| Fix reuse rate | 1 (addInitScript-localStorage pattern reused across 8 spec files) |
| Infrastructure failure events | 0 |

### Failure Phase Distribution

| Phase | Count | % of Total |
|---|---|---|
| fixTests | 38 | 92.7% |
| writeTests | 1 | 2.4% |
| other (JourneyQA) | 2 | 4.9% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|---|---|---|
| test-code | 27 | 65.9% |
| app-code | 7 | 17.1% |
| both | 4 | 9.8% |
| none | 3 | 7.3% |

### Test Isolation Score

**31.7%** (13/41) — data-contamination (5) + strict-mode (3) + seed-data-mismatch (5). Below the 50% threshold; test isolation is a contributing factor but not the dominant failure mode.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 41 | raso5d/patient-portal | localStorage-access-denied (17 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 41 | raso5d/patient-portal | Seed script SQL error | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| 41 | raso5d/patient-portal | Auth race condition — redirect to dashboard | backend-bug | yes | no | diagnosed from error-context snapshot | no | — | — | yes | none |
| 41 | raso5d/patient-portal | Upcoming appointments status badges | missing-testid | yes | no | diagnosed from error output — unscoped locator | no | — | — | yes | none |
| 42 | raso5d/patient-portal | localStorage-access-denied (12 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 43 | raso5d/patient-portal | localStorage-access-denied (25 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 43 | raso5d/patient-portal | Invalid Date — Demographics & ProblemList | backend-bug | yes | no | diagnosed from error-context snapshot | no | — | — | yes | none |
| 43 | raso5d/patient-portal | Data contamination — shared DB state | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | none |
| 43 | raso5d/patient-portal | Flaky React controlled input fills | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 44 | raso5d/patient-portal | localStorage-access-denied (11 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 44 | raso5d/patient-portal | ResultDetail Invalid Date | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| 45 | raso5d/patient-portal | Login invalid email format | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| 45 | raso5d/patient-portal | Login loading state — button not caught as disabled | CSS/layout | yes | no | diagnosed from error output | no | — | — | yes | none |
| 46 | raso5d/patient-portal | localStorage-access-denied (22 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 46 | raso5d/patient-portal | Reply count race condition | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 47 | raso5d/patient-portal | localStorage-access-denied (11 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 48 | raso5d/patient-portal | localStorage-access-denied (10 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 48 | raso5d/patient-portal | Strict mode — "Medication" matched 2 elements | strict-mode | yes | no | diagnosed from error output | no | — | — | yes | none |
| 48 | raso5d/patient-portal | Request Refill button enabled filter broken | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 48 | raso5d/patient-portal | Active medications Invalid Date | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| 49 | raso5d/patient-portal | localStorage-access-denied (24 tests) | other | yes | no | diagnosed from error output | no | — | — | yes | none |
| 60 | raso5d/patient-portal | Pending forms overdue indicator | other | no | no | diagnosed from error output — "Invalid Date" | yes | — | — | yes | none |
| 60 | raso5d/patient-portal | Completed forms sorted by submission date | data-contamination | no | no | diagnosed from error output — no pending forms | yes | — | — | yes | none |
| 60 | raso5d/patient-portal | FormView back navigation | data-contamination | no | no | diagnosed from error output — DB state contamination | yes | — | — | yes | none |
| 60 | raso5d/patient-portal | FormView submit → Staff Dashboard | data-contamination | no | no | diagnosed from error output — DB state contamination | yes | — | — | yes | none |
| 63 | raso5d/patient-portal | Insurance pending review status | other | no | no | diagnosed from error logs — button disabled from shared state | yes | — | — | yes | none |
| 64 | raso5d/patient-portal | Email field validates format | other | yes | no | pre-existing reliableFill helper issue | yes | — | — | no | none |
| 64 | raso5d/patient-portal | Address fields are validated | other | yes | no | pre-existing reliableFill helper issue | yes | — | — | no | none |
| 64 | raso5d/patient-portal | Demographic change records | other | yes | no | pre-existing reliableFill helper issue | yes | — | — | no | none |
| 66 | raso5d/patient-portal | Active medications empty state | seed-data-mismatch | no | no | obvious from error context — redirect to login | no | — | — | yes | none |
| 66 | raso5d/patient-portal | Refill history empty state | seed-data-mismatch | no | no | same non-existent patient issue | no | — | — | yes | none |
| 68 | raso5d/patient-portal | Results list empty state | other | no | no | diagnosed from error messages — auth redirect | no | — | — | yes | none |
| 68 | raso5d/patient-portal | ResultDetail displays result value with units | strict-mode | no | no | strict mode violation clear from error | no | — | — | yes | none |
| 70 | raso5d/patient-portal | Inbox empty state | seed-data-mismatch | no | no | obvious — fake patient UUID redirect | no | — | — | yes | none |
| 70 | raso5d/patient-portal | Reply persisted and visible to staff | timeout | no | no | obvious — browser.newContext() exceeded timeout | no | — | — | yes | none |
| 70 | raso5d/patient-portal | Composed message visible to staff | timeout | no | no | same browser.newContext() timeout | no | — | — | yes | none |
| 72 | raso5d/patient-portal | Empty state testid missing (2 tests) | missing-testid | no | no | diagnosed from error output | yes | — | — | yes | none |
| 72 | raso5d/patient-portal | Submitting valid request — strict mode | strict-mode | no | no | diagnosed from error output — multiple Pending badges | yes | — | — | yes | none |
| 75 | raso5d/patient-portal | Dashboard shows outstanding balances | seed-data-mismatch | no | no | diagnosed from error — missing DB column | no | — | — | yes | none |
| 83 | raso5d/patient-portal | ViewLabResults journey | seed-data-mismatch | no | no | diagnosed from error context snapshot | yes | — | — | yes | none |
| 83 | raso5d/patient-portal | CompleteForms journey | data-contamination | no | no | diagnosed from error context + API curl | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---|---|---|---|
| localStorage-access-denied | 8 entries (132 tests) | 41, 42, 43, 44, 46, 47, 48, 49 | Replaced `page.evaluate` localStorage calls with `page.addInitScript` in each spec file |
| neon-date-format | 3 entries | 43, 44, 48 | Fixed `formatDate` utility and component date parsing to handle Neon ISO timestamp format |
| forms-test-ordering | 3 entries | 60 | Restructured test order with serial blocks; moved destructive tests after read-only assertions |
| date-parsing-bug | 1 entry | 60 | Fixed date parsing in PendingForms.tsx for overdue indicator |
| empty-state-patient-missing | 2 entries | 66 | Added a seeded patient with no prescriptions to test empty states |
| browser-newContext-timeout | 2 entries | 70 | Replaced `browser.newContext()` (too slow with Replay browser) with page reload verification |
| empty-state-testid-missing | 2 entries | 72 | Added missing `data-testid` attributes to empty state components |
| reliableFill-helper (implicit) | 3 entries | 64 | Unresolved — pre-existing issue where `reliableFill` doesn't clear fields before typing |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|---|---|---|
| other | 17 | 41.5% |
| backend-bug | 6 | 14.6% |
| data-contamination | 5 | 12.2% |
| seed-data-mismatch | 5 | 12.2% |
| strict-mode | 3 | 7.3% |
| missing-testid | 2 | 4.9% |
| timeout | 2 | 4.9% |
| CSS/layout | 1 | 2.4% |

### When was Replay most effective?

Replay was **never used** across all 41 failure entries. Every failure was diagnosed from error output, error-context snapshots, or page snapshot text alone. The 0% Replay usage rate is notable — this entire app build and test cycle was completed without any Replay debugging.

### When was Replay NOT used and why?

The dominant reasons for not using Replay:

1. **"Diagnosed from error output"** (majority of cases): Error messages from Playwright were sufficiently descriptive. DOMException for localStorage, strict mode violation counts, SQL errors, timeout messages — all provided enough information to identify root causes.
2. **"No recording available"** (29/41 failures): Most failures from the initial FixTests phase (logs 41-49) had no recordings because the localStorage-access-denied error prevented proper page rendering.
3. **"Pre-existing reliableFill helper issue"** (3 failures in log 64): Known issue left unresolved as out of scope.
4. **"Obvious from error context"** (self-inflicted failures): Newly-written test code had straightforward bugs (fake patient IDs, missing testids) identifiable from error messages.

### Common debugging strategies that worked

1. **Error-output-first diagnosis**: Reading Playwright's error output and page snapshots was sufficient for 100% of diagnosed failures. No visual debugging tools were needed.
2. **addInitScript pattern**: The `page.addInitScript` pattern (replacing `page.evaluate` before navigation) was identified once and reused across all 8 spec files, fixing 132 affected tests.
3. **Serial block restructuring**: Moving destructive tests (create/update/delete operations) after read-only tests within `test.describe.serial` blocks resolved data contamination.
4. **API route mocking for empty states**: Using `page.route()` to intercept API calls and return empty responses, rather than creating non-existent test patients, solved auth redirect issues for empty state tests.
5. **Page reload instead of new context**: Replacing `browser.newContext()` with page reload for cross-role verification avoided Replay browser timeout issues.

### Common debugging strategies that failed

1. **Fake/non-existent patient IDs for empty states**: Repeatedly attempted across multiple spec files (logs 66, 68, 70), always causing auth redirect to login. This anti-pattern was eventually replaced with API route mocking.
2. **`reliableFill` helper without field clearing**: The helper function typed into fields without first clearing existing content, causing concatenated text like "alice@example.com-email". This issue was never fully resolved (3 unresolved failures in log 64).

### Self-inflicted failure rate

**43.9%** (18/41) of failures were self-inflicted — introduced by the agent's own fix attempts during the session. This is below the 50% concerning threshold but still significant. Most self-inflicted failures fell into two categories:
- **Empty state test setup errors** (7 failures): Using non-existent patient IDs, missing testids, or missing DB columns
- **Data contamination from test ordering** (6 failures): New tests consuming shared DB state that subsequent tests depended on

### Test Isolation Issues

While the Test Isolation Score (31.7%) is below the 50% threshold, test isolation remains a notable concern:
- **data-contamination** (5 failures): Tests mutating shared DB state (forms submission consuming pending forms, demographic changes persisting across tests)
- **seed-data-mismatch** (5 failures): Tests assuming specific seed data that doesn't exist or has been consumed
- **strict-mode** (3 failures): Unscoped locators matching elements across multiple page sections

The forms spec files and health-record spec files were most affected. Serial block restructuring was the primary mitigation. The JourneyQA CompleteForms failure (log 83) is particularly notable — it was caused by prior test runs against the **live deployment** consuming David's pending forms, demonstrating that data contamination affects production environments too.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "error-output-first" as default strategy**: This session achieved 100% debugging success without Replay. Document that for clear error messages (DOMException, strict mode violations, SQL errors, timeout messages), error output analysis should be the first and often sufficient approach.
- **Add "empty state testing" pattern**: Document the `page.route()` API mocking pattern for empty state tests. Flag the anti-pattern of using non-existent patient/user IDs (causes auth redirect). This was independently rediscovered 3 times (logs 66, 68, 70).
- **Add "browser.newContext() timeout with Replay browser" known issue**: Document that `browser.newContext()` is too slow with the Replay browser and should be replaced with page reload + re-login patterns.

### `skills/tasks/build/testing.md`

- **Mandate `page.addInitScript` for localStorage setup**: The `page.evaluate` + localStorage pattern before navigation caused 132 test failures across all 8 spec files. Add a directive requiring `addInitScript` instead.
- **Add empty state testing guidance**: Require API route mocking (not fake user IDs) for empty state tests. This would have prevented 5+ self-inflicted failures.
- **Add `reliableFill` clearing requirement**: The helper should `clear()` input fields before `fill()` to avoid concatenated text. The 3 unresolved failures in log 64 stem from this.
- **Add Neon date format handling guidance**: Neon returns DATE columns as ISO timestamps. Document the correct `formatDate` pattern to avoid "Invalid Date" errors (affected 3 spec files).

### `skills/review/reportTestFailures.md`

- **Consider adding a "Replay Justification" metric**: When Replay usage is 0% across an entire report, a summary note explaining whether this indicates (a) Replay wasn't needed, (b) recordings weren't available, or (c) the agent didn't attempt it would be valuable.
- **Add "anti-pattern" tracking**: Several failures followed the same anti-pattern (fake patient IDs for empty states) across multiple logs. Tracking recurring anti-patterns — not just fix patterns — would help identify process improvements faster.
- **Clarify "other" category guidance**: 41.5% of failures fell into "other", making it the largest category. Consider adding subcategories like "test-setup-error", "react-input-interaction", "localStorage-access" to make the distribution more actionable.
