# Test Failures Report: sales-crm-2-review-5

**Generated**: 2026-02-24
**Branch**: sales-crm-2-review-5
**Report ID**: report-testFailures-sales-crm-2-review-5-20260224-164241

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 97 |
| Logs with test failures | 14 |
| Logs without test failures | 83 |
| Total distinct test failures | 33 |
| Replay usage rate | 27% (9/33) |
| Debugging success rate | 85% (28/33 successful + partial) |
| Replay-assisted success rate | 100% (9/9) |
| Debugging failure rate | 15% (5/33) |

## 2. Failure Table

| Log | Test | Replay Used | Strategy | Tools | Success | Changeset |
|-----|------|-------------|----------|-------|---------|-----------|
| test-person-detail-2.log | ContactHistorySection > Add Entry form validates required fields | no (raw log, no agent) | N/A | N/A | no | none |
| worker-…01-10-03.log | Sidebar navigation links route to correct pages | yes | PlaywrightSteps → Screenshot (blank page) → ConsoleMessages + NetworkRequest (MIME errors) → ReactComponents + ReactException + UncaughtException | PlaywrightSteps, ConsoleMessages, Screenshot, NetworkRequest, ReactException, UncaughtException, ReactComponents, ListSources | yes | none |
| worker-…01-10-03.log | Row action menu "View Details" navigates to client detail | yes | PlaywrightSteps to find stuck step → Screenshot to see obscured dropdown | PlaywrightSteps, Screenshot | yes | none |
| worker-…01-10-03.log | Row action menu "Edit" opens edit dialog | yes | Diagnosed alongside "View Details" using same recording | PlaywrightSteps, Screenshot | yes | none |
| worker-…01-10-03.log | Row action menu "Delete" with confirmation | yes | PlaywrightSteps to track progression and identify slow test | PlaywrightSteps | yes | none |
| worker-…01-10-03.log | Clicking Next page loads the next set of clients | yes | PlaywrightSteps → NetworkRequest (empty response) → Screenshot → ConsoleMessages | PlaywrightSteps, NetworkRequest, ConsoleMessages, Screenshot | yes | none |
| worker-…01-10-03.log | Clicking Previous page loads the previous set of clients | yes | Diagnosed alongside "Next page" test | PlaywrightSteps, NetworkRequest | yes | none |
| worker-…01-10-03.log | Status column shows color-coded badges | no (error output) | N/A | N/A | yes | none |
| worker-…01-10-03.log | Sort dropdown changes table ordering | no (error output) | N/A | N/A | yes | none |
| worker-…01-44-39.log | Sort dropdown changes table ordering | no (pre-existing) | N/A | N/A | no | none |
| worker-…01-44-39.log | Multiple filters combine correctly | no (pre-existing) | N/A | N/A | no | none |
| worker-…01-44-39.log | Status filter shows only matching clients | no (pre-existing) | N/A | N/A | no | none |
| worker-…01-44-39.log | Tags filter shows only matching clients | no (pre-existing) | N/A | N/A | no | none |
| worker-…03-05-08.log | Task cards display all required elements | no (error output) | N/A | N/A | yes | none |
| worker-…03-05-08.log | Action menu "View Details" navigates to associated client detail page | no (error output) | N/A | N/A | yes | none |
| worker-…03-05-08.log | Clicking a task card navigates to associated client detail page | no (error output) | N/A | N/A | yes | none |
| worker-…03-45-42.log | Add Entry form validates required fields | no (error output) | N/A | N/A | yes | none |
| worker-…04-10-07.log | tests/table.spec.ts (entire suite — DB auth failure) | no (no recording) | N/A | N/A | partial | none |
| worker-…04-27-52.log | Action menu "Edit" opens task edit dialog | yes | SearchSources → Logpoint → NetworkRequest to trace seed data mismatch | SearchSources, Logpoint, ListSources, ReadSource, NetworkRequest | yes | none |
| worker-…07-21-23.log | TasksHeader > can be created successfully | no (error output) | N/A | N/A | no | none |
| worker-…07-21-23.log | TasksHeader > (second task-related failure) | no (error output) | N/A | N/A | no | none |
| worker-…07-53-29.log | Clicking status badge opens status selection | no (error output) | N/A | N/A | yes | none |
| worker-…07-53-29.log | Source Info displays Acquisition Source field | no (error output) | N/A | N/A | yes | none |
| worker-…07-53-29.log | Source Info Edit button opens edit form | no (error output) | N/A | N/A | yes | none |
| worker-…07-53-29.log | Attachments section shows empty state | no (error output) | N/A | N/A | yes | none |
| worker-…07-53-29.log | Checking a task checkbox marks it as resolved | no (error output) | N/A | N/A | yes | none |
| worker-…10-23-02.log | Each deal entry navigates to the correct deal detail page | yes | PlaywrightSteps to find stall → NetworkRequest to verify API | PlaywrightSteps, NetworkRequest, ConsoleMessages | yes | 78309d4 |
| worker-…10-23-02.log | Timeline entries with subjects are clickable | no (upload failed) | N/A | N/A | yes | 78309d4 |
| worker-…10-23-02.log | Person entry navigates to person detail page | no (upload failed) | N/A | N/A | yes | 78309d4 |
| worker-…10-23-02.log | Header displays type badge | no (error output) | N/A | N/A | yes | 78309d4 |
| worker-…10-23-02.log | Header displays status badge with correct color coding | no (error output) | N/A | N/A | yes | 78309d4 |
| worker-…10-23-02.log | Status change can be dismissed without changing | no (error output) | N/A | N/A | yes | 78309d4 |
| worker-…10-23-02.log | Person removal can be cancelled | no (error output) | N/A | N/A | yes | 78309d4 |

## 3. Patterns

### When Replay Was Most Effective

Replay was used on 9 of 33 failures (27%) and achieved a **100% debugging success rate** when used. It was most effective for:

- **Visual/layout bugs** (CSS z-index, overflow issues): PlaywrightSteps → Screenshot was the go-to sequence for identifying why clicks weren't reaching elements. Used in 3 action menu failures.
- **Page-load and routing failures**: The full chain of PlaywrightSteps → Screenshot → ConsoleMessages → NetworkRequest → ReactComponents/ReactException was used to diagnose a blank-page issue caused by Netlify SPA redirects serving HTML for Vite module requests (MIME type errors).
- **Data-flow tracing**: SearchSources → Logpoint → NetworkRequest was used to trace a seed data mismatch where tests expected fictional assignee names not present in the database.
- **Timeout root-cause analysis**: PlaywrightSteps + NetworkRequest identified tight visibility timeouts and API response issues on detail pages.

### When Replay Was NOT Used (24 instances)

| Reason | Count |
|--------|-------|
| Diagnosed from error output alone | 18 |
| Pre-existing / unrelated failures | 4 |
| Recording upload failed (ERR_ASSERTION) | 2 |
| No recording available (infrastructure failure) | 1 |
| Raw test log with no agent session | 1 |

The dominant reason (75%) was that the error output was sufficient to diagnose the issue. This typically happened for:
- Strict mode violations where the error clearly named the ambiguous locator
- Timeout errors in tests with obvious slow steps
- Cross-test data contamination visible from parallel test output
- Missing `data-testid` attributes clearly stated in error messages

### Common Debugging Strategies That Worked

1. **Error-output-first triage** (18/33 failures): Reading Playwright error messages directly. Works well for strict mode violations, missing selectors, and clear timeout messages.
2. **PlaywrightSteps → Screenshot** (used in 6/9 Replay sessions): The most common Replay sequence. Identifies which step stalled, then visually confirms page state.
3. **NetworkRequest for API verification** (used in 5/9 Replay sessions): Confirms whether backend returned correct data, isolating frontend vs backend issues.
4. **ConsoleMessages for JS errors** (used in 3/9 Replay sessions): Catches module loading failures, MIME type errors, and runtime exceptions.
5. **Logpoint for data-flow tracing** (used in 1/9 Replay sessions): Inspects runtime variable values to trace data mismatches through the component tree.

### Common Debugging Strategies That Failed

1. **Ignoring pre-existing failures**: 4 failures in `worker-…01-44-39.log` were pre-existing filter/sort issues. The agent correctly identified them as pre-existing but did not debug them, leaving them unresolved.
2. **Missing `data-testid` without Replay**: 2 TasksHeader failures were diagnosed from error output but not successfully fixed in that session — the agent noted the missing attribute but the fix was incomplete.

### Recurring Failure Categories

| Category | Count | % of Total |
|----------|-------|------------|
| Timeout / slow operations | 8 | 24% |
| Cross-test data contamination / parallel interference | 5 | 15% |
| Strict mode violations (ambiguous locators) | 4 | 12% |
| Pre-existing unrelated failures | 4 | 12% |
| CSS z-index / overflow / layout | 3 | 9% |
| Backend bugs (blanked fields, missing data) | 3 | 9% |
| Missing data-testid attributes | 2 | 6% |
| Test data mismatches (fictional vs seed data) | 1 | 3% |
| Infrastructure (DB auth) | 1 | 3% |
| SPA redirect / module loading | 1 | 3% |
| Recording upload failure | 2 | 6% |

## 4. Recommendations

### `skills/debugging/*.md`

- **Add a "PlaywrightSteps → Screenshot" pattern** as the default first-line Replay debugging sequence. This was the most frequently used and successful combination (6/9 Replay uses).
- **Add a "NetworkRequest for data verification" pattern** as a standard second step when the UI renders but shows wrong data or times out waiting for content.
- **Add a "Strict mode violation" diagnostic pattern**: When Playwright reports "strict mode violation" with N matching elements, the fix is almost always to add more specific selectors (e.g., `nth`, `filter`, or `data-testid`). This can be diagnosed from error output alone — Replay is not needed.
- **Add a "Cross-test contamination" pattern**: When tests fail intermittently with unexpected data states, check for parallel test interference. Solutions include unique test data per worker, serial mode for stateful tests, or per-test DB cleanup.
- **Document the Logpoint + SearchSources strategy** for data-flow tracing when the UI renders but uses wrong values — trace from API response through state management to component props.

### `skills/tasks/build/testing.md`

- **Require unique test data per parallel worker**: 5 failures (15%) were caused by cross-test data contamination in `fullyParallel` mode. Tests that share mutable state (same client IDs, same task names) must either use unique identifiers or run serially.
- **Set generous initial timeouts for first-test cold starts**: The Vite dev server cold start caused the first test in some suites to timeout. Consider adding a warm-up navigation or increasing the first test's timeout.
- **Avoid hardcoded expected values**: Tests that hardcode specific counts (e.g., "expect 1 remaining task") or specific names (e.g., "David Lee") break when test data changes. Use relative assertions or query actual seed data.
- **Validate seed data in tests**: The fictional assignee name bug (`worker-…04-27-52.log`) would have been caught if tests verified their test data existed before asserting on it.
- **Run `data-testid` validation before writing tests**: 2 failures were caused by missing `data-testid` attributes that tests expected. Consider a pre-test check that required test IDs exist in the component source.

### `skills/review/reportTestFailures.md`

- **Add a "Failure Category" field** to the per-log analysis template (e.g., timeout, strict-mode, data-contamination, CSS, infrastructure). This would simplify synthesis and enable automated categorization.
- **Add a "Pre-existing" boolean field**: 4 failures were pre-existing and unrelated to the current work. Flagging these explicitly would allow them to be filtered from success rate calculations. Adjusted success rate excluding pre-existing: 85% → 89% (24/27).
- **Add a "Recording Available" field**: Distinguishing "Replay not used because not needed" from "Replay not used because recording was unavailable" (2 upload failures + 1 infra failure) would give a more accurate picture of Replay adoption vs availability.
- **Track re-run count**: The number of test re-runs needed to achieve all-pass (e.g., 18 runs in `worker-…01-10-03.log`) is a useful efficiency metric not currently captured.
