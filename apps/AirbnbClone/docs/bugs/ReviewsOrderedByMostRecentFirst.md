# Bug: Reviews are ordered by most recent first

## Step 1: Evidence

Evidence the app is broken: None found

Evidence the test is broken: The test `deleteAllReviewsForProperty` helper deletes reviews but not the associated bookings. Tests 6 and 7 ("pagination" and "show all") each create 8 bookings on PROPERTY_NO_REVIEWS with dates spanning months 1-8 of 2025. When test 8 ("ordered by most recent") runs, it only deletes reviews, leaving 16 leftover bookings with status 'pending'. The test then tries to create bookings at 2025-01-01 and 2025-02-01, which overlap with leftover bookings, causing the bookings API to return 409. The review creation then fails because `booking.id` is undefined. After page reload, the property has 0 reviews, and the assertion `toHaveCount(2)` fails.

## Step 2: Determination

Which is broken: TEST

## Step 3: Root Cause

The test file's `createBookingAndReview` helper does not check the booking API response status. When the booking POST returns 409 (date overlap), the response body is `{ error: "..." }` with no `id` field. The subsequent review POST receives `booking_id: undefined`, which fails the required field check (400 error). The root cause is that `deleteAllReviewsForProperty` only cleans up reviews, not the bookings that were created by previous tests in the same file. Tests 6 and 7 each create 8 bookings with dates in months 1-8 of 2025, and test 8 tries to reuse dates in that range.

Fix: Add a helper to delete non-seed bookings for the property and call it before creating new bookings in tests that operate on PROPERTY_NO_REVIEWS.
