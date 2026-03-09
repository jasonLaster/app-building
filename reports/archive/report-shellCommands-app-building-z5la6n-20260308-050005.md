# Shell Commands Report

**Report:** report-shellCommands-app-building-z5la6n-20260308-050005
**Date:** 2026-03-08
**Logs analyzed:** 97

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 97 |
| Total shell commands across all logs | ~1,058 |
| Unique commands (by base command) | 48 |
| Logs with difficulty medium or high | 23 (23.7%) |
| Overall success rate (yes) | 92.9% (983/1,058) |
| Overall success rate (yes + partial) | 98.1% (1,038/1,058) |
| Failure rate (no) | 1.9% (20/1,058) |
| Multiple-attempt rate | 11.7% (124/1,058) |

**Difficulty breakdown:** 50 none, 19 low, 16 medium, 7 high, 5 unknown (logs with 0 commands).

Three logs had unusually high command counts indicating extended debugging sessions: Log 91 (150 commands), Log 94 (125 commands), and Log 93 (50 commands). These were analysis/meta-tasks that included nested agent sessions.

## 2. Command Catalog

### Build & Dev (166 commands, 95.8% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm run check` | ~50 | TypeScript type-checking and linting before commit | 96% |
| `npm run test` | ~58 | Run Playwright test suites | 72% (many partial) |
| `npm run deploy` | ~5 | Deploy app to Netlify | 80% |
| `npx replayio install` | ~5 | Install Replay browser runtime | 100% |
| `npx replayio remove --all` | ~20 | Clean old Replay recordings before test runs | 100% |
| `npx replayio upload` | ~10 | Upload Replay recordings for debugging | 90% |
| `npx replayio list` | ~5 | List available recordings | 80% |
| `npx tsc --noEmit` | ~5 | Standalone TypeScript check | 100% |
| `npx netlify dev` | ~3 | Start local dev server for debugging | 100% |
| `node -e "..."` | ~5 | Inline JS evaluation (parse JSON, check values) | 80% |

### Testing (96 commands, 58.3% clean success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npm run test <spec>` | ~58 | Run specific Playwright test files | 58% (32% partial) |
| `npx replayio upload/list` | ~16 | Manage Replay recordings for test debugging | 85% |
| `npx playwright test` | ~6 | Run Playwright tests directly (deployment tests, journey QA) | 33% |

Testing had the highest failure and multiple-attempt rates of any category: 9.4% outright failure, 32.3% partial success, and 34.4% required multiple attempts.

### Git (26 commands, 100% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `git log` | ~15 | View recent commit history, find deploy commits | 100% |
| `git diff` | ~5 | Check changes | 100% |
| `git add/commit` | ~4 | Stage and commit changes | 100% |
| `git checkout` | ~2 | Switch branches | 100% |

### Database (83 commands, 95.2% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `grep NEON_PROJECT_ID .env` | ~40 | Verify database env var is set (preflight check) | 100% |
| `curl` (Netlify API) | ~10 | Check env vars on deployed site | 90% |
| `cd` + DB-related ops | ~33 | Navigate to app directory for DB operations | 95% |

### File & System (586 commands, 96.6% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `ls` | ~171 | List directory contents, check file existence | 98% |
| `find` | ~106 | Search for files by name/pattern | 97% |
| `cat` | ~41 | Read file contents | 85% |
| `cd` | ~41 | Change working directory | 94% |
| `pkill` | ~36 | Kill stale netlify dev/vite processes | 100% (always succeeds with 2>/dev/null) |
| `grep` | ~31 | Search file contents | 85% |
| `mkdir -p` | ~23 | Create directories (docs/bugs, report-data) | 100% |
| `head/tail` | ~20 | Read portions of files/logs | 95% |
| `wc -l` | ~8 | Count lines in files | 100% |
| `tree` | ~3 | Display directory structure | 100% |
| `kill` | ~7 | Kill specific processes by PID | 71% (often needs retries) |

### Network (6 commands, 66.7% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `curl` | 6 | Test API endpoints on deployed sites, check HTTP status | 67% |

Failures were typically due to API routing issues (getting HTML instead of JSON from wrong URL paths).

### Package Management (88 commands, 97.7% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `npx tsx scripts/add-task.ts` | ~76 | Queue new tasks for worker processing | 100% |
| `npm install` | ~5 | Install dependencies | 100% |
| `npm ls` | ~3 | Check installed package versions | 100% |
| `npm uninstall` | ~2 | Remove packages | 100% |

### Other (7 commands, 100% success)

| Command | Frequency | Typical Purpose | Success Rate |
|---|---|---|---|
| `which` | ~3 | Check if commands are available | 100% |
| `env` | ~2 | Check environment variables | 100% |
| `export` | ~2 | Set environment variables for subcommands | 100% |

## 3. Difficulty Analysis

### Commands Frequently Requiring Multiple Attempts

| Command | Multiple / Total | Rate |
|---|---|---|
| `kill` | 5/7 | 71% |
| `npx playwright test` | 4/6 | 67% |
| `pkill` | 18/38 | 47% |
| `node` (inline eval) | 2/4 | 50% |
| `python3` | 2/5 | 40% |
| `curl` | 2/7 | 29% |
| `npx replayio` | 13/51 | 25% |
| `npm run test` | ~24/160 | 15% |

### Commands That Frequently Failed

| Command | Failure Rate (no + partial) | Common Failure Reason |
|---|---|---|
| `npx playwright test` | 67% | Selector mismatches, strict mode violations, module resolution errors |
| `echo` (to file) | 60% | Redirect issues |
| `curl` | 29% | Wrong API URL paths (/.netlify/functions/ vs /api/) |
| `npm run test` | ~19% | Test failures due to app bugs being debugged, timeouts |
| `cat` | 15% | File not found (wrong path guesses) |
| `grep` | 15% | No matches found (wrong search terms) |

### Patterns in What Made Commands Difficult

1. **Playwright test execution** was the primary source of difficulty. Tests frequently failed on first run due to:
   - Selector mismatches (wrong testids, strict mode violations matching multiple elements)
   - API routing differences between dev and production (/.netlify/functions/ vs /api/)
   - State contamination between serial test runs
   - CustomSelect component interactions requiring non-standard Playwright patterns
   - Missing webServer configuration in playwright.config.ts

2. **Process management** (pkill/kill) required multiple attempts because:
   - Stale netlify dev and vite processes persisted between test runs
   - Processes sometimes didn't terminate on first signal
   - The agent defensively ran pkill multiple times as a precaution

3. **Deployment debugging** (Log 57) involved significant trial-and-error:
   - Functions not deploying due to wrong --functions path
   - _redirects conflicts with function routing
   - Netlify Functions v2 URL path changes (/.netlify/functions/ returning 404, /api/ working)

4. **Journey QA testing** (Log 85) struggled with:
   - Finding the right Playwright installation and browser path
   - Module resolution issues requiring NODE_PATH workarounds
   - Iterating through 4 versions of test locators

### Successful Agent Workarounds

- **Replay MCP debugging**: Agent effectively used `npx replayio upload` + Replay MCP tools to diagnose test failures by inspecting runtime state
- **Manual server testing**: Started `npx netlify dev` manually and used `curl` to isolate API routing issues
- **Preflight command chains**: Standardized a preflight pattern (kill processes, check env, verify browser, clean recordings) that prevented many issues
- **Error context files**: Reliably read `test-results/*/error-context.md` to understand test failures without re-running

## 4. Recommendations

### `skills/scripts/*.md` — Script Updates

1. **Create `skills/scripts/preflight.md`**: Document the standard preflight command chain that emerged organically:
   ```
   pkill -f "netlify dev" 2>/dev/null
   pkill -f "vite" 2>/dev/null
   grep NEON_PROJECT_ID .env || echo "ERROR"
   ls ~/.replay/runtimes/chrome-linux/chrome || npx replayio install
   npx replayio remove --all 2>/dev/null
   ```
   This pattern was repeated in nearly every test-running log. Formalizing it would reduce boilerplate.

2. **Update `skills/scripts/check.md`**: Add guidance that `npm run check` lint errors (especially unused variables) should be fixed immediately before re-running, rather than proceeding with other work.

3. **Create `skills/scripts/deploy-debug.md`**: Document that Netlify Functions v2 uses `/api/` prefix, not `/.netlify/functions/`. Include curl commands for verifying function deployment and checking env vars via Netlify API.

### Task Skills Updates

4. **Test-running skills should mandate process cleanup**: Any skill that runs tests should explicitly require killing stale processes first. The 47% multiple-attempt rate on `pkill` shows the agent was doing this but not consistently enough early in sessions.

5. **Document CustomSelect interaction patterns**: Multiple logs struggled with testing CustomSelect components. Skills should document that:
   - `selectOption()` doesn't work on custom dropdowns
   - Use click + `data-value` attribute selection instead
   - `toHaveValue()` doesn't work; use `getAttribute('data-value')` instead

6. **Playwright direct invocation guidance**: When running `npx playwright test` outside the app's `npm run test` wrapper, document the required environment variables (`PLAYWRIGHT_BROWSERS_PATH=/opt/playwright`) and module resolution approach.

### Standard Procedures to Document

7. **API URL convention**: All frontend code should use `/api/` prefix for function calls. Document this in writeApp.md or a new API conventions document. The `/.netlify/functions/` path causes failures with Functions v2.

8. **Test failure debugging workflow**: Formalize the pattern: run test → read error-context.md → upload Replay recording → use Replay MCP → fix → rerun. This workflow was the most effective debugging approach across all high-difficulty logs.

### Dockerfile Changes

9. **No immediate Dockerfile changes needed**: All required tools (Node.js, Playwright, Replay, Netlify CLI) are already installed. The main issues were configuration and usage patterns, not missing software.
