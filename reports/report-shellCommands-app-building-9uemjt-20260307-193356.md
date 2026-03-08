# Shell Commands Report: app-building-9uemjt-20260307-193356

## 1. Summary Statistics

| Metric | Value |
|--------|-------|
| Total logs analyzed | 138 |
| Total shell commands across all logs | 1045 |
| Unique commands (by base command) | ~30 |
| Logs with no shell commands | 8 |
| Logs with difficulty (medium or high) | 29 (11 high, 18 medium) |
| Logs with low difficulty | 37 |
| Logs with no difficulty | 70 |
| Overall success rate | ~93% (~970 yes out of 1045) |
| Partial success rate | ~6% (~65 partial) |
| Failure rate | ~1% (~5 no) |
| Multiple-attempt rate | ~10% (~104 out of 1045) |

### Command Count Distribution

8 logs used zero shell commands (pure code-editing tasks like page planning). The median was ~7 commands per log. Workers handling test-fix cycles (workers 46, 48, 66, 70, 76, 84, 85, 89, 90) used 12–22 commands each. Worker 45 had 31 commands but these were almost entirely `npx tsx scripts/add-task.ts` calls to queue tasks. Workers 124–136 each used 12 commands dominated by `npm run read-log` calls for log analysis.

## 2. Command Catalog

### Build & Dev
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run check` | ~60 | Typecheck + lint quality gate before task completion | High (occasional partial when pre-existing lint errors found) |
| `npx tsc --noEmit` | ~15 | TypeScript compilation check on specific files | High |
| `npx eslint` | ~8 | Lint specific files after writing/editing | High |
| `npm run deploy` | ~2 | Deploy app to Netlify | High |
| `npm install` | ~3 | Install npm dependencies | Partial (occasional issues) |

### Testing
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run test` | ~70 | Run Playwright e2e tests via test runner script | Mixed (many partial due to test failures being diagnosed and fixed) |
| `npx playwright test` | ~5 | Run Playwright tests directly | Mixed |
| `npx replayio remove --all` | ~40 | Clear old Replay recordings before test runs | High |
| `npx replayio` (other) | ~10 | List/upload/install Replay recordings | High |

### Git
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `git log` | ~15 | Review commit history to find reference apps | High |
| `git show` | ~20 | View commit contents and file structure | High |
| `git fetch` / `git merge` | ~3 | Fetch and merge main branch | High |
| `git branch` | ~3 | Check/manage branches | High |

### Database
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `curl` (Neon API) | ~10 | Create Neon DB projects, check branches/endpoints via API | Mixed (required multiple attempts for API key issues) |

### File & System
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `find` | ~140 | Locate files by name/type across app directory | High (some redundant repeated searches) |
| `ls` | ~145 | List directory contents for exploration | High |
| `grep` | ~60 | Search file contents for patterns (imports, config, errors) | High |
| `cat` | ~25 | Read file contents (logs, configs) | High |
| `mkdir` | ~30 | Create directory structures for apps and report data | High |
| `wc -l` | ~5 | Check file sizes before reading | High |
| `head` / `tail` | ~10 | Read portions of large files | High |
| `test -f` | ~5 | Check file existence | High |

### Network
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `curl` | ~10 | Neon API calls for database provisioning | Mixed |

### Package Management
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm install` | ~3 | Install project dependencies | Partial (occasional issues) |
| `npm create vite@latest` | 1 | Scaffold reference Vite project | High |

### Process Management
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `pkill` | ~50 | Kill stale netlify dev / vite processes before test runs | High (but frequently needs multiple rounds) |
| `pgrep` | ~10 | Check if processes are still running after pkill | High |
| `kill` | ~8 | Kill specific PIDs that survived pkill | High |

### Task Management
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npx tsx scripts/add-task.ts` | ~65 | Queue new tasks to the task system | High |

### Log Analysis
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `npm run read-log` | ~110 | Read worker log files for report analysis | High |

### Other
| Command | Frequency | Typical Purpose | Success Rate |
|---------|-----------|-----------------|--------------|
| `python3 -c` | ~5 | Random number generation, JSON parsing | High |
| `awk` / `sed` | ~5 | Text processing for extracting app names | High |
| `node -e` | ~2 | Compute hash values for test data | High |
| `echo` / `env` / `pwd` | ~5 | Debug environment variables, verify paths | High |

## 3. Difficulty Analysis

### Commands that frequently required multiple attempts

1. **Process cleanup (`pkill`/`pgrep`/`kill`)** — The most consistent source of multi-attempt commands. The agent routinely needed 2–4 rounds to kill stale `netlify dev` and `vite` processes before test runs. The typical escalation pattern: `pkill -f "netlify dev"` → `pgrep -f netlify` to verify → `kill <PID>` for survivors → repeat for vite. This appeared in workers 46, 58, 67, 84, 89, 90, 103, and 113.

2. **Test execution (`npm run test`)** — Tests frequently passed most specs but failed 1–3, prompting fix-rerun cycles. Workers 46, 48, 58, 60, 65, 70, 76, 84, 85, 89, 90, 93–96, and 98 each had 2–4 test run iterations. This is expected behavior in the test-fix workflow.

3. **File discovery (`find`)** — About 24 multi-attempt instances where the agent searched for files that didn't exist at expected paths, then broadened search criteria. Especially prevalent during app setup (workers 16–20) when the agent explored repository structure to understand conventions.

4. **Neon API calls (`curl`)** — Workers 46 and 48 had difficulty with database provisioning. Common issues: API key not available as env var (had to use literal value), missing endpoints on newly created branches, and needing to wait for provisioning to complete.

### Commands that frequently failed

- `npm run check` — Occasional failures from pre-existing lint/type errors that needed fixing
- `npm run test` — Expected partial failures during test-fix cycles
- `curl` to Neon API — Authentication and timing issues

### Patterns in what made commands difficult

- **Stale processes**: The most avoidable difficulty. Every test-running worker had to deal with leftover `netlify dev`/`vite` processes from previous workers.
- **Exploratory overhead**: Workers 16–20 (early app building) spent enormous effort with `find`/`ls`/`grep` to understand the codebase structure before writing code. Worker 16 used 28 commands, mostly file exploration.
- **Missing store.ts**: Workers 16, 17, and 20 each independently searched extensively for a `store.ts` file that didn't exist yet, burning 5–10 commands each on the same fruitless search.
- **Environment configuration**: Workers 46 and 48 struggled to find the Neon API key, trying `grep .env`, `env | grep`, and `cat .env` before succeeding.

### Agent workarounds that succeeded

- **Process cleanup escalation**: `pkill` → `pgrep` → `kill <PID>` pattern became standard and reliable
- **Reference app inspection**: Using `git show` to read files from reference app commits (todo-app) to understand conventions
- **Iterative test-fix cycles**: Run tests, parse failures from logs, fix code, rerun — consistently effective
- **Broadening file searches**: When specific `find` patterns failed, widening search scope or switching to `grep` for content-based discovery
- **Scaffolding from scratch**: Worker 23 used `npm create vite@latest` in `/tmp` to generate a reference config when existing patterns were unclear

## 4. Recommendations

### `skills/scripts/*.md` — Script improvements

- **Create `skills/scripts/cleanup-processes.md`**: Document a standard pre-test cleanup procedure (`pkill -f "netlify dev"; pkill -f "vite"; sleep 1; pgrep -f netlify && kill $(pgrep -f netlify); pgrep -f vite && kill $(pgrep -f vite)`). This pattern was independently reinvented by ~15 workers. A single cleanup script (`scripts/cleanup.sh`) would eliminate the most common multi-attempt pattern.

- **Update `skills/scripts/check.md`**: Add guidance on interpreting and handling `npm run check` failures. Many workers ran `npm run check` after code changes but didn't always know how to efficiently read the error output (some used `head`, others `tail`, others `cat logs/check.log`).

### Task skills improvements

- **`skills/tasks/build/setupApp.md`**: Add explicit guidance that `store.ts` doesn't exist yet during setup — the agent should create it rather than searching for it. Workers 16, 17, and 20 wasted significant effort searching for this file. Also document the standard directory structure (`src/pages/`, `src/components/`, `src/slices/`, `netlify/functions/`) so the agent doesn't need to explore reference apps each time.

- **`skills/tasks/build/writeApp.md`**: Include the standard Neon database provisioning steps (API key location, project creation, endpoint verification) so workers don't need to rediscover this workflow. Document that `NEON_API_KEY` is available as an environment variable.

- **`skills/tasks/test/fixTests.md`**: Add the standard process cleanup procedure as a mandatory first step before running tests. This would prevent the most common source of difficulty.

### Standard procedures to document

- **Pre-test checklist**: Kill stale processes → clear replay recordings → run tests → parse results. This should be a documented standard procedure referenced by all test-related skills.

- **App structure discovery**: Instead of `find`/`ls` exploration (which consumed 140+ and 145+ commands respectively), provide a documented file tree or convention guide. The agent's most frequent commands were `find` and `ls` — much of this was avoidable.

- **Neon database setup**: Document the full API workflow: create project → get connection string → set env var → verify with test query. Workers 46 and 48 had to figure this out from scratch.

### Dockerfile changes

- No new software needs to be installed. All required tools (Node.js, npm, Playwright, Replay, Git, curl, Python3) are already available. The main improvement would be ensuring stale processes from previous workers are cleaned up between iterations, possibly via a pre-worker cleanup script rather than a Dockerfile change.
