# Shell Commands Report: app-building-7f91h9

**Generated:** 2026-03-07
**Logs analyzed:** Workers 11-95 (85 log files)

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 85 |
| Total shell commands across all logs | ~560 |
| Unique commands (by base command) | ~30 |
| Logs with difficulty (medium or high) | 16 (19%) |
| Logs with no shell commands | 4 (workers 63, 69, 94, 95) |
| Overall success rate | ~90% |
| Multiple-attempt rate | ~8% of all commands |

**Difficulty breakdown:**
- None: 49 logs (58%)
- Low: 13 logs (15%)
- Medium: 10 logs (12%)
- High: 8 logs (9%)
- N/A (no commands): 5 logs (6%)

## 2. Command Catalog

### Build & Dev

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run check` | ~45 | Run typecheck + lint quality gate before completing tasks | ~85% (often fails first, passes after fixes) |
| `npm run test <file>` | ~40 | Run Playwright test suites against the app | ~70% first run, ~95% after fixes |
| `npm run deploy` | ~3 | Deploy app to Netlify production | ~100% |
| `npx tsc --noEmit` | ~8 | TypeScript type checking (standalone) | ~60% (often reveals type errors to fix) |
| `npx eslint .` | ~2 | Standalone lint checking | ~50% |
| `npx netlify dev` | ~2 | Manually start dev server for debugging | 100% |
| `npx playwright test` | ~10 | Run Playwright tests (deployment tests, journey tests) | ~60% first run |
| `npm install` | ~3 | Install npm dependencies for new apps | 100% |

### Testing

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npx replayio remove --all` | ~35 | Clear old Replay recordings before test runs | 100% |
| `npx replayio install` | ~2 | Install Replay browser runtime | 100% |

### Git

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `git show <commit>:<path>` | ~50 | Retrieve reference files from git history | ~85% (wrong commit hash sometimes) |
| `git log --oneline` | ~15 | View recent commit history | 100% |
| `git fetch origin main` | ~3 | Fetch latest main branch | 100% |
| `git merge FETCH_HEAD` | ~3 | Merge main into working branch | 100% |
| `git status` | ~3 | Check working tree status | 100% |
| `git diff` | ~2 | View file changes | 100% |

### Database

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `grep NEON_PROJECT_ID .env` | ~35 | Verify database env var is configured | 100% |

### File & System

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `ls` / `ls -la` | ~30 | List directory contents to understand project structure | 100% |
| `find` | ~15 | Search for files by pattern | 100% |
| `mkdir -p` | ~15 | Create directory structures for new apps/tests | 100% |
| `pkill -f "netlify dev"` / `pkill -f "vite"` | ~50 | Kill stale dev server processes before test runs | 100% |
| `cat` | ~10 | Read file contents (logs, configs) | 100% |
| `grep` / `sed` / `awk` | ~10 | Search/transform file contents | 100% |
| `kill <pid>` / `lsof -i :<port>` | ~5 | Kill specific processes / check port usage | 100% |

### Network

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `curl` | ~10 | Test API endpoints (local and deployed) | ~80% (some endpoints returned HTML instead of JSON) |

### Package Management

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm install` | ~3 | Install dependencies for new apps | 100% |
| `npm ls` | ~2 | Verify installed package versions | 100% |

### Task Management

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npx tsx scripts/add-task.ts` | ~60 | Add subtasks to the task queue | 100% |

### Other

| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run read-log` | ~40 | Read log files during analysis tasks | ~95% |
| `node -e "..."` | ~3 | Inspect module exports, run quick JS snippets | 100% |
| `ps aux` | ~2 | List running processes for debugging | 100% |

## 3. Difficulty Analysis

### Commands That Frequently Required Multiple Attempts

1. **`npm run test`** -- The most problematic command. Test runs frequently failed on first attempt due to:
   - Stale `netlify dev` or `vite` processes occupying ports 8888/5173
   - Accumulated test data from prior runs causing assertion mismatches
   - Hardcoded count assertions that didn't account for seed data variations
   - Test isolation issues (tests depending on order or shared state)
   - Replay recording cleanup needed before runs

2. **`npx playwright test` (journey/deployment tests)** -- Worker 82 needed 5 attempts to get journey tests passing. Issues included locator mismatches, service type dropdown selectors, and Replay Chromium teardown timeouts.

3. **`npm run check`** -- Worker 91 ran this ~8 times trying to resolve persistent type errors. The iterative fix-check-fix cycle is common but usually resolves within 2-3 attempts.

4. **`git show <commit>:<path>`** -- Workers 12, 13, and 92 had difficulty finding the correct commit hash for reference files. The agent would try one commit, get an error, then search git log for the right one.

### Commands That Frequently Failed

1. **Test runs with stale processes** -- The most common failure pattern. Before each test run, the agent must kill stale `netlify dev` and `vite` processes. When this cleanup is insufficient, tests crash or hang. Workers 43, 46, 47, 48 all experienced this.

2. **Deployment endpoint testing** -- Worker 58 spent 22 commands debugging why Netlify functions returned HTML instead of JSON. Root cause: functions used Netlify v2 API with `/api/*` routes, but the agent was testing `/.netlify/functions/*` paths.

3. **Type checking with evolving code** -- Worker 91 struggled with persistent TypeScript errors across multiple `npm run check` iterations, indicating the code changes were complex enough to introduce cascading type issues.

### Patterns in What Made Commands Difficult

- **Port conflicts**: Stale dev servers from prior test runs block ports, causing new test runs to fail or hang. This is the single biggest source of test command failures.
- **Test data accumulation**: Without proper cleanup/truncation in seed scripts, data accumulates across test runs, breaking count-based assertions.
- **Git history navigation**: Finding the right commit for reference files requires multiple exploratory `git log` and `git show` commands.
- **Netlify function routing**: The v2 function API uses `/api/*` routes, but the agent defaulted to testing `/.netlify/functions/*` paths.

### Agent Workarounds That Succeeded

- **Aggressive process cleanup**: The preflight pattern of `pkill -f "netlify dev"; pkill -f "vite"; npx replayio remove --all` became standard before every test run.
- **Port-specific cleanup**: When `pkill` wasn't enough, `lsof -ti:8888 | xargs kill` and `lsof -ti:5173 | xargs kill` were used.
- **Manual server debugging**: Starting `npx netlify dev` manually and using `curl` to test endpoints helped diagnose routing issues.
- **Commit-hopping for references**: When one commit hash didn't contain the expected file, the agent searched git log for the correct one and retried.

## 4. Recommendations

### `skills/scripts/*.md` Updates

1. **Create `skills/scripts/preflight.md`** -- Document the standard preflight sequence that should run before every test:
   ```bash
   pkill -f "netlify dev" 2>/dev/null
   pkill -f "vite" 2>/dev/null
   lsof -ti:8888 | xargs kill 2>/dev/null
   lsof -ti:5173 | xargs kill 2>/dev/null
   npx replayio remove --all 2>/dev/null
   ```
   This pattern appears in nearly every test-running worker (38-56, 65-68, 72, 80, 82) with slight variations. Standardizing it would reduce redundancy and prevent failures.

2. **Update `skills/scripts/check.md`** -- Add guidance that `npm run check` failures are expected during iterative development. Recommend running `npx tsc --noEmit` first for faster feedback before the full check, and note that lint errors in unchanged files can be ignored for the current task.

3. **Create `skills/scripts/testRunGuide.md`** -- Document:
   - Always run preflight cleanup before tests
   - Test data seeding should include `TRUNCATE` before `INSERT` to prevent accumulation
   - Avoid hardcoded count assertions; use `toBeGreaterThan(0)` or seed-relative counts
   - If tests crash with no output, check for port conflicts first

### Task Skill Updates

4. **`skills/tasks/build/testing.md`** -- Add a section on test data isolation best practices:
   - Seed functions must truncate tables before inserting
   - Tests should not depend on execution order
   - Each test should set up and verify its own data rather than relying on counts from prior tests

5. **`skills/tasks/deployment.md`** -- Add documentation about Netlify function routing:
   - v2 functions use `/api/*` routes (not `/.netlify/functions/*`)
   - Check `.netlify/functions/manifest.json` to determine correct routes
   - Test with `curl` against the correct path pattern after deploy

6. **`skills/tasks/build/writeApp.md`** -- When scaffolding a new app from reference files, add guidance to:
   - Use `git log --all --oneline | grep "SetupApp"` to find the setup commit
   - Read reference configs from the correct commit rather than HEAD
   - Document which commit was used as reference for future workers

### Standard Procedures to Document

7. **Git reference file retrieval** -- The pattern of finding and reading reference app files from git history appeared in workers 12, 13, and 92 (combined ~60 commands). Create a standard procedure:
   ```bash
   # Find the setup commit for a reference app
   git log --all --oneline | grep "SetupApp"
   # Read files from that commit
   git show <commit>:apps/<app>/vite.config.ts
   ```

8. **Process cleanup between test runs** -- The `pkill` pattern appears ~50 times across all logs. This should be built into the test runner script itself (`scripts/test.ts`) rather than requiring manual cleanup every time.

### Dockerfile Changes

9. **No Dockerfile changes needed** -- All required software (Node.js, npm, Playwright, Replay browser, Netlify CLI) is already installed. The issues encountered were runtime state problems (stale processes, port conflicts), not missing software.
