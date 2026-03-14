# Accessing Secrets

Secrets (API keys, tokens, database URLs, etc.) are **not** available directly in your
environment. They are managed by the container's secrets server. Use the scripts below
to access and store them.

## `list-secrets`

Prints one secret name per line. Use this to see what secrets are available.

```bash
list-secrets
```

## `exec-secrets`

Runs a command with the named secrets injected into its environment. All output is
redacted — secret values never appear in stdout/stderr.

```bash
exec-secrets <SECRET_NAME> [SECRET_NAME2 ...] -- <command> [args...]
```

Examples:

```bash
# Neon API call
exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" \
  "https://console.neon.tech/api/v2/projects"

# Netlify deploy
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- netlify deploy --prod

# Multiple secrets with shell expansion
exec-secrets NEON_API_KEY NETLIFY_AUTH_TOKEN -- bash -c 'echo "neon: $NEON_API_KEY" && echo "netlify: $NETLIFY_AUTH_TOKEN"'
```

The secrets server spawns your command with the requested secrets in its environment,
and redacts secret values from all output.

## `set-branch-secret`

Stores a new branch-level secret (e.g., `DATABASE_URL` created at deploy time).

```bash
set-branch-secret SECRET_NAME  # reads value from stdin
```

The value is read from stdin (not args — args are visible in process lists). The server
rejects the value if it has already appeared in any log output. This forces file-based
extraction patterns:

```bash
# Write API response to file, extract value, pipe to set-branch-secret
exec-secrets NEON_API_KEY -- bash -c 'curl -s -H "Authorization: Bearer $NEON_API_KEY" ... > /tmp/resp.json'
python3 -c "import json; print(json.load(open('/tmp/resp.json'))['connection_uri'])" | set-branch-secret DATABASE_URL
```

**Never** echo or print a secret value before piping it to `set-branch-secret` — it will be
detected in logs and the set call will fail.

After storing, the secret is immediately available via `exec-secrets` and `list-secrets`.

## Rules

- Never try to read secrets from environment variables directly — they are not set.
- Always use `exec-secrets` to wrap any command that needs secret values.
- If a command needs multiple secrets, list them all before `--`.
- For complex commands that use shell expansion of secret vars, wrap in `bash -c '...'`.
