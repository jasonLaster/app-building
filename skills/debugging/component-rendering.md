# Debugging Component Rendering Failures with Replay

When tests fail because expected elements don't appear on the page, the issue may be that
components aren't mounting at all, or are rendering in an unexpected state. Replay lets you
see exactly what rendered and why.

## Tool Sequence

1. **`Screenshot`** — First check: is anything rendering? An empty page (blank `#root` div)
   means the React app didn't mount at all. A partially rendered page means a specific
   component failed.

2. **`ConsoleMessages`** — Check for JavaScript errors that prevented rendering. Common:
   - Module import errors (wrong path, missing dependency)
   - Runtime exceptions in component constructors or render methods
   - Missing environment variables

3. **`ReactComponents`** — List the React component tree at a specific point. If the expected
   component is missing from the tree, its parent either didn't render it or conditionally
   excluded it.

4. **`NetworkRequest`** — If components depend on API data to render, check whether the API
   calls succeeded. Components often render empty when their data-fetching call fails silently
   (a catch block swallows the error and leaves state as `[]`).

5. **`UncaughtException`** — Check for unhandled exceptions that might have crashed the
   React error boundary.

6. **`InspectElement`** — Inspect specific DOM elements to check their attributes, classes,
   and computed styles.

## Common Root Causes (from observed failures)

### SPA redirect intercepting module requests
A `netlify.toml` SPA redirect rule (`/* /index.html 200`) was intercepting Vite's module
requests during development, returning HTML instead of JavaScript. This caused the React app
to never mount.

**Diagnosis with Replay**: Screenshot showed empty `#root`. NetworkRequests showed `.js`
module requests returning `text/html` content. ReactComponents showed no components mounted.

**Fix**: Configure the dev server or redirect rules to exclude `/.netlify/` and module paths.

*Example*: All 22 tests failed. Screenshots showed blank page. Network analysis revealed
the SPA redirect was serving HTML for JS modules.

### Missing environment variables preventing API responses
An API endpoint (e.g., auth signup) doesn't return expected data because a required env var
(like `IS_TEST=true` for auto-confirm) isn't set in the test environment.

**Diagnosis with Replay**: Logpoints on the API handler showed the token was not being
returned. Tracing the conditional revealed `IS_TEST` was undefined.

**Fix**: Add the env var to the Playwright process configuration.

*Example*: Auth tests failed because signup returned no token. Logpoints on the auth
handler revealed IS_TEST was not set.

### Silent API errors leaving state empty
A component fetches data in `useEffect`, but the API call fails and the catch block swallows
the error, leaving state as the initial empty array. The component renders but shows no data.

**Diagnosis with Replay**: NetworkRequest shows the API call failing (500, timeout, or CORS
error). ConsoleMessages may show nothing if the error is caught silently.

**Fix**: Either fix the API endpoint, or add error handling that surfaces the problem.

*Example*: Webhook event checkboxes didn't render because `availableEvents` stayed empty
when the API call failed silently in a catch block.
