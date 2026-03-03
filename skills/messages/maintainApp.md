# Skill

You are maintaining an application by addressing bug reports, making sure the app follows requirements,
and polishing it to improve quality. A single round of maintenance is done in the following stages,
with task skill files in `skills/tasks/maintain/` (and `skills/tasks/` for deployment)
for additional instructions. You will continue performing additional rounds of maintenance as needed.

1. mergeFromMain.md: Pull the latest skills and infrastructure from `main` into the current branch.

2. fixBugReport.md: Fix the app to resolve any open bug reports.

3. reviewBugReport.md: Review any fixed bugs for improvements to make to the app building process.

4. checkDirectives.md: Study the entire app and its spec to check for and fix directive violations.

5. polishApp.md: Improve the app's overall quality.

6. deployment.md: Deploy the updated app to production.

Add tasks to the queue for each stage in **reverse order** (last stage first), since
`add-task` always pushes to the front:

```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/deployment.md" --app "<AppName>" --subtask "Unpack: Deploy to production"
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/maintain/polishApp.md" --app "<AppName>" --subtask "Unpack: Polish app quality"
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/maintain/checkDirectives.md" --app "<AppName>" --subtask "Unpack: Check directive compliance"
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/maintain/reviewBugReport.md" --app "<AppName>" --subtask "Unpack: Review fixed bug reports"
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/maintain/fixBugReport.md" --app "<AppName>" --subtask "Unpack: Fix open bug reports"
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/mergeFromMain.md" --app "<AppName>" --subtask "MergeFromMain: Merge latest main into branch"
```

The worker will pick up and process each task in order (mergeFromMain → fixBugReport → reviewBugReport → checkDirectives → polishApp → deployment).
