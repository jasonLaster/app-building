# Skill

The skill documents used to build the app have directives sections for requirements that must
be adhered to when performing that stage of development. During this stage you will systematically
go through the entire app and check that its behavior is following all directives.

## Unpack Subtasks

Read `docs/tests.md` to understand the existing application structure. Add ALL page tasks
and the backend task in a single `add-task` call. Write out every page explicitly — do not
use a loop or script:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/maintain/checkDirectives.md", "app": "<AppName>", "subtasks": [
    "CheckTestSpec<PageName>: Check testSpec.md directive violations in <PageName> test entries",
    "CheckComponents<PageName>: Check writeApp.md directive violations in <PageName> components",
    "CheckTests<PageName>: Check writeTests.md directive violations in <PageName> tests"
  ]},
  { "skill": "skills/tasks/maintain/checkDirectives.md", "app": "<AppName>", "subtasks": [
    "CheckBackend: Check writeApp.md directive violations in all backend functions"
  ]}
]
EOF
```

## Checking for violations

During each checking subtask you need to read the skill document and all the directives,
and then go through all the documentation / code you are checking to look for violations of those directives.
You must do this systematically and announce each entry name / file you are checking.

For any violations you find, add a fix task using `add-task`. Do not fix them immediately.

Example:
```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[{ "skill": "skills/tasks/maintain/checkDirectives.md", "app": "<AppName>", "subtasks": [
  "FixViolation: Fix <violation description>",
  "RunTests: Run tests/<affected-spec>.spec.ts to verify fix",
  "DocumentFix: Document the fix"
]}]
EOF
```

## Fixing violations

Fix the relevant documentation / code to make sure it is not violating the directives.
Make sure to update anything else affected by the changes you are making, in `docs/tests.md`, the app code,
and playwright tests.

## Running tests

Before running any tests, kill stale processes that may be holding ports:
```bash
pkill -f "netlify dev" 2>/dev/null; pkill -f "vite" 2>/dev/null; sleep 1
```
Stale `netlify dev` or `node` processes from prior runs are a frequent cause of test failures.

Make sure all tests pass. Read `skills/tasks/build/testing.md` to understand how to run tests and debug failures.

## Tips

- Group related fix subtasks into a single FixViolation subtask when they share the same root cause
  (e.g. "FixViolationMissingTestIds" for all modals missing data-testid attributes).
