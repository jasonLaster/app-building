# Test Failures Report: sales-crm-3-review-3

**Generated:** 2026-02-24
**Branch:** sales-crm-3-review-3
**Scope:** Full build pipeline for SalesCRM app — project setup, test spec planning, component implementation, Playwright test writing, test fixing, deployment, directive compliance checks, and bug review.

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 88 |
| Logs with test failures | 3 |
| Logs without test failures | 85 |
| Total distinct test failures | 10 |
| Pre-existing failures | 1 |
| New failures | 9 |
| Replay usage rate | 40% (4/10) |
| Debugging success rate (non-pre-existing) | 100% (9/9 successful) |
| Replay-assisted success rate | 100% (4/4 successful) |
| Recording availability rate | 90% (9/10) |
| Total test re-runs across all logs | 10 |

**Breakdown by category:**

| Category | Count |
|----------|-------|
| timeout | 7 |
| backend-bug | 2 |
| infrastructure | 1 |

## 2. Failure Table

| Log | Test | Category | Pre-existing | Replay Used | Recording Available | Strategy | Tools | Success | Changeset |
|-----|------|----------|--------------|-------------|---------------------|----------|-------|---------|-----------|
| 23T23-21-34 | Sidebar displays all navigation links with icons | timeout | no | yes | yes | PlaywrightSteps to find stuck step, Screenshot/InspectElement to verify DOM, DescribeComponent for render timing | PlaywrightSteps, Screenshot, ReactComponents, NetworkRequest, InspectElement, DescribeComponent, DescribePoint | yes | none |
| 23T23-21-34 | Clicking Clients link navigates to /clients | timeout | no | yes | yes | Same investigation as nav links — recording used for all 6 nav failures | PlaywrightSteps, Screenshot, ReactComponents, NetworkRequest, InspectElement, DescribeComponent, DescribePoint | yes | none |
| 23T23-21-34 | Clicking Contacts link navigates to /contacts | timeout | no | no | yes | Diagnosed from same root cause as Clients link failure | — | yes | none |
| 23T23-21-34 | Clicking Deals link navigates to /deals | timeout | no | no | yes | Diagnosed from same root cause | — | yes | none |
| 23T23-21-34 | Clicking Tasks link navigates to /tasks | timeout | no | no | yes | Diagnosed from same root cause | — | yes | none |
| 23T23-21-34 | Clicking Team link navigates to /users | timeout | no | no | yes | Diagnosed from same root cause | — | yes | none |
| 23T23-21-34 | Sign In form submits with email and password | backend-bug | no | yes | yes | PlaywrightSteps for slow steps, NetworkRequest for 409 Conflict, ReactRenders for re-render timing, Screenshot for visual state | PlaywrightSteps, NetworkRequest, ReactRenders, DescribeReactRender, Screenshot, InspectElement | yes | none |
| 23T23-21-34 | Logged in state shows avatar, name, and sign-out | timeout | no | no | yes | Diagnosed from error output — same timeout pattern; fixed by increasing assertion timeouts | — | yes | none |
| 23T23-30-52 | Deployment functional test: app loads and supports auth operations | infrastructure | no | no | no | Diagnosed from error output — sign-up returned "Network error" indicating DATABASE_URL not set on Netlify | — | yes | none |
| 24T01-51-45 | Auto-login after successful confirmation stores auth token | backend-bug | yes | yes | yes | PlaywrightSteps to see test execution flow, then code inspection to trace auth state from localStorage through Redux | PlaywrightSteps | yes | none |

## 3. Patterns

### When Replay was most effective

- **Backend-bug diagnosis:** Replay was decisive for the Sign In form failure. NetworkRequest revealed a 409 Conflict response with "Email already in use", pinpointing that the frontend sent `action: "signup"` instead of `"signin"`. Without Replay, this would have required significant trial-and-error debugging since the error was in request payload construction, not obvious from test output.

- **State management bugs:** For the Auto-login confirmation failure, PlaywrightSteps showed the token was correctly stored in localStorage but the sidebar didn't update, revealing the Redux store wasn't being hydrated from localStorage on navigation. This led to the fix of adding a `loadSession` call on app startup and a `setSession` Redux action.

- **Render timing analysis:** For timeout failures, DescribeComponent showed that SettingsPage rendered at 25.7s — close to the 30s timeout — confirming Replay browser overhead as the root cause rather than a code bug.

- **Most effective tool sequences:**
  1. `PlaywrightSteps` → `NetworkRequest` — for API-related failures (identified malformed request payloads)
  2. `PlaywrightSteps` → `Screenshot` → `DescribeComponent` — for timeout failures (confirmed elements existed but loaded slowly)
  3. `PlaywrightSteps` alone — sufficient for state management bugs when the execution flow revealed the gap

### When Replay was NOT used and why

- **Batch diagnosis from shared root cause (4 failures):** Once the first two timeout failures were diagnosed via Replay as Replay browser overhead, the remaining 4 navigation link failures were immediately attributed to the same cause without needing individual Replay analysis. This was efficient and correct.

- **Diagnosed from error output (2 failures):** The "Logged in state" timeout and the deployment infrastructure failure were both diagnosable from Playwright's error messages alone. The deployment failure showed "Network error" which directly pointed to a missing environment variable.

### Common debugging strategies that worked

1. **Increase timeouts for Replay browser:** 7 of 10 failures were timeouts caused by Replay browser overhead. The fix was increasing `actionTimeout`, `navigationTimeout`, and assertion timeouts in playwright.config.ts. This is an expected pattern when using Replay Chromium.

2. **Trace state through the full pipeline:** For the auth bug, following the data from UI action → request payload → backend response → error revealed the exact point of failure (isSignUp state not being reset).

3. **Fix infrastructure before debugging code:** The deployment failure was correctly identified as a missing env var rather than a code bug, avoiding wasted debugging effort.

### Common debugging strategies that failed

- No debugging strategies explicitly failed in this build cycle. All 10 failures were resolved successfully. However, the auto-login fix required 3 test runs because the first fix attempt (only adding `loadSession` to App.tsx) was incomplete — the agent needed to also add the `setSession` Redux action and dispatch it from ConfirmEmailPage.

### Recurring failure categories

- **Timeout (70%):** Dominated by Replay browser overhead. All 7 timeout failures had the same root cause — insufficient timeouts for the Replay Chromium browser which adds instrumentation overhead. This is a systemic issue that could be prevented by setting higher default timeouts in test configuration from the start.

- **Backend-bug (20%):** Both backend bugs involved auth state management — one was a UI state (`isSignUp`) not being reset on mode switch, the other was Redux store not being hydrated from localStorage. Both point to state synchronization gaps in the auth flow.

- **Infrastructure (10%):** Single deployment failure from a missing DATABASE_URL environment variable on Netlify.

## 4. Recommendations

### `skills/debugging/*.md`

- **Add "Replay browser timeout" as a known pattern:** When multiple tests fail with timeouts in the first test run, and the app is a fresh build, the most likely cause is insufficient timeouts for Replay Chromium. Recommended fix: increase `actionTimeout` to 15s+, `navigationTimeout` to 30s+, and use `expect.toBeVisible({ timeout: 10000 })` for post-navigation assertions.

- **Add "NetworkRequest for auth debugging" pattern:** When auth-related tests fail, use `PlaywrightSteps` → `NetworkRequest` to inspect the exact request payloads and response bodies. Auth bugs frequently involve mismatched action types or missing fields in request bodies.

- **Add "State hydration" debugging checklist:** For failures where an action succeeds (data in localStorage/network) but UI doesn't update, check: (1) Redux store dispatch, (2) localStorage → Redux hydration on mount, (3) component re-render triggers.

### `skills/tasks/build/testing.md`

- **Set Replay-aware timeouts from the start:** The playwright.config.ts template should include `actionTimeout: 15000`, `navigationTimeout: 30000`, and a note about Replay browser overhead. This would have prevented 7 of 10 failures (70%).

- **Include `--functions` flag in webServer command:** Ensure the Playwright webServer command always includes `--functions ./netlify/functions` when using Netlify Functions to avoid function resolution failures.

- **Pre-validate deployment environment variables:** Before running deployment tests, verify that required environment variables (DATABASE_URL, etc.) are set on the deployment target. This prevents infrastructure failures that waste a test cycle.

### `skills/review/reportTestFailures.md`

- **Add "Test Re-runs per Log" to per-log analysis template:** The current template captures failure count but not how many test runs were needed to achieve all-pass. Adding a `TEST_RERUNS: <count>` field would make re-run statistics more precise in the synthesis.

- **Add "Root Cause Cluster" field:** When multiple failures share a single root cause (like the 7 timeout failures here), a cluster field would reduce redundancy in the failure table and make patterns more visible. Example: `ROOT_CAUSE_CLUSTER: replay-browser-timeout` applied to all 7 timeout failures.

- **Clarify "Changeset" field semantics:** All 10 failures had `CHANGESET_REVISION: none` despite fixes being applied. The field description references a "CHANGESET REVISION:" line in the log, but fixes applied during the same test-fixing session don't produce separate changesets. Consider whether this field should capture the commit that fixed the issue instead.
