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
ROOT_CAUSE_CLUSTER: <optional — when multiple failures share a single root cause, use a shared cluster ID (e.g. "replay-browser-timeout", "missing-env-var"). Omit if this failure has a unique root cause.>

#### Replay Usage (if REPLAY_USED is yes)
OUTCOME: <what the Replay analysis revealed>
DEBUGGING_STRATEGY: <how the agent approached debugging — e.g. "PlaywrightSteps to find stuck step, then Screenshot to see page state">
TOOLS_USED: <comma-separated list of mcp__replay__* tools called>

#### Resolution
CHANGESET_REVISION: <git SHA from "CHANGESET REVISION:" line in log, or "none". Note: this captures the commit that fixed the issue. If the fix was applied during the same test-fixing session and no separate "CHANGESET REVISION:" line was emitted, use "none".>
FAILING_TEST: <test name from "FAILING TEST:" line in log, or "none">
```

If a log has no test failures, just write the Summary section with TEST_FAILURES: 0.

### Clustered Failures

When 5+ failures in the same log share a single ROOT_CAUSE_CLUSTER, collapse them into a
single cluster entry instead of repeating the full template for each:

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
- Total test re-runs across all logs (number of test re-runs needed to achieve all-pass)

### 2. Failure Table
A markdown table with columns:
| Log | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |

One row per test failure across all logs. The "Replay Not Used Reason" column should contain
a brief reason when Replay was not used (e.g., "diagnosed from error output", "no recording
available", "not attempted — discovery run"). Leave blank when Replay was used.

### 3. Patterns
- When was Replay most effective? (failure categories, tool sequences)
- When was Replay NOT used and why?
- Common debugging strategies that worked
- Common debugging strategies that failed
- Recurring failure categories

### 4. Recommendations
Target these files with specific, actionable recommendations:
- `skills/debugging/*.md` — New patterns, tool sequences, or categories to add
- `skills/tasks/build/testing.md` — Process improvements for the testing workflow
- `skills/review/reportTestFailures.md` — Improvements to this report template itself
