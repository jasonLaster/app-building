# Skill

You are writing playwright tests which check that all the different entries in docs/tests.md are satisfied by the app.

## Unpack Subtasks

Unpack the initial write tests task into subtasks using `add-task`. Add one task per page,
containing all test entries for that page:

```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/writeTests.md" --app "<AppName>" \
  --subtask "WriteTest<TestEntry1>: Write test for <TestEntry1>" \
  --subtask "WriteTest<TestEntry2>: Write test for <TestEntry2>" \
  --subtask "WriteTest<TestEntry3>: Write test for <TestEntry3>"
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

- Avoid using `getByText()` with common words that may appear as substrings in other elements (labels,
  options, buttons). Playwright's `getByText` is case-insensitive and uses substring matching by default.
  Prefer `getByTestId` for precise element targeting, or use `getByRole`/`getByLabel` with exact matching.
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

- Auth flows that involve email-based verification (email confirmation, password reset) must
  have dedicated tests that exercise the real production code path — not the IS_TEST bypass.
  These tests must run the backend without IS_TEST=true (or with IS_TEST=false) so that actual
  tokens are generated and stored. The test should call the signup/forgot-password endpoint,
  query the database directly for the generated token, then hit the confirmation/reset endpoint
  with that token and verify success. This ensures the full flow works end-to-end: token
  generation, storage, URL construction, and redemption. Other (non-auth-flow) tests may
  continue to use IS_TEST=true to bypass auth for convenience.

## Parallel Test Design and Database Isolation

Tests run in parallel across multiple Playwright workers. Each worker gets its own isolated
PGlite database instance — an embedded Postgres that runs in-process with no network or
cloud dependency.

### Test infrastructure

Do **not** use Playwright's `webServer` config to start the dev server. Instead, use a
worker-scoped fixture that starts a dedicated `netlify dev` instance per worker, each with
its own PGlite database:

```typescript
// tests/fixtures.ts
import { test as base } from '@playwright/test'
import { spawn, type ChildProcess } from 'child_process'
import { mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

export const test = base.extend<{}, { serverUrl: string }>({
  serverUrl: [async ({}, use, workerInfo) => {
    // Each worker gets its own PGlite data dir and port
    const dataDir = mkdtempSync(join(tmpdir(), `pglite-worker-${workerInfo.workerIndex}-`))
    const port = 8888 + workerInfo.workerIndex

    const server = spawn('npx', ['netlify', 'dev', '--port', String(port), '--functions', './netlify/functions'], {
      cwd: /* app directory */,
      env: { ...process.env, PGLITE_DATA_DIR: dataDir },
      stdio: 'pipe',
    })

    // Wait for server to be ready, then init schema + seed
    await waitForServer(port)
    await initSchema(dataDir)
    await seedTestData(dataDir)

    await use(`http://localhost:${port}`)

    server.kill()
  }, { scope: 'worker' }],
})

export { expect } from '@playwright/test'
```

Test files import `test` from `./fixtures` instead of `@playwright/test`, and use
`serverUrl` instead of a hardcoded `baseURL`:

```typescript
import { test, expect } from './fixtures'

test('my test', async ({ page, serverUrl }) => {
  await page.goto(`${serverUrl}/some-page`)
})
```

### Database access in functions

All Netlify functions must use the shared `netlify/functions/db.ts` module (see AGENTS.md)
rather than importing `@neondatabase/serverless` directly. This module uses PGlite when
`PGLITE_DATA_DIR` is set (testing) and Neon when `DATABASE_URL` is set (production).

### Test design rules

- Each worker gets a fresh, isolated database. Tests within the same worker share that database.
- Tests that create, modify, or delete records must not rely on a fixed total count of records
  in the database (e.g., "expect 5 clients"). Other tests in the same worker may have already
  created or deleted records. Instead, assert on specific records by name/ID, or use relative
  assertions ("at least N", "contains this item").
- Tests that need a pristine dataset should create their own records in `beforeAll`/`beforeEach`
  and clean them up in `afterAll`/`afterEach`, rather than depending on the global seed data
  being unmodified.
- Never hardcode database IDs in tests. Query the UI or API to discover IDs for the records
  you need to interact with.
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
