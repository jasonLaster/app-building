# Shell Commands Report: app-building-iyum5y

**Generated:** 2026-03-12
**Log period:** 2026-03-11T17:15 – 2026-03-12T07:33 UTC

---

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 190 |
| Total shell commands across all logs | 1,515 |
| Unique base commands (deduplicated) | 51 |
| Logs with difficulty (medium or high) | 32 (17%) |
| Logs with high difficulty | 9 (5%) |
| Overall success rate | 96.4% (1,384 / 1,436 parsed) |
| Multiple-attempt rate | 11.6% (167 / 1,436) |

---

## 2. Command Catalog

### Build & Dev (155 commands)

| Command | Freq | Success Rate | Multi-Attempt | Typical Purpose |
|---|---|---|---|---|
| npm run read-log | 89 | 100% | 0 | Read worker logs for analysis tasks |
| npm run check | 31 | 97% | 1 | Typecheck + lint before commits |
| npx tsx | 25 | 92% | 0 | Run TypeScript scripts (schema, seed, deploy) |
| npx tsc | 5 | 80% | 2 | Standalone type-checking |
| npm run deploy | 4 | 100% | 1 | Deploy to Netlify |
| npm run build | 1 | 100% | 0 | Production build |

### Testing (194 commands)

| Command | Freq | Success Rate | Multi-Attempt | Typical Purpose |
|---|---|---|---|---|
| npm run test | 103 | 82% | 42 (41%) | Primary test runner |
| npx replayio | 68 | 99% | 12 | Clear old Replay recordings before tests |
| npx playwright | 23 | 55% | 10 | Run specific test files or deployment smoke tests |

### Git (19 commands)

| Command | Freq | Success Rate | Multi-Attempt | Typical Purpose |
|---|---|---|---|---|
| git log | 7 | 100% | 0 | Explore repo history |
| git show | 4 | 100% | 1 | Read historical files |
| git fetch | 3 | 100% | 0 | Fetch remote branches |
| git merge | 3 | 100% | 0 | Merge branches |
| git diff | 2 | 100% | 0 | View file differences |

### Database (0 commands)

No standalone database CLI commands (psql, neon CLI) were observed. All database operations were handled through `npx tsx` scripts and Netlify Functions.

### File & System (1,099 commands)

| Command | Freq | Success Rate | Multi-Attempt | Typical Purpose |
|---|---|---|---|---|
| ls | 347 | 100% | 2 | Codebase exploration, file existence checks |
| find | 232 | 100% | 10 | Locate files by name/pattern |
| cd | 155 | 99% | 22 | Directory navigation in compound commands |
| grep | 114 | 95% | 6 | Search code patterns and config values |
| cat | 63 | 97% | 6 | Read file contents |
| fuser | 34 | 100% | 4 | Free ports from stale dev servers |
| mkdir | 32 | 100% | 0 | Create directory structures |
| pkill | 26 | 92% | 12 | Kill stale dev server processes |
| head | 17 | 100% | 0 | Read file headers / log previews |
| python3 | 16 | 100% | 6 | Parse JSON test results inline |
| node | 14 | 79% | 6 | Inline scripts for JSON parsing |
| wc | 11 | 100% | 0 | Count lines in files |
| tail | 8 | 100% | 0 | Read file tails |
| echo | 7 | 100% | 5 | Write output / pipe content |
| ps | 6 | 100% | 0 | List running processes |
| awk | 5 | 100% | 0 | Text processing |
| kill | 4 | 100% | 3 | Terminate specific processes |
| sleep | 2 | 100% | 1 | Wait for servers to start |

### Network (33 commands)

| Command | Freq | Success Rate | Multi-Attempt | Typical Purpose |
|---|---|---|---|---|
| curl | 33 | 79% | 12 | Health checks on deployed API endpoints, verify deployments |

### Package Management (1 command)

| Command | Freq | Success Rate | Multi-Attempt | Typical Purpose |
|---|---|---|---|---|
| npm install | 1 | 100% | 0 | Install dependencies |

### Other (17 commands)

| Command | Freq | Success Rate | Typical Purpose |
|---|---|---|---|
| npx netlify | 3 | 67% | Netlify CLI operations |
| for | 2 | 100% | Loop constructs in shell |
| timeout | 2 | 0% | Wrapping long-running commands |
| nohup | 2 | 0% | Background process management |
| tree, printf, pgrep, npx eslint | 1 each | mixed | Various utility tasks |

---

## 3. Difficulty Analysis

### Commands Frequently Requiring Multiple Attempts

| Command | Multi-Attempts | Total Uses | Rate |
|---|---|---|---|
| npm run test | 42 | 103 | 41% |
| cd (compound) | 22 | 155 | 14% |
| pkill | 12 | 26 | 46% |
| curl | 12 | 33 | 36% |
| npx replayio | 12 | 68 | 18% |
| npx playwright | 10 | 23 | 43% |
| find | 10 | 232 | 4% |
| node | 6 | 14 | 43% |
| python3 | 6 | 16 | 38% |
| cat | 6 | 63 | 10% |

### Commands with Highest Failure Rates

| Command | Failures | Total | Fail Rate |
|---|---|---|---|
| timeout | 2 | 2 | 100% |
| nohup | 2 | 2 | 100% |
| npx playwright | 5 | 11 | 45% |
| curl | 6 | 28 | 21% |
| node | 3 | 14 | 21% |
| npm run test | 15 | 83 | 18% |

### Patterns in What Made Commands Difficult

1. **Test failures requiring iteration (dominant pattern, 19 logs):** The `npm run test` command had a 41% multiple-attempt rate. Root causes include:
   - **Data contamination**: Shared database state between tests where one test's writes polluted another test's assertions
   - **Race conditions**: Frontend fetching data before prerequisite state was loaded (e.g., fetching stats before currentUser loaded)
   - **Flaky selectors**: Tests relying on visibility of elements affected by CSS (pointer-events, overlays)
   - **Test infrastructure**: results.json parsing failures, "0 tests" reported due to nested suite counting bugs

2. **Deployment verification (3 logs):** Netlify deployment debugging required multiple `curl` health checks. Primary issue was account-level `DATABASE_URL` environment variable overriding site-level configuration, causing 500 errors from Functions.

3. **Type/lint errors on first check (2 logs):** Complex component builds (RoadmapDetail, Inbox) producing type errors on first `npm run check`, requiring 2–3 fix-and-recheck cycles.

4. **Process management (1 log):** Exit code 144 (SIGUSR2) killing test processes. Agent tried `trap`, `nohup`, and background processes as workarounds.

5. **Replay infrastructure (1 log):** Port binding failures in the Replay reporter plugin, resolved by setting `REPLAY_PLAYWRIGHT_PLUGIN_SERVER_PORT` explicitly.

6. **Neon rate limits (2 logs):** Database connection limits hit when running tests in parallel branches. Resolved by running test files sequentially.

### Agent Workarounds That Succeeded

- **Data contamination**: Reordering tests (moving destructive operations last), adding `beforeEach` reset hooks, using unique test data per test
- **Race conditions**: Gating fetches on prerequisite data (e.g., wait for `currentUser` before fetching stats)
- **Test result parsing**: Using `python3` or `node` inline scripts to parse `results.json` when the test runner reported "0 tests"
- **Server management**: Standardized `fuser -k` and `pkill -f` patterns before test runs to clear stale dev servers
- **Deployment 500s**: Investigating account vs. site-level env vars, updating `DATABASE_URL` at both levels
- **Replay crashes**: Setting `REPLAY_PLAYWRIGHT_PLUGIN_SERVER_PORT` explicitly to avoid port conflicts
- **Neon rate limits**: Running test files sequentially instead of in parallel

---

## 4. Recommendations

### `skills/scripts/*.md` — Script improvements

- **Create `skills/scripts/test-cleanup.md`**: Document the standard pre-test cleanup sequence (`pkill -f "netlify|vite"`, `fuser -k 8888/tcp`, `npx replayio remove --all`) as a formal procedure. The agent runs these commands in nearly every test log — this should be a single script or documented as a mandatory preamble.

- **Create `skills/scripts/parse-test-results.md`**: The agent frequently struggles to parse `results.json` from test runs, resorting to ad-hoc `python3`/`node` inline scripts. Document a standard approach or create a `scripts/parse-test-results.ts` utility.

- **Update `skills/scripts/check.md`**: Note that complex pages (10+ components) commonly produce type errors on the first check. The skill should advise running `npm run check` incrementally during development rather than only at the end.

### Task skills improvements

- **`skills/tasks/build/writeTests.md`**: Add guidance on avoiding test data contamination — every test should reset its own data in `beforeEach` rather than relying on clean state. This was the #1 cause of test difficulty across 19 logs.

- **`skills/tasks/build/writeApp.md`**: Add guidance to gate dependent API calls on prerequisite data being loaded. Race conditions from fetching before `currentUser` was available caused multiple test failures.

- **Testing skill**: Add a note that `timeout` and `nohup` wrappers do not work reliably in this environment and should be avoided.

### Common command patterns to document

- **Dev server management**: `pkill -f "netlify|vite" ; fuser -k 8888/tcp` — used in 60+ logs, should be a documented standard procedure or a script.
- **Replay cleanup**: `npx replayio remove --all` — used before every test run, should be part of the test runner script itself.
- **Deployment health check**: `curl -s -o /dev/null -w "%{http_code}" <url>` — standard pattern for deployment verification.
- **Test result extraction**: Standardize on `npx tsx scripts/parse-test-results.ts` rather than ad-hoc `python3 -c` / `node -e` one-liners.

### Dockerfile changes

- **No new software needed**: All commands used are standard Unix utilities, Node.js, and npm packages already available. The `python3` usage (16 invocations) is only for ad-hoc JSON parsing and should be replaced with a TypeScript utility, eliminating any Python dependency.
