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
  reproduce_notes: string
}
```

For each failure you are given, write a file `report-data/testFailure-<failure.id>.md` which will keep track of this work.
Initialize the file with the entire failure row EXCEPT title and assessment_string (these have clues about how to fix the problem).

Then add the tasks for ALL failures in a single `add-task` call. For each failure, add three
tasks (Reproduce, Fix, Verify) in order. Do NOT use a loop or script — write out every task
explicitly in the JSON array:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/messages/testFailureBenchmark.md", "subtasks": ["ReproduceTestFailure: <failure1.id>"] },
  { "skill": "skills/messages/testFailureBenchmark.md", "subtasks": ["FixTestFailure: <failure1.id> <agent.prompt>"] },
  { "skill": "skills/messages/testFailureBenchmark.md", "subtasks": ["VerifyTestFailure: <failure1.id> <failure1.assessment_string>"] },
  { "skill": "skills/messages/testFailureBenchmark.md", "subtasks": ["ReproduceTestFailure: <failure2.id>"] },
  { "skill": "skills/messages/testFailureBenchmark.md", "subtasks": ["FixTestFailure: <failure2.id> <agent.prompt>"] },
  { "skill": "skills/messages/testFailureBenchmark.md", "subtasks": ["VerifyTestFailure: <failure2.id> <failure2.assessment_string>"] }
]
EOF
```

ULTRA IMPORTANT: You must follow these instructions and the format for subtasks EXACTLY.
All tasks for all failures must be in a single `add-task` call. Do NOT call `add-task` multiple times.

The first task reproduces the test failure.
The second task fixes the test failure and fills in the report.
The third task reads that report and the logs and decides based on the assessment whether the fix was correct.

## Reproducing test failures

1. Clone the failure branch into /tmp/test-app and check out the failing changeset from the repository.
   Avoid doing a full repo clone for efficiency.

2. Delete the following files from the cloned repo:
   - All logs/ files.

3. Reproduce the test failure:
   - Set NEON_PROJECT_ID in the app's .env file
   - Run `npm install` in the app's directory.
   - Run `npm run test <testFile>` in the app's directory and make sure the test fails. Get the test failure message.

Make sure you have reproduced the failure and have a Replay recording ID.

Add the following section to `report-data/testFailure-<failure.id>.md`. ULTRA IMPORTANT: Follow this format exactly.

```
## Reproduction

<playwright-failure-message>

Replay recording: <recording-id>
```

4. If you had difficulty reproducing the test failure based on the provided notes, they can be updated
by sending a PATCH request to https://test-failure-benchmark.netlify.app/.netlify/functions/failures/:id with this body:

```
{
  "reproduce_notes": "string (required) — notes on how to reproduce the failure"
}
```

Reproduction notes must not have any details about the resulting failure.

## Fixing test failures

1. Read the `report-data/testFailure-<failure.id>.md` file to get the failure message and Replay recording ID.

2. Read and remember the time you started on fixing the problem.

3. Follow the directions from the agent prompt in the subtask to fix the code and/or test to make the test pass.
   If you weren't given additional directions, do what you normally do and do not look at the Replay recording.
   - If you don't know what's wrong, don't guess and move on to the next step.
   - If you have taken more than 30 minutes to fix the problem, give up on fixing the issue and move on to the next step.

4. Get the patch with your changes.

5. Update the `report-data/testFailure-<failure.id>.md` file with info about whether you fixed the test failure,
   the patch with your changes, and a description of what was causing the failure.

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
