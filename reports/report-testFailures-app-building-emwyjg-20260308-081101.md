# Test Failures Report: app-building-emwyjg

**Generated:** 2026-03-08
**App:** vet-billing (Veterinary Clinic Invoicing & Accounts)

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 123 |
| Logs with test failures | 30 |
| Logs without test failures | 93 |
| Total distinct test failures | 57 |
| Total affected tests | ~150 |
| Total test re-runs across all logs | 55 |
| Replay usage rate | 0% (0/57) |
| Replay usage rate among debugged failures | 0% (0/~38) |
| Debugging success rate | 94% (33 successful + partial / 35 attempted) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | ~35% (~20 of 57 failures had recordings available) |
| Debugging efficiency (Replay unnecessary) | N/A (Replay never used) |
| Cascading fixes | 19 changesets resolved multiple failures (largest: 19 tests from one fix) |
| Self-inflicted failures | 7 (12% of all failure entries) |
| Unique root causes | ~44 (29 named clusters + ~15 unclustered individual failures) |
| Fix reuse rate | 4 fix patterns reused across multiple spec files |
| Pre-existing failure rate | 79% (33/42 failure entries were pre-existing) |
| Replay decision quality | N/A (Replay never used) |
| Infrastructure failure events | 1 event, 17 tests affected (excluded from failure metrics) |

### Test Isolation Score

**55%** — data-contamination (18) + strict-mode (1) + seed-data-mismatch (4) = 23 of 42 failure entries. This exceeds the 50% threshold, indicating test isolation is the dominant failure mode.

### Failure Phase Distribution

| Phase | Count | % |
|---|---|---|
| fixTests | 33 | 79% |
| checkDirectives | 5 | 12% |
| other (JourneyQA) | 4 | 10% |

### Failure Resolution Type Distribution

| Type | Count | % |
|---|---|---|
| test-code | 24 | 57% |
| app-code | 5 | 12% |
| both | 6 | 14% |
| none | 7 | 17% |

## 2. Failure Table

| Log | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|
| 58 | playwright-config-import (all tests in client-detail-view-plans.spec.ts) | infrastructure | yes | no | diagnosed from error output | no | — | — | yes | 1092a27a02 |
| 58 | seed-data-mismatch (6 tests: CLI-DV-12–17) | seed-data-mismatch | yes | no | diagnosed from error output | no | — | — | yes | 1092a27a02 |
| 60 | CLI-FM-7: Cancel button closes modal without saving | race-condition | no | no | diagnosed from error output | no | — | — | yes | none |
| 62 | DASH-OB-4: Outstanding balance updates after recording a payment | data-contamination | no | no | diagnosed from error output | yes | — | — | yes | c658d3a6b0 |
| 63 | ra1-invoice-contamination (3 tests: DASH-RA-3, RA-5, RA-6) | data-contamination | no | no | diagnosed from error output | yes | — | — | yes | 6c13581bd5 |
| 65 | DASH-TS-3: Display today's outstanding amount | data-contamination | no | no | diagnosed from error output | yes | — | — | yes | 5958e23269 |
| 66 | invoice-edit-navigation (4 tests: INV-CE-32–35) | backend-bug | yes | no | no recording available | no | — | — | yes | f67714038f |
| 66 | INV-CE-32: Edit existing invoice — patient not pre-filled | race-condition | yes | no | no recording available | no | code-inspection | — | yes | f67714038f |
| 68 | inv2-void-contamination (4 tests: INV-DV-24–27) | data-contamination | no | no | diagnosed from error-context snapshot | yes | — | — | yes | 3a98f2e942 |
| 68 | INV-DV-25: Recording payment on invoice | race-condition | yes | no | diagnosed from error-context snapshot | yes | — | — | yes | 3a98f2e942 |
| 68 | INV-DV-24: Status updates after voiding an invoice | other | no | no | diagnosed from error-context snapshot | yes | — | — | yes | 3a98f2e942 |
| 69 | inv2-payment-contamination (6 tests: INV-DV-6–12) | data-contamination | no | no | diagnosed from error-context snapshot | yes | — | — | yes | 92249ff226 |
| 69 | INV-DV-9: Updates after full payment (floating point bug) | backend-bug | yes | no | diagnosed from error-context snapshot | yes | — | — | yes | 92249ff226 |
| 70 | seed-data-count-mismatch (6 tests: INV-LV-4–12) | seed-data-mismatch | no | no | diagnosed from error output | yes | — | — | yes | 92249ff226 |
| 71 | seed-data-invoice-count (5 tests: INV-LV-16–23) | seed-data-mismatch | yes | no | diagnosed from error output | no | — | — | yes | 0a1b1fe5c5 |
| 74 | PAT-FM-8: Cancel button closes modal without saving | race-condition | yes | no | diagnosed from error output | no | — | — | yes | fce0b3c889 |
| 74 | patient-form-useeffect-refire (2 tests: PAT-FM-10, FM-13) | race-condition | yes | no | diagnosed from error output + code-inspection | no | — | — | yes | fce0b3c889 |
| 75 | PAT-LV-24: Species filter works on second use | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | a83e39d60d |
| 77 | destructive-test-ordering-payments (4 tests: PAY-LV-17–22) | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | f09e0a2596 |
| 79 | payment-plan-creation-cascade (19 tests: PP-CM-3–19) | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | 823aa1947c |
| 80 | row-click-invoice-link (17 tests: PP-DV-1–17) | CSS/layout | yes | no | diagnosed from page snapshot | no | — | — | yes | — |
| 80 | PP-DV-9: Record payment updates invoice paid amount | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | — |
| 81 | payment-plan-data-accumulation (3 tests: PP-LV-9, 10, 15) | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | 4cd52141f6 |
| 81 | payment-plan-row-click-navigation (2 tests: PP-LV-11, 12) | CSS/layout | yes | no | diagnosed from error context | no | — | — | yes | 4cd52141f6 |
| 82 | reconciliation-seed-date-and-data-contamination (6 tests: REC-RF-7–20) | data-contamination | yes | no | diagnosed from error context | no | — | — | yes | 417b734008 |
| 83 | destructive-test-ordering (2 tests: REC-RH-8, 9) | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | 5468ac45e4 |
| 83 | REC-RH-10: Newly submitted reconciliation appears at top | race-condition | no | no | diagnosed from error output | no | — | — | yes | 5468ac45e4 |
| 84 | serial-invoice-state-tracking (5 tests: PAY-RM-15–25) | data-contamination | yes | no | diagnosed from error context | no | — | — | yes | 1e86bcc978 |
| 86 | clinic-info-useeffect-overwrite (4 tests: SET-CI-2, 3, 8, 9) | race-condition | yes | no | diagnosed from error context | no | — | — | yes | d01fe0727a |
| 87 | invoice-settings-seed-mismatch (5 tests: SET-IN-1–7) | seed-data-mismatch | yes | no | diagnosed from error output | no | — | — | yes | 35cb3b7dfb |
| 87 | invoice-settings-useeffect-overwrite (2 tests: SET-IN-4, 8) | race-condition | yes | no | diagnosed from error context | no | — | — | yes | 35cb3b7dfb |
| 88 | SET-SC-4: Cancel adding a new service | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | c1eb65d29d |
| 88 | SET-SC-6: Save edited service catalog entry | backend-bug | yes | no | no recording available | no | code-inspection | — | yes | c1eb65d29d |
| 88 | SET-SC-10: Cancel removal of service catalog entry | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | c1eb65d29d |
| 88 | SET-SC-16: Add another service after first add | strict-mode | yes | no | diagnosed from error output | no | — | — | yes | c1eb65d29d |
| 88 | SET-SC-19: Updated catalog price reflected in invoice creation | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | c1eb65d29d |
| 89 | tax-settings-hardcoded-seed-values (3 tests: SET-TX-4–6) | data-contamination | yes | no | diagnosed from error output | no | — | — | yes | c746c625b7 |
| 98 | SET-SC-6: Save edited service catalog entry | backend-bug | no | no | diagnosed from error output | yes | — | — | yes | none |
| 100 | REC-RF-4: System totals show zero when no payments | data-contamination | yes | no | diagnosed from error output | yes | — | — | — | none |
| 100 | reconciliation-detail-view (3 tests: REC-RH-4, 8, 9) | CSS/layout | yes | no | diagnosed from error output | yes | — | — | — | none |
| 100 | REC-RH-7: Empty state when no reconciliation records | missing-testid | yes | no | diagnosed from error output | yes | — | — | — | none |
| 102 | payment-plan-detail-nan (2 tests: PP-LV-12, 13) | backend-bug | yes | no | diagnosed from error output + page snapshot | yes | — | — | — | none |
| 112 | patient-detail-navigation (2 tests: PAT-LV-17, 18) | race-condition | yes | no | pre-existing, out of scope | yes | — | — | — | none |
| 112 | patient-form-modal-edit-and-navigation (7 tests: PAT-FM-2–14) | backend-bug | yes | no | pre-existing, out of scope | yes | — | — | — | none |
| 114 | client-detail-navigation (2 tests: CLI-LV-15, 16) | race-condition | yes | no | pre-existing, out of scope | yes | — | — | — | none |
| 114 | client-detail-view-plans-api (7 tests: CLI-DV-12–18) | backend-bug | yes | no | pre-existing, out of scope | yes | — | — | — | none |
| 122 | Set Up Payment Plan | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | 4500cebc7c |
| 122 | Browse Client Details | missing-testid | no | no | diagnosed from error output | yes | — | — | yes | 4500cebc7c |
| 123 | Create and Send Invoice | data-contamination | no | no | diagnosed from error output | yes | — | — | yes | 8fc1bc3 |
| 123 | Record Payment | data-contamination | no | no | diagnosed from error output | yes | — | — | yes | 8fc1bc3 |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---|---|---|---|
| reconciliation-detail-view | 3 tests | 100 | Unresolved (pre-existing, out of scope) |
| payment-plan-detail-nan | 2 tests | 102 | Unresolved (pre-existing $NaN display bug) |
| patient-detail-navigation | 2 tests | 112 | Unresolved (pre-existing) |
| patient-form-modal-edit-and-navigation | 7 tests | 112 | Unresolved (pre-existing backend bug) |
| detail-page-navigation / client-detail-navigation | 2 tests | 114 | Unresolved (pre-existing) |
| client-detail-broken / client-detail-view-plans-api | 7 tests | 114 | Unresolved (pre-existing) |
| seed-data-mismatch (log 58) | 6 tests | 58 | Resolved — unified seed data expectations (1092a27a02) |
| ra1-invoice-contamination | 3 tests | 63 | Resolved — test isolation fix (6c13581bd5) |
| inv2-void-contamination | 4 tests | 68 | Resolved — beforeEach state reset (3a98f2e942) |
| inv2-payment-contamination | 6 tests | 69 | Resolved — create fresh invoice per test (92249ff226) |
| seed-data-count-mismatch | 6 tests | 70 | Resolved — updated hardcoded counts (92249ff226) |
| seed-data-invoice-count | 5 tests | 71 | Resolved — seed data count alignment (0a1b1fe5c5) |
| invoice-edit-navigation | 4 tests | 66 | Resolved — backend fix for invoice editing (f67714038f) |
| patient-form-useeffect-refire | 2 tests | 74 | Resolved — app-code fix for useEffect re-fire (fce0b3c889) |
| destructive-test-ordering-payments | 4 tests | 77 | Resolved — reordered destructive tests (f09e0a2596) |
| payment-plan-creation-cascade | 19 tests | 79 | Resolved — reordered destructive tests (823aa1947c) |
| row-click-invoice-link | 17 tests | 80 | Resolved — click non-interactive cell (test-code fix) |
| payment-plan-data-accumulation | 3 tests | 81 | Resolved — data isolation fix (4cd52141f6) |
| payment-plan-row-click-navigation | 2 tests | 81 | Resolved — click specific cell (4cd52141f6) |
| reconciliation-seed-date-and-data-contamination | 6 tests | 82 | Resolved — beforeEach data reset (417b734008) |
| destructive-test-ordering | 2 tests | 83 | Resolved — reordered destructive tests (5468ac45e4) |
| serial-invoice-state-tracking | 5 tests | 84 | Resolved — test isolation (1e86bcc978) |
| clinic-info-useeffect-overwrite | 4 tests | 86 | Resolved — useEffect editing guard (d01fe0727a) |
| invoice-settings-seed-mismatch | 5 tests | 87 | Resolved — beforeEach data reset (35cb3b7dfb) |
| invoice-settings-useeffect-overwrite | 2 tests | 87 | Resolved — useEffect editing guard (35cb3b7dfb) |
| tax-settings-hardcoded-seed-values | 3 tests | 89 | Resolved — capture current value pattern (c746c625b7) |
| netlify-function-path-parsing | 2 tests | 122 | Resolved — fixed hardcoded path segment index (4500cebc7c) |
| stale-test-data | 1 test | 123 | Resolved — test data cleanup (8fc1bc3) |

### Infrastructure Failures

| Log | Category | Tests Affected | Notes |
|---|---|---|---|
| 102 | socket-timeout | 17 (all tests in payment-plan-detail.spec.ts) | ECONNREFUSED 127.0.0.1:8888 — transient local dev server failure. Retried 3 times. |

## 3. Patterns

### Replay Usage

Replay was **never used** across all 57 test failures. In every case, the agent diagnosed failures without Replay tools. The primary diagnostic sources were:

| Diagnostic Source | Approximate Count |
|---|---|
| Error output | ~25 |
| Error-context snapshot | ~10 |
| Pre-existing / out of scope (no debugging) | ~8 |
| No recording available | ~8 |
| Code inspection | 2 |

Recordings were available in ~35% of failures but were never utilized because error output and context snapshots were sufficient for diagnosis.

### Failure Category Distribution

| Category | Count | % of Total |
|---|---|---|
| data-contamination | 18 | 43% |
| race-condition | 9 | 21% |
| backend-bug | 7 | 17% |
| seed-data-mismatch | 4 | 10% |
| CSS/layout | 3 | 7% |
| missing-testid | 2 | 5% |
| strict-mode | 1 | 2% |
| other | 1 | 2% |

**Note:** Percentages based on 42 distinct failure entries (clusters count as 1). Some entries overlap categories.

### Self-Inflicted Failure Rate

**7 of 42 failure entries (17%) were self-inflicted** — caused by the agent's own fix attempts during the session. These include:

- CLI-FM-7 (race-condition from test code)
- REC-RH-10 (race-condition — initialCount=0 before data loaded)
- SET-SC-16 (strict-mode violation introduced during fix)
- SET-SC-19 (data contamination from reordering)
- Browse Client Details (wrong test-id values)
- Create and Send Invoice (wrong client selected)
- Record Payment (stale test data)

All 7 self-inflicted failures were successfully resolved. The 17% rate is within acceptable bounds.

### Test Isolation Issues

**Test Isolation Score: 55%** (data-contamination + strict-mode + seed-data-mismatch = 23/42 entries)

This exceeds the 50% threshold, confirming test isolation is the dominant failure mode in this build.

**Affected spec files:** Nearly every spec file experienced some form of data contamination. The most severe cases:
- `payment-plan-creation.spec.ts` — 19 tests failed because a single test (PP-CM-3) created a payment plan that hid the setup button for all subsequent tests
- `payment-plan-detail.spec.ts` — 17 tests failed from row-click navigation issues compounded by stale data
- `invoice-list-view.spec.ts` — 11 tests across 2 logs with seed data count mismatches
- `reconciliation-form.spec.ts` — 6 tests with accumulated payment totals

**Root cause pattern:** Tests running in serial mode share database state. Destructive operations (creating records, voiding invoices, recording payments) contaminate state for subsequent tests.

**Isolation strategies that resolved these failures:**
1. **Destructive test reordering** (5 uses) — moving destructive tests to end of suite
2. **beforeEach data reset** (3 uses) — resetting state before each test
3. **Create fresh data per test** (1 use) — avoiding shared invoice state
4. **Capture current values** (1 use) — reading actual state instead of hardcoding expectations

### Common Debugging Strategies That Worked

1. **Error output diagnosis** — Most effective approach, used in ~60% of cases. Error messages typically contained the actual vs. expected values, making root cause clear.
2. **Error-context snapshots** — Used in ~24% of cases when error output alone was insufficient. Provided page state context.
3. **Code inspection** — Used for 2 complex failures (INV-CE-32 race-condition, SET-SC-6 backend bug) where the root cause was in app logic rather than test state.
4. **Cascading fix pattern** — 19 changesets resolved multiple failures simultaneously, with the largest resolving 19 tests at once. This indicates the agent effectively identified root causes rather than patching individual symptoms.

### Common Debugging Strategies That Failed

- **SET-SC-6 (Save edited service catalog entry)** required 8 fix iterations — the most difficult failure. The backend bug required extensive code inspection.
- **INV-CE-32 (invoice edit)** required 4 fix iterations — race condition in patient field pre-filling needed app-code changes.

### Recurring Patterns

1. **Data contamination is systemic** — 43% of all failures stem from shared database state between serial tests. This is the single largest category.
2. **Race conditions in count assertions** — Multiple failures (CLI-FM-7, REC-RH-10, PAT-FM-8) followed the same pattern: counting rows before data loaded, getting 0 instead of expected count.
3. **useEffect overwriting user edits** — 2 spec files (clinic info, invoice settings) had the same bug where a useEffect re-fetched data and overwrote in-progress form edits. Both fixed with the same `useEffect-editing-guard` pattern.
4. **Seed data drift** — 4 failures from hardcoded expectations not matching actual seed data. Tests assumed specific counts or values that changed as the app evolved.

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "data-contamination" diagnosis pattern:** When error shows unexpected values (actual > expected, wrong totals), first check if a previous test in the same describe block created/modified records. This is the most common failure mode (43%).
2. **Add "wait-before-count" pattern:** When `initialCount=0`, always wait for at least one row to appear before counting. Add to the race-condition debugging checklist.
3. **Add "useEffect-editing-guard" pattern:** For form tests that fail with reverted values, check if a useEffect re-fires and overwrites form state during editing.

### `skills/tasks/build/testing.md`

1. **Mandate test isolation by default:** Every test file should either use `beforeEach` data reset or create fresh records per test. The 55% test isolation score shows this is not happening consistently.
2. **Reorder destructive tests automatically:** Tests that create, delete, or modify shared records should always be placed last in their describe block. This pattern was applied 5 times manually — it should be a standard practice.
3. **Avoid hardcoded seed data counts:** Tests should query current state (e.g., count rows) rather than asserting hardcoded values. This prevents seed-data-mismatch failures when data evolves.
4. **Wait-for-data pattern before assertions:** Every test that counts rows or checks totals should wait for data to load before capturing baseline values. Multiple race-condition failures came from `initialCount=0`.

### `skills/review/reportTestFailures.md`

1. **Add "diagnostic source effectiveness" metric:** Track which `DIAGNOSED_FROM` values lead to successful resolution. In this report, `error-output` was sufficient for ~60% of failures — this could inform when to skip Replay.
2. **Add "fix iteration difficulty" metric to summary stats:** Track the distribution of FIX_ITERATIONS values. Failures taking 4+ iterations (like SET-SC-6 at 8 iterations) are outliers that warrant process investigation.
3. **Infrastructure failures section is well-designed** — only 1 infrastructure event in 123 logs shows the format handles edge cases well.
