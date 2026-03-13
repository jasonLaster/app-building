# Test Isolation Debugging Guide

## Overview

Test isolation failures are the most common category of test failures (~60% in observed
sessions). They occur when tests share mutable state — typically database records — and one
test's side effects break another test's assumptions.

## Sub-Categories

### Destructive Ordering

**Symptom**: Tests pass individually but fail when run together. Later tests see missing data
or wrong counts.

**Cause**: A test that deletes or modifies records runs before a test that depends on those
records existing in their original state. The DB is seeded once per spec run, not per test.

**Diagnosis**: Check the test execution order. If an earlier test deletes/modifies records,
the mismatch is explained by ordering. No Replay needed — error output always suffices.

**Fix**:
- Move destructive tests (delete-all, empty-state) to the end of the describe block.
- Add `beforeEach` hooks that reset state via API calls.
- Use `test.describe.serial` for tests that must run in order.

### Accumulated Data

**Symptom**: Count assertions fail with higher-than-expected values (e.g., "expected 3, got 6").

**Cause**: Tests create records without cleanup. Each test adds records, and subsequent tests
see the accumulated total.

**Diagnosis**: Error output shows `expected N, got N+M`. Check if prior tests create records
of the same type. No Replay needed.

**Fix**:
- Add `beforeEach` cleanup helpers that delete all records of the relevant type via API.
- Use relative assertions (count increased by 1) instead of absolute counts.
- Filter assertions to only match records created by the current test (e.g., by unique name).

### Seed Data Mismatch

**Symptom**: Tests fail with wrong values or counts that don't match any test's creation.

**Cause**: Test assertions hardcode expected values that don't match the actual seed data.

**Diagnosis**: Compare the test's expected values against `seed-db.ts`. No Replay needed.

**Fix**:
- Query current state dynamically rather than hardcoding expected values.
- Reference seed data constants or query the API for initial counts.

### Data-Contamination → beforeEach API Reset

**Symptom**: Test failures show unexpected counts, stale values, or wrong entity states that
were correct in earlier tests. Error output clearly shows expected vs actual mismatches.

**Cause**: A prior test modified or created records (payments, status changes, line items)
without cleanup, leaving the database in a dirty state for subsequent tests.

**Diagnosis**: Error output is always sufficient — it shows `expected N, got M` or wrong
field values. No Replay needed. Check if any earlier test in the same file modifies the
same entity type.

**Fix**: Add a `beforeEach` hook that resets the relevant entities to seed state via API
PUT/DELETE calls. This is the single most common fix pattern for data contamination (~54%
of all failures in one observed session). Example:
```ts
test.beforeEach(async ({ request }) => {
  // Reset payments to seed state
  const payments = await request.get('/api/payments').then(r => r.json());
  for (const p of payments.data || payments) {
    if (p.id !== SEED_PAYMENT_ID) {
      await request.delete(`/api/payments/${p.id}`);
    }
  }
});
```

When the same pattern is needed across multiple spec files (e.g., invoice payment reset
was applied to 3 spec files in one session), consider extracting it to a shared test utility.

### Cross-Run Accumulation

**Symptom**: Count assertions fail with values significantly higher than expected (e.g.,
"expected 3, got 9") and the count increases with each test run.

**Cause**: Records persist across repeated test runs without cleanup. Each run creates new
records, and subsequent runs see the accumulated total from all previous runs. This is
distinct from within-run "accumulated-data" because it persists across separate test
executions.

**Diagnosis**: When >40% of data-contamination failures show cross-run-accumulation, the
root cause is missing `beforeEach` seed calls rather than within-spec test ordering issues.
Error output alone is sufficient — the pattern `expected N, received M where M > N` is
deterministic and diagnostic. No Replay needed.

**Fix**: Add a `beforeEach` hook that calls `POST /api/seed` or deletes all records of the
relevant type via API. This single fix prevents the entire sub-category.

## Quick Diagnostic

When error output shows a wrong count or wrong value that was correct in an earlier test:

1. **Assume data contamination first** — do not check app logic until isolation is ruled out.
2. Check whether any earlier test in the same file modifies the same records.
3. If yes, the diagnosis is complete — apply the appropriate fix pattern above.

This quick-check correctly identifies the root cause for 90%+ of data contamination failures
without needing Replay or code inspection. In one session, error output alone diagnosed
81.5% of all failures — for data-contamination specifically, check (a) test ordering for
destructive operations, (b) prior test runs for cross-run accumulation, (c) seed data
assumptions before considering Replay.

### Count Mismatch Shortcut

When a test fails with a count mismatch (`expected N, received M where M > N`), the first
action should be checking for a missing `beforeEach` seed or cleanup call — not launching
Replay. Error output is sufficient for 84%+ of data-contamination cases. Replay adds no
diagnostic value for data-contamination failures because the error message pattern
(`toHaveCount expected X received Y`) is deterministic. Reserve Replay for CSS/layout,
race-condition, and other categories where visual or temporal state matters.
