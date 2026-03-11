# Test Failures Report: app-building-gkuxy5

**App:** PracticeRx (Medical / Family Practice — Prescription Manager)
**Run date:** 2026-03-11
**Logs analyzed:** worker-app-building-gkuxy5-1 through worker-app-building-gkuxy5-103

---

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 103 |
| Logs with test failures | 21 |
| Logs without test failures | 82 |
| Total distinct test failures (TEST_FAILURES entries) | 31 |
| Total test re-runs across all logs | 31 |
| Replay usage rate (Replay used / total failures) | 0 / 31 = **0%** |
| Replay usage rate among debugged failures | 0 / 31 = **0%** |
| Debugging success rate (successful / attempted) | 31 / 31 = **100%** |
| Replay-assisted success rate | N/A (Replay not used) |
| Recording availability rate | 18 / 31 = **58%** |
| Debugging efficiency (Replay used but error output would have sufficed) | N/A |
| Cascading fixes (single change resolving multiple failures) | **9** (logs 47, 50, 51, 52, 54, 58, 59, 63, 64, 65, 66) |
| Self-inflicted failures | **4** (log 55 cluster of 4, logs 102 and 103 failures) |
| Unique root causes (distinct ROOT_CAUSE_CLUSTER values) | 8 clusters + 13 individual failures = **21** |
| Fix reuse rate (distinct fix patterns applied to multiple spec files) | **3** (beforeEach cleanup, destructive test reordering, test-setup via npm run test) |
| Pre-existing failure rate | 26 / 31 = **84%** (PRE_EXISTING=yes) |
| Replay decision quality (REPLAY_NECESSARY=no among REPLAY_USED=yes) | N/A (Replay never used) |
| Total affected tests (individual tests in all failures, expanding clusters) | **72** |
| Test Isolation Score (data-contamination + strict-mode + seed-data-mismatch) | 22 / 31 = **71%** |
| Infrastructure failure events | 1 (log 41, affecting 6 tests — excluded from main metrics) |

**Failure Phase Distribution:**

| Phase | Count | % |
|---|---|---|
| fixTests | 28 | 90% |
| other (journey QA) | 3 | 10% |

**Failure Resolution Type Distribution:**

| Resolution Type | Count | % |
|---|---|---|
| test-code only | 21 | 68% |
| app-code only | 1 | 3% |
| both (app + test) | 6 | 19% |
| test-code (setup/config) | 3 | 10% |

**Fix Iteration Difficulty Distribution:**

| FIX_ITERATIONS | Count | % |
|---|---|---|
| 1 | 22 | 71% |
| 2 | 6 | 19% |
| 3 | 2 | 6% |
| 4+ | 1 | 3% |

**Resolution Effort (TOOL_CALL_COUNT when available):**

| Range | Count |
|---|---|
| 3 calls | 3 |
| 4 calls | 1 |
| 5 calls | 1 |
| 8 calls | 1 |
| 15 calls | 1 |

**Diagnostic Source Effectiveness (among successfully resolved failures):**

| DIAGNOSED_FROM | Count | % |
|---|---|---|
| error-output | 28 | 90% |
| code-inspection | 2 | 6% |
| error-output + code-inspection | 1 | 3% |

**Self-inflicted fix quality cost:**

- 4 self-inflicted failures (log 55 cluster: 4 tests; log 102: 3 failed runs; log 103: wrong-URL failure + wrong-testid failure)
- Additional test re-runs due to self-inflicted: 3 (log 55) + 0 (log 102, resolved without re-run) + 1 (log 103) = ~4 extra re-runs

---

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 43 | gkuxy5 / PracticeRx | Cancel button on edit modal discards changes (add-edit-medication-modal.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | yes | Read error; fix beforeEach cleanup | error-output | yes | 354c1cc2ec |
| 45 | gkuxy5 / PracticeRx | Action buttons update based on current status (authorization-detail-actions.spec.ts) | race-condition | yes | no | error-output-sufficient | yes | Read error; add waitForSelector after API call | error-output | yes | c0ea3a9065 |
| 47 | gkuxy5 / PracticeRx | Cluster: auth-table-data-contamination — Table displays empty state / Table rows sorted by date (authorizations-table.spec.ts, 2 tests) | data-contamination (accumulated-data) | yes | no | error-output-sufficient | yes | Add DELETE endpoint + beforeEach cleanup | error-output | yes | 486e939242 |
| 50 | gkuxy5 / PracticeRx | Cluster: summary-cards-no-month-filter — 4 summary card tests (controlled-summary-cards.spec.ts) | other (missing month filter) | yes | no | error-output-sufficient | yes | Fix app code to add month filtering; rewrite tests | error-output | yes | none |
| 51 | gkuxy5 / PracticeRx | Cluster: deny-modal-data-contamination — 3 DenyReasonModal tests (deny-reason-modal.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | yes | Add beforeEach to reset refill request state | error-output | yes | 9702f1d301 |
| 52 | gkuxy5 / PracticeRx | Cluster: interaction-alerts-data-contamination — 2 tests (interaction-alerts-tab.spec.ts) | data-contamination (accumulated-data) | yes | no | error-output-sufficient | yes | Reorder tests — non-mutating before mutating | error-output | yes | e270e003f8 |
| 52 | gkuxy5 / PracticeRx | Multiple interactions are all displayed (interaction-alerts-tab.spec.ts) | data-contamination (accumulated-data) | yes | no | error-output-sufficient | yes | Reorder tests | error-output | yes | e270e003f8 |
| 53 | gkuxy5 / PracticeRx | Overriding a Critical interaction allows saving the prescription (interaction-check-panel.spec.ts) | race-condition (stale closure) | yes | no | error-output-sufficient | yes | Extract doSave() to fix stale closure in override handler | error-output | yes | 4f7e4336b8 |
| 54 | gkuxy5 / PracticeRx | Cluster: interaction-mgmt-data-contamination — 3 tests (interaction-management.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | yes | Add test setup/cleanup hooks | error-output | yes | 2b4b4f7951 |
| 54 | gkuxy5 / PracticeRx | Add interaction with all severity levels (interaction-management.spec.ts) | race-condition (React StrictMode double-fire) | yes | no | error-output-sufficient | yes | Add deduplication check in Redux slice | error-output | yes | 2b4b4f7951 |
| 55 | gkuxy5 / PracticeRx | Table shows empty state when no medications exist (medications-table.spec.ts) | backend-bug (FK constraint) | yes | no | error-output-sufficient | yes | Fix DELETE API to cascade through prescriptions | error-output | yes | 1f10dddc3d |
| 55 | gkuxy5 / PracticeRx | Cluster: medications-table-data-contamination — 4 tests (medications-table.spec.ts) | data-contamination (destructive-ordering) | **no** (self-inflicted) | no | error-output-sufficient | yes | Move destructive test to end of suite | error-output | yes | 1f10dddc3d |
| 56 | gkuxy5 / PracticeRx | Cancel closes the modal without saving (new-authorization-modal.spec.ts) | data-contamination (accumulated-data) | yes | no | error-output-sufficient | yes | Capture initial row count; assert count unchanged after cancel | error-output | yes | a01fe2c67f |
| 57 | gkuxy5 / PracticeRx | Canceling edit discards changes (patient-header.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | yes | Capture current value before editing | error-output | yes | b8e992e8be |
| 58 | gkuxy5 / PracticeRx | Cluster: patient-search-destructive-beforeEach — 9 tests (patient-search.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | yes | Remove destructive beforeEach; DB reseeds per spec | error-output | yes | 77727a2212 |
| 59 | gkuxy5 / PracticeRx | Cluster: patients-table-destructive-beforeEach — 7 tests (patients-table.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | yes | Remove destructive beforeEach | error-output | yes | 9e4b5110a9 |
| 59 | gkuxy5 / PracticeRx | Patients table displays correct columns and data — assertion mismatch (patients-table.spec.ts) | seed-data-mismatch | yes | no | error-output-sufficient | yes | Correct expected counts / dates in test assertions | code-inspection | yes | 9e4b5110a9 |
| 59 | gkuxy5 / PracticeRx | Patients table displays correct columns and data — strict mode violation (patients-table.spec.ts) | strict-mode | yes | no | error-output-sufficient | yes | Scope CSS class selector to table body only | error-output | yes | 9e4b5110a9 |
| 60 | gkuxy5 / PracticeRx | "Save Prescription" button saves and returns to patient detail (prescription-form-actions.spec.ts) | missing-testid | yes | no | error-output-sufficient | yes | Correct testid prefix in test (med-row- → medication-row-) | error-output | yes | none |
| 61 | gkuxy5 / PracticeRx | Controlled substance checkbox reveals DEA schedule dropdown (prescription-form.spec.ts) | race-condition (stale closure) | yes | no | error-output-sufficient | no | Identify stale closure via code inspection; rewrite onChange handler | code-inspection | yes | a06ced7bd8 |
| 61 | gkuxy5 / PracticeRx | Quantity field accepts positive numbers (prescription-form.spec.ts) | other (sequential typing test technique) | yes | no | error-output-sufficient | no | Fix test to use fill() instead of sequential type() | error-output | yes | a06ced7bd8 |
| 63 | gkuxy5 / PracticeRx | Cluster: refill-bulk-actions-count-mismatch — 7 tests (refill-bulk-actions.spec.ts) | data-contamination (accumulated-data) | yes | no | error-output-sufficient | no | Add beforeEach cleanup; filter for pending-only | error-output | yes | 94358d3fab |
| 63 | gkuxy5 / PracticeRx | Cluster: refill-bulk-actions-timeout — 2 tests (refill-bulk-actions.spec.ts) | data-contamination (accumulated-data) | yes | no | error-output-sufficient | no | Add beforeEach cleanup; filter for pending-only | error-output | yes | 94358d3fab |
| 64 | gkuxy5 / PracticeRx | Cluster: refill-queue-actions-jane-approved — 2 tests (refill-queue-table-actions.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | no | Use different request per test; create fresh request for tests 6–7 | error-output | yes | 1286daec6f |
| 65 | gkuxy5 / PracticeRx | Cluster: refill-queue-table-destructive-ordering — 2 tests (refill-queue-table.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | no | Reorder tests; move destructive test last | error-output | yes | bddf91a128 |
| 66 | gkuxy5 / PracticeRx | Cluster: refill-requests-tab-status-contamination — 6 tests (refill-requests-tab.spec.ts) | data-contamination (destructive-ordering) | yes | no | error-output-sufficient | no | Add createPendingRefillRequest helper; create fresh request per test | error-output | yes | e3aeafede1 |
| 102 | gkuxy5 / PracticeRx | Cluster: wrong-test-execution-setup — journey-write-prescription.spec.ts (3 failed runs) | test-setup-error (wrong test runner / wrong URL) | **no** (self-inflicted) | no | error-output-sufficient | no | Read testing.md; use npm run test instead of npx playwright test | error-output | yes | none |
| 103 | gkuxy5 / PracticeRx | Journey: Write a New Prescription (wrong URL — LegalLedger instead of PracticeRx) | test-setup-error (wrong URL) | **no** (self-inflicted) | no | error-output-sufficient | no | Deploy PracticeRx to its own Netlify site | error-output | yes | none |
| 103 | gkuxy5 / PracticeRx | Journey: Track Prior Authorization Status (wrong testids in new journey test) | missing-testid | **no** (self-inflicted) | no | error-output-sufficient | no | Check component source for correct testids; rewrite test selectors | error-output | yes | none |

---

## Root Cause Clusters

| Cluster | Count (TEST_FAILURES entries) | Logs | Resolution |
|---|---|---|---|
| data-contamination-destructive-ordering | 13 (multiple clusters) | 43, 51, 55 (self), 57, 58, 59, 64, 65, 66 | Remove destructive beforeEach hooks; reorder tests; use fresh data per destructive test |
| data-contamination-accumulated-data | 6 | 47, 52, 56, 63 | Add beforeEach cleanup; filter for expected state before asserting |
| race-condition | 4 | 45, 53, 54, 61 | Add waits after API calls; fix stale closures; add Redux deduplication |
| seed-data-mismatch | 1 | 59 | Align test assertions with actual seed data |
| strict-mode | 1 | 59 | Scope element selectors to avoid matching both headers and cells |
| missing-testid | 3 | 60, 103 | Correct testid prefixes; check component source for actual attributes |
| test-setup-error | 2 | 102, 103 (self) | Read testing.md; use npm run test; deploy app before running journey tests |
| backend-bug | 1 | 55 | Fix DELETE API cascade to walk FK dependency chain |

---

## 3. Patterns

### When was Replay most effective?

Replay was **never used** in this run. All 31 failures were diagnosed and resolved using error output alone or code inspection. The REPLAY_USED flag is `no` for every single failure.

### When was Replay NOT used and why?

Replay was not used in any failure. The dominant reason across all 31 failures was:

- **error-output-sufficient** (28/31, 90%): Error messages, context snapshots, and test output directly revealed the root cause — mismatched counts, wrong element state, stale data, wrong testid, wrong URL, etc.
- **code-inspection** (2/31, 6%): The root cause was a logic bug (stale closure, wrong seed data count) that required reading component code, not runtime observation.
- **Recording unavailable** (13/31, 42%): In the latter half of the fixTests phase (logs 61–66), recordings were not available, ruling Replay out even if desired.

### Common debugging strategies that worked / failed

**Worked:**
1. **Read error output → fix test selector / assertion** — highly effective for data contamination and missing-testid failures; accounted for 90% of resolutions.
2. **Add beforeEach cleanup helpers** — a reliable pattern for both accumulated-data and destructive-ordering contamination; applied in 8+ spec files.
3. **Reorder tests (destructive last)** — effective for destructive-ordering failures without requiring per-test DB reset.
4. **Create fresh data per test** — used when tests inherently modify shared state (approve/deny refill requests, etc.).
5. **Code inspection of component source** — used for two stale-closure bugs that couldn't be inferred from error output alone.

**Failed / Inefficient:**
1. **Fixing FK constraint without reordering tests** (log 55) — fixing the backend DELETE cascade was correct, but without moving the destructive test to the end of the suite, 4 more tests broke; required 3 iterations.
2. **Running npx playwright test directly** (log 102–103) — repeatedly using the wrong test runner (bypassing the DB seeding script) caused 3 failed runs before consulting testing.md.
3. **High iteration count for stale closure** (log 61) — took 4 fix iterations and 15 tool calls; the stale closure required multiple attempted fixes before a clean refactor.

### Recurring Failure Categories

**Failure Category Distribution:**

| Category | Count | % of Total |
|---|---|---|
| data-contamination | 19 | 61% |
| race-condition | 4 | 13% |
| missing-testid | 3 | 10% |
| test-setup-error | 2 | 6% |
| other | 2 | 6% |
| seed-data-mismatch | 1 | 3% |
| strict-mode | 1 | 3% |
| backend-bug | 1 | 3% |

**Data-contamination is dominant at 61%** (19/31 failures). Breakdown by sub-category:

| Sub-category | Count | % of data-contamination |
|---|---|---|
| destructive-ordering | 13 | 68% |
| accumulated-data | 6 | 32% |

**Destructive-ordering** is the primary sub-category: tests that modify or delete shared data (approve/deny refill requests, delete medications, edit patient phone) break subsequent tests in the same spec file. The DB is seeded once per spec run, not per test.

### Self-inflicted Failure Rate Analysis

4 failures out of 31 were self-inflicted (13%):

1. **Log 55** — Fixing the FK backend bug allowed the empty-state test to delete all medications, which then broke 4 other tests. The agent fixed the backend without also moving the destructive test last.
2. **Log 102** — Agent ran `npx playwright test` directly 3 times instead of using `npm run test`, pointing at the wrong app or an unseeded DB.
3. **Log 103** — Journey tests initially pointed at the wrong deployed URL (LegalLedger site); also wrote a journey test with incorrect testid selectors without verifying against component source.

All 4 self-inflicted failures were resolved. However, they added ~4 extra re-runs and ~16 extra tool calls.

### Test Isolation Issues

Test isolation score: **71%** (22 / 31 failures attributable to data-contamination, strict-mode, or seed-data-mismatch).

This is above the 50% threshold, indicating a systemic test isolation problem in this codebase. The DB is seeded once per spec file run (not per individual test), making every test that modifies data a potential contamination source for later tests in the same file. The fix pattern of adding beforeEach cleanup hooks was applied reactively 8+ times rather than being built in from the start.

---

## 4. Recommendations

### `skills/tasks/build/testing.md`

1. **Mandate beforeEach cleanup for any test that modifies state.** When writing tests for components that create/update/delete records, require a `beforeEach` hook that resets the relevant table rows via the API. Do not rely on test ordering to preserve a clean state.

2. **Explicitly forbid placing destructive tests mid-suite.** Any test that deletes all rows (empty-state tests) must be placed last in the spec file, with a clear comment explaining why.

3. **Add a section on cascade-delete ordering.** When fixing a backend DELETE endpoint to cascade, immediately check the test suite for any test that relies on the deleted data existing later in the file — fix both in the same changeset.

4. **Document that `npm run test` is the only valid test runner.** Emphasize that `npx playwright test` bypasses DB branch creation and seeding. The correct command is always `npm run test`. Add a callout warning against running playwright directly.

5. **For journey tests: deploy the app before writing tests.** Journey tests against a deployed URL require that the correct app has been deployed and the production DB seeded. Verify the URL in `playwright.config.ts` before writing selectors.

### `skills/debugging/*.md`

1. **Create `skills/debugging/test-isolation.md`** covering the data contamination patterns observed here: destructive-ordering, accumulated-data, and seed-data-mismatch. Include canonical fixes: beforeEach cleanup helpers, test reordering, fresh-data-per-test patterns.

2. **Create `skills/debugging/stale-closure.md`** covering how to recognize stale closures in React (symptoms: navigation doesn't happen after user action, state appears not to update). Include the canonical fix: extract a `doSave()` function that reads current state at call time instead of capturing it in a closure.

3. **Add to `skills/debugging/README.md`:** When a test failure shows a wrong count or wrong value that was correct in an earlier test, assume data contamination before checking app logic. The fastest diagnostic path is to check whether any earlier test in the same file modifies the same records.

### `skills/review/reportTestFailures.md`

1. **Track self-inflicted failures separately.** The current analysis surface the self-inflicted flag, but the report should explicitly call out the pattern: fixing a backend issue without simultaneously checking whether the fix creates new test ordering problems.

2. **Add "Recording availability rate" as a first-class metric.** In this run it was 58% — significantly lower in the second half of the fixTests phase (0% for logs 61–66). This metric should trigger a warning if below 50%.

3. **Add "Test isolation score" warning threshold.** If test isolation score exceeds 50%, flag it as a systemic issue requiring a broader fix (e.g., mandating beforeEach cleanup helpers in all spec files that modify data).

---

## 5. Replay Fixes Table

Replay was not used in any failure in this run. There are no entries for this table.

*All 31 failures were diagnosed and resolved using error output or code inspection. The recording availability rate was 58% (18/31 failures had recordings available but were not used). In no case was Replay necessary to resolve the failure.*

---

## Infrastructure Failures (separate from main metrics)

| Log | Category | Affected Tests | Recording Available | Diagnosed From | Notes |
|---|---|---|---|---|---|
| 41 | other | 6 (active-medications-tab-actions.spec.ts) | no | error-output | NEON_PROJECT_ID not loaded from .env (dotenv not called in test.ts); Playwright config had wrong `replayDevices` import; missing webServer config. Fixed by adding dotenv, correcting imports, adding actionTimeout/navigationTimeout/webServer, and fixing nested suite parsing in results parser. All 6 tests passed after fix. |

