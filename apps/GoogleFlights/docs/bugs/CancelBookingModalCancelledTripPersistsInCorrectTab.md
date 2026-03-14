# Bug: CancelBookingModal cancelled trip persists in correct tab

## Step 1: Evidence

Evidence the app is broken: None found

Evidence the test is broken: Test 7 ("cancelled trip persists in correct tab") tries to cancel booking GF-SORT02, but test 3 ("confirms cancellation") already cancelled GF-SORT02 earlier in the same run. Since the database state is shared across tests in the same run, the Cancel button no longer exists on GF-SORT02's trip card by the time test 7 runs, causing a timeout waiting for the cancel button.

## Step 2: Determination

Which is broken: TEST

## Step 3: Root Cause

The test file reuses booking reference `GF-SORT02` in both test 3 (line 85) and test 7 (line 163). Test 3 successfully cancels the booking and verifies the Cancel button is removed. When test 7 runs later with the same shared database, `GF-SORT02` is already in "Cancelled" status with no Cancel button, so `openCancelModalForBooking(page, 'GF-SORT02')` times out at line 28 trying to click a non-existent cancel button. The fix is to use a different confirmed booking reference (e.g., GF-ONEW01) for test 7.
