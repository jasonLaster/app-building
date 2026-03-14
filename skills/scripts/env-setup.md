# env-setup

## Purpose

Documents environment prerequisites that must be in place before running app scripts
(test, deploy, check). Many command failures stem from missing secrets or locale
configuration — verify these before running scripts.

## Required Secrets

All secrets are accessed via `exec-secrets`. Run `list-secrets` to see what's available.

### Global secrets (set up once, shared across all branches)

| Variable | Used by |
|---|---|
| `NEON_API_KEY` | test, deploy (Neon branch/project management) |
| `RECORD_REPLAY_API_KEY` | test (Replay recording uploads) |
| `NETLIFY_AUTH_TOKEN` | deploy (Netlify CLI authentication) |
| `NETLIFY_ACCOUNT_SLUG` | deploy (Netlify site creation) |

### Branch secrets (created at deploy time via `set-branch-secret`)

| Variable | Used by |
|---|---|
| `NEON_PROJECT_ID` | test, deploy |
| `DATABASE_URL` | test, deploy |
| `NETLIFY_SITE_ID` | deploy |

These are stored in Infisical and loaded automatically at container startup.

If `NEON_PROJECT_ID` exists but `DATABASE_URL` does not, the old connection string was
leaked. You must reset the database password. See `skills/scripts/deploy.md` § "Redeployments".

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
