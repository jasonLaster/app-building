# Skill

You are writing a design doc for a new package script requested by the user. The design doc
covers how the script should be called, what it does, and tips for implementation. After the
design doc is written, the agent implements the script for the app.

## Process

1. **Understand the request**: Read the user's message to understand what the script should do,
   what inputs it takes, and what outputs or side effects it produces.

2. **Read existing scripts**: Look at the app's `package.json` to see existing scripts and
   understand naming conventions. Read any related existing scripts (e.g., if writing a new
   database script, read `init-db.ts`, `migrate-db.ts`, `seed-db.ts` for patterns).

3. **Write the design doc**: Create `skills/scripts/<script-name>.md` with the structure
   described below. The script name should match the `package.json` script key (e.g., if the
   script will be `npm run setup-test-branch`, the file is `skills/scripts/setup-test-branch.md`).

4. **Add the implementation task**: Add a task to the queue:
   ```
   npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/writeScript.md" --app "<AppName>" --subtask "Implement <script-name> script"
   ```

5. The worker will pick up and process the task.

## Design Doc Structure

Every design doc in `skills/scripts/` must follow this structure:

```markdown
# <script-name>

## Purpose

One-paragraph description of what this script does and why it exists.

## Usage

How the script is called:
- The `package.json` script entry (e.g., `"setup-test-branch": "tsx scripts/setup-test-branch.ts"`)
- Scripts MUST be TypeScript files run via `tsx` (e.g., `"tsx scripts/<name>.ts"`). Do not use shell scripts.
- Command-line arguments and environment variables it reads
- Example invocations

## Behavior

Step-by-step description of what the script does when run:
1. First it does X...
2. Then it does Y...
3. Finally it does Z...

Include error handling expectations and edge cases.

## Inputs

- Environment variables (which are required vs optional, what they contain)
- Command-line arguments
- Files it reads

## Outputs

- Files it writes or modifies
- Side effects (database changes, API calls, process management)
- Exit codes and their meanings

## Implementation Tips

Concrete guidance for the implementing agent:
- Which existing modules/functions to reuse
- Patterns to follow from similar scripts
- Common pitfalls to avoid
- Dependencies to install (if any)
```

## Guidelines

- Design docs are prescriptive, not descriptive. They define how the script SHOULD work,
  not how it currently works. They are written before implementation.
- Keep design docs focused on the contract (inputs, outputs, behavior) rather than
  implementation details. The implementing agent decides internal code structure.
- Reference existing app infrastructure where applicable (e.g., "reuse the `initSchema`
  function from `scripts/schema.ts`").
- If the script interacts with external services (Neon API, Netlify CLI, etc.), document
  the specific API calls or CLI commands it should use.
- If the script needs to be idempotent or handle interrupted previous runs, say so explicitly.
- Scripts MUST be written in TypeScript and run via `tsx`. Do not write shell scripts (`.sh`).
  All logic — including process management, file I/O, and CLI invocations — must be in TypeScript
  using Node.js APIs (e.g., `child_process.execSync`, `fs`, `path`).

### Output contract

Scripts must produce **short, structured stdout** that can be read directly without grepping
or parsing. Verbose output (build logs, test runner output, command traces) goes to log files
in `logs/`, never to stdout. The agent reads the summary line, and only reads the log file
if it needs to diagnose a failure.

- **Success**: print a one-line summary (e.g., `10 tests passed`) and exit 0.
- **Failure**: print a one-line summary with counts and a path to the detailed log
  (e.g., `8 passed, 2 failed — see logs/test-run-3.log`) and exit non-zero.
- **Never** inherit stdio from subprocesses to stdout. Pipe subprocess output to a log file
  and summarize results on stdout.
