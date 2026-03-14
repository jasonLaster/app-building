# env-setup

## Purpose

Documents environment prerequisites that must be in place before running app scripts
(test, deploy, check). Many command failures stem from missing environment variables or
locale configuration — verify these before running scripts.

## Required Environment Variables

### Container-level (accessed via `exec-secrets`, NOT directly in the environment)

| Variable | Used by |
|---|---|
| `NEON_API_KEY` | test, deploy (Neon branch/project management) |
| `RECORD_REPLAY_API_KEY` | test (Replay recording uploads) |
| `NETLIFY_AUTH_TOKEN` | deploy (Netlify CLI authentication) |
| `NETLIFY_ACCOUNT_SLUG` | deploy (Netlify site creation) |

These secrets are NOT set in the environment. Use `exec-secrets` to make them available
to any command that needs them. See the Secrets section in `AGENTS.md` for usage.

### Branch-level (stored as branch secrets via `set-branch-secret`)

| Variable | Used by | How to get |
|---|---|---|
| `NEON_PROJECT_ID` | test, deploy | Created by deploy script, stored via `set-branch-secret` |
| `DATABASE_URL` | test, deploy | Created by deploy script, stored via `set-branch-secret` |
| `NETLIFY_SITE_ID` | deploy | Created by deploy script, stored via `set-branch-secret` |

These are stored in Infisical as branch secrets and loaded automatically at container
startup. Access them via `exec-secrets` just like container-level secrets:

```bash
exec-secrets DATABASE_URL -- npx tsx scripts/schema.ts "$DATABASE_URL"
```

### Verifying secrets

Use `list-secrets` to verify which secrets are available:

```bash
list-secrets
```

All secrets (both container-level and branch-level) are accessed via `exec-secrets`.
They are NOT set in the environment directly.

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
