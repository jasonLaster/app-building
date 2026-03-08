# Test Failures Report: app-building-mszga8

**Generated:** 2026-03-08
**App:** vet-rx (Veterinary Treatment & Prescription Manager)
**Worker:** app-building-mszga8

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 156 |
| Logs with test failures | 33 |
| Logs without test failures | 123 |
| Total distinct test failure entries | 49 |
| Total affected tests | 70 |
| Replay usage rate | 30.6% (15/49) |
| Replay usage rate (debugged failures) | 30.6% (15/49) |
| Debugging success rate | 100% (49/49) |
| Replay-assisted success rate | 100% (15/15) |
| Recording availability rate | 98.0% (48/49) |
| Debugging efficiency (Replay used but unnecessary) | 6 failures (40% of Replay-used failures) |
| Cascading fixes | 9 events resolving 22 tests total |
| Self-inflicted failures | 5 (10.2% of all failures) |
| Total test re-runs | 49 |
| Unique root causes | ~42 (23 named clusters + ~19 unclustered) |
| Fix reuse rate | 4 distinct fix patterns applied across multiple spec files |
| Infrastructure failure events | 1 event (14 tests affected per run, 2 runs) |

### Failure Phase Distribution

| Phase | Count | % of Total |
|-------|-------|-----------|
| fixTests | 47 | 95.9% |
| checkDirectives | 2 | 4.1% |

### Failure Resolution Type Distribution

| Type | Count | % of Total |
|------|-------|-----------|
| test-code | 25 | 51.0% |
| app-code | 13 | 26.5% |
| both | 11 | 22.4% |
| none | 0 | 0% |

### Test Isolation Score

**49.0%** (24/49) — data-contamination (13) + strict-mode (2) + seed-data-mismatch (9) = 24 of 49 failures were test isolation issues. This is just below the 50% threshold but still indicates test isolation is a dominant failure mode.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|-----------| ------|---------|-----------|
| w70 | mszga8/vet-rx | Lab result disappears after being reviewed | data-contamination | no | yes | | yes | PlaywrightSteps to identify failing step | PlaywrightSteps | yes | dde5c0d |
| w72 | mszga8/vet-rx | Empty state when no treatments scheduled today | data-contamination | yes | yes | | yes | NetworkRequest to inspect API response format | PlaywrightSteps, NetworkRequest | yes | none |
| w72 | mszga8/vet-rx | Only today's treatments are shown | data-contamination | no | no | diagnosed from error output | yes | | | yes | none |
| w75 | mszga8/vet-rx | Status update persists after page reload | data-contamination | yes | no | diagnosed from error output | yes | | | yes | 7a91667 |
| w76 | mszga8/vet-rx | Cluster: review-vet-id-uninitialized (2 tests) | race-condition | yes | yes | | yes | NetworkRequest to check PUT, code inspection | PlaywrightSteps, NetworkRequest | yes | none |
| w81 | mszga8/vet-rx | Cluster: medication-header-data-contamination (2 tests) | data-contamination | no | no | diagnosed from error output and page snapshot | yes | | | yes | none |
| w82 | mszga8/vet-rx | Cluster: numeric-trailing-zeros (2 tests) | backend-bug | yes | no | diagnosed from error-context snapshot | yes | | | yes | 91847e4 |
| w83 | mszga8/vet-rx | Empty state when no active prescriptions exist | seed-data-mismatch | no | no | diagnosed from error-context snapshot | yes | | | yes | 7d4678a |
| w84 | mszga8/vet-rx | Cluster: stock-adjustment-accumulation (2 tests) | data-contamination | no | no | diagnosed from error-context snapshot | yes | | | yes | 3e8c5a0 |
| w85 | mszga8/vet-rx | New controlled substance medication shows in CS Log | data-contamination | no | no | diagnosed from error-context snapshot | yes | | | yes | none |
| w86 | mszga8/vet-rx | Combine all filters simultaneously | data-contamination | no | no | diagnosed from error-context snapshot | yes | | | yes | none |
| w87 | mszga8/vet-rx | In Stock rows have no special highlighting | data-contamination | no | yes | | yes | NetworkRequest, PlaywrightSteps | NetworkRequest, PlaywrightSteps | yes | none |
| w87 | mszga8/vet-rx | Empty state when no medications exist | backend-bug | yes | no | diagnosed from code inspection | yes | | | yes | none |
| w88 | mszga8/vet-rx | Display weight with unit | backend-bug | yes | no | diagnosed from error-context snapshot | yes | | | yes | none |
| w88 | mszga8/vet-rx | Display computed age from date of birth | backend-bug | yes | no | diagnosed from error-context snapshot | yes | | | yes | none |
| w88 | mszga8/vet-rx | Edit Patient modal validates required fields | race-condition | yes | yes | | yes | PlaywrightSteps, Screenshots, Logpoint | PlaywrightSteps, Screenshot, Logpoint, SearchSources | yes | none |
| w88 | mszga8/vet-rx | Cluster: bella-rename-contamination (2 tests) | data-contamination | no | no | diagnosed from error output | yes | | | yes | none |
| w89 | mszga8/vet-rx | Cluster: date-format-invalid (2 tests) | backend-bug | yes | yes | | yes | NetworkRequest to check API response format | NetworkRequest | yes | none |
| w90 | mszga8/vet-rx | Display start date | backend-bug | yes | no | diagnosed from error-context snapshot | yes | | | yes | none |
| w92 | mszga8/vet-rx | Display treatment date | backend-bug | yes | yes | | yes | NetworkRequest to inspect API response | NetworkRequest | yes | none |
| w93 | mszga8/vet-rx | Cluster: seed-data-name-collision (3 tests) | strict-mode | yes | no | diagnosed from error output | yes | | | yes | none |
| w94 | mszga8/vet-rx | Edit Patient modal pre-fills existing data | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w96 | mszga8/vet-rx | Combine species filter and status filter | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w97 | mszga8/vet-rx | Cluster: numeric-trailing-zeros-weight (2 tests) | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| w99 | mszga8/vet-rx | Cluster: missing-patient-weight-api (3 tests) | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| w99 | mszga8/vet-rx | Display current patient weight | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w99 | mszga8/vet-rx | Click Apply to Prescription updates dosage | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| w99 | mszga8/vet-rx | Recalculate dosage when weight is changed | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| w100 | mszga8/vet-rx | Display allergy alert | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w101 | mszga8/vet-rx | Cluster: drug-interaction-matching (2 tests) | backend-bug | yes | yes | | yes | NetworkRequest to inspect API calls | NetworkRequest | yes | none |
| w101 | mszga8/vet-rx | New prescription appears on Patient Detail | missing-testid | yes | no | diagnosed from error output | yes | | | yes | none |
| w101 | mszga8/vet-rx | New prescription appears in Dashboard Pending Refills | missing-testid | yes | no | diagnosed from error output | yes | | | yes | none |
| w102 | mszga8/vet-rx | Rx Number auto-increments | data-contamination | yes | yes | | yes | PlaywrightSteps to check test flow | PlaywrightSteps | yes | none |
| w105 | mszga8/vet-rx | Cluster: clinic-useEffect-race (2 tests) | race-condition | yes | yes | | yes | NetworkRequest to identify duplicate GETs | NetworkRequest | yes | none |
| w105 | mszga8/vet-rx | Cluster: clinic-data-contamination (2 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | none |
| w106 | mszga8/vet-rx | Cluster: units-data-contamination (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | | | yes | 278d963 |
| w107 | mszga8/vet-rx | Remove a veterinarian | backend-bug | yes | yes | | yes | PlaywrightSteps, NetworkRequest for DELETE | PlaywrightSteps, NetworkRequest | yes | none |
| w109 | mszga8/vet-rx | Cluster: vitals-seed-and-post (2 tests) | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w109 | mszga8/vet-rx | Cluster: vitals-useEffect-race (3 tests) | race-condition | yes | yes | | yes | PlaywrightSteps, NetworkRequest, Logpoint | PlaywrightSteps, NetworkRequest | yes | none |
| w109 | mszga8/vet-rx | Display vitals section with all fields | CSS/layout | no | no | diagnosed from error output | yes | | | yes | none |
| w110 | mszga8/vet-rx | Set follow-up date | race-condition | yes | yes | | yes | NetworkRequest, PlaywrightSteps, Logpoint | NetworkRequest, PlaywrightSteps, Logpoint | yes | ca9205b |
| w110 | mszga8/vet-rx | Enter follow-up notes | race-condition | yes | yes | | yes | NetworkRequest, Logpoint on useEffect/onChange | NetworkRequest, PlaywrightSteps, Logpoint, ListSources, ReadSource | yes | ca9205b |
| w111 | mszga8/vet-rx | Click Edit Treatment button opens edit mode | CSS/layout | yes | no | diagnosed from error-context snapshot | yes | | | yes | 8806e9f |
| w111 | mszga8/vet-rx | Edit treatment and save changes | race-condition | yes | yes | | yes | PlaywrightSteps, NetworkRequest to inspect PUT body | PlaywrightSteps, NetworkRequest | yes | 8806e9f |
| w112 | mszga8/vet-rx | Cluster: data-contamination-gabapentin (2 tests) | strict-mode | yes | no | diagnosed from error output | yes | | | yes | none |
| w113 | mszga8/vet-rx | Cluster: wrong-treatment-selection (2 tests) | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w113 | mszga8/vet-rx | Cluster: overly-restrictive-helper (3 tests) | seed-data-mismatch | no | no | diagnosed from error output | no | | | yes | none |
| w128 | mszga8/vet-rx | Reviewed by and review date displayed after review | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| w138 | mszga8/vet-rx | Frequency field is required | race-condition | no | no | diagnosed from error output | yes | | | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| date-format-invalid | 4 entries (5+ tests) | w88, w89, w90, w92 | Fixed formatDate() to split on 'T' before parsing ISO timestamps |
| numeric-trailing-zeros | 3 entries (6 tests) | w82, w88, w97 | Fixed with parseFloat() to strip Postgres NUMERIC trailing zeros |
| seed-name-collision | 2 entries (2 tests) | w85, w86 | Used unique test entity names to avoid collisions with seed data |
| missing-patient-weight-api | 2 entries (4 tests) | w99 | Added patient_weight fields to prescription API response |
| useEffect-guard-during-edit | 3 entries (7 tests) | w105, w109, w110 | Added editing state guard to prevent useEffect from resetting form values during user edits |
| destructive-test-ordering | 1 entry (1 test) | w72 | Wrapped destructive tests in test.describe.serial |
| review-vet-id-uninitialized | 1 entry (2 tests) | w76 | Added useEffect to sync reviewVetId when veterinarians load |
| medication-header-data-contamination | 1 entry (2 tests) | w81 | Added API calls to reset state before each test |
| stock-adjustment-accumulation | 1 entry (2 tests) | w84 | Changed to relative count assertions |
| intra-spec-data-contamination | 1 entry (1 test) | w87 | Fixed test data isolation |
| bella-rename-contamination | 1 entry (2 tests) | w88 | Fixed test ordering |
| seed-data-name-collision | 1 entry (3 tests) | w93 | Used unique patient names |
| drug-interaction-matching | 1 entry (2 tests) | w101 | Fixed interaction matching to check categories, not just exact names |
| clinic-useEffect-race | 1 entry (2 tests) | w105 | Added editing guard to prevent state reset |
| clinic-data-contamination | 1 entry (2 tests) | w105 | Made tests self-sufficient with preconditions |
| units-data-contamination | 1 entry (3 tests) | w106 | Tests check and set preconditions before assertions |
| vitals-seed-and-post | 1 entry (2 tests) | w109 | Fixed seed data and POST handler |
| vitals-useEffect-race | 1 entry (3 tests) | w109 | Added editing state guard |
| followup-useEffect-race | 1 entry (2 tests) | w110 | Added editing state guard |
| formatDate-iso-handling | 1 entry (1 test) | w111 | Fixed formatDate for ISO timestamp handling |
| data-contamination-gabapentin | 1 entry (2 tests) | w112 | Used .first() locator for accumulated data |
| wrong-treatment-selection | 1 entry (2 tests) | w113 | Created targeted helper functions |
| overly-restrictive-helper | 1 entry (3 tests) | w113 | Relaxed helper to accept various treatment states |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 13 | 26.5% |
| backend-bug | 13 | 26.5% |
| seed-data-mismatch | 9 | 18.4% |
| race-condition | 8 | 16.3% |
| strict-mode | 2 | 4.1% |
| CSS/layout | 2 | 4.1% |
| missing-testid | 2 | 4.1% |

### When Was Replay Most Effective?

Replay was essential (REPLAY_NECESSARY=yes) for **5 failures**, all involving **race conditions** where useEffect timing or stale React state caused issues invisible in error output:
- **Edit Patient modal validates required fields** (w88): Logpoint revealed useEffect resetting editName after fill('') cleared it
- **Remove a veterinarian** (w107): NetworkRequest found DELETE was aborted by page reload + 500 from FK constraint
- **Set follow-up date / Enter follow-up notes** (w110): Logpoint traced exact useEffect timing showing state reset between onChange and save
- **Edit treatment and save changes** (w111): NetworkRequest revealed stale React state in PUT body

The most effective Replay tool combinations for race conditions were:
1. **NetworkRequest** to inspect request bodies and confirm stale/missing data
2. **Logpoint** to trace useEffect timing and state changes
3. **PlaywrightSteps** to identify which step failed

### When Was Replay NOT Used and Why?

Replay was not used for **34/49 failures** (69.4%). The most common reasons:
- **Diagnosed from error output** (18 cases): Error messages clearly indicated the issue (strict mode violations, missing elements, wrong values)
- **Diagnosed from error-context snapshot** (10 cases): Page snapshots showed the mismatch directly (e.g., "10.0000 mg/kg" vs expected "10 mg/kg")
- **Diagnosed from code inspection** (2 cases): Reading source code revealed the bug

Of the 15 failures where Replay was used, **6 (40%) could have been diagnosed from error output alone** (REPLAY_NECESSARY=no). This suggests Replay is being used somewhat speculatively — effective for complex race conditions but over-applied for simpler issues.

### Common Debugging Strategies That Worked

1. **Error output triage** — Most effective for data-contamination, strict-mode, and seed-data-mismatch failures. Error messages like "strict mode violation: locator resolved to N elements" or "expected 3 rows, found 5" directly pointed to the root cause.
2. **NetworkRequest inspection** — Highly effective for race conditions. Checking PUT/POST request bodies revealed when React state was stale or form values were overwritten.
3. **Logpoint tracing** — The most powerful technique for useEffect timing bugs. Placing logpoints on useEffect callbacks and event handlers pinpointed exact timing of state resets.
4. **API state reset before tests** — Pattern of calling API to reset test data preconditions before each test, preventing data contamination.

### Common Debugging Strategies That Failed

No strategies consistently failed. The main anti-pattern was using Replay for simple issues where error output was sufficient, adding unnecessary debugging time.

### Self-Inflicted Failure Rate

**5/49 failures (10.2%)** were self-inflicted — introduced by the agent's own fix attempts during the session:
- w70: Test data contamination from parallel test execution (test isolation oversight)
- w72: Fix introduced destructive test ordering issue
- w109: CSS/layout bug introduced during vitals fix
- w113: Overly restrictive helper function broke 3 tests while fixing 2
- w138: Race condition introduced when replacing native selects with custom dropdowns

The 10.2% rate is healthy and indicates the test-writing process is generally sound. Most self-inflicted failures were caught in the same session.

### Test Isolation Issues

Test isolation categories (data-contamination + strict-mode + seed-data-mismatch) account for **49.0% of all failures** (24/49). Key patterns:

1. **Data contamination (13 failures)**: Tests modifying shared database state without cleanup. Most common pattern: destructive tests (deleting all records, changing status) running before tests that depend on seed data.
2. **Seed-data-mismatch (9 failures)**: Tests hardcoding expected values that don't match actual seed data (wrong counts, wrong field formats, missing entities).
3. **Strict-mode violations (2 failures)**: Test entity names colliding with seed data, causing multiple matching elements.

**Most affected areas**: Patient data tests, medication tests, and prescription tests — all tables with interrelated seed data.

**Effective fixes applied**:
- `test.describe.serial` for destructive tests
- API state reset before each test
- Unique test entity names (e.g., "TestDiazepam" instead of "Diazepam")
- Relative count assertions instead of absolute counts
- Self-sufficient test preconditions (check and set state rather than assuming)

## 4. Recommendations

### `skills/debugging/*.md`
- **Add useEffect race condition pattern**: When tests show stale/null values in PUT/POST bodies, use NetworkRequest to confirm, then Logpoint on useEffect callbacks and event handlers to trace timing. This was the most reliably diagnosed pattern with Replay.
- **Add Replay decision heuristic**: Skip Replay when error output contains: strict mode violations, exact value mismatches shown in snapshots, or "element not found" with clear locator. Use Replay when: request body has unexpected values, tests pass individually but fail together, or timing-dependent UI behavior.
- **Add formatDate debugging pattern**: When "Invalid Date" appears in UI, check if the formatDate utility double-appends time portions to ISO timestamps.

### `skills/tasks/build/testing.md`
- **Mandate unique test entity names**: All test-created entities should use unique names with a suffix (e.g., "Ketamine-Test1") to prevent collisions with seed data. This alone would have prevented 4 failures.
- **Require self-sufficient preconditions**: Tests should never assume seed data state — always check and set preconditions via API before assertions. This would have prevented the largest cluster of data-contamination failures.
- **Auto-apply `test.describe.serial`**: Any test that deletes all records or modifies shared state should be wrapped in `test.describe.serial` during WriteTests, not left for FixTests to discover.
- **Add useEffect editing guards as standard pattern**: For any React form that loads data via useEffect and allows editing, include an `isEditing` state guard that prevents useEffect from overwriting user input. This pattern was needed across 3 spec files (7 tests).

### `skills/review/reportTestFailures.md`
- **Add PRE_EXISTING statistics**: Track pre-existing vs newly introduced failures as a top-level metric. In this report, 73.5% (36/49) were pre-existing bugs found by tests, indicating the test suite is effective at finding real issues.
- **Add "Replay decision quality" metric**: Track the ratio of REPLAY_NECESSARY=no among REPLAY_USED=yes failures. A high ratio (40% here) suggests process improvement opportunity for when to use Replay vs trust error output.
- **Clarify FAILURE_PHASE for cluster format**: The per-log analysis template should require FAILURE_PHASE in cluster entries for consistency.
