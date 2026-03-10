# Debugging Network and API Issues with Replay

When tests fail due to wrong data, missing records, or API errors, Replay lets you inspect
the exact network requests and responses that occurred during the test run.

## Tool Sequence

1. **`NetworkRequest`** — List all network requests or filter by URL pattern. Check:
   - Did the expected API call happen?
   - What status code was returned?
   - What was the response body?
   - Were there unexpected duplicate requests?

2. **`ConsoleMessages`** — Check for logged errors from failed fetch calls.

3. **`Logpoint`** — Place logpoints on API handler code (Netlify functions) or frontend
   fetch calls to inspect request/response data at runtime. Useful for seeing:
   - What parameters were sent to the API
   - What the database query returned
   - How the response was transformed before reaching the UI

4. **`SearchSources`** — Check hit counts on API handler lines. If a handler was called
   0 times, the request never reached it (routing issue). If called more times than expected,
   something is triggering duplicate requests.

5. **`ReadSource`** — Read the actual source code of API handlers to verify the logic.

## Data-Flow Tracing with Logpoint + SearchSources

When the UI renders but displays wrong values (wrong names, incorrect counts, stale data),
use this sequence to trace data from API response through state management to component props:

1. **`SearchSources`** — Search for the API handler or fetch call. Check hit counts to
   confirm the code executed.
2. **`Logpoint`** — Place logpoints on the API response handler to see the exact data
   returned. Then place logpoints on state update dispatches and component render functions
   to trace how the data flowed through the app.
3. **`NetworkRequest`** — Verify the raw API response matches what the logpoints showed.
   Discrepancies indicate a transformation bug between fetch and state update.

This is especially useful for seed data mismatches where tests expect specific values
(e.g., assignee names) that don't exist in the database.

*Example*: "Action menu Edit opens task edit dialog" failed because tests expected
fictional assignee names. SearchSources → Logpoint → NetworkRequest traced the mismatch
from API response through to component rendering.

## Network Request Comparison for Repeated Actions

When a test fails on a repeated action (e.g., sign-in after sign-out, second form submission),
use `NetworkRequest` to compare the request payloads of the first (successful) and second
(failed) attempts. State mutation bugs often manifest as incorrect payloads in subsequent
requests — for example, a mode toggle not resetting causes the second request to send the
wrong action type.

**Tool sequence**: `PlaywrightSteps` → `NetworkRequest` (inspect both requests)

*Example*: Sign In form test failed after sign-out. `NetworkRequest` comparison revealed the
second auth call sent `action: "signup"` instead of `action: "signin"` — a state reset bug
where `isSignUp` wasn't cleared on mode switch.

## NetworkRequest-First Pattern

For any test failure involving data assertions (wrong values, missing records, unexpected counts),
**check the API response first** via `NetworkRequest` before any other debugging. This is the
single most productive debugging step — it immediately narrows root cause to backend vs frontend:

1. **`PlaywrightSteps`** — Identify the failing step.
2. **`NetworkRequest`** — Inspect the API response for that step's data source.
   - If the API returned wrong data → backend bug (fix the handler or query).
   - If the API returned correct data → frontend bug (fix rendering or state management).

This two-step sequence (`PlaywrightSteps → NetworkRequest`) resolved 10+ failures in observed
debugging sessions.

## Date Format Debugging

ISO date string mismatches (timestamps vs `YYYY-MM-DD`) are a recurring backend-bug pattern.
When date-related assertions fail, check this sequence:

1. **`NetworkRequest`** — Inspect the API response. Does it return ISO timestamps
   (e.g., `2026-01-15T00:00:00.000Z`) or date strings (`2026-01-15`)?
2. **Check component parsing** — Does the frontend correctly parse the format returned by
   the API? Common bug: component expects `YYYY-MM-DD` but API returns full ISO timestamp.
3. **Check date inputs** — Forms with `<input type="date">` require `YYYY-MM-DD` format.
   If the API returns timestamps, the component must strip the time portion before setting
   the input value.

**formatDate ISO timestamp pattern**: When `formatDate` or similar utility functions receive
ISO timestamps (e.g., `2026-03-10T00:00:00.000Z`) but expect `YYYY-MM-DD`, they produce
"Invalid Date" or wrong output. The fix is to strip the time component with `.split('T')[0]`
before formatting. This bug recurred across 6+ components in one session — when found in one
component, proactively fix all `formatDate` call sites.

*Example*: 6 failures in a single log shared the same ISO-date-parsing root cause — the API
returned timestamps but components expected date strings.

### Check API response codes for timeout-waiting-for-data failures
When a test times out waiting for data that never appears (empty lists, missing records, no
dropdown options), **inspect the network response first** before debugging the frontend. In
observed sessions, 3 of 4 genuinely-Replay-necessary failures were backend routing bugs where
the API returned HTML instead of JSON or a 405 Method Not Allowed instead of the expected data.
The test output only showed a generic timeout — Replay `NetworkRequest` revealed the actual
routing issue.

**Tool sequence**: `NetworkRequest` (filter by the API URL) → check status code and content type.
- If the response is HTML instead of JSON → missing Netlify redirect or wrong route
- If the response is 405 → the HTTP method handler is missing in the backend function
- If the response is 404 → the endpoint path doesn't match the redirect rule

### URL segment index off-by-one in Netlify functions
Netlify functions parse URL segments to extract resource IDs (e.g., `segments[2]` for
`/api/resources/:id`). A recurring bug is using the wrong segment index — e.g., `segments[3]`
instead of `segments[2]` — which causes the function to read `undefined` as the ID and return
405 or wrong results. This exact bug appeared in 3 separate backend functions (categories.ts,
preventive-schedules.ts, staff.ts) in one session.

**Diagnosis with Replay**: `NetworkRequest` shows PUT/DELETE requests returning 405 Method Not
Allowed. The request URL is correct, but the function can't parse the ID from the URL.

**Fix**: Check the URL segment parsing in the Netlify function. Count segments from index 0:
for a URL like `/.netlify/functions/resource/123`, the segments after splitting on `/` depend
on whether there's a redirect. Always verify by logging `segments` or checking the actual URL
the function receives.

## Common Root Causes (from observed failures)

### Auth request payload mismatch
An auth-related test fails because the frontend sends the wrong action type or missing fields
in the request payload (e.g., `action: "signup"` instead of `"signin"`). The backend returns
an error like 409 Conflict or 400 Bad Request, but the test output may only show a timeout
or generic failure.

**Diagnosis with Replay**: `PlaywrightSteps` identifies the slow or failing step.
`NetworkRequest` reveals the exact request payload and response body — e.g., a 409 Conflict
with "Email already in use" because the request sent `action: "signup"` instead of `"signin"`.
This pinpoints the bug to UI state management (e.g., `isSignUp` not resetting on mode switch).

**Fix**: Trace the action type from UI state through to the request payload and fix the state
management bug. Common causes: toggle state not resetting, form reusing stale state from a
previous interaction.

*Example*: Sign In form test failed. NetworkRequest revealed a 409 "Email already in use"
because the frontend sent `action: "signup"` instead of `"signin"`.

### State hydration gap (action succeeds but UI doesn't update)
An action completes successfully (data visible in localStorage or network response) but the
UI doesn't reflect the change. The component still shows stale state because the state
management layer wasn't hydrated.

**Diagnosis with Replay**: `PlaywrightSteps` shows the action completed. `NetworkRequest`
or `LocalStorage` confirms the data was stored correctly. `ReactRenders` / `DescribeReactRender`
shows the component didn't re-render, or rendered with stale props.

**Debugging checklist**:
1. Redux store dispatch — was the action dispatched after the successful operation?
2. localStorage → Redux hydration — does the app load persisted state on mount/navigation?
3. Component re-render triggers — is the component subscribed to the relevant store slice?

**Fix**: Ensure the state management layer (Redux, Context, etc.) is hydrated from persistent
storage on app startup and that successful operations dispatch the appropriate state updates.

*Example*: Auto-login test. Token was stored in localStorage but sidebar didn't update.
Fix: added `loadSession` on app startup and `setSession` Redux action dispatched from
ConfirmEmailPage.

### Missing database columns (schema migration)
`CREATE TABLE IF NOT EXISTS` doesn't modify existing tables. When new columns are added to
the schema definition, existing ephemeral branches don't get them.

**Diagnosis with Replay**: NetworkRequest shows API returning 500. ConsoleMessages or test
output shows `NeonDbError: column "X" does not exist`.

**Fix**: Add `ALTER TABLE ADD COLUMN IF NOT EXISTS` migration statements.

*Example*: "column owner_id does not exist". Fixed by adding a `runMigrations` function
with ALTER TABLE statements.

### Missing environment variables on deployment
Netlify functions return errors because DATABASE_URL or other env vars aren't configured
on the Netlify site.

**Diagnosis with Replay**: NetworkRequest shows function endpoints returning 500 or error
JSON. ConsoleMessages shows connection/auth errors.

**Fix**: Set env vars via `netlify env:set` or the Netlify dashboard.

*Example*: Deployment test failed because Netlify functions lacked DATABASE_URL.

### Database authentication errors
A stale or rotated database password causes all API calls to fail with authentication errors.

**Diagnosis with Replay**: NetworkRequest shows all data-fetching endpoints returning errors.

**Fix**: Update the database connection string with the current password.

### Import dialog closing before results display
A component calls `onImported()` (which closes a dialog) before the import results are
available to display. The dialog unmounts, losing the results.

**Diagnosis with Replay**: NetworkRequest shows the import API call succeeding. SearchSources
shows the results rendering code has 0 hits (component unmounted before it could render).

**Fix**: Delay calling `onImported()` until after results are displayed, or keep the dialog
open until the user dismisses it.

*Example*: Import dialog test. Replay showed the API succeeded but `onImported()` closed
the dialog before results rendered.

### Database CHECK constraint violation
A form sends a value that violates a database CHECK constraint (e.g., status `'active'` when
the column only allows `'open'`, `'won'`, `'lost'`). The API returns 500 but the error
message may not clearly indicate which value is invalid.

**Diagnosis with Replay**: NetworkRequest shows the POST/PUT returning 500. Logpoint on the
handler reveals the exact constraint error (e.g., `new row violates check constraint`).
ReadSource on the handler confirms which values are sent.

**Fix**: Update the form/component to send only values that match the database enum.

*Example*: CreateDealModal sent `'on_track'` as status but DB only accepted
`'open'`/`'won'`/`'lost'`. 10 Replay tools used to trace.

### FK constraint silent failures
A DELETE request returns 500 due to a foreign key constraint violation, but the test only
sees a timeout waiting for the empty state (no visible error in the UI).

**Diagnosis with Replay**: `PlaywrightSteps` shows the test stuck waiting for elements to
disappear after a delete action. `NetworkRequest` reveals the DELETE endpoint returned 500
with a foreign key constraint error (e.g., `violates foreign key constraint`).

**Fix**: Either add `ON DELETE CASCADE` to the foreign key constraint, or update the backend
to delete dependent records before the parent record. Alternatively, update the test to clean
up dependent records first.

*Example*: Customer/service delete tests timed out waiting for empty state. NetworkRequest
showed 500 errors from FK constraint violations on dependent order records.

### PostgreSQL NUMERIC string coercion
PostgreSQL returns `NUMERIC` and `DECIMAL` columns as strings in JavaScript (via the
`@neondatabase/serverless` driver). Calling number methods like `.toFixed()` on these values
throws `X.toFixed is not a function`.

**Diagnosis with Replay**: `ConsoleMessages` shows `price.toFixed is not a function` or
similar. `NetworkRequest` confirms the API returns the value as a string (e.g., `"49.99"`
instead of `49.99`).

**Fix**: Wrap NUMERIC column values with `Number()` or `parseFloat()` before calling number
methods. Apply the conversion in the API handler or the component that consumes the data.

*Example*: Service list crashed with `price.toFixed is not a function` because the PostgreSQL
NUMERIC `price` column was returned as a string.

### Redux SerializedError not an Error instance
Redux Toolkit's `createAsyncThunk` rejects with `SerializedError` objects, not `Error` instances.
Code that uses `instanceof Error` checks or `String(err)` to extract error messages will get
`[object Object]` instead of the actual message.

**Diagnosis**: UI displays `[object Object]` where an error message should appear. Error output
from tests shows the literal string `[object Object]` in assertions.

**Fix**: Extract `.message` from the error object explicitly rather than relying on
`instanceof Error` or string coercion:
```ts
} catch (err: unknown) {
  const message = (err as { message?: string }).message ?? 'Unknown error';
  setError(message);
}
```

This applies to any Redux `unwrapResult()` or `.unwrap()` rejection handler.

### Stale dev server with wrong database configuration
When `reuseExistingServer` in Playwright config reuses a dev server from a previous run,
all API calls may fail with connection or database errors if the server's state is stale.

**Diagnosis with Replay**: NetworkRequest shows no API calls or all returning errors.

**Fix**: Kill the stale dev server and let Playwright start a fresh one. Set
`reuseExistingServer: false` or add cleanup logic. The test script kills stale processes
before each run.
