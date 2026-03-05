# Shell Commands Report: reference-apps-1-review

Generated: 2026-02-28

## 1. Summary Statistics

| Metric | Value |
|---|---|
| Total logs analyzed | 318 |
| Total shell commands across all logs | 1,884 |
| Unique commands (deduplicated by base command) | 42 categories + ~9 one-off commands |
| Logs with difficulty (medium or high) | 59 (18.6%) — 40 medium, 19 high |
| Overall success rate | 91.7% (1,728 / 1,884) |
| Overall failure rate | 4.1% (78 / 1,884) |
| Partial success rate | 4.1% (78 / 1,884) |
| Multiple-attempt rate | 8.0% (150 / 1,884) |

### Difficulty Distribution

| Difficulty | Logs | Percentage |
|---|---|---|
| none | 207 | 65.1% |
| low | 52 | 16.4% |
| medium | 40 | 12.6% |
| high | 19 | 6.0% |

## 2. Command Catalog

### Build & Dev

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npm run check` | 92 | 87% | 8% | Run typecheck (tsc) + lint (eslint) quality gates before committing |
| `npx tsc --noEmit` | 22 | 68% | 14% | Direct TypeScript type checking when `npm run check` was too slow |
| `npx vite build` | 6 | 50% | 33% | Build app for deployment |
| `npx eslint` | 4 | 100% | 50% | Direct eslint invocation for targeted lint fixes |

### Testing

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npm run test <file>` | 76 | 29% | 62% | Run Playwright tests to verify code changes and bug fixes |
| `npx playwright test --config deployment` | 12 | 75% | 42% | Run deployment verification tests against live production URLs |
| `npx tsx scripts/test.ts` | 3 | 0% | 0% | Attempted test runner script — never succeeded |
| `npx replayio install` | 3 | 100% | 0% | Install Replay browser for test recording |

### Git

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `git log` | 36 | 100% | 8% | View recent commit history, find deployment history |
| `git diff` | 12 | 100% | 0% | View file differences |
| `git show` | 12 | 100% | 0% | View specific commit content |
| `git -C` | 11 | 100% | 0% | Run git commands from a different working directory |
| `git stash` | 8 | 100% | 0% | Stash working changes temporarily |
| `git checkout` | 2 | 100% | 0% | Switch branches or restore files |
| `git branch` | 1 | 100% | 0% | List/manage branches |

### Database

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npx tsx scripts/schema.ts` | 4 | 50% | 0% | Run database schema migrations; failed on module resolution for @neondatabase/serverless |

### File & System

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `ls` | 407 | 99% | 3% | List directories for app structure, source files, test files |
| `find` | 295 | 96% | 7% | Search for bug reports, test specs, component files, documentation |
| `cat` | 115 | 86% | 4% | Read .env files, deployment.txt, CSS, task queue, test results |
| `grep` | 104 | 93% | 5% | Search for patterns in source code, timeline events, test results |
| `mkdir` | 37 | 100% | 0% | Create analysis output directories for reports |
| `wc` | 23 | 100% | 0% | Count lines in files |
| `head` | 17 | 100% | 0% | Read beginning of files |
| `echo` | 12 | 100% | 0% | Write content to files, display values |
| `tail` | 6 | 100% | 0% | Read end of files |
| `tree` | 5 | 100% | 0% | Display directory structure |
| `sed` | 4 | 100% | 0% | In-place text substitution |
| `locale / locale-gen` | 4 | 100% | 0% | Fix locale issues for Netlify CLI |
| `env` | 4 | 100% | 0% | Check environment variables |
| `rm` | 2 | 100% | 0% | Remove files |
| `pwd` | 3 | 100% | 0% | Print working directory |
| `pkill` | 5 | 80% | 20% | Kill stale dev server processes |

### Network

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `curl` | 40 | 95% | 10% | Test deployed Netlify function endpoints (auth, users, deals, etc.) |

### Package Management

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npm install` | 19 | 79% | 21% | Install missing node_modules dependencies (especially @neondatabase/serverless) |

### Deployment

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npm run deploy` | 16 | 62% | 56% | Run the Netlify deploy script to build and deploy apps |
| `npx netlify deploy` | 11 | 45% | 45% | Direct Netlify CLI deploy, often with locale workarounds |
| `npx netlify --version` | 3 | 100% | 0% | Verify Netlify CLI version |

### Task Management

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npx tsx scripts/add-task.ts` | 137 | 100% | 0% | Queue maintenance, deployment, fix, and analysis tasks |

### Log Analysis

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `npm run read-log` | 265 | 97% | 4% | Read and parse log files for test failure analysis |

### Other

| Command | Count | Success Rate | Multi-Attempt Rate | Typical Purpose |
|---|---|---|---|---|
| `node` | 13 | 92% | 8% | Run Node.js scripts, evaluate expressions |
| `for loop` | 14 | 100% | 0% | Batch operations on files (sed replacements, file processing) |
| `npx tsx <other>` | 6 | 100% | 33% | Run TypeScript scripts outside add-task/schema |
| `apt-get` | 1 | 0% | 0% | Attempted package installation (failed) |

## 3. Difficulty Analysis

### Commands That Frequently Required Multiple Attempts

| Command | Multi-Attempts | Total | Rate | Common Retry Reasons |
|---|---|---|---|---|
| `npm run test <file>` | 47 | 76 | 62% | Missing NEON_PROJECT_ID env var; stale dev server processes; module resolution errors; retrying with more output lines; retrying after npm install or code fixes |
| `npm run deploy` | 9 | 16 | 56% | Locale issues (LC_ALL not set / en_US.UTF-8 missing); vite config errors; wrong CLI syntax |
| `npx eslint` | 2 | 4 | 50% | Running on different files during iterative fixes |
| `npx netlify deploy` | 5 | 11 | 45% | Locale workarounds (LC_ALL=C, LC_ALL=C.utf8); adding --no-build flag; fixing import paths |
| `npx playwright test --config deployment` | 5 | 12 | 42% | Transient failures; URL corrections; waiting for deployment to go live |
| `npx vite build` | 2 | 6 | 33% | Retrying after vite config changes (resolve.modules, alias mappings) |
| `npx tsx <other>` | 2 | 6 | 33% | Testing import resolution in isolation |
| `npm install` | 4 | 19 | 21% | Retrying from different directories; confirming installation completed |

### Commands That Frequently Failed

| Command | Failures | Total | Failure Rate | Common Failure Reasons |
|---|---|---|---|---|
| `npx tsx scripts/test.ts` | 3 | 3 | 100% | Module resolution failure for @neondatabase/serverless in tsx runtime — never succeeded |
| `npx netlify deploy` | 6 | 11 | 55% | Locale errors (LC_ALL not set); import path errors in bundled functions |
| `npx tsx scripts/schema.ts` | 2 | 4 | 50% | Module resolution failure for @neondatabase/serverless |
| `npm run test <file>` | 35 | 76 | 46% | Missing NEON_PROJECT_ID; stale dev server; module resolution errors; Neon API timeouts; test assertion failures |
| `npx vite build` | 2 | 6 | 33% | Missing path aliases for shared dependencies; invalid resolve.modules config |
| `npm run deploy` | 5 | 16 | 31% | Locale issues; vite build config errors; incorrect `netlify env:set` syntax |
| `npx playwright test --config deployment` | 3 | 12 | 25% | Transient network issues; deployment not yet live; wrong deployment URL |
| `npx tsc --noEmit` | 4 | 22 | 18% | Pre-existing type errors; module resolution issues with @neondatabase/serverless |

### Patterns in What Made Commands Difficult

1. **Environment variable issues**: The most pervasive problem. `NEON_PROJECT_ID` was frequently missing from the test environment, causing widespread test failures. The agent often had to discover this through trial and error.

2. **Locale configuration**: Netlify CLI commands (`npx netlify deploy`, `npm run deploy`) repeatedly failed because the container lacked `en_US.UTF-8` locale. The agent developed workarounds (`LC_ALL=C`, `LC_ALL=C.utf8`) but these were rediscovered in multiple sessions.

3. **Module resolution for @neondatabase/serverless**: Commands using `tsx` runtime (`npx tsx scripts/test.ts`, `npx tsx scripts/schema.ts`) consistently failed because tsx couldn't resolve this dependency. This was never resolved.

4. **Stale dev server processes**: Test commands failed when previous `netlify dev` or `vite` processes were still running, requiring `pkill` to clean up.

5. **Iterative output expansion**: The agent frequently ran test commands, saw truncated output, then retried with `| tail -10`, `| tail -20`, etc. to see more of the failure output.

### Agent Workarounds That Succeeded

- **Locale fix**: `LC_ALL=C npx netlify deploy` or `LC_ALL=C.utf8 npx netlify deploy` worked around missing locale
- **Process cleanup**: `pkill -f "netlify dev"` before running tests resolved stale server issues
- **Direct npm install**: Running `npm install @neondatabase/serverless` in app directories fixed missing dependency issues
- **Piped output**: Using `2>&1 | tail -N` to capture and expand error output for diagnosis
- **Alternative quality gate**: Using `npx tsc --noEmit` instead of `npm run check` for faster targeted type checking

## 4. Recommendations

### `skills/scripts/*.md` — Script Updates

1. **Create `skills/scripts/test.md`**: Document the standard test procedure, including:
   - Required environment variables (NEON_PROJECT_ID, database connection strings) and how to verify they are set before running tests
   - How to kill stale dev server processes before running tests (`pkill -f "netlify dev"`)
   - Recommended output capture pattern (`2>&1 | tail -50` rather than iteratively expanding from -5 to -10 to -20)
   - Note that `npx tsx scripts/test.ts` does not work and should not be used; use `npm run test` instead

2. **Update `skills/scripts/check.md`** (if exists) or create it:
   - Document that `npm run check` runs both tsc and eslint
   - Recommend `npx tsc --noEmit` for faster type-only checks during iterative development
   - Document common fix patterns for type errors (especially @neondatabase/serverless resolution)

3. **Create `skills/scripts/deploy.md`**: Document the deployment procedure, including:
   - The locale workaround: always prefix Netlify CLI commands with `LC_ALL=C` or ensure locale is configured at container startup
   - When to use `npm run deploy` vs `npx netlify deploy --prod`
   - How to verify deployment with `curl` before running deployment tests
   - Standard `npx playwright test --config deployment` verification procedure

4. **Create `skills/scripts/env-setup.md`**: Document environment prerequisites:
   - Required environment variables per app (NEON_PROJECT_ID, DATABASE_URL, etc.)
   - How to verify `.env` files exist and contain required values
   - Locale configuration requirements for Netlify CLI

### Task Skill Improvements

5. **Testing task skills** should include a pre-flight check step:
   - Verify NEON_PROJECT_ID is set: `echo $NEON_PROJECT_ID`
   - Kill stale servers: `pkill -f "netlify dev" 2>/dev/null; pkill -f "vite" 2>/dev/null`
   - Verify node_modules: `ls node_modules/@neondatabase/serverless 2>/dev/null || npm install`

6. **Deployment task skills** should include the locale fix as a standard preamble and not require the agent to rediscover it each time.

### Standard Procedures to Document

7. **File exploration should prefer structured tools**: The agent ran 407 `ls` and 295 `find` commands (37% of all commands). Many of these were exploratory. Skills should specify expected directory structures so the agent doesn't need to explore from scratch each time.

8. **Log reading is efficient**: `npm run read-log` (265 uses, 97% success) is well-designed and reliable. No changes needed.

9. **Task queueing is perfect**: `npx tsx scripts/add-task.ts` (137 uses, 100% success, 0% retries) is the most reliable command in the system. No changes needed.

10. **Address the @neondatabase/serverless tsx resolution issue**: Since `npx tsx scripts/test.ts` and `npx tsx scripts/schema.ts` both fail on this, either fix the tsx configuration (add a `tsconfig` paths mapping or install the dependency globally) or document that these scripts must be run through a different mechanism.
