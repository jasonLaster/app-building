# Test Failures Report: app-building-h7qfyb-20260312-235700

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 4 |
| Logs with test failures | 2 |
| Logs without test failures | 2 |
| Total distinct test failures | 5 |
| Total affected tests | 20 |
| Replay usage rate | 0% (0/5) |
| Replay usage rate (debugged failures) | 0% (0/5) |
| Debugging success rate | 100% (5/5) |
| Replay-assisted success rate | N/A (Replay not used) |
| Recording availability rate | 20% (1/5) |
| Debugging efficiency | N/A (Replay not used) |
| Cascading fixes | 1 (missing-instructor-fk-reseed fixed 2 tests) |
| Self-inflicted failures | 1 (20% of total) |
| Total test re-runs | 6 (3 in log 153, 3 in log 155) |
| Unique root causes | 4 |
| Fix reuse rate | 0 (no fix patterns reused across spec files) |
| Pre-existing failure rate | 100% (5/5) |
| Replay decision quality | N/A (Replay not used) |
| Test Isolation Score | 100% (5/5 — all failures are data-contamination) (first report) |
| Self-inflicted fix quality cost | 1 re-run (1 failure × 1 iteration) |
| Infrastructure failure events | 2 events affecting 67 tests |

**Failure phase distribution:**

| Phase | Count |
|-------|-------|
| other (JourneyQA) | 5 |

**Failure resolution type distribution:**

| Resolution Type | Count |
|-----------------|-------|
| test-code | 3 |
| none | 2 |

**Diagnostic source effectiveness (resolved failures):**

| Source | Count |
|--------|-------|
| error-output | 5 |

**Fix iteration difficulty distribution:**

| Iterations | Count |
|------------|-------|
| 1 | 5 |

**Resolution effort distribution:**

| Tool Calls | Count |
|------------|-------|
| 1–3 | 3 |
| 4–9 | 2 |

**Infrastructure failure sub-categories:**

| Sub-category | Events | Affected Tests |
|--------------|--------|----------------|
| Environment (port-conflict) | 1 | 48 |
| Other (Replay browser deleted during disk cleanup) | 1 | 19 |
| Agent-workflow-error (ran `npx playwright test` directly, not `npm run test`) | noted in log 155 | — |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| log-153 | h7qfyb-153 | MemberDetailView — displays booking history with past and upcoming bookings | data-contamination (cross-run-accumulation) | yes | no | error-output-sufficient — FK constraint on instructor_id | no | — | — | yes | none |
| log-153 | h7qfyb-153 | MemberDetailView — displays waitlist entries | data-contamination (cross-run-accumulation) | yes | no | error-output-sufficient — same FK constraint | no | — | — | yes | none |
| log-153 | h7qfyb-153 | MemberTable — displays all members in a table | data-contamination (cross-run-accumulation) | yes | no | error-output-sufficient — count mismatch from paginated response bug | no | — | — | yes | none |
| log-155 | h7qfyb-155 | Cluster: empty-members-table (15 tests) | data-contamination (cross-run-accumulation) | yes | no | error-output-sufficient — FK constraint on member_id | no | — | — | yes | none |
| log-155 | h7qfyb-155 | Cluster: add-session-data-contamination (2 tests) | data-contamination (accumulated-data) | yes | no | error-output-sufficient — count mismatch from leftover session data | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| missing-instructor-fk-reseed | 2 | log-153 | Fixed by adding `beforeEach` reseeding to member-detail-display spec (test-code) |
| delete-all-members-paginated-response | 1 | log-153 | Fixed `deleteAllMembers` to use `{ items }` destructuring from paginated API response (test-code) |
| empty-members-table | 1 (15 tests) | log-155 | Resolved by re-seeding database; no code change committed |
| add-session-data-contamination | 1 (2 tests) | log-155 | Resolved by re-seeding database; no code change committed |

**Note:** Clusters `missing-instructor-fk-reseed`, `delete-all-members-paginated-response`, and `empty-members-table` all stem from the same systemic issue: cross-run data accumulation. Prior test runs wipe or corrupt seed data (members, instructors), causing FK constraint violations and count mismatches in subsequent runs. The `deleteAllMembers` bug in log-153 (using raw response instead of `{ items }` from paginated API) was itself a contributor to the empty-members-table cluster in log-155 — the fix to use proper destructuring stopped future member table wipes, but the already-empty database required manual re-seeding.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 5 | 100% |

### Data-Contamination Sub-Categories

Since data-contamination is 100% of failures:

| Sub-category | Count | % of Data-Contamination |
|--------------|-------|------------------------|
| cross-run-accumulation | 4 | 80% |
| accumulated-data | 1 | 20% |

**Cross-run-accumulation detection:** 80% of data-contamination failures are cross-run-accumulation. This strongly indicates missing `beforeEach` seed calls rather than within-spec test ordering issues. The fix requires API-level state reset (re-seeding) before each test, not test reordering.

### When Was Replay Most Effective?

Replay was not used in any failure. All 5 failures were diagnosed from error output alone — FK constraint violation messages and count mismatches provided sufficient information for diagnosis.

### When Was Replay NOT Used and Why?

All failures had clear, descriptive error output (FK constraint violations with specific column/table names, expected-vs-actual count mismatches). No recording was available for 4/5 failures because the Replay browser was either deleted (log-153 disk cleanup) or tests ran without proper recording infrastructure (log-155 port conflict). The one failure with a recording available (add-session-data-contamination) didn't need Replay because the error output was sufficient.

### Common Debugging Strategies That Worked

1. **Error output → code inspection → fix**: Reading FK constraint errors to identify missing seed data, then inspecting test setup code to add `beforeEach` reseeding. Effective for all 5 failures.
2. **Database re-seeding**: When failures were caused by empty/corrupted tables from prior runs, directly re-seeding the database resolved the issue immediately.
3. **Paginated API response fix**: Identifying that `deleteAllMembers` was treating the paginated response object as an array, then fixing destructuring to `{ items }`.

### Common Debugging Strategies That Failed

None — all debugging attempts succeeded on the first iteration.

### Self-Inflicted Failure Rate

**20% (1/5)** — The MemberTable failure was self-inflicted: the `deleteAllMembers` function's paginated response bug was introduced during a prior fix session. This is a moderate rate indicating generally good fix quality.

### Test Isolation Issues

**Test Isolation Score: 100%** — Every failure in this report is attributable to test isolation issues (all data-contamination). This is a systemic problem requiring dedicated process improvements.

The dominant pattern is **cross-run-accumulation** (80%): tests create or delete data without cleanup, and repeated test runs compound the problem. Affected spec files include:
- `tests/member-detail-display.spec.ts` — missing instructor FK after prior runs
- `tests/member-table.spec.ts` — member count mismatch from paginated delete bug
- `tests/booking-filters.spec.ts` / `tests/booking-actions.spec.ts` — empty members table
- `tests/schedule-week-view.spec.ts` / `tests/schedule-day-view.spec.ts` — leftover session data

Serial execution is **not** the root cause — the issue is lack of `beforeEach` seed data reset across independent test runs against the same database branch.

## 4. Recommendations

### `skills/tasks/build/testing.md`

1. **Mandate `beforeEach` seed data reset in all spec files that modify data.** Cross-run-accumulation accounts for 80% of failures. Every spec file that creates, updates, or deletes records must include a `beforeEach` hook that calls the seed API to restore a known-good state. This should be a required pattern, not optional.

2. **Fix `deleteAllMembers` pattern across all test utilities.** The paginated API response destructuring bug (`{ items }` vs raw response) was a direct cause of member table corruption. Audit all `deleteAll*` helpers to ensure they handle paginated responses correctly.

3. **Prohibit `npx playwright test` — always use `npm run test`.** Log-155 shows the agent ran tests directly with `npx playwright test`, bypassing dev server lifecycle management and causing port conflicts. This should be explicitly called out as a violation.

### `skills/debugging/*.md`

4. **Add "FK constraint violation → check seed data" diagnostic pattern.** FK constraint errors (e.g., "Key (member_id)=... is not present in table members") were the most common error signal. Document that these almost always indicate cross-run data accumulation requiring `beforeEach` reseeding, not application bugs.

5. **Add disk space monitoring before test runs.** Log-153 lost 19 tests to a deleted Replay browser after disk filled to 0MB with recordings. A pre-test disk space check (and recording cleanup threshold) would prevent this.

### `skills/review/reportTestFailures.md`

6. **Consider adding a "Database State" failure category** distinct from data-contamination, for cases where the fix is purely re-seeding with no code change (FAILURE_RESOLUTION_TYPE: none). This would distinguish between "tests need code fixes for isolation" vs "database just needs to be re-seeded" — currently both are categorized as data-contamination but have very different remediation paths.

## 6. UpdateSkills Notes

- Recommendation 6 ("Database State" failure category) was reviewed but skipped. The current
  `data-contamination` category with sub-categories (`cross-run-accumulation`, `accumulated-data`)
  already distinguishes between code-fix and reseed-only resolutions via `FAILURE_RESOLUTION_TYPE`.
  Adding a new top-level category would require changes to the analysis template and synthesis
  logic for marginal benefit. The existing `FAILURE_RESOLUTION_TYPE: none` field already captures
  the "just needs reseeding" case.

## 5. Replay Fixes Table

No Replay-assisted fixes were made in this report. Replay was not used for any failure — all were diagnosed from error output alone.
