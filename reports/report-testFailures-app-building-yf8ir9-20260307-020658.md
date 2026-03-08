# Test Failures Report: app-building-yf8ir9-20260307-020658

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 742 |
| Logs with test failures | 14 |
| Logs without test failures | 728 |
| Total distinct test failures | 27 |
| Total affected tests | 40 |
| Total test re-runs across all logs | 26 |
| Replay usage rate | 18.5% (5/27) |
| Replay usage rate among debugged failures | 18.5% (5/27) |
| Debugging success rate | 100% (27/27) |
| Replay-assisted success rate | 100% (5/5) |
| Recording availability rate | 100% (27/27) |
| Debugging efficiency (Replay used but unnecessary) | 100% (5/5 — all cases where Replay was used, error output alone would have sufficed) |
| Cascading fixes | 3 (changesets resolving multiple failures: a393315 fixed 4, 662d983 fixed 4, 6a869ff fixed 2) |
| Self-inflicted failures | 4 (14.8% of total — MD-TL-13, Set-DT-4, address-schema-migration cluster of 3 tests, CD-CM-5) |
| Unique root causes | 18 (8 clustered root causes + 10 unclustered failures) |
| Fix reuse rate | 2 (wait-before-count applied to 4 spec files; unique-names-per-serial-test applied to 3 spec files) |
| Infrastructure failure events | 0 |
| **Failure phase distribution** | fixTests: 25, fixTests: 2 (from worker-80 during checkDirectives) |
| **Failure resolution type distribution** | test-code: 16, app-code: 6, both: 3, none: 0 (2 unspecified in clusters) |
| **Test Isolation Score** | 59.3% (16/27 — data-contamination: 9, strict-mode: 3, seed-data-mismatch: 4) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------:|-------|---------|-----------|
| worker-46 | yf8ir9 / case-matter-manager | CD-CH-3: Inline edit client name - cancel by pressing Escape | data-contamination | yes | yes | | yes | PlaywrightSteps to trace edits across CD-CH-2 and CD-CH-3 | PlaywrightSteps | yes | c5fa74c |
| worker-47 | yf8ir9 / case-matter-manager | CD-CM-8: Matter columns display correct data types | data-contamination | yes | no | diagnosed from error output | yes | | | yes | 73ed7df |
| worker-50 | yf8ir9 / case-matter-manager | MD-DL-1: Display deadlines list with all columns | other | yes | no | diagnosed from error output | yes | | | yes | a393315 |
| worker-50 | yf8ir9 / case-matter-manager | MD-DL-10: Add Deadline modal - close by Escape or clicking outside | other | yes | no | diagnosed from error output | yes | | | yes | a393315 |
| worker-50 | yf8ir9 / case-matter-manager | MD-DL-13: Delete a deadline (cluster: serial-test-data-accumulation) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | a393315 |
| worker-50 | yf8ir9 / case-matter-manager | MD-DL-15: Status displays correctly (cluster: serial-test-data-accumulation) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | a393315 |
| worker-51 | yf8ir9 / case-matter-manager | MD-DC-4: Document category options | race-condition | yes | yes | | yes | PlaywrightSteps to find stuck step | PlaywrightSteps | yes | none |
| worker-51 | yf8ir9 / case-matter-manager | MD-DC-6: Click document to download | strict-mode | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-53 | yf8ir9 / case-matter-manager | MD-OV-1, MD-OV-3, MD-OV-4, MD-OV-17 (cluster: date-format-normalization, 4 tests) | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-53 | yf8ir9 / case-matter-manager | MD-OV-11: Edit estimated value | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-53 | yf8ir9 / case-matter-manager | MD-OV-16: Save with no changes | data-contamination | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-54 | yf8ir9 / case-matter-manager | MD-PT-7: Add Party modal - Cancel button | race-condition | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-54 | yf8ir9 / case-matter-manager | MD-PT-8: Add Party modal - close by Escape or clicking outside | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-54 | yf8ir9 / case-matter-manager | MD-PT-9, MD-PT-10 (cluster: duplicate-party-names, 2 tests) | strict-mode | yes | no | diagnosed from error output | yes | | | yes | 662d983 |
| worker-56 | yf8ir9 / case-matter-manager | MD-TL-2, MD-TL-3, MD-TL-12, MD-TL-13 (cluster: timeline-entry-accumulation, 4 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-56 | yf8ir9 / case-matter-manager | MD-TL-13: No duplicate timeline entries (self-inflicted) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-57 | yf8ir9 / case-matter-manager | ML-MF-5: Assigned Attorney filter | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | none |
| worker-57 | yf8ir9 / case-matter-manager | ML-MF-7: Search by client name | seed-data-mismatch | yes | yes | | yes | NetworkRequest to inspect API response | NetworkRequest | yes | none |
| worker-58 | yf8ir9 / case-matter-manager | ML-MT-2: Display matter data in rows | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | 10ab3d9f |
| worker-60 | yf8ir9 / case-matter-manager | Cli-NC-5: Validation - Name is required | race-condition | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-62 | yf8ir9 / case-matter-manager | Set-AM-1, Set-AM-4 (cluster: serial-data-contamination-attorneys, 2 tests) | data-contamination | yes | yes | | yes | PlaywrightSteps to identify accumulated data | PlaywrightSteps | yes | 6a869ff |
| worker-63 | yf8ir9 / case-matter-manager | Set-DT-2: Add a new deadline template | race-condition | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-63 | yf8ir9 / case-matter-manager | Set-DT-4: Add offset entries to a template (self-inflicted) | strict-mode | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-64 | yf8ir9 / case-matter-manager | Set-MT-2: Add a custom matter type | race-condition | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-80 | yf8ir9 / case-matter-manager | Cli-NC-2, NC-3, NC-4 (cluster: address-schema-migration, 3 tests, self-inflicted) | seed-data-mismatch | no | no | diagnosed from error output | yes | | | yes | none |
| worker-80 | yf8ir9 / case-matter-manager | CD-CM-5: Create matter via pre-filled modal (self-inflicted) | race-condition | no | no | diagnosed from error output | yes | | | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| serial-test-data-accumulation | 2 tests | worker-50 | Fixed with unique-test-data-names; single changeset a393315 resolved all 4 failures in spec |
| date-format-normalization | 4 tests | worker-53 | Fixed by normalizing ISO timestamps to YYYY-MM-DD in app code |
| change-detection-date-normalization | 1 test | worker-53 | Fixed with both app-code and test-code changes |
| duplicate-party-names | 2 tests | worker-54 | Fixed with unique-test-names; changeset 662d983 |
| timeline-entry-accumulation | 4 tests | worker-56 | Fixed by clearing timeline entries before tests |
| attorney-sort-order-mismatch | 2 tests | worker-57, worker-58 | Fixed test assertions to match actual seed data sort order |
| serial-data-contamination-attorneys | 2 tests | worker-62 | Fixed with unique-names-per-serial-test; changeset 6a869ff |
| serial-data-contamination-templates | 1 test | worker-63 | Fixed with unique-names-per-serial-test |
| address-schema-migration | 3 tests | worker-80 | Fixed by adding alter-table migration for new address column |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 9 | 33.3% |
| race-condition | 6 | 22.2% |
| seed-data-mismatch | 4 | 14.8% |
| backend-bug | 3 | 11.1% |
| strict-mode | 3 | 11.1% |
| other | 2 | 7.4% |

### When Was Replay Most Effective?

Replay was used in 5 of 27 failures (18.5%). It was used for:
- **data-contamination** (2 cases): CD-CH-3, serial-data-contamination-attorneys cluster
- **race-condition** (1 case): MD-DC-4 dropdown blocking click
- **seed-data-mismatch** (2 cases): ML-MF-5 and ML-MF-7 attorney/search mismatches

Tool sequences used: PlaywrightSteps alone (3 cases), NetworkRequest alone (1 case), PlaywrightSteps + NetworkRequest (1 case).

However, in **all 5 cases** where Replay was used, REPLAY_NECESSARY was "no" — the error output alone would have sufficed. This indicates Replay was used as a confirmation tool rather than being strictly necessary for diagnosis.

### When Was Replay NOT Used and Why?

In 22 of 27 failures (81.5%), Replay was not used. The universal reason was **"diagnosed from error output"** — the error messages provided sufficient information to identify the root cause. This is consistent with the high proportion of data-contamination, race-condition, and seed-data-mismatch failures, which tend to produce clear error messages (count mismatches, strict mode violations, wrong text values).

### Common Debugging Strategies That Worked

1. **Diagnosed from error output** (22/27 failures): The most effective strategy. Error messages from Playwright (count mismatches, text mismatches, strict mode violations) directly pointed to root causes.
2. **PlaywrightSteps** (4/5 Replay cases): Used to trace test step execution and identify where tests got stuck or what state accumulated across serial tests.
3. **NetworkRequest** (2/5 Replay cases): Used to inspect API response data and confirm seed data values.

### Common Debugging Strategies That Failed

No debugging strategies failed in this report. All 27 failures were successfully diagnosed and resolved.

### Self-Inflicted Failure Rate

**14.8% (4/27)** of failures were self-inflicted:
- **MD-TL-13**: Fix for timeline-entry-accumulation caused status to already be "Discovery", preventing the test action
- **Set-DT-4**: Fix created duplicate template names in serial execution
- **address-schema-migration cluster (3 tests)**: Schema change didn't include migration for existing tables
- **CD-CM-5**: Test assertion checked count before page data refreshed after app-code changes

This is a healthy rate (<50%), indicating the fix process is generally reliable. The self-inflicted failures were secondary effects of otherwise correct fixes.

### Test Isolation Issues

**Test Isolation Score: 59.3%** (16/27 failures from data-contamination + strict-mode + seed-data-mismatch).

This exceeds the 50% threshold, indicating test isolation is the dominant failure mode.

**Affected spec files:**
- `client-header.spec.ts` — serial test data persistence (rename in one test affects next)
- `client-matters.spec.ts` — seed data format mismatch (MAT-YYYY-NNN vs M-YYYY-NNNN)
- `matter-deadlines.spec.ts` — serial test data accumulation
- `matter-timeline.spec.ts` — timeline entry accumulation across serial tests
- `matters-filters.spec.ts` — seed data sort order mismatch
- `matters-table.spec.ts` — seed data attorney name mismatch
- `settings-attorneys.spec.ts` — serial data contamination with duplicate names
- `settings-deadline-templates.spec.ts` — strict mode from duplicate template names
- `matter-parties.spec.ts` — strict mode from duplicate party names
- `matter-overview.spec.ts` — data contamination from timeline entries
- `matter-documents.spec.ts` — strict mode violation

**Root cause analysis**: All test suites run serially (Playwright `test.describe.serial`), and tests create data that persists to subsequent tests. The recurring patterns are:
1. **Count assertions break** because earlier tests add data (9 instances)
2. **Strict mode violations** because duplicate names accumulate (3 instances)
3. **Seed data assumptions wrong** because tests hardcode expected values without verifying actual data (4 instances)

**Isolation strategies that would have prevented these failures:**
- Use unique test data names per test (already applied as fix pattern `unique-names-per-serial-test`)
- Use relative count assertions (e.g., `initialCount + 1`) with wait-before-count pattern
- Query actual seed data values before asserting (don't hardcode attorney names)
- Clear accumulated state between tests (applied in timeline spec)

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: "error-output-first"** — For data-contamination, race-condition, strict-mode, and seed-data-mismatch categories, diagnose from error output before using Replay. In this report, 100% of Replay uses were unnecessary. Replay should be reserved for CSS/layout issues, complex race conditions, and backend bugs where error output is ambiguous.
- **Add tool sequence: PlaywrightSteps -> Screenshot** — When Replay is needed, PlaywrightSteps alone was sufficient in 80% of cases. Only escalate to Screenshot/Evaluate when step-level information is insufficient.

### `skills/tasks/build/testing.md`
- **Mandate wait-before-count pattern**: All tests that count items and compare before/after should wait for the first item to be visible before capturing `initialCount`. This single pattern would have prevented 4 of 27 failures (14.8%).
- **Mandate unique test data names**: Tests creating data in serial suites must use unique names (e.g., include test ID). This would have prevented 5 of 27 failures (18.5%).
- **Mandate relative assertions over absolute**: Tests should not hardcode expected counts or values from seed data. Use relative assertions (e.g., `toHaveCount(initialCount + 1)`) and query actual data. This would have prevented 4 of 27 seed-data-mismatch failures.
- **Add pre-test state verification**: For serial test suites, each test should verify its preconditions rather than assuming state from prior tests.

### `skills/review/reportTestFailures.md`
- **Clarify FAILURE_PHASE for checkDirectives**: Worker-80 had failures during a checkDirectives/testSpec task but these were categorized as fixTests. Add guidance that failures occurring during directive-checking should use `checkDirectives` as FAILURE_PHASE.
- **Add cluster-level SELF_INFLICTED**: When a cluster format is used, there's no SELF_INFLICTED field. Add it to the cluster template so self-inflicted clusters are tracked consistently.
- **Clarify TEST_FAILURES counting with overlapping clusters**: Worker-56 had a cluster of 4 tests and a separate entry for MD-TL-13 which was also in the cluster. Add guidance that a test already counted in a cluster should not have a separate entry unless it has a distinct root cause.
