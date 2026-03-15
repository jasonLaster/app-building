# Skill

Instructions for testing your ability to reproduce a test failure benchmark problem, fix it, and verify
the fix was appropriate.

Make sure to follow directions from the appropriate section below based on your current task.

## Unpacking subtasks

Specific tasks are required when testing fix capabilities. Each task runs in its own context without
knowledge of any other data about the test failure. You will be given specifications for an agent and
one or more test failures, and need to unpack tasks to attempt to fix each failure and assess the results.

Every agent is specified with the following structure:

```
interface AgentRow {
  name: string
  tool_command: string
  prompt: string
}
```

Test failure benchmark problems are specified with the following structure:

```
interface FailureRow {
  id: string
  clean_branch: string
  test_file: string
  assessment_string: string
}
```

Then add the tasks for ALL failures in a single `add-task` call. For each failure, add three
tasks (Reproduce, Fix, Verify) in order. Do NOT use a loop or script — write out every task
explicitly in the JSON array:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/benchmark/fixProblem.md", "subtasks": ["FixTestFailure: <failure1.id> <failure1.clean_branch> <agent.prompt>"], "command": <task.command> },
  { "skill": "skills/benchmark/fixProblem.md", "subtasks": ["VerifyTestFailure: <failure1.id> <failure1.assessment_string>"] },
  { "skill": "skills/benchmark/fixProblem.md", "subtasks": ["FixTestFailure: <failure2.id> <failure2.clean_branch> <agent.prompt>"], "command": <task.command> },
  { "skill": "skills/benchmark/fixProblem.md", "subtasks": ["VerifyTestFailure: <failure2.id> <failure2.assessment_string>"] }
]
EOF
```

ULTRA IMPORTANT: You must follow these instructions and the format for subtasks EXACTLY.
All tasks for all failures must be in a single `add-task` call. Do NOT call `add-task` multiple times.

The first task fixes the test failure and writes a report.
The second task reads that report and the logs and decides based on the assessment whether the fix was correct.

## Fixing test failures

1. Clone the clean branch into /tmp/test-app. Avoid doing a full repo clone for efficiency.

2. Delete the following files from the cloned repo:
   - All logs/ files.
   - The .git folder

3. Reinitialize git, so diffs can be computed but the entire repo history is not available.
   - git init
   - git add -A
   - git commit -m "reproduction"

4. Run the `reproduce_failure` shell script at the cleaned branch root.
   This will populate the logs/ directory
   with a file showing the tests which failed and any Replay recordings which were produced.

5. Follow the directions from the agent prompt in the subtask to fix the code and/or test to make the test pass.
   If you weren't given additional directions, do what you normally do and do not look at the Replay recording.
   - If you don't know what's wrong, don't guess and move on to the next step.
   - If you have taken more than 30 minutes to fix the problem, give up on fixing the issue and move on to the next step.

6. Get the patch with your changes.

7. Write a `report-data/testFailure-<failure.id>.md` file with the following:
   - test error message
   - any Replay recording ID,
   - info about whether you fixed the test failure
   - the patch with your changes
   - description of what was causing the failure

## Verifying test failures

1. Review the `report-data/testFailure-<failure.id>.md` file and the assessment string in the subtask and determine
   whether the fix is correct. You must only look at this markdown file and the assessment string.
   All other changes have been reverted and are not available for review.

2. Use `read-log` to read the worker log from the fix attempt and make sure appropriate debugging techniques were
   used to arrive at the conclusion.

3. If the test was fixed, the fix is correct per the assessment, and appropriate debugging techniques were used then
   this benchmark problem has passed. Decide whether the problem passes and write the following XML:

   <result id=[failure.id] passed=[true|false]>reason</result>

4. Delete the `/tmp/test-app` directory.
