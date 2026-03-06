# test

## Purpose

Runs Playwright tests for a single test file using the Replay browser, with automatic Neon
branch setup, seeding, and failed-recording upload. This is the single entry point for running
tests during development and debugging.

## Usage

- `package.json` entry: `"test": "tsx scripts/test.ts"`
- Required argument: a test file path (e.g., `npm run test tests/clients-list-page.spec.ts`).
- Example: `npm run test tests/auth.spec.ts`
- **Always use `npm run test`**, never `npx tsx scripts/test.ts` directly. Direct `tsx` invocation
  fails on module resolution for `@neondatabase/serverless` and other dependencies. The `npm run`
  wrapper sets up the correct resolution context.

## Pre-Flight

Before running `npm run test`, follow the pre-flight checklist in `skills/scripts/preflight.md`.
In particular, always use `npx replayio install` (NOT `npx playwright install chromium`) for
browser setup — the Replay browser installs to `~/.replay/runtimes/` and does not require
the Playwright browsers path workaround.

**Mandatory**: Kill stale `netlify dev` and `vite` processes before launching tests:
`pkill -f "netlify dev" 2>/dev/null; pkill -f "vite" 2>/dev/null`. Stale processes from
previous runs block ports and serve outdated code, causing spurious test failures.

**Mandatory**: Ensure `netlify link` has been run for the site before tests. The test script
starts `netlify dev`, which requires a linked site. If the site hasn't been linked yet, run
`netlify link --id $NETLIFY_SITE_ID` first.

## Behavior

1. **Kill stale processes**: Kill any leftover `netlify` or `vite` dev server processes from
   previous runs. Always suppress errors to avoid spurious failures when no process is running:
   `pkill -f "netlify dev" 2>/dev/null || true; pkill -f "vite" 2>/dev/null || true`

2. **Clean up stale Neon branches**: List existing Neon branches and delete any that match the
   test branch naming convention (e.g., `test-run-*`) from interrupted previous runs.

3. **Create ephemeral Neon branch**: Create a fresh branch from the project's main branch for
   this test run. Name it with a convention like `test-run-{timestamp}`.

4. **Initialize and seed**: Run `initSchema` on the new branch, then run migrations, then seed
   test data.

5. **Start `netlify dev`**: Start a single `netlify dev` instance with `DATABASE_URL` pointing
   to the ephemeral branch.

6. **Remove stale recordings**: Run `npx replayio remove --all` to clear local recordings from
   prior runs.

7. **Run Playwright**: Run `npx playwright test <testFile>` with `--retries 0 --workers 1`
   against the specified test file. Tests run serially, one at a time. The database is reset
   (truncate all tables and re-seed) between each test. Pipe all Playwright output to a log
   file (see Outputs).

8. **Parse results**: Count passed/failed/skipped tests from the Playwright JSON reporter output
   at `test-results/results.json`.

9. **On failure** (non-zero exit code):
   a. Parse `~/.replay/recordings.log` with a built-in parser (NOT `npx replayio list --json`,
      which crashes on large suites). The log is newline-delimited JSON with `kind` field:
      `createRecording`, `addMetadata`, `writeStarted`, `writeFinished`, etc.
   b. Append full metadata for every recording that has test metadata to the log file in a
      delimited block:
      ```
      === REPLAY RECORDINGS METADATA ===
      {"id":"...","testResult":"failed","testTitle":"...","specFile":"..."}
      ...
      === END REPLAY RECORDINGS METADATA ===
      ```
   c. Upload exactly ONE recording: among all finished recordings where
      `metadata.test.result` is `"failed"` or `"timedOut"`, pick the one with the longest
      duration (the real recording, not zero-duration stubs). Upload with
      `npx replayio upload <id>`. On success, append `REPLAY UPLOADED: <recordingId>` to the
      log file. On failure, log the exit code.

10. **Clean up**: Stop the `netlify dev` server. Delete the ephemeral Neon branch. Remove local
    recordings with `npx replayio remove --all`.

11. **Print summary** to stdout: a single line like `10 passed` or
    `8 passed, 2 failed — see logs/test-run-3.log`. Include the uploaded recording ID
    if one was uploaded: `8 passed, 2 failed (recording: abc123) — see logs/test-run-3.log`.

12. **Exit** with the original Playwright exit code.

## Inputs

- **Required argument**: Test file path (e.g., `tests/auth.spec.ts`).
- **Environment variables**:
  - `NEON_API_KEY` (required): For Neon branch management.
  - `RECORD_REPLAY_API_KEY` (required): For Replay recording uploads.
  - `NEON_PROJECT_ID` (required): Read from `.env`. The Neon project to branch from.
  - `DATABASE_URL` (required): Read from `.env`. The main branch connection string used as
    template for ephemeral branches.
  - `REPLAY_CLI` (optional): Override the Replay CLI command (default: `replayio`, assumed
    globally installed). Useful for pointing at a local build or alternate installation.
- **Files**:
  - `.env`: Project configuration (Neon project ID, database URL, etc.).
  - `~/.replay/recordings.log`: Replay recording metadata (read after test run).

## Outputs

- **stdout**: One-line summary only. Never verbose test output.
- **`logs/test-run-N.log`**: Full Playwright output, recording metadata, and upload results.
  `N` increments each run (find the highest existing number and add 1).
- **Side effects**:
  - Creates and deletes ephemeral Neon branches.
  - Uploads failed Replay recordings.
  - Removes local recording files.
- **Exit codes**:
  - 0: All tests passed.
  - Non-zero: Test failures (matches Playwright's exit code).

## Reading Test Results

Always determine pass/fail status from the log file (`logs/test-run-N.log`) or
`test-results/results.json` — **never from stdout**. The Playwright output format combined
with Replay recording can show "0 tests" on stdout even when tests actually ran and passed.
This misleading output has caused repeated wasted investigation. If stdout says "0 tests",
check the log file before concluding that tests didn't run.

## Parsing Test Failures

The JSON log reporter strips test names and error details from `test-results/results.json`,
making it unreliable for identifying which tests failed. Do NOT spend time trying to parse
`results.json` with grep, python3, or node scripts — the data is not there.

Instead, use this approach in order:

1. **Check `test-results/*/error-context.md` files** — these contain readable failure details
   including test names and error messages. This is the fastest way to identify failures.
2. **Check `test-results/.last-run.json`** — provides high-level pass/fail status.
3. **Use Replay MCP tools** — if error-context files are insufficient, inspect the uploaded
   recording to diagnose the root cause. This is consistently the most effective approach
   for understanding failures.

## Timeout-Prone Tests

When tests consistently time out under the Replay Chromium browser (which adds 2–3x overhead),
use `test.slow()` at the top of the test body to triple Playwright's default timeout. This is
preferable to increasing `actionTimeout` globally, since it only affects known slow tests.

## Test Writing Guidelines

For guidance on writing robust tests that work with this test script, see:

- `skills/tasks/build/writeTests.md` § "Test Design and Database Isolation" — `beforeEach`
  cleanup hooks, relative assertions, and `data-testid` selector best practices.
- `skills/tasks/build/writeTests.md` § "Directives" — test isolation mandates including no
  hardcoded row counts, unique entity names, and `:not()` filters for prefix selectors.

## Timeout-Prone Tests

When tests consistently time out under the Replay Chromium browser (which adds 2–3x overhead),
use `test.slow()` at the top of the test body to triple Playwright's default timeout. This is
preferable to increasing `actionTimeout` globally, since it only affects known slow tests.

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` and the seed logic from `scripts/seed-db.ts`.
- Use the Neon API directly (`fetch` to `https://console.neon.tech/api/v2/...`) for branch
  creation and deletion. The API key is `NEON_API_KEY`.
- Parse `~/.replay/recordings.log` in TypeScript — it's newline-delimited JSON. The
  `addMetadata` entries contain `metadata.test.result` which indicates pass/fail.
- The Playwright config must use the Replay browser via `replayDevices['Replay Chromium']`
  from `@replayio/playwright` and include `replayReporter` with `upload: false`.
- The HTML reporter must use `open: 'never'` to suppress the interactive "Serving HTML report"
  prompt that blocks the script from exiting.
- Run Playwright with `--retries 0 --workers 1` — no retries, no parallelism. Failures must
  be analyzed via Replay.
- Do NOT inherit stdio from Playwright. Pipe stdout and stderr to the log file using
  `child_process.execSync` with `stdio: ['ignore', 'pipe', 'pipe']` or similar, then write
  the captured output to the log file.
- Use the JSON reporter (`test-results/results.json`) to parse pass/fail counts for the
  summary line.
- The `RECORD_REPLAY_API_KEY` env var is already set in the container.
- Reset the database between tests by truncating all app tables and re-running the seed script.
  This ensures each test starts with a clean, known dataset. Use `truncateAndSeed` (truncate
  all tables then seed) rather than just `seedDatabase` — Neon branches inherit data from their
  parent branch, and tests accumulate data across runs. Without truncation, tests see unexpected
  rows from prior runs or inherited branch data, which is the #1 cause of test failures.
