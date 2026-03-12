# Skill

The app https://test-failure-benchmark.netlify.app is used to keep track of test failures that
have been encountered while developing apps, and benchmarks the ability of different agents to
correctly fix them.

This skill describes how to look at a test failure report for failures which can be extracted
into problems in this benchmark.

Test failure reports include the information needed to extract test failures into benchmark problems.
Read reportTestFailures.md for more.

If you are reviewing a report for test failures to extract, look in the report for the table of
test failures fixed using Replay. If the table isn't present, review the available information
for test failures to try to extract. Check out the associated branch and examine the git history
if necessary.

In order to extract a test failure the following information is needed:

BRANCH_NAME
INITIAL_CHANGESET
FAILING_TEST
FINAL_CHANGESET
ASSESSMENT (if present)

Write a file `reports/extractTestFailure/<report-name>.md` with all the suitable failures you found and
any other interesting results of the analysis.

Then queue separate tasks to extract each of these failures, using the `extractTestFailure.md` skill.

## Suitable Failures

Suitable failures for extracting should be actual problems with the app, not infrastructure related failures.
