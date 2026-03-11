# Skill

You are writing playwright tests which check that all the different entries in docs/tests.md are satisfied by the app.

## Unpack Subtasks

Unpack the initial write tests task into subtasks using `add-task`. Add ALL page tasks in a
single `add-task` call, with one task per page containing all test entries for that page.
Write out every task explicitly — do not use a loop or script:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/build/writeTests.md", "app": "<AppName>", "subtasks": [
    "WriteTest<TestEntry1>: Write test for <TestEntry1>",
    "WriteTest<TestEntry2>: Write test for <TestEntry2>"
  ]},
  { "skill": "skills/tasks/build/writeTests.md", "app": "<AppName>", "subtasks": [
    "WriteTest<TestEntry3>: Write test for <TestEntry3>"
  ]}
]
EOF
```

## Guidelines

- For a given test entry, write a playwright test which matches the entry's requirements and verifies that the app will behave as the user expects.
- Do not run the playwright tests, but make sure that the test should pass and update the app code if necessary.
- The title of the playwright test must match the title of the test entry.
- If you discover parts of the app that haven't been fully implemented, you must finish implementation of the app.
- Playwright tests and app components/pages must use data-testid to identify elements on the page.

## Directives

- Tests must verify navigation targets precisely — assert the URL or page content after a click, not just that a click handler exists. A link going to the wrong page is a common bug that only surfaces if the test checks where it actually lands.

- When a test spec entry implies a component is available across multiple pages (e.g., a sequential navigation flow that clicks sidebar links after navigating away from the starting page), tests must interact with that component on each page it should appear on. Never use `page.goto()` to navigate back to a known page as a workaround for a missing component — this masks the bug instead of catching it. If the spec says "click X in the sidebar" after navigating to a different page, the test must click the sidebar on that page, not reload the original page first.

- For actions that produce side effects (e.g. history entries, timeline updates), write assertions that verify both the primary effect and the side effect. Also assert the side effect happens exactly once — duplicate entries from redundant API calls are a common bug.

- Avoid using `getByText()` or `filter({ hasText })` with common words that may appear as substrings
  in other elements (labels, options, buttons). Both Playwright's `getByText` and `filter({ hasText })`
  use case-insensitive substring matching by default — e.g., `hasText: 'Male'` also matches "Female".
  Prefer `getByTestId` for precise element targeting, or use `getByRole`/`getByLabel` with exact matching.
  When using `filter({ hasText })`, pass a regex with anchors (e.g., `{ hasText: /^Male$/ }`) for exact matching
  ONLY on leaf elements that contain just the target text. On composite elements (cards, rows, list items)
  whose `textContent` includes text from multiple children (name, category, status, etc.), anchored regex
  will fail because it matches against the full concatenated text. For composite elements, use
  `filter({ has: page.locator('[data-testid="child-element"]', { hasText: /^exact text$/ }) })` to target
  a specific child element instead.
  A `strict mode violation: getByText(...) resolved to N elements` error means the selector is ambiguous —
  never work around it with `.first()`, instead use a more specific selector like `getByTestId` or
  `getByRole` with `{ exact: true }`.

- All `data-testid` values used across all test files for the same component must be consistent. Before
  writing cross-cutting tests that reference components tested in other spec files, read the existing
  spec files to use the same testid values.

- When the test spec entry describes file upload functionality (e.g., "file picker opens", "select a
  file to upload"), the test must exercise actual file upload mechanics (e.g., Playwright's
  `setInputFiles` on a file input). Do not substitute a URL/text input test for a file upload test —
  this masks missing upload functionality in the app.

- NEVER put Playwright locator calls with auto-wait semantics (e.g. `count()`, `textContent()`,
  `isVisible()`) inside a `.toPass()` retry block in a way that iterates over dynamic elements.
  If the DOM changes mid-iteration, an inner locator call will auto-wait for an element that no
  longer exists, and `.toPass()` cannot interrupt that inner wait to retry the block — the test
  deadlocks. Instead, use a single atomic Playwright assertion that has built-in retry:

  BAD — nested waits deadlock when DOM changes mid-loop:
  ```ts
  await expect(async () => {
    const cards = page.locator('[data-testid^="card-"]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent(); // hangs if DOM shrinks
      if (text?.includes(name)) found = true;
    }
    expect(found).toBeFalsy();
  }).toPass({ timeout: 15000 });
  ```

  GOOD — single atomic assertion with built-in retry, no nested waits:
  ```ts
  await expect(
    page.locator('[data-testid^="card-"]').filter({ hasText: name })
  ).toHaveCount(0, { timeout: 15000 });
  ```

  The same principle applies to any `.toPass()` block: keep the body free of Playwright auto-waiting
  calls that can block indefinitely. Use locator chaining (`.filter()`, `.locator()`) and
  single-assertion expect matchers (`.toHaveCount()`, `.toContainText()`, `.toBeVisible()`) instead.

- Do not add unnecessary state cleanup (e.g., `localStorage.removeItem`, `page.reload()`) in
  `beforeEach` hooks when Playwright already provides a fresh browser context per test. Redundant
  cleanup wastes time and can cause tests to exceed their timeout under recording or CI overhead.

- For assertions that depend on backend round-trips (auth flows, database writes, API calls),
  use generous timeouts (e.g., `{ timeout: 30000 }`) rather than tight ones. Environments with
  recording overhead (Replay browser) add significant latency beyond typical local development.
  A tight timeout that barely passes locally will flake under load or recording.

- For tests that chain multiple user flows in a single test (e.g., signup → signout → signin →
  verify), add `test.slow()` at the top of the test to triple the default timeout. Multi-step
  end-to-end flows easily exceed the default 60s timeout under recording and CI environments.

- Skill files are at `/repo/skills/tasks/` and its subdirectories (the repo root), NOT inside
  the app directory. Always use `/repo/skills/tasks/build/writeTests.md`, etc.

- For deployment tests (tests run against a live deployed site rather than a local dev server):
  - Always use `data-testid` values that match the actual component markup. Read the component
    source to verify testid values before writing the test — do not guess.
  - Handle empty-state scenarios gracefully. A freshly deployed app may have no data, so tests
    must not assume specific records exist. Check for empty-state UI (e.g., "No items" messages)
    or create test data before asserting on table/list contents.
  - Use generous timeouts (e.g., `{ timeout: 10000 }`) for element assertions. First-load
    performance on a cold deploy is slower than local development.
  - Verify that API endpoints are healthy before running deployment tests. See
    `skills/scripts/deploy-verification.md`.

- **Avoid `.or()` locator patterns that can match multiple elements.** Playwright's `.or()` combinator
  creates a locator that matches elements from either branch. When both branches resolve to elements on
  the page, the combined locator matches multiple elements and causes strict-mode violations. For example,
  `page.getByRole('button', { name: 'Save' }).or(page.getByTestId('save-btn'))` will fail if both
  a button named "Save" and an element with testid `save-btn` exist (or are the same element matched
  differently). Prefer a single, specific locator (`getByTestId` or `getByRole` with exact matching)
  over `.or()` fallback chains.

- When using CSS attribute prefix selectors like `[data-testid^="prefix-"]` to count or collect
  elements, verify that the prefix does not also match child elements with longer testid values
  that share the same prefix. For example, `[data-testid^="group-"]` will match both `group-foo`
  and `group-header-foo`. Either use a more specific selector, add a `:not()` exclusion, or
  use exact `getByTestId` calls to target only the intended elements.

- When testing that an action adds or removes items from a list or table, assert relative changes
  (e.g., count increased by 1) rather than hardcoding absolute expected counts. Capture the initial
  count before the action and assert the new count equals `initialCount + 1` (or `- 1` for deletion).
  Absolute counts couple the test to seed data and break when prior tests or setup changes alter the
  starting state.

- Never hardcode time-dependent values (dates, timestamps) in test assertions. If a test spec
  says a field defaults to "today" or "now", the test must compute the expected value dynamically
  (e.g., `new Date().toISOString().split('T')[0]`) rather than hardcoding a specific date string.
  Hardcoded dates cause the test to fail on any day other than the one when the test was written.

- When asserting that a data field (e.g., totalPaid, balance) has been updated, verify it in
  the view that actually renders that field. Read the component source to confirm which fields
  are displayed in list/table views vs. detail views. A common bug is asserting on a table row
  that only shows a subset of fields (e.g., totalCharged) when the expected field (e.g., totalPaid)
  is only visible in the detail view.

- When a test spec entry describes editing or interacting with a specific field (e.g., "edit client
  field", "change value"), the test must exercise that exact field with corresponding actions and
  assertions. Do not write a test that only verifies a subset of the fields or operations mentioned
  in the spec entry — each described interaction must be tested. A common bug is implementing editing
  for some fields but not all; only per-field testing catches this.

- Apps with login/signup functionality must have a complete e2e test that exercises the full
  sign-up and sign-in flow against the real auth backend. The test must create a new account,
  verify the post-signup state (session established or confirmation required), then sign in
  with the new credentials and verify the authenticated state. This catches issues like email
  confirmation requirements, incorrect error handling, and session establishment failures that
  unit-level or mocked tests miss.

- When the spec says a value is automatically derived or auto-selected (e.g., "defaults to today",
  "auto-selects the current user"), the test must verify that the auto-selection works on its own —
  navigate to the page and assert the correct value is already selected without manually choosing it.
  If the test manually selects the value before asserting, it bypasses the auto-selection code path
  and will not catch bugs like format mismatches or incorrect comparisons.

- When a test spec entry says a value should be displayed in a specific format (e.g., a formatted
  date like "Mon, Mar 4", a currency like "$51.50"), the test must assert on the actual text content
  or input value of the element, not just that the element is visible or present. Checking only
  visibility will not catch rendering bugs where the value is malformed (e.g., "Invalid Date",
  "$NaN", "undefined"). Use `.toHaveText()` or `.toContainText()` for displayed text, and
  `.toHaveValue()` for input fields, with the expected formatted value or a regex pattern. For
  input fields that format values (e.g., monetary inputs formatting "130" as "130.00"), the
  assertion must match the formatted value exactly, not just the numeric portion.

- When a test file's describe block contains tests that perform destructive mid-test operations
  (e.g., deleting records via API requests during the test body) that would invalidate the
  preconditions of other tests in the same block, wrap those tests in `test.describe.serial`
  to guarantee sequential execution. With `fullyParallel: true` in the Playwright config,
  tests within a plain `test.describe` can run concurrently or in any order, so a destructive
  test may execute before or alongside tests that depend on the destroyed data.

- When multiple tests in the same describe block perform state-changing operations on database
  records (e.g., submitting a claim, changing a status), each test must operate on a distinct
  record ID. Never have two tests mutate the same record, even if they run sequentially —
  the second test's preconditions will be invalid because the first test already changed the
  record's state. Use different seed data records for each test that performs mutations.

- When a user action triggers a page navigation or data re-fetch (e.g., clicking a link that
  navigates to a new page, changing a date range filter, selecting a different category,
  submitting a search), or when a page loads data asynchronously on mount, the test must wait
  for the data to appear in the UI before making assertions. Do not assert on element counts
  or text content immediately after the action or page load — the DOM may still be in a
  loading state, show stale data, or display initial/default values (e.g., "0") before the
  API response arrives. In particular, never use `locator.count()` or `locator.textContent()`
  immediately to assert on dynamic content — these are snapshots that return instantly without
  waiting. Use auto-retrying assertions like `toHaveText()`, `toHaveCount()`, or
  `toContainText()` instead. For example, use `await expect(el).toHaveText('5')` rather than
  `const text = await el.textContent(); expect(Number(text)).toBe(5)`. Alternatively, use
  `expect(...).toPass()`, wait for a specific element to be visible, or wait for a loading
  indicator to disappear before asserting on the rendered data.

- When a test changes a selection (e.g., picks a different item from a dropdown) and then
  performs a dependent action (e.g., deletes a row, checks a summary), the test must assert
  that the selection is still the expected value before proceeding with the dependent action.
  Async effects (especially under React StrictMode double-mount) can reset selections after
  the user has changed them. If the test does not re-verify the selection, it may silently
  operate on the wrong data, passing when the app is actually broken.

- When asserting on URL query parameters in navigation tests, do not use `encodeURIComponent()`
  to build expected URL patterns. `encodeURIComponent` encodes spaces as `%20`, but apps that
  use `URLSearchParams` to construct query strings encode spaces as `+` (per the
  `application/x-www-form-urlencoded` spec). Instead, construct the expected URL using the same
  `URLSearchParams` API the app uses, or use a regex that accounts for both `+` and `%20` encoding.

- When a test involves changing a parent selection that triggers auto-fill of dependent fields
  (e.g., switching from Patient A to Patient B auto-fills the insurance dropdown), the test must
  verify that the dependent fields are correctly populated with the NEW parent's data before
  proceeding. Stale data from the previous selection can remain in the store while new data is
  being fetched, causing auto-fill to silently select outdated values. Assert the dependent
  field's value matches the new parent's expected data, not just that a value is present.

- Auth flows that involve email-based verification (email confirmation, password reset) must
  have dedicated tests that exercise the real production code path — not the IS_TEST bypass.
  These tests must run the backend without IS_TEST=true (or with IS_TEST=false) so that actual
  tokens are generated and stored. The test should call the signup/forgot-password endpoint,
  query the database directly for the generated token, then hit the confirmation/reset endpoint
  with that token and verify success. This ensures the full flow works end-to-end: token
  generation, storage, URL construction, and redemption. Other (non-auth-flow) tests may
  continue to use IS_TEST=true to bypass auth for convenience.

## Test Design and Database Isolation

Tests run serially (`--workers 1`) against a single `netlify dev` server backed by an ephemeral
Neon branch. The test script resets the database (truncate + re-seed) between each test.

### Test infrastructure

Do **not** use Playwright's `webServer` config to start the dev server. The test script manages
the `netlify dev` server lifecycle automatically.

### Database access in functions

All Netlify functions must use the shared `netlify/functions/db.ts` module (see writeApp.md
directives) rather than importing `@neondatabase/serverless` directly.

### Test design rules

- The database is reset between each test, so each test starts with a clean seed.
- Every test file that touches the database MUST rely on the test script's between-test DB
  reset (truncate + re-seed). If the test script's reset is insufficient for a specific
  scenario, add an explicit `beforeEach` hook that performs additional cleanup via API calls.
  Missing DB cleanup between tests is the #1 cause of test isolation failures and retries.
- Every test file that creates records (tasks, orders, customers, etc.) should include a
  `beforeEach` cleanup helper (e.g., `deleteAllTasks()`) that removes all records of the
  relevant type via API before each test. Add this from the start when writing tests — do
  not wait for data contamination failures to surface. This is a template requirement, not
  an optimization.
- Never hardcode database IDs in tests — including in cleanup and setup helpers. Query the
  UI or API to discover IDs for the records you need to interact with. Cleanup helpers that
  delete records must fetch ALL records of that type via the API and delete each one, rather
  than deleting a hardcoded list of known seed IDs. Hardcoded ID lists silently miss records
  created by prior tests, breaking data isolation.
- Each spec file must contain **20 or fewer** `test()` calls. When a page has more tests,
  split them across multiple spec files grouped by feature area (e.g., `status-page-containers.spec.ts`,
  `status-page-webhook.spec.ts`). Consolidate similar tests where possible before splitting.
- The Playwright config must use `fullyParallel: true`. Do not set `workers: 1`.
- The Playwright config must **not** include a `webServer` section — the worker fixture handles
  server lifecycle.
- The Playwright config must use `replayDevices['Replay Chromium']` from `@replayio/playwright`
  as the browser project, not standard `devices['Desktop Chrome']`. Tests must run under the
  Replay browser so that recordings are captured for debugging.
- Set the Playwright config's global `timeout` to at least 60000ms.
  The Replay browser has significant recording overhead, and with parallel workers all hitting
  their dev servers simultaneously, pages can take 25+ seconds to load. A 30s timeout that works
  locally with standard Chrome will cause widespread flakes under recording.

## Tips

- Before writing tests that interact with shared UI components (ConfirmDialog, modals, dropdowns),
  read the shared component first to get the exact `data-testid` values. Do not guess test IDs.
- When adding `data-testid` attributes to a set of components for a page, plan ALL testid additions
  upfront by reading all components first, then make edits in batches. This avoids repeated re-reads
  and sequential small edits to the same file.
- When writing tests for a detail page, read: (1) the Netlify function for the entity, (2) the page
  component, (3) 2-3 representative section components. Do not exhaustively read every file in the app.
- If Playwright browser installation fails with permission errors, set `PLAYWRIGHT_BROWSERS_PATH` to
  a writable directory (e.g., `/home/node/.cache/ms-playwright`) before running `npx playwright install`.
- When testing custom select/dropdown components (e.g., `CustomSelect`), standard Playwright
  `selectOption()` will not work. Instead, click the dropdown trigger to open it, then click
  the option using its `data-value` attribute (e.g., `page.click('[data-value="option1"]')`).
  Similarly, `toHaveValue()` does not work on custom selects — use
  `getAttribute('data-value')` to verify the selected value.
- When running `npx playwright test` directly (outside the app's `npm run test` wrapper),
  set `PLAYWRIGHT_BROWSERS_PATH=/opt/playwright` in the environment. Without this, Playwright
  cannot find the installed browsers. If module resolution fails, add `NODE_PATH` pointing to
  the app's `node_modules` directory.
