# Test Failures Report: app-building-sxnlzj-20260312-230502

**App**: SparkStock — Material & Equipment Manager for Electrical Contractor
**Period**: 2026-03-12 23:05 to 2026-03-13 12:18 UTC

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 167 |
| Logs with test failures | 33 (19.8%) |
| Logs without test failures | 134 (80.2%) |
| Total distinct failure entries | 50 (48 after cross-log dedup) |
| Total affected tests | ~101 (~99 after dedup) |
| Cross-log duplicates | 2 |
| Replay usage rate | 0/50 (0%) |
| Replay usage among debugged failures | 0/44 (0%) |
| Debugging success rate | 43/44 (97.7%) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 42/50 (84%) |
| Debugging efficiency (Replay used but error output sufficient) | N/A (Replay never used) |
| Cascading fixes | 13 changesets resolving multiple failures |
| Self-inflicted failures | 0 (0%) |
| Total test re-runs across all logs | 55 |
| Unique root causes (named clusters + unclustered) | ~40 |
| Pre-existing failure rate | 36/50 (72%) — 34/48 (70.8%) after dedup |
| Replay decision quality | N/A (Replay never used) |
| Test Isolation Score | 80% (40/50: data-contamination 36 + batch-contamination 1 + strict-mode 1 + seed-data-mismatch 2) |
| Test Isolation Score trend | 80% (first report) |
| Fix reuse rate | 3 reused patterns (beforeEach-seed, destructive-test-reordering, dynamic-counts) across 10+ spec files |

**Failure phase distribution:**

| Phase | Count | % |
|-------|-------|---|
| fixTests | 39 | 78% |
| other (polishApp, journeyQA) | 10 | 20% |
| checkDirectives | 1 | 2% |

**Failure resolution type distribution:**

| Type | Count | % |
|------|-------|---|
| test-code | 29 | 58% |
| none (unresolved) | 10 | 20% |
| both | 7 | 14% |
| app-code | 4 | 8% |

**Diagnostic source effectiveness (among resolved failures):**

| Source | Count | % |
|--------|-------|---|
| error-output | 38 | 86% |
| error-context-snapshot | 6 | 14% |

**Self-inflicted fix quality cost:** 0 (no self-inflicted failures)

**Fix iteration difficulty distribution:**

| Iterations | Count | % |
|------------|-------|---|
| 0 (unresolved) | 7 | 14% |
| 1 | 33 | 66% |
| 2 | 6 | 12% |
| 3 | 2 | 4% |
| 4+ | 2 | 4% |

4+ iteration failures:
- po-line-items-data-contamination (4 iterations, 25 tool calls) — tests/po-line-items.spec.ts
- po-receive-items-status-contamination (counted as part of log 95's 4 total reruns) — tests/po-receive-items.spec.ts

**Resolution effort distribution:**

| Tool calls | Count | % |
|------------|-------|---|
| 1–3 | 5 | 12% |
| 4–9 | 18 | 42% |
| 10+ | 20 | 46% |

**Infrastructure failure sub-categories:** None — no infrastructure failures were recorded.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| 62 | sxnlzj/spark-stock | Creating a transfer updates Dashboard | backend-bug | yes | no | no-recording — Replay crashed | no | — | — | yes | none |
| 63 | sxnlzj/spark-stock | Create transfer from job site to warehouse | data-contamination | yes | no | no-recording — Replay crashed | no | — | — | yes | none |
| 65 | sxnlzj/spark-stock | Cluster: dashboard-data-contamination (10 tests) | data-contamination | yes | no | error-output-sufficient | no | — | — | yes | none |
| 65 | sxnlzj/spark-stock | Cluster: dashboard-empty-state-reseed (4 tests) | data-contamination | yes | no | error-output-sufficient | no | — | — | yes | none |
| 67 | sxnlzj/spark-stock | Cluster: equipment-add-modal-hardcoded-counts (2 tests) | data-contamination | yes | no | error-output-sufficient | no | — | — | yes | none |
| 67 | sxnlzj/spark-stock | Serial number must be unique | backend-bug | yes | no | error-output-sufficient | no | — | — | yes | none |
| 68 | sxnlzj/spark-stock | Assignment history entry created on inline edit | data-contamination | yes | no | error-output-sufficient | no | — | — | yes | none |
| 70 | sxnlzj/spark-stock | Equipment detail page displays all fields | data-contamination | yes | no | error-output-sufficient | no | — | — | yes | none |
| 71 | sxnlzj/spark-stock | Maintenance log shows correct columns for calibration | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | e4af583 |
| 72 | sxnlzj/spark-stock | Clearing search restores full equipment list | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | b8ae039 |
| 73 | sxnlzj/spark-stock | Equipment table displays all fields | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 4b9b5be |
| 77 | sxnlzj/spark-stock | Cluster: parallel-beforeEach-interference (2 tests) | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | dd3076b |
| 81 | sxnlzj/spark-stock | Cancel delete material from detail page | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | c1980b1 |
| 81 | sxnlzj/spark-stock | Inline edit unit cost | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | c1980b1 |
| 82 | sxnlzj/spark-stock | Cluster: seed-value-mismatch (5 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 6536c64 |
| 83 | sxnlzj/spark-stock | Location breakdown table displays quantity | seed-data-mismatch | yes | no | error-output-sufficient | yes | — | — | yes | bb17d88 |
| 84 | sxnlzj/spark-stock | Price history entry created on PO receive | race-condition | yes | no | error-output-sufficient | yes | — | — | yes | 1a6a906 |
| 84 | sxnlzj/spark-stock | Price history supports pagination | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 1a6a906 |
| 85 | sxnlzj/spark-stock | Transaction history displays chronological log | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 9630a1a |
| 85 | sxnlzj/spark-stock | Transaction entry created on PO receive | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 9630a1a |
| 86 | sxnlzj/spark-stock | Cluster: hardcoded-material-count (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | e9c046a |
| 87 | sxnlzj/spark-stock | Cluster: parallel-seed-race-condition (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 27d8bd0 |
| 88 | sxnlzj/spark-stock | Cluster: within-spec-data-contamination (7 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 443c97b |
| 89 | sxnlzj/spark-stock | Materials table displays all fields | seed-data-mismatch | yes | no | error-output-sufficient | yes | — | — | yes | 592f09c |
| 89 | sxnlzj/spark-stock | Materials table shows low stock indicator | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 592f09c |
| 91 | sxnlzj/spark-stock | Cluster: po-detail-actions-destructive-ordering (3 tests) | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | cad2406 |
| 92 | sxnlzj/spark-stock | PO detail page displays all PO fields | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | a1a3f95 |
| 92 | sxnlzj/spark-stock | Cancel inline edit to vendor name | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | a1a3f95 |
| 93 | sxnlzj/spark-stock | Cluster: po-filters-accumulated-data (4 tests) | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 30d08fc |
| 93 | sxnlzj/spark-stock | Filter POs by status Draft | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 30d08fc |
| 94 | sxnlzj/spark-stock | Cluster: po-line-items-data-contamination (3 tests) | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 8f86c8c |
| 95 | sxnlzj/spark-stock | Cluster: po-receive-items-status-contamination (9 tests) | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 4bfe6a7 |
| 95 | sxnlzj/spark-stock | Cluster: po-receive-items-wrong-nth-selectors (4 tests) | strict-mode | no | no | error-output-sufficient | yes | — | — | yes | 4bfe6a7 |
| 95 | sxnlzj/spark-stock | Receive Items creates transaction history entries | race-condition | no | no | error-output-sufficient | yes | — | — | yes | 4bfe6a7 |
| 96 | sxnlzj/spark-stock | Search POs by vendor name | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 5ba55ab |
| 97 | sxnlzj/spark-stock | PO table supports pagination | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 1d14c29 |
| 97 | sxnlzj/spark-stock | PO table pagination resets on filter change | timeout | no | no | error-output-sufficient | yes | — | — | yes | 1d14c29 |
| 97 | sxnlzj/spark-stock | PO number is auto-generated and sequential | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | 1d14c29 |
| 98 | sxnlzj/spark-stock | Transfer detail updates material transaction history | race-condition | no | no | error-output-sufficient | yes | — | — | yes | a4968c0 |
| 117 | sxnlzj/spark-stock | Cluster: cross-file-data-contamination (2 tests) | batch-contamination | yes | no | error-output-sufficient | yes | — | — | no | none |
| 138 | sxnlzj/spark-stock | Cluster: material-detail-data-contamination (4 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| 163 | sxnlzj/spark-stock | Recent transfer item links to transfer detail | other | yes | no | error-output-sufficient | yes | — | — | no (not attempted) | none |
| 163 | sxnlzj/spark-stock | Receive Items updates price history | data-contamination | yes | no | error-output-sufficient | yes | — | — | no (not attempted) | none |
| 163 | sxnlzj/spark-stock | Transfer detail updates material transaction history | data-contamination | yes | no | error-output-sufficient | yes | — | — | no (not attempted) | none |
| 164 | sxnlzj/spark-stock | Equipment condition visual styling | CSS/layout | yes | no | error-output-sufficient | yes | — | — | yes | ddc8d9d |
| 164 | sxnlzj/spark-stock | Recent transfer item links to transfer detail (CROSS_LOG_DUPLICATE of 163) | other | yes | no | error-output-sufficient | yes | — | — | yes | ddc8d9d |
| 165 | sxnlzj/spark-stock | Maintenance log displays chronological events | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| 165 | sxnlzj/spark-stock | Successfully add new equipment via modal | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| 166 | sxnlzj/spark-stock | Materials table displays all fields | data-contamination | yes | no | error-output-sufficient | yes | — | — | no (not attempted) | none |
| 166 | sxnlzj/spark-stock | Transfer detail updates transaction history (CROSS_LOG_DUPLICATE of 163) | data-contamination | yes | no | error-output-sufficient | yes | — | — | no (not attempted) | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| cross-run-data-accumulation | 2 entries (2 tests) | 163, 166 | Unresolved — pre-existing, identified in journeyQA |
| missing-seed-between-specs | 2 entries (2 tests) | 165 | Resolved via manual reseeding between spec files |
| missing-beforeAll-seed | 2 entries (2 tests) | 81, 85 | Resolved by adding beforeAll seed to specs |
| serial-test-accumulation | 2 entries (2 tests) | 84, 85 | Resolved by resetting DB before mutation tests |
| destructive-test-ordering | 1 entry (1 test) | 89 | Resolved by reordering destructive tests to end |
| po-table-accumulated-data | 1 entry (1 test) | 97 | Resolved by deleting test POs before pagination |
| po-table-destructive-ordering | 1 entry (1 test) | 97 | Resolved by reordering empty state test to end |
| missing-seed-beforeAll | 1 entry (15 cascaded) | 92 | Resolved by adding beforeAll seed — cascading fix resolved 15 tests |
| po-detail-info-serial-state | 1 entry (1 test) | 92 | Resolved by fixing cancel-edit expectation after serial save |
| po-filters-accumulated-data | 2 entries (5 tests) | 93 | Resolved by adding beforeAll seed + deleteAllPOs |

**Note**: The vast majority of clusters (8/10) share a systemic root cause: **test isolation failures due to persistent database state**. Whether manifesting as cross-run accumulation, destructive ordering, or missing seeds, the underlying issue is that tests do not clean up after themselves and do not reset state before running. This single architectural gap accounts for >80% of all test failures.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 36 | 72.0% |
| race-condition | 4 | 8.0% |
| seed-data-mismatch | 2 | 4.0% |
| backend-bug | 2 | 4.0% |
| other | 2 | 4.0% |
| batch-contamination | 1 | 2.0% |
| strict-mode | 1 | 2.0% |
| timeout | 1 | 2.0% |
| CSS/layout | 1 | 2.0% |
| **Total** | **50** | **100%** |

### Data-Contamination Sub-Categories

Data-contamination is the overwhelmingly dominant failure category at 72%, warranting detailed sub-category analysis:

| Sub-Category | Count | % of DC | Description |
|-------------|-------|---------|-------------|
| cross-run-accumulation | 17 | 47% | Records persist across test runs, inflating counts |
| destructive-ordering | 11 | 31% | Tests that delete/modify data run before dependent tests |
| accumulated-data | 8 | 22% | Tests create records without cleanup within a single run |

**Key insight**: cross-run-accumulation (47%) is the single largest sub-category. This means nearly half of all data-contamination failures could be prevented by a single `beforeEach` that calls `/api/seed` to reset the database. destructive-ordering (31%) could be prevented by either reordering destructive tests to run last or adding per-test state reset.

### Self-Inflicted Failure Rate

**0%** — no self-inflicted failures were recorded. All failures were pre-existing in the codebase or introduced by the test-writing process, not by fix attempts during debugging sessions. This indicates high fix quality.

### Test Isolation Issues

With data-contamination (36) + batch-contamination (1) + strict-mode (1) + seed-data-mismatch (2) collectively accounting for **80%** of all failures, test isolation is unambiguously the dominant failure mode.

**Affected spec files** (test isolation failures):
- tests/dashboard.spec.ts (14 tests across 2 clusters)
- tests/po-receive-items.spec.ts (13 tests across 2 clusters)
- tests/materials-filters.spec.ts (7 tests)
- tests/material-detail-info.spec.ts (5 tests across 2 logs)
- tests/po-filters.spec.ts (5 tests)
- tests/materials-filters-combined.spec.ts (4 tests)
- tests/material-detail-data-contamination (4 tests across 4 spec files)
- tests/po-line-items.spec.ts (3 tests)
- tests/po-detail-actions.spec.ts (3 tests)
- tests/materials-add-modal.spec.ts (3 tests)
- Nearly every other spec file in the test suite

**Root cause**: Serial test execution combined with shared database state. Tests modify the database (create records, change statuses, delete entries) and these changes persist to subsequent tests. The test-writing process generated tests with hardcoded expectations (e.g., `toHaveCount(3)`) that break when prior tests add data.

**Isolation strategies that worked**:
1. `beforeEach`/`beforeAll` calling `POST /api/seed` to reset database
2. Reordering destructive tests (delete, empty state) to run last
3. Using dynamic initial counts (`rows.count()`) instead of hardcoded values
4. Adding API-based cleanup of test-created records

### When Was Replay Most Effective?

Replay was never used in this report. All 50 failure entries were diagnosed without Replay.

### When Was Replay NOT Used and Why?

| Reason | Count | % |
|--------|-------|---|
| error-output-sufficient | 42 | 84% |
| no-recording (Replay crashed) | 3 | 6% |
| Not attempted (discovery run) | 5 | 10% |

The error output alone was sufficient for 84% of failures because the dominant failure mode (data-contamination) produces highly diagnostic error messages: count mismatches (`expected 3, received 5`), missing element errors (`Failed to load equipment`), and value mismatches (`expected "0.45" vs "0.5"`).

### Common Debugging Strategies That Worked

1. **Error output analysis → seed/cleanup fix** (most common): Read the count mismatch, add `beforeEach` seed or cleanup call. Resolved 33 failures in 1 iteration.
2. **Test reordering**: Move destructive tests (delete, empty state) to the end of serial suites.
3. **Dynamic counts**: Replace hardcoded `toHaveCount(N)` with dynamic initial count capture.
4. **Code inspection → app fix**: For backend-bug and CSS/layout categories, inspect app code to find the root cause.

### Common Debugging Strategies That Failed

1. **Parallel seed attempts**: Adding `beforeAll` seed without serial mode caused duplicate key errors when multiple workers hit the seed endpoint simultaneously (log 87, 3 iterations).
2. **Incomplete state reset**: Adding `beforeEach` reseed that conflicted with empty-state test patterns (log 65, 2 iterations).

## 4. Recommendations

### `skills/tasks/build/testing.md`

1. **Mandate `beforeEach` database seed in all serial spec files**: The Test Isolation Score of 80% is a systemic crisis. Every spec file that runs tests serially MUST include a `beforeEach` or `beforeAll` call to `POST /api/seed`. This single change would prevent ~72% of all test failures.

2. **Ban hardcoded row counts**: Replace all `toHaveCount(N)` assertions with dynamic patterns like `const initialCount = await rows.count(); ... await expect(rows).toHaveCount(initialCount + 1)`. Hardcoded counts are the #1 source of cross-run-accumulation failures.

3. **Enforce destructive-test-last ordering**: Tests that delete all records or test empty states must be the last tests in a serial suite. Document this as a required pattern.

4. **Add serial mode directive for data-modifying specs**: Any spec file that creates, updates, or deletes database records must use `test.describe.configure({ mode: 'serial' })` to avoid parallel interference.

### `skills/debugging/*.md`

1. **Data-contamination diagnostic shortcut**: When a test fails with a count mismatch (expected N, received M where M > N), the first action should be checking for missing `beforeEach` seed, not launching Replay. Error output is sufficient for 84% of these cases.

2. **No Replay needed for data-contamination**: Document that Replay adds no value for data-contamination failures. The error message pattern (`toHaveCount expected X received Y`) is deterministic and diagnostic. Reserve Replay for CSS/layout, race-condition, and other categories where visual/temporal state matters.

### `skills/review/reportTestFailures.md`

1. **Add "Test Isolation Score" as a mandatory top-level metric**: This report demonstrates that a single metric (data-contamination + batch-contamination + strict-mode + seed-data-mismatch as % of total) is the strongest predictor of test suite health. It should be prominently featured.

2. **Add "cross-run-accumulation" detection heuristic**: When >40% of data-contamination is cross-run-accumulation, flag it as indicating missing `beforeEach` seed calls rather than within-spec test ordering issues.

### Self-Inflicted Failure Patterns

No self-inflicted failures were observed in this report. The 0% self-inflicted rate indicates that fix quality was high — agents correctly identified root causes and applied targeted fixes without introducing regressions.

### Test Isolation Score Threshold

The Test Isolation Score of **80%** far exceeds the 50% threshold, confirming this is a systemic issue. **Recommendation**: Mandate `beforeEach` cleanup helpers in ALL spec files that modify data. The current approach of fixing isolation issues reactively per-file is unsustainable — the same pattern (add seed, add cleanup, reorder destructive tests) was applied to 25+ spec files independently, each consuming 1-30 tool calls.

## 5. Replay Fixes Table

No Replay fixes were recorded. Replay was not used for any failure in this report. All 44 debugged failures were diagnosed and resolved using error output and code inspection alone.
