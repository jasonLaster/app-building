# Test Failures Report: app-building-gwk308

**Generated:** 2026-03-09
**App:** DentalConnect Patient Portal (dental-connect)
**Branch:** app-building-gwk308

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 112 |
| Logs with test failures | 23 |
| Logs without test failures | 89 |
| Total distinct test failure entries | 36 |
| Total affected tests | 100 |
| Total test re-runs across all logs | 62 |
| Unique root causes | 32 (19 named clusters + 13 unclustered) |
| **Replay usage rate** | 16.7% (6/36) |
| **Replay usage rate among debugged failures** | 16.7% (6/36) |
| **Debugging success rate** | 100% (36/36) |
| **Replay-assisted success rate** | 100% (6/6) |
| **Recording availability rate** | 77.8% (28/36) |
| **Replay decision quality** | 66.7% unnecessary (4/6 REPLAY_NECESSARY=no) |
| Debugging efficiency (Replay used but unnecessary) | 4 failures |
| Cascading fixes | 15 changesets resolving multiple tests |
| Self-inflicted failures | 10 (27.8%) |
| Pre-existing failure rate | 63.9% (23/36) |
| Infrastructure failure events (excluded from above) | 1 event, 3 affected tests (W106 — Replay upload entity too large) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 27 | 75.0% |
| checkDirectives | 3 | 8.3% |
| other (JourneyQA) | 6 | 16.7% |
| deployment | 0 | 0% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|-----------------|-------|-----------|
| test-code | 23 | 63.9% |
| app-code | 4 | 11.1% |
| both | 9 | 25.0% |
| none | 0 | 0% |

### Test Isolation Score

**55.6%** (20/36) — data-contamination (14) + strict-mode (2) + seed-data-mismatch (4) = 20 test-isolation failures out of 36 total.

### Diagnostic Source Effectiveness

| Source | Count | Notes |
|--------|-------|-------|
| error-output | ~21 | Most common; sufficient for count mismatches, constraint errors, timeout messages |
| page-snapshot | ~5 | Used for stale data visible in UI (e.g., wrong status badges, missing elements) |
| code-inspection | 0 | Not primary diagnostic source in any failure |

### Fix Iteration Difficulty Distribution

| Iterations | Count |
|-----------|-------|
| 1 | 12 |
| 2 | 5 |
| 3 | 2 |
| 4+ | 1 |

**4+ iteration failure:** "User can edit comments text after initial entry" (survey-form.spec.ts, W76) — netlify dev server crash from pipe buffer overflow required iterative reduction of API calls per test.

### Fix Reuse Rate

2 fix patterns applied across multiple spec files:
- **destructive-test-reordering**: 4 spec files (dashboard-recent-messages, dashboard-upcoming, password-change, pending-surveys)
- **beforeEach-reset-api**: 2 spec files (accept-decline, active-plans)

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| W49 | gwk308/dental-connect | Cluster: api-routing-infrastructure (12 tests) | infrastructure | yes | no | error-output-sufficient — SyntaxError and connection errors | no | — | — | yes | none |
| W49 | gwk308/dental-connect | Cluster: treatment-plan-data-contamination (10 tests) | data-contamination | yes | no | error-output-sufficient — page snapshots showed wrong status | no | — | — | yes | 73a6299646 |
| W50 | gwk308/dental-connect | Cluster: treatment-plan-data-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient — same root cause as W49 | yes | — | — | yes | 73a6299646 |
| W52 | gwk308/dental-connect | Completed surveys show empty state | data-contamination | yes | no | error-output-sufficient — count mismatch 3 vs 2 | yes | — | — | yes | 4b91233923 |
| W52 | gwk308/dental-connect | Cluster: completed-surveys-state-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient — stale data from submission test | yes | — | — | yes | 4b91233923 |
| W53 | gwk308/dental-connect | Conversation list updates after creating new conversation | race-condition | yes | no | error-output-sufficient — expected 1, got 6 | yes | — | — | yes | 48ac676085 |
| W53 | gwk308/dental-connect | Conversation list navigated repeatedly without stale state | data-contamination | yes | no | error-output-sufficient — hardcoded count 5 vs 7 | yes | — | — | yes | 48ac676085 |
| W54 | gwk308/dental-connect | Reply fails with empty message body | data-contamination | yes | yes | — | yes | PlaywrightSteps to identify count mismatch | PlaywrightSteps | yes | 5aca9a8c69 |
| W57 | gwk308/dental-connect | Cluster: recent-messages-destructive-ordering (4 tests) | data-contamination | yes | no | error-output-sufficient — missing elements after destructive delete | yes | — | — | yes | fd2b7bd41a |
| W58 | gwk308/dental-connect | Cluster: dashboard-upcoming-destructive-ordering (4 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps + Screenshot | PlaywrightSteps, Screenshot | yes | 14823434a8 |
| W59 | gwk308/dental-connect | FormEditor useEffect overwrites user input | race-condition | yes | no | error-output-sufficient — page snapshots showed stale fields | yes | — | — | yes | f644c5f09b |
| W59 | gwk308/dental-connect | Cluster: form-editor-autosave-overwrite (11 tests) | race-condition | yes | no | error-output-sufficient — auto-save feedback loop | yes | — | — | yes | f644c5f09b |
| W60 | gwk308/dental-connect | Form list navigated repeatedly without issues | data-contamination | yes | yes | — | yes | PlaywrightSteps to confirm status change | PlaywrightSteps | yes | f644c5f09b |
| W61 | gwk308/dental-connect | Cluster: seed-data-shared-acknowledgment (2 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps to find stuck step | PlaywrightSteps | yes | b1add838ba |
| W64 | gwk308/dental-connect | Cancel/close the new message compose form | race-condition | yes | no | error-output-sufficient — expected 5 vs 6 | yes | — | — | yes | 3452b96a25 |
| W64 | gwk308/dental-connect | Multiple new conversations created in succession | race-condition | yes | no | error-output-sufficient — expected 1 vs 7 | yes | — | — | yes | 3452b96a25 |
| W65 | gwk308/dental-connect | Toggle multiple notification preferences in sequence | race-condition | yes | yes | — | yes | PlaywrightSteps + NetworkRequest + Logpoint | PlaywrightSteps, NetworkRequest, Logpoint, ListSources | yes | 4a4b97c789 |
| W65 | gwk308/dental-connect | Toggle same preference on and off repeatedly | data-contamination | yes | no | error-output-sufficient — initial state wrong from DB contamination | yes | — | — | yes | 4a4b97c789 |
| W66 | gwk308/dental-connect | Cluster: password-change-data-contamination (7 tests) | data-contamination | yes | no | error-output-sufficient — all showed login failure after pw change | yes | — | — | yes | 5890e15e0f |
| W68 | gwk308/dental-connect | Cluster: pending-survey-data-contamination (2 tests) | data-contamination | yes | no | error-output-sufficient — pending count 0 | yes | — | — | yes | 09d7ebba4b |
| W69 | gwk308/dental-connect | Cluster: personal-info-useeffect-overwrite (3 tests) | race-condition | yes | yes | — | yes | NetworkRequest to trace PUT body and GET response timing | NetworkRequest | yes | 282e141189 |
| W71 | gwk308/dental-connect | Cluster: plan-history-selector-and-ordering (5 tests) | data-contamination | yes | no | error-output-sufficient — page snapshots showed collisions | no | — | — | yes | d170af5794 |
| W73 | gwk308/dental-connect | Cluster: request-form-native-validation (2 tests) | CSS/layout | no | no | error-output-sufficient — form showed no validation errors | yes | — | — | yes | 7984552146 |
| W76 | gwk308/dental-connect | User can edit comments text after initial entry | infrastructure | no | no | no-recording — dev server crashed | no | — | — | yes | 036764f266 |
| W76 | gwk308/dental-connect | Cluster: netlify-dev-server-crash (9 tests) | infrastructure | no | no | no-recording — ERR_CONNECTION_REFUSED | no | — | — | yes | 036764f266 |
| W76 | gwk308/dental-connect | Survey submission with all ratings but no comments | seed-data-mismatch | no | no | error-output-sufficient — no pending surveys remaining | yes | — | — | yes | 036764f266 |
| W76 | gwk308/dental-connect | Survey form shows the appointment context | seed-data-mismatch | no | no | error-output-sufficient — expected Consultation got X-Ray | yes | — | — | yes | 036764f266 |
| W90 | gwk308/dental-connect | Cluster: seed-data-selector-ambiguity (2 tests) | strict-mode | no | no | error-output-sufficient — strict mode multiple matching elements | yes | — | — | yes | none |
| W90 | gwk308/dental-connect | Plan history count assertion | seed-data-mismatch | no | no | error-output-sufficient — expected 2 vs actual 3 | yes | — | — | yes | none |
| W96 | gwk308/dental-connect | Clicking action item navigates to relevant page | race-condition | no | no | error-output-sufficient — timeout on login revealed auth redirect | yes | — | — | yes | none |
| W105 | gwk308/dental-connect | Edit Profile Information — page.fill timeout | CSS/layout | no | no | error-output-sufficient — fields not editable | no | — | — | yes | none |
| W105 | gwk308/dental-connect | Change Password — strict mode violation | strict-mode | no | no | error-output-sufficient — duplicate "Change Password" text | no | — | — | yes | none |
| W105 | gwk308/dental-connect | Complete a Satisfaction Survey — missing column | backend-bug | yes | no | error-output-sufficient — NeonDbError missing completed_at | no | — | — | yes | none |
| W107 | gwk308/dental-connect | Complete Intake Forms — selectOption on non-select | CSS/layout | no | no | error-output-sufficient — custom dropdown not a `<select>` | yes | — | — | yes | none |
| W107 | gwk308/dental-connect | Review Treatment Plan — wrong plan count | seed-data-mismatch | no | no | error-output-sufficient — expected 3 got 2 | yes | — | — | yes | none |
| W109 | gwk308/dental-connect | Reset Password — missing DATABASE_URL env var | infrastructure | no | no | error-output-sufficient — DATABASE_URL not available | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|-----------|
| api-routing-infrastructure | 12 tests | W49 | Fixed netlify dev routing config; single changeset resolved all |
| treatment-plan-data-contamination | 14 tests | W49, W50 | Added beforeEach API reset; changeset 73a6299646 fixed both specs |
| completed-surveys-state-contamination | 4 tests | W52 | Added state cleanup between tests; changeset 4b91233923 |
| recent-messages-destructive-ordering | 4 tests | W57 | Reordered destructive test to end; changeset fd2b7bd41a |
| dashboard-upcoming-destructive-ordering | 4 tests | W58 | Reordered destructive test to end; changeset 14823434a8 |
| form-editor-autosave-overwrite | 11 tests | W59 | Fixed useEffect to not overwrite during edits + reset in_progress forms; changeset f644c5f09b |
| seed-data-shared-acknowledgment | 2 tests | W61 | Added dedicated seed data for destructive tests; changeset b1add838ba |
| hardcoded-conversation-count | 1 test | W64 | Replaced hardcoded counts with relative counts; changeset 3452b96a25 |
| wait-before-count | 1 test | W64 | Added wait-for-data before count assertion; changeset 3452b96a25 |
| notification-prefs-data-contamination | 1 test | W65 | Added DB reset between tests; changeset 4a4b97c789 |
| password-change-data-contamination | 7 tests | W66 | Reordered destructive test to end; changeset 5890e15e0f |
| pending-survey-data-contamination | 2 tests | W68 | Reordered destructive test to end; changeset 09d7ebba4b |
| personal-info-useeffect-overwrite | 3 tests | W69 | Added isEditing guard to useEffect; changeset 282e141189 |
| plan-history-selector-and-ordering | 5 tests | W71 | Rewrote test file with proper ordering and selectors; changeset d170af5794 |
| request-form-native-validation | 2 tests | W73 | Added noValidate to form element; changeset 7984552146 |
| netlify-dev-crash | 10 tests | W76 | Reduced API calls per test, mocked sidebar; changeset 036764f266 |
| insufficient-seed-surveys | 1 test | W76 | Added more seed survey data; changeset 036764f266 |
| seed-data-selector-ambiguity | 2 tests | W90 | Narrowed selectors after seed data addition; no separate changeset |
| seed-data-count-change | 1 test | W90 | Updated count assertion to match new seed data; no separate changeset |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 14 | 38.9% |
| race-condition | 8 | 22.2% |
| infrastructure | 4 | 11.1% |
| seed-data-mismatch | 4 | 11.1% |
| CSS/layout | 3 | 8.3% |
| strict-mode | 2 | 5.6% |
| backend-bug | 1 | 2.8% |

### When was Replay most effective?

Replay was genuinely necessary in only **2 of 6 uses** (33.3%):

1. **W65 — Toggle multiple notification preferences** (race-condition): Replay's NetworkRequest + Logpoint tools traced the exact timing of API responses overwriting local state. Error output alone showed only "expected true, got false" which was insufficient to identify the useEffect race.
2. **W69 — Personal info useEffect overwrite** (race-condition): NetworkRequest revealed the PUT request body contained original values, then traced GET responses to pinpoint the unguarded useEffect. The stale-data-in-PUT pattern was not diagnosable from error output alone.

**Pattern:** Replay was most effective for **race-condition failures involving async state management** (useEffect + API response timing), where error output only shows the symptom (wrong value) but not the cause (when/why state was overwritten).

### When was Replay NOT used and why?

- **25 of 30 non-Replay failures** were diagnosed from **error output alone** — count mismatches, constraint violations, and timeout messages provided sufficient diagnostic information.
- **5 failures** were diagnosed from **page snapshots** — stale UI state (wrong status badges, missing elements) pointed directly to data contamination.
- **4 failures** had **no recording available** due to server crashes or infrastructure issues.

### Self-inflicted Failure Rate

**27.8% (10/36)** of failures were self-inflicted — introduced by the agent's own fix attempts during the session. All 10 occurred in the **checkDirectives** (3) and **JourneyQA** (6) phases, plus 1 in fixTests (W76). None occurred during the initial fixTests phase for pre-existing failures.

Self-inflicted failures were predominantly:
- **seed-data-mismatch** (4): Adding/changing seed data broke count assertions
- **CSS/layout** (3): Journey tests used wrong selectors for custom components
- **strict-mode** (2): Seed data additions created ambiguous selectors
- **infrastructure** (1): Missing env var in test environment

### Test Isolation Issues

With a **Test Isolation Score of 55.6%**, test isolation is the dominant failure mode. Analysis:

**Affected spec files:** accept-decline, active-plans, completed-surveys, conversation-list, conversation-view, dashboard-recent-messages, dashboard-upcoming, form-list, instruction-detail-acknowledge, new-message, notification-preferences, password-change, pending-surveys, plan-history

**Root causes:**
1. **Destructive tests placed mid-suite** (4 clusters, 17 tests): Tests that delete/modify all records ran before tests that expected original data. Fix: move destructive tests to end of suite.
2. **Shared mutable state via API** (6 clusters, 33 tests): Tests mutated DB state (accepting plans, submitting surveys, changing passwords) without cleanup. Fix: per-test API reset or dedicated seed data.
3. **Hardcoded count assertions** (3 entries): Tests assumed fixed record counts instead of using relative counts. Fix: capture initial count, assert relative changes.

**Key insight:** All data-contamination failures ran in **serial mode within a single spec file** — Playwright's default test isolation (separate browser context) does not protect against shared database state. The `beforeEach-reset-api` pattern and `destructive-test-reordering` pattern were the two most effective fixes.

### Common Debugging Strategies That Worked

1. **Error output triage** (most common): Count mismatches and constraint errors directly identified the root cause without any additional debugging.
2. **Destructive test reordering**: Moving state-mutating tests to the end of the suite, applied successfully across 4 spec files.
3. **beforeEach API reset**: Adding API calls to reset DB state before each test, applied across 2 spec files.
4. **useEffect guard pattern**: Adding `isEditing` guards to prevent useEffect from overwriting user input during async operations.

### Common Debugging Strategies That Failed

No complete strategy failures were observed — all 36 failures were successfully resolved. However:
- **W76 (survey-form)** required **18 re-runs** and 4 fix iterations due to cascading issues: fixing the server crash revealed seed data issues, which in turn revealed assertion mismatches. The iterative nature suggests a more thorough initial analysis would have been more efficient.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "useEffect race condition"** — When error output shows wrong values in form submissions or API requests, check for unguarded useEffect hooks that sync remote state to local state. Look for missing `isEditing`/`pendingSave` guards. Replay's NetworkRequest tool is the most effective diagnostic for this pattern.
- **Add pattern: "destructive test reordering"** — When multiple tests in a spec file fail with stale/missing data, check if a destructive test (deleting records, changing passwords, submitting forms) runs before tests that depend on original state. Move destructive tests to the end.
- **Add tool sequence: "NetworkRequest → Logpoint"** — For race conditions involving API timing, use NetworkRequest to trace request/response timing, then Logpoint to verify state management (refs, counters).

### `skills/tasks/build/testing.md`

- **Enforce test isolation at the DB level**: Add a standard `beforeEach` pattern that resets relevant DB state via API. The 55.6% test isolation score shows this is the single highest-impact improvement.
- **Require relative count assertions**: Ban hardcoded `toHaveCount(N)` in favor of capturing `initialCount` and asserting `initialCount + delta`. This would prevent 3+ failure entries.
- **Order destructive tests last by convention**: Document that tests which mutate shared state (delete all, change passwords, submit unique resources) must be placed at the end of the `test.describe` block.
- **Add `noValidate` to all custom-validated forms**: The request-form-native-validation pattern would be prevented by a build-time check.

### `skills/review/reportTestFailures.md`

- **Clarify double-counting in clusters**: When an individual failure entry is part of a cluster (same ROOT_CAUSE_CLUSTER), the template should explicitly state that TEST_FAILURES should count only the cluster entry, not both. Several analysis files appeared to double-count.
- **Add DIAGNOSED_FROM as required for cluster entries**: Currently only required for individual entries when REPLAY_USED=no, but clusters also need this field for diagnostic source effectiveness analysis.
- **Add FIX_ITERATIONS as required for cluster entries**: Several cluster entries omitted this field, making difficulty analysis incomplete.

## 5. Replay Fixes Table

### Fix 1: Reply fails with empty message body
INITIAL_CHANGESET: none
FAILING_TEST: Reply fails with empty message body
FINAL_CHANGESET: 5aca9a8c69
ASSESSMENT: Replay confirmed count mismatch (expected 2 messages, found 3) due to data contamination from prior test. REPLAY_NECESSARY=no — error output would have sufficed.

### Fix 2: Dashboard upcoming destructive ordering (4 tests)
INITIAL_CHANGESET: none
FAILING_TEST: dashboard-upcoming.spec.ts
FINAL_CHANGESET: 14823434a8
ASSESSMENT: Replay confirmed destructive test corrupted page state. PlaywrightSteps + Screenshot identified the failure point. REPLAY_NECESSARY=no — error output showed "Submitted" view instead of appointments.

### Fix 3: Form list navigated repeatedly without issues
INITIAL_CHANGESET: none
FAILING_TEST: Form list can be navigated repeatedly without issues
FINAL_CHANGESET: f644c5f09b
ASSESSMENT: Replay confirmed prior test submitted insurance form, changing its status. PlaywrightSteps identified the exact failing step. REPLAY_NECESSARY=no — error output indicated status change.

### Fix 4: Seed data shared acknowledgment (2 tests)
INITIAL_CHANGESET: none
FAILING_TEST: Acknowledging one instruction does not affect other instructions
FINAL_CHANGESET: b1add838ba
ASSESSMENT: Replay confirmed instruction was already acknowledged by earlier test. PlaywrightSteps found the stuck step. REPLAY_NECESSARY=no — the missing acknowledge button would have been apparent from error output.

### Fix 5: Toggle multiple notification preferences in sequence
INITIAL_CHANGESET: none
FAILING_TEST: Toggle multiple notification preferences in sequence
FINAL_CHANGESET: 4a4b97c789
ASSESSMENT: Replay was NECESSARY. NetworkRequest + Logpoint traced the exact race condition: API response at 3997ms returned old value, useEffect overwrote local state. Error output alone only showed "expected true, got false" — insufficient to identify the async timing root cause.

### Fix 6: Personal info useEffect overwrite (3 tests)
INITIAL_CHANGESET: none
FAILING_TEST: Save personal info with valid data
FINAL_CHANGESET: 282e141189
ASSESSMENT: Replay was NECESSARY. NetworkRequest revealed PUT request body contained original values instead of edited values, then traced GET response timing to identify the unguarded useEffect overwrite. Error output would have shown only "expected new value, got old value" without revealing the async cause.
