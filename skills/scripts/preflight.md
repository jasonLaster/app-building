# preflight

## Purpose

Standard pre-test and pre-deploy checklist to run before executing `npm run test` or
`npm run deploy`. This sequence was independently converged on across many debugging sessions
and should be followed every time.

## Pre-Test Preflight

Run these steps from the app directory **once** before each test session (not before every
individual test file). Steps 2–3 (env/browser verification) and step 5 (deps) do not change
between runs within the same session — re-checking them before every test file is redundant
and wastes ~200+ commands per session. Only step 1 (kill stale processes) and step 4 (clear
recordings) need to run before each `npm run test` invocation.

### 1. Kill stale servers

```bash
ps aux | grep -E "netlify|vite" | grep -v grep | awk '{print $2}' | xargs -r kill 2>/dev/null; echo "servers cleared"
```

Stale `netlify dev` and `vite` processes from previous runs cause port conflicts and
serve outdated code. Always kill them before starting tests.

**Important**: Do NOT use `pkill -f "netlify|vite" 2>/dev/null || true` as the primary
approach — `pkill` exits 0 even when no process is found, so `|| true` makes it look
successful even when servers are still running. The `ps aux | xargs kill` pipeline is more
reliable. See `skills/scripts/killStaleProcesses.md` for details and fallback approaches.

**Port recovery**: If the port is still occupied after killing processes (zombie processes
invisible to `ps`), use `fuser` to force-free it:

```bash
fuser -k 8888/tcp 2>/dev/null || true
```

This should be a standard fallback when `netlify dev` fails to bind a port.

**Run each preflight step as a separate command**, not as a combined one-liner. The pattern
`cd X && pkill ... && grep ... && ls ...` fails if any sub-command fails (especially pkill
when no process exists), wasting effort decomposing and re-running individual commands.

**Do NOT re-run individual checks after a combined check passes.** If you run all preflight
steps and they succeed, do not then re-run each step individually as a "double check". This
pattern wastes 3-5 commands per test run and provides no additional value. Trust the output
of each step — if it passed, move on.

### 1b. Check disk space

```bash
df -h / | awk 'NR==2 {print $4}'
```

If free space is below 1GB, run the disk cleanup procedure in `skills/scripts/disk-cleanup.md`
before proceeding. Disk exhaustion (0 bytes free) causes cascading failures: dev server crashes,
Replay browser deletion, and npm install failures.

### 2. Verify `NEON_PROJECT_ID` is available

```bash
list-secrets | grep NEON_PROJECT_ID
```

The test script requires `NEON_PROJECT_ID` for creating ephemeral Neon branches. It must
be set as a branch secret. Also verify `DATABASE_URL` is available. See
`skills/scripts/env-setup.md`.

### 3. Verify Replay browser

```bash
ls -l ~/.replay/runtimes/chrome-linux/chrome
```

If the Replay browser is not installed, run `npx replayio install` before any test execution.
Without it, test failures produce no recordings and debugging is impossible.

**Important**: Also verify the binary is non-zero bytes. Disk pressure (ENOSPC) can corrupt
the binary to 0 bytes, which causes silent recording failures. If the file exists but is 0
bytes, reinstall with `npx replayio install`.

### 4. Clear stale Replay recordings

```bash
npx replayio remove --all
```

Old recordings from prior runs cause confusion when parsing results. Always clear them
before starting a new test run.

### 5. Verify dependencies

```bash
ls node_modules/@neondatabase/serverless 2>/dev/null || npm install --legacy-peer-deps
```

Use `--legacy-peer-deps` to avoid peer dependency conflicts with `netlify-cli` and ESLint
packages. This is the standard approach for `npm install` in this ecosystem.

## Pre-Deploy Preflight

### 1. Verify branch secrets

Run `list-secrets` and confirm `NEON_PROJECT_ID`, `DATABASE_URL`, and `NETLIFY_SITE_ID`
are set. If `NEON_PROJECT_ID` exists but `DATABASE_URL` does not, you must reset the
database password. See `skills/scripts/deploy.md` § "Redeployments".

### 2. Secrets are accessed via `exec-secrets`

Container-level secrets (`NEON_API_KEY`, `NETLIFY_AUTH_TOKEN`, `RECORD_REPLAY_API_KEY`,
`NETLIFY_ACCOUNT_SLUG`) are NOT directly in the environment. They are accessed via
`exec-secrets` when running commands that need them. No manual verification is needed —
the secrets server manages them. See the Secrets section in `AGENTS.md` for usage.
