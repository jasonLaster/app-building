# preflight

## Purpose

Standard pre-test and pre-deploy checklist to run before executing `npm run test` or
`npm run deploy`. This sequence was independently converged on across many debugging sessions
and should be followed every time.

## Pre-Test Preflight

Run these steps from the app directory before any `npm run test` invocation:

### 1. Kill stale servers

```bash
pkill -f "netlify dev" 2>/dev/null; pkill -f "vite" 2>/dev/null
```

Stale `netlify dev` and `vite` processes from previous runs cause port conflicts and
serve outdated code. Always kill them before starting tests.

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
