# Bug Fix Report: bug-fix-5f9i8h

## Summary

Investigated and analyzed a routing bug where refreshing the browser on a non-root URL
(e.g. navigating within the app to a page like `/jobs/123`) would fail to load the correct
page. The bug was reported as a root URL refresh routing issue.

## Branch

`bug-fix-5f9i8h`

## Skill Updates

### skills/debugging/README.md
- Added a new diagnostic pattern: "Clear backend error in test output". When Playwright
  error output includes expected/actual values pointing directly to a backend bug (e.g.,
  API returned wrong values, validation rejected valid input), diagnose from the error
  output alone without loading a Replay recording.

### skills/scripts/deploy.md
- Minor formatting fix (extra blank line).

### skills/scripts/test.md
- Added "Timeout-Prone Tests" section documenting the use of `test.slow()` for tests
  that consistently time out under Replay Chromium browser (which adds 2-3x overhead).
  This is preferable to increasing `actionTimeout` globally since it only affects known
  slow tests.

## Date

2026-03-06
