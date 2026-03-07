# killStaleProcesses

## Purpose

Standard process-cleanup procedure to kill stale `netlify dev` and `vite` processes
before running tests or starting a dev server. Stale processes cause port conflicts
and serve outdated code.

## Usage

Run from any directory before starting tests or a dev server:

```bash
pkill -f "netlify dev" 2>/dev/null; pkill -f "vite" 2>/dev/null
```

## Details

- `pkill` returns exit code 1 when no matching process is found. This is benign —
  suppress it with `2>/dev/null` or `|| true` so it does not fail scripts.
- Both `netlify dev` and `vite` should be killed, as `netlify dev` spawns a child
  `vite` process that may outlive the parent.
- After killing, wait briefly or verify the port is free before starting a new server.
  In most cases the port is released immediately.
- Zombie processes (`<defunct>`) cannot be killed and are harmless — ignore them.

## Unavailable Tools

Do NOT use `lsof`, `ss`, `fuser`, or `netstat` for port checking — none of these are
installed in the container. Always use `pkill -f` to kill processes by name. Attempting
these tools wastes time on guaranteed failures before falling back to `pkill` anyway.

## When to Run

- Before every `npm run test` invocation (see `preflight.md` step 1).
- Before manually starting `netlify dev` for curl checks.
- After a test run crashes or is interrupted mid-suite.
