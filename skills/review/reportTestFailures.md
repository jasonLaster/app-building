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
TEST_FAILURES: <count of distinct test failure entries in this log, 0 if none. When the same test fails in run 1 for reason A and run 2 for reason B, count it as 1 distinct test failure with multiple root causes noted in its entry. When using the cluster format (2+ failures sharing a root cause), each cluster counts as 1 failure entry, not N individual tests. A test already counted in a cluster should NOT have a separate entry unless it has a distinct, independent root cause — avoid double-counting. IMPORTANT: TEST_FAILURES must equal the number of failure/cluster entries in the file — if there are 3 individual failures and 2 cluster entries, TEST_FAILURES should be 5. When a cluster spans multiple test runs within the same log (e.g., tests fail in run 1, get partially fixed, then different tests from the same root cause fail in run 2), still count the cluster as 1 entry if the root cause is the same. Example: 1 individual failure + 1 cluster of 3 tests = TEST_FAILURES: 2 (not 4), because the cluster counts as 1 entry regardless of how many tests it contains.>
TEST_RERUNS: <number of test re-runs needed in this log to achieve all-pass, 0 if all passed on first run>

For each test failure:

### Failure: <test name>
FAILURE_CATEGORY: <one of: timeout, strict-mode, data-contamination, batch-contamination, CSS/layout, race-condition, backend-bug, api-routing, date-format, missing-testid, seed-data-mismatch, infrastructure, spa-redirect, recording-upload-failure, bad-assertion-api, wrong-url, test-setup-error, other> (Use "bad-assertion-api" when tests use non-existent Playwright assertion methods like `toEndWith`, `toStartWith`, etc.) (Use "race-condition" when the failure is caused by async timing — e.g., count before load, API response ordering. Prefer "race-condition" over "CSS/layout" when the root cause is timing-based rather than visual. Use "date-format" for date/timestamp format mismatches between PostgreSQL ISO timestamps and expected YYYY-MM-DD strings. Use "batch-contamination" for cross-spec data contamination in batch/JourneyQA runs where multiple spec files share a single database branch — this is qualitatively different from within-spec "data-contamination". Use "seed-data-mismatch" for journeyQA tests that assume specific pre-existing records in the deployed database but the actual live state differs — this is distinct from within-spec data contamination and represents a test-assumption mismatch rather than cross-test interference.) (Use "wrong-url" when the test navigates to or asserts on an incorrect URL path — e.g., `/visits/` vs `/service-visits/`.) (Use "api-routing" when the failure is caused by URL segment parsing, wrong API prefix, or Netlify function routing issues — e.g., API returns HTML instead of JSON due to wrong redirect prefix, or `segments[3]` vs `segments[2]` off-by-one. Prefer "api-routing" over "backend-bug" when the root cause is URL routing rather than business logic.) (Use "test-setup-error" when the test's setup/beforeEach code fails — e.g., `page.evaluate(fetch(...))` at `about:blank`, missing navigation before API calls.) (CSS/layout vs strict-mode boundary: Use "strict-mode" when the root cause is a Playwright locator matching multiple elements due to anchored regex on composite text — e.g., `hasText: /^Leather Sofa$/` failing because the element contains additional text like room/category. Use "CSS/layout" only when the failure requires visual confirmation — e.g., elements are overlapping, hidden by CSS, or positioned off-screen. If the fix is changing a locator/selector, prefer "strict-mode"; if the fix is changing CSS/layout, use "CSS/layout".)
DATA_CONTAMINATION_SUBCATEGORY: <if FAILURE_CATEGORY is data-contamination, one of: accumulated-data, destructive-ordering, settings-contamination. "accumulated-data" = tests create records without cleanup, causing subsequent tests to find duplicate entries or unexpected counts. "destructive-ordering" = edit/modify/delete tests change data that subsequent tests depend on. "settings-contamination" = settings modifications affect subsequent tests expecting defaults. Omit if FAILURE_CATEGORY is not data-contamination.>
PRE_EXISTING: yes/no (yes = failure existed before the current work and is unrelated)
REPLAY_USED: yes/no (yes = agent actively called mcp__replay__* tools to analyze a recording)
REPLAY_NOT_USED_REASON: <if REPLAY_USED is no, one of: error-output-sufficient, no-recording, code-inspection, out-of-scope, infrastructure-failure, upload-failed, other. Add a brief clarification after the enum value if needed (e.g., "error-output-sufficient — constraint violation pointed to missing cleanup")>
DIAGNOSED_FROM: <REQUIRED for ALL failures (both REPLAY_USED=yes and REPLAY_USED=no) — capture the diagnostic source that was sufficient or would have been sufficient: one of: error-output, page-snapshot, error-context-snapshot, code-inspection, replay-necessary. Use "replay-necessary" only when Replay was genuinely needed (REPLAY_NECESSARY=yes). For REPLAY_USED=yes with REPLAY_NECESSARY=no, use the source that would have sufficed (e.g., error-output). This field is critical for understanding diagnostic source effectiveness and must not be omitted.>
RECORDING_AVAILABLE: yes/no (no = recording upload failed, infrastructure failure, or no recording was created)
DEBUGGING_ATTEMPTED: yes/no (no = failure was only identified/discovered, no debugging was done — e.g. initial discovery runs)
DEBUGGING_SKIPPED_REASON: <if DEBUGGING_ATTEMPTED is no, explain why — e.g. "pre-existing and out of scope", "infrastructure failure with no recording", "transient timeout, retried successfully". Omit if DEBUGGING_ATTEMPTED is yes.>
DEBUGGING_SUCCESSFUL: yes/no/partial (REQUIRED when DEBUGGING_ATTEMPTED is yes — must not be omitted. Indicates whether the debugging effort succeeded.)
REPLAY_NECESSARY: yes/no/unknown (STRICTLY REQUIRED when REPLAY_USED is yes — this field MUST NOT be omitted, including in cluster entries. Was Replay actually needed to diagnose the issue? "no" means error output alone would have sufficed. "unknown" if unclear. Omit ONLY when REPLAY_USED is no. Analyses missing this field when REPLAY_USED is yes are incomplete and MUST be corrected before submission. The synthesizer uses this field to calculate Replay decision quality metrics.)
ROOT_CAUSE_CLUSTER: <optional — when multiple failures share a single root cause, use a shared cluster ID (e.g. "replay-browser-timeout", "missing-env-var"). IMPORTANT: Always use this field when failures are fixed by the same changeset, so the synthesizer can explicitly link them rather than inferring from matching SHAs. Omit if this failure has a unique root cause.>
SELF_INFLICTED: yes/no (yes = failure was introduced by a fix attempt during the current session, not from the original code. Helps measure fix quality. Note: self-infliction includes three subtypes: (a) failures introduced by a fix attempt during debugging, (b) refactoring breaking existing tests — e.g., polishApp accessibility changes like span→th that break selectors, and (c) writing new tests with incorrect assumptions — e.g., journeyQA tests assuming specific deployed data state. Distinguishing these subtypes helps measure fix quality more precisely.)
FAILURE_PHASE: <one of: writeTests, fixTests, checkDirectives, deployment, other> (REQUIRED — must not be omitted. Which phase of the workflow produced this failure. Use the phase of the task that triggered the test run — e.g., if failures occur during a checkDirectives task, use "checkDirectives" even if the tests themselves are the same ones run during fixTests. Mapping: FixTests tasks → fixTests, FixViolation/checkDirectives tasks → checkDirectives, JourneyQA tasks → other.)
FAILURE_RESOLUTION_TYPE: <one of: test-code, app-code, both, none> (whether the fix was to test code, app code, or both. "none" if not yet resolved. Helps identify whether the testing process or the app-building process needs improvement)
FIX_ITERATIONS: <number of test re-runs needed to fully resolve this failure, 0 if not yet resolved, 1 if resolved on first attempt. REQUIRED — captures debugging difficulty. Failures taking 4+ iterations indicate complex root causes that may warrant process improvements.>
TOOL_CALL_COUNT: <recommended — total number of tool calls (Replay MCP, file reads, code searches) used to diagnose and fix this failure. Complements FIX_ITERATIONS as a resolution effort metric — when most failures resolve in 1 iteration, tool call count differentiates easy fixes (2-3 tool calls) from complex investigations (10+ tool calls). Include whenever possible to improve resolution effort analysis coverage.>

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

When 2+ failures in the same log share a single ROOT_CAUSE_CLUSTER, collapse them into a
single cluster entry instead of repeating the full template for each. Use the cluster format
for any group of 2 or more failures with a shared root cause — the 5+ threshold is not
required. The cluster heading
name (e.g., `Failure Cluster: neon-inherited-data`) serves as the cluster ID when using
this collapsed format — an explicit `ROOT_CAUSE_CLUSTER` field is not needed in each entry:

```
### Failure Cluster: <ROOT_CAUSE_CLUSTER> (<count> tests)
FAILURE_CATEGORY: <category>
PRE_EXISTING: yes/no
REPLAY_USED: yes/no
REPLAY_NOT_USED_REASON: <reason>
REPLAY_NECESSARY: yes/no/unknown (STRICTLY REQUIRED when REPLAY_USED is yes — same enforcement as individual entries. Must not be omitted in clusters.)
RECORDING_AVAILABLE: yes/no
DEBUGGING_ATTEMPTED: yes/no
DEBUGGING_SKIPPED_REASON: <reason if not attempted>
DEBUGGING_SUCCESSFUL: yes/no/partial (REQUIRED when DEBUGGING_ATTEMPTED is yes — must not be omitted, same as individual failure entries. Avoids gaps in the debugging success rate calculation.)
SELF_INFLICTED: yes/no (yes = failure was introduced by a fix attempt during the current session)
FAILURE_PHASE: <one of: writeTests, fixTests, checkDirectives, deployment, other> (REQUIRED — must not be omitted, same as individual failure entries)
FAILURE_RESOLUTION_TYPE: <one of: test-code, app-code, both, none>
FIX_PATTERN: <optional — reusable fix pattern name, e.g. "wait-before-count", "destructive-test-reordering", "formatDate-normalization". Use when the same fix applies across multiple clusters or spec files. Helps the synthesizer identify reusable fixes distinct from ROOT_CAUSE_CLUSTER.>
DIAGNOSED_FROM: <REQUIRED — same as individual failure entries. One of: error-output, page-snapshot, error-context-snapshot, code-inspection, replay-necessary. Must not be omitted — needed for diagnostic source effectiveness analysis.>
FIX_ITERATIONS: <REQUIRED — same as individual failure entries. Number of test re-runs needed to fully resolve this cluster. Must not be omitted — needed for difficulty analysis.>
AFFECTED_TESTS: <comma-separated list of test names>
```

**IMPORTANT: Avoiding double-counting in clusters.** When an individual failure is part of a
cluster (same ROOT_CAUSE_CLUSTER), the TEST_FAILURES count should include only the cluster
entry, not both the cluster and the individual. A test already counted in a cluster should NOT
have a separate entry unless it has a distinct, independent root cause.

**IMPORTANT: Cluster entries count as 1 in TEST_FAILURES.** When using the cluster format,
each cluster counts as 1 in the TEST_FAILURES tally regardless of how many tests it contains.
For example, if a log has 1 individual failure + 1 cluster of 3 tests, TEST_FAILURES should
be 2 (not 4). When counting failures in analysis files, always count cluster entries as 1.

### Infrastructure Failures

Infrastructure failures (socket timeouts, navigation timeouts with no page load, network
errors that prevent recordings) are fundamentally different from application bugs. When a
log contains only infrastructure failures, use this lightweight format instead of the full
failure template:

```
## Infrastructure Failures
INFRA_FAILURE_COUNT: <count>
INFRA_CATEGORY: <socket-timeout | navigation-timeout | network-error | recording-upload-failure | port-conflict | other>
AFFECTED_TESTS: <comma-separated list or "all tests in <spec file>">
INFRA_AFFECTED_TEST_COUNT: <actual number of tests affected, for computing totals>
RECORDING_AVAILABLE: no
DIAGNOSED_FROM: <optional — the diagnostic source used to identify the infrastructure issue, e.g., error-output for timeout messages, logs for server startup failures. Include when the infrastructure failure was actively diagnosed rather than simply observed.>
NOTES: <brief description of the infrastructure issue>
```

**Important**: Infrastructure failures are NOT counted in the TEST_FAILURES total or the Summary
Statistics failure counts. They are reported separately. Config/import errors that prevent test
execution entirely (e.g., Playwright config SyntaxError, missing module imports) belong in the
infrastructure section, not in TEST_FAILURES — they are not test-level failures but environment
failures that block all tests from running. The Summary Statistics section should
include an "Infrastructure failure events" row showing the count of infrastructure events and
total affected tests, making it explicit that these are excluded from the main failure metrics.

**Scope**: Infrastructure failures include not only pre-test issues (socket timeouts, navigation
failures) but also post-test issues like recording upload failures (e.g., "entity too large"
errors). When a test passes but its recording cannot be uploaded, this is an infrastructure
failure affecting debugging capability, not a test failure. Categorize it under infrastructure
with `INFRA_CATEGORY: recording-upload-failure`.

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
- Failure resolution type distribution (breakdown by FAILURE_RESOLUTION_TYPE — e.g., test-code: 31, app-code: 5, both: 6, none: 2. Indicates whether the testing process or app-building process needs improvement)
- Test Isolation Score (percentage of failures attributable to test isolation issues: data-contamination + strict-mode + seed-data-mismatch categories combined. A high score (>50%) signals that test isolation is the dominant failure mode and warrants dedicated process improvements)
- Total affected tests (total number of individual tests affected, including all tests within clusters. Complements the distinct failure count — e.g., 15 distinct failures may affect 40 total tests when clusters are expanded)
- Pre-existing failure rate (percentage and count of PRE_EXISTING=yes failures out of total failures. A high rate indicates the test suite is effective at finding real issues; a low rate may indicate the test-writing process is introducing bugs)
- Replay decision quality (ratio of REPLAY_NECESSARY=no among REPLAY_USED=yes failures. A high ratio suggests Replay is being used speculatively for issues that could have been diagnosed from error output alone — indicates a process improvement opportunity)
- Diagnostic source effectiveness (breakdown of DIAGNOSED_FROM values among successfully resolved failures — e.g., error-output: 25, page-snapshot: 10, code-inspection: 2. Identifies which information sources are most valuable for non-Replay debugging and can inform when to skip Replay)
- Self-inflicted fix quality cost (among SELF_INFLICTED=yes failures, count the total additional test re-runs they caused. This quantifies the cost of self-inflicted issues beyond just their count — e.g., a self-inflicted failure that required 3 re-runs is more costly than one resolved immediately)
- Fix iteration difficulty distribution (breakdown of FIX_ITERATIONS values — e.g., 1: 20, 2: 8, 3: 3, 4+: 2. Failures taking 4+ iterations are outliers that warrant process investigation. Include the specific test names for 4+ iteration failures)
- Resolution effort distribution (when TOOL_CALL_COUNT data is available, show the breakdown — e.g., 1-3 calls: 15, 4-9 calls: 8, 10+ calls: 3. Complements FIX_ITERATIONS when most failures resolve in 1 iteration but vary widely in investigation effort)

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

When multiple clusters stem from the same systemic root cause (e.g., several clusters all
caused by URL segment parsing changes), add a **Note** below the table linking them and
describing the shared architectural issue. This helps identify systemic bugs that manifest
as separate clusters across different logs.

### 3. Patterns
- When was Replay most effective? (failure categories, tool sequences)
- When was Replay NOT used and why?
- Common debugging strategies that worked
- Common debugging strategies that failed
- Recurring failure categories — include a "Failure Category Distribution" table:
  | Category | Count | % of Total |
  showing the breakdown by FAILURE_CATEGORY. This is one of the most actionable outputs.
- **Data-contamination sub-categories** — when data-contamination is the dominant failure
  category (>40%), break it into sub-categories in the Patterns section for more actionable
  analysis: `destructive-ordering` (tests that delete/modify all records run before dependent
  tests), `accumulated-data` (tests create records that persist and inflate counts for
  subsequent tests), `settings-contamination` (settings modifications affect subsequent tests
  expecting defaults). This breakdown helps target specific isolation strategies.
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

**Self-inflicted failure patterns**: When reporting self-inflicted failures, explicitly call out
the pattern of fixing a backend issue (e.g., adding cascade delete) without simultaneously
checking whether the fix creates new test ordering problems. This is the most common
self-inflicted pattern — the backend fix enables a destructive test to wipe data that later
tests depend on.

**Test isolation score threshold**: If the test isolation score (data-contamination +
strict-mode + seed-data-mismatch as a percentage of total failures) exceeds 50%, flag it as a
systemic issue in the recommendations section. Suggest mandating beforeEach cleanup helpers in
all spec files that modify data, rather than fixing isolation issues reactively per-file.

### 5. Replay Fixes Table

For each test failure where Replay was used and the test failure was successfully fixed,
add an entry with the following details copied verbatim from the analysis file:

ULTRA IMPORTANT: Follow this format exactly and make sure to include this table as it will be used
by downstream processes. Do not modify these instructions.

INITIAL_CHANGESET
FAILING_TEST
FINAL_CHANGESET
ASSESSMENT
