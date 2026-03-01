# Bug: Clear completed removes all completed todos

## Step 1: Evidence

Evidence the app is broken: None found. The DELETE /todos/completed API endpoint works correctly. The clearCompleted Redux thunk correctly dispatches and the reducer properly filters out completed items on fulfillment.

Evidence the test is broken: None found. The test logic is correct: create 4 todos (A, B active; C, D completed), click clear-completed, assert 2 items remain.

The real issue is a timeout: Replay analysis (recording c854eb71-8894-463b-8854-fb1624bed4a2) shows the test setup consumes ~105s of the 120s test timeout. Each Neon serverless API call takes 5-10s due to cold connections. The test requires 8 API calls (2 DELETEs in beforeEach, 4 POSTs, 2 PUTs) for data setup. By the time the clear-completed button is clicked at 105s, only 15s remain. The DELETE request to /todos/completed gets no response before the 120s timeout expires.

## Step 2: Determination

Which is broken: TEST (timeout too tight for infrastructure overhead)

## Step 3: Root Cause

The Playwright test timeout of 120s is insufficient for this test when using Replay Chromium (2-3x slower than standard Chromium) combined with Neon serverless database connections (5-10s per cold connection). The test creates the most data of any filter test (4 todos with 2 completed requiring PUT calls), pushing total API time to ~80s. Combined with page navigation (~25s), the test runs out of time before the final assertion. Fix: increase the global test timeout from 120s to 180s in playwright.config.ts.
