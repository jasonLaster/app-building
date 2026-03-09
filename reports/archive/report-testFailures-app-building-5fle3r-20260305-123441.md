# Test Failures Report: app-building-5fle3r (2026-03-05)

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 88 |
| Logs with test failures | 17 |
| Logs without test failures | 71 |
| Total distinct test failures | 26 |
| Replay usage rate | 3/26 (11.5%) |
| Replay usage rate among debugged failures | 3/26 (11.5%) |
| Debugging success rate | 26/26 (100%) |
| Replay-assisted success rate | 3/3 (100%) |
| Recording availability rate | 25/26 (96.2%) |
| Debugging efficiency (Replay used but unnecessary) | 0/3 (0% — all Replay uses were necessary) |
| Cascading fixes | 1 (date-formatting-invalid-date: 1 fix resolved 2 failures) |
| Self-inflicted failures | 0/26 (0%) |
| Total test re-runs | 18 |
| Unique root causes | 16 (5 clusters covering 15 failures + 11 unclustered) |
| Infrastructure failure events | 1 log (23 tests affected, not counted as test failures) |

### Failure Phase Distribution

| Phase | Count |
|---|---|
| fixTests | 25 |
| deployment | 1 |

All 26 failures were pre-existing (introduced during test writing, not by the agent's fix attempts).

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 42 | 5fle3r/vendroute | Successfully adding a new machine | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 42 | 5fle3r/vendroute | Cancel button closes modal without saving | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 42 | 5fle3r/vendroute | Newly added machine appears in list without refresh | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 42 | 5fle3r/vendroute | Add Machine modal closes when clicking overlay/backdrop | CSS/layout | yes | no | diagnosed from error output and code review | yes | | | yes | none |
| 45 | 5fle3r/vendroute | MachinesNeedingAttention list updates after restocking | backend-bug | yes | yes | | yes | PlaywrightSteps + NetworkRequest | PlaywrightSteps, NetworkRequest | yes | e248793 |
| 46 | 5fle3r/vendroute | RecentActivityFeed updates after logging a new service visit | backend-bug | yes | yes | | yes | NetworkRequest to compare API responses | NetworkRequest | yes | none |
| 48 | 5fle3r/vendroute | Close modal via X button or clicking outside | CSS/layout | yes | no | diagnosed from error output | yes | | | yes | 7a43e83 |
| 50 | 5fle3r/vendroute | Delete location error message display | backend-bug | yes | no | diagnosed from error output and code review | yes | | | yes | none |
| 51 | 5fle3r/vendroute | Delete button in detail panel with confirmation | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 51 | 5fle3r/vendroute | Delete blocked from detail panel when machines assigned | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| 52 | 5fle3r/vendroute | Empty state test (baseURL derivation) | other | yes | no | diagnosed from error output | yes | | | yes | none |
| 54 | 5fle3r/vendroute | Confirming delete removes the machine | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 54 | 5fle3r/vendroute | Canceling delete keeps the machine | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 57 | 5fle3r/vendroute | Machine List table shows fill level as percentage | strict-mode | yes | no | diagnosed from error output | yes | | | yes | 94e6bf2 |
| 58 | 5fle3r/vendroute | New product starts with zero machines stocking | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 58 | 5fle3r/vendroute | Successfully create a new product | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 58 | 5fle3r/vendroute | Cancel button closes modal without saving | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 59 | 5fle3r/vendroute | Edit action opens Edit Product modal with pre-filled data | seed-data-mismatch | yes | no | diagnosed from error output | yes | | | yes | none |
| 59 | 5fle3r/vendroute | Close Edit modal via X button or clicking outside | other | yes | no | diagnosed from error output | yes | | | yes | none |
| 60 | 5fle3r/vendroute | Delete product blocked when stocked in machines | backend-bug | yes | no | diagnosed from error output | yes | | | yes | none |
| 62 | 5fle3r/vendroute | Successfully create a new route | backend-bug | yes | yes | | yes | PlaywrightSteps, Screenshot, NetworkRequest, Evaluate, InspectElement | PlaywrightSteps, Screenshot, Evaluate, InspectElement, NetworkRequest | yes | 4fa07c6 |
| 62 | 5fle3r/vendroute | New route defaults to Planned status | backend-bug | yes | no | Same root cause diagnosed via Replay on first failure | yes | | | yes | 4fa07c6 |
| 65 | 5fle3r/vendroute | Route List shows empty state when no routes exist | other | yes | no | diagnosed from error output | yes | | | yes | 815ddb0 |
| 66 | 5fle3r/vendroute | Machine dropdown lists all active machines | strict-mode | yes | no | diagnosed from error output | yes | | | yes | 403476e |
| 67 | 5fle3r/vendroute | Multiple filters combine with AND logic | seed-data-mismatch | yes | no | diagnosed from error output and reviewing seed data | yes | | | yes | d05dcbd |
| 87 | 5fle3r/vendroute | production app displays data and supports updates | strict-mode | yes | no | diagnosed from error output | no | | | yes | none |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---|---|---|---|
| initialCount-race-condition | 7 | 51, 54, 58 | Fixed by waiting for first row visibility before counting — single pattern fix applied across locations, machines, and products |
| add-machine-count-race | 3 | 42 | Fixed by waiting for machine list to load before capturing initialCount |
| redux-error-serialization | 2 | 51, 60 | Fixed by extracting .message from Redux SerializedError objects in error handlers |
| date-formatting-invalid-date | 2 | 62 | Fixed by removing redundant 'T00:00:00' append in formatDate when timestamp already contains time component (single changeset 4fa07c6) |
| modal-backdrop-click | 1 | 48 | Fixed by clicking backdrop at edge position {x:10, y:10} instead of center |

### Infrastructure Failures

| Log | Affected Tests | Category | Notes |
|---|---|---|---|
| 78 | 23 (all in machine-detail-panel.spec.ts and machine-list.spec.ts) | other | Ephemeral branch dev server returned non-JSON responses ("Function n...") causing all API-dependent tests to fail |

## 3. Patterns

### Failure Category Distribution

| Category | Count | % of Total |
|---|---|---|
| seed-data-mismatch | 11 | 42.3% |
| backend-bug | 7 | 26.9% |
| strict-mode | 3 | 11.5% |
| other | 3 | 11.5% |
| CSS/layout | 2 | 7.7% |

### When Replay Was Most Effective

Replay was used on 3 failures, all backend-bug category, and all 3 uses were necessary — error output alone would not have sufficed:

1. **Dashboard re-fetch bug (log 45):** PlaywrightSteps + NetworkRequest revealed that navigating to the same page was a no-op — `setCurrentPage('dashboard')` didn't re-trigger data fetching because state was already 'dashboard'. Error output only showed stale data, not the cause.

2. **Activity feed ordering bug (log 46):** NetworkRequest comparison revealed seed data timestamps with time components (10:00:00) outranking new visits at midnight (00:00:00). The ORDER BY clause used full timestamps instead of date-only comparison.

3. **Date formatting bug (log 62):** Full tool chain (PlaywrightSteps → Screenshot → NetworkRequest → Evaluate → InspectElement) traced "Invalid Date" display to formatDate appending 'T00:00:00' to ISO timestamps that already contained time components.

### When Replay Was NOT Used

23 of 26 failures (88.5%) were diagnosed from error output alone. The dominant pattern: Playwright error messages clearly indicated the issue (wrong count, [object Object] text, strict-mode violations, about:blank URL). The agent correctly skipped Replay when error output was diagnostic.

### Common Debugging Strategies That Worked

1. **Wait-for-row-before-count (10 failures):** The most impactful pattern — waiting for the first data row to be visible before capturing `initialCount` resolved race conditions across 3 clusters (initialCount-race-condition, add-machine-count-race).

2. **Error serialization fix (2 failures):** Checking for `object.message` on Redux SerializedError objects instead of relying on `instanceof Error`.

3. **Selector refinement (3 failures):** Using `.first()` or more specific selectors to resolve strict-mode violations.

4. **Edge-click for backdrop tests (2 failures):** Clicking at position {x:10, y:10} instead of center to avoid modal content intercepting the click.

### Common Debugging Strategies That Failed

None — all 26 debugging attempts succeeded on the first fix attempt. No failures required multiple fix iterations.

### Self-Inflicted Failure Rate

**0%** — none of the 26 failures were introduced by the agent's own fix attempts. All were pre-existing issues from the test-writing phase. This is an excellent quality signal for the fix process.

### Test Isolation Issues

seed-data-mismatch (42.3%) is the dominant failure category but these are **not** test isolation issues in the traditional sense. They are race conditions where tests capture `initialCount` before async data loading completes, or tests with incorrect expected values based on misunderstanding of seed data. No data-contamination, strict-mode cross-test pollution, or serial execution issues were observed.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "wait-for-data-before-count" pattern:** Document that any test capturing an initial count of list items must first `await expect(page.locator('[data-testid="first-row-selector"]').first()).toBeVisible()` before counting. This single pattern would have prevented 10/26 (38.5%) of all failures.
- **Add "Redux SerializedError" pattern:** Document that Redux Toolkit's `unwrap()` throws `SerializedError` objects (not `Error` instances), requiring `err.message` extraction rather than `String(err)` or `instanceof Error` checks.

### `skills/tasks/build/testing.md`

- **Mandate row-visibility waits in test templates:** When writing tests that assert on list counts (add/delete operations), the test template should include a wait for the first row before capturing baseline counts. This is the single highest-impact improvement — it would eliminate 38.5% of all test failures.
- **Standardize backdrop click position:** Tests for modal dismissal via backdrop click should always use edge coordinates (e.g., `{x:10, y:10}`) rather than center clicks, as modals often occupy the center of the overlay.
- **Validate seed data counts in tests:** Tests that assert specific counts from seed data should reference seed-db.ts directly rather than hardcoding expected values.

### `skills/review/reportTestFailures.md`

- **Consider adding a "fix reuse" metric:** Many failures (initialCount-race-condition across 3 spec files) were fixed by applying the same pattern repeatedly. A metric tracking how often the same fix pattern is applied across different spec files could identify opportunities for shared test utilities or fixture improvements.
- **Clarify infrastructure failure counting:** The current template correctly excludes infrastructure failures from TEST_FAILURES counts, but the relationship between infrastructure failure events (log 78: 23 tests) and the test failure statistics could be made more explicit in the synthesis instructions.
