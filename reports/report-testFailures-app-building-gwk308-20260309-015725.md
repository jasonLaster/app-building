# Test Failures Report: app-building-gwk308

**Generated:** 2026-03-13
**App:** DentalConnect Patient Portal (dental-connect)
**Workers:** app-building-gwk308, clean_2b90d218_d4b7_49d1_a603_8
**Period:** 2026-03-09 01:58 UTC — 2026-03-13 06:49 UTC

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 135 |
| Logs with test failures | 27 |
| Logs without test failures | 108 |
| Total distinct test failures | 37 |
| Total affected tests | 177 |
| Replay usage rate (overall) | 27.0% (10/37) |
| Replay usage rate (debugged failures) | 37.0% (10/27) |
| Debugging success rate | 100% (27/27) |
| Replay-assisted success rate | 100% (10/10) |
| Recording availability rate | 94.6% (35/37) |
| Debugging efficiency (Replay used but unnecessary) | 80% (8/10 REPLAY_NECESSARY=no) |
| Replay decision quality | 80% unnecessary (8/10 — Replay used speculatively for issues diagnosable from error output) |
| Cascading fixes | 19 single changes resolved multiple test failures |
| Self-inflicted failures | 1 (2.7% of total — 32 affected tests) |
| Self-inflicted fix quality cost | 1 additional re-run |
| Total test re-runs | 51 |
| Unique root causes | 34 (25 clusters + 9 unclustered) |
| Fix reuse rate | 1 reused fix pattern (`destructive-test-reordering` across 4 spec files) |
| Pre-existing failure rate | 94.6% (35/37) |
| Test Isolation Score | 59.5% (22/37 — data-contamination: 19, seed-data-mismatch: 3, strict-mode: 0) |
| Test Isolation Score trend | 59.5% (first report for this container) |
| Infrastructure failure events | 13 failures / 16 events (affecting ~91 tests) |

**Failure phase distribution:**

| Phase | Count | % |
|---|---|---|
| fixTests | 19 | 51.4% |
| other (JourneyQA/reproduce) | 15 | 40.5% |
| checkDirectives | 3 | 8.1% |

**Failure resolution type distribution:**

| Type | Count | % |
|---|---|---|
| test-code | 14 | 37.8% |
| both | 7 | 18.9% |
| app-code | 4 | 10.8% |
| none (unresolved) | 12 | 32.4% |

**Fix iteration difficulty distribution:**

| Iterations | Count |
|---|---|
| 0 (not resolved) | 10 |
| 1 | 21 |
| 2 | 3 |
| 3 | 1 |
| 4+ | 1 (api-routing-redirect-and-segment-parsing — URL segment parsing across 8 Netlify functions) |

4+ iteration outlier: The api-routing cluster in gwk308-49 required 4 iterations because the root cause involved both missing netlify.toml redirect rules AND a segment index off-by-one in all 8 backend functions after Netlify dev rewrote request paths.

**Resolution effort distribution (TOOL_CALL_COUNT):**

| Tool calls | Count |
|---|---|
| 1-3 | 2 |
| 4-9 | 18 |
| 10+ | 8 |

**Diagnostic source effectiveness (among 27 debugged failures):**

| Source | Count | % |
|---|---|---|
| error-output | 22 | 81.5% |
| code-inspection | 2 | 7.4% |
| replay-necessary | 2 | 7.4% |
| error-context-snapshot | 1 | 3.7% |
| page-snapshot | 1 | 3.7% (added to 100.1% due to rounding) |

**Infrastructure failure sub-categories:**

| Sub-category | Failures | Events |
|---|---|---|
| Environment (port-conflict) | 4 | 7 |
| Environment (socket-timeout) | 2 | 2 |
| Other (config/import errors) | 5 | 5 |
| Recording (recording-upload-failure) | 1 | 1 |
| Agent workflow error (npx playwright test directly) | 1 | 1 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|---|
| gwk308-49 | gwk308/dental-connect | api-routing-redirect-and-segment-parsing (12 tests) | api-routing | yes | no | error-output-sufficient | no | curl testing + server logs | — | yes | none |
| gwk308-49 | gwk308/dental-connect | data-contamination-plan-status (14 tests) | data-contamination | yes | no | error-output-sufficient | yes | server debug logging | — | yes | none |
| gwk308-52 | gwk308/dental-connect | surveyform-success-state-and-ordering (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | error-context snapshots | — | yes | none |
| gwk308-53 | gwk308/dental-connect | conversation-list-count-mismatch (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 48ac676085 |
| gwk308-54 | gwk308/dental-connect | Reply fails with empty message body | data-contamination | yes | yes | — | yes | PlaywrightSteps to verify accumulated data | PlaywrightSteps | yes | 5aca9a8c69 |
| gwk308-57 | gwk308/dental-connect | recent-messages-destructive-ordering (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | fd2b7bd41a |
| gwk308-58 | gwk308/dental-connect | upcoming-destructive-ordering (4 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | yes | 14823434a8 |
| gwk308-59 | gwk308/dental-connect | form-editor-autosave-feedback-loop (11 tests) | race-condition | yes | no | error-output-sufficient | yes | code inspection of useEffect | — | yes | f644c5f09b |
| gwk308-60 | gwk308/dental-connect | Form list can be navigated repeatedly | data-contamination | yes | yes | — | yes | PlaywrightSteps to verify state | PlaywrightSteps | yes | a4e7571edc |
| gwk308-61 | gwk308/dental-connect | acknowledge-data-exhaustion (2 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps to confirm already-acknowledged | PlaywrightSteps | yes | pending |
| gwk308-64 | gwk308/dental-connect | new-message-count-assertions (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 3452b96a25 |
| gwk308-65 | gwk308/dental-connect | Toggle multiple notification preferences in sequence | race-condition | yes | yes | — | yes | PlaywrightSteps + NetworkRequest for timing | PlaywrightSteps, NetworkRequest | yes | 4a4b97c789 |
| gwk308-65 | gwk308/dental-connect | Toggle the same preference on and off repeatedly | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 4a4b97c789 |
| gwk308-66 | gwk308/dental-connect | password-change-destructive-ordering (7 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 5890e15e0f |
| gwk308-68 | gwk308/dental-connect | pending-surveys-destructive-ordering (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 09d7ebba4b |
| gwk308-69 | gwk308/dental-connect | personal-info-useeffect-overwrite (3 tests) | race-condition | yes | yes | — | yes | NetworkRequest to inspect PUT body | NetworkRequest | yes | 282e141189 |
| gwk308-71 | gwk308/dental-connect | plan-history-selector-and-ordering (5 tests) | data-contamination | yes | no | page-snapshot-sufficient | yes | page snapshot analysis | — | yes | d170af5794 |
| clean-1 (06:28) | clean/dental-connect | Review Care Instructions — Unread indicator | data-contamination | no | yes | — | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, Screenshot, NetworkRequest | yes | 5d34621 |
| clean-2 (23:33) | clean/dental-connect | native-date-validation (2 tests) | other | yes | yes | — | yes | PlaywrightSteps to confirm native validation block | PlaywrightSteps | yes | d439cecdea |
| clean-2 (06:45) | clean/dental-connect | seed-data-pending-surveys (4 tests) | seed-data-mismatch | yes | no | error-output-sufficient | yes | — | — | yes | none |
| clean-3 (06:45) | clean/dental-connect | pending-surveys-seed-data-mismatch (4 tests) | seed-data-mismatch | yes | no | error-output-sufficient | yes | — | — | yes | none |
| clean-5 (00:05) | clean/dental-connect | survey-data-contamination (6 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | yes | 4f51cd6db2 |
| clean-23 (02:50) | clean/dental-connect | messages-cleanup-not-iterable (32 tests) | test-setup-error | no | no | error-output-sufficient | no | — | — | yes | none |
| clean-23 (02:50) | clean/dental-connect | messages-cross-run-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| clean-26 (03:12) | clean/dental-connect | pending-surveys-seed-data-mismatch (4 tests) | seed-data-mismatch | yes | no | error-output-sufficient | yes | — | — | no (out of scope) | none |
| clean-54 (05:22) | clean/dental-connect | missing-email-validation (2 tests) | other | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-54 (05:22) | clean/dental-connect | empty-state-displays (6 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-54 (05:22) | clean/dental-connect | form-list-status-mismatch (5 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-54 (05:22) | clean/dental-connect | care-instructions-unread (3 tests) | backend-bug | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-54 (05:22) | clean/dental-connect | survey-metadata-missing (5 tests) | backend-bug | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-54 (05:22) | clean/dental-connect | password-test-contamination (11 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes (diagnosed) | none |
| clean-54 (05:22) | clean/dental-connect | Appointment list updates when confirmed | race-condition | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-54 (05:22) | clean/dental-connect | Sending a new message creates correct data | bad-assertion-api | yes | no | error-output-sufficient | yes | — | — | no (discovery) | none |
| clean-55 (05:35) | clean/dental-connect | Auto-save race condition overwrites form status | race-condition | yes | no | code-inspection | yes | code inspection of FormEditor.tsx | — | yes | f3ef012 |
| clean-56 (05:53) | clean/dental-connect | InstructionsList empty state mock failure | test-setup-error | yes | yes | — | yes | PlaywrightSteps + NetworkRequest + Screenshot | PlaywrightSteps, NetworkRequest, Screenshot | yes | none |
| reproduce-231055 | reproduce/dental-connect | date-validation-missing (2 tests) | backend-bug | yes | no | reproduction run only | yes | — | — | no (repro only) | none |
| reproduce-231350 | reproduce/dental-connect | date-validation-missing (2 tests) | backend-bug | yes | no | reproduction run only | yes | — | — | no (repro only) | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---|---|---|---|
| api-routing-redirect-and-segment-parsing | 12 tests | gwk308-49 | Fixed: netlify.toml redirects + lastSegment URL parsing in all 8 functions |
| data-contamination-plan-status | 14 tests | gwk308-49 | Fixed: beforeEach reset endpoint for treatment plans |
| surveyform-success-state-and-ordering | 4 tests | gwk308-52 | Fixed: SurveyForm.tsx success state + test ordering |
| conversation-list-count-mismatch | 2 tests | gwk308-53 | Fixed: relative count assertions in tests |
| recent-messages-destructive-ordering | 4 tests | gwk308-57 | Fixed: test reordering, destructive tests last |
| upcoming-destructive-ordering | 4 tests | gwk308-58 | Fixed: test reordering, destructive tests last |
| form-editor-autosave-feedback-loop | 11 tests | gwk308-59 | Fixed: useEffect guard to prevent feedback loop |
| acknowledge-data-exhaustion | 2 tests | gwk308-61 | Fixed: added extra seed data instructions |
| new-message-count-assertions | 2 tests | gwk308-64 | Fixed: relative count assertions |
| password-change-destructive-ordering | 7 tests | gwk308-66 | Fixed: non-destructive tests first, password-mutating tests in serial block |
| pending-surveys-destructive-ordering | 2 tests | gwk308-68 | Fixed: test reordering |
| personal-info-useeffect-overwrite | 3 tests | gwk308-69 | Fixed: editing guard on useEffect in PersonalInfo.tsx |
| plan-history-selector-and-ordering | 5 tests | gwk308-71 | Fixed: selectors + serial test ordering |
| native-date-validation | 2 tests | clean-2 (23:33) | Fixed: noValidate on form element |
| seed-data-pending-surveys | 4 tests | clean-2 (06:45), clean-3 (06:45), clean-26 | Fixed: updated test expectations to match seed data (3 pending surveys) |
| survey-data-contamination | 6 tests | clean-5 (00:05) | Fixed: added seed data + test reordering |
| messages-cleanup-not-iterable | 32 tests | clean-23 (02:50) | Fixed: cleanup API used correct password after password-change test |
| messages-cross-run-contamination | 2 tests | clean-23 (02:50) | Fixed: reset endpoint + ordering assertions |
| missing-email-validation | 2 tests | clean-54 | Unresolved: tests expect client-side email validation that doesn't exist |
| empty-state-displays | 6 tests | clean-54 | Unresolved: empty-state tests fail because seed data persists across runs |
| form-list-status-mismatch | 5 tests | clean-54 | Unresolved: form statuses corrupted by prior test runs |
| care-instructions-unread | 3 tests | clean-54 | Fixed in later log (clean-56): mock pattern + response format corrected |
| survey-metadata-missing | 5 tests | clean-54 | Unresolved: pending surveys missing appointment metadata |
| password-test-contamination | 11 tests | clean-54 | Diagnosed: password-change tests run first, corrupting login for personal-info tests |
| date-validation-missing | 2 tests | reproduce x2 | Unresolved: app missing date validation logic for request form |

**Note:** Several data-contamination clusters (empty-state-displays, form-list-status-mismatch, password-test-contamination) share a systemic root cause: the test suite lacks per-spec `beforeEach` cleanup, allowing cross-run and cross-spec data mutations to corrupt subsequent tests. The `destructive-test-reordering` pattern applied across gwk308-57, 58, 66, 68 is a band-aid; proper isolation requires beforeEach API resets.

**Note:** The seed-data-pending-surveys cluster appeared in 3 separate logs (clean-2, clean-3, clean-26), indicating the fix from clean-2 did not persist or was overridden. This suggests seed data assumptions drift when multiple workers modify the same test files.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|---|---|---|
| data-contamination | 19 | 51.4% |
| race-condition | 5 | 13.5% |
| backend-bug | 4 | 10.8% |
| seed-data-mismatch | 3 | 8.1% |
| other | 2 | 5.4% |
| test-setup-error | 2 | 5.4% |
| api-routing | 1 | 2.7% |
| bad-assertion-api | 1 | 2.7% |

### Data-contamination Sub-categories

Data-contamination is the dominant failure category at 51.4% (>40%), warranting sub-category breakdown:

| Sub-category | Count | % of data-contamination |
|---|---|---|
| destructive-ordering | 11 | 57.9% |
| cross-run-accumulation | 4 | 21.1% |
| accumulated-data | 4 | 21.1% |

**destructive-ordering** is the most common pattern: tests that modify/delete/consume data run before dependent tests, leaving the database in an unexpected state. The most impactful instance was password-change tests changing the login password, cascading into 11+ failures across personal-info tests.

**cross-run-accumulation** is the hardest to diagnose: data persists across separate test executions (e.g., care instructions marked as read by prior JourneyQA sessions, form statuses mutated by prior runs).

**accumulated-data** manifests as count mismatches: tests create records without cleanup, inflating counts for subsequent tests.

### Test Isolation Issues

Data-contamination (19) + seed-data-mismatch (3) = 22 out of 37 failures (59.5%) are test isolation issues. This exceeds the 50% threshold and warrants dedicated attention.

**Affected spec files:**
- tests/personal-info.spec.ts (11 tests — password contamination from password-change.spec.ts)
- tests/accept-decline.spec.ts (14 tests — plan status contamination)
- tests/form-list.spec.ts (5 tests — cross-run form status)
- tests/pending-surveys.spec.ts (4+ tests — seed data + destructive ordering)
- tests/conversation-list.spec.ts, conversation-view.spec.ts, new-message.spec.ts (34 tests — cleanup API + cross-run)
- tests/password-change.spec.ts (7 tests — self-destructive ordering)
- tests/dashboard-recent-messages.spec.ts, dashboard-upcoming.spec.ts (8 tests — destructive ordering)
- tests/completed-surveys.spec.ts (4 tests — destructive ordering)

**Root cause:** Serial execution within spec files means tests share database state. The fixTests phase applied `destructive-test-reordering` as a quick fix (4 spec files), but this is fragile — any new test added in the wrong position breaks the ordering. The proper solution is beforeEach API resets, which was applied in some specs (accept-decline, notification-preferences, messages) but not universally.

### Self-inflicted Failure Rate

**1 out of 37 failures (2.7%) were self-inflicted** — well below the 50% concern threshold.

The single self-inflicted failure (messages-cleanup-not-iterable, 32 affected tests) occurred because the beforeEach cleanup API used the original password ("demo123") after a prior password-change test had changed it. The fix was straightforward (1 iteration), but the blast radius was large (32 tests across 3 spec files).

### When Was Replay Most Effective?

Replay was **genuinely necessary** in only 2 out of 10 uses (20%):
1. **Toggle multiple notification preferences** (race-condition): Replay's NetworkRequest tool revealed the exact timing — toggle click at 3813ms, API response at 3997ms returning stale state, useEffect overwriting local state. Error output alone showed the wrong checkbox state but couldn't explain *why*.
2. **InstructionsList empty state mock** (test-setup-error): Replay's NetworkRequest revealed the route mock pattern `**/api/care-instructions` didn't match requests with query parameters (`?page=1&pageSize=20`). Error output only showed the wrong element count.

Common pattern: Replay excels when the failure involves **network timing or request interception** — areas where error output cannot provide sufficient detail.

### When Was Replay NOT Used and Why?

| Reason | Count |
|---|---|
| error-output-sufficient | 21 |
| code-inspection | 2 |
| reproduction run only | 2 |
| infrastructure-failure | 1 |
| out of scope (discovery) | 1 |

81.5% of non-Replay diagnoses relied on error output alone. Data-contamination failures are particularly well-suited to error-output diagnosis: count mismatches (expected 2, got 5) and state mismatches (expected "Pending", got "Accepted") immediately point to data leakage.

### Common Debugging Strategies That Worked

1. **Error output → code inspection → fix** (21 of 27 debugged): For data-contamination, the expected-vs-actual diff in error output directly indicates the contamination pattern. Code inspection confirms whether the issue is test ordering or missing cleanup.
2. **Destructive test reordering** (4 spec files): Moving destructive tests to serial blocks at the end of the file. Quick fix, 1 iteration each.
3. **beforeEach API reset endpoints** (3 spec files): Creating `/api/{resource}/reset` endpoints and calling them in beforeEach. More durable than reordering but requires backend changes.
4. **Relative count assertions** (2 spec files): Replacing `toHaveCount(3)` with `toHaveCount` based on initial count. Tolerates accumulated data.

### Common Debugging Strategies That Failed

1. **Test reordering without beforeEach cleanup**: While effective short-term, this pattern is fragile. The password-test-contamination cluster (11 tests in clean-54) shows that when spec files run in a different order (e.g., batch JourneyQA), the reordering assumption breaks.

## 4. Recommendations

### `skills/debugging/*.md` — New patterns

1. **Add "data-contamination quick-diagnosis" pattern**: When error output shows count/state mismatches, check (a) test ordering for destructive operations, (b) prior test runs for cross-run accumulation, (c) seed data assumptions before using Replay. Error output alone diagnosed 81.5% of failures.
2. **Add "Replay decision gate"**: Only use Replay when the failure involves network timing, request interception, or visual rendering issues. For count mismatches and state mismatches, error output is almost always sufficient (80% of Replay uses were unnecessary).
3. **Add "useEffect feedback loop" pattern**: When form data reverts to original values, check for useEffect syncing from props/Redux without an editing guard. This caused 11 failures in form-editor and 3 in personal-info.

### `skills/tasks/build/testing.md` — Process improvements

1. **Mandate beforeEach API resets in ALL spec files that modify data**: The Test Isolation Score of 59.5% (exceeding the 50% threshold) indicates test isolation is the dominant failure mode. The current approach of fixing isolation reactively per-file is insufficient. All spec files should include beforeEach hooks that reset relevant database state via API endpoints.
2. **Create shared test utilities for common reset patterns**: The `destructive-test-reordering` fix was applied identically across 4 spec files. A shared `resetDatabase(resource)` helper would prevent duplication and ensure consistent cleanup.
3. **Add password-change isolation**: password-change.spec.ts should restore the original password in afterAll, or use a dedicated test user. Password mutations caused 18+ failures across personal-info and messages specs.
4. **Fix seed-data-mismatch drift**: The pending-surveys-seed-data-mismatch cluster appeared in 3 separate logs, suggesting fixes weren't persisted or were overridden. Establish a single source of truth for seed data expectations and validate test assumptions against it.
5. **Prevent agent workflow errors**: The agent ran `npx playwright test` directly instead of `npm run test` in clean-55, causing 18 infrastructure failures. Add a validation step in the testing skill to enforce use of `npm run test`.

### `skills/review/reportTestFailures.md` — Template improvements

1. **Clarify TEST_FAILURES counting for infrastructure items**: Some analysis files (clean-5) included infrastructure failures as "Failure Cluster" headings with FAILURE_CATEGORY: infrastructure, inflating TEST_FAILURES. The template should explicitly state that ### Failure Cluster headings must NOT use infrastructure as a category — infrastructure events belong only in the ## Infrastructure Failures section.
2. **Add WORKER field to failure entries**: With multi-worker reports, the Worker/App column in the synthesis table required inferring the worker from the log filename. An explicit WORKER field in analysis files would simplify synthesis.
3. **Add cross-log deduplication guidance**: The seed-data-pending-surveys cluster appeared identically in 3 logs. The template should guide analysts to note when a failure is a repeat of one already analyzed in a prior log, to avoid inflating distinct failure counts in synthesis.

## 5. Replay Fixes Table

INITIAL_CHANGESET: none
FAILING_TEST: Reply fails with empty message body (conversation-view.spec.ts)
FINAL_CHANGESET: 5aca9a8c69
ASSESSMENT: Replay confirmed accumulated data (3 messages instead of 2). Fix was a relative assertion. Replay was unnecessary — error output showed the count mismatch directly.

INITIAL_CHANGESET: none
FAILING_TEST: Upcoming appointments list limits display count (dashboard-upcoming.spec.ts)
FINAL_CHANGESET: 14823434a8
ASSESSMENT: Replay confirmed empty page state after destructive test. Fix was test reordering. Replay was unnecessary — error output showed missing elements.

INITIAL_CHANGESET: none
FAILING_TEST: Form list can be navigated repeatedly without issues (form-list.spec.ts)
FINAL_CHANGESET: a4e7571edc
ASSESSMENT: Replay confirmed submitted form status blocked navigation. Fix was resetting form status in test setup. Replay was unnecessary — error output showed state mismatch.

INITIAL_CHANGESET: none
FAILING_TEST: Toggle multiple notification preferences in sequence (notification-preferences.spec.ts)
FINAL_CHANGESET: 4a4b97c789
ASSESSMENT: Replay was genuinely necessary. NetworkRequest revealed exact timing of stale API response overwriting local toggle state via useEffect at 3997ms. Fix was removing useEffect sync and using optimistic local state. Error output alone could not have revealed the timing.

INITIAL_CHANGESET: none
FAILING_TEST: Save personal info with valid data (personal-info.spec.ts)
FINAL_CHANGESET: 282e141189
ASSESSMENT: Replay confirmed PUT request body contained original values instead of edited values, proving useEffect overwrite. Fix was adding editing guard. Replay was unnecessary — code inspection would have sufficed.

INITIAL_CHANGESET: none
FAILING_TEST: Review Care Instructions — Unread indicator (instructions-list.spec.ts)
FINAL_CHANGESET: 5d34621
ASSESSMENT: Replay confirmed API returned is_read=true for all instructions due to prior QA session mutation. Fix was re-seeding data. Replay was unnecessary — error output showed missing unread indicators.

INITIAL_CHANGESET: none
FAILING_TEST: Request form fails when end date is before start date (request-form.spec.ts)
FINAL_CHANGESET: d439cecdea
ASSESSMENT: Replay confirmed native browser validation blocked form submission before custom validation could execute. Fix was adding noValidate attribute. Replay was unnecessary — error context already showed the pattern.

INITIAL_CHANGESET: none
FAILING_TEST: Survey form shows the appointment context (survey-form.spec.ts)
FINAL_CHANGESET: 4f51cd6db2
ASSESSMENT: Replay screenshot confirmed surveys page showed "Loading surveys..." with no pending surveys. Fix was adding seed data + test reordering. Replay was unnecessary — error output showed no surveys available.

INITIAL_CHANGESET: none
FAILING_TEST: InstructionsList › Empty state when patient has no care instructions (instructions-list.spec.ts)
FINAL_CHANGESET: none
ASSESSMENT: Replay was genuinely necessary. NetworkRequest revealed route mock pattern didn't match paginated API requests with query parameters. Fix was updating mock glob pattern and response format. Error output only showed wrong element count, not why the mock failed to intercept.
