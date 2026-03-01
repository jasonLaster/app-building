# Bug: Empty state message when no todos exist

## Step 1: Evidence

Evidence the app is broken: None found

Evidence the test is broken: The test uses `{ timeout: 10000 }` for the `empty-state` assertion after `page.reload()`, while all other post-reload visibility assertions in the test suite use `{ timeout: 30000 }`. With Replay Chromium's 2-3x instrumentation overhead, the page reload + API fetch cycle can exceed 10s. The test fails intermittently — passing on some runs, failing on others — which is characteristic of a timeout that is too tight rather than a logic error.

## Step 2: Determination

Which is broken: TEST

## Step 3: Root Cause

The `toBeVisible({ timeout: 10000 })` assertion in `e2e/todolist.spec.ts:34` uses a 10s timeout after `page.reload()`. After reload, the app must:
1. Load all JavaScript bundles
2. Mount the React app
3. Dispatch `fetchTodos()` (which sets `loading=true`, hiding the empty state)
4. Wait for the API response (empty array)
5. Set `loading=false` and render the empty state

With Replay Chromium's instrumentation overhead, this sequence intermittently exceeds 10s. All other tests in the suite that check visibility after reload use `{ timeout: 30000 }` (e.g., `await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 })`). The fix is to increase the timeout to 30000ms to match the established pattern.
