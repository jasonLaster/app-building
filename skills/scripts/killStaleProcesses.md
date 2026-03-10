# killStaleProcesses

## Purpose

Standard process-cleanup procedure to kill stale `netlify dev` and `vite` processes
before running tests or starting a dev server. Stale processes cause port conflicts
and serve outdated code.

## Usage

Run from any directory before starting tests or a dev server. Use a single combined
command to kill both process types at once:

```bash
pkill -f "netlify|vite" 2>/dev/null || true
```

This replaces the previous pattern of running separate `pkill` commands for each process
type, and eliminates the ad-hoc retry pattern of trying `pkill -f "netlify dev"`, then
`pkill -f "netlify"`, then `kill $(pgrep -f netlify)` — all of which are redundant.
Only retry once if processes persist (see "Verifying Termination" below).

**Always append `|| true`** when using `pkill` in chained commands or scripts. Without it,
`pkill` returns exit code 1 when no matching process is found, which causes chained commands
(using `&&`) to abort and scripts to report partial failures. This was the single most wasteful
pattern observed — agents cycling through 3–5 different kill approaches per session.

**Check before killing** when you need to know if processes exist:

```bash
pgrep -f "netlify dev" >/dev/null 2>&1 && pkill -f "netlify dev" || true
pgrep -f "vite" >/dev/null 2>&1 && pkill -f "vite" || true
```

Use the simple `pkill ... || true` form for preflight cleanup where you don't care whether
processes existed. Use the `pgrep` check form when you need to log or branch on process state.

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

## Verifying Termination

After killing processes, verify they are actually gone before starting new ones:

```bash
pkill -f "netlify dev" 2>/dev/null; pkill -f "vite" 2>/dev/null
sleep 1
# Verify no processes remain (pgrep exits 1 if no match = good)
pgrep -f "netlify dev" >/dev/null 2>&1 && echo "WARNING: netlify still running" || true
pgrep -f "vite" >/dev/null 2>&1 && echo "WARNING: vite still running" || true
```

If processes survive the initial `pkill`, escalate with `pkill -9`:

```bash
pkill -9 -f "netlify dev" 2>/dev/null; pkill -9 -f "vite" 2>/dev/null
```

## When to Run

- Before every `npm run test` invocation (see `preflight.md` step 1).
- Before manually starting `netlify dev` for curl checks.
- After a test run crashes or is interrupted mid-suite.
