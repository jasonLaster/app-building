# Test Failure Extraction Review: app-building-s6brz0

## Overview

- **Branch:** app-building-s6brz0
- **App:** LegalLedger (Legal Practice Management)
- **Worker logs analyzed:** 128+
- **Total test failures with Replay used:** 1 (in log #128, deployment task)
- **Suitable failures for extraction:** 0

## Test Failures Reviewed

### Failure 1: deployment: data displays and can be updated (log #128)
- **Category:** CSS/layout
- **Replay used:** yes
- **Replay necessary:** no (error output would have sufficed)
- **Resolution:** test-code
- **Self-inflicted:** yes
- **Fix iterations:** 1
- **Changeset revision:** none
- **Why not suitable:** Self-inflicted test-code issue — deployment test used `table tbody tr` selectors but the app uses div-based tables with `role="row"` attributes. This is a test selector mismatch, not an actual app bug. Additionally, no changeset revision was recorded, making extraction impossible.

## Additional Notes

- Across all 128+ logs, no failures had CHANGESET_REVISION values (all were "none"), meaning no extractable changesets exist for any failure in this run.
- The vast majority of test failures were resolved without Replay (only 1 out of 34 successfully debugged failures used Replay).
- Most failures appear to be data-contamination, strict-mode, and test-code issues rather than actual app bugs.

## Conclusion

No failures are suitable for benchmark extraction. The single Replay-used failure was a self-inflicted test selector issue during deployment testing, not an actual app bug. No changeset revisions were recorded for any failures across the entire run, making extraction impossible even if suitable failures existed.
