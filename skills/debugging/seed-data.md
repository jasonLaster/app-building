# Debugging Seed Data Issues with Replay

When tests fail because expected data is missing — empty lists, count of 0, "no results"
messages — the root cause is often that the test navigated to a record that doesn't have the
expected related data seeded in the ephemeral database branch.

## Tool Sequence

1. **`PlaywrightSteps`** — See which page the test navigated to. Confirm the test reached
   the expected page (check URL and navigation steps).

2. **`Screenshot`** — See what the page actually shows. An empty section or "No items" message
   confirms missing data.

3. **`NetworkRequest`** — Check the API response for the page's data. If the API returns an
   empty array, the data doesn't exist in the database. If it returns data but the component
   shows empty, the issue is in rendering, not seeding.

4. **`Logpoint`** — Place logpoints on the API handler or component's data-fetching code to
   inspect what was queried and returned.

5. **`SearchSources`** — Check if the rendering code was hit at all. If entry-rendering code
   has 0 hits, the component received an empty data set and rendered nothing.

## Quick Triage

### Count-based assertion failures are almost always data contamination
When a test expects N rows but gets more (e.g., "expected 2 rows, got 30+"), check for missing
cleanup or accumulated data before reaching for Replay. Common causes:
- A prior test creates records without cleanup
- `beforeEach` cleanup was removed or is missing
- Seed data inserts without truncating first

These failures are self-diagnosing from error output alone — Replay is unnecessary.

### Neon branch inheritance
Ephemeral Neon branches inherit all data from the parent branch. Using `seedDatabase()` alone
(which only inserts) will result in duplicate or unexpected data. **Always use
`truncateAndSeed()`** (truncate all tables, then insert) to ensure a clean starting state.
Without truncation, tests see inherited parent data plus newly seeded data, causing count
mismatches and unexpected records.

## Data-Contamination Diagnosis Pattern

When error output shows unexpected values — actual count higher than expected, wrong totals,
unexpected records — the most likely cause is data contamination from a previous test in the
same describe block. This is the single most common failure category (~43% of all observed
failures).

**Quick diagnosis** (no Replay needed):
1. Check if the error shows `actual > expected` (e.g., expected 3 rows, got 5). This indicates
   a prior test created records that weren't cleaned up.
2. Check if the failing test is preceded by a test that creates, deletes, or modifies shared
   records (invoices, payments, clients, etc.).
3. Check if the spec file uses `beforeEach` data reset — if not, that's likely the fix.

**Resolution strategies** (in order of preference):
1. **beforeEach data reset** — Reset relevant state before each test.
2. **Destructive test reordering** — Move tests that create/delete/void records to the end of
   the describe block.
3. **Create fresh data per test** — Avoid relying on shared seed data entirely.
4. **Capture current values** — Read actual state (e.g., count rows) instead of hardcoding
   expected values.

These failures are self-diagnosing from error output alone — Replay is unnecessary.

## Common Root Causes (from observed failures)

### Navigation helper lands on a record with no related data
A `navigateToFirstPersonDetail()` helper navigates to the first person in the list, but that
person has no seeded contact history entries, relationships, or other related data the test
expects to find.

**Diagnosis with Replay**: PlaywrightSteps shows successful navigation. NetworkRequest shows
the detail API returning the person but with empty related arrays. Logpoint on the data
confirms `entries: []`.

**Fix**: Either seed the specific data the test needs, or have the test create the data via
the UI before asserting on it.

*Example*: PDP-CH-01 failed. SearchSources showed entry-rendering code had 0 hits.
Logpoint confirmed empty entries array. Fixed by creating a contact history entry via
the UI before running assertions.

### First navigated-to record lacks writeups/attachments
Detail page tests navigate to the first deal/task/client and then assert on writeups,
attachments, or other optional data. If the first record was created by another test or the
seed doesn't include these, assertions fail.

**Diagnosis with Replay**: Screenshot shows the detail page with empty writeups/attachments
sections. NetworkRequest confirms empty arrays in the API response.

**Fix**: Have the test create the needed data before asserting, rather than relying on seed
data existing.

*Example*: DDP-WRT-01 and DDP-ATT-01 failed because the first deal had no writeups or
attachments. Fixed by making tests create data first.

### Ephemeral branch inherits outdated schema
`CREATE TABLE IF NOT EXISTS` doesn't add new columns to existing tables. When a new column
is added to the schema definition, ephemeral Neon branches created from the parent won't
have the new column.

**Diagnosis with Replay**: NetworkRequest shows API calls failing with database column errors.

**Fix**: Add `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migration logic.

### Numeric column type returns decimal strings
PostgreSQL `NUMERIC(15,2)` and `DECIMAL` columns return string values like `"500.00"` instead
of integer `500`. Tests that assert on formatted numeric values (e.g., `"500 Units"`) fail
when the raw value is `"500.00"` and the UI displays `"500.00 Units"`.

**Diagnosis with Replay**: NetworkRequest or Logpoint shows the API returning string values
with decimal places (e.g., `"500.00"`) instead of integers.

**Fix**: Add a formatting utility to parse and format numeric strings before display. The fix
is in the app's formatting layer, not in the test assertions.

*Example*: Three related failures (`RUN-ACT-2`, `CAL-GRID-4`, `RUN-HDR-10`) all stemmed from
`NUMERIC(15,2)` columns returning `"500.00"` instead of `500`. A single formatting utility
fix resolved all three.

### PostgreSQL date column returns ISO timestamp
PostgreSQL DATE columns return ISO timestamps (`2026-03-06T00:00:00.000Z`) through the Neon
driver, not `YYYY-MM-DD` strings. Components that compare or display dates will show
"Invalid Date" or fail date comparisons when they receive the full timestamp.

**Diagnosis without Replay**: Error output shows "Invalid Date" in rendered text, or date
comparison assertions fail with timestamp vs. date-string mismatches.

**Fix**: Apply `.split('T')[0]` normalization wherever dates from the API are displayed or
compared. This was the #1 backend-bug root cause in observed sessions (~30% of all failures).

*Example*: `formatDate` helpers across 6+ components failed because they received
`2026-03-06T00:00:00.000Z` but expected `2026-03-06`. Adding `.split('T')[0]` before
parsing resolved all of them.

### Content-over-count assertions for shared database environments
When tests assert on element counts (e.g., `expect(rows).toHaveCount(5)`) and fail with
unexpected counts, the fix is often to switch to content-based assertions rather than fixing
the count. In shared database environments, exact counts are fragile because parallel tests
or prior tests may create/delete records.

**Fix**: Replace count-based assertions with content-based ones:
```ts
// Fragile — breaks when other tests add/remove items:
await expect(page.locator('[data-testid="row"]')).toHaveCount(5);

// Resilient — checks for specific content regardless of total count:
await expect(page.locator('[data-testid="row"]').filter({ hasText: 'Expected Item' })).toBeVisible();
```

This pattern is especially important for tests that verify data after mutations — capture
initial state and assert relative changes rather than hardcoded absolute values.

## General Guidance

When many detail-page tests fail with `expected count > 0, received 0`, resist the urge to
debug each test individually. Instead:

1. Check if the database has seed data at all (NetworkRequest on a list endpoint)
2. Check if the API functions are working (NetworkRequest on the specific detail endpoint)
3. Check if the schema is up to date (look for column-related errors in ConsoleMessages)

Fix the underlying data issue first, then re-run all tests.
