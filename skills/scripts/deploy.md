# deploy

## Purpose

Creates and/or syncs the production Neon database and creates and/or updates the Netlify site.
This is the single command for deploying the app to production. Deployment resources
(`DATABASE_URL`, `NEON_PROJECT_ID`, `NETLIFY_SITE_ID`) are stored as branch secrets.
`deployment.txt` only contains the public URL and timestamp.

## Usage

- `package.json` entry: `"deploy": "tsx scripts/deploy.ts"`
- No command-line arguments.
- Example: `npm run deploy`

## Behavior

### Database setup (first run)

1. Check branch secrets (`list-secrets`) for an existing `NEON_PROJECT_ID`. If not present:
   a. Create a new Neon project via the Neon API.
   b. Store `NEON_PROJECT_ID` and `DATABASE_URL` as branch secrets via `set-branch-secret`.

### Database schema sync (every run)

2. Call `initSchema(productionDatabaseUrl)` to create any missing tables.
3. Run migrations (`migrate-db` logic) against the production database to handle `ALTER TABLE`
   changes that `initSchema` cannot detect.

### Seed data (first deployment only)

4. On the **first deployment** (i.e. the database was just created), insert seed data that
   demonstrates the app's features. The seed data should be realistic and cover the main
   entities and relationships so a user can immediately explore the app without needing to
   create everything from scratch. Skip seeding on subsequent deployments.

### Netlify site setup (first run)

5. Check branch secrets (`list-secrets`) for an existing `NETLIFY_SITE_ID`. If not present:
   a. Create a new Netlify site via `netlify sites:create`.
   b. Store `NETLIFY_SITE_ID` as a branch secret via `set-branch-secret`.

### Build and deploy (every run)

6. Build the app (`vite build`). Pipe build output to the log file.
7. Deploy to Netlify (`netlify deploy --prod`). Pipe deploy output to the log file.
8. Write the deployed `url` and `deployed_at` to the top of `deployment.txt` (overwriting
   the previous resource block but preserving any deployment history entries below).
9. Print a one-line summary to stdout:
   - Success: `Deployed to <url>`
   - Failure: `Deploy failed (build|netlify) — see logs/deploy.log`

## Storing Deployment Secrets

When the deploy script creates new resources (Neon project, Netlify site), store all three
values as branch secrets via `set-branch-secret`: `NEON_PROJECT_ID`, `DATABASE_URL`, and
`NETLIFY_SITE_ID`. These are never written to `deployment.txt` or `.env`.

Write API responses to files first, then extract values and pipe to `set-branch-secret`:

```bash
# Example: after creating a Neon project
exec-secrets NEON_API_KEY -- bash -c 'curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"project\":{\"name\":\"my-app\"}}" \
  https://console.neon.tech/api/v2/projects > /tmp/neon-resp.json'
python3 -c "import json; print(json.load(open('/tmp/neon-resp.json'))['project']['id'])" | set-branch-secret NEON_PROJECT_ID
python3 -c "import json; r=json.load(open('/tmp/neon-resp.json')); print(r['connection_uris'][0]['connection_uri'])" | set-branch-secret DATABASE_URL
```

## Redeployments

On redeployment, check `list-secrets` for existing `NEON_PROJECT_ID`, `DATABASE_URL`, and
`NETLIFY_SITE_ID`. If all three exist, the deploy script can reuse the existing resources.

If none of the three branch secrets exist, check whether `deployment.txt` has old-format
resource info (it may contain `neon_project_id`, `site_id`, or `database_url` from before
the secrets system was introduced). Follow the migration steps below.

If there is no `deployment.txt` either, this is a first deploy — the script creates new
resources.

## Migrating from old deployment.txt format

Old `deployment.txt` files may contain `neon_project_id`, `site_id`, and `database_url`.
These need to be migrated to branch secrets. **CRITICAL: the `database_url` in
`deployment.txt` is leaked (committed to git) and MUST NOT be reused.** You must reset
the database password and obtain a fresh connection string.

Step 1 — Store the non-sensitive identifiers. These are safe to read from `deployment.txt`
directly (they are just identifiers, not credentials):

```bash
grep neon_project_id deployment.txt | cut -d' ' -f2 | set-branch-secret NEON_PROJECT_ID
grep site_id deployment.txt | cut -d' ' -f2 | set-branch-secret NETLIFY_SITE_ID
```

Step 2 — Reset the database password and store a fresh `DATABASE_URL`. Do NOT use the
`database_url` from `deployment.txt` — it is compromised:

```bash
# Get branches
exec-secrets NEON_API_KEY NEON_PROJECT_ID -- bash -c 'curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" > /tmp/branches.json'

# Extract main branch ID
BRANCH_ID=$(python3 -c "import json; bs=json.load(open('/tmp/branches.json'))['branches']; print(next(b['id'] for b in bs if b.get('primary',False) or b['name']=='main'))")

# Reset password (use single quotes for bash -c to avoid escaping issues)
exec-secrets NEON_API_KEY NEON_PROJECT_ID -- bash -c 'curl -s -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/'"$BRANCH_ID"'/roles/neondb_owner/reset_password" > /tmp/reset.json'

# Get endpoint host
exec-secrets NEON_API_KEY NEON_PROJECT_ID -- bash -c 'curl -s \
  -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/endpoints" > /tmp/endpoints.json'

# Store fresh DATABASE_URL
python3 -c "
import json
pw = json.load(open('/tmp/reset.json'))['role']['password']
host = json.load(open('/tmp/endpoints.json'))['endpoints'][0]['host']
print(f'postgresql://neondb_owner:{pw}@{host}/neondb?sslmode=require')
" | set-branch-secret DATABASE_URL
```

Step 3 — Strip secrets from `deployment.txt`, keeping only `url` and `deployed_at`.

After migration, all three branch secrets are set and subsequent deploys will use them.

## Inputs

- **Secrets** (accessed via `exec-secrets`, not directly in the environment):
  - `NEON_API_KEY` (required): For Neon project/database management.
  - `NETLIFY_AUTH_TOKEN` (required): For Netlify CLI authentication.
  - `NETLIFY_ACCOUNT_SLUG` (required): For Netlify site creation.
  - `NEON_PROJECT_ID`, `DATABASE_URL`, `NETLIFY_SITE_ID` (branch secrets): Created on
    first deploy, reused on subsequent deploys.
  The deploy script (or `npm run deploy`) must be invoked via `exec-secrets`:
  `exec-secrets NEON_API_KEY NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG DATABASE_URL NEON_PROJECT_ID NETLIFY_SITE_ID -- npm run deploy`
- **Files**:
  - `deployment.txt`: Contains `url` and `deployed_at` from the last deployment
    (committed to git). Deployment history entries follow below.

## Outputs

- **stdout**: One-line summary only.
- **`logs/deploy.log`**: Full build and deploy output. Overwritten each run.
- **Branch secrets**: `DATABASE_URL`, `NEON_PROJECT_ID`, `NETLIFY_SITE_ID` stored via
  `set-branch-secret` if created.
- **`deployment.txt`**: Updated with the deployed `url` and `deployed_at`. Deployment
  history entries below the resource block are preserved. The deployment skill appends
  a new history entry after each successful deploy.
- **Side effects**:
  - Creates Neon project (first run only).
  - Syncs production database schema (every run).
  - Creates Netlify site (first run only).
  - Deploys built app to Netlify (every run).
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
# Check account-level env vars
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- curl -s \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/accounts/$NETLIFY_ACCOUNT_SLUG/env" | python3 -c "
import sys, json
for v in json.load(sys.stdin):
    print(v['key'], '=', v['values'][0]['value'][:20] if v['values'] else '(empty)')
"

# If DATABASE_URL exists at account level, delete or override it at site level
# Use context "production" (not "all") when setting site-level overrides
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- curl -s -X PATCH \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.netlify.com/api/v1/accounts/$NETLIFY_ACCOUNT_SLUG/env/DATABASE_URL" \
  -d '{"context":"production","value":"<correct-database-url>"}'
```

Use the Netlify REST API to set environment variables — the CLI `npx netlify env:set --site`
flag is unreliable and silently fails in many environments. See `skills/scripts/netlify-env.md`
for the working REST API approach.

1. **Check existing env vars**: Use the Netlify REST API or `LC_ALL=C npx netlify env:list --json --site $NETLIFY_SITE_ID`
2. **Set `DATABASE_URL`**: See `skills/scripts/netlify-env.md` for the REST API command.
   Use `exec-secrets DATABASE_URL` to access the value when setting it on Netlify.
3. **Run the deployment test** (`npx playwright test --config playwright.deployment.config.ts`)
   to confirm the production app can load data and perform writes.

## Locale Workaround

The Netlify CLI requires a valid locale. In containers that lack `en_US.UTF-8`, CLI commands
(`netlify deploy`, `netlify sites:create`) fail with locale errors. Always prefix Netlify CLI
commands with `LC_ALL=C` to avoid this:

```bash
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- bash -c 'LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions'
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- bash -c 'LC_ALL=C npx netlify sites:create --account-slug $NETLIFY_ACCOUNT_SLUG'
```

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
- **Direct invocation fails**: If `npx netlify` fails, try the full path:
  `./node_modules/.bin/netlify deploy --prod ...`
- **Both invocation methods fail**: The CLI may not be installed globally or locally. Install
  it explicitly: `npm install netlify-cli --save-dev`, then use `npx netlify`.
- **Interactive prompts** (CRITICAL): Netlify CLI commands like `netlify sites:create` will
  prompt interactively for missing arguments (e.g., site name), which hangs in non-interactive
  shells. The deploy script must NEVER produce interactive prompts. Always pass required
  arguments explicitly (e.g., `--name <site-name>` or `--site <site-id>`). Test the script
  end-to-end in a non-interactive shell before considering it complete.
- **Authentication errors**: Ensure the command is wrapped with `exec-secrets NETLIFY_AUTH_TOKEN -- ...`
  so the token is available to the subprocess.
- **"Site not found" errors on deploy**: If `netlify deploy` fails with a site-not-found error,
  run `npx netlify link --id $NETLIFY_SITE_ID` before deploying. This writes the site ID to
  `.netlify/state.json`, which the CLI reads to identify the target site. The site ID is
  available as a branch secret via `exec-secrets NETLIFY_SITE_ID`.

All Netlify CLI commands in the deploy script should use `LC_ALL=C` and pipe output to the
log file rather than inheriting stdio.

## Database Schema Execution

When running schema scripts directly (outside the deploy script), use `npx tsx -e` with an
inline import rather than `npx tsx scripts/schema.ts`. The direct file invocation has known
module resolution issues with `@neondatabase/serverless`:

```bash
# This often fails with module resolution errors:
npx tsx scripts/schema.ts

# This works reliably:
exec-secrets DATABASE_URL -- npx tsx -e "import { initSchema } from './scripts/schema.ts'; await initSchema(process.env.DATABASE_URL!);"
```

The deploy script handles this internally, but if you need to run schema operations manually
(e.g., during initial setup or debugging), use the inline import pattern.

## JSON Parsing in Shell

**`jq` is not available in the container.** When you need to parse JSON from shell commands
(e.g., Neon API responses, Netlify CLI output), use `node -e` or `python3 -c` instead.
Example:

```bash
curl -s ... | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).key))"
```

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` for schema sync.
- Reuse migration logic from `scripts/migrate-db.ts`.
- Use the Neon REST API (`https://console.neon.tech/api/v2/...`) with `NEON_API_KEY` for
  project creation. Example:
  ```bash
  exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"project":{"name":"my-app"}}' \
    https://console.neon.tech/api/v2/projects
  ```
- When running one-off database queries with `node -e`, use `--input-type=module` for ESM
  packages like `@neondatabase/serverless`:
  ```bash
  node --input-type=module -e "import { neon } from '@neondatabase/serverless'; const sql = neon('...'); const r = await sql\`SELECT 1\`; console.log(r);"
  ```
  Do NOT use `require()` with ESM-only packages — it will fail.
- Use `exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- netlify sites:create --account-slug $NETLIFY_ACCOUNT_SLUG` for site creation.
- Use `exec-secrets NETLIFY_AUTH_TOKEN -- netlify deploy --prod --dir dist --functions ./netlify/functions` for deployment.
  If available, use `--json` to get machine-readable output that avoids ANSI escape code
  parsing issues.
- After deployment, verify the site URL returns 200 before proceeding to tests:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" <deployed-url>
  ```
- Do NOT inherit stdio from subprocesses. Pipe all subprocess output to `logs/deploy.log`.
- Production builds must use `sourcemap: true`, `minify: false`, and the React development
  bundle (see `vite.config.ts` settings) so Replay recordings show readable source.
