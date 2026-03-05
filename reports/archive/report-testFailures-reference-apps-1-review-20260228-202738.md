# Test Failures Report: reference-apps-1-review

**Generated:** 2026-02-28
**Scope:** 152 worker logs from containers eghui7, mimlkq, dm9i32, 03qkr9 (2026-02-25 to 2026-02-27)

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 152 |
| Logs with test failures | 12 (7.9%) |
| Logs without test failures | 140 (92.1%) |
| Total distinct test failures | 49 |
| Pre-existing failures | 47 (95.9%) |
| New failures introduced | 2 (4.1%) |
| Replay usage rate (all failures) | 0/49 (0%) |
| Replay usage rate (debugged failures) | 0/14 (0%) |
| Debugging attempted | 14/49 (28.6%) |
| Debugging success rate (among attempted) | 13/14 (92.9%) |
| Replay-assisted success rate | N/A (Replay not used for any failure) |
| Recording availability rate | 19/49 (38.8%) |
| Total test re-runs across all logs | 5 |

## 2. Failure Table

| Log | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|---|---|---|---|---|---|---|---|---|---|---|
| 03qkr9-101 | SalesCRM production deployment works | backend-bug | yes | no | Diagnosed by curling production endpoints directly | no | — | — | yes | none |
| 03qkr9-107 | Display Order ID in Header | backend-bug | yes | no | Pre-existing UUID navigation bug; confirmed by running tests before/after changes | yes | — | — | yes | none |
| 03qkr9-107 | Display Supplier Name as Link | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Display Order Date | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Display Expected Delivery Date | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Display Status Badge | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Display Overall Cost | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Edit Button Opens Edit Dialog | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Edit Order Dialog Cancel Does Not Modify Order | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Edit Order Dialog Validation | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-107 | Print Button Triggers Print | backend-bug | yes | no | Same pre-existing UUID navigation bug | yes | — | — | yes | none |
| 03qkr9-26 | MaterialsCategoriesOverview > category columns | timeout | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | LowInventoryAlerts > Dismiss button | timeout | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | MaterialsCategoriesOverview > sample materials | timeout | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | MaterialsCategoriesOverview > category filter | timeout | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | RecentTransactionsTable > reverse chrono order | other | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | RecentTransactionsTable > date range filter | other | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | DateRangeFilter > updates all widgets | other | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | CategoryFilter > filters dashboard content | timeout | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-26 | CategoryFilter > "All Categories" resets filter | timeout | yes | no | Pre-existing; unrelated to current changes | yes | — | — | — | none |
| 03qkr9-34 | Dashboard date range filter (1) | seed-data-mismatch | yes | no | Pre-existing date filter expecting "Jan" but getting "Feb" | no | — | — | — | none |
| 03qkr9-34 | Dashboard date range filter (2) | seed-data-mismatch | yes | no | Pre-existing date filter expecting "Jan" but getting "Feb" | no | — | — | — | none |
| 03qkr9-36 | ReportingLinks Actual vs Budget Report | timeout | **no** | no | Attributed to transient timeout; not investigated | no | — | — | — | none |
| 03qkr9-36 | AccountHeader breadcrumb navigation | other | yes | no | Pre-existing; unrelated to current task | no | — | — | — | none |
| 03qkr9-36 | TransactionsTab transaction rows | other | yes | no | Pre-existing; unrelated to current task | no | — | — | — | none |
| 03qkr9-36 | BudgetDetailsTab tests | timeout | yes | no | Pre-existing flaky timeout | no | — | — | — | none |
| 03qkr9-36 | ReportingLinks section heading | timeout | yes | no | Pre-existing flaky timeout | no | — | — | — | none |
| 03qkr9-80 | Submit with invalid email format | other | **no** | no | Diagnosed from error output (HTML5 email validation) | no | — | — | yes | none |
| dm9i32-118 | supplier-details-overview (5 tests) | infrastructure | yes | no | Socket ETIMEDOUT; no recordings generated | no | — | — | — | none |
| dm9i32-119 | Display Section Tab Links | infrastructure | yes | no | Navigation timeout before page loaded | no | — | — | no | none |
| dm9i32-119 | Click Documents Tab | infrastructure | yes | no | Navigation timeout before page loaded | no | — | — | — | none |
| dm9i32-119 | Click Comments Tab | infrastructure | yes | no | Navigation timeout before page loaded | no | — | — | — | none |
| dm9i32-119 | Click Orders Tab | infrastructure | yes | no | Navigation timeout before page loaded | no | — | — | — | none |
| dm9i32-120 | supplier-details-overview (9 tests) | infrastructure | yes | no | Navigation timeout before page loaded | no | — | — | — | none |
| dm9i32-120 | supplier-details-documents (all tests) | infrastructure | yes | no | Navigation timeout before page loaded | no | — | — | — | none |
| dm9i32-71 | sidebar.spec.ts | backend-bug | yes | no | Pre-existing schema error (owner_id column missing) | no | — | — | — | none |
| dm9i32-75 | sidebar.spec.ts | backend-bug | yes | no | Pre-existing schema error (owner_id column missing) | no | — | — | — | none |
| eghui7-8 | Deployment: data displays and app is interactive | infrastructure | yes | no | Transient ERR_SOCKET_NOT_CONNECTED; retried and passed | no | — | — | yes | none |

## 3. Patterns

### Failure Category Breakdown

| Category | Count | % of Total |
|---|---|---|
| infrastructure | 19 | 38.8% |
| backend-bug | 13 | 26.5% |
| timeout | 8 | 16.3% |
| other | 6 | 12.2% |
| seed-data-mismatch | 2 | 4.1% |
| CSS/layout | 0 | 0% |
| strict-mode | 0 | 0% |

### Root Cause Clusters

| Cluster | Count | Apps Affected |
|---|---|---|
| replay-browser-navigation-timeout | 15 | SupplierTracker |
| order-details-uuid-navigation | 10 | SupplierTracker |
| replay-browser-socket-timeout | 5 | SupplierTracker |
| schema-owner-id-missing | 2 | ProductionHub |
| seed-data-date-mismatch | 2 | InventoryTracker |
| netlify-function-bundling | 1 | SalesCRM |
| transient-network-error | 1 | Accounting |

### When was Replay most effective?

Replay was **never used** across all 49 test failures. This is the most significant finding: 0% Replay utilization.

### When was Replay NOT used and why?

The reasons for non-use fall into distinct categories:

1. **Pre-existing/unrelated failures (35 failures):** Agent identified failures as pre-existing and unrelated to current work. Debugging these was out of scope for the task.
2. **Infrastructure failures with no recordings (19 failures):** Socket timeouts, navigation timeouts, and network errors prevented the Replay browser from generating usable recordings. These are the largest category.
3. **Diagnosed from error output (2 failures):** The agent could determine the root cause directly from Playwright error messages without needing to inspect a recording (e.g., HTML5 email validation, HTTP 502 responses from production endpoints).

### Common debugging strategies that worked

1. **Before/after comparison:** Running tests on original code to confirm failures are pre-existing (used in 03qkr9-107 with 10 failures — git stash, run tests, compare).
2. **Direct endpoint testing:** Curling production endpoints to diagnose backend deployment issues (used in 03qkr9-101).
3. **Error message analysis:** Reading Playwright error output to understand test failures without needing recordings (used in 03qkr9-80).
4. **Simple retry:** For transient infrastructure errors, retrying the test run (used in eghui7-8, 03qkr9-36).

### Common debugging strategies that failed

1. **Retry for infrastructure failures:** In dm9i32-119, retrying supplier-details tests still hit navigation timeouts — the underlying infrastructure issue was persistent, not transient.

### Recurring failure categories

1. **SupplierTracker infrastructure failures (20 failures):** The SupplierTracker app on container dm9i32 had persistent replay-browser navigation timeouts and socket timeouts. All supplier-details-* test files were affected. This accounted for 40.8% of all failures.
2. **InventoryTracker dashboard timeouts (9 failures):** Pre-existing timeout failures in dashboard filter and category overview tests.
3. **SupplierTracker order-details UUID bug (10 failures):** The `navigateToFirstOrder` helper used PO-format order IDs instead of UUIDs, causing all order-details-summary tests to fail.
4. **ProductionHub schema bug (2 failures):** Missing `owner_id` column in database schema caused sidebar tests to fail consistently.

## 4. Recommendations

### `skills/debugging/*.md` — New patterns and tool sequences

- **Add "pre-existing failure triage" pattern:** When tests fail during a task, the agent should first verify whether failures are pre-existing by running the same tests on the unmodified code (git stash approach used in 03qkr9-107). This was the most effective debugging strategy observed.
- **Add "infrastructure failure detection" pattern:** When multiple tests fail with identical navigation timeouts or socket errors, the agent should classify these as infrastructure failures early and skip further debugging. The current logs show agents correctly identifying this, but a documented pattern would save time.
- **Add guidance for using Replay when recordings ARE available:** 19 failures (38.8%) had recordings available but Replay was never used. For non-pre-existing failures with available recordings, agents should be prompted to use Replay tools before declaring a failure as unresolvable.

### `skills/tasks/build/testing.md` — Process improvements

- **SupplierTracker infrastructure instability:** The SupplierTracker app's supplier-details pages had persistent navigation timeouts on container dm9i32 (20 failures). Investigate whether this is a Replay browser resource issue specific to that app's route or a container-level problem. Consider adding a retry-with-delay strategy specifically for navigation timeouts.
- **Seed data date sensitivity:** InventoryTracker dashboard tests failed due to seed data containing hardcoded months that don't match the current date. Seed data should use relative dates or the tests should be date-aware.
- **Pre-existing failure tracking:** Consider maintaining a known-failures list per app so agents don't need to spend time re-verifying that failures are pre-existing on every run.

### `skills/review/reportTestFailures.md` — Template improvements

- **Collapse clustered failures in per-log analysis:** When 10+ tests share the same root cause cluster (e.g., order-details-uuid-navigation), the current template produces highly repetitive entries. Consider allowing a single entry with a count for clustered failures: "### Failure Cluster: order-details-uuid-navigation (10 tests)" instead of 10 identical entries.
- **Add "DEBUGGING_SKIPPED_REASON" field:** Many failures (35/49) had `DEBUGGING_ATTEMPTED: no` because they were pre-existing and out of scope. A dedicated field would distinguish "didn't debug because pre-existing" from "didn't debug but should have."
- **Separate infrastructure failures:** Infrastructure failures (no recording, no page load) are fundamentally different from application bugs. Consider a separate lightweight section for infrastructure failures rather than using the full failure template.
