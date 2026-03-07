# Shell Commands Report: app-building-2uo5wk-20260307-085012

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 141 |
| Total shell commands across all logs | 906 |
| Unique commands (by base command) | ~55 |
| Logs with no shell commands | 9 |
| Logs with difficulty (medium or high) | 22 (5 high, 17 medium) |
| Logs with low difficulty | 23 |
| Logs with no difficulty | 84 |
| Overall success rate | 93.1% (846 yes / 909 recorded outcomes) |
| Partial success rate | 4.9% (45 partial) |
| Failure rate | 2.0% (18 no) |
| Multiple-attempt rate | 7.9% (71 yes / 895 recorded) |

### Command Count Distribution

Most logs used 0-2 commands (56 logs, 40%). The median was ~4 commands per log. A few complex sessions used 15-38 commands (testing/debugging workflows).

## 2. Command Catalog

### Build & Dev
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run check` | 58 | Typecheck + lint quality gate before completing tasks | High (occasional partial when pre-existing lint errors found) |
| `npx tsc --noEmit` | 30 | TypeScript compilation check on specific files or project | High |
| `npx eslint` | 7 | Lint specific files after writing/editing | High |
| `npx vite build` | 1 | Verify production build succeeds | High |
| `npm run dev` | 2 | Start local dev server | Partial (port conflicts) |
| `npx netlify dev` | 3 | Start local Netlify dev server for API testing | Mixed (port/process conflicts) |
| `npm run deploy` | 2 | Deploy app to Netlify | High |

### Testing
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run test` | 50 | Run Playwright e2e tests via test runner | Mixed (many partial due to test failures being diagnosed) |
| `npx playwright test` | 13 | Run Playwright tests directly | Mixed |
| `npx replayio remove --all` | 55 | Clear old Replay recordings before test runs | High |
| `npx replayio install` | ~5 | Install Replay browser for test recording | High |
| `npx replayio list` | ~3 | List available recordings for debugging | High |
| `npx replayio upload` | ~2 | Upload specific recordings | Mixed |
| `npx playwright install chromium` | ~10 | Install Chromium browser for Playwright | Mixed (permission/path issues) |

### Git
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `git show` | 23 | View commit details/stats | High |
| `git log` | 11 | Review commit history | High |
| `git ls-tree` | 3 | List files in git tree | High |
| `git branch` | 3 | Check/manage branches | High |
| `git fetch` | 1 | Fetch remote changes | High |
| `git merge` | 1 | Merge branches | High |
| `git add` + `git commit` | ~5 | Stage and commit changes | High |

### Database
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npx tsx scripts/seed-db.ts` | ~2 | Seed database with test data | High |
| `npm run migrate-db` | ~1 | Run database migrations | High |
| `node -e` (neon queries) | ~2 | Debug database column types | High |

### File & System
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `ls` | 114 | List directory contents, check file existence | High |
| `mkdir` | 32 | Create directories (e2e, docs/bugs, test output) | High |
| `grep` | 74 | Search file contents, verify env vars | High |
| `cat` | 27 | Read file contents, check logs | High |
| `find` | 20 | Find files by pattern | High |
| `pkill` | 74 | Kill stale netlify/vite processes | High (exit code 144 sometimes confusing) |
| `rm` | 8 | Remove files | High |
| `wc` | 6 | Count lines/tests in files | High |
| `which` | 6 | Locate executables (chromium) | Mixed |
| `kill` | ~2 | Force kill processes | High |

### Network
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `curl` | 10 | Test API endpoints, set Netlify env vars | Mixed (API context issues) |

### Package Management
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm install` | ~8 | Install dependencies (playwright, netlify-cli, uploadthing) | High |
| `npm ls` | ~2 | Check installed package versions | High |

### Task Management
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npx tsx /repo/scripts/add-task.ts` | 104 | Add subtasks to the task queue | High |

### Log Analysis
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run read-log` | 137 | Read worker log files during analysis tasks | High |

### QA Scripts
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npx tsx qa-journey-*.ts` | ~8 | Run QA journey scripts | Mixed (locator issues, browser path) |
| `npx tsx qa-upload-videos.ts` | ~4 | Upload QA video recordings | Mixed (multiple upload attempts) |

### Other
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `python3` | 1 | Parse log file content | High |
| `sed` | 3 | Extract specific log lines | High |
| `node` | 3 | Run inline Node.js scripts | Mixed |
| `echo` | 6 | Output status messages | High |

## 3. Difficulty Analysis

### Commands That Frequently Required Multiple Attempts

1. **`npm run check`** (8 multiple-attempt instances): Most common retry target. Usually failed first due to pre-existing lint errors in other files, then succeeded after fixing those errors. The agent pattern of running check, reading the log, fixing, then re-running is well-established but adds overhead.

2. **`pkill` commands** (various, ~15 instances): Process cleanup commands frequently retried in different forms. The agent often tried `pkill -f "netlify dev"`, then `pkill -f "netlify"`, then `pkill -f "vite"` as separate commands. Exit code 144 from pkill was sometimes confusing.

3. **`npx playwright install chromium`** (~5 instances across sessions): Browser installation had recurring permission issues (`EACCES` on `/.cache`), requiring `PLAYWRIGHT_BROWSERS_PATH` workarounds to non-default directories (`/tmp/pw-browsers`, `/home/agent/pw-browsers`).

4. **Preflight check compound commands** (~5 instances): The long preflight command that kills processes, checks env, installs replay browser, checks deps, and clears recordings was sometimes run redundantly multiple times.

5. **Video upload scripts** (~5 instances): `npx tsx qa-upload-videos.ts` and related upload commands required multiple attempts, suggesting file upload reliability issues.

### Commands That Frequently Failed

1. **`npx playwright install chromium`**: Permission denied on default cache directory. Required explicit `PLAYWRIGHT_BROWSERS_PATH` override.
2. **`curl` to Netlify API**: Context parameter `"all"` rejected with 422; needed `"production"` instead.
3. **`npm run test` (initial diagnostic runs)**: Expected partial failures during test-fixing workflows - not true command failures.
4. **`npx netlify dev`**: Port conflicts when server already running from previous session.
5. **`cat` heredoc for script creation**: Truncation issues; agent switched to Write tool.

### Patterns in What Made Commands Difficult

1. **State contamination across test runs**: The most common source of difficulty (medium/high). Tests accumulated data between runs, causing count/assertion mismatches. Required creating `test-reset` API endpoints and `beforeEach` hooks.

2. **Process management**: Stale `netlify dev` and `vite` processes from previous sessions caused port conflicts. The agent spent many commands killing processes in various ways.

3. **Chromium/Playwright browser installation**: Permissions on the default browser cache path were problematic. Multiple sessions struggled with this before settling on custom `PLAYWRIGHT_BROWSERS_PATH`.

4. **Date handling bugs**: `Invalid Date` errors from Neon returning Date objects for DATE columns vs expected strings. Required debugging with manual API calls and `node -e` snippets.

5. **Pre-existing lint errors**: The agent's code passed initially, but `npm run check` caught pre-existing errors in other files, requiring investigation to determine if the errors were new.

### Agent Workarounds That Succeeded

1. **`PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers`**: Solved Chromium installation permission issues.
2. **Manual `node -e` debugging**: Used to inspect Neon DATE column return types.
3. **`test-reset` API endpoint**: Created to solve test data contamination.
4. **`beforeEach` hooks calling test-reset**: Ensured clean state for every test.
5. **Relative assertions instead of absolute counts**: Replaced hardcoded count assertions with relative checks to avoid state dependency.
6. **Reading `logs/check.log`**: Used to diagnose lint failures when `npm run check` output was truncated.

## 4. Recommendations

### `skills/scripts/*.md` - Script Design Docs

1. **Create `skills/scripts/preflight.md`**: Document the standard preflight sequence as a reusable procedure. The current compound preflight command (`pkill + grep NEON + check replay + check deps + clear recordings`) is repeated verbatim across 20+ logs with frequent redundant retries. A documented procedure or even a shell script (`scripts/preflight.sh`) would reduce command count and eliminate redundant cleanup attempts.

2. **Create `skills/scripts/process-cleanup.md`**: Document the correct way to kill stale dev server processes. The agent uses 5+ variants of `pkill` commands. Standardize on: `pkill -f "netlify" 2>/dev/null; pkill -f "vite" 2>/dev/null; true` and document that exit code 1 (no matching process) is expected and not an error.

3. **Update `skills/scripts/check.md`**: Add guidance on handling pre-existing lint errors. The agent should first run `npm run check`, and if it fails, check `logs/check.log` to determine if failures are in files it modified vs pre-existing. Document the `cat logs/check.log | tail -30` pattern.

### Task Skills Updates

4. **Update `skills/tasks/build/testing.md`**: Add a mandatory step to ensure all test files include a `beforeEach` hook that calls the `test-reset` endpoint. Data contamination across tests was the #1 source of medium/high difficulty, appearing in at least 10 logs.

5. **Update `skills/tasks/build/writeTests.md`**: Add guidance that tests should use relative assertions (e.g., "count increased by 1") rather than absolute assertions (e.g., "count is 5") to avoid state-dependent failures.

6. **Add Playwright browser setup to testing skills**: Document that `PLAYWRIGHT_BROWSERS_PATH=/home/agent/pw-browsers` or `/tmp/pw-browsers` should be set before `npx playwright install chromium`. The default path has permission issues in this container environment.

### Standard Procedures to Document

7. **Netlify environment variable API**: Document that the Netlify env var PATCH API requires `context: "production"` (not `"all"`). This caused a 422 error during deployment.

8. **Video/file upload pattern**: The QA video upload workflow required 5 attempts in one session. Document the working upload approach (using `uploadthing` package) as a standard procedure.

### Dockerfile Changes

9. **Pre-install Chromium**: Add `npx playwright install chromium` to the Dockerfile or container setup. This would eliminate the ~10 instances of runtime Chromium installation and the associated permission workarounds across sessions.

10. **Install `bc` utility**: The `bc` calculator is not available in the container (`bc: command not found`), which is occasionally useful for log analysis arithmetic.

11. **Pre-configure `PLAYWRIGHT_BROWSERS_PATH`**: Set this environment variable in the Dockerfile to a writable location (e.g., `/home/agent/pw-browsers`) so Playwright browser installations succeed without manual path overrides.
