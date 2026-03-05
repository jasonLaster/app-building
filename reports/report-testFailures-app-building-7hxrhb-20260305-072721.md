# Test Failures Report: app-building-7hxrhb-20260305-072721

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 77 |
| Logs with test failures | 11 |
| Logs without test failures | 66 |
| Total distinct test failures | 52 |
| Total test re-runs | 17 |
| Unique root causes | 16 (11 clusters + 5 unclustered) |
| **Replay usage rate** | **19.2%** (10/52 failures) |
| **Replay usage among debugged failures** | **19.2%** (10/52 — all failures had debugging attempted) |
| **Debugging success rate** | **100%** (52/52) |
| **Replay-assisted success rate** | **100%** (10/10 Replay-used failures resolved) |
| Recording availability rate | 100% (52/52) |
| Debugging efficiency (Replay used but unnecessary) | 2/10 Replay-used failures (20%) — error output alone would have sufficed |
| Cascading fixes | 4 changesets resolved multiple failures |
| Self-inflicted failures | 10 (19.2% of total — all from one incident) |

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|-------------|----------------------|-------------------|----------|-------|---------|-----------|
| worker-39 | 7hxrhb/SoleTrack | Create Customer with All Fields | backend-bug | yes | yes | | yes | NetworkRequest to check API responses | NetworkRequest, ConsoleMessages | yes | none |
| worker-39 | 7hxrhb/SoleTrack | Create Customer with Only Required Fields | backend-bug | yes | no | Same root cause — shared 404 pattern | yes | | | yes | none |
| worker-39 | 7hxrhb/SoleTrack | Cancel Add Customer Modal | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-41 | 7hxrhb/SoleTrack | Cancel Edit Customer Details | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-42 | 7hxrhb/SoleTrack | Filter Customer Orders by Status | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-42 | 7hxrhb/SoleTrack | Show All Customer Orders After Filtering | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-43 | 7hxrhb/SoleTrack | Display Empty State (customers) | seed-data-mismatch | yes | yes | | yes | PlaywrightSteps, NetworkRequest, Screenshot | PlaywrightSteps, NetworkRequest, Screenshot | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Display Customer Row Details | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Click Customer Row Navigates | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Search Customers by Name | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Search Customers by Phone Number | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Search Customers by Email | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Search with No Results (customers) | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-43 | 7hxrhb/SoleTrack | Clear Search Restores Full List (customers) | seed-data-mismatch | yes | yes | | yes | (same cluster) | | yes | ac468df |
| worker-44 | 7hxrhb/SoleTrack | Click Edit Order Button Opens Edit Mode | backend-bug | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Filter Orders by In Progress Status | data-contamination | yes | no | Diagnosed from error output — 30+ rows | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Filter Orders by Ready for Pickup Status | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Filter Orders by Picked Up Status | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Click All Filter Shows All Orders | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Search Orders by Customer Name | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Search Orders by Order Number | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Search Orders by Item Description | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Search with No Results (orders) | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Clear Search Restores Full List (orders) | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-48 | 7hxrhb/SoleTrack | Search Combined with Status Filter | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-50 | 7hxrhb/SoleTrack | New Order Appears in Table After Creation | data-contamination | yes | no | Diagnosed from error output | yes | | | yes | none |
| worker-51 | 7hxrhb/SoleTrack | Sort Orders by Date Received Oldest First | seed-data-mismatch | yes | no | Diagnosed from error output | yes | | | yes | 1e75914 |
| worker-51 | 7hxrhb/SoleTrack | Sort Orders by Due Date | seed-data-mismatch | yes | no | Diagnosed from error output | yes | | | yes | 1e75914 |
| worker-51 | 7hxrhb/SoleTrack | Sort Orders by Status | seed-data-mismatch | yes | no | Diagnosed from error output | yes | | | yes | 1e75914 |
| worker-51 | 7hxrhb/SoleTrack | Display Empty State (orders) | seed-data-mismatch | yes | no | Diagnosed from error output | yes | | | yes | 1e75914 |
| worker-51 | 7hxrhb/SoleTrack | Status Badge Color Coding in Table | seed-data-mismatch | yes | no | Diagnosed from error output | yes | | | yes | 1e75914 |
| worker-52 | 7hxrhb/SoleTrack | Display Services Grouped by Category | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Display Service Details in Each Row | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Click Edit Button on a Service | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Click Delete Button on a Service Not Used | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Services Ordered by Category Then Name | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Create a New Service with All Fields | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Create a New Service with Only Required Fields | missing-testid | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Click Delete Button on Service Used in Orders | seed-data-mismatch | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Save Edited Service | strict-mode | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-52 | 7hxrhb/SoleTrack | Cancel Edit Service Modal | timeout | yes | no | Diagnosed from error output | yes | | | yes | 7c9c529 |
| worker-54 | 7hxrhb/SoleTrack | Deployment functional test | backend-bug | yes | yes | | yes | PlaywrightSteps, Screenshot | PlaywrightSteps, Screenshot | yes | d8a31c9 |
| worker-68 | 7hxrhb/SoleTrack | Filter Orders by In Progress Status | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Filter Orders by Ready for Pickup Status | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Filter Orders by Picked Up Status | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Click All Filter Shows All Orders | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Search Orders by Customer Name | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Search Orders by Order Number | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Search Orders by Item Description | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Search with No Results | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Clear Search Restores Full List | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |
| worker-68 | 7hxrhb/SoleTrack | Search Combined with Status Filter | seed-data-mismatch | no | no | Diagnosed from error output | yes | | | yes | none (reverted) |

### Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|------------|
| netlify-functions-404 | 2 | worker-39 | Fixed by correcting netlify dev server function routing (no SHA — inline fix) |
| customer-orders-hardcoded-counts | 2 | worker-42 | Fixed by using dynamic counts instead of hardcoded values (no SHA — inline fix) |
| neon-inherited-data | 8 | worker-43 | Fixed by switching seedDatabase() to truncateAndSeed() (SHA: ac468df) |
| orders-accumulation-no-cleanup | 9 | worker-48 | Fixed by adding deleteAllOrders helper with beforeEach cleanup (no SHA — inline fix) |
| orders-data-contamination | 5 | worker-51 | Fixed by adding deleteAllOrders cleanup and serial describe (SHA: 1e75914) |
| services-list-not-visible | 7 | worker-52 | Fixed by correcting testid mismatch in component (SHA: 7c9c529) |
| services-test-data-mismatch | 1 | worker-52 | Fixed by updating seed data (SHA: 7c9c529) |
| services-duplicate-rows | 1 | worker-52 | Fixed by deduplicating seed services (SHA: 7c9c529) |
| services-data-contamination | 1 | worker-52 | Fixed by restructuring test order (SHA: 7c9c529) |
| netlify-database-url-mismatch | 1 | worker-54 | Fixed by setting correct DATABASE_URL env var on Netlify (SHA: d8a31c9) |
| deleteAllOrders-removal | 10 | worker-68 | Self-inflicted — reverted the incorrect directive fix; beforeEach cleanup was necessary |

## 3. Patterns

### When was Replay most effective?
- **Seed data mismatch (neon-inherited-data cluster, worker-43):** Replay was essential. The error output showed wrong data but didn't explain *why*. Replay's NetworkRequest tool revealed the API returned completely different customer records than expected, confirming the Neon branch inherited parent data rather than using fresh seeds. This was the only case where REPLAY_NECESSARY was "yes."
- **Deployment verification (worker-54):** Replay confirmed the fix worked by showing all Playwright steps passed and the page rendered correctly, though the error output alone would have sufficed for diagnosis.

### When was Replay NOT used and why?
- **80.8% of failures (42/52)** did not use Replay. In every case, the reason was "diagnosed from error output."
- The dominant failure pattern was **data contamination / seed-data-mismatch** (44/52 failures, 84.6%), where error messages clearly showed expected vs actual counts (e.g., "expected 2 rows, got 30+"). These are count-based assertion failures that are self-diagnosing from error output alone.
- **Missing-testid failures** (7 tests) were diagnosed from "locator not found" errors that directly pointed to the wrong testid.
- **Backend bugs** (3 failures for 404s, 1 for date format) had clear error messages indicating the root cause.

### Common debugging strategies that worked
1. **Error-output-first triage:** The agent correctly identified that most failures (data contamination, missing testids) were diagnosable from Playwright error output alone, avoiding unnecessary Replay overhead.
2. **Cluster identification:** Recognizing shared root causes (e.g., all 9 orders-filter-search failures from missing cleanup) and applying a single fix.
3. **deleteAllOrders/truncateAndSeed patterns:** Adding cleanup helpers to manage test isolation in a persistent database.
4. **NetworkRequest + Screenshot combo:** When Replay was used, checking API responses and visual state was effective for understanding data flow issues.

### Common debugging strategies that failed
1. **Directive-driven fix without testing (worker-68):** The agent removed a "redundant" beforeEach cleanup based on a checkDirectives finding, but the cleanup was actually necessary. This caused 10 self-inflicted failures. The fix was correctly reverted.

### Recurring failure categories
| Category | Count | % of Total |
|----------|-------|-----------|
| data-contamination | 17 | 32.7% |
| seed-data-mismatch | 24 | 46.2% |
| missing-testid | 7 | 13.5% |
| backend-bug | 4 | 7.7% |
| strict-mode | 1 | 1.9% |
| timeout | 1 | 1.9% |

**Data contamination + seed-data-mismatch together account for 78.8% of all failures.** These are fundamentally the same class of problem: tests assuming specific data state without proper isolation.

## 4. Recommendations

### `skills/debugging/*.md`
- **Add pattern: "Count-based assertion failures are almost always data contamination."** When a test expects N rows but gets more, check for missing cleanup or accumulated data before reaching for Replay.
- **Add pattern: "Neon branch inheritance."** Ephemeral branches inherit parent data — always use truncateAndSeed, never seedDatabase alone.
- **Add decision tree:** "Use Replay when error output doesn't explain *why* the wrong data exists (e.g., unexpected records from unknown source). Skip Replay when error output shows a clear count mismatch with an obvious accumulation pattern."

### `skills/tasks/build/testing.md`
- **Mandate truncateAndSeed in test setup.** The neon-inherited-data cluster (8 failures) was caused by using seedDatabase() which doesn't clear existing data. This should be a hard requirement.
- **Require beforeEach cleanup for order-creating tests.** Multiple test files (orders-filter-search, orders-table-display) needed deleteAllOrders helpers added retroactively. The test-writing skill should include this from the start for any test that creates records.
- **Add guard against directive-driven regressions.** When a checkDirectives finding suggests removing code, require running the affected tests *before* committing the removal to confirm the change is safe.

### `skills/review/reportTestFailures.md`
- **Add a "Self-inflicted failure" summary row** to the Summary Statistics section to make it easy to see how many failures were caused by the agent's own fixes vs pre-existing issues.
- **Consider adding a "Failure Category Distribution" table** to the synthesis template, since the category breakdown is one of the most actionable outputs.
- **Clarify ROOT_CAUSE_CLUSTER usage for clusters in the "Failure Cluster" format.** Some clusters used the cluster format but didn't have an explicit ROOT_CAUSE_CLUSTER field — the cluster name served as the implicit ID. The template could note that the cluster heading name *is* the cluster ID when using the collapsed format.
