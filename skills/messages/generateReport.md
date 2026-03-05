# Skill

Generate a report by analyzing logs. Match the user's request to a report definition
file, pick a report name, and queue the pipeline tasks.

## Report Types

| User Request | Report File |
|---|---|
| test failures, replay usage, debugging effectiveness | `skills/review/reportTestFailures.md` |
| shell commands, script usage, command patterns | `skills/review/reportShellCommands.md` |

If the user's request doesn't clearly match a report type, ask them to clarify.

## Procedure

1. Determine which report file matches the user's request using the table above.

2. Get the current branch name and timestamp:
   ```bash
   BRANCH=$(git branch --show-current)
   TIMESTAMP=$(date +%Y%m%d-%H%M%S)
   ```

3. Construct the report name: `report-<kind>-<branchName>-<TIMESTAMP>`
   - `<kind>` is `testFailures` or `shellCommands`
   - `<branchName>` is the current git branch
   - `<TIMESTAMP>` is `YYYYMMDD-HHmmss` format

4. Queue the pipeline tasks in **reverse order** (last stage first), since
   `add-task` always pushes to the front:

```bash
// When multiple reports are being generated this one must be done only for the first report
// whose tasks are enqueued, so that only a single merge happens at the end.
npx tsx /repo/scripts/add-task.ts --skill "skills/review/mergeToMain.md" \
  --subtask "ArchiveLogs" \
  --subtask "MergeToMain"

npx tsx /repo/scripts/add-task.ts --skill "skills/review/updateSkills.md" \
  --subtask "UpdateSkills: <report-name>"

npx tsx /repo/scripts/add-task.ts --skill "skills/review/synthesizeReport.md" \
  --subtask "Synthesize: <report-name> <report-file>"

npx tsx /repo/scripts/add-task.ts --skill "skills/review/analyzeLogs.md" \
  --subtask "Unpack: <report-name> <report-file>"

npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/mergeFromMain.md" \
  --subtask "MergeFromMain: Merge latest main into branch"
```

5. Confirm to the user that the report pipeline has been queued with the report name.
