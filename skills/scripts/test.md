# test

## Purpose

Runs Playwright tests for a single test file using the Replay browser, with automatic database
branch setup, seeding, and failed-recording upload. This is the single entry point for running
tests during development and debugging.

## Usage

- `package.json` entry: `"test": "tsx scripts/test.ts"`
- Required argument: a test file path (e.g., `npm run test tests/clients-list-page.spec.ts`).
- Example: `npm run test tests/auth.spec.ts`
- **Always use `npm run test`**, never `npx tsx scripts/test.ts` directly. Direct `tsx` invocation
  fails on module resolution for `@neondatabase/serverless` and other dependencies. The `npm run`
  wrapper sets up the correct resolution context.

## Behavior

1. **Kill stale processes**: Kill any leftover `netlify` or `vite` dev server processes from
   previous runs.

2. **Clean up stale Neon branches**: List existing Neon branches and delete any that match the
   test branch naming convention (e.g., `test-worker-*`) from interrupted previous runs.

3. **Create ephemeral Neon branch**: Create a fresh branch from the project's main branch for
   this test run. Name it with a convention like `test-worker-{run-id}`.

4. **Initialize and seed**: Run `initSchema` on the new branch, then run migrations, then seed
   test data.

5. **Remove stale recordings**: Run `npx replayio remove --all` to clear local recordings from
   prior runs.

6. **Run Playwright**: Run `npx playwright test <testFile>` with `--retries 0` against the
   specified test file. The Playwright config handles starting the dev server with the branch's
   `DATABASE_URL`. Pipe all Playwright output to a log file (see Outputs).

7. **Parse results**: Count passed/failed/skipped tests from the Playwright JSON reporter output
   at `test-results/results.json`.

8. **On failure** (non-zero exit code):
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

9. **Clean up**: Delete the ephemeral Neon branch. Remove local recordings with
   `npx replayio remove --all`.

10. **Print summary** to stdout: a single line like `10 passed` or
    `8 passed, 2 failed — see logs/test-run-3.log`. Include the uploaded recording ID
    if one was uploaded: `8 passed, 2 failed (recording: abc123) — see logs/test-run-3.log`.

11. **Exit** with the original Playwright exit code.

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
- Run Playwright with `--retries 0` — no retries. Failures must be analyzed via Replay.
- Do NOT inherit stdio from Playwright. Pipe stdout and stderr to the log file using
  `child_process.execSync` with `stdio: ['ignore', 'pipe', 'pipe']` or similar, then write
  the captured output to the log file.
- Use the JSON reporter (`test-results/results.json`) to parse pass/fail counts for the
  summary line.
- The `RECORD_REPLAY_API_KEY` env var is already set in the container.
