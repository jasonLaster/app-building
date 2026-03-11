# Test Failures Report: app-building-qso3nd-20260311-083607

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 52 |
| Logs with test failures | 5 |
| Logs without test failures | 47 |
| Total distinct test failures | 6 |
| Total affected tests | 24 |
| Replay usage rate | 0% (0/6) |
| Replay usage rate among debugged failures | 0% (0/6) |
| Debugging success rate | 100% (6/6) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 16.7% (1/6) |
| Debugging efficiency (Replay used but unnecessary) | N/A (Replay never used) |
| Cascading fixes | 4 changesets resolved multiple failures (6, 7, 3, and 6 tests respectively) |
| Self-inflicted failures | 6/6 (100%) |
| Total test re-runs across all logs | 6 |
| Unique root causes | 6 (4 clusters + 2 unclustered) |
| Fix reuse rate | 0 (no FIX_PATTERN values recorded) |
| Pre-existing failure rate | 0% (0/6) |
| Replay decision quality | N/A (Replay never used) |
| Test Isolation Score | 100% (6/6 — 4 data-contamination + 2 strict-mode) |
| Self-inflicted fix quality cost | 8 total re-runs caused by self-inflicted failures |

**Failure phase distribution:**

| Phase | Count |
|-------|-------|
| fixTests | 5 |
| checkDirectives | 1 |

**Failure resolution type distribution:**

| Resolution Type | Count |
|-----------------|-------|
| test-code | 6 |
| app-code | 0 |
| both | 0 |
| none | 0 |

**Diagnostic source effectiveness (among resolved failures):**

| Source | Count |
|--------|-------|
| error-output | 5 |
| error-context-snapshot | 1 |

**Fix iteration difficulty distribution:**

| Iterations | Count | Tests |
|------------|-------|-------|
| 1 | 4 | empty-item-list-stale-seed-id cluster, finalize-trip-data-contamination cluster, item-list-data-contamination cluster, DeleteStoreButton strict-mode |
| 2 | 2 | stores-sidebar-data-contamination cluster, Clicking delete smart quote |

**Resolution effort distribution (where TOOL_CALL_COUNT available):**

| Tool Calls | Count |
|------------|-------|
| 1-3 | 2 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-24 | qso3nd / shared-grocery-list | EmptyItemList cluster (6 tests) | data-contamination | no | no | error-output-sufficient — timeout on deleted UUID | no | — | — | yes | df9197b9b8 |
| worker-25 | qso3nd / shared-grocery-list | FinalizeTrip cluster (7 tests) | data-contamination | no | no | error-output-sufficient — wrong counts from accumulated data | no | — | — | yes | a97f67efe1 |
| worker-26 | qso3nd / shared-grocery-list | item-list-items cluster (3 tests) | data-contamination | no | no | error-output-sufficient — wrong checkbox states from prior modifications | no | — | — | yes | 11e96f2da2 |
| worker-27 | qso3nd / shared-grocery-list | stores-sidebar cluster (6 tests) | data-contamination | no | no | error-output-sufficient — timeout on deleted UUIDs | no | — | — | yes | 11e96f2da2 |
| worker-27 | qso3nd / shared-grocery-list | Clicking delete shows confirmation dialog | strict-mode | no | no | error-output-sufficient — smart quote mismatch | no | — | — | yes | 11e96f2da2 |
| worker-35 | qso3nd / shared-grocery-list | Deleting selected store clears main content | strict-mode | no | no | error-output-sufficient — substring match on similar names | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| empty-item-list-stale-seed-id | 6 tests | worker-24 | Fixed — EmptyItemList tests create own store via API instead of using hardcoded UUID (df9197b9b8) |
| finalize-trip-data-contamination | 7 tests | worker-25 | Fixed — added beforeEach hook to reset items to seed state (a97f67efe1) |
| item-list-data-contamination | 3 tests | worker-26 | Fixed — used different stores per test to avoid state overlap (11e96f2da2) |
| stores-sidebar-data-contamination | 6 tests | worker-27 | Fixed — removed deleteAllStores() call and reordered tests (11e96f2da2) |

## 3. Patterns

### Replay Usage
Replay was **never used** across all 6 failures. All failures were diagnosable from error output alone (5/6) or error context snapshots (1/6). Recordings were unavailable for 5 of 6 failures, making Replay infeasible in most cases regardless.

### Common Debugging Strategies That Worked
- **Error output analysis**: All 6 failures were successfully diagnosed from test error output without needing visual debugging. Error messages clearly indicated wrong counts, missing elements, or mismatched text.
- **Data isolation fixes**: Each data-contamination cluster was resolved by isolating test data — creating fresh stores per test, resetting state in beforeEach, or using different seed data per test case.
- **Cascading fix pattern**: All 4 data-contamination clusters were resolved with single changesets that fixed 3-7 tests simultaneously, demonstrating efficient root cause identification.

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 4 | 66.7% |
| strict-mode | 2 | 33.3% |

### Data-Contamination Sub-Categories

Since data-contamination is the dominant category (66.7% > 40%), here is the breakdown:

| Sub-Category | Count | Description |
|--------------|-------|-------------|
| destructive-ordering | 2 | Tests deleted all stores/items, destroying seed data for subsequent tests (logs 24, 27) |
| accumulated-data | 1 | Tests added items without cleanup, causing wrong counts in later tests (log 25) |
| destructive-ordering | 1 | Tests toggled checkboxes and deleted items, corrupting state for later tests (log 26) |

### Self-Inflicted Failure Rate
**100%** of all failures were self-inflicted — all test failures were introduced by the test-writing process itself, not by application bugs. This is expected for a new app build where tests are written from scratch and initial runs discover data isolation issues.

### Test Isolation Issues
With a Test Isolation Score of **100%** (data-contamination + strict-mode accounting for all failures), test isolation is the sole failure mode in this build. All 4 spec files experienced data-contamination issues on their first test runs:

- **empty-states.spec.ts**: EmptyStoresSidebar tests deleted all stores, breaking EmptyItemList tests that depended on a hardcoded store UUID.
- **item-list-add-finalize.spec.ts**: AddItemInput tests accumulated items, breaking FinalizeTrip tests that expected clean state.
- **item-list-items.spec.ts**: Tests mutated checkbox state and deleted items, breaking subsequent tests in the same spec.
- **stores-sidebar.spec.ts**: "Add multiple stores" test called deleteAllStores(), destroying seed data for all DeleteStoreButton tests.

**Pattern**: Every spec file had destructive operations (deletes, state mutations) that polluted shared state for subsequent tests. The fix in every case was test-code-only — isolating data per test or resetting state before each test.

## 4. Recommendations

### `skills/tasks/build/testing.md`
- **Add data isolation guidance**: Every `describe` block with destructive operations (delete, modify, toggle) should include a `beforeEach` or `beforeAll` hook that resets state. This would have prevented all 4 data-contamination clusters (22 affected tests).
- **Avoid hardcoded UUIDs in tests**: Tests should create or discover their own entities rather than relying on seed data UUIDs. This was also caught during the checkDirectives phase.
- **Recommend per-test store creation**: For tests that modify store state, create a fresh store via API in `beforeEach` rather than sharing seed stores across tests.

### `skills/debugging/*.md`
- **Data-contamination diagnosis pattern**: When error output shows "timeout waiting for element" or "expected 3, received 5" type mismatches, check whether earlier tests in the same spec modify or delete the entities being tested. Error output alone is sufficient for diagnosis in >80% of these cases.

### `skills/review/reportTestFailures.md`
- No changes recommended. The template captured all relevant data for this build. The cluster format was effective for grouping the 4 data-contamination failures.

## 5. Replay Fixes Table

*No Replay-assisted fixes in this report. Replay was not used for any test failure.*
