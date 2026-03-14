# curl-api

## Purpose

Standard patterns for making API calls with `curl` in shell scripts and one-off commands.
All secrets must be accessed via `exec-secrets` — they are NOT available directly in the
environment.

## Using `exec-secrets` with curl

Wrap any `curl` command that uses secrets with `exec-secrets`:

```bash
# CORRECT — exec-secrets makes NEON_API_KEY available to the curl subprocess
exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  "https://console.neon.tech/api/v2/projects"

# WRONG — secret is not in the environment, $NEON_API_KEY will be empty
curl -s -H "Authorization: Bearer $NEON_API_KEY" ...
```

## Shell Quoting Rules

### Always double-quote variables in headers

```bash
# CORRECT — variable is expanded and properly quoted
exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  "https://console.neon.tech/api/v2/projects"

# WRONG — single quotes prevent variable expansion
exec-secrets NEON_API_KEY -- curl -s -H 'Authorization: Bearer $NEON_API_KEY' ...
```

### Use `--fail-with-body` for meaningful errors

Without `--fail-with-body`, `curl` returns the HTTP error page content on failure but
exits 0, making it hard to detect errors in scripts:

```bash
exec-secrets NEON_API_KEY -- curl -s --fail-with-body -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects"
```

This causes `curl` to exit non-zero on HTTP 4xx/5xx while still printing the response
body (which often contains the error message).

## Common API Patterns

### Neon API

```bash
# List projects
exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects"

# Create project
exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project":{"name":"my-app"}}' \
  "https://console.neon.tech/api/v2/projects"
```

### Netlify API

```bash
# List site env vars
exec-secrets NETLIFY_AUTH_TOKEN -- curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/env"
```

## Troubleshooting

- **401 Unauthorized**: Ensure you are using `exec-secrets` to wrap the command, and
  that you used double quotes, not single quotes, around the header value.
- **Empty output**: Add `-v` for verbose output to see the full request/response.
- **Secret not available**: If the command is not wrapped with `exec-secrets`, the
  secret variable will be empty. Always use `exec-secrets SECRET_NAME -- command`.
