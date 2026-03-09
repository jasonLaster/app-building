# Debugging Race Conditions with Replay

Race conditions cause flaky tests — they pass sometimes and fail others. The root cause is
usually parallel tests modifying shared state, or async operations completing in an unexpected
order. Replay recordings capture the exact execution, making the non-determinism visible.

## Tool Sequence

**Recommended first sequence for most race conditions: `PlaywrightSteps → NetworkRequest`.**
This covers the majority of race condition failures (timing of UI actions vs. API responses).
Only escalate to deeper tools if this doesn't reveal the root cause.

1. **`PlaywrightSteps`** — Establish the test flow. Identify which step's assertion failed
   and what value it received vs. expected.

2. **`NetworkRequest`** — Check for overlapping or out-of-order API calls. A common pattern:
   a PATCH (optimistic update) followed by a GET (refresh), where the GET response arrives
   after the PATCH and overwrites the optimistic state with stale data. Also reveals whether
   API responses arrived before or after count/assertion operations.

3. **`Logpoint`** — Place logpoints on the code that produces the contested value. Inspect
   how many times it was called and what values flowed through. Key locations:
   - API response handlers (where state is set from fetched data)
   - Redux/state dispatches
   - Component render functions (to see re-render counts)

4. **`SearchSources`** — Check hit counts on specific lines. If a line that should execute
   once has multiple hits, something is triggering it repeatedly (e.g., React strict mode
   double-firing effects, or concurrent test workers hitting the same endpoint).

5. **`Evaluate`** — Evaluate expressions at specific execution points to inspect intermediate
   state. Useful for checking array lengths, object properties, or computed values at the
   exact moment an assertion runs.

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

### Async data load before count capture (wait-before-count)
Tests that capture an initial count of list items or dropdown options (e.g.,
`initialCount = await rows.count()`) before performing an operation often fail because the
count is captured before async data loading completes, returning 0 instead of the actual count.
This applies to both **table rows** and **dropdown/select options** that populate from API data.

**Diagnosis**: Error output shows `expected N+1, received 1` or similar off-by-one from zero
baseline, or dropdown option count is 0. The test didn't wait for data to render before counting.
When dropdown options show count 0, the first check should be whether the API response has
arrived before the count operation — use `PlaywrightSteps → NetworkRequest` to confirm timing.

**Fix**: Always wait for the first element to be visible before capturing counts:
```ts
// For table rows:
await expect(page.locator('[data-testid="row"]').first()).toBeVisible();
const initialCount = await page.locator('[data-testid="row"]').count();

// For dropdown options:
await expect(page.locator('select option').nth(1)).toBeAttached(); // wait for first non-placeholder option
const optionCount = await page.locator('select option').count();
```

This single pattern resolved 22–38% of all test failures in observed runs. In one session it
was the single most repeated self-inflicted bug, appearing identically in 6+ spec files (12
failures). Always apply this fix proactively across all spec files when discovered in one.

### API response arrives after UI action (fallback value used)
When a test asserts on a value that should come from an API response but instead sees a
hardcoded default or fallback, the root cause is often that the API response arrived after
the UI action that needed it. For example, a settings API returns the shop rate 85ms after
the user clicks "Add Labor", so the labor line uses the hardcoded default rate instead.

**Diagnosis with Replay**: `PlaywrightSteps` shows the button click timestamp.
`NetworkRequest` shows the API response timestamp. If the response arrived after the click,
the timing gap is the root cause.

**Tool sequence**: `PlaywrightSteps → NetworkRequest` (check timing of button click relative
to API response)

**Fix**: Ensure the UI waits for API data before enabling the action, or ensure the component
re-reads the latest state after the API response arrives rather than capturing the value at
click time.

### Count=0 or disabled button after data load
When tests fail with count=0 for a list or a button remains disabled after an action,
the root cause is often a timing issue between data loading and the assertion/click. The
data hasn't finished loading when the test checks.

**Diagnosis with Replay**: `PlaywrightSteps` shows the timing gap between the page load
and the assertion. `NetworkRequest` confirms whether the API call completed before the
assertion ran.

**Tool sequence**: `PlaywrightSteps → NetworkRequest` (measure timing gap, verify API completion)

**Fix**: Wait for the expected element or data to appear before asserting:
```ts
await expect(page.locator('[data-testid="row"]').first()).toBeVisible();
```
Or wait for the button to be enabled before clicking:
```ts
await expect(page.locator('button[data-testid="submit"]')).toBeEnabled();
```

### useEffect overwrites user edits (dirty flag pattern)
When form fields reset to their original values after user input, check for a `useEffect` that
re-syncs component state from fetched data. The effect fires after the fetch completes, which
may happen after the user has already edited the form, overwriting their changes.

**Diagnosis without Replay**: Test fills a form field, but after a brief delay the field reverts
to its original value. The assertion fails with the pre-edit value instead of the expected new
value.

**Fix**: Add a "dirty" flag to the component state. Set it to `true` when the user edits any
field, and guard the `useEffect` sync with `if (!dirty)`:
```ts
const [dirty, setDirty] = useState(false);
useEffect(() => {
  if (!dirty && fetchedData) {
    setFormState(fetchedData);
  }
}, [fetchedData, dirty]);
```

This pattern resolved useEffect overwrite issues that took 5+ iterations to diagnose in
observed sessions.
### API timing race condition (NetworkRequest → Logpoint sequence)
For race conditions involving async state management (useEffect + API response timing), where
error output only shows the symptom (wrong value) but not the cause (when/why state was
overwritten), use this specific tool sequence:

1. **`NetworkRequest`** — Trace request/response timing to identify when API responses arrived
   relative to user actions. Look for responses that arrive after state has already been updated.
2. **`Logpoint`** — Verify state management (refs, counters, guards) to confirm the overwrite
   mechanism. Place logpoints on useEffect callbacks and onChange handlers to see the exact
   ordering of state updates.

This sequence was the most effective diagnostic for useEffect race conditions across observed
sessions — it revealed the exact timing of API responses overwriting local state when error
output alone only showed "expected X, got Y."

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

### useEffect overwrites form during editing (editing guard pattern)
When tests show stale or null values in PUT/POST request bodies after a user edits a form,
the root cause is typically a React `useEffect` that re-fires during editing and overwrites
the user's input with fetched data. This differs from the "Form populate overwrites user edits"
pattern (see `form-and-input.md`) because it specifically involves an `isEditing` state guard
rather than a one-time ref guard.

**Diagnosis with Replay**:
1. `NetworkRequest` — Inspect the PUT/POST body. Confirm it contains stale/original values
   instead of the user's edits.
2. `Logpoint` — Place logpoints on the useEffect callback and on onChange/event handlers.
   The timeline will show: user edits field → onChange fires → useEffect re-fires → state
   resets to fetched data → save sends stale data.

**Fix**: Add an `isEditing` state variable. Set it to `true` when the user begins editing
(e.g., on click of Edit button or first input change). Guard the useEffect to skip when
`isEditing` is true:
```ts
const [isEditing, setIsEditing] = useState(false);
useEffect(() => {
  if (isEditing) return;
  if (data) {
    setFormValues(data);
  }
}, [data, isEditing]);
```

This pattern was needed across 3 spec files (7 tests) in one session, all involving forms
that load data via useEffect and allow inline editing. When found in one component,
proactively check all similar edit forms in the app.

### Lazy locator invalidated by state change (capture-testid-before-click)
Playwright lazy locators filtered by text (e.g., `hasText: /^Scheduled$/`) re-evaluate on
every use. If a click changes the element's text (e.g., status changes from "Scheduled" to
"Checked In"), subsequent locator uses fail because the filter no longer matches.

**Diagnosis**: Test clicks a status-change button, then tries to interact with the same row
using the original locator. The locator resolves to 0 elements because the text changed.

**Fix**: Capture a stable identifier (like `data-testid`) before the click, then use that
identifier for subsequent interactions:
```ts
// Before clicking status change:
const row = page.locator('[data-testid^="patient-row-"]', { hasText: /^Scheduled$/ });
const testId = await row.getAttribute('data-testid');

// Click status change
await row.getByRole('button', { name: 'Check In' }).click();

// After status changes, use the stable testid:
const updatedRow = page.getByTestId(testId!);
await expect(updatedRow).toContainText('Checked In');
```

This pattern was needed across 3 spec files (5 tests) where status-change buttons altered
the text that lazy locators depended on.

### Date.now() or shared identifiers across workers
When parallel Playwright workers share a module-level `Date.now()` value for generating
unique IDs (like test emails), all workers get the same value, causing collisions.

**Fix**: Generate unique values inside `beforeAll`/`beforeEach` using `Math.random()` or
worker-specific identifiers.

*Example*: Parallel workers tried to sign up with the same email (Date.now() evaluated
at module load). Fixed with per-worker random emails.
