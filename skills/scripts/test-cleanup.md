# test-cleanup

## Purpose

Standard pre-test cleanup sequence to kill stale processes and clear old recordings.
This sequence should run before every test invocation.

## Procedure

Run each step as a **separate command** — do NOT chain with `&&` or `;`:

```bash
# Step 1: Kill stale dev servers
pkill -f "netlify|vite" 2>/dev/null || true
```

```bash
# Step 2: Free port 8888 from zombie processes
fuser -k 8888/tcp 2>/dev/null || true
```

```bash
# Step 3: Clear stale Replay recordings
npx replayio remove --all 2>/dev/null
```

## When to Use

Run this sequence before every `npm run test` invocation. The test script does NOT
automatically clean up stale processes or recordings from previous runs.

## Notes

- `pkill` returns exit code 1 when no matching process exists — the `|| true` prevents
  this from aborting chained commands.
- `fuser -k` is needed in addition to `pkill` because zombie processes holding port 8888
  are invisible to `pkill` but still bind the port.
- `npx replayio remove --all` prevents stale recordings from accumulating and consuming
  disk space. Old recordings also confuse the upload step if they share test names with
  current recordings.
