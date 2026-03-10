# Skill

The app https://test-failure-benchmark.netlify.app is used to keep track of test failures that
have been encountered while developing apps, and benchmarks the ability of different agents to
correctly fix them.

This skill describes how to extract a test failure into a problem that can be submitted to the
benchmark. This skill works in tandem with `reviewReportTestFailures.md` which looks through the
test failures for problems to extract.

## Steps

When extracting a test failure the following steps must be followed in order.

1. Checkout the changeset where the test failure occurred.
2. Run the file with the failing test to reproduce the failure using `npm run test tests/<test-file>.spec.ts`.
   **NEVER use `npx playwright test` directly** — it skips critical setup (Neon branch, seeding, dev server).
   Always use `npm run test` as described in `skills/scripts/test.md`.
   If the failure does not reproduce, make a note of it and bail out.
3. Checkout the changeset after the fix.
4. Run the test file again using `npm run test tests/<test-file>.spec.ts` and verify the problem is fixed.
   If the failure still happens, make a note of it and bail out.
5. Submit the test failure according to the instructions below.

After either successfully extracting a test failure or bailing out, clean up state by checking out the
original branch you were on before starting the extract.

## Correct fixes

It is very important when fixing tests to make sure the fix is correct. The test must ensure the app is
behaving correctly according to the requirements of the corresponding test spec entry, and the app must
not inappropriately hardcode values which the test expects to find.

When submitting a test failure an assessment string is provided which is 

## Submitting test failures

To submit a test failure to the benchmark call the benchmark's webhook with the following format.
The group name must be filled in as specified, other fields must be updated for the failure itself.

curl -X POST https://test-failure-benchmark.netlify.app/.netlify/functions/failures \
  -H "Content-Type: application/json" \
    -d '{
      "title": "Login button not visible after auth",
      "group_name": "app-building",
      "github_repository": "https://github.com/replayio/app-building",
      "branch": "current-branch",
      "neon_project_id": "project-id",
      "failing_changeset": "abc1234",
      "fixed_changeset": "def5678",
      "test_file": "tests/<test-file>.ts",
      "assessment_string": "Button visibility CSS issue"
    }'
