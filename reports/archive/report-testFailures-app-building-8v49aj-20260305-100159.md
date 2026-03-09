# Test Failures Report: app-building-8v49aj-20260305-100159

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 112 |
| Logs with test failures | 22 |
| Logs without test failures | 90 |
| Total distinct test failures | 80 |
| Replay usage rate | 0/80 (0%) |
| Replay usage rate among debugged failures | 0/27 (0%) |
| Debugging success rate | 27/27 (100%) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 29/80 (36.3%) |
| Debugging efficiency (Replay used but unnecessary) | 0 (Replay never used) |
| Cascading fixes | 10 (single changes resolving 2+ failures) |
| Self-inflicted failures | 55/80 (68.8%) |
| Total test re-runs | 32 |
| Unique root causes | 23 (20 clusters + 3 unclustered) |

**App built:** ReefDesk (aquarium maintenance service management)

**Overview:** All 80 test failures occurred during the fixTests phase. The majority of logs (90/112) had zero failures — these covered app specification, setup, code writing, test writing, deployment, directive checking, and report analysis tasks. No Replay debugging tools were used for any failure; all were diagnosed from error output and code inspection alone.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------|---------|---------|----|
| 45 | 8v49aj/ReefDesk | AddCustomerModal creates customer with all fields | infrastructure | yes | no | 404 responses in server logs | no | — | — | yes | none |
| 45 | 8v49aj/ReefDesk | AddCustomerModal creates customer with only required fields | infrastructure | yes | no | same root cause | no | — | — | yes | none |
| 45 | 8v49aj/ReefDesk | AddCustomerModal allows setting Inactive status | infrastructure | yes | no | same root cause | no | — | — | yes | none |
| 45 | 8v49aj/ReefDesk | AddCustomerModal new customer updates QuickStats | infrastructure | yes | no | same root cause | no | — | — | yes | none |
| 47 | 8v49aj/ReefDesk | AddTankModal new tank appears in customer detail tanks list | seed-data-mismatch | no | no | strict mode violation from duplicate rows | no | — | — | yes | none |
| 49 | 8v49aj/ReefDesk | AddTechnicianModal new technician available in Visit assignment | strict-mode | no | no | obvious from error message | no | — | — | yes | none |
| 50 | 8v49aj/ReefDesk | AddVisitModal new visit updates Dashboard TodaySchedule | CSS/layout | no | no | diagnosed from debug output | no | code analysis | — | yes | none |
| 50 | 8v49aj/ReefDesk | AddVisitModal new visit updates TankList last service date | strict-mode | no | no | obvious from error message | no | code analysis | — | yes | none |
| 53 | 8v49aj/ReefDesk | AlertsPanel shows empty state when no alerts | data-contamination | no | no | identified through code analysis | no | — | — | yes | none |
| 55 | 8v49aj/ReefDesk | CustomerDetail inline edit cancel reverts changes | data-contamination | no | no | identified through code analysis | no | — | — | yes | none |
| 56 | 8v49aj/ReefDesk | CustomerList displays all table columns | seed-data-mismatch | no | no | identified through code analysis | no | — | — | yes | none |
| 57 | 8v49aj/ReefDesk | QuickStats visits scheduled this week is accurate | data-contamination | no | no | identified through code analysis | no | — | — | yes | 5d67e9f |
| 58 | 8v49aj/ReefDesk | ServiceDetail inline edit category | data-contamination | no | no | obvious from error messages | no | — | — | yes | none |
| 58 | 8v49aj/ReefDesk | ServiceDetail inline edit price | data-contamination | no | no | same root cause | no | — | — | yes | none |
| 58 | 8v49aj/ReefDesk | ServiceDetail inline edit duration | data-contamination | no | no | same root cause | no | — | — | yes | none |
| 58 | 8v49aj/ReefDesk | ServiceDetail inline edit status Active to Inactive | data-contamination | no | no | same root cause | no | — | — | yes | none |
| 59 | 8v49aj/ReefDesk | ServiceDetail cancel delete keeps service | data-contamination | no | no | test ordering analysis | no | — | — | yes | none |
| 60 | 8v49aj/ReefDesk | ServiceList reflects deleted service | data-contamination | no | no | test ordering analysis | no | — | — | yes | none |
| 63 | 8v49aj/ReefDesk | TankDetail inline edit name | backend-bug | yes | no | code inspection of Redux slice | yes | — | — | yes | none |
| 63 | 8v49aj/ReefDesk | TankDetail inline edit type | backend-bug | yes | no | same root cause | yes | — | — | yes | none |
| 63 | 8v49aj/ReefDesk | TankDetail inline edit salinity | backend-bug | yes | no | same root cause | yes | — | — | yes | none |
| 63 | 8v49aj/ReefDesk | TankDetail inline edit cancel | backend-bug | yes | no | same root cause | yes | — | — | yes | none |
| 63 | 8v49aj/ReefDesk | TankDetail inline edit location | backend-bug | yes | no | same root cause | yes | — | — | yes | none |
| 63 | 8v49aj/ReefDesk | TankDetail inline edit notes | data-contamination | yes | no | test structure analysis | yes | — | — | yes | none |
| 65 | 8v49aj/ReefDesk | TankDetail water params history sorted most recent first | data-contamination | yes | no | error message showed row count mismatch | yes | — | — | yes | none |
| 65 | 8v49aj/ReefDesk | TankDetail water params salinity for saltwater/reef | CSS/layout | yes | no | obvious NUMERIC formatting | yes | — | — | yes | none |
| 65 | 8v49aj/ReefDesk | TankDetail water params history empty state | data-contamination | yes | no | test execution order analysis | yes | — | — | yes | none |
| 66 | 8v49aj/ReefDesk | TankList row click navigates to TankDetail | data-contamination | yes | no | error showed missing locator | yes | — | — | yes | none |
| 67 | 8v49aj/ReefDesk | TechnicianDetail inline edit name | backend-bug | yes | no | code inspection of Redux slice | yes | — | — | yes | none |
| 67 | 8v49aj/ReefDesk | TechnicianDetail inline edit email (cluster: 8 tests) | data-contamination | yes | no | test contamination pattern | yes | — | — | yes | none |
| 68 | 8v49aj/ReefDesk | TechnicianDetail completed visit entry navigates | data-contamination | yes | no | serial test analysis | yes | — | — | yes | none |
| 68 | 8v49aj/ReefDesk | TechnicianDetail (cluster: 6 tests) | data-contamination | yes | no | cascading from serial block | yes | — | — | yes | none |
| 70 | 8v49aj/ReefDesk | TodaySchedule (cluster: 3 tests) | data-contamination | yes | no | test execution order analysis | yes | — | — | yes | none |
| 71 | 8v49aj/ReefDesk | UpcomingVisits displays next 7 days | backend-bug | yes | no | diagnosed from error output | no | code fix | — | yes | 9efd819 |
| 71 | 8v49aj/ReefDesk | UpcomingVisits empty state | data-contamination | yes | no | diagnosed from error output | no | code fix | — | yes | 9efd819 |
| 71 | 8v49aj/ReefDesk | UpcomingVisits sorted by date ascending | data-contamination | yes | no | diagnosed from error output | no | code fix | — | yes | 9efd819 |
| 73 | 8v49aj/ReefDesk | VisitDetail delete visit updates tank visit history | seed-data-mismatch | yes | no | diagnosed from error output | no | seed data fix | — | yes | 5feb644 |
| 74 | 8v49aj/ReefDesk | VisitDetail (cluster: 7 tests) strict mode | strict-mode | yes | no | diagnosed from error output | no | code fix | — | yes | 2334d98 |
| 74 | 8v49aj/ReefDesk | VisitDetail empty state when no water reading | data-contamination | yes | no | diagnosed from error output | no | code fix | — | yes | 2334d98 |
| 74 | 8v49aj/ReefDesk | VisitDetail edit notes | data-contamination | yes | no | diagnosed from error output | no | code fix | — | yes | 2334d98 |
| 75 | 8v49aj/ReefDesk | VisitList (cluster: 12 tests) | seed-data-mismatch | yes | no | diagnosed from error output | no | test rewrite | — | yes | 54e7a56 |
| 88 | 8v49aj/ReefDesk | VisitList row click navigates to VisitDetail | data-contamination | no | no | obvious from assertion error | no | — | — | yes | none |
| 88 | 8v49aj/ReefDesk | VisitDetail actions (cluster: 7 tests) | strict-mode | no | no | obvious from strict mode error | no | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| netlify-functions-404 | 4 | 45 | Fixed missing --functions flag in netlify dev startup |
| seed-data-duplication | 1 | 47 | Added TRUNCATE before seed in seed-db.ts |
| serial-test-state-accumulation | 2 | 49, 50 | Used unique names; changed to relative assertions |
| testid-selector-overlap | 1 | 50 | Fixed testid prefixes to avoid matching nested elements |
| test-ordering-shared-db-state | 5 | 53, 55, 57, 59, 60 | Reordered tests; made assertions data-independent |
| field-priority-bug | 1 | 56 | Fixed field priority logic in CustomerList.tsx |
| service-name-rename-contamination | 4 | 58 | Updated tests to use different service entities |
| updateTank-replaces-currentTank | 5 | 63 | Fixed Redux slice to merge instead of replace |
| tank-detail-info-data-contamination | 1 | 63 | Isolated test data per test |
| water-params-data-contamination | 2 | 65 | Made assertions count-independent |
| numeric-formatting | 1 | 65 | Formatted NUMERIC column values to remove trailing zeros |
| test-data-contamination-hardcoded-names | 1 | 66 | Used dynamic lookups instead of hardcoded names |
| updateTechnician-replaces-currentTechnician | 1 | 67 | Fixed Redux slice to merge instead of replace |
| technician-name-contamination | 8 | 67 | Isolated name edits; used unique names per test |
| technician-detail-serial-contamination | 7 | 68 | Restructured serial test dependencies |
| today-schedule-data-contamination | 3 | 70 | Moved destructive empty-state test to end |
| upcoming-visits-date-format | 3 | 71 | Fixed date formatting bug in component (changeset 9efd819) |
| visit-detail-strict-mode | 7 | 74 | Used more specific selectors (changeset 2334d98) |
| visit-list-seed-count-mismatch | 12 | 75 | Rewrote tests to use dynamic counts (changeset 54e7a56) |
| visit-ocean-paradise-ambiguity | 8 | 88 | Added more specific visit matching; used .first() |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 36 | 45.0% |
| strict-mode | 16 | 20.0% |
| seed-data-mismatch | 15 | 18.8% |
| backend-bug | 7 | 8.8% |
| infrastructure | 4 | 5.0% |
| CSS/layout | 2 | 2.5% |

### When was Replay most effective?

Replay was **never used** in this build session. All 80 failures were diagnosed from error output and code inspection alone.

### When was Replay NOT used and why?

Replay was not used for any of the 80 failures. The primary reasons:

1. **Error output was sufficient (dominant pattern):** 73/80 failures had clear error messages — strict mode violations naming the duplicated elements, assertion mismatches with expected vs actual values, or timeout messages pointing to missing selectors. The failure messages themselves contained enough information to identify root causes.

2. **Code inspection was sufficient:** For the 7 backend-bug failures (Redux `updateTank.fulfilled` and `updateTechnician.fulfilled` replacing state), reading the Redux slice source code immediately revealed the bug without needing runtime debugging.

3. **Recording not available:** 51/80 failures had no recording available, making Replay impossible even if desired.

### Common debugging strategies that worked

1. **Test ordering analysis:** The most common fix pattern (used for ~45% of failures) was analyzing serial test execution order to find data contamination. Moving destructive tests (deletes, renames) to the end of describe blocks, or making later tests data-independent, resolved these issues.

2. **Dynamic assertions:** Replacing hardcoded expected values (counts, names) with relative or dynamically-queried values. E.g., checking "count decreased by 1" rather than "count is 3".

3. **Redux slice inspection:** For backend-bug category failures, reading the Redux slice `fulfilled` handlers immediately revealed that `updateX.fulfilled` was replacing the entire entity instead of merging fields.

4. **Seed data fixes:** Adding `TRUNCATE` before seeding (for Neon branch inheritance) and adding sufficient seed data for serial test chains.

### Common debugging strategies that failed

No debugging strategies consistently failed. All 27 debugged failures were eventually resolved. However, the most **re-run intensive** cases were:
- Log 50 (3 re-runs): Required iterative fixes for both testid overlap and serial state accumulation
- Log 74 (3 re-runs): Required multiple passes to fix strict mode + data contamination across 9 failures
- Log 75 (2 re-runs): Required significant test rewrite for 12 seed count mismatches

### Recurring failure categories

**Data contamination (45.0%)** was the dominant failure category, driven by a fundamental architectural issue: tests share a single database that is seeded once at the start and never reset between tests. Serial tests accumulate state (created/renamed/deleted entities), causing later tests to see unexpected data. This is by far the biggest source of failures.

**Strict-mode violations (20.0%)** were the second most common, almost always caused by duplicate data from serial test accumulation — multiple rows matching a filter that was expected to be unique.

**Seed-data-mismatch (18.8%)** failures came from tests assuming specific entity counts or names that didn't match the actual seed data, often due to Neon branch inheritance adding duplicate rows or other tests modifying counts.

**Self-inflicted failures (68.8%)** — the majority of failures were introduced by the agent's own test-writing process, not by application bugs. The tests were written with implicit assumptions about database state that broke when run serially.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add pattern: "serial test data contamination"** — When a test fails with unexpected counts, missing entities, or strict mode violations, first check if earlier tests in the same file created, renamed, or deleted entities. This was the root cause of 45% of all failures.
- **Add pattern: "Redux state replacement"** — When inline edit tests fail with missing nested data (arrays disappearing), check if the `fulfilled` reducer replaces the entire entity instead of merging updated fields.

### `skills/tasks/build/testing.md`

- **Mandate test isolation strategy:** The biggest source of failures (45%+) was shared database state across serial tests. The testing skill should require either:
  - Database truncation/reseed between spec files, or
  - Tests that query current state before asserting (relative assertions), or
  - Unique entity names per test to avoid strict mode collisions
- **Require destructive tests last:** Tests that delete all entities (empty state tests) or rename entities must be ordered at the end of their describe block, or use `test.describe.serial` with explicit dependencies.
- **Ban hardcoded entity counts in serial test files:** Tests should use `toBeGreaterThan(0)` or query initial count and assert relative changes, not hardcode expected values like "4 visits".
- **Require TRUNCATE in seed scripts for Neon branches:** Neon branch creation inherits parent data, so `seed-db.ts` must TRUNCATE tables before inserting seed data.

### `skills/review/reportTestFailures.md`

- **Add FAILURE_PHASE distribution to Summary Statistics:** All 80 failures were in fixTests phase. Tracking phase distribution would quickly highlight if failures shift to other phases.
- **Add "self-inflicted rate" as a key metric:** The 68.8% self-inflicted rate is a strong signal that test-writing quality needs improvement. This metric should be prominently tracked.
- **Consider adding a "Test Isolation Issues" section:** Given that data contamination + strict mode + seed mismatch account for 83.8% of all failures, a dedicated section analyzing test isolation patterns would be more actionable than the general failure table.
