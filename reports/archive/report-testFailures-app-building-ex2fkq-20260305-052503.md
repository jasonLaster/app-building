# Test Failures Report: app-building-ex2fkq-20260305-052503

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 66 |
| Logs with test failures | 4 |
| Logs without test failures | 62 |
| Total distinct test failures | 5 |
| Replay usage rate | 60% (3/5) |
| Replay usage rate among debugged failures | 60% (3/5) |
| Debugging success rate | 100% (5/5) |
| Replay-assisted success rate | 100% (3/3) |
| Recording availability rate | 100% (5/5) |
| Debugging efficiency (Replay used but unnecessary) | 1 of 3 Replay-used failures (log 28: timeout diagnosed via Replay but error output would have sufficed) |
| Cascading fixes | 1 (changeset 71dfe09 resolved 2 test failures in services-new-form) |
| Total test re-runs | 4 |
| Unique root causes | 4 (2 failures in log 41 shared a single root cause) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 28 | ex2fkq / KeyWorks | CustomerDetail Service History shows all jobs | timeout | yes | yes | | yes | PlaywrightSteps → NetworkRequest → InspectElement | PlaywrightSteps, NetworkRequest, InspectElement | yes | none |
| 33 | ex2fkq / KeyWorks | TodaysSchedule orders jobs by scheduled time | seed-data-mismatch | yes | yes | | yes | NetworkRequest to inspect API sort order | NetworkRequest | yes | 12eebd2 |
| 34 | ex2fkq / KeyWorks | JobDetail shows editable scheduled date and time fields | backend-bug | yes | yes | | yes | NetworkRequest to inspect PUT response payload | NetworkRequest | yes | none |
| 41 | ex2fkq / KeyWorks | NewServiceForm create service with all fields populated | backend-bug | yes | no | diagnosed from error output | yes | | | yes | 71dfe09 |
| 41 | ex2fkq / KeyWorks | NewServiceForm base price rejects negative values | backend-bug | yes | no | diagnosed from error output | yes | | | yes | 71dfe09 |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---|---|---|---|
| services-new-form-backend-validation | 2 | 41 | Single changeset (71dfe09) fixed both failures — backend validation/creation bug in services API |

## 3. Patterns

### When Replay was most effective
- **Backend data bugs** (logs 33, 34): NetworkRequest was the key tool, revealing mismatches between API response data and frontend expectations (AM/PM sort order, ISO timestamp format). These were not obvious from Playwright error output alone.
- **NetworkRequest** was the most commonly used and most valuable Replay tool (used in all 3 Replay-assisted debugging sessions).

### When Replay was NOT used and why
- **Clear error output** (log 41, 2 failures): The Playwright error messages directly indicated the backend returned unexpected values, making Replay unnecessary. The agent correctly diagnosed and fixed both failures from test output alone.

### Common debugging strategies that worked
1. **NetworkRequest-first**: Inspecting API responses was the dominant strategy (3/3 Replay sessions). This is effective for data-mismatch and backend-bug categories.
2. **PlaywrightSteps for timeout diagnosis**: Used in log 28 to identify which step was slow, then NetworkRequest/InspectElement to confirm the app was functioning correctly (just slow under Replay instrumentation).
3. **Error output triage**: For straightforward backend errors, reading Playwright output was sufficient — no need to load recordings.

### Common debugging strategies that failed
- None. All 5 debugging attempts succeeded on the first try.

### Recurring failure categories
- **backend-bug**: 3/5 failures (60%) — the most common category. All were data format or validation issues in Netlify functions.
- **seed-data-mismatch**: 1/5 — AM/PM time format causing incorrect SQL sort order.
- **timeout**: 1/5 — Replay Chromium instrumentation overhead, resolved with test.slow().

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: "NetworkRequest-first for data assertion failures"** — When a test fails on expected vs actual data values, check the API response via NetworkRequest before inspecting the DOM. This was the most effective strategy in this report (3/3 successes).
- **Add pattern: "Skip Replay for clear error output"** — When Playwright error messages include the expected/actual values and the mismatch points directly to a code bug, diagnose from output. This saves time (2 failures resolved without Replay in this report).

### `skills/tasks/build/testing.md`
- **Seed data format validation**: Add a pre-test check or convention that time values in seed data use 24-hour format to avoid text-based sorting issues (root cause of log 33 failure).
- **Backend response format consistency**: Ensure API functions return date fields in a consistent format (either always ISO or always YYYY-MM-DD), not mixed formats that cause frontend parsing issues (root cause of log 34 failure).

### `skills/review/reportTestFailures.md`
- **REPLAY_NECESSARY field consistency**: Log 33 analysis omitted the REPLAY_NECESSARY field despite REPLAY_USED being yes. The template should emphasize this field is required whenever REPLAY_USED is yes.
- **Shared-changeset clustering**: When multiple failures are fixed by the same changeset, the analysis template should encourage using ROOT_CAUSE_CLUSTER to explicitly link them, rather than relying on the synthesizer to infer the relationship from matching changeset SHAs.
