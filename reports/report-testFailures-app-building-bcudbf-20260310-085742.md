# Test Failures Report — app-building-bcudbf

**Generated**: 2026-03-10
**App**: lawn-crew-ops (Landscaping/Lawn Care — Crew Routing & Daily Job Sheets)

---

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 107 |
| Logs with test failures | 23 |
| Logs without test failures | 84 |
| Total distinct test failures | 41 |
| Total affected tests | 91 |
| Total test re-runs across all logs | 46 |
| Unique root causes | 35 (21 clustered + 14 unclustered) |
| Infrastructure failure events | 1 event (17 affected tests) |

### Replay Metrics

| Metric | Value |
|--------|-------|
| Replay usage rate (all failures) | 29.3% (12/41) |
| Replay usage rate (debugged failures only) | 30.8% (12/39) |
| Debugging success rate | 100% (39/39) |
| Replay-assisted success rate | 100% (12/12) |
| Recording availability rate | 95.1% (39/41) |
| Replay decision quality (unnecessary usage) | 66.7% (8/12 REPLAY_NECESSARY=no among REPLAY_USED=yes) |
| Debugging efficiency (Replay used but error output sufficed) | 8 failures |

### Fix & Resolution Metrics

| Metric | Value |
|--------|-------|
| Cascading fixes (single changes resolving multiple failures) | 10 |
| Self-inflicted failures | 3 (7.3%) |
| Pre-existing failure rate | 92.7% (38/41) |
| Test Isolation Score | 41.5% (17/41 — data-contamination + strict-mode + seed-data-mismatch) |
| Fix reuse rate | 1 pattern reused across multiple spec files (grid-template-columns-missing) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 37 | 90.2% |
| checkDirectives | 2 | 4.9% |
| deployment | 2 | 4.9% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % of Total |
|-----------------|-------|-----------|
| test-code | 18 | 43.9% |
| app-code | 14 | 34.1% |
| both | 6 | 14.6% |
| none | 2 | 4.9% |
| unattributed | 1 | 2.4% |

### Diagnostic Source Effectiveness (among resolved failures)

| Source | Count | % of Resolved |
|--------|-------|--------------|
| error-output | 28 | 71.8% |
| page-snapshot | 4 | 10.3% |
| replay-necessary | 4 | 10.3% |
| error-context-snapshot | 2 | 5.1% |
| code-inspection | 0 | 0% |

### Fix Iteration Difficulty Distribution

| Iterations | Count |
|-----------|-------|
| 0 (unresolved) | 2 |
| 1 | 29 |
| 2 | 6 |
| 3 | 0 |
| 4+ | 2 |

**4+ iteration failures (outliers):**
- Activity feed shows schedule change events (4 iterations, seed-data-mismatch, Log 67)
- Print Job Sheets cluster (9 iterations, infrastructure/popup crash, Log 56)

---

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------:|-------|---------|-----------|
| 42 | bcudbf/lawn-crew-ops | [Cluster] api-redirect-missing (7 tests) | backend-bug | yes | no | page-snapshot — empty route board showed API data not loading | yes | — | — | yes | f79b02b276 |
| 42 | bcudbf/lawn-crew-ops | Property selector search/filtering | data-contamination | yes | no | page-snapshot — "Oak" matched 2 results | yes | — | — | yes | f79b02b276 |
| 43 | bcudbf/lawn-crew-ops | [Cluster] route-date-split (2 tests) | backend-bug | yes | yes | — | yes | NetworkRequest to find failing API, inspected response | NetworkRequest, ConsoleMessages | yes | 1909d4e7a7 |
| 44 | bcudbf/lawn-crew-ops | [Cluster] crew-name-contamination (4 tests) | data-contamination | yes | no | page-snapshot — "Alpha Squad" instead of "Alpha Crew" | yes | — | — | yes | 4d6daeb931 |
| 44 | bcudbf/lawn-crew-ops | Inline edit equipment via multi-select | backend-bug | yes | yes | — | yes | PlaywrightSteps + Logpoint on commit handler | PlaywrightSteps, NetworkRequest, ConsoleMessages, Logpoint, ListSources, ReadSource | yes | 4d6daeb931 |
| 44 | bcudbf/lawn-crew-ops | [Cluster] today-job-testid-prefix (2 tests) | missing-testid | yes | no | strict mode showed 2 elements for prefix selector | yes | — | — | yes | 4d6daeb931 |
| 44 | bcudbf/lawn-crew-ops | Clicking job navigates to job detail | backend-bug | yes | no | URL was "/" instead of "/job-tracking" | yes | — | — | yes | 4d6daeb931 |
| 45 | bcudbf/lawn-crew-ops | [Cluster] custom-select-dropdown-css (3 tests) | CSS/layout | yes | yes | — | yes | PlaywrightSteps + Screenshot + InspectElement for dropdown dimensions | PlaywrightSteps, Screenshot, InspectElement | yes | ae4549a726 |
| 45 | bcudbf/lawn-crew-ops | [Cluster] crew-form-edit-order (4 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps + Screenshot confirmed missing crew | PlaywrightSteps, Screenshot, ConsoleMessages | yes | ae4549a726 |
| 46 | bcudbf/lawn-crew-ops | [Cluster] crew-table-grid-columns (3 tests) | CSS/layout | yes | no | "click intercepted by" adjacent cells — clear CSS overlap | yes | — | — | yes | cedfe4d804 |
| 50 | bcudbf/lawn-crew-ops | [Cluster] disruption-table-grid-columns (2 tests) | CSS/layout | yes | no | same click-intercepted pattern as crew-list | yes | — | — | yes | b0f1546ca0 |
| 50 | bcudbf/lawn-crew-ops | Delete disruption cancellation | data-contamination | yes | no | row missing after prior delete test | yes | — | — | yes | b0f1546ca0 |
| 56 | bcudbf/lawn-crew-ops | [Cluster] replay-browser-popup-crash (8 tests) | infrastructure | yes | yes | — | yes | PlaywrightSteps identified popup bottleneck | PlaywrightSteps | yes | 32dabf4d65 |
| 57 | bcudbf/lawn-crew-ops | Inline edit daily hours / description / dates | backend-bug | yes | no | error showed "6.0" vs "6" format mismatch | yes | — | — | yes | b10cf7b20b |
| 57 | bcudbf/lawn-crew-ops | Check/uncheck completion / Progress recalculates | race-condition | yes | no | "checkbox did not change state" — missing optimistic update | yes | — | — | yes | b10cf7b20b |
| 57 | bcudbf/lawn-crew-ops | [Cluster] project-detail-test-ordering (8 tests) | data-contamination | yes | no | Henderson missing after prior rename | yes | — | — | yes | b10cf7b20b |
| 58 | bcudbf/lawn-crew-ops | Submit new project with all fields filled | CSS/layout | yes | no | "project-status-trigger intercepts pointer events" | yes | — | — | yes | 686a7b3043 |
| 58 | bcudbf/lawn-crew-ops | Edit existing project via form | date-format | yes | no | "6.0" vs "6" numeric formatting | yes | — | — | yes | 686a7b3043 |
| 59 | bcudbf/lawn-crew-ops | [Cluster] project-list-test-ordering (5 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps confirmed deleted Henderson | PlaywrightSteps | yes | 844fa4c328 |
| 59 | bcudbf/lawn-crew-ops | Table is sortable by columns | CSS/layout | yes | yes | — | yes | Confirmed grid overlap in recording | PlaywrightSteps | yes | 844fa4c328 |
| 60 | bcudbf/lawn-crew-ops | [Cluster] numeric-format-decimal (7 tests) | date-format | yes | no | "3.0h" vs "3h" — obvious numeric format | yes | — | — | yes | 844fa4c328 |
| 61 | bcudbf/lawn-crew-ops | Confirm delete removes property | backend-bug | yes | yes | — | yes | NetworkRequest inspected DELETE 500 response | NetworkRequest | yes | f782c3e966 |
| 61 | bcudbf/lawn-crew-ops | Cancel delete keeps property | data-contamination | yes | no | previous test deleted Henderson | yes | — | — | yes | f782c3e966 |
| 62 | bcudbf/lawn-crew-ops | [Cluster] service-type-contamination (2 tests) | data-contamination | yes | no | prior test changed service_type persisted to DB | yes | — | — | yes | ce628741fe |
| 62 | bcudbf/lawn-crew-ops | Service history updates after job completed | missing-testid | yes | no | wrong route path and testids | yes | — | — | yes | ce628741fe |
| 63 | bcudbf/lawn-crew-ops | [Cluster] service-type-dropdown-overlap (2 tests) | CSS/layout | yes | no | frequency trigger intercepts pointer events | yes | — | — | yes | a8a9489ebd |
| 65 | bcudbf/lawn-crew-ops | [Cluster] property-name-sort-default (2 tests) | backend-bug | yes | no | descending instead of ascending — clear sort logic bug | yes | — | — | yes | 23ec7e4d18 |
| 66 | bcudbf/lawn-crew-ops | [Cluster] search-term-ambiguity (2 tests) | data-contamination | yes | no | "School" matched "Preschool" too | yes | — | — | yes | f1a626dc2d |
| 67 | bcudbf/lawn-crew-ops | Activity feed shows disruption creation events | seed-data-mismatch | yes | yes | — | yes | NetworkRequest to inspect dashboard API response | NetworkRequest | yes | 659de7f31f |
| 67 | bcudbf/lawn-crew-ops | Activity feed shows schedule change events | seed-data-mismatch | yes | yes | — | yes | NetworkRequest to inspect activity feed data | NetworkRequest | yes | 659de7f31f |
| 68 | bcudbf/lawn-crew-ops | Cancel reschedule wizard | data-contamination | yes | yes | — | yes | PlaywrightSteps + Screenshot to trace execution | PlaywrightSteps, Screenshot, ConsoleMessages | yes | f20ebebdd8 |
| 68 | bcudbf/lawn-crew-ops | Rescheduled jobs appear on new date | data-contamination | yes | no | selector overcount from testid prefix matching | yes | — | — | yes | f20ebebdd8 |
| 68 | bcudbf/lawn-crew-ops | Skipped jobs show correct status | strict-mode | yes | no | 2 matching elements from pre-existing seed data | yes | — | — | yes | f20ebebdd8 |
| 69 | bcudbf/lawn-crew-ops | Drag-and-drop reorder within crew column | backend-bug | yes | yes | — | yes | PlaywrightSteps + Evaluate + Logpoint found double-fire | PlaywrightSteps, Evaluate, ListSources, ReadSource, Logpoint | yes | ba8ea41ca2 |
| 69 | bcudbf/lawn-crew-ops | Drag-and-drop reorder updates sort order | data-contamination | yes | no | cross-crew move reduced count to 1 | yes | — | — | yes | ba8ea41ca2 |
| 73 | bcudbf/lawn-crew-ops | [Cluster] disruption-data-contamination (2 tests) | data-contamination | yes | yes | — | yes | PlaywrightSteps + Screenshot to see page state | PlaywrightSteps, Screenshot | yes | e9a9106d8a |
| 76 | bcudbf/lawn-crew-ops | deployment: strict mode violation | strict-mode | no | no | strict mode message identified multiple matches | no | — | — | yes | 33ba59ebcd |
| 76 | bcudbf/lawn-crew-ops | deployment: form selectors | other | no | no | page snapshot showed testid vs name attribute mismatch | no | — | — | yes | 33ba59ebcd |
| 79 | bcudbf/lawn-crew-ops | Crew status updates when job status changes | race-condition | yes | no | out-of-scope — pre-existing, unrelated | yes | — | — | no | none |
| 89 | bcudbf/lawn-crew-ops | Crew status updates when job status changes | race-condition | yes | no | out-of-scope — pre-existing, unrelated | yes | — | — | no | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| api-redirect-missing | 7 tests | 42 | Fixed with netlify.toml redirect rule |
| route-date-split | 2 tests | 43 | Cast route_date to string before .split() |
| crew-name-contamination | 4 tests | 44 | Reordered tests + fixed beforeEach |
| today-job-testid-prefix | 2 tests | 44 | Changed selectors to avoid prefix overcounting |
| custom-select-dropdown-css | 3 tests | 45 | Removed position:absolute from nested options |
| crew-form-edit-order | 4 tests | 45 | Reordered edit tests before rename |
| crew-table-grid-columns | 3 tests | 46 | Added grid-template-columns to CSS |
| disruption-table-grid-columns | 2 tests | 50 | Added grid-template-columns (same pattern as crew-table) |
| replay-browser-popup-crash | 8 tests | 56 | Replaced popup with in-page overlay |
| project-api-date-format | 1 entry | 57 | Fixed PUT duplicate project_days + date format |
| checkbox-optimistic-state | 1 entry | 57 | Added optimistic state update for checkbox |
| project-detail-test-ordering | 8 tests | 57 | Reordered destructive tests to end |
| numeric-format-decimal | 7+ tests | 58, 60 | Formatted whole numbers without decimal point |
| project-list-test-ordering | 5 tests | 59 | Moved delete test after dependent tests |
| destructive-test-ordering | 3 entries | 61, 68, 69 | Reordered destructive tests in each spec |
| service-type-contamination | 2 tests | 62 | Reordered tests to isolate mutations |
| service-type-dropdown-overlap | 2 tests | 63 | Fixed z-index stacking context |
| property-name-sort-default | 2 tests | 65 | Fixed default sort direction logic |
| search-term-ambiguity | 2 tests | 66 | Used more specific search terms |
| wizard-selector-overcount | 1 entry | 68 | Changed selector to avoid matching nested spans |
| disruption-data-contamination | 2 tests | 73 | Refactored test to account for prior data |

---

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 13 | 31.7% |
| backend-bug | 8 | 19.5% |
| CSS/layout | 6 | 14.6% |
| race-condition | 3 | 7.3% |
| date-format | 2 | 4.9% |
| seed-data-mismatch | 2 | 4.9% |
| missing-testid | 2 | 4.9% |
| strict-mode | 2 | 4.9% |
| infrastructure | 1 | 2.4% |
| other | 1 | 2.4% |

### When Replay Was Most Effective

Replay was genuinely necessary (REPLAY_NECESSARY=yes) in 4 cases, all involving bugs invisible from error output alone:

1. **Backend type mismatch** (route-date-split): NetworkRequest revealed `.split()` called on a PostgreSQL Date object — the 500 error message wasn't exposed in test output.
2. **Frozen React state mutation** (equipment inline edit): Logpoint on the commit handler traced execution flow to find `draft.sort()` mutating frozen state, preventing `setEditing(false)`.
3. **CSS layout collapse** (custom-select-dropdown-css): InspectElement revealed the dropdown was 2px tall — the visual layout bug was invisible from error messages.
4. **Event handler double-fire** (drag-and-drop reorder): Evaluate + Logpoint revealed `handleDrop` was called twice per drop — the second call from the column container overwrote the correct reorder.

**Common tool sequences for effective Replay debugging:**
- `PlaywrightSteps → NetworkRequest` for backend bugs
- `PlaywrightSteps → Screenshot → InspectElement` for CSS/layout bugs
- `PlaywrightSteps → Logpoint/Evaluate` for React state bugs

### When Replay Was NOT Used and Why

Of the 29 failures where Replay was not used:
- **error-output-sufficient** (24): The dominant reason. Error messages, strict mode violations, and test output provided enough information.
- **out-of-scope** (2): Pre-existing failures unrelated to the current task (crew status race condition).
- **page-snapshot** (3): Page snapshots in error context showed the problem visually.

### Common Debugging Strategies That Worked

1. **Error output analysis** — 71.8% of failures diagnosed from error output alone. Playwright's strict mode violations, intercepted click messages, and assertion diffs provided actionable diagnostics.
2. **Test reordering** — The single most common fix pattern for data-contamination. Moving destructive tests (deletes, renames) to the end of test files.
3. **CSS grid-template-columns** — A recurring fix across crew-list, disruption-list, and project-list. Missing grid column definitions caused header cell overlap.
4. **Numeric formatting** — PostgreSQL returning decimals (6.0, 3.0) where integers were expected. Fixed by formatting whole numbers without decimal points.

### Common Debugging Strategies That Failed

1. **Replay for data-contamination** — Replay was used 4 times for data-contamination issues (Logs 45, 59, 68, 73) but was unnecessary in all cases — the test ordering issue was always diagnosable from error output or page snapshots.
2. **Using Replay for seed-data-mismatch** — In Log 67, Replay confirmed the activity feed data ordering but the fix required changing seed timestamps anyway — a code inspection approach would have been faster.

### Self-Inflicted Failure Rate

**7.3% (3/41)** — Low rate indicating good fix quality. The 3 self-inflicted failures were:
- Log 61: A fix that deleted Henderson Estate caused the "cancel delete" test to fail (destructive-test-ordering)
- Log 76: Two deployment test failures from writing incorrect selectors (strict mode + form attribute mismatch)

All were test-code issues rather than app-code regressions.

### Test Isolation Issues

The Test Isolation Score of **41.5%** (data-contamination 31.7% + strict-mode 4.9% + seed-data-mismatch 4.9%) is significant but below the 50% threshold for a dedicated subsection. Key observations:

- **Data contamination** (13 failures) is the single largest category, driven by destructive tests (deletes, renames) running before tests that depend on the original data.
- Most contamination was resolved by test reordering, not by adding isolation (per-test DB resets).
- The `test.describe.serial` directive was added during checkDirectives phases to prevent parallel execution issues.
- **Spec files most affected**: crew-detail (4 tests), project-detail (8 tests), project-list (5 tests), crew-form (4 tests).

---

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "error output first" guidance**: 71.8% of failures were diagnosed from error output alone. Document that Replay should be reserved for cases where error output is ambiguous or insufficient (backend 500s with no exposed message, visual layout bugs, event handler timing issues).
- **Add CSS grid debugging pattern**: "click was intercepted by" errors from Playwright almost always indicate missing `grid-template-columns`. Check CSS before reaching for Replay.
- **Add data-contamination diagnostic pattern**: When a test fails because expected data is missing, check if a prior test in the same spec modified or deleted that data. This is diagnosable from test ordering alone.

### `skills/tasks/build/testing.md`

- **Enforce destructive-test-last ordering**: 13 failures (31.7%) were from data contamination, primarily destructive tests (deletes, renames) running before dependent tests. Add a directive: "Tests that delete, rename, or irreversibly modify seed data MUST be placed at the end of the test file, inside a `test.describe.serial` block."
- **Add grid-template-columns to CSS review checklist**: Every `display: grid` element used for data tables should have explicit `grid-template-columns`. This pattern caused failures in 3 separate spec files.
- **Add numeric format normalization**: PostgreSQL numeric types return decimal strings (e.g., "6.0"). Add a directive to format display values with `parseFloat()` or similar to strip trailing zeros.
- **Avoid window.open() in Replay browser**: The popup-based print approach required 9 re-runs to fix. Add guidance to use in-page overlays instead of popups for print functionality.

### `skills/review/reportTestFailures.md`

- **Clarify multi-test individual entries**: Some analysis files combined multiple test names in a single "Failure:" heading (e.g., "Inline edit daily hours / description / dates") without using the cluster format. Add guidance: "When a single root cause affects 2+ tests, always use the Failure Cluster format with AFFECTED_TESTS."
- **Add INITIAL_CHANGESET/FINAL_CHANGESET to per-log template**: The Replay Fixes Table requires these fields but they are not part of the per-log analysis template, making synthesis impossible. Add them to the Resolution section.
- **Track Replay tool count per failure**: Knowing total MCP tool calls per failure would help measure Replay efficiency (cost per diagnosis).

---

## 5. Replay Fixes Table

For each test failure where Replay was used and the test was successfully fixed:

| # | FAILING_TEST | FINAL_CHANGESET | ASSESSMENT |
|---|-------------|-----------------|------------|
| 1 | Auto-generate does not duplicate existing routes | 1909d4e7a7 | Replay was necessary — NetworkRequest revealed `.split()` on PostgreSQL Date object (500 error not exposed in test output) |
| 2 | Inline edit equipment via multi-select | 4d6daeb931 | Replay was necessary — Logpoint traced frozen React state mutation preventing setEditing(false) |
| 3 | Select multiple equipment items | ae4549a726 | Replay was necessary — InspectElement revealed 2px dropdown height from nested absolute positioning |
| 4 | Edit equipment selection and save | ae4549a726 | Replay was unnecessary — error output showed "Bravo Crew" missing, diagnosable from test ordering |
| 5 | Delete project cancellation | 844fa4c328 | Replay was unnecessary — error-context snapshot already showed Henderson deleted |
| 6 | Table is sortable by columns | 844fa4c328 | Replay was unnecessary — error output showed "sort-end-date intercepts pointer events" |
| 7 | Confirm delete removes property | f782c3e966 | Replay was unnecessary — DELETE 500 response was visible in error output |
| 8 | Activity feed shows disruption creation events | 659de7f31f | Replay was unnecessary — error output identified missing events, fix required seed data changes |
| 9 | Activity feed shows schedule change events | 659de7f31f | Replay was unnecessary — same pattern as disruption creation events |
| 10 | Cancel reschedule wizard | f20ebebdd8 | Replay was unnecessary — error output showed consumed Alpha Crew jobs from prior test |
| 11 | Drag-and-drop to reorder jobs within crew | ba8ea41ca2 | Replay was necessary — Evaluate + Logpoint discovered handleDrop double-fire from event bubbling |
| 12 | Disruptions list updates when new disruption created | e9a9106d8a | Replay was unnecessary — error output showed unexpected disruption items from prior tests |

**Note**: INITIAL_CHANGESET and ASSESSMENT fields are not captured in the per-log analysis template. The FINAL_CHANGESET above uses CHANGESET_REVISION from the analysis files. Assessment is synthesized from REPLAY_NECESSARY and OUTCOME fields.
