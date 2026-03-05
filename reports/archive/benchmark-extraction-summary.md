# Test Failure Benchmark Extraction Summary

7 reports reviewed, 168 total test failures.

## Reports with extractable failures

### tw0wns (NoteBoard) — Best candidate
- 47 failures, 2 fix commits (aaf7976, cb04e5c)
- Clear root cause clusters: iso-date-parsing, fixture-data-conflict, seed-data-mismatch, time-collision
- Multiple failures per fix — high yield

### ex2fkq (KeyWorks) — Good candidate
- 5 failures, 2 fix commits (12eebd2, 71dfe09)
- Root causes: data format bugs (sort order), backend validation (NewServiceForm)

### ur7wtm (WatchWorks) — Moderate-Good candidate
- 9 failures, 2 fix commits (2198193, 74a6a11)
- Root causes: FK constraints, type coercion
- 89% pre-existing (limits yield but the fixed bugs are well-documented)

## Reports without extractable failures

- sales-crm-2 (33 failures): one partial commit (78309d4), most lack changesets
- sales-crm-3 (10 failures): no changesets at all
- reference-apps 0225 (15 failures): no changesets, 80% pre-existing
- reference-apps 0228 (49 failures): no changesets, 96% pre-existing/infrastructure

## Estimated yield

~10-15 failures across the 3 good reports are extractable, assuming failing changesets can be identified by tracing git history backward from each fix commit.

## Limitation

No reports include the failing changeset (the commit that introduced the bug). The extractTestFailure skill requires both failing and fixed commits. Each extraction needs git history analysis to find the introducing commit.
