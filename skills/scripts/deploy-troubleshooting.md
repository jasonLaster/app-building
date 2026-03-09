# deploy-troubleshooting

## Purpose

Documents known issues and workarounds encountered during deployment that are not covered
in the main `deploy.md` skill.

## ANSI Escape Codes in Netlify CLI Output

The Netlify CLI outputs ANSI escape sequences (color codes, cursor movement) that break
programmatic parsing of its output. When extracting values like site IDs or URLs from
CLI output, strip ANSI codes before parsing:

```ts
const clean = output.replace(/\x1b\[[0-9;]*m/g, '');
```

This is especially important when the deploy script captures `netlify sites:create` or
`netlify deploy` output to extract site IDs or URLs. Without stripping, regex matches
will fail on the embedded escape sequences.

## Peer Dependency Conflicts (`--legacy-peer-deps`)

Installing `netlify-cli` and some ESLint packages triggers npm strict peer dependency
errors. Use `--legacy-peer-deps` when installing packages in app directories:

```bash
npm install --legacy-peer-deps
```

This should be the default approach for `npm install` in this ecosystem, since peer
dependency conflicts recur across multiple packages.

## `NETLIFY_SITE_ID` Environment Variable vs `--site` Flag

Some Netlify CLI commands do not support the `--site` flag (e.g., older versions of
`netlify env:list`). Instead, set the `NETLIFY_SITE_ID` environment variable:

```bash
NETLIFY_SITE_ID=<site-id> LC_ALL=C npx netlify env:list --json
```

Alternatively, use the Netlify REST API directly for environment variable management
(see `skills/scripts/netlify-env.md`), which avoids CLI flag issues entirely.

## Netlify Functions v2 URL Paths

Netlify Functions v2 uses the `/api/` prefix, **not** `/.netlify/functions/`. Requests to
`/.netlify/functions/<name>` will return 404 on Functions v2.

- **Frontend code** must use `/api/<function-name>` for all function calls.
- **curl verification** must also use `/api/`:

```bash
curl -s -o /dev/null -w "%{http_code}" https://<site-url>/api/<function-name>
```

If you see 404 errors when testing deployed functions, check whether the URL uses the old
`/.netlify/functions/` path and switch to `/api/`.

## `npm run deploy` Known Failure Modes

`npm run deploy` has a ~60% multi-attempt rate. Common failure modes and workarounds:

1. **TypeScript errors blocking build**: The deploy script runs `vite build` which typechecks.
   Fix all `npm run check` errors before deploying.
2. **Incorrect CLI flags**: Flags like `--json` may not be supported by all versions of the
   Netlify CLI. If a flag causes errors, remove it and use the REST API instead.
3. **REST API fallback**: When Netlify CLI commands fail repeatedly, use the Netlify REST API
   directly with `curl`. This is more reliable than the CLI in container environments:
   ```bash
   # Deploy using the REST API (zip dist/ first, then POST)
   curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
     -H "Content-Type: application/zip" \
     --data-binary @dist.zip \
     "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys"
   ```

Limit deployment retries to 3 attempts. If all fail, diagnose the root cause from
`logs/deploy.log` rather than retrying blindly.

## DATABASE_URL Verification After Deploy

After deployment, always verify the production API works before running full Playwright
deployment tests. Use `curl` to test a backend endpoint:

```bash
curl -s -o /dev/null -w "%{http_code}" https://<site-url>/api/<function-name>
```

A 500 response typically means `DATABASE_URL` is not set on the Netlify site. Set it
using the Netlify REST API (see `skills/scripts/netlify-env.md` and
`skills/scripts/deploy-verification.md`) before proceeding with deployment tests.
