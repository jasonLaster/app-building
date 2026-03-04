# test

## Purpose

Runs Playwright tests for a single test file using the Replay browser, with automatic PGLite
database setup, seeding, and failed-recording upload. This is the single entry point for running
tests during development and debugging.

## Usage

- `package.json` entry: `"test": "tsx scripts/test.ts"`
- Required argument: a test file path (e.g., `npm run test tests/clients-list-page.spec.ts`).
- Example: `npm run test tests/auth.spec.ts`
- **Always use `npm run test`**, never `npx tsx scripts/test.ts` directly. Direct `tsx` invocation
  fails on module resolution for dependencies. The `npm run` wrapper sets up the correct
  resolution context.

## Behavior

1. **Kill stale processes**: Kill any leftover `netlify` or `vite` dev server processes from
   previous runs.

2. **Create PGLite databases**: For each Playwright worker (determined by the `workers` config,
   default is CPU count), create an in-process PGLite database instance. Each worker gets its own
   isolated database identified by a worker ID (0, 1, 2, ...).

3. **Initialize and seed each database**: For each PGLite instance, run `initSchema`, then run
   migrations, then seed test data. Every worker starts with identical, independent data.

4. **Start one `netlify dev` server**: Start a single `netlify dev` instance that all workers
   share. The server routes requests to the correct PGLite database based on a custom
   `X-Test-Worker` header sent by each Playwright worker.

5. **Remove stale recordings**: Run `npx replayio remove --all` to clear local recordings from
   prior runs.

6. **Run Playwright**: Run `npx playwright test <testFile>` with `--retries 0` against the
   specified test file. Pipe all Playwright output to a log file (see Outputs).

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

9. **Clean up**: Stop the `netlify dev` server. Remove local recordings with
   `npx replayio remove --all`. PGLite instances are in-process and cleaned up automatically.

10. **Print summary** to stdout: a single line like `10 passed` or
    `8 passed, 2 failed — see logs/test-run-3.log`. Include the uploaded recording ID
    if one was uploaded: `8 passed, 2 failed (recording: abc123) — see logs/test-run-3.log`.

11. **Exit** with the original Playwright exit code.

## PGLite Database Routing

Each Playwright worker sends an `X-Test-Worker: <id>` header on every request to the dev server.
The app's database module (`db.ts` or equivalent) must route to the correct PGLite instance
based on this header.

### Backend `db.ts` pattern

The app's `db.ts` should support both production (Neon) and test (PGLite) modes:

```ts
import { neon } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";

// In test mode, the test script pre-creates PGLite instances and registers them here.
const pgliteInstances = new Map<string, PGlite>();

export function registerPGLite(workerId: string, instance: PGlite) {
  pgliteInstances.set(workerId, instance);
}

export function getDb(request?: Request) {
  // Check for test worker header
  const workerId = request?.headers.get("x-test-worker");
  if (workerId && pgliteInstances.has(workerId)) {
    return pgliteInstances.get(workerId)!;
  }
  // Production: use Neon
  return neon(process.env.DATABASE_URL!);
}
```

### Playwright fixture

Each worker adds the `X-Test-Worker` header to all requests via a custom fixture or
`extraHTTPHeaders` in the Playwright config:

```ts
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    'X-Test-Worker': `${process.env.TEST_PARALLEL_INDEX ?? '0'}`,
  },
}
```

The test script sets `TEST_PARALLEL_INDEX` per worker via Playwright's built-in
`process.env.TEST_PARALLEL_INDEX` (available automatically in each worker process).

### Netlify Functions

Each Netlify Function handler must pass the incoming `Request` to `getDb()` so the header
is available for routing:

```ts
export default async (request: Request) => {
  const db = getDb(request);
  // ... use db
};
```

## Inputs

- **Required argument**: Test file path (e.g., `tests/auth.spec.ts`).
- **Environment variables**:
  - `RECORD_REPLAY_API_KEY` (required): For Replay recording uploads.
  - `DATABASE_URL` (required): Read from `.env`. Used in production mode; not needed for
    PGLite test databases but kept for the app's db module fallback.
  - `REPLAY_CLI` (optional): Override the Replay CLI command (default: `replayio`, assumed
    globally installed). Useful for pointing at a local build or alternate installation.
- **Files**:
  - `.env`: Project configuration (database URL, etc.).
  - `~/.replay/recordings.log`: Replay recording metadata (read after test run).
- **Dependencies**:
  - `@electric-sql/pglite`: PGLite in-process Postgres. Must be installed in the app.

## Outputs

- **stdout**: One-line summary only. Never verbose test output.
- **`logs/test-run-N.log`**: Full Playwright output, recording metadata, and upload results.
  `N` increments each run (find the highest existing number and add 1).
- **Side effects**:
  - Creates in-process PGLite databases (no external resources).
  - Uploads failed Replay recordings.
  - Removes local recording files.
- **Exit codes**:
  - 0: All tests passed.
  - Non-zero: Test failures (matches Playwright's exit code).

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` and the seed logic from `scripts/seed-db.ts`.
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
- PGLite databases are created in-process by the test script. No external API calls needed
  for database setup or teardown.
- The test script must install `@electric-sql/pglite` in the app if not already present.
