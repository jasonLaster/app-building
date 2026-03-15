# Test Failures Report: app-building-szmt6q-20260313-142946

**App**: OptiRecall (Optometry/Eye Care — Patient Recall & Marketing)
**Date**: 2026-03-13
**Logs**: worker-app-building-szmt6q-1 through worker-app-building-szmt6q-90

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 90 |
| Logs with test failures | 15 |
| Logs without test failures | 75 |
| Total distinct test failure entries | 20 |
| Total affected tests (expanding clusters) | 144 |
| Replay usage rate | 5.0% (1/20) |
| Replay usage rate among debugged failures | 5.0% (1/20) |
| Debugging success rate | 100% (20/20) |
| Replay-assisted success rate | 100% (1/1) |
| Recording availability rate | 90.0% (18/20) |
| Debugging efficiency (Replay used but error output sufficed) | 1 (100% of Replay-used failures) |
| Cascading fixes | 11 changesets resolved multiple failures |
| Self-inflicted failures | 4 (20.0% of total) |
| Total test re-runs across all logs | 47 |
| Unique root causes | 19 (12 clustered + 7 unclustered) |
| Fix reuse rate | 1 reused pattern ("beforeEach truncateAndSeed") applied to 5+ spec files |
| Pre-existing failure rate | 80.0% (16/20) |
| Replay decision quality | 100% unnecessary (1/1 REPLAY_USED=yes had REPLAY_NECESSARY=no) |
| Test Isolation Score | 70.0% (14 data-contamination / 20 total) |
| Test Isolation Score trend | 70.0% (first report for this container) |

**Failure phase distribution**:
| Phase | Count | % |
|-------|-------|---|
| fixTests | 16 | 80.0% |
| checkDirectives | 2 | 10.0% |
| other (JourneyQA) | 2 | 10.0% |

**Failure resolution type distribution**:
| Type | Count | % |
|------|-------|---|
| test-code | 14 | 70.0% |
| app-code | 2 | 10.0% |
| both | 3 | 15.0% |
| none | 1 | 5.0% |

**Diagnostic source effectiveness** (among resolved failures):
| Source | Count | % |
|--------|-------|---|
| error-output | 18 | 90.0% |
| code-inspection | 2 | 10.0% |

**Self-inflicted fix quality cost**: 4 self-inflicted failures required 4 total additional fix iterations (1 each). However, the paginated-api-response-mismatch cluster (log 89) required 22 test re-runs across 17 spec files, making it the highest-cost self-inflicted issue.

**Fix iteration difficulty distribution**:
| Iterations | Count |
|-----------|-------|
| 0 (unresolved) | 1 |
| 1 | 14 |
| 2 | 2 |
| 3 | 1 |
| 4 | 1 |

The 4-iteration failure: overdue-activity-log-limit cluster (tests/overdue-patients-alert.spec.ts) — required iterative debugging of LIMIT cap + cross-run seed data issues, compounded by port-conflict infrastructure failures.

**Resolution effort distribution** (TOOL_CALL_COUNT):
| Range | Count |
|-------|-------|
| 1–3 calls | 1 |
| 4–9 calls | 10 |
| 10+ calls | 9 |

**Infrastructure failure events**: 9 events across 6 logs, affecting 52 tests total.

**Infrastructure failure sub-categories**:
| Sub-category | Events | Tests Affected |
|-------------|--------|----------------|
| Environment (port-conflict) | 4 | 31 |
| Other (config bugs, netlify auth) | 5 | 21 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|-----------| ------|---------|-----------|
| 30 | szmt6q/OptiRecall | Edit patient modal opens with pre-filled data | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | none |
| 30 | szmt6q/OptiRecall | Delete patient with confirmation | data-contamination | yes | yes | — | yes | PlaywrightSteps→Screenshot | PlaywrightSteps, Screenshot | yes | none |
| 31 | szmt6q/OptiRecall | Audience filter cluster (7 tests) | api-routing | yes | no | error-output-sufficient | yes | — | — | yes | 7008de7840 |
| 31 | szmt6q/OptiRecall | Launch campaign (Draft to Active) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 7008de7840 |
| 32 | szmt6q/OptiRecall | Create campaign successfully | backend-bug | yes | no | error-output-sufficient | yes | — | — | yes | 9445390129 |
| 32 | szmt6q/OptiRecall | Edit campaign inline cluster (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 9445390129 |
| 33 | szmt6q/OptiRecall | Campaign list ordering cluster (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | fecc3e437d |
| 34 | szmt6q/OptiRecall | CL reorder patient data cluster (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 969d8377ec |
| 38 | szmt6q/OptiRecall | Overdue activity log limit cluster (2 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 342ccf3222 |
| 40 | szmt6q/OptiRecall | Patient detail recall history empty state | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 074982585d |
| 41 | szmt6q/OptiRecall | Missing seed data patient list cluster (13 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | a73b4bbcb6 |
| 42 | szmt6q/OptiRecall | Patient retention metrics reflect changes | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | a4dd974a56 |
| 44 | szmt6q/OptiRecall | Netlify offline env loading cluster (11 tests) | test-setup-error | no | no | error-output-sufficient | yes | — | — | yes | 4da3041633 |
| 46 | szmt6q/OptiRecall | Missing seed data summary cards cluster (3 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 64cdc9cf3c |
| 46 | szmt6q/OptiRecall | Patients Due This Month card count | bad-assertion-api | yes | no | code-inspection | yes | — | — | yes | 64cdc9cf3c |
| 49 | szmt6q/OptiRecall | Missing seed data upcoming recalls cluster (8 tests) | data-contamination | yes | no | error-output-sufficient | yes | — | — | yes | 81724b57bb |
| 58 | szmt6q/OptiRecall | Overdue patient Send Recall updates dashboard | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | none |
| 63 | szmt6q/OptiRecall | beforeEach name lookup after rename cluster (4 tests) | data-contamination | no | no | error-output-sufficient | yes | — | — | yes | none |
| 89 | szmt6q/OptiRecall | Paginated API response mismatch cluster (80+ tests) | other | no | no | error-output-sufficient | no | — | — | yes | none |
| 89 | szmt6q/OptiRecall | Edit audience filters on existing draft campaign | race-condition | yes | no | code-inspection | no | — | — | yes | none |

## Root Cause Clusters

| Cluster | Count (tests) | Logs | Resolution |
|---------|--------------|------|------------|
| dirty-db-state | 1 (1) | 30 | Not code-fixed; resolved when run through proper test script with fresh DB branch |
| campaign-audience-preview-route | 1 (7) | 31 | Fixed route ordering in campaigns.ts — preview endpoint was shadowed by :id handler (7008de7840) |
| campaign-edit-seed-data-wiped | 1 (2) | 32 | Test reordering — create test ran before edit tests that depended on seed data (9445390129) |
| campaign-list-empty-state-ordering | 1 (3) | 33 | Test reordering — empty state test deleted all campaigns before dependent tests (fecc3e437d) |
| cl-reorder-missing-patient-data | 1 (2) | 34 | Added beforeAll database re-seeding (969d8377ec) |
| overdue-activity-log-limit | 1 (2) | 38 | Fixed DB re-seeding + increased activity log LIMIT from 15 to 20 (342ccf3222) |
| missing-seed-data-patient-list | 1 (13) | 41 | Added beforeAll truncateAndSeed (a73b4bbcb6) |
| netlify-offline-env-loading | 1 (11) | 44 | Fixed playwright.config.ts to load .env when using --offline mode (4da3041633) |
| missing-seed-data-summary-cards | 1 (3) | 46 | Added beforeAll truncateAndSeed (64cdc9cf3c) |
| missing-seed-data-upcoming-recalls | 1 (8) | 49 | Added beforeAll truncateAndSeed (81724b57bb) |
| beforeEach-name-lookup-after-rename | 1 (4) | 63 | Changed test to look up patient by ID from beforeAll instead of by name |
| paginated-api-response-mismatch | 1 (80+) | 89 | Updated all 17 test helper files to handle paginated response format {items, total, page, pageSize} |

**Note**: The clusters missing-seed-data-patient-list, missing-seed-data-summary-cards, missing-seed-data-upcoming-recalls, cl-reorder-missing-patient-data, and dirty-db-state all share a systemic root cause: **cross-run data accumulation/deletion**. Prior test runs against the shared Neon branch deleted patients or modified data without cleanup, causing subsequent spec files to start with an empty or corrupted database. The uniform fix was adding `beforeAll` with `truncateAndSeed`. This pattern affected 27+ tests across 5 spec files.

Similarly, campaign-edit-seed-data-wiped and campaign-list-empty-state-ordering share the pattern of **destructive test ordering** — tests that delete all records running before tests that depend on those records.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 14 | 70.0% |
| api-routing | 1 | 5.0% |
| backend-bug | 1 | 5.0% |
| bad-assertion-api | 1 | 5.0% |
| test-setup-error | 1 | 5.0% |
| race-condition | 1 | 5.0% |
| other | 1 | 5.0% |

### Data-Contamination Sub-Categories

Data-contamination is the dominant failure category at 70% (14/20), warranting sub-category breakdown:

| Sub-category | Count | % of Data-Contamination |
|-------------|-------|------------------------|
| cross-run-accumulation | 8 | 57.1% |
| destructive-ordering | 5 | 35.7% |
| accumulated-data | 1 | 7.1% |

**Cross-run-accumulation detection**: 57.1% of data-contamination failures (8/14) are cross-run-accumulation. This strongly indicates **missing `beforeEach`/`beforeAll` seed calls** rather than within-spec test ordering issues. The test-writing process did not consistently include database re-seeding, causing tests to fail when run against a database modified by previous test executions.

### Test Isolation Issues

The Test Isolation Score of **70.0%** (data-contamination: 14, strict-mode: 0, seed-data-mismatch: 0 = 14/20) significantly exceeds the 50% threshold, confirming test isolation as the dominant failure mode.

**Affected spec files**: add-edit-patient-modal, campaign-detail-actions, campaign-detail-editor, campaign-list, contact-lens-reorder-tracking, overdue-patients-alert, patient-detail-panel, patient-list, patient-retention-metrics, recall-summary-cards, upcoming-recalls-timeline, patient-detail-inline-edit.

**Root cause**: The test-writing phase did not mandate `beforeAll`/`beforeEach` database re-seeding in every spec file. Tests assumed a pristine seed-data state but the shared Neon branch accumulated changes across runs. Destructive tests (delete all records, empty state tests) were not consistently placed in serial blocks with post-test re-seeding.

**Isolation strategies that would have prevented these failures**:
1. Mandatory `beforeAll` with `truncateAndSeed` in every spec file
2. Destructive tests wrapped in `test.describe.serial` with post-test re-seeding
3. Test helpers that create and clean up their own data rather than depending on seed data

### When Was Replay Most Effective?

Replay was used only once (log 30, "Delete patient with confirmation") to view page state via Screenshot. However, REPLAY_NECESSARY was "no" — the error output alone would have been sufficient. Replay provided visual confirmation of missing patient data but did not reveal information unavailable from error messages.

### When Was Replay NOT Used and Why?

Replay was not used for 19/20 failures. In all cases, the reason was **error-output-sufficient** (17 cases) or **code-inspection** (2 cases). The overwhelmingly data-contamination-driven failure profile meant error messages (expected vs actual counts, "not found" errors, locator timeouts on missing elements) directly pointed to the root cause without needing visual debugging.

### Common Debugging Strategies That Worked

1. **Error message analysis → seed data investigation → beforeAll fix**: The dominant pattern. Locator timeouts or count mismatches immediately suggested missing data, confirmed by checking the test's dependency on seed data.
2. **Test ordering analysis**: For destructive-ordering failures, reading the test file to identify which test deletes data and reordering or adding re-seeding.
3. **API code inspection**: For the api-routing and backend-bug failures, reading the backend function code to find route ordering bugs or missing navigation calls.

### Common Debugging Strategies That Failed

No debugging strategies consistently failed — all 20 failures were resolved. The main inefficiency was the **paginated-api-response-mismatch** cluster (log 89) which required 22 test re-runs across 17 spec files because the API format change affected nearly every test file.

### Self-Inflicted Failure Rate

**20.0%** (4/20) of failures were self-inflicted:

1. **netlify-offline-env-loading** (log 44): Adding `--offline` flag to fix netlify auth broke env var loading. 11 tests affected.
2. **Overdue patient Send Recall** (log 58): Changing activity feed LIMIT from 20→15 (directive compliance) broke a count assertion. 1 test affected.
3. **beforeEach-name-lookup-after-rename** (log 63): Replacing hardcoded IDs with name-based lookups broke when a prior test renamed the patient. 4 tests affected.
4. **paginated-api-response-mismatch** (log 89): PaginateAPIs polish task changed API response format without updating test helpers. 80+ tests affected.

**Pattern**: The most costly self-inflicted issue (#4) was a **backend API format change without corresponding test updates**. The polishApp task changed all list APIs to return `{items, total, page, pageSize}` instead of raw arrays, but test files were not updated in the same task, causing massive failures during JourneyQA.

## 4. Recommendations

### `skills/tasks/build/testing.md`
- **Mandate `beforeAll` truncateAndSeed**: Every spec file MUST include a `beforeAll` hook that calls `truncateAndSeed` to ensure a clean database state. This single change would have prevented 8 of 20 failures (40%) — the entire cross-run-accumulation category.
- **Mandate post-destructive re-seeding**: Any test that deletes all records (empty state tests) MUST be in a `test.describe.serial` block and MUST re-seed the database afterward. This would have prevented 5 more failures (25%).
- **Require API-format-aware test updates**: When a task changes backend API response formats, the same task MUST update all affected test helpers. The paginated-api-response-mismatch failure was entirely preventable.

### `skills/debugging/*.md`
- **Add "data-contamination quick check" pattern**: When a test fails with a locator timeout or count mismatch, first check whether the test has `beforeAll`/`beforeEach` database seeding. If not, add it before investigating further. This resolves 70% of failures in this report.
- **De-prioritize Replay for data-contamination**: Error output alone was sufficient for all 14 data-contamination failures. Replay should only be considered after confirming the failure is not data-related.

### `skills/review/reportTestFailures.md`
- **Add "API-breaking-change" failure category**: The paginated-api-response-mismatch failure was categorized as "other" but represents a distinct, recurring pattern — a backend API format change that breaks test helpers. A dedicated category would improve pattern tracking.
- **Add self-inflicted sub-type tracking**: The current SELF_INFLICTED field is binary. Distinguishing between (a) fix-attempt regressions, (b) refactoring/polish breaking tests, and (c) new tests with wrong assumptions would enable more targeted process improvements.

### `skills/tasks/build/writeTests.md`
- **Enforce database isolation in test template**: The writeTests skill should generate `beforeAll` with `truncateAndSeed` as boilerplate in every new spec file. Currently, many spec files were written without this, requiring fixTests to add it later.

## 5. Replay Fixes Table

No test failures were both debugged with Replay and resolved via code fix. The single Replay-used failure ("Delete patient with confirmation", log 30) had FAILURE_RESOLUTION_TYPE: none — it resolved when run through the proper test script with a fresh database branch, requiring no code change.
