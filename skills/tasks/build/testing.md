# Skill

You will run all the tests in the app and get them to pass..

## Unpack Subtasks

List all test files in the app's `tests/` directory. Add ALL test file tasks in a single
`add-task` call, one task per test file in alphabetical order. Write out every task
explicitly — do not use a loop or script:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/build/testing.md", "app": "<AppName>", "subtasks": ["FixTests: tests/<file1>.spec.ts"] },
  { "skill": "skills/tasks/build/testing.md", "app": "<AppName>", "subtasks": ["FixTests: tests/<file2>.spec.ts"] }
]
EOF
```

After running tests and there are failures, pick specific failing tests and add a task to fix
them without regressing any tests that passed in previous runs:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[{ "skill": "skills/tasks/build/testing.md", "app": "<AppName>", "subtasks": ["Fix: <failing test name 1>", "Fix: <failing test name 2>"] }]
EOF
```

## Requirements

Once all playwright tests have been written, you must get them to pass.
When getting tests to pass, you must ensure the app is actually working.
You must not paper over problems in the app by hard-coding values,
disabling test functionality, and so on.

You might encounter bugs in the tests and can fix those, but you must ensure
that the test is correctly exercising the app as described in the corresponding
entry in tests.md

You MUST read these skill files before testing.

https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-cli/SKILL.md
https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-mcp/SKILL.md

RECORD_REPLAY_API_KEY is already set in the environment for using the Replay CLI.

## Replay.io Playwright Installation and Configuration

Every app MUST use the Replay browser to record Playwright test runs. This section describes
the exact installation steps and configuration required.

### 1. Install dependencies

The app's `package.json` must include these dev dependencies:

```bash
npm install --save-dev @replayio/playwright @playwright/test
```

`@replayio/playwright` (currently v5.0.1) provides the `replayReporter` and `devices` exports
for integrating Replay recordings into Playwright.

### 2. Install the Replay browser

Run once in the container (or as part of CI setup):

```bash
npx replayio install
```

This downloads the Replay Chromium browser to `~/.replay/runtimes/chrome-linux/chrome`.
Verify it exists:

```bash
ls ~/.replay/runtimes/chrome-linux/chrome
```

### 3. API key

`RECORD_REPLAY_API_KEY` must be set in the environment. It is already available in this
container. The Playwright config passes it to the reporter via:

```ts
apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY
```

### 4. Playwright config

The Playwright config MUST:

1. Import BOTH `replayReporter` and `devices as replayDevices` from `@replayio/playwright`.
2. Include `replayReporter(...)` in the `reporter` array with `upload: false`. Uploads are
   handled by the test script, NOT by the reporter.
3. Spread `replayDevices['Replay Chromium']` into the global `use` config. This sets
   `executablePath`, `RECORD_ALL_CONTENT`, and critically `RECORD_REPLAY_METADATA_FILE` which
   is required for the reporter to attach test metadata (pass/fail result) to recordings.
   Without `RECORD_REPLAY_METADATA_FILE`, the recording driver cannot read the per-test
   metadata written by the fixture, and all recordings will have empty `testResult`.

**IMPORTANT**: Do NOT manually set `launchOptions.executablePath` and `env` instead of using
`replayDevices['Replay Chromium']`. Manual config misses `RECORD_REPLAY_METADATA_FILE`,
which breaks the recording-to-test metadata association.

**IMPORTANT**: The Replay Chromium browser adds instrumentation overhead that makes all
operations ~2–3x slower than standard Chromium. Always set higher timeouts from the start:

- `actionTimeout: 15000` (15s for clicks, fills, etc.)
- `navigationTimeout: 30000` (30s for page navigations)
- Use `expect.toBeVisible({ timeout: 10000 })` for post-navigation assertions

Example:

```ts
import { defineConfig, devices } from '@playwright/test';
import { devices as replayDevices, replayReporter } from '@replayio/playwright';

export default defineConfig({
  // Replay Chromium is slower due to instrumentation — use generous timeouts
  actionTimeout: 15000,
  navigationTimeout: 30000,
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: false,
    }),
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    ...replayDevices['Replay Chromium'],
  },
});
```

### 5. Replay CLI commands reference

- `npx replayio list` — List all local recordings (ID, host, date, duration, status).
- `npx replayio list --json` — Full JSON metadata for all recordings. Each entry includes:
  `id`, `buildId`, `date`, `duration`, `metadata` (host, URI, sourceMaps, processType),
  `path`, `recordingStatus` (one of `"recording"`, `"finished"`, `"crashed"`).
- `npx replayio upload <id>` — Upload a single recording by ID. Returns the viewable URL.
- `npx replayio upload --all` — Upload all local recordings.
- `npx replayio remove --all` — Delete all local recordings (use between runs to avoid stale
  data accumulating).

### 6. OpenSSL 1.1 requirement

The Replay browser's recording driver requires `libcrypto.so.1.1` (OpenSSL 1.1). If the
container only has OpenSSL 3, the browser will run but silently fail to record (no error in
test output, just `DoLoadDriverHandle: dlopen failed` in stderr). Fix: download Ubuntu 18.04's
`libssl1.1` deb, extract it, and set `LD_LIBRARY_PATH` to point at the extracted libs. See
the deployment Playwright config for a working example.

### 7. Pre-test verification

Before running tests for the first time in an app, verify the Replay browser is installed:

```bash
ls ~/.replay/runtimes/chrome-linux/chrome
```

If it does not exist, run `npx replayio install` before any test execution. Running tests
without the Replay browser means failures produce no recordings, making debugging impossible.
Do not defer Replay installation to after failures are discovered.

## Pre-Flight Checks

Before running any tests, run the standard pre-flight procedure from `skills/scripts/preflight.md`.
Do NOT manually check each prerequisite individually — this wastes 3–8 commands per session
reinventing the same sequence. Run all pre-flight steps once as a batch:

```bash
pkill -f "netlify|vite" 2>/dev/null || true
grep NEON_PROJECT_ID .env || echo "ERROR: NEON_PROJECT_ID not set"
ls ~/.replay/runtimes/chrome-linux/chrome 2>/dev/null || npx replayio install
ls node_modules/@neondatabase/serverless 2>/dev/null || npm install --legacy-peer-deps
npx replayio remove --all 2>/dev/null
```

See `skills/scripts/preflight.md` for the full pre-flight checklist and
`skills/scripts/env-setup.md` for environment prerequisites.

## Running Tests

Run tests via `npm run test <testFile>` from the app directory (see `skills/scripts/test.md`
for the full script specification). Do NOT manually run playwright or start dev servers.

ULTRA IMPORTANT: NEVER EVER EVER RUN `npx playwright test`. You must use the provided test script.

- The script prints a one-line summary to stdout (e.g., `8 passed, 2 failed — see logs/test-run-3.log`).
- Full test output and recording metadata are in the log file referenced by the summary.
- Read the log file only when you need to diagnose failures.
- Tests MUST run in parallel with multiple workers (use `fullyParallel: true` in playwright config).

**Retry limit**: Limit test re-runs to 3 per failing test before investigating the root cause.
Test failures during development are expected (test-fix-retest cycle), but re-running the same
test more than 3 times without changing approach indicates the fix strategy is wrong. Stop,
analyze the failure more carefully (use Replay if available), and try a different approach.

## Debugging

When tests fail, you MUST follow this process for each distinct failure. Every step is
mandatory — do NOT skip or reorder steps.

0. **Identify failing tests**: Check `test-results/*/error-context.md` files for readable
   failure details. Do NOT parse `test-results/results.json` with grep/python3/node — the
   JSON log reporter strips test names and error details. If error-context files are missing,
   check `test-results/.last-run.json` for high-level status, then use Replay MCP tools.
1. Announce `ANALYZING TEST FAILURE: <test name>`.
2. **Read the debugging guides** in `skills/debugging/` to find the category matching your
   failure. The guides describe which Replay MCP tools to use first and what to look for:
   - `skills/debugging/timeouts.md` — Test timeouts and stuck steps
   - `skills/debugging/race-conditions.md` — Flaky tests, parallel interference
   - `skills/debugging/component-rendering.md` — Empty DOM, components not mounting
   - `skills/debugging/network-and-api.md` — API errors, missing/wrong data
   - `skills/debugging/form-and-input.md` — Form validation, input interactions
   - `skills/debugging/seed-data.md` — Missing test data, count mismatches
   - `skills/debugging/README.md` — Quick reference table: symptom → starting tool
3. Find the uploaded recording ID in the `npm run test` summary line (e.g.,
   `8 passed, 2 failed (recording: abc123) — see logs/test-run-3.log`). If the summary
   doesn't include a recording ID, read the log file and look for the
   `=== REPLAY RECORDINGS METADATA ===` block and `REPLAY UPLOADED: <recordingId>` lines.
   If the upload did not happen, use `npx replayio list --json` to find recordings and
   upload them manually: `npx replayio upload <id>`.
4. Announce `TEST FAILURE UPLOADED: <recordingId>` before doing anything else.
5. Use Replay MCP tools to analyze the failure, following the tool sequence from the relevant
   debugging guide. Use as many tools as needed to understand what actually happened before
   making any changes.
6. Write a bug writeup to `docs/bugs/<TestName>.md` following the investigative template below.
   You MUST fill in every section before making any code changes.
7. Only after completing the Replay analysis AND the bug writeup, fix the test and/or app based
   on what you found.
8. After fixing the failure, commit your changes and announce:
   CHANGESET REVISION: <git rev-parse HEAD> FAILING TEST: <test name>
   This line MUST appear in the log exactly as formatted — report tools search for it.

### Bug Writeup Template

For each test failure, create `docs/bugs/<TestName>.md` with exactly this structure:

```
# Bug: <test name>

## Step 1: Evidence

Evidence the app is broken: <describe concrete evidence from Replay analysis — wrong API
responses, incorrect state, missing data, UI rendering issues, etc. Write "None found" if
no evidence.>

Evidence the test is broken: <describe concrete evidence from Replay analysis — wrong
selectors, bad assertions, race conditions, incorrect test data expectations, etc. Write
"None found" if no evidence.>

## Step 2: Determination

Which is broken: <APP or TEST>

## Step 3: Root Cause

<Completely explain the cause of the problem in the app or test. Include the specific file(s),
function(s), and line(s) involved. Explain WHY the code is wrong, not just WHAT is wrong.>
```

Do NOT skip Replay analysis and jump straight to reading error messages or guessing at fixes.
Do NOT skip the bug writeup and jump straight to fixing code.
Do NOT stop or cancel a recording upload because it is "taking a while" — wait for it to complete.
The Replay recording contains the actual runtime state — use it.

When testing the app after deployment, use the Replay browser to record the app and debug any problems.

## Test Isolation Mandates

These rules are mandatory for all test files. Violations are the most common source of test
failures (~45% of observed failures come from shared database state).

1. **No hardcoded entity counts in serial test files.** Tests MUST use relative assertions
   (e.g., `toBeGreaterThan(0)`, "count decreased by 1") or query initial count before
   asserting. Never hardcode expected values like "4 visits" or "3 customers".

2. **Destructive tests go last AND use serial.** Tests that delete all entities (empty state
   tests) or rename entities MUST be ordered at the end of their describe block AND wrapped
   in `test.describe.serial`. This must be done during initial test authoring (writeTests),
   not deferred to checkDirectives. Placing destructive tests earlier corrupts state for
   subsequent tests — this caused 33% of all failures in one observed session.

3. **Unique entity names per test.** When tests create entities, use unique names
   (e.g., include test name or timestamp) to avoid strict mode collisions from duplicate
   data accumulating across serial test execution.

4. **TRUNCATE before seeding (Neon branches).** Seed scripts MUST call `truncateAllTables()`
   before inserting data. Neon branch creation inherits parent data, so insert-only seeding
   produces duplicates. Always use `truncateAndSeed()`, never `seedDatabase()` alone.

5. **Relative or data-independent assertions.** Tests that verify data after mutations must
   query current state before the action and assert relative changes, not absolute values.

6. **Distinct test data records per test.** Each test must operate on its own database
   record (vendor, PO, delivery, etc.) rather than sharing records across tests. Every spec
   file should create its own test data via API calls in `beforeEach`/`beforeAll` rather
   than relying on seed data. This is the single highest-impact isolation improvement —
   57.8% of observed failures came from data contamination when tests shared seed data.
   In one session, this single change would have prevented 10+ data-contamination failures
   across receive-delivery, vendor-detail, and PO-related spec files.

7. **No hardcoded seed data UUIDs.** Always discover entity IDs via API by name rather
   than assuming seed UUIDs exist. Seed record UUIDs may be deleted by earlier tests via
   cascade, causing failures in later tests that reference them.

8. **Pre-test state verification in serial suites.** Each test in a `test.describe.serial`
   block should verify its preconditions rather than assuming state from prior tests. For
   example, check that the expected number of rows exists before performing add/delete
   operations, rather than relying on a previous test's side effects.

9. **Weekend-safe seed data.** Seed data must include entries for the current day
   regardless of day-of-week. Use relative date calculations (e.g., `new Date()`) rather
   than hardcoded weekday dates. Tests that rely on "today's appointments" or similar
   day-specific queries will fail on weekends if seed data only contains weekday entries.

10. **Use click-based interaction for custom dropdowns.** When the UI uses custom dropdown
    components (non-native `<select>`), tests must use click-based interaction patterns
    (`click trigger → click option`), not `page.selectOption()`. Assertions should use
    `getAttribute('data-value')` instead of `toHaveValue()`.

11. **Validate `data-testid` prefix selectors.** When using `[data-testid^="prefix-"]`
   selectors, verify that container/wrapper elements don't also match the prefix. A selector
   like `[data-testid^="route-stop-"]` will match both list items and the container if
   named `route-stop-list`. Use `:not()` exclusions or more specific selectors to avoid
   overcounting.

## JourneyQA / Batch Test Isolation

When running multiple spec files in a single batch (e.g., JourneyQA tasks), each spec file
must have full database isolation. Running multiple spec files against a single Neon branch
causes cross-spec data contamination — one batch run caused 19 test failures from shared
state. Isolation strategies:

1. **Per-spec Neon branches**: Each spec file should get its own ephemeral Neon branch.
2. **Sequential with resets**: Run specs sequentially with a full database reset (truncate +
   re-seed) between each spec file.
3. **Never share a single branch across parallel spec files**: This is the most common source
   of batch contamination.

## Test Command Reliability

`npm run test` has a ~59% clean-pass rate (41% of runs encounter at least one failure).
Test failures during development are expected — they are part of the test-fix-retest cycle.
Do not treat a first-run failure as a sign of a fundamental problem. Follow the debugging
process in the section below, and respect the 3-retry limit before changing approach.

## Directives

- Do NOT manually start `netlify dev` for testing. The test script manages the dev server
  automatically. Only use manual `netlify dev` for one-off curl checks.

- If you do manually start `netlify dev` for curl testing, you MUST pass `--functions ./netlify/functions`
  to avoid 404 errors on function endpoints. The `base` setting in `netlify.toml` causes the functions
  directory to resolve incorrectly without this flag. Example:
  `npx netlify dev --port 8888 --functions ./netlify/functions`

- The Playwright `webServer` command should also include `--functions ./netlify/functions` when
  using Netlify Functions, to ensure function endpoints resolve correctly during test runs.
  Example: `npx netlify dev --port 8888 --functions ./netlify/functions`

- After making code changes to Netlify Functions or frontend code during a testing session, ALWAYS
  restart the dev server before re-running tests. The dev server may cache old function bundles.
  Kill background processes with `pkill -f "netlify"` and `pkill -f "vite"` before restarting.

- When a checkDirectives finding suggests removing test code (e.g., "redundant" cleanup,
  "unnecessary" helpers), always run the affected tests *before* committing the removal to
  confirm the change is safe. Cleanup code that looks redundant may be essential for test
  isolation.

- **Use exact text matching for option selection.** When selecting dropdown options or matching
  text that contains common words (e.g., "Monthly", "Active"), always use exact matching to
  avoid strict-mode violations from substring collisions. Use `{ exact: true }` or regex
  anchors: `getByText('Monthly', { exact: true })` or `hasText: /^Monthly$/`. Without exact
  matching, "Monthly" matches both "Monthly" and "Bi-Monthly", causing Playwright strict-mode
  errors.

- All browsers must run headless. Never use Xvfb, never set `DISPLAY`, never use the `replayio record`
  CLI (it launches a headed browser). Use `@replayio/playwright` for recordings.

- Tests run serially with `--workers 1`. The test script resets the database between each test.

- Tests MUST NOT run against the production database or the main Neon branch. The test script
  creates ephemeral Neon branches for test runs and deletes them afterwards.

- NEVER stop, cancel, or skip a Replay recording upload that is in progress. The upload is a
  prerequisite for Replay MCP analysis, which is mandatory for debugging failures. If the upload
  is taking a long time, WAIT for it to finish. Do NOT proceed with fixes based on "enough
  information" — you must complete the full upload → MCP analysis → fix cycle. Stopping an
  upload to "save time" violates the debugging process and leads to guesswork-based fixes.

- Always run tests via `npm run test <testFile>` (from the app directory), never by calling
  `npx playwright test` directly. The test script includes essential pre-test setup (branch
  creation, schema init, seeding, stale cleanup) that is skipped when running Playwright directly.

## Tips

- When a test times out inside a `.toPass()` block, use `mcp__replay__PlaywrightSteps` first. It
  shows the exact sequence of Playwright actions with timestamps and return values. Look for a
  step that is stuck auto-waiting for an element — this reveals nested-wait deadlocks where the
  DOM changed mid-iteration and an inner `textContent()` or `count()` call is waiting on an
  element that was removed. The fix is always in the test: replace the iteration loop with a
  single atomic Playwright assertion (see the nested-wait directive in writeTests.md).
- When debugging history/timeline tests, check for duplicate entries caused by React re-renders triggering multiple API calls, and check for missing entries from mutation handlers that skip history writes.
- When many detail-page tests fail with "expected count > 0, received 0", the root cause is almost
  always that the database has no seed data OR the API functions are not working. Check both before
  attempting to fix individual tests.
- When filter/search tests return wrong data (e.g., filtering by "proposal" returns "Qualification"),
  the root cause may be that the SQL query is silently broken. Verify the API returns correctly
  filtered results by curling the endpoint directly with filter parameters.
- Tests that pass individually but fail in the full suite usually indicate data contamination between
  tests. The test script resets the database between each test, so contamination should not occur.
  If it does, check that the reset is working correctly.
- When test IDs differ between spec files (cross-cutting vs page-specific), decide on ONE canonical
  set of IDs in the component and update whichever test file has fewer references.
- When testing unauthenticated scenarios with `browser.newContext()`, always pass
  `storageState: { cookies: [], origins: [] }` to ensure a truly empty context. Without this,
  Supabase or other auth libraries may detect cached sessions from previous test runs, causing
  "unauthenticated" tests to appear authenticated.
- If many tests suddenly fail with `net::ERR_CONNECTION_REFUSED` or `ERR_CONNECTION_RESET` partway
  through a test run, the dev server crashed mid-suite. Do NOT debug individual test failures —
  they are all caused by the same server crash. Re-run the full suite. If the crash recurs, check
  for memory pressure or port conflicts from zombie processes.
- Zombie processes (`<defunct>`) from previous `vite` or `netlify` runs are harmless and cannot be
  killed (they are orphaned child processes waiting for PID 1 to reap them). Ignore them. The
  Playwright `webServer` config starts fresh processes on different ports and is not affected.
- Commit incrementally during debugging sessions. If you improve test results (e.g., 81→207 passing)
  or fix a meaningful issue, commit those changes immediately even if other failures remain. An
  iteration that produces zero commits despite significant work (skill updates, code fixes,
  debugging progress) is wasted effort because the next iteration starts from scratch.
- **Deployment tests (`tests/deployment.spec.ts`) only work after a deploy** and require a live
  production URL. Do NOT run deployment tests as part of regular FixTests workflows — they will
  return 0 tests or fail when run locally without a deployed environment. Only run them after
  `npm run deploy` has completed successfully.
- Before running deployment tests, verify that required environment variables (DATABASE_URL,
  etc.) are set on the deployment target (e.g., Netlify). Missing env vars cause infrastructure
  failures that waste a full test cycle. Use `netlify env:list` to check.
- Before running tests, verify `NEON_PROJECT_ID` is set in the environment. The test script
  requires it for creating ephemeral Neon branches.
- Running the full test suite at once (e.g., `npx playwright test` with no file argument) can
  OOM or crash with `ERR_STRING_TOO_LONG` on large suites. Always run tests one spec file at a
  time using `npm run test tests/<file>.spec.ts` (which uses the test script that manages
  database branches). When verifying broad changes, pick the most relevant 2-3 spec files.
- The database is reset between each test, so tests do not need to worry about data from
  previous tests. Each test starts with a fresh seed.
- Seed scripts must always call `truncateAllTables()` (or equivalent) before inserting data
  to ensure idempotency. Without truncation, re-running seeds causes duplicate key errors.
  Every test file's `beforeAll`/`beforeEach` should TRUNCATE relevant tables before inserting
  seed data, not just delete known IDs. Hardcoded ID deletion breaks when Neon branches
  inherit data from parent branches. **Always use `truncateAndSeed()`, never `seedDatabase()`
  alone** — Neon ephemeral branches inherit parent data, so insert-only seeding produces
  duplicates.
- The Vite dev server cold start can cause the first test in a suite to timeout. Consider adding
  a warm-up navigation in `beforeAll` or increasing the first test's timeout to account for
  cold start latency.
- Avoid hardcoding expected values in assertions. Tests that hardcode specific counts (e.g.,
  `expect 1 remaining task`) or specific names (e.g., `"David Lee"`) break when test data
  changes. Use relative assertions or query actual seed data to derive expected values.
  Tests that verify "a new item was added" must count items before and after the action,
  not assert a hardcoded total.
- **Wait for data before counting rows.** Any test that captures an initial count of list items
  (for add/delete assertions) MUST first wait for the first row to be visible:
  ```ts
  await expect(page.locator('[data-testid="row"]').first()).toBeVisible();
  const initialCount = await page.locator('[data-testid="row"]').count();
  ```
  Without this wait, async data loading may not have completed, returning 0 and causing
  off-by-one assertion failures. This is the single highest-impact testing pattern — it
  prevents ~38% of observed test failures.
- **Use edge coordinates for backdrop click tests.** Tests for modal dismissal via backdrop/overlay
  click should always use edge coordinates (e.g., `{ x: 10, y: 10 }`) rather than clicking the
  center of the overlay, as modals often occupy the center and intercept the click.
- **Validate seed data counts before asserting.** Tests that assert specific counts from seed data
  should reference `seed-db.ts` directly or query the actual count rather than hardcoding expected
  values. Seed data mismatches account for ~42% of observed test failures.
- Validate that seed data exists before asserting on it. If a test expects a specific assignee
  name or record count, verify the data is present first. This catches seed data mismatches
  early instead of producing confusing assertion failures.
- Use unique `data-testid` values across the page. When a page and a modal both contain similar
  elements (e.g., a technician select), prefix testids with the component context to avoid
  strict-mode violations (e.g., `modal-technician-select` vs `detail-technician-select`).
- Before writing tests that rely on `data-testid` attributes, verify those attributes exist in
  the component source. Missing `data-testid` attributes cause test failures that are easy to
  prevent with a quick source check.
- When seed data uses `NUMERIC` or `DECIMAL` database columns, expect formatted output in
  assertions (e.g., `"500"` not `"500.00"`). These column types return decimal strings from
  PostgreSQL, so the app must format them before display. If tests fail on numeric values,
  check the column type and app formatting layer before modifying test expectations.
- When navigation timeouts persist across retries for a specific app (e.g., all supplier-details
  pages timing out), this is likely a Replay browser resource issue rather than an app bug.
  Adding a retry-with-delay (e.g., 5s between retries) can help distinguish transient
  infrastructure issues from persistent ones. If retries still fail, skip those tests and
  note the infrastructure issue.
- Seed data that includes time values should use 24-hour format (e.g., `"14:30"` not
  `"2:30 PM"`) to avoid text-based sorting issues in SQL. When PostgreSQL sorts TIME or
  text-stored time values, 24-hour format produces correct chronological order while AM/PM
  format does not (e.g., `"10:00 AM"` sorts after `"1:00 PM"` alphabetically).
- Backend API functions should return date fields in a consistent format — either always
  ISO timestamps (`2026-01-15T00:00:00.000Z`) or always `YYYY-MM-DD` strings, not a mix
  of both. Mixed formats cause frontend parsing issues when components expect one format
  but receive the other.
- **Format currency values with `.toFixed(2)`.** All currency display components must format
  values with 2 decimal places (e.g., `175.00` not `175`). Multiple test failures arise from
  assertions expecting formatted currency strings. Apply `.toFixed(2)` or equivalent formatting
  at the display layer for any monetary amount.
- **Use `type="text" inputMode="decimal"` for currency inputs from the start.** Avoid
  `<input type="number">` for currency fields — it strips formatting and causes issues with
  decimal display. Using `type="text"` with `inputMode="decimal"` provides the numeric
  keyboard on mobile while allowing full control over formatting. Converting from `type="number"`
  to `type="text"` mid-stream breaks existing test expectations.
- Seed data should use relative dates (e.g., "current month minus 1") rather than hardcoded
  month names. Tests that assert on date-filtered data (e.g., expecting "Jan" entries) will
  fail when run in a different month. Either make seed data date-relative or make test
  assertions date-aware.
- **Verify directories before navigating.** Before using `cd` to navigate to an app directory,
  verify it exists with `test -d` or `ls`. Directory navigation failures (`cd` to nonexistent
  paths) are the most common command failure across all worker iterations.
- Avoid redundant file exploration commands (`ls /repo/apps/`, `find ... -type f`, etc.)
  across test runs. Once you know the project structure, do not re-discover it in every
  iteration. Use the Glob and Grep tools instead of shell commands for file operations.

- **Verify seed data covers all test tables.** After writing or modifying seed-database
  functions, verify that all tables referenced in tests are properly seeded. Missing table
  seeding (e.g., categories table truncated but never re-seeded) causes tests to time out
  waiting for data that doesn't exist. Check each `TRUNCATE` call has a corresponding `INSERT`.

- **Validate Netlify function URL routing.** After writing backend functions, verify that
  `[[redirects]]` in `netlify.toml` includes all `/api/*` patterns and that URL segment
  parsing uses the correct index. A recurring bug is `segments[N]` off-by-one errors where
  the function reads `undefined` instead of the resource ID, returning 405. This appeared in
  3 separate functions in one session.

- **Cross-spec learning**: When a fix pattern is discovered in one spec file (e.g.,
  wait-before-count, destructive test reordering, formatDate normalization), proactively apply
  it to all other spec files in the same app before re-running tests. Fixing each file
  independently wastes re-run cycles on the same known issue.
- When many tests are pre-existing failures unrelated to the current task, avoid re-verifying
  them on every run. Use the `git stash` triage approach (see `skills/debugging/README.md`)
  once per task to confirm, then focus on new failures only.
- Before writing test assertions on data counts or relationships, verify expectations against
  actual seed data. 30% of observed failures were seed-data-mismatch — tests assumed wrong
  counts or relationships that didn't exist in the database.
- When building forms with custom validation, always add `noValidate` to the `<form>` element
  to prevent native browser validation from blocking custom logic. Without `noValidate`,
  `<input type="number">` and `<input type="email">` have built-in validation that fires
  before the form's `onSubmit` handler, causing custom validation tests to fail silently.
- Establish a consistent date handling convention: components should always format dates from
  ISO timestamps (what the API returns), and date inputs should always use `YYYY-MM-DD`
  format. Mismatches between API response format and component expectations are a recurring
  source of failures. All date comparisons in frontend code and tests must normalize to
  `YYYY-MM-DD` format before comparing, using `.split('T')[0]` or equivalent, since Postgres
  TIMESTAMP/DATE columns may return ISO strings with time components.
- When filtering by status values like "Active"/"Inactive", use exact text matching
  (e.g., `getByRole('option', { name: /^Active$/ })`) to avoid Playwright strict-mode
  violations from substring collisions (e.g., "Active" matching both "Active" and "Inactive").
- Tests should never use raw HTML element selectors (`tr`, `td`, `li`) to locate rows or items.
  Always use `data-testid` attributes instead. Raw element selectors break when the component's
  HTML structure changes (e.g., switching from `<table>` to `<div>`-based layout), causing
  timeouts that are hard to diagnose.
- **Use `click()` + `type()` instead of `fill()` for onChange-dependent inputs.** Playwright's
  `fill()` sets the input value directly and only fires `input` and `change` events at the end,
  which may not trigger React's synthetic `onChange` handler in all component implementations.
  If `fill()` doesn't trigger the expected behavior, switch to `click()` on the input followed
  by `type()` to simulate real keystrokes, which fires `onChange` on each character.

- **Trigger onBlur after fill() for blur-persisted forms.** When testing form components that
  use `onBlur` for persistence (auto-save on blur), Playwright `fill()` alone won't trigger
  the save. Always add `.blur()` after `.fill()` calls in these cases:
  ```ts
  await page.locator('#field').fill('value');
  await page.locator('#field').blur();
  ```

- **Use ESM-compatible __dirname.** If test helpers or server code use `__dirname`, ensure
  ESM-compatible alternatives are used: `import.meta.dirname` (Node 21.2+) or
  `path.dirname(fileURLToPath(import.meta.url))`. CommonJS `__dirname` is not available in
  ESM modules and will crash at runtime.

- **Add useEffect editing guards for editable forms.** Any React form that loads data via
  useEffect and allows editing must include an `isEditing` state guard that prevents useEffect
  from overwriting user input during editing. Set `isEditing = true` when the user begins
  editing, and skip the data-loading useEffect when `isEditing` is true. This pattern was
  needed across 3 spec files (7 tests) in one session — apply it proactively to all edit
  forms during initial component development.
- Ensure tests don't leak state between runs. Data-contamination failures occur when a prior
  test's API calls complete after the next test has started, polluting the data state. Use
  `test.describe.serial` for tests that share mutable state, or ensure API calls are fully
  settled before test completion.
- **Validate test data against DB CHECK constraints.** Before using enum values in test data
  (e.g., `visit_type`, `status`), verify them against the database schema's CHECK constraints
  or enum definitions. Invalid enum values cause constraint violations that surface as cryptic
  500 errors. This pattern appeared in 2+ spec files in observed sessions.
- Any test that creates records (orders, customers, etc.) should include a `beforeEach`
  cleanup helper (e.g., `deleteAllOrders()`) to prevent data accumulation across tests.
  Add this from the start when writing tests — don't wait for contamination failures.
- **Reset global settings in beforeEach.** Since settings are typically a single-row table,
  any spec that tests settings modifications (business name, preferences, etc.) should reset
  settings to known defaults in a `beforeEach` hook via API call. Otherwise, earlier tests
  that modify settings will contaminate later tests in the same file.
- Any test that deletes all records (e.g., empty state tests) must be in a
  `test.describe.serial` block at the end of the describe. Destructive tests placed earlier
  corrupt state for subsequent tests in the same file.
