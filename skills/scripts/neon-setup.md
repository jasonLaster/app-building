# neon-setup

## Purpose

Documents the standard procedure for creating Neon database projects, setting up branches,
and configuring `DATABASE_URL`. This covers common pitfalls encountered when working with
the Neon API from the container.

## Creating a Neon Project

Use the Neon API with the container-level `NEON_API_KEY`:

```bash
curl -s -X POST "https://console.neon.tech/api/v2/projects" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project": {"name": "<project-name>"}}'
```

**Important**: Use `$NEON_API_KEY` directly in the header (shell expansion). Do NOT use
`printenv NEON_API_KEY` in a subshell — it adds trailing whitespace that causes auth failures.

**Known issue**: If authentication fails with a "not authenticated" error when using
`$NEON_API_KEY` directly, the variable may contain a trailing newline. Fix by capturing
the key via `printf` first:

```bash
NEON_KEY=$(printf '%s' "$NEON_API_KEY") && curl -s -X POST "https://console.neon.tech/api/v2/projects" \
  -H "Authorization: Bearer $NEON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project": {"name": "<project-name>"}}'
```

Extract the project ID from the response (`jq` is not available — use `python3`):

```bash
echo $RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['project']['id'])"
```

## Creating Branches

When creating branches for testing or ephemeral environments:

```bash
curl -s -X POST "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"branch": {"name": "<branch-name>"}, "endpoints": [{"type": "read_write"}]}'
```

**Known issue**: The branch creation response may return an empty `password` field for the
role. When this happens, you must fetch the role password separately:

```bash
curl -s "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID/roles/$ROLE_NAME/reveal_password" \
  -H "Authorization: Bearer $NEON_API_KEY" | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])"
```

## Connection URL Format

The `DATABASE_URL` follows this format:

```
postgresql://<role>:<password>@<host>/<dbname>?sslmode=require
```

Where:
- `role`: Usually `neondb_owner` (from the branch creation response)
- `password`: Retrieved from the reveal_password endpoint if empty in branch response
- `host`: The endpoint host from the branch creation response (e.g., `ep-xxx.us-east-2.aws.neon.tech`)
- `dbname`: Usually `neondb` (default)

## Verification After Setup

After creating a project or branch and constructing the `DATABASE_URL`, verify connectivity
before proceeding with schema setup or test runs:

```bash
curl -s "$DATABASE_URL" -c '' --max-time 5 -o /dev/null -w "%{http_code}"
```

Or use a quick SQL query via the Neon SQL API:

```bash
curl -s -X POST "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID/sql" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT 1"}' | python3 -c "import sys,json; print(json.load(sys.stdin))"
```

Catching connection issues here prevents cryptic failures later during schema initialization
or test execution.

## Common Pitfalls

- **Empty passwords**: Always check if the password field is populated in branch/project
  creation responses. If empty, use the reveal_password API endpoint.
- **API key format**: The `NEON_API_KEY` env var is set at the container level. Verify it
  exists with `echo $NEON_API_KEY | head -c 5` before making API calls.
- **SSL mode**: Always include `?sslmode=require` in the connection URL. Neon requires SSL.
