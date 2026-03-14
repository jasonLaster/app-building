# neon-setup

## Purpose

Documents the standard procedure for creating Neon database projects, setting up branches,
and configuring `DATABASE_URL`. This covers common pitfalls encountered when working with
the Neon API from the container.

## Creating a Neon Project

Use the Neon API with `NEON_API_KEY` accessed via `exec-secrets`:

```bash
exec-secrets NEON_API_KEY -- curl -s -X POST "https://console.neon.tech/api/v2/projects" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project": {"name": "<project-name>"}}'
```

**Important**: `NEON_API_KEY` is NOT directly in the environment. Always wrap commands
that need it with `exec-secrets NEON_API_KEY -- ...`. The `exec-secrets` tool spawns the
command with the secret in its environment and redacts secret values from output.

**Storing results as branch secrets:** Write the API response to a file, then extract
values and pipe to `set-branch-secret`. Never echo or print secret values to stdout.

```bash
# Create project and write response to file
exec-secrets NEON_API_KEY -- bash -c 'curl -s -X POST "https://console.neon.tech/api/v2/projects" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"project\":{\"name\":\"<project-name>\"}}" > /tmp/neon-project.json'

# Extract and store as branch secrets
python3 -c "import json; print(json.load(open('/tmp/neon-project.json'))['project']['id'])" | set-branch-secret NEON_PROJECT_ID
python3 -c "import json; print(json.load(open('/tmp/neon-project.json'))['connection_uris'][0]['connection_uri'])" | set-branch-secret DATABASE_URL
```

## Creating Branches

When creating branches for testing or ephemeral environments:

```bash
exec-secrets NEON_API_KEY -- curl -s -X POST "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"branch": {"name": "<branch-name>"}, "endpoints": [{"type": "read_write"}]}'
```

**Known issue**: The branch creation response may return an empty `password` field for the
role. When this happens, you must fetch the role password separately:

```bash
exec-secrets NEON_API_KEY -- curl -s "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID/roles/$ROLE_NAME/reveal_password" \
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
exec-secrets NEON_API_KEY -- curl -s -X POST "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID/sql" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT 1"}' | python3 -c "import sys,json; print(json.load(sys.stdin))"
```

Catching connection issues here prevents cryptic failures later during schema initialization
or test execution.

## Common Pitfalls

- **Empty passwords**: Always check if the password field is populated in branch/project
  creation responses. If empty, use the reveal_password API endpoint.
- **API key access**: `NEON_API_KEY` is accessed via `exec-secrets`, not directly from the
  environment. Always wrap commands with `exec-secrets NEON_API_KEY -- ...`.
- **SSL mode**: Always include `?sslmode=require` in the connection URL. Neon requires SSL.
- **Scripts require explicit connection string**: `scripts/schema.ts` and `scripts/seed-db.ts`
  require an explicit `"postgresql://..."` argument. They fail silently or with confusing
  errors when no connection string is passed. Always invoke them via `exec-secrets`:
  ```bash
  exec-secrets DATABASE_URL -- npx tsx scripts/schema.ts "$DATABASE_URL"
  exec-secrets DATABASE_URL -- npx tsx scripts/seed-db.ts "$DATABASE_URL"
  ```
