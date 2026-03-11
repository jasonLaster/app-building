# curl-api

## Purpose

Standard patterns for making API calls with `curl` in shell scripts and one-off commands.
Proper quoting prevents auth failures and silent errors.

## Shell Quoting Rules

### Always double-quote variables in headers

```bash
# CORRECT — variable is expanded and properly quoted
curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  "https://console.neon.tech/api/v2/projects"

# WRONG — single quotes prevent variable expansion
curl -s -H 'Authorization: Bearer $NEON_API_KEY' ...
```

### Use `--fail-with-body` for meaningful errors

Without `--fail-with-body`, `curl` returns the HTTP error page content on failure but
exits 0, making it hard to detect errors in scripts:

```bash
curl -s --fail-with-body -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects"
```

This causes `curl` to exit non-zero on HTTP 4xx/5xx while still printing the response
body (which often contains the error message).

## Common API Patterns

### Neon API

```bash
# List projects
curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects"

# Create project
curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project":{"name":"my-app"}}' \
  "https://console.neon.tech/api/v2/projects"
```

### Netlify API

```bash
# List site env vars
curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/env"
```

## Troubleshooting

- **401 Unauthorized**: Check that the variable is set (`echo ${NEON_API_KEY:0:5}...`)
  and that you used double quotes, not single quotes, around the header value.
- **Empty output**: Add `-v` for verbose output to see the full request/response.
- **Subshell variable not set**: If running inside `$()` or backticks, ensure the
  variable was exported (`export NEON_API_KEY=...`), not just set with `source .env`.
  Use `export $(grep -v '^#' .env | xargs)` to export `.env` values.
