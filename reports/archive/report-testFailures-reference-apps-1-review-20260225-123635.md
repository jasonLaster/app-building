# Test Failures Report: reference-apps-1-review

Generated: 2026-02-25

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 69 |
| Logs with test failures | 4 |
| Logs without test failures | 65 |
| Total distinct test failures | 15 |
| Total test re-runs across all logs | 9 |
| Replay usage rate | 20.0% (3 / 15) |
| Debugging success rate (excl. pre-existing) | 100.0% (3 / 3) |
| Replay-assisted success rate | 100.0% (3 / 3) |
| Recording availability rate | 53.3% (8 / 15) |

**Notes:**
- 12 of 15 failures were pre-existing (present before the current work).
- All 3 non-pre-existing failures were debugged successfully.
- 7 failures had no recording available — all from the initial Accounting test discovery run where tests were run without Replay browser configured.

## 2. Failure Table

| Log | Test | Category | Pre-existing | Replay Used | Recording Available | Strategy | Tools | Success | Changeset |
|-----|------|----------|-------------|-------------|--------------------|-----------:|-------|---------|-----------|
| knfcm0-14 | CategorySection shows correct category totals | backend-bug | yes | no | no | — | — | no | none |
| knfcm0-14 | AccountCard displays account name and balance | other | yes | no | no | — | — | no | none |
| knfcm0-14 | AccountCard three-dot menu opens actions | other | yes | no | no | — | — | no | none |
| knfcm0-14 | AccountCard click navigates to AccountDetailPage | other | yes | no | no | — | — | no | none |
| knfcm0-14 | AccountCard displays savings goal progress | other | yes | no | no | — | — | no | none |
| knfcm0-14 | AccountCard displays investment performance | other | yes | no | no | — | — | no | none |
| knfcm0-14 | AccountCard displays liability-specific information | strict-mode | yes | no | no | — | — | no | none |
| knfcm0-63 | RUN-ACT-2 | seed-data-mismatch | yes | no | yes | — | — | yes | none |
| knfcm0-63 | CAL-GRID-4 | seed-data-mismatch | yes | no | yes | — | — | yes | none |
| knfcm0-63 | CAL-GRID-15 | infrastructure | yes | yes | yes | PlaywrightSteps → Logpoint → Screenshot | PlaywrightSteps, Screenshot, ConsoleMessages, SearchSources, Logpoint | yes | none |
| knfcm0-63 | RUN-HDR-10 | other | no | no | yes | — | — | yes | none |
| knfcm0-63 | CAL-GRID-2 | timeout | yes | yes | yes | PlaywrightSteps to see step durations | PlaywrightSteps | yes | none |
| knfcm0-63 | CAL-GRID-12 | timeout | yes | no | yes | — | — | yes | none |
| knfcm0-65 | Deployment test - App loads, displays data, and supports updates | other | no | no | no | — | — | yes | none |
| knfcm0-76 | Sign In form submission with valid credentials | backend-bug | no | yes | yes | PlaywrightSteps → NetworkRequest | PlaywrightSteps, NetworkRequest | yes | none |

## 3. Patterns

### When Replay was most effective

Replay was used for 3 failures and achieved 100% debugging success in those cases. It was most effective for:

- **Infrastructure/browser-level issues (CAL-GRID-15):** Replay's `Logpoint` tool confirmed that `handleDrop` had 0 hits, proving Playwright's `dragTo` never fired the HTML5 drop event in the Replay browser. This would have been very difficult to diagnose from test output alone.
- **Backend state bugs (Sign In form):** `NetworkRequest` inspection revealed the second auth API call was sending `action: "signup"` instead of `action: "signin"`, immediately pinpointing a state reset bug. This pattern — comparing sequential network requests — is a strong Replay use case.
- **Timeout root-cause analysis (CAL-GRID-2):** `PlaywrightSteps` showed that 28+ individual assertions each took ~2s, exceeding the 60s timeout. This guided the fix to batch assertions via `page.evaluate`.

**Effective tool sequences:**
1. `PlaywrightSteps` → `Logpoint` → `Screenshot` (for UI interaction failures)
2. `PlaywrightSteps` → `NetworkRequest` (for backend/API state bugs)
3. `PlaywrightSteps` alone (for timeout/performance diagnosis)

### When Replay was NOT used and why

- **Initial test discovery run (7 failures, knfcm0-14):** No recording available — tests were run before Replay browser was configured. The agent only identified failures and queued fix subtasks.
- **Clear error output (4 failures):** The test failure messages contained enough information to diagnose the issue directly. Examples:
  - `seed-data-mismatch`: Error showed expected "500 Units" vs actual "500.00 Units" — clearly a decimal formatting issue.
  - `RUN-HDR-10`: Regression from the quantity formatting fix was obvious from the error message.
  - `CAL-GRID-12`: Same root cause as CAL-GRID-2, already diagnosed from the same recording.
  - `Deployment test`: Failure was after page reload on pagination — simplified test to remove reload.

### Common debugging strategies that worked

1. **Diagnose from error output first:** 8 of 12 non-Replay failures were diagnosed directly from test error messages. This is efficient when the error message is descriptive enough.
2. **PlaywrightSteps as entry point:** All 3 Replay-assisted diagnoses started with `PlaywrightSteps` to identify which step failed and get timing information. This is a reliable first tool.
3. **Batch formatting fixes:** When the `quantity-decimal-formatting` cluster was identified, a single formatting utility fix resolved 3 related failures at once.
4. **Simplifying flaky tests:** For the deployment test, removing the page reload assertion eliminated the flakiness without losing meaningful coverage.

### Common debugging strategies that failed

- **No failed strategies observed in this dataset.** All debugging attempts that were made (8 out of 15 failures) succeeded. The 7 failures marked as `debugging_successful: no` were all from the initial discovery run (knfcm0-14) where no debugging was attempted — the agent only identified failures and queued them for later fixing.

### Recurring failure categories

| Category | Count | Notes |
|----------|-------|-------|
| other | 6 | 5 from initial AccountCard discovery run (never diagnosed in this log), 1 regression |
| seed-data-mismatch | 2 | Both from NUMERIC(15,2) returning decimal strings |
| timeout | 2 | Both from excessive per-assertion latency in calendar tests |
| backend-bug | 2 | 1 category total mismatch, 1 auth state bug |
| strict-mode | 1 | Accounting AccountCard |
| infrastructure | 1 | Playwright dragTo not firing HTML5 events in Replay browser |

**Root cause clusters:**
- `quantity-decimal-formatting` (3 failures): PostgreSQL `NUMERIC(15,2)` columns return string values like "500.00" instead of integer "500". Affects both test assertions and UI display.
- `auth-form-state-reset` (1 failure): Auth mode state not reset when switching between sign-in and sign-up flows.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "PlaywrightSteps-first" triage.** Document that `PlaywrightSteps` should always be the first Replay tool called when diagnosing test failures. It provides step timing, identifies which step failed, and guides which tool to use next (NetworkRequest for API issues, Logpoint for missing event handlers, Screenshot for visual state).
- **Add pattern: Network request comparison.** When a test fails on a repeated action (e.g., sign-in after sign-out), use `NetworkRequest` to compare the request payloads of the first (successful) and second (failed) attempts. State mutation bugs often manifest as incorrect payloads in subsequent requests.
- **Add category guidance for `seed-data-mismatch`.** When test assertions fail on numeric values, check whether the database column type (e.g., `NUMERIC(15,2)`) returns decimal strings. The fix is usually a formatting utility, not a test change.

### `skills/tasks/build/testing.md`

- **Ensure Replay browser is installed before first test run.** The Accounting app's initial test run (knfcm0-14) had 7 failures with no recordings because the Replay browser wasn't configured yet. The testing workflow should install and verify the Replay browser before running any tests, not after failures are discovered.
- **Run formatting-sensitive tests with explicit formatting assertions.** When seed data uses `NUMERIC` or `DECIMAL` columns, tests should expect the formatted output (e.g., "500" not "500.00") or the test writing skill should document the expected format.

### `skills/review/reportTestFailures.md`

- **Clarify "debugging_successful: no" vs "not attempted".** The current template doesn't distinguish between "debugging was attempted and failed" vs "debugging was not attempted (discovery run only)." Consider adding a `DEBUGGING_ATTEMPTED: yes/no` field to avoid inflating failure rates. In this report, 7 of 7 "no" results were actually "not attempted."
- **Add `REPLAY_NOT_USED_REASON` to the failure table.** The current table template omits this field, but it's the most informative field for understanding Replay adoption gaps. Adding a truncated version to the table would make the report more scannable.
- **Consider excluding discovery-run failures from Replay usage statistics.** When tests are run purely to identify which ones fail (no debugging attempted), including those failures in the "Replay not used" count skews the rate downward. A separate "Replay usage rate (among debugged failures)" metric would be more meaningful: 3/8 = 37.5% in this dataset.
