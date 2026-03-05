# Shell Commands Report: app-building-y1gk9z-20260304-232636

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 104 |
| Total shell commands across all logs | 647 |
| Unique commands (by base command) | 32 |
| Logs with difficulty (medium or high) | 26 (25.0%) |
| Overall success rate | 92.2% (590/640 commands succeeded) |
| Multiple-attempt rate | 10.3% (66/640 commands required retries) |

**Difficulty breakdown:**
- none: 54 logs (51.9%)
- low: 22 logs (21.2%)
- medium: 19 logs (18.3%)
- high: 7 logs (6.7%)

## 2. Command Catalog

### Build & Dev

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm run check` | ~45 | Type check + lint quality gate before commit | ~85% (often partial due to lint warnings) |
| `npm run build` | 2 | Production build verification | 100% |
| `npx tsc --noEmit` | ~12 | Standalone TypeScript type checking | 100% |
| `npx eslint <file>` | ~8 | Targeted lint of specific files | ~75% (often failed first, passed after fixes) |
| `npx create-vite@latest` | 1 | Scaffold new Vite + React project | 100% |
| `npm run deploy` | 2 | Deploy app to Netlify | 100% (after fixing interactive prompt issue) |
| `npm run read-log` | ~80 | Read log files for analysis tasks | 100% |

### Testing

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm run test <spec>` | ~40 | Run Playwright test suites | ~70% first attempt; ~95% after fixes |
| `npx playwright test --list` | ~5 | Verify test file discovery | 100% |
| `npx playwright install chromium` | 1 | Install Chromium for Playwright | 100% |
| `npx replayio install` | 1 | Install Replay browser for recording | 100% |
| `npx playwright test --config playwright.deployment.config.ts` | 1 | Run deployment verification tests | 100% |

### Git

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `git fetch origin main` | 3 | Fetch latest main branch | 100% |
| `git merge FETCH_HEAD --no-edit` | 3 | Merge main into working branch | 100% |
| `git rev-parse HEAD` | ~6 | Get current commit hash for bug reports | 100% |
| `git log` | ~8 | View commit history, analyze fixes | 100% |
| `git diff` | ~6 | View code changes for analysis | 100% |
| `git show` | ~8 | Inspect file at specific revision | 100% |
| `git add -A && git commit` | ~4 | Commit pre-analysis state | 100% |

### Database

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `curl` (Neon API) | ~4 | Create Neon DB project, seed production DB | ~75% (required retries for auth) |
| `npx netlify env:list` | 1 | Check environment variables on Netlify | 100% |
| `npx netlify env:set` | ~2 | Set DATABASE_URL for production | 100% (after identifying correct value) |

### File & System

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `ls` / `ls -la` | ~40 | List directory contents for exploration | 100% |
| `find` | ~25 | Search for files by name/pattern | 100% |
| `mkdir -p` | ~15 | Create directories (analysis dirs, docs, etc.) | 100% |
| `cp -r` | 1 | Copy scaffold into app directory | 100% |
| `cat` | ~10 | Read file contents (logs, task queue, configs) | 100% |
| `grep` / `grep -r` | ~15 | Search file contents | 100% |
| `wc -l` | 1 | Check file length | 100% |
| `pwd` | 2 | Verify current working directory | 100% |
| `env | grep` | 2 | Check environment variables | 100% |
| `kill` / process management | ~8 | Kill stale Netlify dev/Node processes | ~90% |

### Package Management

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm install` | ~5 | Install project dependencies | 100% |
| `npm install <packages>` | ~5 | Install specific runtime/dev dependencies | 100% |

### Network

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `curl` (API endpoints) | ~3 | Test deployed API health | ~60% (500 errors until DB configured) |

### Other

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npx tsx scripts/add-task.ts` | ~60 | Queue tasks for the worker system | 100% |
| `node -e "..."` | 1 | Check module exports | 100% |
| Python one-liners | ~3 | Fix corrupted task queue JSON | ~75% |

## 3. Difficulty Analysis

### Commands That Frequently Required Multiple Attempts

1. **`npm run test`** (most retries — ~20 instances): Test runs frequently failed on first attempt due to:
   - Missing `beforeEach` DB reset causing test isolation issues
   - Stale Netlify dev server processes from prior runs
   - Date formatting bugs (formatDate returning wrong values)
   - Price conversion bugs (cents vs dollars)
   - The "0 tests" stdout confusion where the agent misread Playwright output format

2. **`npm run check`** (~10 retries): Lint/type check failures requiring code fixes:
   - `set-state-in-effect` lint rule violations
   - `refs-during-render` violations
   - Redux immutability violations
   - Unused variable/import warnings

3. **`npx eslint <file>`** (~4 retries): Targeted lint after initial `npm run check` identified issues.

### Commands That Frequently Failed

1. **`npm run test`**: First-run failure rate ~30%. Root causes: test isolation (no DB cleanup between tests), stale servers blocking ports, application bugs exposed by tests.

2. **`curl` against Neon/production APIs**: Failed when DATABASE_URL was not set or was set to wrong value on Netlify. Required multiple env var adjustments.

3. **`npm run deploy`** (worker 49): First attempt failed because the deploy script prompted for interactive input. Fixed by modifying the script.

### Patterns in What Made Commands Difficult

- **Stale processes**: Netlify dev servers from prior test runs held ports, causing subsequent tests to fail or hang. Agent had to `kill` processes between runs.
- **"0 tests" stdout confusion**: The agent repeatedly misinterpreted Playwright's output format, thinking tests weren't running when they actually passed. This wasted investigation time in ~8 worker iterations (71-77, 80, 85).
- **Test isolation**: Tests that mutated DB state without cleanup caused cascading failures across test files.
- **Environment variable management**: Production deployment required correctly setting DATABASE_URL on Netlify, which involved multiple curl/env commands.
- **Bash scripting errors** (worker 92): A bash loop to create analysis task groups accidentally created ~1001 entries, requiring Python cleanup of the task queue JSON.

### Agent Workarounds That Succeeded

- Killing stale `netlify dev` / `node` processes before test runs became a standard pattern
- Adding `beforeEach` DB reset hooks to fix test isolation
- Reading test log files (rather than relying on stdout) to determine actual pass/fail status
- Using `git show <rev>:<path>` to inspect code at prior revisions for bug analysis
- Using Python one-liners to atomically repair corrupted JSON task files

## 4. Recommendations

### `skills/scripts/*.md` — Script Improvements

1. **Update `skills/scripts/check.md`**: Document that `npm run check` may return partial success with lint warnings that don't block the build. Clarify which lint rules are errors vs. warnings.

2. **Create `skills/scripts/test-run.md`**: Document the standard test execution procedure:
   - Always kill stale `netlify dev`/`node` processes before running tests (`pkill -f "netlify dev"` or similar)
   - Read results from the test log file, not from stdout (which may show "0 tests" misleadingly)
   - If tests fail on first run, check for test isolation issues (missing DB cleanup in `beforeEach`)

3. **Update `skills/scripts/deploy.md`** (if exists, or create): Document that deploy scripts must not use interactive prompts. Include the standard env var setup procedure for Netlify (DATABASE_URL, NEON_PROJECT_ID).

### Task Skills Improvements

4. **`skills/tasks/build/writeTests.md`**: Add directive that every test file must include `beforeEach` DB cleanup to prevent test isolation failures. This was the #1 cause of test retries.

5. **`skills/tasks/maintain/checkDirectives.md`**: Add a check for stale process cleanup in test-running tasks. The agent should verify no processes are holding ports before running tests.

6. **`skills/tasks/deployment.md`**: Add pre-deployment checklist:
   - Verify DATABASE_URL is set on Netlify
   - Verify the DB has been seeded with production data
   - Ensure deploy script runs non-interactively

### Standard Procedures to Document

7. **Process cleanup pattern**: Before any test run, execute: `pkill -f "netlify dev" 2>/dev/null; pkill -f "node.*playwright" 2>/dev/null; sleep 1`. This should be in a shared script or documented as a standard pre-test step.

8. **Test log reading pattern**: After running `npm run test <spec>`, always read the log file at `logs/test.log` (or the path specified in the test script) rather than parsing stdout. The Playwright output format with Replay recording can mislead the agent.

9. **Task queue safety**: When generating tasks programmatically (bash loops), always verify the resulting task count before proceeding. The worker 92 incident where ~1001 groups were created could be prevented with a sanity check.

### Dockerfile Changes

10. **No changes needed**: All required software (Node.js, npm, Playwright, Replay browser, git, curl) was available. The `npx playwright install chromium` and `npx replayio install` commands succeeded, suggesting these could optionally be pre-installed in the Dockerfile to save ~30 seconds per fresh run, but this is low priority.
