# Test Failures Report: app-building-2whqms

**Generated:** 2026-03-11
**App:** ArchFlowRFI (Architecture/Engineering Firm — RFI & Submittal Log)
**Branch:** app-building-2whqms

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 174 |
| Logs with test failures | 25 |
| Logs without test failures | 149 |
| Total distinct test failure entries | 27 |
| Total affected tests | 55 |
| Replay usage rate | 4/27 (14.8%) |
| Replay usage rate among debugged failures | 4/27 (14.8%) |
| Debugging success rate | 27/27 (100%) |
| Replay-assisted success rate | 4/4 (100%) |
| Recording availability rate | 26/27 (96.3%) |
| Debugging efficiency (Replay used but unnecessary) | 4/4 (100%) |
| Cascading fixes | 6 events (resolving 19 tests total) |
| Self-inflicted failures | 8/27 (29.6%) |
| Total test re-runs across all logs | 34 |
| Unique root causes | 27 |
| Fix reuse rate | 0 (no FIX_PATTERN values reused across spec files) |
| Pre-existing failure rate | 21/27 (77.8%) |
| Replay decision quality | 4/4 REPLAY_NECESSARY=no (100% — all Replay usage was unnecessary) |
| Test Isolation Score | 16/27 (59.3%) — data-contamination only; no strict-mode or seed-data-mismatch |
| Infrastructure failure events | 6 events affecting 71 tests |

**Failure phase distribution:**

| Phase | Count | % |
|-------|-------|---|
| fixTests | 22 | 81.5% |
| other (JourneyQA) | 5 | 18.5% |

**Failure resolution type distribution:**

| Resolution Type | Count | % |
|-----------------|-------|---|
| test-code | 21 | 77.8% |
| app-code | 6 | 22.2% |
| both | 0 | 0% |
| none | 0 | 0% |

**Diagnostic source effectiveness (among all 27 resolved failures):**

| Source | Count | % |
|--------|-------|---|
| error-output | 20 | 74.1% |
| error-context-snapshot | 5 | 18.5% |
| page-snapshot | 2 | 7.4% |
| code-inspection | 0 | 0% |
| replay-necessary | 0 | 0% |

**Self-inflicted fix quality cost:** 8 self-inflicted failures caused 9 total re-runs.

**Fix iteration difficulty distribution:**

| Iterations | Count | % |
|------------|-------|---|
| 1 | 23 | 85.2% |
| 2 | 4 | 14.8% |
| 3 | 0 | 0% |
| 4+ | 0 | 0% |

**Resolution effort distribution (7 failures with TOOL_CALL_COUNT data):**

| Tool Calls | Count |
|------------|-------|
| 1–3 | 2 |
| 4–9 | 5 |
| 10+ | 0 |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|--------------------|---------:|-------|---------|-----------|
| worker-67 | 2whqms/ArchFlowRFI | Add Contact button is visible and labeled correctly | timeout | yes | no | error-output-sufficient — timeout on cold-start API call | yes | — | — | yes | 854c408efa |
| worker-68 | 2whqms/ArchFlowRFI | Search works correctly on repeated use | data-contamination | yes | no | error-output-sufficient — locator count mismatch | yes | — | — | yes | 94b7e2bc3d |
| worker-68 | 2whqms/ArchFlowRFI | Search persists while switching between inline edits | backend-bug | yes | yes | — | yes | PlaywrightSteps → NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 94b7e2bc3d |
| worker-72 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] Editing external contact updates refs; Associated projects links | backend-bug | yes | yes | — | yes | PlaywrightSteps → NetworkRequest | PlaywrightSteps, NetworkRequest | yes | 8a1844a8fa |
| worker-74 | 2whqms/ArchFlowRFI | [Cluster: 3 tests] External contacts sort tests | data-contamination | yes | no | error-output-sufficient — empty state shown | yes | — | — | yes | none |
| worker-75 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] Internal team crossref tests | test-setup-error | yes | no | error-output-sufficient — timeout in beforeEach | no | — | — | yes | none |
| worker-78 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] Internal team sort tests | data-contamination | yes | no | error-output-sufficient — empty state shown | yes | — | — | yes | none |
| worker-79 | 2whqms/ArchFlowRFI | Project number validates uniqueness | backend-bug | yes | no | error-output-sufficient — page-snapshot showed missing error | yes | — | — | yes | none |
| worker-80 | 2whqms/ArchFlowRFI | [Cluster: 4 tests] Overview tab contact/stats tests | backend-bug | yes | yes | — | yes | PlaywrightSteps → NetworkRequest | PlaywrightSteps, NetworkRequest | yes | none |
| worker-81 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] RFIs tab filter/search tests | data-contamination | no | no | error-context-snapshot sufficient | yes | — | — | yes | 2e862365c2 |
| worker-82 | 2whqms/ArchFlowRFI | [Cluster: 4 tests] Project submittals filter tests | data-contamination | no | no | error-context-snapshot sufficient | yes | — | — | yes | fa0b710481 |
| worker-83 | 2whqms/ArchFlowRFI | Create Project modal prevents duplicate numbers | other | yes | no | error-context-snapshot sufficient | yes | — | — | yes | pending |
| worker-85 | 2whqms/ArchFlowRFI | Projects table empty state when filters match no projects | data-contamination | yes | yes | — | yes | — | — | yes | 66ef5f00fc |
| worker-91 | 2whqms/ArchFlowRFI | Activity log no duplicate entries | data-contamination | yes | no | error-output-sufficient — count mismatch | yes | — | — | yes | aed7657d9f |
| worker-93 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] RFI status/activity after create | data-contamination | yes | no | error-output-sufficient — strict mode duplicate rows | yes | — | — | yes | e6eba2cdd2 |
| worker-95 | 2whqms/ArchFlowRFI | Due date field shows warning styling when overdue | data-contamination | yes | no | error-output-sufficient — date mismatch | yes | — | — | yes | 0940f56563 |
| worker-101 | 2whqms/ArchFlowRFI | [Cluster: 5 tests] RFI status action tests | data-contamination | yes | no | error-output-sufficient — wrong status states | yes | — | — | yes | none |
| worker-102 | 2whqms/ArchFlowRFI | RFI table empty state when filters match no RFIs | data-contamination | yes | no | error-output-sufficient — element not found after delete | yes | — | — | yes | 8e3e9f7768 |
| worker-104 | 2whqms/ArchFlowRFI | Validation error for duplicate section number | backend-bug | yes | no | error-output-sufficient — generic error instead of field-specific | yes | — | — | yes | 4e0a178fd1 |
| worker-115 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] Submittal review result tests | data-contamination | yes | no | error-output-sufficient — wrong status state | yes | — | — | yes | f9c356efb4 |
| worker-116 | 2whqms/ArchFlowRFI | Revision history entries ordered by revision number | data-contamination | yes | no | error-output-sufficient — 7 rows instead of 3 | yes | — | — | yes | 5aae4eb20f |
| worker-117 | 2whqms/ArchFlowRFI | [Cluster: 7 tests] Submittal status action tests | data-contamination | yes | no | error-output-sufficient — wrong status states | yes | — | — | yes | 7f4a50bc36 |
| worker-118 | 2whqms/ArchFlowRFI | Submittal table empty state when filters match no submittals | data-contamination | yes | no | error-output-sufficient — empty after prior delete | yes | — | — | yes | a585bba12d |
| worker-171 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] Journey 2, Journey 5 | test-setup-error | no | no | error-output-sufficient — HTML returned instead of JSON | yes | — | — | yes | none |
| worker-172 | 2whqms/ArchFlowRFI | [Cluster: 2 tests] Journey 6, Journey 7 | missing-testid | no | no | error-output-sufficient — testid locators not found | yes | — | — | yes | none |
| worker-173 | 2whqms/ArchFlowRFI | [Cluster: 3 tests] Journey 10, 12, 14 | data-contamination | no | no | error-output-sufficient — count mismatches | yes | — | — | yes | none |
| worker-173 | 2whqms/ArchFlowRFI | Journey 12: Check RFI Response Status | other | no | no | error-output-sufficient — assertion mismatch | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| url-routing-segments | 1 test | worker-68 | Fixed URL segment parsing in contacts.ts |
| projects-url-parsing | 2 tests | worker-72 | Fixed projects.ts and project-stats.ts segment indexing |
| netlify-functions-url-parsing | 4 tests | worker-80 | Fixed project-contacts.ts, rfis.ts, submittals.ts, spec-sections.ts, attachments.ts |
| external-contacts-destructive-ordering | 3 tests | worker-74 | Moved destructive empty-state test to end |
| crossref-beforeEach-timeout | 2 tests | worker-75 | Removed unnecessary beforeEach API cleanup |
| internal-team-destructive-ordering | 2 tests | worker-78 | Moved destructive empty-state test to serial block at end |
| rfi-status-state-contamination | 5 tests | worker-101 | Added setRFIStatus resets in beforeEach |
| duplicate-rfi-subject | 2 tests | worker-93 | Made fillValidRFI generate unique subjects with Date.now() |
| submittal-review-status-contamination | 2 tests | worker-115 | Added API calls to reset SUB-003 status before tests |
| submittal-status-contamination | 7 tests | worker-117 | Added beforeEach API calls to reset submittal statuses |
| wrong-api-url-cleanup | 2 tests | worker-171 | Fixed API URLs from `/.netlify/functions/api/` to `/api/` |
| wrong-testid-values | 2 tests | worker-172 | Fixed incorrect data-testid values in test code |
| journey-qa-leftover-data | 3 tests | worker-173 | Added data cleanup in afterEach, flexible count assertions |

**Note:** Clusters url-routing-segments (W68), projects-url-parsing (W72), and netlify-functions-url-parsing (W80) all stem from the same systemic root cause: Netlify functions used hardcoded `segments[3]` for URL parsing, but the `/api/` prefix changed the segment index to `[2]`. This single architectural bug caused 7 affected tests across 3 logs.

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 16 | 59.3% |
| backend-bug | 5 | 18.5% |
| test-setup-error | 2 | 7.4% |
| other | 2 | 7.4% |
| timeout | 1 | 3.7% |
| missing-testid | 1 | 3.7% |

### Data-Contamination Sub-Categories

Data-contamination is the dominant failure category at 59.3%, warranting detailed breakdown:

| Sub-Category | Count | % of Data-Contamination | Affected Tests |
|-------------|-------|------------------------|----------------|
| destructive-ordering | 9 | 56.3% | 28 |
| accumulated-data | 7 | 43.7% | 14 |
| settings-contamination | 0 | 0% | 0 |

**destructive-ordering** (9 entries, 28 tests): Tests that delete/modify all records or transition statuses ran before dependent tests. Most commonly: "empty state" tests that delete all records via API, and status transition tests that leave entities in unexpected states. Affected spec files: external-contacts-table, internal-team-table, projects-table, rfi-detail-fields, rfi-status-actions, rfi-table, submittal-review, submittal-status-actions, submittal-table.

**accumulated-data** (7 entries, 14 tests): Tests that create records without cleanup caused subsequent tests to find unexpected row counts or duplicate entries. Affected spec files: contact-search, rfi-create, rfi-activity-log, submittal-revision-history, project-rfis, project-submittals, journey QA tests.

### Test Isolation Issues

The Test Isolation Score of 59.3% (all from data-contamination) signals that test isolation is the dominant failure mode in this build. The pattern is consistent:

1. **Shared database state**: All tests within a spec file share a single Neon database branch with seed data. Tests that create, delete, or modify records affect subsequent tests.
2. **No cleanup between tests**: Most spec files lack beforeEach/afterEach cleanup, relying on seed data being unchanged.
3. **Destructive patterns**: "Empty state" tests delete all records; status transition tests leave entities in terminal states.
4. **Parallel execution**: With `fullyParallel: true`, test ordering is non-deterministic, making contamination intermittent.

**Most affected areas**: Status-related entities (RFIs, submittals) and table display tests (sort, filter, count assertions) are most vulnerable because they depend on exact record counts or specific entity states.

### When Was Replay Most Effective?

Replay was used 4 times, all for backend-bug/data-contamination categories. In all 4 cases, the agent used PlaywrightSteps to identify the failing step, then NetworkRequest to inspect API responses. The pattern was consistent: identify where the test got stuck → check if the API returned an error. However, **all 4 cases were diagnosed as REPLAY_NECESSARY=no** — the error output alone would have sufficed.

### When Was Replay NOT Used and Why?

23/27 failures (85.2%) did not use Replay. Reasons:
- **error-output-sufficient** (18): Error messages, count mismatches, and status text in output were sufficient
- **error-context-snapshot** (5): Page snapshots in error context files showed the problem clearly

### Common Debugging Strategies That Worked

1. **Error output analysis** (20/27): Reading Playwright error messages for count mismatches, missing elements, or wrong text was the most effective strategy.
2. **Test reordering** (9 fixes): Moving destructive tests (deletes, status changes) to end of describe blocks or into serial blocks.
3. **State reset in beforeEach** (4 fixes): Adding API calls to reset entity states before each test.
4. **Dynamic assertions** (3 fixes): Replacing absolute count assertions with relative/flexible ones.
5. **Unique test data** (2 fixes): Using Date.now() or unique identifiers to prevent collisions.

### Common Debugging Strategies That Failed

None — all 27 failures were resolved successfully, most in a single iteration (85.2%).

### Self-Inflicted Failure Rate

**8/27 (29.6%)** of failures were self-inflicted. Breakdown:
- **Test-code data contamination during writeTests** (W81, W82): Tests written with create operations that contaminated subsequent tests in the same spec.
- **Pre-existing bug exposure** (W83, W85): Tests written that revealed RTK error serialization bugs and destructive test ordering, though the underlying issues were pre-existing.
- **JourneyQA test errors** (W171, W172, W173): Journey tests written with wrong API URLs, wrong testid values, and wrong count assumptions against the deployed app.

The dominant self-inflicted pattern is writing tests that create/modify data without considering the impact on other tests in the same spec file.

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "data-contamination" diagnostic shortcut**: When error output shows count mismatches (e.g., "expected 3, got 4") or "not found" after a destructive test, skip Replay and go straight to test ordering analysis. This was sufficient for 16/27 failures.
2. **Add "URL segment parsing" pattern**: When API returns HTML or 405/404, check Netlify function URL segment indexing. The `/api/` prefix vs `/.netlify/functions/` prefix changes segment indices.

### `skills/tasks/build/testing.md`

1. **Mandate test isolation practices**: Given the 59.3% Test Isolation Score, require:
   - All spec files that delete records must wrap destructive tests in `test.describe.serial` at the end of the file.
   - Status transition tests must include beforeEach API calls to reset entity state.
   - Tests that create records should use unique identifiers (e.g., `Date.now()`) and/or flexible count assertions (e.g., `expect(count).toBeGreaterThan(0)` instead of `expect(count).toBe(3)`).
2. **Add writeTests checklist item**: Before committing a new spec file, verify no test creates/modifies/deletes shared data without cleanup or isolation.
3. **JourneyQA URL validation**: Journey tests against deployed apps should use `/api/` prefix, not `/.netlify/functions/api/`.

### `skills/review/reportTestFailures.md`

1. **Add "URL parsing" failure category**: The current categories don't have a good fit for the Netlify URL segment parsing bug pattern (5 entries, 18.5%). "backend-bug" is too generic — a dedicated "url-parsing" or "api-routing" category would improve categorization.
2. **Consider tracking "systemic root cause" across clusters**: Three separate clusters (url-routing-segments, projects-url-parsing, netlify-functions-url-parsing) all stemmed from one systemic issue. A cross-cluster linking mechanism would better capture this pattern.
3. **TOOL_CALL_COUNT coverage**: Only 7/27 failures had this field populated. Consider making it required to improve resolution effort analysis.

## 5. Replay Fixes Table

No entries qualify. While Replay was used in 4 failures and all were successfully fixed, in all 4 cases REPLAY_NECESSARY was "no" — the fixes could have been achieved from error output alone. The Replay tools (PlaywrightSteps, NetworkRequest) confirmed what error output already indicated (405 responses, wrong API routing, data contamination patterns).

For completeness, the 4 Replay-used fixes:

INITIAL_CHANGESET: none
FAILING_TEST: Search persists while switching between inline edits (worker-68)
FINAL_CHANGESET: 94b7e2bc3d
ASSESSMENT: Replay confirmed PUT /api/contacts/1 returned 405 due to URL segment parsing bug. Error output would have sufficed.

INITIAL_CHANGESET: none
FAILING_TEST: Editing external contact updates references across the app; Associated projects column shows clickable project links (worker-72)
FINAL_CHANGESET: 8a1844a8fa
ASSESSMENT: Replay confirmed GET /api/projects/1 returned all projects instead of one. Error output showing "Loading..." state would have pointed to the API issue.

INITIAL_CHANGESET: none
FAILING_TEST: Overview tab allows removing a key contact from the project (worker-80, cluster of 4 tests)
FINAL_CHANGESET: none (committed as part of session)
ASSESSMENT: Replay confirmed DELETE /api/project-contacts/4 returned 405. Same URL segment parsing root cause as workers 68 and 72.

INITIAL_CHANGESET: none
FAILING_TEST: Projects table shows empty state when filters match no projects (worker-85)
FINAL_CHANGESET: 66ef5f00fc
ASSESSMENT: Replay used but data contamination was evident from error context showing deleted records. Test reordering fix did not require Replay insight.
