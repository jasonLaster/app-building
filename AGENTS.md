# Overview

This repository is a platform for agentic app building. You will build and/or maintain one or more
web apps according to a set of skills and guidelines which will evolve as you get better at building apps.

Key directories:

* `apps`: Has one subdirectory for each app that has been built or has been specified and still needs to be built.
* `skills/messages`: Skills for responding to messages from the user (e.g. bug reports, log analysis).
* `skills/tasks`: Skills for performing tasks. See `skills/AGENTS.md` for details.
* `reports`: Final generated reports from log analysis (see `skills/review/`).
* `report-data`: Intermediate analysis data used during report generation.
* `tasks`: The task queue (`tasks-<containerName>.json`) managed by scripts in `scripts/`.
* `logs`: Log files from work that has been performed. `worker-current.log` is the log for
  the work currently being done.

You are running within a container and can run test suites for applications and connect to various
external services using instructions in the relevant skill files.

**CRITICAL — FIRST THING YOU DO when responding to a user message:**

1. **BEFORE doing ANY work**, list the files in `skills/messages/` and read any skill
   whose name matches the user's request.
2. If a matching skill exists, follow it exactly.
3. Only if no matching skill exists should you proceed on your own — and then write a new
   skill document in `skills/messages/` afterward so you handle it correctly next time.

Do NOT run git commands, search code, or take any other action until you have checked for a
matching skill. This is the highest-priority rule when handling user messages.

Do NOT modify this AGENTS.md file unless the user explicitly instructs you to.
All domain-specific guidance belongs in skill files under `skills/`.

## Worker Execution

The worker processes tasks from `tasks/tasks-<containerName>.json` sequentially. For each task,
it passes all subtasks to Claude as a single prompt and checks for a `<DONE>` signal.

- If `<DONE>` is signaled: the task is dequeued and the worker moves to the next task.
- If `<DONE>` is NOT signaled: the task is retried (up to 3 times before being skipped).

The worker commits changes after each task automatically. Focus on completing the
subtasks — do not worry about committing or exiting.

When you have completed ALL subtasks in your task, output `<DONE>` to signal completion.

## Task System

Work is managed through a JSON task queue at `tasks/tasks-<containerName>.json`. The file contains an object
with a `tasks` array. Each task has a `skill`, an array of `subtasks` (description strings),
a `timestamp`, and an optional `app` name:

```json
{
  "tasks": [
    {
      "skill": "skills/tasks/maintain/checkDirectives.md",
      "subtasks": [
        "CheckTestSpecAuth: Check testSpec.md directive violations in Authentication",
        "CheckComponentsAuth: Check writeApp.md directive violations in Authentication",
        "CheckTestsAuth: Check writeTests.md directive violations in Authentication"
      ],
      "timestamp": "2026-02-20T00:00:00.000Z",
      "app": "sales-crm"
    }
  ]
}
```

The agent NEVER reads or writes task files directly. Instead, use `add-task` via stdin heredoc:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/build/writeApp.md", "app": "SalesCRM", "subtasks": ["SetupApp: Setup the app", "DesignDatabase: Design the database"] },
  { "skill": "skills/tasks/build/writeTests.md", "app": "SalesCRM", "subtasks": ["WriteTestAuth: Write test for Auth"] }
]
EOF
```

Tasks are inserted at the front of the queue in the order listed (first element = first to run).
Each task object must have `skill` and `subtasks`. `app` is optional.

**CRITICAL: `add-task` usage rules**

- When unpacking tasks, put ALL new tasks in a **single `add-task` call**. Do NOT call
  `add-task` multiple times.
- Write out every task explicitly in the JSON array. Do NOT use loops, scripts, or code
  to generate tasks programmatically.
- All subtasks in a task share the same skill. Group related subtasks together — for example,
  all checks for a single page go in one task.
- When a skill needs to "unpack" into sub-tasks, use `add-task` to insert them at the
  front of the queue.

**CRITICAL: Task scope rules**

- You MUST only work on subtasks that were assigned to you in your current prompt. Your assigned
  subtasks are the ones passed to you by the worker — nothing else.
- When you add new tasks via `add-task`, you MUST NOT start working on those tasks.
  They will be picked up by a future worker iteration.
- If you have completed all of your assigned subtasks and the only remaining work is tasks you
  added to the queue, you are DONE. Commit your changes and output `<DONE>` immediately.
  Do NOT continue working on the newly queued tasks.
- Adding tasks to the queue is NOT the same as doing those tasks. Add them and stop.

## Secrets

When you are running in a container secrets are **not** available directly in your environment.
Use `exec-secrets` to run commands with secrets, `list-secrets` to see available secrets,
and `set-branch-secret` to store new branch-level secrets. See `skills/accessSecrets.md` for full details.

## Running Tests

You MUST read `skills/tasks/build/testing.md` and precisely follow its instructions when running
tests and debugging test failures.

## Quality Gates

Before each commit, run `npm run check` (see `skills/scripts/check.md`). Do not commit
code that fails typecheck or lint.

## Commits

The worker commits automatically after each iteration. Do not commit manually unless
explicitly asked to by a skill or prompt.
