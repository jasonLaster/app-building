# deploy-verification

## Purpose

Verifies that a deployed app is fully operational after `npm run deploy` completes. Deployment
alone does not guarantee the app works — the database connection must be configured on Netlify
and API endpoints must be reachable.

## Post-Deploy Verification Steps

Run these steps in order after a successful `npm run deploy`:

### 1. Set DATABASE_URL on Netlify

The deploy script sets up the database and deploys the app, but does NOT automatically configure
the `DATABASE_URL` environment variable on the Netlify site. Without it, all backend functions
will return 500 errors.

Set it using the Netlify REST API (see `skills/scripts/netlify-env.md`):

```bash
curl -s -X POST "https://api.netlify.com/api/v1/accounts/${NETLIFY_ACCOUNT_SLUG}/env?site_id=${NETLIFY_SITE_ID}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"key":"DATABASE_URL","values":[{"value":"'"$DATABASE_URL"'","context":"all"}]}]'
```

### 2. Verify API endpoints return 200

Test at least one backend endpoint to confirm the database connection works. Freshly deployed
Netlify Functions may return 502 during cold start (propagation delay). Use a retry loop
instead of failing immediately on the first attempt:

```bash
for i in 1 2 3; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://<site-url>/.netlify/functions/<function-name>)
  [ "$STATUS" = "200" ] && echo "API healthy" && break
  echo "Attempt $i: got $STATUS, retrying in 3s..."
  sleep 3
done
```

If all 3 attempts return 500, the `DATABASE_URL` is likely not set or is incorrect. If all
return 502, the function may still be propagating — wait 10–15 seconds and retry. Do not
proceed to deployment tests until API endpoints respond successfully.

### 3. Run deployment tests

Only run deployment tests after confirming API endpoints are healthy. Deployment tests that
hit broken endpoints will produce misleading failures.

**Testing constraints:**

- **No significant side effects**: Deployment tests must not perform actions with significant
  side effects (e.g., sending emails, triggering external webhooks, deleting critical data).
  Test read-heavy flows and minor CRUD operations only.
- **Revert database changes**: Any database changes made during deployment tests (created rows,
  updated records, etc.) must be reverted after the test finishes. The production database
  should be left in the same state it was in before testing. Use API DELETE endpoints or direct
  SQL cleanup to undo changes.

## Common Failures

- **500 from API endpoints**: `DATABASE_URL` not set on Netlify. Set it per step 1.
- **"No project id found" from Netlify CLI**: Use the REST API instead of `npx netlify env:set`.
  See `skills/scripts/netlify-env.md`.
- **Deployment tests fail on empty data**: If tests expect seeded data but the production database
  is empty, seed the production database or adjust tests to handle empty states.
