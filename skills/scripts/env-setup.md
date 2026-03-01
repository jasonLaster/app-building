# env-setup

## Purpose

Documents environment prerequisites that must be in place before running app scripts
(test, deploy, check). Many command failures stem from missing environment variables or
locale configuration — verify these before running scripts.

## Required Environment Variables

### Container-level (already set in the worker container)

| Variable | Used by |
|---|---|
| `NEON_API_KEY` | test, deploy (Neon branch/project management) |
| `RECORD_REPLAY_API_KEY` | test (Replay recording uploads) |
| `NETLIFY_AUTH_TOKEN` | deploy (Netlify CLI authentication) |
| `NETLIFY_ACCOUNT_SLUG` | deploy (Netlify site creation) |

### App-level (in each app's `.env` file)

| Variable | Used by | How to get |
|---|---|---|
| `NEON_PROJECT_ID` | test, deploy | From `deployment.txt` (`neon_project_id`) or created by deploy script |
| `DATABASE_URL` | test, deploy | From `deployment.txt` (`database_url`) or created by deploy script |
| `NETLIFY_SITE_ID` | deploy | From `deployment.txt` (`site_id`) or created by deploy script |

### Verifying environment variables

Before running tests or deploy, verify required variables are set:

```bash
# Container-level
echo $NEON_API_KEY | head -c 5       # should show first chars
echo $NETLIFY_AUTH_TOKEN | head -c 5  # should show first chars

# App-level (from app directory)
grep NEON_PROJECT_ID .env
grep DATABASE_URL .env
```

If `.env` is missing but the app has been deployed before, populate it from `deployment.txt`.
See `skills/scripts/deploy.md` § "Populating `.env` for Redeployments".

## Locale Configuration

The Netlify CLI requires a valid locale. Containers that lack `en_US.UTF-8` will cause
`netlify deploy` and `netlify sites:create` to fail with locale errors.

**Workaround**: Prefix Netlify CLI commands with `LC_ALL=C`:

```bash
LC_ALL=C npx netlify deploy --prod ...
```

See `skills/scripts/deploy.md` § "Locale Workaround" for details.

## Node Modules

Before running scripts, verify `node_modules` exists and key dependencies are installed:

```bash
ls node_modules/@neondatabase/serverless 2>/dev/null || npm install
```

If `@neondatabase/serverless` is missing, run `npm install` from the app directory. Note that
direct `npx tsx` invocation may fail on this dependency even when installed — always use
`npm run` wrappers (see `skills/scripts/test.md`).
