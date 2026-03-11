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

## Quick Diagnostic

When error output shows a wrong count or wrong value that was correct in an earlier test:

1. **Assume data contamination first** — do not check app logic until isolation is ruled out.
2. Check whether any earlier test in the same file modifies the same records.
3. If yes, the diagnosis is complete — apply the appropriate fix pattern above.

This quick-check correctly identifies the root cause for 90%+ of data contamination failures
without needing Replay or code inspection.
