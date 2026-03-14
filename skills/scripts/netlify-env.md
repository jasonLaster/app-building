# netlify-env

## Purpose

Sets environment variables on a Netlify site. The Netlify CLI (`npx netlify env:set`) frequently
fails with "No project id found" errors in monorepo and CI environments. Use the Netlify REST API
instead.

## Usage

Use `curl` to call the Netlify API directly. This is more reliable than the CLI. All
commands must be wrapped with `exec-secrets` since `NETLIFY_AUTH_TOKEN` and
`NETLIFY_ACCOUNT_SLUG` are not directly in the environment.

### Set an environment variable

```bash
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- curl -s -X POST \
  "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"key":"DATABASE_URL","values":[{"value":"'"$DATABASE_URL"'","context":"all"}]}]'
```

### Update an existing environment variable

```bash
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- curl -s -X PATCH \
  "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env/DATABASE_URL?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"'"$DATABASE_URL"'","context":"all"}'
```

## Required Secrets

- `NETLIFY_AUTH_TOKEN`: API authentication token (accessed via `exec-secrets`).
- `NETLIFY_ACCOUNT_SLUG`: The Netlify account slug (accessed via `exec-secrets`).
- `NETLIFY_SITE_ID`: The site to set the variable on (from `.env`, passed as query parameter).

### Verify an environment variable

```bash
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- curl -s \
  "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env/DATABASE_URL?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN"
```

### Canonical workflow

1. Read the value from `.env` (or `deployment.txt`).
2. Set via `curl -X POST` (for new variables) or `curl -X PATCH` (for existing ones).
3. Verify via `curl -X GET` to confirm the value was set correctly.

Always use POST for initial creation. Using PATCH on a non-existent variable returns an error.

## Notes

- Do NOT use `npx netlify env:set` or `npx netlify env:get` — these commands fail in contexts
  where the CLI cannot resolve the project ID (monorepos, missing `.netlify/state.json`).
- The POST endpoint creates a new variable. If the variable already exists, use PATCH to update it.
- The `context` field controls which deploy contexts see the variable. Use `"all"` for production
  and preview deploys.
