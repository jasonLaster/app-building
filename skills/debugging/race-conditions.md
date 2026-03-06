# Debugging Race Conditions with Replay

Race conditions cause flaky tests — they pass sometimes and fail others. The root cause is
usually parallel tests modifying shared state, or async operations completing in an unexpected
order. Replay recordings capture the exact execution, making the non-determinism visible.

## Tool Sequence

1. **`PlaywrightSteps`** — Establish the test flow. Identify which step's assertion failed
   and what value it received vs. expected.

2. **`Logpoint`** — Place logpoints on the code that produces the contested value. Inspect
   how many times it was called and what values flowed through. Key locations:
   - API response handlers (where state is set from fetched data)
   - Redux/state dispatches
   - Component render functions (to see re-render counts)

3. **`SearchSources`** — Check hit counts on specific lines. If a line that should execute
   once has multiple hits, something is triggering it repeatedly (e.g., React strict mode
   double-firing effects, or concurrent test workers hitting the same endpoint).

4. **`Evaluate`** — Evaluate expressions at specific execution points to inspect intermediate
   state. Useful for checking array lengths, object properties, or computed values at the
   exact moment an assertion runs.

5. **`NetworkRequest`** — Check for overlapping or out-of-order API calls. A common pattern:
   a PATCH (optimistic update) followed by a GET (refresh), where the GET response arrives
   after the PATCH and overwrites the optimistic state with stale data.

## Common Root Causes (from observed failures)

### Parallel test interference on shared records
Multiple tests in the same spec file modify the same database record (e.g., adding
relationships to the same person). Count-based assertions (`toHaveCount(1)`) fail because
another test added an extra record concurrently.

**Fix**: Switch from count-based assertions to name-based assertions (check for a specific
item by name rather than exact count). Or create isolated test data per test.

*Example*: PDP-REL-04a expected relationship count 1, got 2. Logpoints showed a parallel
test added a relationship to the same person simultaneously.

### Optimistic update overwritten by late GET response
A test clicks a toggle (PATCH request), then immediately asserts the new state. But a
previously-triggered GET request returns with stale data and overwrites the optimistic update.

**Fix**: Intercept routes in the test to prevent the stale GET from overwriting, or wait for
the GET to complete before asserting.

*Example*: Webhook toggle test. SearchSources showed the GET response handler had more
hits than expected, and the late GET overwrote the PATCH result.

### React strict mode double-firing effects
In development mode, React strict mode runs effects twice. If an effect makes an API call
(e.g., fetching data on mount), the second call's response can arrive and overwrite state
set by earlier interactions.

**Diagnosis tool sequence**: When a test hangs on an element action or shows stale data after
a mutation, use `PlaywrightSteps → Screenshot → NetworkRequest` to check if concurrent API
calls from StrictMode double-mounts are resetting state. NetworkRequest will show interleaved
request ordering that reveals the race.

**Fix**: Ensure effects are idempotent, or use abort controllers to cancel stale requests.

### Cross-test data contamination
When tests fail intermittently with unexpected data states (wrong counts, unexpected records,
stale values), check for parallel test interference. This happens when multiple tests or
workers modify the same database records concurrently.

**Diagnosis**: Tests pass in isolation but fail when run in the full suite. Error messages
show unexpected counts or data values that don't match what the test created.

**Fix**: Apply one or more of these strategies:
- Use unique test data per parallel worker (unique names, IDs, or prefixes)
- Run stateful tests serially (`test.describe.serial`) when they must share state
- Add per-test database cleanup in `beforeEach`/`afterEach`
- Use ephemeral Neon branches for test isolation (already the default in this repo)

*Example*: 5 failures (15% of all failures) were caused by cross-test contamination in
`fullyParallel` mode where tests shared the same client IDs and task names.

### Async data load before count capture
Tests that capture an initial count of list items (e.g., `initialCount = await rows.count()`)
before performing an add/delete operation often fail because the count is captured before async
data loading completes, returning 0 instead of the actual count.

**Diagnosis**: Error output shows `expected N+1, received 1` or similar off-by-one from zero
baseline. The test didn't wait for data to render before counting.

**Fix**: Always wait for the first data row to be visible before capturing `initialCount`:
```ts
await expect(page.locator('[data-testid="row"]').first()).toBeVisible();
const initialCount = await page.locator('[data-testid="row"]').count();
```

This single pattern resolved 22–38% of all test failures in observed runs. In one session it
was the single most repeated self-inflicted bug, appearing identically in 6+ spec files (12
failures). Always apply this fix proactively across all spec files when discovered in one.

### Stale fetch race condition
A component fires a fetch on mount, then fires another fetch in response to user action (e.g.,
search or filter). The first fetch's response arrives after the second and overwrites the UI
with stale data.

**Diagnosis with Replay**: `NetworkRequest` shows two requests to the same endpoint.
`Logpoint` on the response handler confirms the first response arrived after the second.
`Evaluate` at the assertion point shows stale data in the component state.

**Tool sequence**: `NetworkRequest → Logpoint → Evaluate`

**Fix**: Use abort controllers to cancel pending requests when a new one fires, or track
request ordering and ignore out-of-order responses.

*Example*: Search bar test failed because the initial page-load fetch response arrived after
the search-filtered fetch, overwriting search results with the full list.

### Date.now() or shared identifiers across workers
When parallel Playwright workers share a module-level `Date.now()` value for generating
unique IDs (like test emails), all workers get the same value, causing collisions.

**Fix**: Generate unique values inside `beforeAll`/`beforeEach` using `Math.random()` or
worker-specific identifiers.

*Example*: Parallel workers tried to sign up with the same email (Date.now() evaluated
at module load). Fixed with per-worker random emails.
