# netlify-env

## Purpose

Sets environment variables on a Netlify site. The Netlify CLI (`npx netlify env:set`) frequently
fails with "No project id found" errors in monorepo and CI environments. Use the Netlify REST API
instead.

## Usage

Use `curl` to call the Netlify API directly. This is more reliable than the CLI.

### Set an environment variable

```bash
curl -s -X POST "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"key":"DATABASE_URL","values":[{"value":"'"$DATABASE_URL"'","context":"all"}]}]'
```

### Update an existing environment variable

```bash
curl -s -X PATCH "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env/DATABASE_URL?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"'"$DATABASE_URL"'","context":"all"}'
```

## Required Environment Variables

- `NETLIFY_AUTH_TOKEN`: API authentication token.
- `NETLIFY_ACCOUNT_SLUG`: The Netlify account slug (used in the API path).
- `NETLIFY_SITE_ID`: The site to set the variable on (passed as query parameter).

## Notes

- Do NOT use `npx netlify env:set` or `npx netlify env:get` — these commands fail in contexts
  where the CLI cannot resolve the project ID (monorepos, missing `.netlify/state.json`).
- The POST endpoint creates a new variable. If the variable already exists, use PATCH to update it.
- The `context` field controls which deploy contexts see the variable. Use `"all"` for production
  and preview deploys.
