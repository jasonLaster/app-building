# deploy

## Purpose

Creates and/or syncs the production Neon database and creates and/or updates the Netlify site.
This is the single command for deploying the app to production. All project information
(database URL, Netlify site ID, etc.) is persisted in `.env` so subsequent runs reuse existing
resources.

## Usage

- `package.json` entry: `"deploy": "tsx scripts/deploy.ts"`
- No command-line arguments.
- Example: `npm run deploy`

## Behavior

### Database setup (first run)

1. Check `.env` for an existing `NEON_PROJECT_ID`. If not present:
   a. Create a new Neon project via the Neon API.
   b. Write `NEON_PROJECT_ID` and `DATABASE_URL` to `.env`.

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

5. Check `.env` for an existing `NETLIFY_SITE_ID`. If not present:
   a. Create a new Netlify site via `netlify sites:create`.
   b. Write `NETLIFY_SITE_ID` to `.env`.

### Build and deploy (every run)

6. Build the app (`vite build`). Pipe build output to the log file.
7. Deploy to Netlify (`netlify deploy --prod`). Pipe deploy output to the log file.
8. Write the deployed URL, `site_id`, `neon_project_id`, and `database_url` to the top of `deployment.txt`
   (overwriting the previous resource block but preserving any deployment history entries below).
9. Print a one-line summary to stdout:
   - Success: `Deployed to <url>`
   - Failure: `Deploy failed (build|netlify) — see logs/deploy.log`

## Populating `.env` for Redeployments

`.env` is gitignored and will not exist in a fresh environment. If the app has been
deployed before, you MUST populate `.env` before running the script so it reuses the
existing Netlify site and Neon database instead of creating new ones.

Read `deployment.txt` (committed to git) to get all previously stored deployment
values (`site_id`, `neon_project_id`, `database_url`). Write them to `.env`:

```
NETLIFY_SITE_ID=<site_id from deployment.txt>
NEON_PROJECT_ID=<neon_project_id from deployment.txt>
DATABASE_URL=<database_url from deployment.txt>
```

If `.env` is missing these values the script will create **new** resources, which means
a new URL and an empty database. Always check `deployment.txt` first.

## Inputs

- **Environment variables**:
  - `NEON_API_KEY` (required): For Neon project/database management.
  - `NETLIFY_AUTH_TOKEN` (required): For Netlify CLI authentication.
  - `NETLIFY_ACCOUNT_SLUG` (required): For Netlify site creation.
- **Files**:
  - `.env`: Read for existing project info (`NEON_PROJECT_ID`, `DATABASE_URL`,
    `NETLIFY_SITE_ID`). Written to on first run.
  - `deployment.txt`: Resource block at the top contains `site_id`, `neon_project_id`, and
    `database_url` from the last deployment (committed to git). Use this to populate `.env`
    when deploying in a fresh environment. Deployment history entries follow below.

## Outputs

- **stdout**: One-line summary only.
- **`logs/deploy.log`**: Full build and deploy output. Overwritten each run.
- **`.env`**: Updated with `NEON_PROJECT_ID`, `DATABASE_URL`, `NETLIFY_SITE_ID` if created.
- **`deployment.txt`**: Resource block at the top is updated with the current deployed URL,
  `site_id`, `neon_project_id`, and `database_url`. Deployment history entries below the
  resource block are preserved. The deployment skill appends a new history entry after
  each successful deploy.
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
curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/accounts/$NETLIFY_ACCOUNT_SLUG/env" | python3 -c "
import sys, json
for v in json.load(sys.stdin):
    print(v['key'], '=', v['values'][0]['value'][:20] if v['values'] else '(empty)')
"

# If DATABASE_URL exists at account level, delete or override it at site level
# Use context "production" (not "all") when setting site-level overrides
curl -s -X PATCH -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.netlify.com/api/v1/accounts/$NETLIFY_ACCOUNT_SLUG/env/DATABASE_URL" \
  -d '{"context":"production","value":"<correct-database-url>"}'
```

Use the Netlify REST API to set environment variables — the CLI `npx netlify env:set --site`
flag is unreliable and silently fails in many environments. See `skills/scripts/netlify-env.md`
for the working REST API approach.

1. **Check existing env vars**: Use the Netlify REST API or `LC_ALL=C npx netlify env:list --json --site $NETLIFY_SITE_ID`
2. **Set `DATABASE_URL`**: See `skills/scripts/netlify-env.md` for the REST API command.
   The deploy script writes `DATABASE_URL` to `.env` but does NOT automatically set it on Netlify.
   You must set it manually after the first deploy.
3. **Run the deployment test** (`npx playwright test --config playwright.deployment.config.ts`)
   to confirm the production app can load data and perform writes.

## Exporting `.env` for Shell Commands

`source .env` does NOT export variables — they are only available in the current shell, not in
subprocesses or `curl` commands. When you need `.env` values in shell commands, use:

```bash
export $(grep -v '^#' .env | xargs)
```

This exports all non-comment lines as environment variables accessible to subprocesses.

## Locale Workaround

The Netlify CLI requires a valid locale. In containers that lack `en_US.UTF-8`, CLI commands
(`netlify deploy`, `netlify sites:create`) fail with locale errors. Always prefix Netlify CLI
commands with `LC_ALL=C` to avoid this:

```bash
LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions
LC_ALL=C npx netlify sites:create --account-slug $NETLIFY_ACCOUNT_SLUG
```

The deploy script should set `LC_ALL=C` in the environment before spawning Netlify CLI
subprocesses.

**ANSI code contamination**: `LC_ALL=C` also prevents ANSI escape codes from appearing in
CLI output. Without it, extracting URLs or site IDs from `netlify deploy` output may capture
embedded escape sequences that corrupt `.env` values and break subsequent `curl` calls. See
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
- **Authentication errors**: Verify `NETLIFY_AUTH_TOKEN` is set:
  `echo $NETLIFY_AUTH_TOKEN | head -c 5`

All Netlify CLI commands in the deploy script should use `LC_ALL=C` and pipe output to the
log file rather than inheriting stdio.

## Implementation Tips

- Reuse `initSchema` from `scripts/schema.ts` for schema sync.
- Reuse migration logic from `scripts/migrate-db.ts`.
- Use the Neon REST API (`https://console.neon.tech/api/v2/...`) with `NEON_API_KEY` for
  project creation. Example:
  ```bash
  curl -s -H "Authorization: Bearer $NEON_API_KEY" \
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
- Use `netlify sites:create --account-slug $NETLIFY_ACCOUNT_SLUG` for site creation.
- Use `netlify deploy --prod --dir dist --functions ./netlify/functions` for deployment.
  If available, use `--json` to get machine-readable output that avoids ANSI escape code
  parsing issues.
- After deployment, verify the site URL returns 200 before proceeding to tests:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" <deployed-url>
  ```
- Do NOT inherit stdio from subprocesses. Pipe all subprocess output to `logs/deploy.log`.
- Read/write `.env` using `fs` — parse as key=value lines, append new entries, don't
  clobber existing values.
- Production builds must use `sourcemap: true`, `minify: false`, and the React development
  bundle (see `vite.config.ts` settings) so Replay recordings show readable source.
