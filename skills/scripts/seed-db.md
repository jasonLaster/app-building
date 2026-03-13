# seed-db

## Purpose

Seeds the database with initial data. The seed script lives at `scripts/seed-db.ts` in each app.

## Usage

```bash
npx tsx scripts/seed-db.ts
```

## Known Issues

### Existing data causes failures

The seed script may fail if data already exists in the database (e.g., duplicate key errors).
This happens when re-seeding after a previous run or when Neon branches inherit parent data.

**Workaround**: Clear existing data before re-seeding:

```sql
-- Run via npx tsx -e or a cleanup script
TRUNCATE table1, table2, table3 CASCADE;
```

Then re-run the seed script.

### Best practice

Seed scripts should always call `truncateAllTables()` (or equivalent) before inserting data
to ensure idempotency. If the app's seed script does not do this, consider adding a
`--clean` or `--force` flag that truncates all tables before seeding.

### Pre-test re-seeding

Always re-seed the database before running test suites to ensure a clean, known state. The
test script (`npm run test`) handles this automatically via ephemeral Neon branches with
truncate-and-seed between each test. If running tests manually or debugging, re-seed
explicitly:

```bash
npx tsx scripts/seed-db.ts
```

This eliminates the #2 source of test failures (data contamination from accumulated state).

### When to use `scripts/seed-db.ts` vs `/api/seed`

- **`npx tsx scripts/seed-db.ts`**: Use for initial database setup, manual re-seeding before
  test runs, and when the dev server is not running. Runs directly against the database.
- **`POST /api/seed` endpoint**: Use inside test `beforeEach`/`beforeAll` hooks to reset
  state between tests while the dev server is running. This is the preferred approach for
  in-test reseeding because it uses the same database connection as the running server and
  avoids connection conflicts. Many test failures trace back to stale seed data — using the
  `/api/seed` endpoint in `beforeEach` hooks is the most effective mitigation.
