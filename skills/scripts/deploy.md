# deploy

## Purpose

Syncs the production database schema, builds the app, and deploys to an existing Netlify
site. The deploy script does NOT create Neon projects or Netlify sites — the agent must
provision those and set branch secrets before running the deploy.

## Prerequisites — provisioning resources before first deploy

Before the first deploy, the agent must create the Neon project and Netlify site, store
the results as branch secrets, and ensure the deploy script (`scripts/deploy.ts`) reads
its config from `process.env` (populated by `exec-secrets`). Read the deploy script to
confirm it matches these requirements.

### 1. Create Neon project and store branch secrets

See `skills/scripts/neon-setup.md` for the Neon API details. Write API responses to files,
extract values, and pipe to `set-branch-secret`:

```bash
exec-secrets NEON_API_KEY -- bash -c 'curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"project\":{\"name\":\"<app-name>\"}}" \
  https://console.neon.tech/api/v2/projects > /tmp/neon-resp.json'
python3 -c "import json; print(json.load(open('/tmp/neon-resp.json'))['project']['id'])" | set-branch-secret NEON_PROJECT_ID
python3 -c "import json; r=json.load(open('/tmp/neon-resp.json')); print(r['connection_uris'][0]['connection_uri'])" | set-branch-secret DATABASE_URL
```

### 2. Create Netlify site and store branch secret

```bash
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- bash -c 'LC_ALL=C npx netlify sites:create \
  --account-slug $NETLIFY_ACCOUNT_SLUG --name <app-name> --json > /tmp/netlify-site.json'
python3 -c "import json; print(json.load(open('/tmp/netlify-site.json'))['site_id'])" | set-branch-secret NETLIFY_SITE_ID
```

### 3. Store any app-specific secrets

If the app requires additional secrets at runtime (e.g., `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`,
`UPLOADTHING_TOKEN`), store them as branch secrets now. These must match the names in
`.env.example`.

### 4. Verify

```bash
list-secrets | grep -E 'NEON_PROJECT_ID|DATABASE_URL|NETLIFY_SITE_ID'
```

All three must be present before running the deploy.

## Running the deploy

```bash
exec-secrets NEON_API_KEY NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG DATABASE_URL NEON_PROJECT_ID NETLIFY_SITE_ID -- npm run deploy
```

All 6 secrets are always required. The deploy script reads them from `process.env`.

## Usage

- `package.json` entry: `"deploy": "tsx scripts/deploy.ts"`
- Example: `npm run deploy` (wrapped in `exec-secrets` as shown above)

## Behavior

### Database schema sync (every run)

1. Call `initSchema(productionDatabaseUrl)` to create any missing tables.
2. Run migrations (`migrate-db` logic) against the production database to handle `ALTER TABLE`
   changes that `initSchema` cannot detect.

### Seed data (first deployment only)

3. On the **first deployment** (i.e. the database was just created), insert seed data that
   demonstrates the app's features. The seed data should be realistic and cover the main
   entities and relationships so a user can immediately explore the app without needing to
   create everything from scratch. Skip seeding on subsequent deployments.

### Build and deploy (every run)

4. Build the app (`vite build`). Pipe build output to the log file.
5. Deploy to Netlify (`netlify deploy --prod`). Pipe deploy output to the log file.
6. Set Netlify env vars from `.env.example` — read the file, look up each variable name in
   `process.env`, and set it on the Netlify site via the REST API.
7. Write the deployed `url` and `deployed_at` to the top of `deployment.txt` (overwriting
   the previous resource block but preserving any deployment history entries below).
8. Print a one-line summary to stdout:
   - Success: `Deployed to <url>`
   - Failure: `Deploy failed (build|netlify) — see logs/deploy.log`

## Migrating from old deployment.txt format

Old `deployment.txt` files may contain `neon_project_id`, `site_id`, and `database_url`.
These need to be migrated to branch secrets. **CRITICAL: the `database_url` in
`deployment.txt` is leaked (committed to git) and MUST NOT be reused.** You must reset
the database password and obtain a fresh connection string.

Step 1 — Store the non-sensitive identifiers from `deployment.txt`:

```bash
grep neon_project_id deployment.txt | cut -d' ' -f2 | set-branch-secret NEON_PROJECT_ID
grep site_id deployment.txt | cut -d' ' -f2 | set-branch-secret NETLIFY_SITE_ID
```

Step 2 — Reset the database password and store a fresh `DATABASE_URL`:

```bash
exec-secrets NEON_API_KEY NEON_PROJECT_ID -- bash -c 'curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" > /tmp/branches.json'

BRANCH_ID=$(python3 -c "import json; bs=json.load(open('/tmp/branches.json'))['branches']; print(next(b['id'] for b in bs if b.get('primary',False) or b['name']=='main'))")

exec-secrets NEON_API_KEY NEON_PROJECT_ID -- bash -c 'curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/'"$BRANCH_ID"'/roles/neondb_owner/reset_password" > /tmp/reset.json'

exec-secrets NEON_API_KEY NEON_PROJECT_ID -- bash -c 'curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/endpoints" > /tmp/endpoints.json'

python3 -c "
import json
pw = json.load(open('/tmp/reset.json'))['role']['password']
host = json.load(open('/tmp/endpoints.json'))['endpoints'][0]['host']
print(f'postgresql://neondb_owner:{pw}@{host}/neondb?sslmode=require')
" | set-branch-secret DATABASE_URL
```

Step 3 — Strip secrets from `deployment.txt`, keeping only `url` and `deployed_at`.

## Outputs

- **stdout**: One-line summary only.
- **`logs/deploy.log`**: Full build and deploy output. Overwritten each run.
- **`deployment.txt`**: Updated with the deployed `url` and `deployed_at`. Deployment
  history entries below the resource block are preserved.
- **Side effects**:
  - Syncs production database schema (every run).
  - Seeds database (first run only).
  - Deploys built app to Netlify (every run).
  - Sets Netlify env vars from `.env.example`.
- **Exit codes**:
  - 0: Deployment succeeded.
  - Non-zero: A step failed.

## SPA Routing

Single-page apps require a `_redirects` file so that Netlify serves `index.html` for all
client-side routes. Without this, direct navigation to `/dashboard` or other routes returns 404.

Create `public/_redirects` with:

```
/* /index.html 200
```

The deploy script should ensure this file exists before building. If the app uses client-side
routing (React Router, etc.), this file is mandatory.

## Post-Deploy Checklist

After the first successful deployment, verify that required environment variables are set on
the Netlify site. Missing env vars cause production 500 errors that are hard to diagnose.

**IMPORTANT: Check for account-level env var overrides.** Netlify account-level environment
variables take precedence over site-level variables. If `DATABASE_URL` is set at the account
level, it will override the site-level value, causing the production app to connect to the
wrong database. To check and fix:

```bash
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- bash -c 'curl -s \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/accounts/$NETLIFY_ACCOUNT_SLUG/env"' | python3 -c "
import sys, json
for v in json.load(sys.stdin):
    print(v['key'], '=', v['values'][0]['value'][:20] if v['values'] else '(empty)')
"
```

Use the Netlify REST API to set environment variables — the CLI `npx netlify env:set --site`
flag is unreliable and silently fails in many environments. See `skills/scripts/netlify-env.md`
for the working REST API approach.

1. **Check existing env vars**: Use the Netlify REST API or `LC_ALL=C npx netlify env:list --json --site $NETLIFY_SITE_ID`
2. **Set `DATABASE_URL`**: See `skills/scripts/netlify-env.md` for the REST API command.
3. **Run the deployment test** to confirm the production app can load data and perform writes.

## Locale Workaround

The Netlify CLI requires a valid locale. In containers that lack `en_US.UTF-8`, CLI commands
(`netlify deploy`, `netlify sites:create`) fail with locale errors. Always prefix Netlify CLI
commands with `LC_ALL=C` to avoid this.

The deploy script should set `LC_ALL=C` in the environment before spawning Netlify CLI
subprocesses.

**ANSI code contamination**: `LC_ALL=C` also prevents ANSI escape codes from appearing in
CLI output. Without it, extracting URLs or site IDs from `netlify deploy` output may capture
embedded escape sequences that corrupt parsed values and break subsequent `curl` calls. See
`skills/scripts/deploy-troubleshooting.md` for details.

## Netlify CLI Troubleshooting

The Netlify CLI (`npx netlify`) can fail in container environments. Common issues:

- **Locale errors**: Always prefix with `LC_ALL=C` (see Locale Workaround above).
- **`npx netlify` not found or crashes**: Verify `netlify-cli` is installed:
  `ls node_modules/.bin/netlify 2>/dev/null || npm install netlify-cli --save-dev`
- **Interactive prompts** (CRITICAL): Netlify CLI commands like `netlify sites:create` will
  prompt interactively for missing arguments (e.g., site name), which hangs in non-interactive
  shells. Always pass required arguments explicitly.
- **Authentication errors**: Ensure the command is wrapped with `exec-secrets NETLIFY_AUTH_TOKEN -- ...`
  so the token is available to the subprocess.
- **"Site not found" errors on deploy**: Run `npx netlify link --id $NETLIFY_SITE_ID` before
  deploying. This writes the site ID to `.netlify/state.json`.

All Netlify CLI commands in the deploy script should use `LC_ALL=C` and pipe output to the
log file rather than inheriting stdio.

## Database Schema Execution

When running schema scripts directly (outside the deploy script), use `npx tsx -e` with an
inline import rather than `npx tsx scripts/schema.ts`. The direct file invocation has known
module resolution issues with `@neondatabase/serverless`:

```bash
# This works reliably:
exec-secrets DATABASE_URL -- npx tsx -e "import { initSchema } from './scripts/schema.ts'; await initSchema(process.env.DATABASE_URL!);"
```

## JSON Parsing in Shell

**`jq` is not available in the container.** When you need to parse JSON from shell commands
(e.g., Neon API responses, Netlify CLI output), use `node -e` or `python3 -c` instead.

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` for schema sync.
- Reuse migration logic from `scripts/migrate-db.ts`.
- The deploy script reads `DATABASE_URL`, `NEON_PROJECT_ID`, `NETLIFY_SITE_ID` from
  `process.env`. These are provided by the `exec-secrets` wrapper.
- Read `.env.example` to determine which env vars to set on the Netlify site. Look up
  each variable name in `process.env` and set it via the Netlify REST API.
- Use `--json` with `netlify deploy` for machine-readable output.
- After deployment, verify the site URL returns 200 before proceeding to tests.
- Do NOT inherit stdio from subprocesses. Pipe all subprocess output to `logs/deploy.log`.
- Production builds must use `sourcemap: true`, `minify: false`, and the React development
  bundle (see `vite.config.ts` settings) so Replay recordings show readable source.
