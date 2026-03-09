# Test Failures Report: app-building-2ksa4k

**Generated**: 2026-03-08
**App**: pest-route-scheduler (Pest Control — Service Route & Scheduling)
**Period**: 2026-03-06 15:19 – 2026-03-08 23:08 UTC

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 101 |
| Logs with test failures | 35 |
| Logs without test failures | 66 |
| Total distinct test failures | 76 |
| Total affected tests (clusters expanded) | ~147 |
| Unique root causes (clusters + unclustered) | ~42 |
| Replay usage rate | 0/76 (0.0%) |
| Replay usage rate among debugged failures | 0/75 (0.0%) |
| Debugging success rate | 72/75 (96.0%) |
| Replay-assisted success rate | N/A (Replay never used) |
| Recording availability rate | 58/76 (76.3%) |
| Debugging efficiency (Replay unnecessary) | N/A (Replay never used) |
| Cascading fixes (single change resolving multiple failures) | 6 events |
| Self-inflicted failures | 5/76 (6.6%) |
| Total test re-runs across all logs | 84 |
| Fix reuse rate (patterns applied to multiple spec files) | 2 patterns (beforeEach-cleanup: 6 files, date-normalize-split-T: 3 files) |
| Infrastructure failure events | 2 events (affecting ~22 tests) |
| Test Isolation Score | 48.7% (37/76: data-contamination + strict-mode + seed-data-mismatch) |

### Failure Phase Distribution

| Phase | Count | % |
|-------|-------|---|
| fixTests | 76 | 100% |

### Failure Resolution Type Distribution

| Resolution Type | Count | % |
|-----------------|-------|---|
| test-code | 46 | 60.5% |
| app-code | 20 | 26.3% |
| both | 6 | 7.9% |
| none (unresolved) | 4 | 5.3% |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-41 | app-building/pest-route-scheduler | New customer appears in list immediately | seed-data-mismatch | yes | no | diagnosed from error output | no | — | — | yes | none |
| worker-42 | app-building/pest-route-scheduler | New technician appears in list immediately | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-43 | app-building/pest-route-scheduler | Service history section (3 tests) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-43 | app-building/pest-route-scheduler | Service plan section (formatDate) | CSS/layout | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-43 | app-building/pest-route-scheduler | Service plan one-time text mismatch | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-44 | app-building/pest-route-scheduler | Scheduled visit / Sort by next visit (formatDate) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-44 | app-building/pest-route-scheduler | Status badges visual indicators | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-45 | app-building/pest-route-scheduler | Cluster: route-duplicate-key (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-45 | app-building/pest-route-scheduler | Scheduling conflict alerts | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-45 | app-building/pest-route-scheduler | Empty state when no alerts | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-46 | app-building/pest-route-scheduler | Cluster: date-comparison-iso (5 tests) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-46 | app-building/pest-route-scheduler | Completion percentage updates | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-46 | app-building/pest-route-scheduler | Route duplicate key constraint | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-47 | app-building/pest-route-scheduler | Cluster: service-request-data-accumulation | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-48 | app-building/pest-route-scheduler | Cluster: upcoming-visits-date-format (4 tests) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-48 | app-building/pest-route-scheduler | Data contamination from accumulated visits | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-49 | app-building/pest-route-scheduler | Archived customer visit warning | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-50 | app-building/pest-route-scheduler | Cancel/New request appears (count) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | 54836d1 |
| worker-50 | app-building/pest-route-scheduler | Cluster: first-row-click-wrong-data (3 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | 54836d1 |
| worker-51 | app-building/pest-route-scheduler | Cluster: strict-mode-data-accumulation (8 tests) | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-51 | app-building/pest-route-scheduler | Add to Route remaining schedule | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-51 | app-building/pest-route-scheduler | QuickActions date normalization | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-52 | app-building/pest-route-scheduler | Display customer contact info | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-52 | app-building/pest-route-scheduler | Display preferred time windows | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-52 | app-building/pest-route-scheduler | Display request notes | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-52 | app-building/pest-route-scheduler | Status is visually indicated | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-53 | app-building/pest-route-scheduler | Cluster: request-queue-data-accumulation (8 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-54 | app-building/pest-route-scheduler | Cluster: routes-actions-duplicate-key (9 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-54 | app-building/pest-route-scheduler | Route page shows "No routes scheduled" | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-54 | app-building/pest-route-scheduler | Manual reorder persists (JOINed fields) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-54 | app-building/pest-route-scheduler | Optimize Route reorders stops | other | no | no | diagnosed from error output | yes | — | — | yes | none |
| worker-56 | app-building/pest-route-scheduler | Cluster: routes-map-duplicate-key (6 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-57 | app-building/pest-route-scheduler | Cluster: routes-stats-duplicate-key (6 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-58 | app-building/pest-route-scheduler | Card display — customers[6] out of bounds | other | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-58 | app-building/pest-route-scheduler | Cluster: technician-cards-duplicate-key (5 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-58 | app-building/pest-route-scheduler | Each stop shows required fields (duration format) | CSS/layout | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-59 | app-building/pest-route-scheduler | Cluster: status-tracking-duplicate-key (11 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-59 | app-building/pest-route-scheduler | Status change reflects on Schedule (TDZ crash) | backend-bug | yes | no | no recording available | no | — | — | yes | b56d30e |
| worker-59 | app-building/pest-route-scheduler | Status change reflects on Schedule (missing testid) | missing-testid | yes | no | no recording available | no | — | — | yes | b56d30e |
| worker-60 | app-building/pest-route-scheduler | Default day view / Click day navigates (nested testid) | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-60 | app-building/pest-route-scheduler | Month view visit density | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-61 | app-building/pest-route-scheduler | checkAvailability empty object bug | backend-bug | yes | no | diagnosed from code review | no | — | — | yes | e08bed7 |
| worker-61 | app-building/pest-route-scheduler | checkOverlap date format mismatch | backend-bug | yes | no | diagnosed from error context | no | — | — | yes | e08bed7 |
| worker-61 | app-building/pest-route-scheduler | Drag visit to different time slot (API format) | other | yes | no | diagnosed from error output | no | — | — | yes | e08bed7 |
| worker-61 | app-building/pest-route-scheduler | Drag visit to different day (API format) | other | yes | no | diagnosed from error output | no | — | — | yes | e08bed7 |
| worker-61 | app-building/pest-route-scheduler | Undo rescheduling action | data-contamination | no | no | diagnosed from error output | no | — | — | yes | e08bed7 |
| worker-62 | app-building/pest-route-scheduler | Cluster: visit-card-testid-collision (7 tests) | missing-testid | yes | no | diagnosed from error output + code inspection | yes | — | — | yes | 8d5c0d0 |
| worker-62 | app-building/pest-route-scheduler | Filter by date range | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | 8d5c0d0 |
| worker-63 | app-building/pest-route-scheduler | Submit creates a new visit | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-63 | app-building/pest-route-scheduler | Validation requires mandatory fields | seed-data-mismatch | yes | no | diagnosed from error context | yes | — | — | yes | none |
| worker-63 | app-building/pest-route-scheduler | Conflict warning on submission | backend-bug | yes | no | diagnosed from code inspection | yes | — | — | yes | none |
| worker-63 | app-building/pest-route-scheduler | Cancel discards form | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-64 | app-building/pest-route-scheduler | Cluster: slot-overflow-click-interception (3 tests) | CSS/layout | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-64 | app-building/pest-route-scheduler | Recurring visit next N occurrences | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-64 | app-building/pest-route-scheduler | Empty state when no visits scheduled | missing-testid | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-65 | app-building/pest-route-scheduler | Display current business hours | seed-data-mismatch | yes | no | diagnosed from code inspection | yes | — | — | yes | none |
| worker-65 | app-building/pest-route-scheduler | Cluster: time-input-fill-incompatibility (4 tests) | other | yes | no | diagnosed from code inspection | yes | — | — | yes | none |
| worker-65 | app-building/pest-route-scheduler | Toggle day on/off (race condition) | other | yes | no | diagnosed from code analysis | yes | — | — | yes | none |
| worker-65 | app-building/pest-route-scheduler | Business hours conflict detection | data-contamination | yes | no | diagnosed from test output | yes | — | — | yes | none |
| worker-66 | app-building/pest-route-scheduler | Display frequencies list | strict-mode | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-66 | app-building/pest-route-scheduler | Cluster: frequency-data-contamination (2 tests) | data-contamination | yes | no | diagnosed from error context | yes | — | — | yes | none |
| worker-67 | app-building/pest-route-scheduler | Validation — empty address | other | yes | no | recordings cleaned; diagnosed from code analysis | no | — | — | yes | none |
| worker-68 | app-building/pest-route-scheduler | Delete service type confirmation cancel | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-69 | app-building/pest-route-scheduler | Cluster: zone-data-contamination (2 tests) | data-contamination | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-70 | app-building/pest-route-scheduler | Cluster: sql-round-type-error (3 tests) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-70 | app-building/pest-route-scheduler | Edit technician availability (time input) | other | yes | no | recordings cleaned; diagnosed from code analysis | no | — | — | yes | none |
| worker-70 | app-building/pest-route-scheduler | Certifications expiration dates (formatDate) | backend-bug | yes | no | diagnosed from error output | yes | — | — | yes | none |
| worker-84 | app-building/pest-route-scheduler | Schedule Visit shows conflict warning | backend-bug | yes | no | diagnosed from error output + bisection | no | — | — | no | none |
| worker-84 | app-building/pest-route-scheduler | Add to Route inserts stop into existing route | backend-bug | yes | no | diagnosed from error output | no | — | — | no | none |
| worker-84 | app-building/pest-route-scheduler | Add to Route shows impact on schedule | backend-bug | yes | no | diagnosed from error output | no | — | — | no | none |
| worker-86 | app-building/pest-route-scheduler | Display performance section | seed-data-mismatch | no | no | diagnosed from error output | yes | — | — | yes | none |
| worker-86 | app-building/pest-route-scheduler | Display route history section | data-contamination | no | no | diagnosed from error output | yes | — | — | yes | none |
| worker-86 | app-building/pest-route-scheduler | Edit technician availability | CSS/layout | yes | no | diagnosed from error output | yes | — | — | yes | none |
| bugfix-7 | bug-fix/pest-route-scheduler | routes-map.spec.ts (all 6 tests) | backend-bug | yes | no | diagnosed from error output | no | — | — | yes | none |
| bugfix-9 | bug-fix/pest-route-scheduler | Manual reorder persists the new sequence | other | yes | no | pre-existing and out of scope | yes | — | — | no | none |
| bugfix-11 | bug-fix/pest-route-scheduler | Submit/Recurring/Link visit (Sunday warning) | CSS/layout | yes | no | diagnosed from error output + page snapshot | yes | — | — | yes | none |

### Root Cause Clusters

| Cluster | Count | Affected Tests | Logs | Resolution |
|---------|-------|---------------|------|------------|
| hardcoded-count-data-accumulation | 6 | ~25 | 42, 45, 47, 48, 50, 51 | test-code: relative counting with beforeEach cleanup |
| formatDate-iso-timestamp | 4 | ~10 | 43, 44, 51, 70 | app-code: `.split('T')[0]` normalization |
| iso-date-comparison | 4 | ~8 | 62, 63, 64, 70 | app-code/both: normalize ISO timestamps before comparison |
| route-duplicate-key (all variants) | 6 | ~42 | 45, 46, 54, 56, 57, 58, 59 | test-code: beforeEach cleanup of routes/visits |
| first-row-click-contamination | 2 | ~11 | 50, 51 | test-code: click by specific testid instead of `.first()` |
| request-detail-data-accumulation | 1 | 4 | 52 | test-code: unique data per test, click by ID |
| serial-test-data-contamination | 2 | 4 | 66, 69 | test-code: unique names, use unmodified seed data |
| invalid-visit-type | 2 | ~4 | 43, 49 | test-code: use valid DB enum values |
| visits-put-nulling-fields | 1 | 1 | 46 | app-code: COALESCE on nullable PUT fields |
| calendarview-date-normalization | 2 | ~3 | 59, 61 | app-code: normalize dates in CalendarView |
| calendarview-nested-testid | 1 | 2 | 60 | app-code: remove nested duplicate testids |
| visit-card-testid-collision | 1 | 7 | 62 | both: rename testid to avoid prefix collision |
| drag-drop-availability-bug | 1 | 1 | 61 | app-code: treat empty {} as available |
| time-input-fill | 2 | ~6 | 65, 70 | app-code/test-code: text inputs for time, evaluate+dispatch |
| useeffect-overwrites-edits | 2 | 2 | 65, 67 | app-code: guard useEffect with dirty flag |
| business-hours-seed-format | 1 | 1 | 65 | app-code: handle flat + per-day formats |
| sql-round-type-error | 1 | 3 | 70 | app-code: cast to numeric before ROUND() |
| redux-data-loading | 1 | 3 | 84 | none (unresolved) |
| sunday-business-hours-warning | 1 | 3 | bugfix-11 | test-code: handle warning dialog with retry click |
| postgres-time-format | 1 | 1 | 61 | test-code: accept HH:MM:SS format |
| postgres-date-format | 1 | 1 | 61 | test-code: accept ISO timestamp format |

## 3. Patterns

### Replay Usage

**Replay was never used** across all 76 test failures. Every failure was diagnosed from:
- **Error output alone** (~85%): stack traces, assertion messages, constraint violations, and Playwright page snapshots provided sufficient diagnostic information.
- **Code inspection/analysis** (~10%): reading source code to understand date handling, useEffect race conditions, or API response shapes.
- **No recording available** (~5%): recordings cleaned before upload or infrastructure prevented capture.

The consistent pattern is that the agent could diagnose root causes without Replay because:
1. Playwright error messages include detailed context (expected vs. received values, page snapshots)
2. Most failures had clear programmatic root causes (wrong date format, constraint violations, missing cleanup)
3. The agent could read source code to trace data flow issues

### Debugging Strategies That Worked

1. **Read error output → identify pattern → fix**: The dominant strategy. Constraint violations, "Invalid Date" messages, and strict mode errors all pointed directly to root causes.
2. **beforeEach cleanup pattern**: Applied to 6+ spec files. When tests share a database, adding `beforeEach` hooks to delete accumulated data resolved entire spec files in one pass.
3. **Relative counting**: Replacing hardcoded `toHaveCount(N)` with "capture initial, assert initial+1" resolved many data-contamination failures.
4. **Date normalization with `.split('T')[0]`**: PostgreSQL returns ISO timestamps but the app expected YYYY-MM-DD strings. A consistent `.split('T')[0]` normalization pattern resolved failures across 6+ components.
5. **Bisection/revert testing**: Used in worker 84 to confirm failures were pre-existing by reverting to original code.

### Debugging Strategies That Failed

1. **Worker 84 (redux-data-loading)**: 12 reruns failed to resolve 3 QuickActions failures where Redux state loading prevented route/schedule data from appearing. The agent bisected to confirm pre-existing but could not fix the async data flow issue.
2. **Worker 67 (useEffect race condition)**: Required 5 iterations to find the right guard pattern for preventing useEffect from overwriting user edits.
3. **Worker 65 (time input)**: type="time" inputs with Playwright `fill()` in the Replay browser don't reliably trigger React onChange — required switching to text inputs as a workaround.

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 27 | 35.5% |
| backend-bug | 23 | 30.3% |
| other | 8 | 10.5% |
| strict-mode | 6 | 7.9% |
| CSS/layout | 5 | 6.6% |
| seed-data-mismatch | 4 | 5.3% |
| missing-testid | 3 | 3.9% |
| timeout | 0 | 0.0% |

### Self-Inflicted Failure Rate

**5 out of 76 failures (6.6%)** were self-inflicted — introduced by the agent's own fix attempts during the session:

1. Worker 41: Race condition in count assertion (test wrote initialCount before async load)
2. Worker 54: Test data was already in optimal order (optimization had no effect)
3. Worker 61: Overlap conflict from accumulated test data after previous fix
4. Worker 86: Performance section empty because POST endpoint doesn't accept completed_at
5. Worker 86: Route history showed wrong count due to visit data leaking from performance test

The low self-inflicted rate (6.6%) indicates the test-writing process is generally sound. Self-inflicted failures were primarily caused by incomplete understanding of test data interactions.

### Test Isolation Issues

Test isolation issues (data-contamination + strict-mode + seed-data-mismatch) account for **48.7% of all failures** (37/76). While below the 50% threshold, this is the dominant failure pattern:

- **data-contamination (35.5%)**: The single largest category. Tests sharing a Neon database branch accumulate data across serial runs. Routes, visits, service requests, and other entities created by earlier tests cause count mismatches, strict-mode violations from duplicate rows, and constraint violations.
- **strict-mode (7.9%)**: Often downstream of data contamination — substring matching (`hasText: 'Active'`) matches both "Active" and "Inactive" when extra rows exist.
- **seed-data-mismatch (5.3%)**: Seed data format differs from what components/tests expect (e.g., flat vs. per-day business hours).

The primary mitigation pattern was `beforeEach` cleanup hooks. This was applied to 6+ spec files and should be a standard practice in the test-writing workflow.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "date normalization" pattern**: PostgreSQL returns ISO timestamps (`2026-03-06T00:00:00.000Z`) for DATE columns via the Neon driver. Document the `.split('T')[0]` normalization pattern as a first-check when "Invalid Date" or date comparison failures appear.
- **Add "data-contamination diagnosis" pattern**: When count assertions fail with higher-than-expected numbers, check for missing `beforeEach` cleanup. Document the relative counting pattern (capture initial, assert initial+N).
- **Add "type=time input" workaround**: Playwright `fill()` on `type="time"` inputs doesn't reliably trigger React onChange in the Replay browser. Document switching to `type="text"` with pattern validation as the standard workaround.
- **Add "useEffect overwrite" pattern**: When form fields reset after user input, check for `useEffect` that re-syncs state from fetched data. Document the "dirty flag" guard pattern.

### `skills/tasks/build/testing.md`

- **Mandate `beforeEach` cleanup in test template**: Every spec file that creates database records should include a `beforeEach` hook that cleans up relevant tables. This single practice would have prevented ~35% of all failures.
- **Use relative assertions by default**: Replace `toHaveCount(N)` with relative counting (`initialCount + 1`). Add this as a directive.
- **Use exact matching for text assertions**: Require regex exact matching (`/^Active$/`) instead of substring matching (`hasText: 'Active'`) to prevent strict-mode violations.
- **Validate test data against DB constraints**: Before using enum values in test data (e.g., visit_type), verify against the database CHECK constraints. The `invalid-visit-type` cluster appeared in 2 spec files.
- **Add date normalization to app-building template**: When writing components that display database dates, always apply `.split('T')[0]` normalization. This backend-bug category (30.3%) was almost entirely date-related.

### `skills/review/reportTestFailures.md`

- **Add "date-format" failure category**: The current categories don't have a specific one for date/timestamp format mismatches, which was the #1 backend-bug root cause. Consider adding `date-format` as a distinct category alongside `backend-bug`.
- **Track "Replay not used" reasons more granularly**: The current template captures reasons but could benefit from a structured enum (e.g., `error-output-sufficient`, `no-recording`, `code-inspection`, `out-of-scope`) to enable quantitative analysis.
- **Consider "resolution difficulty" metric**: FIX_ITERATIONS captures this but is optional. Making it required would help identify which failure categories are hardest to debug (e.g., useEffect race conditions averaged 5 iterations vs. data-contamination averaging 1).

## Infrastructure Failures

| Log | Category | Affected Tests | Notes |
|-----|----------|---------------|-------|
| worker-41 | environment-setup | All 19 tests (blocked) | Missing .env, schema.ts execution guard, Neon branch API issue, production schema mismatch |
| worker-82 | navigation-timeout | 3 tests | All Netlify function API calls returning 404 — pre-existing infrastructure issue |
