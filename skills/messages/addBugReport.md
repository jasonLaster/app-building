# Skill

When a user reports a bug, add it to the app's `docs/bugReports.md` file so it can be
picked up and fixed during the next maintenance cycle.

## Identifying the app

Determine which app the bug report is for. If the user does not specify, infer it from
context (e.g. the current branch name, recent work, or the content of the report).
If the app cannot be determined, ask the user.

## Writing the report

Add a new entry to the "Open" section of `docs/bugReports.md`. Follow the format used
by existing entries in the file:

```
<date>: <one-line description of the problem>
```

Guidelines for the description:
- Use the current date in M/D/YYYY format.
- Write a single clear sentence summarizing the user's report.
- Include observable symptoms (what happens) rather than speculated causes.
- Preserve the user's own wording when it is clear and specific.
- If the user mentions multiple distinct symptoms of the same problem, include them all.
- Do not add analysis, root cause, or fix suggestions — those belong to the `skills/tasks/maintain/fixBugReport.md` workflow.

If the "Open" section currently says "(none)", replace that placeholder with the new entry.

## After adding the report

The bug will be addressed during the next maintenance cycle via `skills/tasks/maintain/fixBugReport.md`.
No further action is needed at this stage.
