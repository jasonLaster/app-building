# Debugging with Replay MCP Tools

This directory contains guides for using Replay MCP tools to investigate different categories
of test failures. Before attempting to debug a test failure, scan these guides for the category
that matches your failure and follow the recommended tool sequence.

## Guides

- `timeouts.md` — Test timeouts and stuck steps (most common failure type)
- `race-conditions.md` — Parallel test interference, flaky assertions, state corruption
- `component-rendering.md` — Components not mounting, empty DOM, React rendering issues
- `network-and-api.md` — API errors, missing data, wrong responses
- `form-and-input.md` — Form validation, input interactions, browser-native behavior
- `seed-data.md` — Missing test data, empty collections, count mismatches

## Default First Tool: PlaywrightSteps

**Always call `PlaywrightSteps` first** when diagnosing any test failure with Replay. It
provides step timing, identifies which step failed, and guides which tool to use next:

1. **`PlaywrightSteps`** — Shows the exact sequence of Playwright actions with timestamps.
   Identifies which step stalled or failed.

Then choose the next tool based on what PlaywrightSteps reveals:

- **API/data issues** (wrong response, missing data) → `NetworkRequest` to inspect request
  payloads and response bodies.
- **Missing event handlers** (interaction had no effect) → `Logpoint` on the handler to
  check if it was called (0 hits = never fired).
- **Visual/layout issues** (element not visible, wrong position) → `Screenshot` at the
  failing step's point.
- **Timeout from excessive assertions** (many steps each taking seconds) → the fix is
  usually to batch assertions via `page.evaluate`.

This was the most frequently used and successful Replay approach (used in 7/8+ Replay
sessions with 100% success rate). When the UI renders but shows wrong data or times out
waiting for content, `NetworkRequest` as a second step confirms whether the backend
returned the expected data.

## Cluster-Aware Debugging

When 3+ failures share a spec file or show similar error patterns, check for a shared root
cause before debugging individually. Common clusters:

- Same API endpoint returning wrong data → single backend fix resolves all
- Same date format mismatch across multiple components → single parsing fix
- Same seed data assumption violated → single seed/test data fix

**Approach**: Debug the first failure thoroughly, then check if the root cause explains the
others. This saves significant time — in observed sessions, clusters of 6+ failures were
resolved with a single fix.

## Pre-Debugging Triage

Before using Replay tools or making any code changes, determine whether failures are
pre-existing or new:

### Pre-existing failure triage
When tests fail during a task, first verify whether failures are pre-existing by running
the same tests on the unmodified code:

1. `git stash` your changes (or check out the base commit).
2. Run the failing tests on the unmodified code.
3. If the tests fail identically, the failures are pre-existing and out of scope for the
   current task. Note them and move on.
4. `git stash pop` to restore your changes.

This is the most effective first step — it avoids spending time debugging failures that
are unrelated to the current work.

### Infrastructure failure detection
When multiple tests fail with identical navigation timeouts, socket errors
(`ETIMEDOUT`, `ERR_SOCKET_NOT_CONNECTED`), or `net::ERR_CONNECTION_REFUSED`, classify
these as infrastructure failures early and skip further debugging. Signs of infrastructure
failures:

- 5+ tests failing with the same timeout/socket error
- No recordings generated (the browser couldn't connect)
- Failures are across unrelated test files in the same app
- A simple retry resolves transient cases; persistent failures indicate a deeper issue

Do not use Replay tools for infrastructure failures — there are no usable recordings.

### When recordings ARE available — use Replay
When a failure is **not** pre-existing and a recording **is** available, always use Replay
MCP tools before declaring the failure unresolvable. The recording contains the actual
runtime state and is more reliable than guessing from error messages alone. Follow the
tool sequence in the relevant debugging guide below.

## No-Replay Diagnostic Patterns

**Error output first**: In 50%+ of observed failures, Replay was unnecessary because the
error output contained sufficient diagnostic information. Always check error output before
reaching for Replay. Specifically, before launching Replay, check if the test failure message
contains:
- An expected-vs-received comparison (e.g., "expected 3, received 5")
- A clear error string (SQL constraint violation, HTTP status code)
- A floating-point formatting issue (e.g., `-0` vs `0`, `105.00` vs `105`)

If any of these are present, diagnose directly from the error output. Reserve Replay for
failures where the page state at failure time is ambiguous or the failure involves complex
async timing.

**Skip Replay for strict-mode and race-condition categories.** Error output is consistently
sufficient for these two categories. Strict-mode violations show element counts and the
ambiguous locator. Race conditions show expected vs. received counts. Reserve Replay for
backend-bug and infrastructure failures where the HTTP response or server-side behavior is
opaque.

Some failures can be diagnosed from Playwright error output alone without needing Replay:

### Strict mode violation
When Playwright reports `strict mode violation` with N matching elements, the fix is almost
always to add more specific selectors. Common fixes:
- Add `nth(0)` or `first()` to narrow to a single match
- Use `filter({ hasText: ... })` to disambiguate
- Add a unique `data-testid` attribute to the target element

Replay is not needed — the error message tells you exactly how many elements matched and
what the ambiguous locator was.

### Race condition (count mismatch)
When Playwright error output shows `expected N, received 0` or `expected N+1, received 1`
after a navigation or container visibility check, this is almost always a count-before-load
race condition. The test captured element count before async data finished loading.

Replay is not needed — the `toHaveCount expected N, received 0` pattern is a well-known
race condition diagnosable from error output alone. Fix by adding `waitFor` or asserting
with `toHaveCount` with a timeout before capturing initial counts.

### Replay decision tree for data issues
Use Replay when error output doesn't explain *why* the wrong data exists (e.g., unexpected
records from an unknown source, API returning data that shouldn't be there). Skip Replay when
error output shows a clear count mismatch with an obvious accumulation pattern (e.g., "expected
3, got 30+" — this is almost certainly missing cleanup).

### Data contamination triage (most common failure category — 37.5% of all failures)
When Playwright error output shows expected count X but received Y (e.g., "expected 3 but
received 4", "expected $7.00 but got $8.50"), check before reaching for Replay:
1. Does a prior test create or delete records without cleanup?
2. Does the test assert a hardcoded record count instead of using relative assertions?
3. Is the seed data inserting duplicates (missing TRUNCATE before INSERT)?

If the expected-vs-actual mismatch is clear from the error output, Replay is unnecessary.
This pattern accounted for ~45-58% of failures in observed sessions. In one analysis,
58% of Replay-used data-contamination failures could have been diagnosed from error
output alone — skip Replay and go straight to test ordering and data isolation fixes.

### Serial test data contamination
When tests fail with unexpected counts, missing entities, or strict mode violations (e.g.,
"expected 3, got 5" or "strict mode violation: 2 elements match"), first check if earlier
tests in the same file created, renamed, or deleted entities. Serial test execution
accumulates state — a test that creates a customer makes later tests see one extra customer;
a test that renames an entity makes later tests fail to find the original name.

**Diagnosis without Replay**: The error message shows an expected-vs-actual mismatch. Look at
the test execution order: if an earlier test creates/deletes/renames records, the mismatch
is explained by accumulated state. No recording is needed.

**Fix patterns**:
- Move destructive tests (deletes, renames) to the end of describe blocks
- Wrap destructive tests in `test.describe.serial` from the start during test authoring
- Use relative assertions ("count increased by 1") instead of absolute ("count is 4")
- Use unique entity names per test to avoid strict mode collisions
- Make later tests query current state before asserting
- Add `beforeEach` cleanup to remove test-created data when tests create entities via API

**Anti-pattern: Destructive test ordering.** Tests that delete all entities to verify empty
state MUST run last in their describe block or use `test.describe.serial`. Placing them
earlier corrupts state for all subsequent tests. This single anti-pattern caused 18 failures
(33% of all failures) across 7 spec files in one observed session.

This was the root cause of ~45% of observed test failures.

### Selector overcount
When using `[data-testid^="prefix-"]` selectors, always check whether a container element
also matches the prefix. For example, `[data-testid^="route-stop-"]` will match both
`route-stop-item-1` and `route-stop-list` (the container). This causes count assertions to
be off by 1 and was a recurring failure pattern. Fix by adding `:not()` exclusions
(e.g., `:not([data-testid="route-stop-list"])`) or using more specific selectors.

**Diagnosis without Replay**: The error message shows "expected N, got N+1" for a list count.
Check if the `data-testid` prefix selector matches a container element in the component source.

### Redux state replacement
When inline edit tests fail with missing nested data (e.g., arrays or related fields
disappearing after an update), check if the Redux slice's `fulfilled` reducer replaces the
entire entity instead of merging updated fields. For example, `updateTank.fulfilled` setting
`state.currentTank = action.payload` will overwrite nested arrays that weren't included in
the API response.

**Diagnosis without Replay**: Read the Redux slice source code for the `fulfilled` handler.
If it assigns the whole payload instead of spreading/merging, that's the bug.

**Fix**: Change the reducer to merge fields: `state.currentEntity = { ...state.currentEntity, ...action.payload }`.

### Clear backend error in test output
When Playwright error output includes the expected and actual values and the mismatch points
directly to a backend bug (e.g., API returned wrong values, validation rejected valid input),
diagnose from the error output alone. Replay is unnecessary when the error message already
identifies the broken code path. This saves time — load recordings only when the root cause
is not obvious from the test output.

## Quick Reference: Which Tool to Start With

| Symptom | Start with |
|---------|-----------|
| Test timed out | `PlaywrightSteps` |
| Element not found / count mismatch | `PlaywrightSteps` then `Screenshot` |
| Wrong data displayed | `NetworkRequest` then `Logpoint` |
| Component not rendering | `Screenshot` then `ConsoleMessages` |
| API returning errors | `NetworkRequest` then `ConsoleMessages` |
| Assertion wrong value | `Evaluate` or `Logpoint` |
| Flaky / intermittent | `PlaywrightSteps` then `Logpoint` on shared state |
| Uncaught exception | `UncaughtException` then `GetStack` |
| DB constraint violation (500) | `NetworkRequest` then `Logpoint` on handler |
| Click times out on toggle/checkbox | `PlaywrightSteps` then check if testid is on sr-only element |
| All API calls failing after setup | `NetworkRequest` then `LocalStorage` (stale server?) |
| Multiple timeouts on fresh build | `PlaywrightSteps` then `DescribeComponent` (Replay browser overhead?) |
| Auth test returns 409/400 | `PlaywrightSteps` then `NetworkRequest` (check request payload) |
| Action succeeds but UI doesn't update | `NetworkRequest`/`LocalStorage` then `ReactRenders` (state hydration gap?) |
| Blank page / missing data (no error) | `PlaywrightSteps` then `NetworkRequest` (check for 404/500 silently swallowed) |
| Default/fallback value used instead of API value | `PlaywrightSteps` then `NetworkRequest` (check API response timing vs UI action) |
