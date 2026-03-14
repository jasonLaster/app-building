# netlify-deploy

## Purpose

Safe procedure for running `netlify deploy` in container environments where ANSI escape
codes and locale issues can corrupt output parsing.

## Procedure

### 1. Strip ANSI codes from output

`netlify deploy` output may contain terminal color codes that corrupt parsed values
(site IDs, URLs). Always strip ANSI codes before parsing:

```bash
LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions 2>&1 \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | tee logs/deploy-raw.log
```

Alternatively, use `--json` if the CLI version supports it, which produces
machine-readable output without ANSI codes.

### 2. Verify the deployed URL

After deployment, confirm the site is reachable before running tests:

```bash
DEPLOY_URL="<extracted-url>"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
if [ "$STATUS" != "200" ]; then
  echo "ERROR: Site returned $STATUS"
fi
```

### 3. Pre-deploy checklist

Before running `netlify deploy`:

- [ ] `npm run check` passes from the app directory
- [ ] `vite build` succeeds (check `logs/deploy.log`)
- [ ] Required env vars are set on Netlify (`DATABASE_URL`, etc.) — use
  `skills/scripts/netlify-env.md` for the REST API approach
- [ ] Site ID (branch secret `NETLIFY_SITE_ID`) is correct
- [ ] `LC_ALL=C` is set to prevent locale errors

## Common Issues

- **ANSI-corrupted site ID**: If `NETLIFY_SITE_ID` contains escape codes,
  subsequent `curl` and `netlify` commands fail silently. Re-extract the clean ID from
  the Netlify dashboard and store it with `set-branch-secret`.
- **502 on first deploy**: Usually caused by missing environment variables on the Netlify
  site. Set them via the REST API before deploying (see `skills/scripts/netlify-env.md`).

See also: `skills/scripts/deploy.md` for the full deploy script specification.
