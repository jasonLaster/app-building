# Bug: Host Dashboard - Bookings Actions

## Step 1: Evidence

Evidence the app is broken: After cancelling a booking via the host dashboard, the "Active Bookings" stat did not decrement. The Redux reducer's client-side stat calculation was not reliably updating the stat after booking status changes. The HostDashboard component did not re-fetch stats from the server after confirm/cancel actions, unlike the `handleAddListingSuccess` handler which already re-fetches stats.

Evidence the test is broken: The "Host can cancel a pending booking" test created a booking with dates 2027-10-01 to 2027-10-05 but asserted the dialog showed "Sep 1, 2027" and "Sep 5, 2027" (wrong month). The "Confirm and cancel actions work on repeated use" test expected exactly 7 booking rows but accumulated bookings from prior serial tests caused more rows to appear (data contamination - no beforeEach cleanup).

## Step 2: Determination

Which is broken: BOTH APP AND TEST

## Step 3: Root Cause

1. **App bug** (`src/pages/HostDashboard.tsx`): `handleConfirmBooking` and `handleCancelBooking` only dispatched `updateHostBookingStatus` without re-fetching stats. The Redux reducer's client-side stat calculation was unreliable. Fix: Added `dispatch(fetchHostStats(currentUser.id))` after each booking status update.

2. **Test bug** (`tests/host-dashboard-bookings-actions.spec.ts` line 107-108): Date assertions used "Sep" instead of "Oct" to match the booking created with October dates.

3. **Test bug** (data contamination): No `beforeEach` cleanup. Serial tests accumulated bookings, causing count assertions to fail. Fix: Added beforeEach that resets bookings to seed state via DELETE /api/bookings, and added the DELETE endpoint to the bookings API.
