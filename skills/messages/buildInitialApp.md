# Skill

You are building an application based on the provided AppSpec.md.
If `AppRevisions.md` exists, it describes new functionality and spec changes organized by topic section, and must also be followed.
`AppSpec.md` must NEVER be modified. All spec changes go in `AppRevisions.md`.
You will build the app in the following stages, with task skill files in `skills/tasks/build/` for additional instructions.

1. testSpec.md: Create a detailed test specification for the tests the app must pass in order to match the app spec.

2. writeShared.md: Write or refactor code which the app needs and that can be shared with other apps.

3. writeApp.md: Write the app's code according to the two specs.

4. writeScript.md: For each design doc in `skills/scripts/`, implement the script.

5. writeTests.md: Write the tests according to the two specs.

6. deployment.md: Do an initial deploy of the app to production.

7. testing.md: Get all tests to pass, debugging and fixing the app / tests as needed.

8. deployment.md: Do another deployment of the app with fixes for problems found.

Add all tasks to the queue in execution order:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/build/testSpec.md", "app": "<AppName>", "subtasks": ["Unpack: Write test specification"] },
  { "skill": "skills/tasks/build/writeShared.md", "app": "<AppName>", "subtasks": ["Unpack: Write app shared code"] },
  { "skill": "skills/tasks/build/writeApp.md", "app": "<AppName>", "subtasks": ["Unpack: Write the app"] },
  { "skill": "skills/tasks/writeScript.md", "app": "<AppName>", "subtasks": ["Unpack: Implement package scripts"] },
  { "skill": "skills/tasks/build/writeTests.md", "app": "<AppName>", "subtasks": ["Unpack: Write Playwright tests"] },
  { "skill": "skills/tasks/deployment.md", "app": "<AppName>", "subtasks": ["Unpack: Do an initial production deployment"] }
  { "skill": "skills/tasks/build/testing.md", "app": "<AppName>", "subtasks": ["Unpack: Get all tests passing"] },
  { "skill": "skills/tasks/deployment.md", "app": "<AppName>", "subtasks": ["Unpack: Deploy tested app to production"] }
]
EOF
```

The worker will pick up and process each task in order (testSpec → writeShared → writeApp → writeScript → writeTests → testing → deployment).
