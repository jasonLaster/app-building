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

**Fix**: Always wait for the first element to be visible before capturing counts. For
count-based assertions after async operations, combine `waitForResponse` with `waitForSelector`
to ensure both the API response has arrived and the DOM has updated:
```ts
// For table rows:
await expect(page.locator('[data-testid="row"]').first()).toBeVisible();
const initialCount = await page.locator('[data-testid="row"]').count();

// For dropdown options:
await expect(page.locator('select option').nth(1)).toBeAttached(); // wait for first non-placeholder option
const optionCount = await page.locator('select option').count();

// For count assertions after mutations (standard wait pattern):
await page.waitForResponse(resp => resp.url().includes('/api/items') && resp.status() === 200);
await expect(page.locator('[data-testid="row"]')).toHaveCount(expectedCount);
```

This `waitForResponse` + element assertion pattern is the standard fix for count-based race
conditions. It ensures the API call has completed before asserting on DOM state, preventing
flaky failures from timing gaps.

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

### useEffect autosave feedback loop
When a form component auto-saves on change and also syncs state from fetched data via
`useEffect`, the auto-save triggers a refetch, which triggers the `useEffect`, which
overwrites the form state, which triggers another auto-save — creating an infinite loop
or rapid state oscillation. This caused 11 failures in one form-editor component and 3
in a personal-info component.

**Diagnosis without Replay**: Test fills a form field, but the value reverts or the form
enters an update loop. Error output shows the original value instead of the edited value,
or timeout from repeated saves.

**Fix**: Add an editing guard (dirty flag or `isEditing` state) AND debounce the auto-save.
The `useEffect` that syncs from fetched data must skip when the user is actively editing:
```ts
const [isEditing, setIsEditing] = useState(false);
useEffect(() => {
  if (isEditing) return; // Don't overwrite during editing
  if (fetchedData) setFormState(fetchedData);
}, [fetchedData, isEditing]);
```
When found in one form component, proactively check all other form components with
auto-save for the same pattern.

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
with stale data. This is especially common with search/filter components where typing triggers
multiple rapid fetches.

**Diagnosis with Replay**: `NetworkRequest` shows two requests to the same endpoint.
`Logpoint` on the response handler confirms the first response arrived after the second.
`Evaluate` at the assertion point shows stale data in the component state. Replay
`NetworkRequest` timing analysis is the most effective diagnostic tool for this category —
the timing information is only visible in Replay.

**Tool sequence**: `NetworkRequest → Logpoint → Evaluate`

**Fix**: Use abort controllers to cancel pending requests when a new one fires, or track
request ordering with request IDs and ignore out-of-order responses:
```ts
// Request ID tracking pattern
let currentRequestId = 0;
const fetchData = async (query: string) => {
  const requestId = ++currentRequestId;
  const response = await fetch(`/api/search?q=${query}`);
  const data = await response.json();
  // Ignore stale responses
  if (requestId !== currentRequestId) return;
  setResults(data);
};
```

*Example*: Search bar test failed because the initial page-load fetch response arrived after
the search-filtered fetch, overwriting search results with the full list. In another session,
two empty-query responses arrived after a filtered response in a fleet list component,
overwriting the correct results.

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

### React StrictMode concurrent fetch race condition (request-id-tracking)
When Redux slices dispatch fetch thunks in `useEffect`, React StrictMode double-fires the
effect, causing two concurrent API requests. The stale response from the first (duplicate)
request can arrive after the correct response and overwrite it with wrong data.

**Symptom**: Filters appear to work intermittently; test sees unfiltered data after applying
a filter. Or a month/date filter shows `$0` instead of the correct value.

**Root cause**: React StrictMode double-fires effects, causing two concurrent fetches where
the stale unfiltered response arrives after the filtered one and overwrites Redux state.

**Diagnostic tool sequence**: `NetworkRequest` to see request timing and which response
arrived last. Look for two requests to the same endpoint within milliseconds, where the
earlier request's response arrives after the later one.

**Fix**: Track a `requestId` (incrementing counter or UUID) in the Redux slice. On each
fetch dispatch, increment the ID. In the fulfilled reducer, compare the response's request
ID against the current ID — discard responses from superseded requests. Alternatively, use
`AbortController` to cancel stale requests.

**Cross-slice application**: When this fix is applied to one Redux slice (e.g., invoicesSlice),
check whether other slices using the same fetching pattern need the same fix (e.g.,
paymentsSlice, reportsSlice), and apply it proactively to all of them at once.

*Example*: In VetLedger, this pattern was independently needed for invoicesSlice,
paymentsSlice, and reportsSlice. Applying it to all three at once would have saved 2
additional test-fix cycles.

### Checklist double-toggle (click propagation)
When a test clicks a "container" element that encloses a checklist option, click propagation
selects the option (container click lands on option → selected), then the explicit option
click immediately deselects it. The item ends up unselected at submit time.

**Symptom**: Validation error like "Please select at least one invoice" despite the test
clicking the invoice option. Error output alone does not reveal the double-toggle.

**Diagnostic tool sequence**: `Logpoint` on the selection state array (e.g.,
`selectedInvoiceIds`) to see toggle-on / toggle-off sequence within milliseconds of each
other. `PlaywrightSteps` to confirm the click sequence.

**Fix**: Skip clicking the container; click the option element directly. Ensure the test
locator targets the specific checkbox/option, not a wrapping container.

*Example*: In DailyReconciliationView and PaymentListTable, clicking the
`payment-invoice-select` container propagated to the invoice option (selecting it), then
the explicit invoice option click deselected it.

### Sort race-condition → client-side useMemo

When sort tests fail with wrong ordering after clicking column headers, the root cause is
typically nested `setState` in `handleSort` causing stale closures, combined with concurrent
API requests overwriting locally-sorted results.

**Symptom**: After clicking a column header to sort, the sort indicator shows the correct
direction but the data is in the wrong order. Or the data briefly appears sorted, then
reverts to the original order.

**Diagnosis**: Error output shows expected sort order vs actual order. Check the component's
`handleSort` function for patterns like:
- `setState(sortField)` followed by a re-fetch that overwrites the sorted data
- Multiple `useEffect` hooks that trigger concurrent API calls on sort state change
- No Replay needed — code inspection suffices.

**Fix**: Replace async sort-then-refetch with client-side sorting via `useMemo`:
```ts
const sortedData = useMemo(() => {
  if (!sortField) return data;
  return [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    return sortDirection === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}, [data, sortField, sortDirection]);
```

This pattern resolved sort failures across multiple pages in one session (Orders, MenuItems,
Clients). When found in one page, proactively check all other list pages for the same pattern.

### Dual-useEffect race → consolidated effect

When filter or search tests fail with stale results, the root cause is often two separate
`useEffect` hooks dispatching overlapping API fetches.

**Symptom**: After applying a filter, the results briefly show filtered data then revert to
unfiltered data. Or the filter appears to have no effect.

**Diagnosis**: Check the component for two `useEffect` hooks that both trigger API calls when
filter state changes — one for the filter and one for the general data load. The unfiltered
fetch's response arrives after the filtered one and overwrites it.

**Fix**: Consolidate the two effects into a single `useEffect` that includes all filter/search
parameters in its dependency array:
```ts
useEffect(() => {
  const params = new URLSearchParams();
  if (statusFilter) params.set('status', statusFilter);
  if (searchQuery) params.set('search', searchQuery);
  fetchData(`/api/items?${params}`);
}, [statusFilter, searchQuery]);
```

This prevents overlapping fetches from separate effects racing against each other.

### Date.now() or shared identifiers across workers
When parallel Playwright workers share a module-level `Date.now()` value for generating
unique IDs (like test emails), all workers get the same value, causing collisions.

**Fix**: Generate unique values inside `beforeAll`/`beforeEach` using `Math.random()` or
worker-specific identifiers.

*Example*: Parallel workers tried to sign up with the same email (Date.now() evaluated
at module load). Fixed with per-worker random emails.
