# Debugging with Replay MCP Tools

This directory contains guides for using Replay MCP tools to investigate different categories
of test failures. Before attempting to debug a test failure, scan these guides for the category
that matches your failure and follow the recommended tool sequence.

## Guides

- `timeouts.md` — Test timeouts and stuck steps (most common failure type)
- `race-conditions.md` — Parallel test interference, flaky assertions, state corruption
- `component-rendering.md` — Components not mounting, empty DOM, React rendering issues
- `network-and-api.md` — API errors, missing data, wrong responses
- `form-and-input.md` — Form validation, input interactions, browser-native behavior
- `seed-data.md` — Missing test data, empty collections, count mismatches

## Default First Tool: PlaywrightSteps

**Always call `PlaywrightSteps` first** when diagnosing any test failure with Replay. It
provides step timing, identifies which step failed, and guides which tool to use next:

1. **`PlaywrightSteps`** — Shows the exact sequence of Playwright actions with timestamps.
   Identifies which step stalled or failed.

Then choose the next tool based on what PlaywrightSteps reveals:

- **API/data issues** (wrong response, missing data) → `NetworkRequest` to inspect request
  payloads and response bodies.
- **Missing event handlers** (interaction had no effect) → `Logpoint` on the handler to
  check if it was called (0 hits = never fired).
- **Visual/layout issues** (element not visible, wrong position) → `Screenshot` at the
  failing step's point.
- **Timeout from excessive assertions** (many steps each taking seconds) → the fix is
  usually to batch assertions via `page.evaluate`.

This was the most frequently used and successful Replay approach (used in 6/9 Replay
sessions with 100% success rate). When the UI renders but shows wrong data or times out
waiting for content, `NetworkRequest` as a second step confirms whether the backend
returned the expected data.

## Pre-Debugging Triage

Before using Replay tools or making any code changes, determine whether failures are
pre-existing or new:

### Pre-existing failure triage
When tests fail during a task, first verify whether failures are pre-existing by running
the same tests on the unmodified code:

1. `git stash` your changes (or check out the base commit).
2. Run the failing tests on the unmodified code.
3. If the tests fail identically, the failures are pre-existing and out of scope for the
   current task. Note them and move on.
4. `git stash pop` to restore your changes.

This is the most effective first step — it avoids spending time debugging failures that
are unrelated to the current work.

### Infrastructure failure detection
When multiple tests fail with identical navigation timeouts, socket errors
(`ETIMEDOUT`, `ERR_SOCKET_NOT_CONNECTED`), or `net::ERR_CONNECTION_REFUSED`, classify
these as infrastructure failures early and skip further debugging. Signs of infrastructure
failures:

- 5+ tests failing with the same timeout/socket error
- No recordings generated (the browser couldn't connect)
- Failures are across unrelated test files in the same app
- A simple retry resolves transient cases; persistent failures indicate a deeper issue

Do not use Replay tools for infrastructure failures — there are no usable recordings.

### When recordings ARE available — use Replay
When a failure is **not** pre-existing and a recording **is** available, always use Replay
MCP tools before declaring the failure unresolvable. The recording contains the actual
runtime state and is more reliable than guessing from error messages alone. Follow the
tool sequence in the relevant debugging guide below.

## No-Replay Diagnostic Patterns

Some failures can be diagnosed from Playwright error output alone without needing Replay:

### Strict mode violation
When Playwright reports `strict mode violation` with N matching elements, the fix is almost
always to add more specific selectors. Common fixes:
- Add `nth(0)` or `first()` to narrow to a single match
- Use `filter({ hasText: ... })` to disambiguate
- Add a unique `data-testid` attribute to the target element

Replay is not needed — the error message tells you exactly how many elements matched and
what the ambiguous locator was.

## Quick Reference: Which Tool to Start With

| Symptom | Start with |
|---------|-----------|
| Test timed out | `PlaywrightSteps` |
| Element not found / count mismatch | `PlaywrightSteps` then `Screenshot` |
| Wrong data displayed | `NetworkRequest` then `Logpoint` |
| Component not rendering | `Screenshot` then `ConsoleMessages` |
| API returning errors | `NetworkRequest` then `ConsoleMessages` |
| Assertion wrong value | `Evaluate` or `Logpoint` |
| Flaky / intermittent | `PlaywrightSteps` then `Logpoint` on shared state |
| Uncaught exception | `UncaughtException` then `GetStack` |
| DB constraint violation (500) | `NetworkRequest` then `Logpoint` on handler |
| Click times out on toggle/checkbox | `PlaywrightSteps` then check if testid is on sr-only element |
| All API calls failing after setup | `NetworkRequest` then `LocalStorage` (stale server?) |
| Multiple timeouts on fresh build | `PlaywrightSteps` then `DescribeComponent` (Replay browser overhead?) |
| Auth test returns 409/400 | `PlaywrightSteps` then `NetworkRequest` (check request payload) |
| Action succeeds but UI doesn't update | `NetworkRequest`/`LocalStorage` then `ReactRenders` (state hydration gap?) |
