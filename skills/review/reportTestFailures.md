# Report Definition: Test Failures

This file defines the analysis template and synthesis instructions for a test-failures report.
It is referenced by `analyzeLogs.md` and `synthesizeReport.md` during report generation.

## Per-Log Analysis Template

For each log file, produce a markdown file with the following structure:

```
# <log filename>

## Summary
NOTES: <brief summary of what this log was about>

## Test Failures
TEST_FAILURES: <count of distinct test failures in this log, 0 if none>
TEST_RERUNS: <number of test re-runs needed in this log to achieve all-pass, 0 if all passed on first run>

For each test failure:

### Failure: <test name>
FAILURE_CATEGORY: <one of: timeout, strict-mode, data-contamination, CSS/layout, backend-bug, missing-testid, seed-data-mismatch, infrastructure, spa-redirect, recording-upload-failure, other>
PRE_EXISTING: yes/no (yes = failure existed before the current work and is unrelated)
REPLAY_USED: yes/no (yes = agent actively called mcp__replay__* tools to analyze a recording)
REPLAY_NOT_USED_REASON: <if REPLAY_USED is no, explain why — e.g. "diagnosed from error output", "no recording available", "upload failed">
RECORDING_AVAILABLE: yes/no (no = recording upload failed, infrastructure failure, or no recording was created)
DEBUGGING_ATTEMPTED: yes/no (no = failure was only identified/discovered, no debugging was done — e.g. initial discovery runs)
DEBUGGING_SKIPPED_REASON: <if DEBUGGING_ATTEMPTED is no, explain why — e.g. "pre-existing and out of scope", "infrastructure failure with no recording", "transient timeout, retried successfully". Omit if DEBUGGING_ATTEMPTED is yes.>
DEBUGGING_SUCCESSFUL: yes/no/partial (only meaningful when DEBUGGING_ATTEMPTED is yes)
REPLAY_NECESSARY: yes/no/unknown (REQUIRED when REPLAY_USED is yes — was Replay actually needed to diagnose the issue? "no" means error output alone would have sufficed. "unknown" if unclear. Omit when REPLAY_USED is no.)
ROOT_CAUSE_CLUSTER: <optional — when multiple failures share a single root cause, use a shared cluster ID (e.g. "replay-browser-timeout", "missing-env-var"). IMPORTANT: Always use this field when failures are fixed by the same changeset, so the synthesizer can explicitly link them rather than inferring from matching SHAs. Omit if this failure has a unique root cause.>
SELF_INFLICTED: yes/no (yes = failure was introduced by a fix attempt during the current session, not from the original code. Helps measure fix quality.)
FAILURE_PHASE: <one of: writeTests, fixTests, checkDirectives, deployment, other> (which phase of the workflow produced this failure)
FAILURE_RESOLUTION_TYPE: <one of: test-code, app-code, both, none> (whether the fix was to test code, app code, or both. "none" if not yet resolved. Helps identify whether the testing process or the app-building process needs improvement)

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: <what the Replay analysis revealed>
DEBUGGING_STRATEGY: <how the agent approached debugging — e.g. "PlaywrightSteps to find stuck step, then Screenshot to see page state">
TOOLS_USED: <comma-separated list of mcp__replay__* tools called>

#### Resolution
CHANGESET_REVISION: <git SHA from "CHANGESET REVISION:" line in log, or "none". Note: this captures the commit that fixed the issue. If the fix was applied during the same test-fixing session and no separate "CHANGESET REVISION:" line was emitted, use "none".>
FAILING_TEST: <test name from "FAILING TEST:" line in log, or "none">
CASCADING_FIX_COUNT: <number of distinct test failures resolved by this changeset, if > 1. Omit if only 1 test was fixed or changeset is "none".>
```

If a log has no test failures, just write the Summary section with TEST_FAILURES: 0.

### Clustered Failures

When 5+ failures in the same log share a single ROOT_CAUSE_CLUSTER, collapse them into a
single cluster entry instead of repeating the full template for each. The cluster heading
name (e.g., `Failure Cluster: neon-inherited-data`) serves as the cluster ID when using
this collapsed format — an explicit `ROOT_CAUSE_CLUSTER` field is not needed in each entry:

```
### Failure Cluster: <ROOT_CAUSE_CLUSTER> (<count> tests)
FAILURE_CATEGORY: <category>
PRE_EXISTING: yes/no
REPLAY_USED: yes/no
REPLAY_NOT_USED_REASON: <reason>
RECORDING_AVAILABLE: yes/no
DEBUGGING_ATTEMPTED: yes/no
DEBUGGING_SKIPPED_REASON: <reason if not attempted>
AFFECTED_TESTS: <comma-separated list of test names>
```

### Infrastructure Failures

Infrastructure failures (socket timeouts, navigation timeouts with no page load, network
errors that prevent recordings) are fundamentally different from application bugs. When a
log contains only infrastructure failures, use this lightweight format instead of the full
failure template:

```
## Infrastructure Failures
INFRA_FAILURE_COUNT: <count>
INFRA_CATEGORY: <socket-timeout | navigation-timeout | network-error | other>
AFFECTED_TESTS: <comma-separated list or "all tests in <spec file>">
RECORDING_AVAILABLE: no
NOTES: <brief description of the infrastructure issue>
```

**Important**: Infrastructure failures are NOT counted in the TEST_FAILURES total or the Summary
Statistics failure counts. They are reported separately. The Summary Statistics section should
include an "Infrastructure failure events" row showing the count of infrastructure events and
total affected tests, making it explicit that these are excluded from the main failure metrics.

## Report Synthesis

Compile all analysis files into a single report with these sections:

### 1. Summary Statistics
- Total logs analyzed
- Logs with test failures / logs without
- Total distinct test failures across all logs
- Replay usage rate (failures where Replay was used / total failures)
- Replay usage rate among debugged failures (failures where Replay was used / failures where debugging was attempted)
- Debugging success rate (successful + partial / total failures where debugging was attempted)
- Replay-assisted success rate (successful among Replay-used failures)
- Recording availability rate (failures where recording was available / total failures)
- Debugging efficiency (failures where Replay was used but error output alone would have sufficed — helps optimize when to use Replay vs trust error output)
- Cascading fixes (count of single code changes that resolved multiple test failures — signals high-value debugging efforts)
- Self-inflicted failures (count of failures caused by the agent's own fix attempts during the session, from SELF_INFLICTED field — helps measure fix quality)
- Total test re-runs across all logs (number of test re-runs needed to achieve all-pass)
- Unique root causes (count of distinct ROOT_CAUSE_CLUSTER values + unclustered failures — when a cluster of N tests fails due to 1 root cause, count it as 1 unique root cause, not N failures)
- Fix reuse rate (count of distinct fix patterns applied to multiple spec files — e.g., the same wait-for-row pattern applied across 3 spec files counts as 1 reused fix. Identifies opportunities for shared test utilities or fixture improvements)
- Failure phase distribution (breakdown by FAILURE_PHASE — e.g., writeTests: 5, fixTests: 72, deployment: 3. Highlights if failures are concentrated in a specific phase)
- Test Isolation Score (percentage of failures attributable to test isolation issues: data-contamination + strict-mode + seed-data-mismatch categories combined. A high score (>50%) signals that test isolation is the dominant failure mode and warrants dedicated process improvements)

### 2. Failure Table
A markdown table with columns:
| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |

One row per test failure across all logs. The "Worker/App" column identifies which worker and
app the failure belongs to (important for multi-worker reports). The "Replay Not Used Reason"
column should contain a brief reason when Replay was not used (e.g., "diagnosed from error
output", "no recording available", "not attempted — discovery run"). Leave blank when Replay
was used.

### Root Cause Clusters
When failures share a `ROOT_CAUSE_CLUSTER`, summarize them in a table:
| Cluster | Count | Logs | Resolution |
One row per unique cluster ID, showing how many failures shared that root cause, which logs
they appeared in, and whether a single fix resolved them all.

### 3. Patterns
- When was Replay most effective? (failure categories, tool sequences)
- When was Replay NOT used and why?
- Common debugging strategies that worked
- Common debugging strategies that failed
- Recurring failure categories — include a "Failure Category Distribution" table:
  | Category | Count | % of Total |
  showing the breakdown by FAILURE_CATEGORY. This is one of the most actionable outputs.
- **Self-inflicted failure rate** — prominently report the percentage of failures that were
  self-inflicted (from SELF_INFLICTED field). This is a key quality signal for the test-writing
  process. A high rate (>50%) indicates systematic issues with how tests are written.
- **Test Isolation Issues** — when data-contamination + strict-mode + seed-data-mismatch
  categories collectively account for >50% of failures, include a dedicated subsection
  analyzing test isolation patterns: which spec files are affected, whether serial execution
  is the root cause, and what isolation strategies would have prevented the failures.

### 4. Recommendations
Target these files with specific, actionable recommendations:
- `skills/debugging/*.md` — New patterns, tool sequences, or categories to add
- `skills/tasks/build/testing.md` — Process improvements for the testing workflow
- `skills/review/reportTestFailures.md` — Improvements to this report template itself
