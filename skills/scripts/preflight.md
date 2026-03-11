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

**Run each preflight step as a separate command**, not as a combined one-liner. The pattern
`cd X && pkill ... && grep ... && ls ...` fails if any sub-command fails (especially pkill
when no process exists), wasting effort decomposing and re-running individual commands.

### 2. Verify `NEON_PROJECT_ID` in `.env`

```bash
grep NEON_PROJECT_ID .env
```

The test script requires `NEON_PROJECT_ID` for creating ephemeral Neon branches. If missing,
check `deployment.txt` for the project ID and populate `.env`. See `skills/scripts/env-setup.md`.

### 3. Verify Replay browser

```bash
ls ~/.replay/runtimes/chrome-linux/chrome
```

If the Replay browser is not installed, run `npx replayio install` before any test execution.
Without it, test failures produce no recordings and debugging is impossible.

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

### 1. Populate `.env` from `deployment.txt`

If `.env` is missing or incomplete, read `deployment.txt` for `site_id`, `neon_project_id`,
and `database_url`. See `skills/scripts/deploy.md` § "Populating `.env` for Redeployments".

### 2. Verify container-level env vars

```bash
echo $NEON_API_KEY | head -c 5
echo $NETLIFY_AUTH_TOKEN | head -c 5
```

See `skills/scripts/env-setup.md` for the full list of required variables.
