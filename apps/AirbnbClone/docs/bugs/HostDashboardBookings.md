# Host Dashboard Bookings Test Failures

## Failing Tests
- Resetting filter to All shows all bookings
- Status badges display correct colors

## Root Cause
Two issues:

1. **Data contamination between tests**: Tests that call `createPendingBooking` (e.g., "Filtering bookings by Pending status") leave behind pending bookings in the database. Subsequent tests like "Resetting filter to All" expect exactly 4 seed bookings but find 5+.

2. **Date overlap conflicts**: Multiple `createPendingBooking` calls with the same default dates (2027-08-01 to 2027-08-05) trigger the booking overlap check (409 Conflict). The "Status badges" test couldn't create its pending booking because the dates were already taken by a leftover booking.

3. **Missing error handling in Netlify functions**: The `auth.ts`, `bookings.ts`, `host-bookings.ts`, and `users.ts` Netlify functions had no try/catch around database calls. When Neon DB had transient errors, unhandled exceptions caused non-JSON responses, breaking the frontend's `response.json()` parsing.

## Fix
1. Added `test.beforeEach` hook that calls `DELETE /api/bookings` to clean up non-seed bookings and reset seed booking statuses between tests.
2. Added try/catch error handling to all affected Netlify functions so database errors return proper JSON error responses.
3. Removed unused `SARAH_ID` constant to fix lint.
