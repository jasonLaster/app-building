# Skill

Instructions for testing your ability to reproduce a test failure benchmark problem and fix it correctly.

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
  title: string
  github_repository: string
  branch: string
  neon_project_id: string
  failing_changeset: string
  test_file: string
  assessment_string: string
}
```

For each failure you are given, write a file `report-data/testFailure-<failure.id>.md` which will keep track of this work.
Initialize the file with the entire failure row EXCEPT assessment_string.

Then add the following tasks using add-task (calling in reverse order when pushing tasks onto the stack).

```
npx tsx /repo/scripts/add-task.ts --skill "skills/messages/testFailureBenchmark.md" --subtask "ReproduceTestFailure: <failure.id>"
npx tsx /repo/scripts/add-task.ts --skill "skills/messages/testFailureBenchmark.md" --subtask "FixTestFailure: <failure.id> <agent.prompt>"
npx tsx /repo/scripts/add-task.ts --skill "skills/messages/testFailureBenchmark.md" --subtask "VerifyTestFailure: <failure.id> <failure.assessment_string>"
```

ULTRA IMPORTANT: You must follow these instructions and the format for subtasks EXACTLY.

The first task reproduces the test failure.
The second task fixes the test failure and fills in the report.
The third task reads that report and the logs and decides based on the assessment whether the fix was correct.

## Reproducing test failures

1. Clone the failure branch into /tmp and check out the failing changeset from the repository.
   Avoid doing a full repo clone for efficiency.

2. Delete the following files from the cloned repo:
   - All logs/ files.

3. Reproduce the test failure:
   - Set NEON_PROJECT_ID in the app's .env file
   - Run `npm install` in the app's directory.
   - Run `npm run test <testFile>` in the app's directory and make sure the test fails.

Make sure you have reproduced the failure and have a Replay recording ID.
Add the failure message and the Replay recording ID to `report-data/testFailure-<failure.id>.md`.

## Fixing test failures

1. Read the `report-data/testFailure-<failure.id>.md` file to get the failure message and Replay recording ID.

2. Follow the directions from the agent prompt in the subtask to fix the code and/or test to make the test pass.
   If you weren't given additional directions, do what you normally do and do not look at the Replay recording.
   If you don't know what's wrong, don't guess and move on to the next step.

3. Get the patch with your changes that fixed the test failure (if you did fix it).

4. Update the `report-data/testFailure-<failure.id>.md` file with info about whether you fixed the test failure,
   the patch that fixed the test failure and a description of what was causing the failure.

## Verifying test failures

1. Review the `report-data/testFailure-<failure.id>.md` file and the assessment string in the subtask and determine
   whether the fix is correct. You must only look at this markdown file and the assessment string.
   All other changes have been reverted and are not available for review.

2. Use `read-log` to read the worker log from the fix attempt and make sure appropriate debugging techniques were
   used to arrive at the conclusion.

3. If the test was fixed, the fix is correct per the assessment, and appropriate debugging techniques were used then
   this benchmark problem has passed. Decide whether the problem passes and write the following XML:

   <result id=[failure.id] passed=[true|false]>reason</result>
