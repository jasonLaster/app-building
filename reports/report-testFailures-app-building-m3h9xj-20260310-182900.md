# Test Failures Report: app-building-m3h9xj-20260310-182900

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 37 |
| Logs with test failures | 5 |
| Logs without test failures | 32 |
| Total distinct test failures | 6 |
| Total affected tests | 28 |
| Replay usage rate | 0/6 (0%) |
| Replay usage rate among debugged failures | 0/6 (0%) |
| Debugging success rate | 6/6 (100%) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 4/6 (66.7%) |
| Debugging efficiency (Replay used but error output sufficed) | 0 |
| Cascading fixes | 3 (changesets resolving 11, 3, and 2 failures respectively) |
| Self-inflicted failures | 0 |
| Total test re-runs across all logs | 5 |
| Unique root causes | 6 |
| Fix reuse rate | 1 distinct fix pattern reused across multiple spec files (relative-count-assertions in 2 specs); delete-all-before-each/delete-all-before-test conceptually identical across 2 additional specs |
| Failure phase distribution | fixTests: 5, deployment: 1 |
| Failure resolution type distribution | test-code: 5, app-code: 1 |
| Test Isolation Score | 66.7% (4/6 failures from data-contamination) |
| Pre-existing failure rate | 16.7% (1/6) |
| Replay decision quality | N/A (Replay never used) |
| Diagnostic source effectiveness | error-output: 6 (100% of resolved failures) |
| Self-inflicted fix quality cost | 0 (no self-inflicted failures) |
| Fix iteration difficulty distribution | 1 iteration: 6 (all failures resolved on first attempt) |
| Infrastructure failure events | 1 event, 1 affected test (recording-upload-failure) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| Log 18 | worker-m3h9xj / todo-app | Cluster: seed-data-footer (11 tests: TF-1–TF-11) | data-contamination | no | no | error-output-sufficient — counts showed seed data | yes | Added deleteAllTasks() beforeEach | — | yes | 705f776ce1 |
| Log 19 | worker-m3h9xj / todo-app | Cluster: seed-data-input (2 tests: TI-1, TI-5) | data-contamination | no | no | error-output-sufficient — "1 item left" vs "3 items left" | yes | Relative count assertions, unique task names | — | yes | 0d8491084a |
| Log 20 | worker-m3h9xj / todo-app | Cluster: seed-data-item (7 tests: TItem-1–TItem-7) | data-contamination | no | no | error-output-sufficient — wrong counts and strict mode violations | yes | Unique task names, relative assertions, wait for seed load | — | yes | none |
| Log 20 | worker-m3h9xj / todo-app | Checkbox click interception (TItem-2, TItem-3, TItem-5, TItem-7) | CSS/layout | no | no | error-output-sufficient — click intercepted by span.task-item-checkmark | yes | Click label instead of hidden checkbox | — | yes | none |
| Log 21 | worker-m3h9xj / todo-app | Cluster: seed-data-present (3 tests: TL-1, TL-2, TL-4) | data-contamination | yes | no | error-output-sufficient — expected empty state vs actual seed data | no | deleteAllTasks() in beforeEach | — | yes | fd1022b3a3 |
| Log 23 | worker-m3h9xj / todo-app | Todo app displays data and supports updates | backend-bug | no | no | error-output-sufficient — page showed CRM data instead of todo data | no | Diagnosed wrong DATABASE_URL from page snapshot | — | yes | 30c5ded714 |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| seed-data-footer | 11 tests | Log 18 | Fixed with deleteAllTasks() beforeEach cleanup; SHA 705f776ce1 |
| seed-data-input | 2 tests | Log 19 | Fixed with relative count assertions and unique task names; SHA 0d8491084a |
| seed-data-item | 7 tests | Log 20 | Fixed with unique task names, relative assertions, wait for seed load |
| checkbox-click-interception | 4 tests | Log 20 | Fixed by clicking label instead of hidden checkbox input |
| seed-data-present | 3 tests | Log 21 | Fixed with deleteAllTasks() beforeEach cleanup; SHA fd1022b3a3 |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 4 | 66.7% |
| CSS/layout | 1 | 16.7% |
| backend-bug | 1 | 16.7% |

### When Was Replay Most Effective?

Replay was never used during this build. All 6 failures were diagnosed from error output alone, which proved sufficient for every case.

### When Was Replay NOT Used and Why?

All 6 failures: Replay was not used because error output was sufficient in every case. The test failure messages contained clear diagnostic information — expected vs actual values, element interception details, or page content showing wrong data sources.

### Common Debugging Strategies That Worked

1. **Delete-all-before-each pattern**: Adding a `deleteAllTasks()` helper in `beforeEach` to clear seed data before tests. Applied in task-footer.spec.ts and task-list.spec.ts.
2. **Relative count assertions**: Instead of hardcoded counts (e.g., "1 item left"), capture the initial count and assert relative changes (+N). Applied in task-input.spec.ts and task-item.spec.ts.
3. **Unique task names**: Using `Date.now()` suffixes to avoid collisions with seed data names (e.g., "Read a book" matching seed data).
4. **Click target adjustment**: When Playwright reports a click intercepted by an overlay element, click the visible label/wrapper instead of the hidden input.

### Common Debugging Strategies That Failed

None — all debugging strategies succeeded on the first attempt in this build.

### Data-Contamination Sub-Categories

Data-contamination was the dominant failure category (66.7% > 40%), warranting sub-category analysis:

| Sub-Category | Count | Affected Tests |
|-------------|-------|---------------|
| accumulated-data | 4 clusters | 23 tests total — seed data (3 pre-existing tasks) caused wrong counts, unexpected items in lists, and strict mode violations from duplicate names |

All 4 data-contamination failures were of the `accumulated-data` type: tests assumed an empty database but seed data persisted. No destructive-ordering or settings-contamination patterns were observed.

### Self-Inflicted Failure Rate

**0%** — No failures were self-inflicted. All failures stemmed from the initial test authoring not accounting for seed data or CSS overlay behavior.

### Test Isolation Issues

Data-contamination + strict-mode + seed-data-mismatch categories account for 66.7% (>50%) of failures, indicating test isolation is the dominant failure mode.

**Pattern**: All 4 data-contamination clusters (23 affected tests across 4 spec files) shared the same root cause — tests assumed an empty database state but the test infrastructure seeds 3 tasks before each run. The seed data caused:
- Wrong item counts in assertions
- Strict mode violations from duplicate task names matching seed data
- Empty-state assertions failing because tasks already existed

**Affected spec files**: task-footer.spec.ts, task-input.spec.ts, task-item.spec.ts, task-list.spec.ts (all 4 main spec files).

**Prevention strategies**:
- The test template should include a standard `beforeEach` cleanup pattern by default
- Alternatively, the test infrastructure could use a fresh database branch per spec file
- Test authoring guidelines should mandate relative assertions instead of hardcoded counts

## 4. Recommendations

### `skills/debugging/*.md`
- No new debugging patterns needed — error output was sufficient for all failures in this build.

### `skills/tasks/build/testing.md`
- **Add standard cleanup pattern**: The writeTests skill should include a `beforeEach` cleanup helper (e.g., `deleteAllTasks()`) as a standard pattern in generated test files. This would have prevented 4 of 6 failures (66.7%).
- **Mandate relative assertions**: Test authoring guidelines should require relative count assertions (`initialCount + N`) instead of hardcoded values. This is especially important when seed data exists.
- **Document click-target awareness**: When testing checkboxes/toggles, note that custom CSS may overlay the native input. Tests should click visible labels or wrappers.
- **Seed data documentation**: Test specs should document what seed data exists so test authors can account for it upfront.

### `skills/review/reportTestFailures.md`
- No changes recommended — the template captured all relevant data for this build. The data-contamination sub-category analysis proved useful for identifying the single dominant failure pattern.

## 5. Replay Fixes Table

No Replay-assisted fixes were made during this build. Replay was not used for any test failure — all 6 failures were diagnosed and resolved using error output alone.
