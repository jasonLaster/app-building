# Test Failures Report: app-building-xrwwne-20260311-075443

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 80 |
| Logs with test failures | 4 |
| Logs without test failures | 76 |
| Total distinct test failures | 4 |
| Total affected tests | 17 |
| Replay usage rate | 0% (0/4) |
| Replay usage rate among debugged failures | 0% (0/4) |
| Debugging success rate | 100% (4/4) |
| Replay-assisted success rate | N/A (no Replay-used failures) |
| Recording availability rate | 100% (4/4) |
| Debugging efficiency (Replay used unnecessarily) | N/A (Replay not used) |
| Cascading fixes | 2 (testid-prefix-collision: 2 tests, sr-only-leader-text: 8 tests) |
| Self-inflicted failures | 1 (25% of total) |
| Total test re-runs across all logs | 10 |
| Unique root causes | 3 (testid-prefix-collision, game-list-destructive-ordering, sr-only-leader-text) |
| Fix reuse rate | 1 (toContainText-for-sr-only-text applied across 5 spec files) |
| Test Isolation Score | 100% (4/4 — all failures were strict-mode or data-contamination) |
| Pre-existing failure rate | 50% (2/4) |
| Replay decision quality | N/A (Replay never used) |
| Infrastructure failure events | 6 events affecting 19 tests |
| Self-inflicted fix quality cost | 1 additional re-run |

**Failure phase distribution:**

| Phase | Count |
|-------|-------|
| fixTests | 2 |
| other (JourneyQA) | 2 |

**Failure resolution type distribution:**

| Resolution Type | Count |
|-----------------|-------|
| test-code | 3 |
| both | 1 |

**Diagnostic source effectiveness (among resolved failures):**

| Source | Count |
|--------|-------|
| error-output | 3 |
| page-snapshot | 1 |

**Fix iteration difficulty distribution:**

| Iterations | Count |
|------------|-------|
| 1 | 4 |

**Resolution effort distribution:**

| Tool Calls | Count |
|------------|-------|
| 3 | 1 (only log 78 reported TOOL_CALL_COUNT) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-38 | xrwwne/score-keeper | Finished game appears in Game History (cluster: testid-prefix-collision, 2 tests) | strict-mode | yes | no | error-output-sufficient | yes | — | — | yes | 440303a95a |
| worker-42 | xrwwne/score-keeper | GameList destructive ordering (cluster: game-list-destructive-ordering, 6 tests) | data-contamination | yes | no | error-output-sufficient — page snapshots showed empty state | yes | — | — | yes | none |
| worker-78 | xrwwne/score-keeper | Track Scores › Add rounds with scores and verify totals update | strict-mode | no | no | error-output-sufficient | yes | — | — | yes | none |
| worker-79 | xrwwne/score-keeper | sr-only-leader-text cluster (8 tests) | strict-mode | no | no | error-output-sufficient | yes | — | — | yes | df296dd8bd |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| testid-prefix-collision | 2 tests | worker-38 | Fixed by renaming data-testid prefixes in GameHistoryCard (changeset 440303a95a) |
| game-list-destructive-ordering | 6 tests | worker-42 | Fixed by reordering tests — non-destructive display tests first, destructive delete tests last |
| sr-only-leader-text | 9 tests | worker-78, worker-79 | Fixed by changing toHaveText to toContainText for cells with sr-only "(leader)" text (changeset df296dd8bd) |

## 3. Patterns

### When was Replay most effective?

Replay was never used in this build. All 4 failures were diagnosed from error output or page snapshots alone.

### When was Replay NOT used and why?

All 4 failures had clear, actionable error messages:
- **strict-mode failures** (3/4): Error output showed exact expected vs received text (e.g., expected "25" received "25 (leader)"), making the root cause immediately obvious
- **data-contamination** (1/4): Page snapshot showed "No active games" empty state, clearly indicating data was deleted by prior tests

### Common debugging strategies that worked

- **Error output analysis**: Reading Playwright's expected/received diff was sufficient for all strict-mode failures
- **Page snapshot analysis**: Observing empty state in snapshot revealed data contamination without needing Replay
- **Test reordering**: Moving destructive tests to run last resolved data contamination
- **Assertion relaxation**: Changing `toHaveText` to `toContainText` accommodated sr-only accessibility text

### Common debugging strategies that failed

None — all debugging attempts succeeded on the first try.

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| strict-mode | 3 | 75% |
| data-contamination | 1 | 25% |

**Data-contamination sub-categories** (25% of total, below 40% threshold — brief breakdown):

| Sub-category | Count |
|-------------|-------|
| destructive-ordering | 1 |

### Self-inflicted failure rate

**25% (1/4)** — One failure in log 78 was self-inflicted. The JourneyQA test used `toHaveText` for a cell that contained sr-only accessibility text added during the polishApp phase. This represents a test-assumption mismatch (subtype c: writing new tests with incorrect assumptions about rendered text content).

### Test Isolation Issues

**100% Test Isolation Score** — All 4 failures were related to test isolation (strict-mode: 3, data-contamination: 1). However, the absolute count is very low (4 failures across 80 logs), indicating the overall test suite is well-isolated. The strict-mode failures were caused by sr-only accessibility text rather than true element duplication, which is a distinct pattern from typical strict-mode issues.

**Affected spec files:**
- `game-list.spec.ts` — destructive test ordering (data-contamination)
- `end-game.spec.ts` — testid prefix collision (strict-mode)
- Multiple journey/component spec files — sr-only leader text (strict-mode)

**Recommended isolation strategy:** The sr-only text pattern would be prevented by using `toContainText` by default for any cell that might contain visually-hidden accessibility annotations.

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: sr-only text mismatch** — When accessibility improvements add visually-hidden text (e.g., "(leader)" via sr-only spans), existing `toHaveText` assertions will fail. Recommend using `toContainText` for cells that may contain sr-only annotations, or stripping sr-only content in test selectors.
- **Add pattern: testid prefix collision** — When multiple components share similar testid prefixes (e.g., `game-history-card-` appearing in both GameHistoryCard and other components), use more specific testid naming to avoid locator ambiguity.

### `skills/tasks/build/testing.md`
- **Destructive test ordering**: Add a directive that delete/modify tests should always be placed in a `test.describe.serial` block at the end of spec files to prevent data contamination.
- **Default to `toContainText`**: Consider recommending `toContainText` over `toHaveText` when asserting on cells/elements that may contain auxiliary text (e.g., sr-only spans, tooltips). This reduces brittleness when accessibility improvements are made.
- **Post-polishApp test validation**: After accessibility/polish changes, run affected test suites to catch assertion mismatches before JourneyQA.

### `skills/review/reportTestFailures.md`
- No changes recommended — the template captured all failure patterns effectively with low overhead. The 80-log analysis with only 4 failures suggests the build process is working well.

## 5. Replay Fixes Table

No Replay-assisted fixes were made in this report. Replay was not used for any test failures.

INITIAL_CHANGESET
FAILING_TEST
FINAL_CHANGESET
ASSESSMENT

(No entries — Replay was not used in any failure resolution.)
