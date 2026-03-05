# Shell Commands Report: reference-apps-1-review-20260225-123635

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 152 |
| Total shell commands across all logs | 1,259 |
| Unique commands (by base command) | 22 (ls, find, npx, npm, cd, git, mkdir, grep, curl, cat, tree, for, wc, head, echo, export, test, node, pwd, ln, awk, NETLIFY_SITE_ID) |
| Logs with zero commands | 2 |
| Logs with difficulty medium or high | 17 (none: 95, low: 39, medium: 14, high: 4) |
| Overall success rate | 95.6% success, 2.9% partial, 1.4% failed |
| Multiple-attempt rate | 6.0% (75 of 1,259 commands) |

## 2. Command Catalog

### Build & Dev

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm run check` | 39 | Run typecheck + lint quality gate before commits | High — occasional first-attempt failures from TS errors or lint issues, then fixed and re-run |
| `npx tsc --noEmit` | 25 | Run TypeScript type checker standalone | High — sometimes partial on first attempt due to implicit `any` or missing types |
| `npx vite build` | 12 | Run production build to verify app compiles | Very high |
| `npm run deploy` | 2 | Build and deploy app to Netlify | Partial on first attempt (deploy script issues), then fixed |
| `npm run build` | 2 | Build the app | High |
| `npx eslint` | 16 | Lint source files | Mixed — frequently failed or partial due to missing eslint config in some apps |
| `npx netlify` | 6 | Netlify CLI operations (env vars, logs, deploy) | Low — `netlify env:get/set` frequently failed ("No project id found"), `netlify functions:log` vs `logs:function` confusion |

### Testing

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm run test` | 10 | Run Playwright test suites | Mixed — often partial (test failures being fixed iteratively) |
| `npx playwright test` | 11 | Run Playwright deployment tests directly | Mixed — first attempts often failed due to wrong test IDs, missing elements, or ESM issues |
| `npx replayio` | 1 | Upload Replay recordings for debugging | High |

### Git

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `git log` | 18 | View recent commit history for context | Very high |
| `git -C /repo log` | 17 | View commit history from a specific directory | Very high |
| `git show` | 3 | View file contents from another branch | Partial — sometimes target branch/file didn't exist |
| `git ls-tree` | 2 | List files in a git tree | High |
| `git branch` | 2 | Check or list branches | High |

### Database

No direct database CLI commands (psql, neon CLI) were observed. Database access was handled entirely through Netlify functions and the Netlify env var commands (covered under Build & Dev).

### File & System

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `ls` | 285 | List directory contents for exploration | Very high |
| `find` | 240 | Search for files by pattern, explore directory structure | Very high |
| `mkdir -p` | 35 | Create analysis output directories or app directories | Very high |
| `cat` | 18 | Read file contents (task queue files, configs) | High |
| `tree` | 10 | View directory tree structure | Very high |
| `wc` | 8 | Count lines in files | Very high |
| `head` | 7 | View first N lines of output | Very high |
| `grep` | 31 | Search file contents | Very high |
| `cd` | 79 | Change directory (usually before running npm/npx commands) | Very high |

### Network

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `curl -L -o` | ~22 | Download mockup images from UploadThing for visual reference | Very high |
| `curl -s` (API testing) | ~9 | Test deployed Netlify function endpoints | Mixed — some returned internal server errors when DB wasn't configured |

### Package Management

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm install` | 2 | Install dependencies | High |

### Other

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npx tsx /repo/scripts/add-task.ts` | 157 | Queue tasks for the worker system | Very high |
| `npm run read-log` | 155 | Read and parse log files for analysis | Very high |
| `echo` | 7 | Print environment variable values, debug info | High |
| `export` | 3 | Set environment variables before running tests | High |
| `node` | 3 | Run Node.js scripts directly | High |

## 3. Difficulty Analysis

### Commands That Frequently Required Multiple Attempts

1. **`npx tsc --noEmit`** — The most common multi-attempt command. Typically the first run reveals type errors (implicit `any`, unused imports, missing type fields), which the agent fixes before re-running. This is expected behavior during iterative development.

2. **`npm run check`** — Similar to tsc, the quality gate often catches issues on first run that require fixing. The pattern of "run check → fix errors → run check again" accounts for many multi-attempt instances.

3. **`npx eslint`** — Frequently problematic. Three distinct failure patterns:
   - No eslint config existed for some apps (ProductionHub, SupplierTracker), causing "no config found" partial failures
   - Agent retried the same failing command multiple times without resolving the root cause (log knfcm0-46)
   - Agent ran `npx eslint . --fix` in apps that didn't have eslint configured

4. **`npx playwright test --config playwright.deployment.config.ts`** — Deployment tests often failed on first attempt due to:
   - Wrong `data-testid` values in the test
   - Elements not visible in empty-state pages
   - ESM `__dirname` issues in test config

5. **`npx netlify env:get/env:set`** — Failed consistently with "No project id found" errors. The agent had to resort to using the Netlify REST API via `curl` instead.

### Commands That Frequently Failed

1. **`npx netlify env:set DATABASE_URL`** — Failed because the Netlify CLI couldn't find the project context. The agent worked around this by using the Netlify API directly with `curl`.

2. **`npx eslint . --fix`** (in certain apps) — Failed three times consecutively in log knfcm0-46 without resolution. The underlying issue was a missing eslint configuration.

3. **`curl` to deployed API endpoints** — Initial API calls to freshly deployed apps returned 500 errors because DATABASE_URL wasn't set as an environment variable on Netlify.

### Patterns in What Made Commands Difficult

- **Environment configuration gaps**: DATABASE_URL not being set on Netlify after deployment was a recurring blocker across multiple logs (knfcm0-17, knfcm0-32, knfcm0-52).
- **Missing tool configuration**: ESLint not being configured for some apps caused repeated failures. The agent sometimes retried instead of recognizing the config was absent.
- **Netlify CLI limitations**: The Netlify CLI (`npx netlify`) frequently failed for env var operations. The REST API proved more reliable.
- **Deployment test fragility**: Tests assumed specific elements would be visible, but empty-state pages or data variations caused failures on first run.
- **Case sensitivity in paths**: One instance of `ls /repo/apps/accounting/` (wrong case) when the directory was `Accounting/`.

### Agent Workarounds That Succeeded

- **Netlify API via curl** instead of `npx netlify env:set` — Successfully set environment variables when the CLI failed.
- **Running `npm run check` from the app directory** (`cd /repo/apps/AppName && npm run check`) instead of using standalone `npx tsc --noEmit` — More reliable because it uses the app's tsconfig.
- **Iterative test-fix-retest cycles** — The agent effectively used multiple test runs with Replay recordings to debug and fix test failures (log knfcm0-30: from 24/35 passing to 35/35 in 6 runs).
- **Using `npx netlify logs:function`** instead of `netlify functions:log` — Found the correct CLI subcommand after the first attempt failed.

## 4. Recommendations

### `skills/scripts/*.md` — Script Design Updates

1. **Create `skills/scripts/netlify-env.md`**: Document the pattern for setting Netlify environment variables. The `npx netlify env:set` command consistently failed. The skill should recommend using the Netlify REST API:
   ```
   curl -s -X POST "https://api.netlify.com/api/v1/accounts/.../env?site_id=..." \
     -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '[{"key":"DATABASE_URL","values":[{"value":"...","context":"all"}]}]'
   ```

2. **Update `skills/scripts/check.md`**: Add guidance that `npm run check` should be run from the **app directory** (not the repo root with standalone `npx tsc`), and document that ESLint requires a config file — if none exists, skip linting or create one first rather than retrying the same command.

3. **Create `skills/scripts/deploy-verification.md`**: Document the post-deploy verification steps: (1) set DATABASE_URL env var on Netlify, (2) verify API endpoints return 200, (3) then run deployment tests. This would prevent the pattern seen in knfcm0-17 and knfcm0-32 where tests failed because the database wasn't configured.

### Task Skills Updates

4. **`skills/tasks/build/writeApp.md`**: Add a reminder that after writing components, the agent should run `npm run check` from the app directory rather than standalone `npx tsc --noEmit` at the repo root. This avoids tsconfig resolution issues seen in logs knfcm0-8 and knfcm0-85.

5. **`skills/tasks/build/writeTests.md`** (or equivalent test skill): Add guidance for deployment tests:
   - Always use `data-testid` values that match the actual component markup
   - Handle empty-state scenarios (tables/lists with no data should be handled gracefully)
   - Use `{ timeout: 10000 }` or similar for elements that may load slowly on first deploy

### Standard Procedures to Document

6. **ESLint configuration**: The agent should check for `.eslintrc.*` or `eslint.config.*` before running `npx eslint`. If no config exists, either create a minimal one or skip linting (don't retry the command expecting different results).

7. **File exploration pattern**: The agent used `ls` (285 times) and `find` (240 times) extensively for codebase exploration. Consider documenting that the Glob and Grep tools should be preferred over shell `find`/`ls`/`grep` for file exploration, as this would reduce shell command volume and provide better structured output.

8. **Mockup download pattern**: The agent downloaded ~25 mockup images via `curl -L -o /tmp/...`. This pattern works well and should remain as-is, but could be documented as a standard procedure in the writeApp skill.
