# Skill

Bug reported by users for the app are tracked in `docs/bugReports.md`.
Open bug reports are listed at the start of this file, with later sections for reports that
were fixed and later reviewed.

## Unpack Subtasks

If there are any open bug reports in the file, add one task per bug using `add-task`.
Each bug gets the following subtasks in the task, performed in order. Unpack reports starting with
the oldest ones, which will be listed last.

1. AnalyzeBug: Analyze and document the cause of the bug. Skip this for bugs asking for new functionality.
2. FixBug: Update the app to fix the bug
3. UpdateTests: Update the spec and tests to verify the fix and prevent regressions.
4. UpdateRevisions: Record any spec changes in AppRevisions.md.
5. ResolveBug: Mark the bug as resolved and in need of review.

Example:
```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[{ "skill": "skills/tasks/maintain/fixBugReport.md", "app": "<AppName>", "subtasks": [
  "AnalyzeBug: Analyze <BugName>",
  "FixBug: Fix <BugName>",
  "UpdateTests: Update tests for <BugName>",
  "UpdateRevisions: Record spec changes for <BugName>",
  "ResolveBug: Mark <BugName> as resolved"
]}]
EOF
```

## Analyzing bugs

If there is a recording ID referenced by the bug report, you MUST open it using Replay MCP
and explore it to understand what happened. Read this skill file to learn how to use these tools.
https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-mcp/SKILL.md

Study the bug and identify the root cause of the problem by looking at the bug report, app source,
and any Replay MCP recording.

Write a file docs/bugs/<BugReportName>.md with a complete explanation of what is causing the bug,
and update bugReports.md to refer to it.

## Fixing bugs

Read the guidelines and directives in `skills/tasks/build/writeApp.md` and then update the app's source to fix the bug.

## Updating tests

Review `docs/tests.md` to identify any tests relevant to the bug. Update these tests to reflect the
app's new behavior. If you did not find any relevant tests, add at least one new test entry which checks
that the bug doesn't occur.

For any changes to the test spec you made, update the test files themselves to reflect those changes.

After updating tests, make sure they pass. Read `skills/tasks/build/testing.md` to understand how to run tests and debug failures.

## Updating revisions

If the bug fix changed the app's behavior relative to the original `AppSpec.md` — for example,
adding new functionality, removing a feature, or changing how something works — update
`AppRevisions.md` (create the file next to `AppSpec.md` if it doesn't exist).

`AppRevisions.md` is NOT a changelog. It is organized by topic sections that describe either
new functionality added to the app or changes made to the app spec in particular areas. Each
section has a heading describing the area (e.g., "## Attachment Uploads", "## Authentication",
"## CSV Import") and a description of the current state of that functionality.

When updating revisions:
- If an existing section covers the area you changed, update that section's description to
  reflect the current behavior.
- If the change introduces a new area of functionality, add a new section.
- Keep descriptions focused on **what the app does now**, not a history of changes.

If the fix was purely a code bug that didn't change the intended behavior, skip this step.

## Resolving bugs

Now that the bug is fixed, move it from the top section of the file to an "Unreviewed" section lower down.
Label the bug with the git revision before / after the bug was fixed and tests updated.

Move the report to the appropriate section in `docs/bugReports.md`.
