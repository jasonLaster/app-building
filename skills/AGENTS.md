# Skill Organization

Skills are divided into two categories:

## `messages/` — Responding to user messages

These skills are triggered when a user sends a message (e.g. a bug report, a request to
build or maintain an app, or a question about logs). They add tasks to the queue using
`add-task --trailing`.

- **addBugReport.md**: Record a user-reported bug in `docs/bugReports.md`.
- **buildInitialApp.md**: Build a new app from an AppSpec. Adds build stage tasks to the queue.
- **generateReport.md**: Generate a report by analyzing logs. Matches user request to a report type, queues the review pipeline.
- **maintainApp.md**: Run a maintenance cycle on an existing app. Adds maintain stage tasks to the queue.
- **updateScripts.md**: Write a design doc for a new package script, then add a task to implement it.

## `scripts/` — Design docs for package scripts

Design docs that define the contract for package scripts (`npm run <name>`). Each file covers
the script's purpose, usage, behavior, inputs, outputs, and implementation tips. These are
written by the `messages/updateScripts.md` skill before the script is implemented.

Design docs are prescriptive — they define how a script should work and are created before
implementation. The implementing agent reads the design doc and follows it.

## `tasks/` — Task skills

These skills are referenced by tasks in the queue. Each worker invocation reads the
next task from the container's task file and runs all subtasks in the task. Skills that need to "unpack"
into sub-tasks use `add-task` to insert them at the front of the queue.

### Root — Shared infrastructure

- **deployment.md**: Deploy the app to production. Used by both build and maintain workflows.
- **writeScript.md**: Implement a package script from its design doc in `skills/scripts/`.

### `build/` — Build stage tasks

Used when building a new app (see `messages/buildInitialApp.md` for stage ordering):

- **testSpec.md**: Write a detailed test specification from the app spec.
- **writeShared.md**: Write code shared with other apps.
- **writeApp.md**: Write the app's database, backend, and frontend code.
- **writeTests.md**: Write Playwright tests matching the test specification.
- **testing.md**: Run tests and debug/fix failures using Replay.

### `maintain/` — Maintenance stage tasks

Used when maintaining an existing app (see `messages/maintainApp.md` for stage ordering):

- **fixBugReport.md**: Analyze, fix, and test open bug reports.
- **reviewBugReport.md**: Review fixed bugs for process improvements and directive updates.
- **checkDirectives.md**: Systematically check the app against all skill directives.
- **polishApp.md**: Improve the app's overall quality.

### `review/` — Report generation and review

Used when generating reports from worker logs (see `messages/generateReport.md` for pipeline):

- **analyzeLogs.md**: Analyze log files and produce per-log analysis files. Has Unpack (list logs, queue groups) and AnalyzeGroup (process ~10 logs) subtask types.
- **synthesizeReport.md**: Read all analysis files and compile a final report.
- **updateSkills.md**: Apply report recommendations to update skill files.
- **mergeMain.md**: Prepare a clean branch with skill changes and the report for PR to main.
- **reportTestFailures.md**: Report definition for test failure analysis — per-log template and synthesis instructions.
- **reportShellCommands.md**: Report definition for shell command usage — per-log template and synthesis instructions.
