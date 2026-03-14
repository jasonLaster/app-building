# Skill

During this stage you will deploy the app to production and test it to make sure it works.

## Unpack Subtasks

Unpack the initial deployment task into a single task:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[{ "skill": "skills/tasks/deployment.md", "app": "<AppName>", "subtasks": ["DoDeploy: Deploy the app to production", "TestDeploy: Test the deployed app"] }]
EOF
```

## Deployment

Before running the deploy script, run `list-secrets` to check whether the app has been
deployed before. If `NEON_PROJECT_ID`, `DATABASE_URL`, and `NETLIFY_SITE_ID` exist as
branch secrets, the deploy script will reuse existing resources.

If `NEON_PROJECT_ID` exists but `DATABASE_URL` does not, the old connection string was
leaked. You MUST reset the database password and store a fresh one. See
`skills/scripts/deploy.md` § "Redeployments" for the exact steps.

Ensure the locale workaround is in place — the deploy script must prefix Netlify CLI commands
with `LC_ALL=C` to avoid locale errors in the container. See `skills/scripts/deploy.md` §
"Locale Workaround". Also verify dependencies are installed: `ls node_modules/@neondatabase/serverless 2>/dev/null || npm install`.

Pre-deployment checklist:
1. Verify required secrets are available (run `list-secrets`):
   - `NEON_API_KEY`, `NETLIFY_AUTH_TOKEN`, `RECORD_REPLAY_API_KEY` — global secrets
   - `DATABASE_URL`, `NEON_PROJECT_ID`, `NETLIFY_SITE_ID` — branch secrets (if redeploying)
2. Verify the DB has been seeded with production data (the deploy script handles first-run seeding).
3. Ensure the deploy script runs fully non-interactively — no CLI prompts that hang in CI.
4. Ensure `public/_redirects` exists with `/* /index.html 200` for SPA routing. Without this,
   Netlify returns 404 for client-side routes when users navigate directly or refresh.

Then run `npm run deploy` from the app directory. See `skills/scripts/deploy.md` for the
full script specification. The script handles database creation/sync, Netlify site
creation/update, and writes the deployed URL to `deployment.txt`.

After the first deploy, you MUST set `DATABASE_URL` on the Netlify site so that production
Netlify Functions can connect to the database. Access it via `exec-secrets DATABASE_URL`.

Use the Netlify REST API to set environment variables — the CLI `npx netlify env:set --site`
flag does not work reliably. See `skills/scripts/netlify-env.md` for the exact API commands.

See `skills/scripts/deploy.md` § "Post-Deploy Checklist" for the full list.

After a successful deployment, you MUST append a deployment history entry to the end of
`deployment.txt`. The entry must include the date and a summary of what changed:

```
--- Deployment 2026-02-26 ---
Changes:
- Added user authentication flow
- Fixed pagination bug on accounts page
- Updated dashboard layout to match mockup
```

Use `git log` to determine what changed since the last deployment. If `deployment.txt`
already has history entries, compare against the most recent one. If this is the first
deployment, summarize the initial feature set.

## Testing

After deploying, you MUST perform a functional test to verify the app actually works in production.
A deployment that serves HTTP 200 is not sufficient — the app must display real data and support updates.

### Quick API Verification (Before Full Tests)

Before running the full Playwright deployment test, verify that API endpoints are responding
correctly using `curl`. This catches environment variable mismatches (e.g., missing `DATABASE_URL`)
much faster than a full test suite.

Freshly deployed Netlify Functions may return 502 during cold start. Use a retry loop to
handle propagation delay:

```bash
for i in 1 2 3; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://<site-url>/.netlify/functions/<function-name>)
  [ "$STATUS" = "200" ] && echo "API healthy" && break
  echo "Attempt $i: got $STATUS, retrying in 3s..."
  sleep 3
done
```

If this returns 500 on all attempts, fix the environment variables before proceeding. See
`skills/scripts/deploy-verification.md` for the full verification checklist.

### Verify Authentication (If Applicable)

If the app has login/signup functionality, verify that password hashes in the production
database match expected values after seeding. A common post-deploy failure is seed data using
plaintext passwords instead of bcrypt hashes, or hash rounds mismatching between seed and
auth code. Test the login endpoint with `curl` before running Playwright tests:

```bash
curl -s -X POST https://<site-url>/.netlify/functions/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"<seed-email>","password":"<seed-password>"}'
```

If login returns 401 or 500, check the seed script's password hashing and the auth function's
hash comparison. Fix before proceeding to Playwright tests.

### Playwright Deployment Test

The deployment test lives at `tests/deployment.spec.ts`, separate from the integration tests.
It must be excluded from regular `npm run test` runs by adding it to `testIgnore` in
`playwright.config.ts`:

```ts
testIgnore: ['**/deployment.spec.ts'],
```

The deployment test has its own config at `playwright.deployment.config.ts` which uses
`@replayio/playwright` to launch the Replay browser and auto-upload recordings.
All browsers must run headless — never use Xvfb or set `DISPLAY`.

```
npx playwright test --config playwright.deployment.config.ts
```

### Functional Test Requirements

The functional test must verify:
1. **Data displays**: Navigate to the main page and confirm that real data (e.g. client records) loads and renders visibly.
2. **Data can be updated**: Perform a write operation (e.g. add or edit a record) and confirm the change persists.

If either check fails, the deployment is broken and must be investigated and fixed before marking the task complete.

### Recording with Replay

All functional tests MUST be recorded using the Replay Playwright integration so that
the Replay browser is used to launch and interact with the deployed page, and failures
can be debugged from the recording.

The deployment test is a SINGLE Playwright test at `tests/deployment.spec.ts` that
runs against the deployed production URL (read from `deployment.txt`). It uses a
separate config (`playwright.deployment.config.ts`) that launches the Replay browser
via `@replayio/playwright` and auto-uploads recordings. It does not start a dev server
or reuse the integration test config.

#### Analyzing the Recording

After the test runs and the recording is uploaded, use Replay MCP tools to analyze
the recording and verify the app works correctly. If the test fails, use the recording
to diagnose the root cause before attempting a fix.

A deployment is only complete when the Replay recording confirms that the app displays data and
supports updates. Record the Replay recording ID in the deployment notes.

Read these skills to learn how to use these:

https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-playwright/SKILL.md
https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-mcp/SKILL.md

## Troubleshooting DATABASE_URL Conflicts

If deployment tests or API calls fail with 500 errors despite `DATABASE_URL` being set on the
Netlify site, the cause may be an account-level `DATABASE_URL` overriding the site-level value.
Netlify account-level env vars take precedence over site-level ones.

To diagnose and fix:

1. **Check account-level env vars:**
   ```bash
   exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- curl -s \
     -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
     "https://api.netlify.com/api/v1/accounts/$NETLIFY_ACCOUNT_SLUG/env" | python3 -c "
   import sys, json
   for v in json.load(sys.stdin):
       if 'DATABASE' in v['key']:
           print(v['key'], '=', v['values'][0]['value'][:30] if v['values'] else '(empty)')
   "
   ```

2. **Verify the database is reachable:** Query it directly to confirm the URL is correct:
   ```bash
   node --input-type=module -e "import { neon } from '@neondatabase/serverless'; const sql = neon('$DATABASE_URL'); const r = await sql\`SELECT 1\`; console.log(r);"
   ```

3. **Override at site level with production context:** Use `"context": "production"` (not `"all"`)
   when setting the override via the Netlify REST API. Using `"all"` returns a 422 error.
   See `skills/scripts/deploy.md` § "Post-Deploy Checklist" for the exact API command.

## Tips

- Do NOT use the `replayio record <url>` CLI to create recordings. It launches a headed browser
  which will crash in this headless container (`Missing X server or $DISPLAY`). Always use the
  Playwright deployment test config (`playwright.deployment.config.ts`) which runs headless with
  `@replayio/playwright` and handles browser setup correctly.
- Do NOT install or start Xvfb. All browsers must run headless. If a browser complains about
  a missing display, the fix is to ensure it runs headless, not to add a virtual display.
- NEVER stop, cancel, or skip a Replay recording upload that is in progress. The upload is a
  prerequisite for Replay MCP analysis, which is mandatory for verifying the deployment. If the
  upload is taking a long time, WAIT for it to finish. Do NOT decide you have "enough information"
  and proceed without the recording — you must complete the full upload → MCP analysis cycle.
