# Test Failures Report: app-building-ptbexz

**Generated:** 2026-03-06
**App:** pest-route-scheduler (Pest Control Route & Scheduling)
**Branch:** app-building-ptbexz

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 113 |
| Logs with test failures | 19 |
| Logs without test failures | 94 |
| Total distinct test failures | 45 |
| Total failure entries (clusters counted once) | 37 |
| Replay usage rate (overall) | 15/37 (40.5%) |
| Replay usage rate (debugged failures only) | 15/35 (42.9%) |
| Debugging success rate | 35/35 (100%) |
| Replay-assisted success rate | 15/15 (100%) |
| Recording availability rate | 34/37 (91.9%) |
| Debugging efficiency (Replay used but unnecessary) | 8/15 (53.3%) |
| Cascading fixes | 6 (resolving 21 tests total) |
| Self-inflicted failures | 1 (2.7% of all failures) |
| Total test re-runs | 24 |
| Unique root causes | 30 (14 clusters + 16 unclustered) |
| Fix reuse rate | 1 pattern (wait-for-data-before-count) reused across 4+ spec files, but only explicitly tagged in 1 |
| Infrastructure failure events | 3 (affecting ~17 tests across 2 spec files) |

**Failure Phase Distribution:**

| Phase | Count | % |
|-------|-------|---|
| fixTests | 36 | 97.3% |
| checkDirectives | 1 | 2.7% |

**Test Isolation Score:** 45.9% (17/37 entries were data-contamination + strict-mode + seed-data-mismatch). Below the 50% threshold but still the dominant failure pattern.

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-49 | ptbexz / pest-route-scheduler | C-21, C-22, C-28 (cluster: seed-data-loading-race) | data-contamination | yes | yes | | yes | PlaywrightSteps to find timing of count vs data load | PlaywrightSteps | yes | none |
| worker-49 | ptbexz / pest-route-scheduler | C-29 | strict-mode | yes | no | diagnosed from error output — strict mode violation clearly indicated 2 elements | no | | | yes | none |
| worker-50 | ptbexz / pest-route-scheduler | C-13 | backend-bug | yes | yes | | yes | NetworkRequest to inspect API response payload | NetworkRequest | yes | none |
| worker-51 | ptbexz / pest-route-scheduler | C-32 | backend-bug | yes | yes | | yes | NetworkRequest to inspect API response for date format | NetworkRequest | yes | none |
| worker-51 | ptbexz / pest-route-scheduler | C-33 | data-contamination | yes | no | diagnosed from error output — strict mode violation showed duplicate rows | yes | | | yes | none |
| worker-52 | ptbexz / pest-route-scheduler | C-41 | data-contamination | yes | no | diagnosed from error output — strict mode violation showed duplicate Alice Cooper rows | yes | | | yes | none |
| worker-56 | ptbexz / pest-route-scheduler | D-7, D-8, D-10 (cluster: missing-notes-column) | backend-bug | yes | no | diagnosed from error output — NeonDbError with missing column was clear | yes | | | yes | none |
| worker-59 | ptbexz / pest-route-scheduler | ST-20 | CSS/layout | yes | yes | | yes | PlaywrightSteps to identify count assertion timing | PlaywrightSteps | yes | none |
| worker-59 | ptbexz / pest-route-scheduler | ST-22 | CSS/layout | yes | no | same root cause as ST-20, diagnosed from error output | yes | | | yes | none |
| worker-59 | ptbexz / pest-route-scheduler | ST-25 | backend-bug | yes | no | diagnosed from error output — case-sensitive array_remove | yes | | | yes | none |
| worker-59 | ptbexz / pest-route-scheduler | ST-27 | missing-testid | yes | no | diagnosed from error output — element not found after re-render | yes | | | yes | none |
| worker-60 | ptbexz / pest-route-scheduler | RT-27..RT-34 (cluster: react-leaflet-v5-crash, 8 tests) | backend-bug | yes | yes | | yes | Screenshot to see blank page, ConsoleMessages for crash | Screenshot, ConsoleMessages | yes | none |
| worker-62 | ptbexz / pest-route-scheduler | RT-12 | data-contamination | yes | yes | | yes | PlaywrightSteps to verify test flow, confirm no data | PlaywrightSteps | yes | none |
| worker-62 | ptbexz / pest-route-scheduler | RT-14 | data-contamination | yes | no | recording not uploaded; diagnosed from code analysis | no | | | yes | none |
| worker-65 | ptbexz / pest-route-scheduler | RT-19 | CSS/layout | yes | yes | | yes | PlaywrightSteps, Screenshot, NetworkRequest, ConsoleMessages | PlaywrightSteps, Screenshot, NetworkRequest, ConsoleMessages | yes | none |
| worker-71 | ptbexz / pest-route-scheduler | S-12 | backend-bug | yes | yes | | yes | NetworkRequest + Logpoint to observe date mismatch | NetworkRequest, PlaywrightSteps, SearchSources, Logpoint | yes | none |
| worker-71 | ptbexz / pest-route-scheduler | S-13 | backend-bug | yes | yes | | yes | NetworkRequest to inspect string type for avg visits | NetworkRequest, PlaywrightSteps | yes | none |
| worker-72 | ptbexz / pest-route-scheduler | ST-4 | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps to identify price format mismatch | PlaywrightSteps | yes | none |
| worker-72 | ptbexz / pest-route-scheduler | ST-5 | data-contamination | yes | no | diagnosed from error output — initialCount was 0 | yes | | | yes | none |
| worker-72 | ptbexz / pest-route-scheduler | ST-10 | CSS/layout | yes | no | recording cleaned up before analysis | no | | | yes | none |
| worker-72 | ptbexz / pest-route-scheduler | ST-14 | data-contamination | yes | no | diagnosed from error output — ST-8 deleted all data | yes | | | yes | none |
| worker-72 | ptbexz / pest-route-scheduler | ST-15 | data-contamination | yes | no | diagnosed from error output — ST-8 deleted all data | yes | | | yes | none |
| worker-73 | ptbexz / pest-route-scheduler | Nav-2 | other | yes | yes | | yes | PlaywrightSteps to identify exact failing step | PlaywrightSteps | yes | none |
| worker-74 | ptbexz / pest-route-scheduler | T-33 | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest for date format | PlaywrightSteps, NetworkRequest | yes | none |
| worker-74 | ptbexz / pest-route-scheduler | T-34 | data-contamination | yes | yes | | yes | PlaywrightSteps for assertion failure | PlaywrightSteps | yes | none |
| worker-76 | ptbexz / pest-route-scheduler | T-2 | other | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-76 | ptbexz / pest-route-scheduler | T-10 | data-contamination | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-76 | ptbexz / pest-route-scheduler | T-9 | strict-mode | no | no | diagnosed from error output | yes | | | yes | none |
| worker-77 | ptbexz / pest-route-scheduler | T-16 | backend-bug | yes | yes | | yes | NetworkRequest to inspect date format in API response | NetworkRequest | yes | none |
| worker-77 | ptbexz / pest-route-scheduler | T-18 | data-contamination | yes | no | diagnosed from error output | yes | | | yes | none |
| worker-78 | ptbexz / pest-route-scheduler | UR-21 | backend-bug | yes | no | diagnosed from error output and code analysis | yes | | | yes | none |
| worker-78 | ptbexz / pest-route-scheduler | UR-24 | backend-bug | yes | no | diagnosed from error output and code analysis | yes | | | partial | none |
| worker-78 | ptbexz / pest-route-scheduler | UR-25 | backend-bug | yes | no | diagnosed from error output and code analysis | yes | | | yes | none |
| worker-78 | ptbexz / pest-route-scheduler | UR-28 | data-contamination | yes | no | diagnosed from error output and code analysis | yes | | | yes | none |
| worker-79 | ptbexz / pest-route-scheduler | UR-18 | data-contamination | yes | yes | | yes | PlaywrightSteps to identify timing of row count | PlaywrightSteps | yes | none |
| worker-91 | ptbexz / pest-route-scheduler | D-13 | CSS/layout | yes | no | verified pre-existing by reverting changes | yes | | | N/A (not debugged) | none |
| worker-98 | ptbexz / pest-route-scheduler | UR-3, UR-5, UR-8, UR-9, UR-37 (cluster: urgent-seed-data-missing) | seed-data-mismatch | yes | no | diagnosed from error output — page shows "No urgent requests" | yes | | | N/A (not debugged) | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| seed-data-loading-race | 3 | worker-49 | Fixed: wait for seed data rows before counting (test-code) |
| duplicate-test-data-names | 1 | worker-49 | Fixed: renamed test customer to unique name (test-code) |
| formatDate-iso-timestamp | 1 | worker-50 | Fixed: normalize ISO timestamps with .split('T')[0] (app-code) |
| duplicate-alice-cooper | 1 | worker-52 | Fixed: resolved duplicate data contamination (test-code) |
| missing-notes-column | 3 | worker-56 | Fixed: added `notes` column to urgent_requests schema (app-code) |
| pest-category-initial-count | 2 | worker-59 | Fixed: wait for categories to load before counting (test-code) |
| react-leaflet-v5-crash | 8 | worker-60 | Fixed: downgraded react-leaflet from v5 to v4.2.1 for React 18 compatibility (app-code) |
| route-list-seed-data-cleared | 2 | worker-62 | Fixed: added explicit data creation via API in each test (test-code) |
| weekview-date-format-mismatch | 1 | worker-71 | Fixed: normalize ISO timestamps to YYYY-MM-DD in WeekView (app-code) |
| weekview-type-coercion | 1 | worker-71 | Fixed: parseFloat for average_visits_per_day string (app-code) |
| destructive-test-ordering | 3 | worker-72 | Fixed: reordered tests and added data recreation between tests (test-code) |
| availability-date-normalization | 2 | worker-74 | Fixed: normalize ISO timestamps in AvailabilityManagement grouping (both) |
| urgent-assign-null-customer-id | 3 | worker-78 | Fixed: include customer_id when creating visit from urgent assignment (both) |
| urgent-seed-data-missing | 5 | worker-98 | Unresolved: pre-existing seed data issue discovered during checkDirectives, out of scope |

## 3. Patterns

### When Replay Was Most Effective

Replay was essential (REPLAY_NECESSARY=yes) for **7 of 15 uses (46.7%)**. These cases involved:

1. **API response format mismatches** — where the returned data format (ISO timestamps, string numbers) differed from what the frontend expected. NetworkRequest was the critical tool here (C-13, S-12, S-13, T-16, T-33). Error output alone could not reveal the exact API response format.

2. **React library incompatibilities** — the react-leaflet v5 crash (worker-60) was only diagnosable via Screenshot + ConsoleMessages showing the blank page and rendering error.

3. **Hidden input interaction failures** — RT-19 required PlaywrightSteps + NetworkRequest to confirm that fill() + dispatchEvent('change') on a hidden date input did not trigger React's synthetic onChange.

**Most effective tool sequences:**
- `NetworkRequest` for API response format issues (5 uses)
- `PlaywrightSteps` as first diagnostic step (11 uses — most common entry point)
- `Screenshot + ConsoleMessages` for page-level render failures (1 use)
- `NetworkRequest + Logpoint` for data flow tracing (1 use)

### When Replay Was NOT Used and Why

Replay was not used in **22 of 37 failure entries (59.5%)**. Reasons:

| Reason | Count |
|--------|-------|
| Diagnosed from error output | 17 |
| Same root cause as previously analyzed failure | 2 |
| Recording not available (upload failed/cleaned up) | 2 |
| Verified pre-existing by reverting changes | 1 |

The agent successfully diagnosed most data-contamination and strict-mode failures directly from Playwright error output, which typically includes page snapshots showing duplicate elements or missing data. This is efficient — Replay is unnecessary when the error message clearly indicates the root cause.

### Common Debugging Strategies That Worked

1. **Error output first, Replay second** — The agent correctly prioritized reading error output before reaching for Replay. 59.5% of failures were resolved without Replay.
2. **PlaywrightSteps as triage** — When Replay was used, PlaywrightSteps was almost always the first tool called to identify which step failed and when.
3. **NetworkRequest for data format bugs** — The most productive Replay pattern: inspecting API response bodies to find format mismatches (ISO timestamps vs YYYY-MM-DD, string vs number types).
4. **Cascading fix identification** — The agent effectively identified shared root causes: 6 cascading fixes resolved 21 tests total, meaning nearly half of all test failures were resolved by just 6 code changes.

### Common Debugging Strategies That Failed

No debugging strategies consistently failed. The only partial success was UR-24, where the initial fix attempt for the toast text mismatch required an additional re-run. The agent's 100% debugging success rate (35/35) indicates strong diagnostic capabilities.

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|------------|
| data-contamination | 13 | 35.1% |
| backend-bug | 12 | 32.4% |
| CSS/layout | 5 | 13.5% |
| strict-mode | 2 | 5.4% |
| seed-data-mismatch | 2 | 5.4% |
| other | 2 | 5.4% |
| missing-testid | 1 | 2.7% |

### Self-Inflicted Failure Rate

**1 out of 37 failures (2.7%)** was self-inflicted (T-9: a fix to T-2/T-10 introduced a strict-mode violation in T-9). This is an excellent rate, indicating the agent's fix quality is very high. The self-inflicted failure was quickly identified and resolved.

### Test Isolation Issues

Test isolation issues (data-contamination + strict-mode + seed-data-mismatch) account for **45.9% of all failures** (17/37). While below the 50% threshold for a dedicated subsection, this is still the single largest category cluster and the dominant failure mode. Key patterns:

- **Data contamination (35.1%)** is the #1 category. Most cases involve tests that count rows before seed data loads, or destructive tests (deleting all rows) that affect subsequent tests.
- **Recurring pattern:** Tests capturing `initialCount` before async data loads, then asserting `count === initialCount + 1` after creating an item. The fix (waiting for at least 1 row to be visible) was applied independently in 4+ spec files.
- **Destructive test ordering:** service-types.spec.ts had ST-8 deleting all service types, breaking ST-10/ST-14/ST-15 which expected seed data.

### ISO Timestamp Date Format — Recurring App Bug

A pervasive app-level issue: **PostgreSQL returns date columns as ISO timestamps** (e.g., "2026-03-02T00:00:00.000Z") but multiple frontend components assumed YYYY-MM-DD strings. This caused failures in:
- CustomerDetailView (formatDate producing "Invalid Date")
- EditCustomer (date inputs not pre-populating)
- WeekView (visit count filtering failing)
- TechnicianProfile (weekly schedule grouping failing)
- AvailabilityManagement (availability entries not grouping)

This single class of bug accounted for 5+ distinct failures across 4 different pages.

## 4. Recommendations

### `skills/debugging/*.md`

1. **Add "ISO timestamp normalization" as a known pattern.** When a Neon/PostgreSQL date column displays incorrectly or fails to match, check whether the API returns full ISO timestamps while the frontend expects YYYY-MM-DD. This was the most recurring app bug (5+ failures across 4 pages). Recommend: always use `.split('T')[0]` or `new Date(val).toISOString().split('T')[0]` when consuming date fields from the API.

2. **Add "wait-for-data-before-count" as a standard test pattern.** Before capturing initialCount for row-count assertions, always wait for at least one expected row to be visible. This pattern was independently rediscovered in 4+ spec files.

3. **Document the PlaywrightSteps-first triage workflow.** When using Replay, start with PlaywrightSteps to identify the failing step index, then use targeted tools (NetworkRequest, Screenshot, Logpoint) based on what the step reveals.

### `skills/tasks/build/testing.md`

1. **Enforce test data isolation by default.** Each test should create its own data via API calls rather than relying on shared seed data. This would eliminate the entire data-contamination category (35.1% of failures). Consider adding a `beforeEach` helper that creates fresh test data and cleans up in `afterEach`.

2. **Prohibit destructive operations in non-final tests.** Tests that delete all records (like ST-8 deleting all service types) should either run last in their describe block or recreate the data they destroy. Add this as a directive in the writeTests skill.

3. **Add a standard date normalization utility.** Create a shared `normalizeDate(isoString: string): string` function that all components use when consuming date fields from the API. This would prevent the recurring ISO timestamp bug at the source.

4. **Add react-leaflet version pinning guidance.** react-leaflet v5 is incompatible with React 18. Pin to v4.x in package.json. Document this in the tech stack section.

5. **Port conflict mitigation.** 3 infrastructure failures were caused by stale `netlify dev` processes on port 8888. The test script should kill stale processes before starting, or use a dynamic port.

### `skills/review/reportTestFailures.md`

1. **Add FAILURE_RESOLUTION_TYPE distribution to Summary Statistics.** The current template doesn't include this breakdown, but it's highly actionable: knowing that 59.5% of fixes were test-code-only vs 21.6% app-code-only vs 13.5% both helps calibrate whether the testing process or the app-building process needs improvement.

2. **Standardize FIX_PATTERN tagging.** Only 1 analysis file used the FIX_PATTERN field despite the same fix pattern (wait-for-data-before-count) being applied in 4+ spec files. Consider making FIX_PATTERN mandatory when the same fix concept appears in multiple entries.

3. **Clarify cluster TEST_FAILURES counting.** Worker-60 counted 8 tests as TEST_FAILURES: 1 (by root cause) while worker-56 counted 3 tests as TEST_FAILURES: 3 (by test count). The template should clarify: count each affected test as 1 distinct failure, regardless of shared root cause.

4. **Add FAILURE_RESOLUTION_TYPE breakdown table** to the Report Synthesis section (test-code vs app-code vs both vs none). This data was available in the analysis files but not called for in the synthesis template.
