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

## General Guidance

When many detail-page tests fail with `expected count > 0, received 0`, resist the urge to
debug each test individually. Instead:

1. Check if the database has seed data at all (NetworkRequest on a list endpoint)
2. Check if the API functions are working (NetworkRequest on the specific detail endpoint)
3. Check if the schema is up to date (look for column-related errors in ConsoleMessages)

Fix the underlying data issue first, then re-run all tests.
