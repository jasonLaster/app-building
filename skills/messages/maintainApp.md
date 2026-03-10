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

Add all tasks to the queue in execution order:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/mergeFromMain.md", "app": "<AppName>", "subtasks": ["MergeFromMain: Merge latest main into branch"] },
  { "skill": "skills/tasks/maintain/fixBugReport.md", "app": "<AppName>", "subtasks": ["Unpack: Fix open bug reports"] },
  { "skill": "skills/tasks/maintain/reviewBugReport.md", "app": "<AppName>", "subtasks": ["Unpack: Review fixed bug reports"] },
  { "skill": "skills/tasks/maintain/checkDirectives.md", "app": "<AppName>", "subtasks": ["Unpack: Check directive compliance"] },
  { "skill": "skills/tasks/maintain/polishApp.md", "app": "<AppName>", "subtasks": ["Unpack: Polish app quality"] },
  { "skill": "skills/tasks/deployment.md", "app": "<AppName>", "subtasks": ["Unpack: Deploy to production"] }
]
EOF
```

The worker will pick up and process each task in order (mergeFromMain → fixBugReport → reviewBugReport → checkDirectives → polishApp → deployment).
