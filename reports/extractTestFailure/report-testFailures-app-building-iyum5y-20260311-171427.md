# Test Failure Extraction Review: app-building-iyum5y-20260311-171427

## Overview

- **Branch:** app-building-iyum5y
- **App:** project-pulse (Project Management)
- **Total test failures analyzed:** 25
- **Suitable failures for extraction:** 4

## Suitable Failures

### Failure 1: StatusDonutChart hover/tooltip shows count details (Log 74)
- **Category:** CSS/layout
- **Resolution:** app-code
- **Root cause:** Center-label element blocking pointer events on SVG hover targets
- **BRANCH_NAME:** app-building-iyum5y
- **INITIAL_CHANGESET:** parent of aa0d6c762f
- **FAILING_TEST:** StatusDonutChart hover/tooltip shows count details
- **FINAL_CHANGESET:** aa0d6c762f
- **ASSESSMENT:** CSS pointer-events bug — center-label div overlaid on SVG donut chart blocked hover interactions, preventing tooltip from appearing. Fix required adding pointer-events: none to the center-label element.

### Failure 2: dashboard-fetch-race-condition (Log 75, 4 tests)
- **Category:** race-condition
- **Resolution:** app-code
- **Root cause:** currentUser fetch race in Dashboard caused "No open issues" despite issue creation
- **BRANCH_NAME:** app-building-iyum5y
- **INITIAL_CHANGESET:** parent of 81a9ccece8
- **FAILING_TEST:** dashboard-fetch-race-condition (4 tests)
- **FINAL_CHANGESET:** 81a9ccece8
- **ASSESSMENT:** Race condition in Dashboard component — currentUser fetch completed after initial render, causing the issues list to show empty state. Fix required ensuring currentUser was available before fetching issues.

### Failure 3: inbox-user-fetch-bug (Log 79, 7 tests)
- **Category:** backend-bug
- **Resolution:** app-code
- **Root cause:** Users API response destructuring bug
- **BRANCH_NAME:** app-building-iyum5y
- **INITIAL_CHANGESET:** parent of 4aa0cea5fc
- **FAILING_TEST:** inbox-user-fetch-bug (7 tests)
- **FINAL_CHANGESET:** 4aa0cea5fc
- **ASSESSMENT:** Backend API destructuring bug — users endpoint returned data in a different structure than the frontend expected, causing 7 inbox-related tests to fail. Fix corrected the response destructuring in the users API handler.

### Failure 4: Roadmap detail page shows 404 for non-existent roadmap (Log 108)
- **Category:** backend-bug
- **Resolution:** app-code
- **Root cause:** Missing UUID validation in roadmap API endpoint — "Failed to fetch" instead of "not found"
- **BRANCH_NAME:** app-building-iyum5y
- **INITIAL_CHANGESET:** parent of 5421d48eed
- **FAILING_TEST:** Roadmap detail page shows 404 for non-existent roadmap
- **FINAL_CHANGESET:** 5421d48eed
- **ASSESSMENT:** Backend validation bug — roadmap detail endpoint did not validate UUID format, causing a generic "Failed to fetch" error instead of a proper 404 response. Fix added UUID validation to return appropriate error responses.

## Unsuitable Failures (Not Extracted)

### data-contamination (6 failures, Logs 78/84/112/113/114/115)
Test isolation issues — tests sharing mutable database state without cleanup. All resolved with test reordering or beforeEach cleanup. These are test-code issues, not app bugs.

### strict-mode (5 failures, Logs 70/73/81/94/170)
Playwright strict mode violations from duplicate elements or substring collisions. All resolved with more specific selectors. Test-code issues.

### seed-data-mismatch (3 failures, Log 168)
JourneyQA tests hardcoding UUIDs not present in deployed database. All unresolved. Test design issues.

### timeout — GroupBy dropdown (Log 91)
CDP click stalling on rapid dropdown interactions — a Playwright/Replay browser instrumentation issue, not an app bug. Fix was using page.evaluate() JS clicks instead of locator.click().

### timeout — Multiple metadata fields (Log 88)
Labels picker blocking due date trigger — interaction sequencing issue in test, not an app bug.

### missing-testid (Log 170)
Aria-label attribute value mismatch — test selector issue.

### test-setup-error (Log 108)
Textarea still active after click — test interaction sequencing issue.

## Conclusion

4 failures are suitable for benchmark extraction, all representing actual app bugs (CSS, race condition, backend API issues). The remaining 21 failures are test-code issues (data contamination, strict mode, seed data mismatches), infrastructure issues, or Playwright interaction quirks.
