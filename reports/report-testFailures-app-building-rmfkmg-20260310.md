# Test Failures Report: app-building-rmfkmg — 2026-03-10

**App:** VetLedger (Veterinary Clinic Invoicing & Accounts — Vertical 7, App 4)
**Branch:** app-building-rmfkmg
**Date range:** 2026-03-10 to 2026-03-11
**Workers analyzed:** 104

---

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 104 |
| Logs with test failures | 16 |
| Logs without test failures | 88 |
| Total distinct test failures across all logs | 28 |
| Infrastructure failure events | 2 events (3 affected tests, excluded from failure counts) |
| Total affected tests (including cluster expansions) | 36 |
| Total test re-runs across all logs | 40 |
| Unique root causes | 26 (4 shared clusters + 22 standalone failures) |
| Pre-existing failure rate | 22/28 = 78.6% |
| Self-inflicted failures | 6 |
| Cascading fixes | 2 (clusters fixed by single changeset: race-condition-filter-overwrite [3 tests], modal-auto-open-conflict [2 tests]) |

**Replay usage:**
| Metric | Value |
|--------|-------|
| Replay usage rate (all failures) | 9/28 = 32.1% |
| Replay usage rate among debugged failures | 9/28 = 32.1% |
| Recording availability rate | 27/28 = 96.4% |
| Replay-assisted success rate | 9/9 = 100% |
| Replay decision quality (REPLAY_NECESSARY=no among REPLAY_USED=yes) | 4/9 = 44.4% speculative (Replay used unnecessarily) |
| Debugging efficiency (Replay used but error output alone would have sufficed) | 4 of 9 Replay uses |

**Debugging success:**
| Metric | Value |
|--------|-------|
| Debugging success rate (successful + partial / attempted) | 28/28 = 100% |
| Debugging attempted | 28 of 28 failures (all failures had debugging attempted and succeeded) |

**Resolution types:**
| Metric | Value |
|--------|-------|
| Fix reuse rate | 2 distinct fix patterns applied across multiple spec files (request-id-tracking: 3 files; strict-mode-column-selectors: 3 files) |

**Failure phase distribution:**
| Phase | Count |
|-------|-------|
| fixTests | 22 |
| other (journeyQA / polishApp) | 8 |
| writeTests | 0 |
| checkDirectives | 0 |
| deployment | 0 |

**Failure resolution type distribution:**
| Type | Count |
|------|-------|
| test-code | 15 |
| app-code | 8 |
| both | 5 |
| none | 2 |

**Test Isolation Score:**
- data-contamination: 0, strict-mode: 10, seed-data-mismatch: 3 = 13/28 = **46.4%** (below the 50% threshold)

**Diagnostic source effectiveness (successfully resolved failures):**
| Source | Count |
|--------|-------|
| error-output | 19 |
| code-inspection | 4 |
| error-context-snapshot | 1 |
| replay-necessary | 5 |
| page-snapshot | 0 |

**Self-inflicted fix quality cost:**
- 6 self-inflicted failures caused a total of **8 additional test re-runs** (set-up-payment-plan needed 2 iterations, rest needed 1)

**Fix iteration difficulty distribution:**
| FIX_ITERATIONS | Count |
|---------------|-------|
| 1 | 22 |
| 2 | 4 |
| 3 | 1 (modal-auto-open-conflict cluster) |
| 4 | 1 (race-condition-filter-overwrite cluster) |
| 0 (unresolved) | 2 |

4+ iteration failures:
- `race-condition-filter-overwrite` (InvoiceListTable filter tests, 4 iterations) — React StrictMode concurrent fetch race condition
- `modal-auto-open-conflict` (TodaySummaryCard / OutstandingBalancesCard, 3 iterations) — URL param modal auto-open masked by overlay

---

## 2. Failure Table

| Log | Worker/App | Test | Category | Pre-existing | Replay Used | Replay Not Used Reason | Recording Available | Strategy | Tools | Success | Changeset |
|-----|-----------|------|----------|-------------|------------|----------------------|-------------------|----------|-------|---------|-----------|
| 57 | VetLedger / add-edit-client-modal | AddEditClientModal validates email format | other | yes | no | error-output-sufficient | yes | Error output → add noValidate to form | — | yes | 0977cd7a79 |
| 62 | VetLedger / client-list-table | ClientListTable displays column headers | strict-mode | yes | no | error-output-sufficient | yes | Error output → scoped selector + testid | — | yes | 1ae181275f |
| 63 | VetLedger / create-edit-invoice-modal-2 | CreateEditInvoiceModal opens in edit mode with pre-filled data | backend-bug | yes | no | error-output-sufficient | yes | Error output → UUID ORDER BY on line items | — | yes | b0d250d43d |
| 63 | VetLedger / create-edit-invoice-modal-2 | CreateEditInvoiceModal invoice creation updates client outstanding balance | backend-bug | yes | yes | — | yes | NetworkRequest to rule out double-submit; code inspection of cross-join query | NetworkRequest | yes | b0d250d43d |
| 63 | VetLedger / create-edit-invoice-modal-2 | CreateEditInvoiceModal saves edits to existing invoice | strict-mode | yes | no | error-output-sufficient | yes | Error output → scoped to modal context | — | yes | b0d250d43d |
| 67 | VetLedger / daily-reconciliation | DailyReconciliationView displays payment method summary | race-condition | yes | yes | — | yes | NetworkRequest timing + PlaywrightSteps | NetworkRequest, PlaywrightSteps | yes | 059112ae8c |
| 67 | VetLedger / daily-reconciliation | DailyReconciliationView updates after recording a new payment | race-condition | yes | yes | — | yes | Logpoint on selectedInvoiceIds state + DescribePoint | Logpoint, DescribePoint, PlaywrightSteps, NetworkRequest, Screenshot, InspectElement, Evaluate | yes | 059112ae8c |
| 67 | VetLedger / daily-reconciliation | DailyReconciliationView close returns to payment list | strict-mode | yes | no | error-output-sufficient | yes | Error output → .or() pattern eliminated | — | yes | 059112ae8c |
| 69 | VetLedger / dashboard-recent-activity | RecentActivityFeed updates after creating a new invoice | race-condition | yes | yes | — | yes | NetworkRequest to verify timestamp ordering | NetworkRequest | yes | 1ff03d93dc |
| 70 | VetLedger / dashboard-summary | Failure Cluster: modal-auto-open-conflict (2 tests) | race-condition | yes | yes | — | yes | Screenshots + PlaywrightSteps + ConsoleMessages + NetworkRequest | Screenshot, PlaywrightSteps, ConsoleMessages, NetworkRequest | yes | none |
| 71 | VetLedger / invoice-detail-panel | InvoiceDetailPanel Record Payment updates invoice after payment | strict-mode | yes | no | error-context-snapshot sufficient | yes | Error context snapshot + code inspection | — | yes | ec6c668691 |
| 72 | VetLedger / invoice-list-table | InvoiceListTable displays all columns | strict-mode | yes | no | error-output-sufficient | yes | Error output → testid on header row | — | yes | 9a0b34009e |
| 72 | VetLedger / invoice-list-table | Failure Cluster: race-condition-filter-overwrite (3 tests) | race-condition | yes | no | code-inspection — recognized StrictMode pattern | yes | Code inspection → request-id tracking | — | yes | 9a0b34009e |
| 72 | VetLedger / invoice-list-table | InvoiceListTable displays all columns (self-inflicted) | race-condition | no | no | error-output-sufficient | yes | Error output → fix over-rejection of stale requests | — | yes | 9a0b34009e |
| 72 | VetLedger / invoice-list-table | InvoiceListTable updates after voiding an invoice | race-condition | yes | no | error-output-sufficient | yes | Error output → missing confirm click + Redux reducer | — | yes | 9a0b34009e |
| 73 | VetLedger / monthly-summary | MonthlySummary filters data by selected month (wrong column) | backend-bug | yes | no | error-output-sufficient | yes | Error output → wrong filter column (created_at vs due_date) | — | yes | fe3f2c1524 |
| 73 | VetLedger / monthly-summary | MonthlySummary filters data by selected month (race condition) | race-condition | yes | yes | — | yes | NetworkRequest to trace request timing and out-of-order responses | PlaywrightSteps, NetworkRequest | yes | fe3f2c1524 |
| 74 | VetLedger / payment-list-table | PaymentListTable displays all columns | strict-mode | yes | no | error-output-sufficient | yes | Error output → testid on column header | — | yes | f707c5a4a3 |
| 74 | VetLedger / payment-list-table | PaymentListTable date range filter filters payments | race-condition | yes | no | code-inspection — recognized StrictMode pattern | yes | Code inspection → request-id tracking | — | yes | f707c5a4a3 |
| 74 | VetLedger / payment-list-table | PaymentListTable updates after recording a new payment | strict-mode | yes | yes | — | yes | PlaywrightSteps + Logpoint on selectedInvoiceIds + Screenshots | PlaywrightSteps, Screenshot, NetworkRequest, ConsoleMessages, ListSources, Logpoint, ReadSource | yes | f707c5a4a3 |
| 78 | VetLedger / payment-plan-list-table | PaymentPlanListTable displays all columns | strict-mode | yes | no | error-output-sufficient | yes | Error output → testid on column header | — | yes | a8464d657a |
| 78 | VetLedger / payment-plan-list-table | PaymentPlanListTable shows correct payment plan data | bad-assertion-api | yes | no | error-output-sufficient | yes | Error output → wrong expected next-payment date | — | yes | a8464d657a |
| 80 | VetLedger / record-payment-modal-validation | RecordPaymentModal payment appears in invoice detail payment history | strict-mode | yes | yes | — | yes | Screenshots to verify DOM structure (error output was sufficient) | PlaywrightSteps, Screenshot, ConsoleMessages, NetworkRequest, ListSources, Logpoint, ReadSource | yes | 4e59e3e |
| 97 | VetLedger / polishApp | PaymentPlanListTable displays all columns (self-inflicted) | strict-mode | no | no | error-output-sufficient | yes | Error output → span→th change during accessibility refactor | — | yes | none |
| 101 | VetLedger / journeyQA | Check Out a Client After an Appointment — Create invoice from dashboard and collect payment | bad-assertion-api | no | yes | — | yes | Attempted Replay (upload failed), fell back to code inspection | PlaywrightSteps, Screenshot | yes | none |
| 102 | VetLedger / journeyQA | Set Up a Payment Plan — Create an installment plan for a client | seed-data-mismatch | no | no | error-output-sufficient | yes | Error output → outstandingInvoice undefined, API not ok | — | yes | none |
| 102 | VetLedger / journeyQA | Monitor and Follow Up on Overdue Payment Plans — Find and review overdue payment plans | seed-data-mismatch | no | no | error-output-sufficient | yes | Error output → payment-plan-list-empty not found | — | yes | none |
| 103 | VetLedger / journeyQA | Generate Monthly Revenue Report — Review revenue by category and monthly summary | seed-data-mismatch | no | no | error-output-sufficient | yes | Error output → revenue-row-exam not found; inspected backend filter | — | yes | none |
| (70 infra) | VetLedger | Server startup timeout (all tests in dashboard-summary.spec.ts) | infrastructure | — | — | — | no | Increased server timeout to 120s | — | yes | — |
| (101 infra) | VetLedger | Recording upload failures (2 journeyQA tests) | infrastructure | — | — | — | no | Retry on next run | — | resolved | — |

*Note: self-inflicted failures in log 72 (1), log 97 (1), log 101 (1), log 102 (2), log 103 (1) — 6 total.*

---

## Root Cause Clusters

| Cluster | Count | Logs | Resolution |
|---------|-------|------|-----------|
| strict-mode-column-selectors | 3 | 72, 74, 78 | Single fix pattern per log — add testid to column header span/th; same bug in all three list tables |
| race-condition-filter-overwrite | 3 (tests) | 72 | Fixed by request-id tracking pattern in invoicesSlice; single changeset 9a0b34009e |
| modal-auto-open-conflict | 2 (tests) | 70 | Fixed by removing URL-param modal-auto-open from test navigation flow; changeset "none" (inline edit) |
| clients-cross-join-balance | 1 | 63 | Fixed by rewriting the clients list SQL query to eliminate cross-join; changeset b0d250d43d |
| request-id-tracking (fix pattern) | applied in logs 72, 73, 74 | — | Same fix pattern (request-id tracking in Redux slice) applied across invoicesSlice, reportsSlice, paymentsSlice |

---

## 3. Patterns

### Replay Effectiveness

Replay was used in 9 of 28 failures (32.1%). Of those:
- 5 were **genuinely necessary** (REPLAY_NECESSARY=yes): the race conditions in DailyReconciliationView (×2), MonthlySummary, modal-auto-open-conflict, and PaymentListTable invoice-toggle. In all 5 cases Replay revealed timing or state-mutation issues invisible in error output.
- 4 were **speculative** (REPLAY_NECESSARY=no): error output alone would have sufficed (clients-cross-join-balance, RecentActivityFeed, RecordPaymentModal payment history, checkout-client journeyQA — the last also had an upload failure).

**When Replay was most effective:**
- React StrictMode race conditions involving out-of-order network responses — Replay's `NetworkRequest` tool exposed exact request/response timing, which cannot be inferred from assertion errors alone.
- Double-toggle/click propagation bugs — Replay's `Logpoint` tool on Redux state (`selectedInvoiceIds`) directly showed the toggle-on-then-off sequence, revealing test click pattern mismatch with the checklist UI.
- Modal overlay conflicts (modal-auto-open-conflict) — Screenshots at precise time-points exposed the hidden modal overlaying the button the test tried to click.

**Tool sequences that worked:**
1. `NetworkRequest` → `PlaywrightSteps` — for timing/ordering race conditions
2. `Logpoint` (state variable) → `DescribePoint` → `PlaywrightSteps` — for double-toggle state bugs
3. `Screenshot` → `PlaywrightSteps` → `ConsoleMessages` + `NetworkRequest` — for modal overlay conflicts

### When Replay Was NOT Used and Why

| Reason | Count |
|--------|-------|
| error-output-sufficient | 14 |
| code-inspection | 3 |
| error-context-snapshot | 1 |

The dominant reason (14/18 no-Replay cases) was that error output clearly identified the root cause:
- Strict mode violations: the Playwright error explicitly names the matched locators.
- Wrong filter column: expected vs received values made the bug obvious.
- Wrong expected dates in test assertions.
- Backend line item ordering: test showed Rabies Vaccine before Annual Exam.

Code inspection was used in 3 cases where the agent recognized a known pattern (React StrictMode concurrent fetch) from prior debugging in the same session and applied the fix without running Replay.

### Common Debugging Strategies

**Strategies that worked:**
1. **Error output + code inspection** — the single most effective combination (14 successes). Works for strict-mode violations, assertion mismatches, and API filter bugs.
2. **Replay NetworkRequest + timing correlation** — critical for React StrictMode race conditions where stale responses overwrite correct state.
3. **Replay Logpoint on Redux state** — critical for double-toggle/click propagation bugs in checklist UIs.
4. **Pattern recognition from prior session** — once the request-id-tracking fix was developed for invoicesSlice (log 72), it was applied immediately to paymentsSlice (log 74) and reportsSlice (log 73) without needing Replay.

**Strategies that failed / took extra iterations:**
1. **Over-broad stale-request rejection** (log 72) — the initial fix for the StrictMode race condition rejected all stale requests, which caused tests to fail on the initial page load. Required a follow-up fix (self-inflicted failure, 1 additional re-run).
2. **JourneyQA assumptions about seeded data** — tests assumed specific invoice/payment data would exist in the deployed database, but the deployed state differed from local fixtures. Required 2–3 re-runs to align tests with actual data state.

### Failure Category Distribution

| Category | Count | % of Total |
|----------|-------|-----------|
| strict-mode | 10 | 35.7% |
| race-condition | 9 | 32.1% |
| seed-data-mismatch | 3 | 10.7% |
| backend-bug | 3 | 10.7% |
| bad-assertion-api | 2 | 7.1% |
| other | 1 | 3.6% |
| infrastructure (excluded) | 2 events | — |

### Test Isolation Issues

**Test Isolation Score: 46.4%** (strict-mode: 10 + seed-data-mismatch: 3 = 13/28). This is below the 50% threshold, so no dedicated subsection is required. However, strict-mode violations were the single most common category (10 failures, 35.7%) and warrant attention.

**Strict-mode violation root causes:**
- **Column header ambiguity** (3 logs: 72, 74, 78) — filter buttons and column header `<span>` elements shared generic text labels (`Client`, `Method`, `Status`), causing Playwright strict-mode to fail when multiple elements matched. Fixed by adding `data-testid` attributes to column headers or scoping selectors.
- **Modal context leakage** (logs 63, 71) — `data-testid` attributes for invoice/payment components existed in both a modal and a detail panel simultaneously, causing strict-mode violations. Fixed by scoping assertions to a specific container.
- **List/empty-state co-presence** (log 67) — `payment-list-table` and `payment-list-empty` resolved simultaneously. Fixed with `.or()` pattern removal.
- **Checklist/invoice selector ambiguity** (log 80) — `data-testid^="payment-"` prefix matched both a container (`payment-history-section`) and individual entries (`payment-<uuid>`).

**Seed data mismatch root causes (journeyQA):**
All 3 seed-data-mismatch failures were self-inflicted — the agent wrote journeyQA tests assuming specific data would be present in the deployed database (specific invoice/payment records, overdue payment plans, invoices created in a specific month) but the deployed state differed. These are inherent to the journeyQA approach where tests run against live deployed data.

### Self-Inflicted Failure Rate

**6 of 28 failures (21.4%) were self-inflicted.** This is below the concerning threshold (>50%) but worth tracking.

Self-inflicted failure breakdown:
| Log | Test | Cause | Re-runs caused |
|-----|------|-------|----------------|
| 72 | InvoiceListTable displays all columns | Over-broad stale-request rejection in race-condition fix | 1 |
| 97 | PaymentPlanListTable displays all columns | Accessibility refactor changed `<span>` to `<th>`, breaking test selector | 1 |
| 101 | checkout-client journeyQA | Test asserted `invoice-balance-due` still visible after full payment (but it conditionally renders) | 1 |
| 102 | set-up-payment-plan journeyQA | Test assumed invoices needed to be created via API, but API failed; existing invoice in DB was sufficient | 2 |
| 102 | monitor-overdue-payment-plans journeyQA | Test assumed payment plan list would be empty, but plans already existed | 1 |
| 103 | generate-monthly-revenue-report journeyQA | Test used past date range but revenue filters by created_at (current month data) | 1 |

The polishApp self-inflicted failure (log 97) illustrates a process gap: accessibility refactors that change HTML element types (span → th) break test selectors without running tests first.

---

## 4. Recommendations

### `skills/debugging/*.md`

**1. Document the React StrictMode race-condition pattern explicitly.**
The `request-id-tracking` fix pattern was independently needed for invoicesSlice, paymentsSlice, and reportsSlice. A dedicated entry in a debugging skill (e.g., `skills/debugging/react-strictmode.md`) should document:
- Symptom: filters appear to work intermittently; test sees unfiltered data after applying a filter.
- Root cause: React StrictMode double-fires effects, causing two concurrent fetches where the stale unfiltered response arrives after the filtered one.
- Fix: Track a `requestId` or `AbortController` in the Redux slice and discard responses from superseded requests.
- Diagnostic tool: Replay `NetworkRequest` to see request timing and which response arrived last.

**2. Document the checklist double-toggle pattern.**
When a test clicks a "container" element that encloses a checklist option, click propagation selects the option (container click lands on option → selected), then the explicit option click immediately deselects it. Appears in logs 67, 74. Debugging: Replay `Logpoint` on the selection state array to see toggle-on / toggle-off sequence within milliseconds of each other. Fix: skip clicking the container; click the option directly.

**3. Add strict-mode column header guidance.**
Add a note that list tables with both filter buttons and column headers using generic text labels (Status, Method, Client) will fail Playwright strict-mode. Best practice: always add `data-testid` to column header elements during writeTests, or scope the column header assertions to a `thead` context.

### `skills/tasks/build/testing.md`

**1. Run targeted tests after polishApp accessibility refactors.**
The MakeAccessiblePaymentPlans task changed `<span>` to `<th>`, breaking a test selector. The skill should require running the affected spec file after each accessibility refactor, not just running `npm run check`. Suggested addition: "After any HTML structure change (element type, nesting), run the spec file for that component before committing."

**2. JourneyQA tests should use deterministic seed data, not assume live data state.**
Three of 4 seed-data-mismatch failures occurred because journeyQA tests assumed specific records (invoices, payment plans) existed in the deployed database. The skill should specify: "Do not assume records from prior test runs persist in the deployed database. Either (a) create all required seed data programmatically within the test, or (b) query the API at the start of the test to find an existing record rather than hard-coding an ID or name."

**3. Prioritize error output before opening Replay.**
The Replay decision quality metric shows 44.4% of Replay usages were speculative (error output would have sufficed). The skill should guide: "Before opening a Replay recording, read the full error output and error context snapshot. If the expected vs received values, selector name, or API response clearly identify the root cause, fix directly — do not use Replay speculatively."

**4. When applying a fix pattern across slices, apply it everywhere at once.**
The request-id-tracking fix was applied to invoicesSlice (log 72), then later independently to paymentsSlice (log 74) and reportsSlice (log 73). The skill should recommend: "When a race-condition fix is applied to one Redux slice, check whether other slices using the same fetching pattern need the same fix, and apply it proactively."

### `skills/review/reportTestFailures.md`

**1. Add "infrastructure vs. test failure" classification guidance for journeyQA seed-data failures.**
Seed-data-mismatch failures in journeyQA are a distinct category from within-spec data contamination. They represent a mismatch between the test's assumptions about deployed data and actual live state. Consider adding `seed-data-mismatch` to the recommended FAILURE_CATEGORY list with a note that it applies specifically to journeyQA tests that assume specific pre-existing records.

**2. Clarify SELF_INFLICTED for polishApp and journeyQA phases.**
The SELF_INFLICTED definition currently focuses on "failures introduced by a fix attempt during the current session." However, log 97 (polishApp) and logs 101-103 (journeyQA) show two additional self-infliction patterns: (a) refactoring breaking existing tests, and (b) writing new tests with incorrect assumptions. The template should distinguish between these subtypes to help measure fix quality more precisely.

**3. Add DIAGNOSED_FROM for infrastructure failures.**
The infrastructure failure template does not include a DIAGNOSED_FROM field, but the server startup timeout (log 70) was diagnosed from the error output (timeout message). Adding this field to infrastructure entries would enable more complete diagnostic source analysis.

---

## 5. Replay Fixes Table

For each test failure where Replay was used and the test failure was successfully fixed:

---

INITIAL_CHANGESET: b0d250d43d
FAILING_TEST: CreateEditInvoiceModal invoice creation updates client outstanding balance
FINAL_CHANGESET: b0d250d43d
ASSESSMENT: Replay NetworkRequest confirmed only 1 POST to /api/invoices was made, ruling out double-submission. Led to code inspection of the clients.ts SQL query which had a cross-join causing inflated outstanding balance. REPLAY_NECESSARY=no — error output alone would have been sufficient to diagnose the cross-join, but Replay helped quickly rule out double-submission as an alternative hypothesis.

---

INITIAL_CHANGESET: 059112ae8c
FAILING_TEST: DailyReconciliationView displays payment method summary
FINAL_CHANGESET: 059112ae8c
ASSESSMENT: Replay NetworkRequest revealed React StrictMode double-fired the initial fetch for today's date. The stale duplicate response (arriving at 2261ms) overwrote the correct response for the selected date (2026-03-05, arriving at 2126ms). Fix tracked reconciliationRequestedDate in Redux state to discard out-of-order responses. REPLAY_NECESSARY=yes — timing data could not have been inferred from error output alone.

---

INITIAL_CHANGESET: 059112ae8c
FAILING_TEST: DailyReconciliationView updates after recording a new payment
FINAL_CHANGESET: 059112ae8c
ASSESSMENT: Replay Logpoint on selectedInvoiceIds state revealed that toggleInvoice was called twice in rapid succession — once from the container click propagating to the option (selecting it) and once from the explicit option click (deselecting it). The invoice ended up unselected at submit time. Fix: changed test to click the option directly without first clicking the container. REPLAY_NECESSARY=yes — the double-toggle behavior was invisible in error output which only showed a validation error.

---

INITIAL_CHANGESET: 1ff03d93dc
FAILING_TEST: RecentActivityFeed updates after creating a new invoice
FINAL_CHANGESET: 1ff03d93dc
ASSESSMENT: Replay NetworkRequest confirmed the API returned seed payments with hardcoded noon UTC timestamps, which sorted before the newly created invoice's current-time timestamp when tests ran before noon. Fix: updated seed data to use current timestamp. REPLAY_NECESSARY=no — the expected/received values in the error output ("Payment via cash" appearing before "Invoice #") clearly showed ordering was the issue.

---

INITIAL_CHANGESET: none (inline fix)
FAILING_TEST: TodaySummaryCard updates after recording a new payment / OutstandingBalancesCard updates after payment
FINAL_CHANGESET: none (inline fix)
ASSESSMENT: Replay Screenshots and PlaywrightSteps revealed that quick action buttons navigate with URL params (?record=true, ?create=true) that auto-open modals. Tests then clicked buttons (record-payment-btn, create-invoice-btn) that were obscured by the already-open modal overlay, causing Playwright to get stuck. Fix: updated tests to not use quick-action navigation that triggers auto-open, and ensured no modal was open before clicking page buttons. REPLAY_NECESSARY=yes — the modal overlay was invisible in error output which only showed a timeout on button click.

---

INITIAL_CHANGESET: fe3f2c1524
FAILING_TEST: MonthlySummary filters data by selected month (race condition)
FINAL_CHANGESET: fe3f2c1524
ASSESSMENT: Replay NetworkRequest traced all API calls and their response timing: request A (March, initial) at 729ms, request B (March, StrictMode duplicate) at 733ms, request C (January, correct user action) at 1145ms. Request C resolved at 1750ms with correct $3,000, but request B resolved at 1973ms and overwrote it with stale $0. Fix: applied request-id-tracking pattern to reportsSlice. REPLAY_NECESSARY=yes — the race condition timing was completely invisible in error output.

---

INITIAL_CHANGESET: f707c5a4a3
FAILING_TEST: PaymentListTable updates after recording a new payment
FINAL_CHANGESET: f707c5a4a3
ASSESSMENT: Replay PlaywrightSteps + Logpoint on selectedInvoiceIds confirmed the double-toggle bug: clicking the payment-invoice-select container propagated to the invoice option (selecting it), then the explicit invoice option click deselected it, leaving zero invoices selected at submit time. Fix: updated test to click the invoice option directly. REPLAY_NECESSARY=yes — the behavior was invisible; error output only showed "Please select at least one invoice" validation message.

---

INITIAL_CHANGESET: 4e59e3e
FAILING_TEST: RecordPaymentModal payment appears in invoice detail payment history
FINAL_CHANGESET: 4e59e3e
ASSESSMENT: Replay Screenshots confirmed that data-testid^="payment-" prefix matched both the payment-history-section container and individual payment-<uuid> entries, causing a strict-mode count mismatch. Fix: changed selector to be more specific. REPLAY_NECESSARY=no — error output count mismatch (2 vs 1) was sufficient to diagnose the overly-broad prefix selector.

---

INITIAL_CHANGESET: none
FAILING_TEST: Check Out a Client After an Appointment — Create invoice from dashboard and collect payment
FINAL_CHANGESET: none
ASSESSMENT: Replay recording uploads failed with "entity too large" GraphQL error on first attempt. Agent attempted PlaywrightSteps and Screenshot but got upload errors. Diagnosis came from code inspection of InvoiceDetailPanel — invoice-balance-due only renders conditionally when balanceDue > 0, so after full payment the element disappears. Fix: removed assertion that invoice-balance-due was still visible. REPLAY_NECESSARY=no — code inspection was sufficient once the agent looked at the component.
