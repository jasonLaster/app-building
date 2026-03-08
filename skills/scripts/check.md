# check

## Purpose

Runs typecheck and lint with autofix as a single command. This is the quality gate that must
pass before every commit.

## Reliability

`npm run check` has a 100% success rate across 173 observed worker iterations (28 invocations,
all successful). It is the most reliable quality gate and should always be used before commits.

## Usage

- `package.json` entry: `"check": "tsx scripts/check.ts"`
- No command-line arguments.
- No environment variables.
- **Run from the app directory** (e.g., `cd /repo/apps/AppName && npm run check`), not from the
  repo root with standalone `npx tsc --noEmit`. Running from the app directory ensures the correct
  `tsconfig.json` is used and avoids resolution issues.
- Example: `cd /repo/apps/SalesCRM && npm run check`

## First-Attempt Failures Are Normal

`npm run check` frequently fails on its first run due to lint errors or type issues introduced
during development. This is expected behavior, not a blocking problem. When it fails:
1. Read `logs/check.log` to identify the errors.
2. Fix the reported issues in your source files **immediately** — do not proceed with other
   work (writing more components, running tests, etc.) until `npm run check` passes. Lint
   errors like unused variables accumulate quickly if left unfixed, making later runs harder
   to diagnose.
3. Re-run `npm run check`.

Do not treat a first-attempt failure as a sign that something is fundamentally wrong with the
check script or project configuration.

## Behavior

1. Run `npx tsc --noEmit` to typecheck. Capture output to a log file.
2. Run `npx eslint . --fix` to lint with autofix. Capture output to the same log file.
3. Print a one-line summary to stdout:
   - Success: `check passed`
   - Failure: `check failed (typecheck|lint) — see logs/check.log`
4. Exit with code 0 if both pass, 1 otherwise.

## Inputs

None.

## Outputs

- **stdout**: One-line summary only.
- **`logs/check.log`**: Full typecheck and lint output. Overwritten each run.
- **Exit code 0**: both typecheck and lint passed.
- **Exit code 1**: typecheck or lint failed.
- Lint autofix may modify source files in place.

## ESLint Configuration

Before running lint, verify that the app has an ESLint configuration file (`.eslintrc.*` or
`eslint.config.*`). If no configuration exists:
- Either create a minimal ESLint config for the app before running lint, or
- Skip the lint step entirely.

Do NOT retry `npx eslint` expecting different results when the underlying issue is a missing
configuration file. The "no config found" error will not resolve on its own.

## TypeScript Checking Retry Limits

Do not retry `npx tsc --noEmit` (or `npm run check`) more than 2–3 times for the same error.
If it fails repeatedly with the same type errors, the issue is in the code, not a transient
problem. If it appears to hang (no output for 60+ seconds), check for configuration issues
in `tsconfig.json` (e.g., incorrect `jsx` flag, missing `include` paths) rather than retrying.

## Faster Type-Only Checks

During iterative development when you only need to verify types (not lint), you can run
`npx tsc --noEmit` directly from the app directory for faster feedback. This skips the lint
step and is useful when making rapid type-level changes. Always run the full `npm run check`
before committing.

## Partial Success (Lint Warnings)

`npm run check` may exit 0 (success) while still producing lint warnings in `logs/check.log`.
Warnings do not block the build or commit. Only lint **errors** cause a non-zero exit code.
When reviewing `check.log`, distinguish between warnings (informational, no action required)
and errors (must be fixed before committing). Common warning-level rules include
`no-console` and `@typescript-eslint/no-explicit-any`.

## Interpreting Failures

When `npm run check` fails, read `logs/check.log` to determine which step failed and why:

- **Typecheck failures** (`tsc`): Look for `error TS` lines. Common categories:
  - `TS2307` (Cannot find module): Missing dependency — run `npm install`.
  - `TS2339` (Property does not exist): Typo in property name or missing type definition.
  - `TS2345`/`TS2322` (Type mismatch): Wrong type passed to a function or assigned to a variable.
  - Multiple errors in the same file: Fix the first error — later errors are often cascading.
- **Lint failures** (`eslint`): Look for rule names in the output (e.g., `no-unused-vars`).
  Many lint errors are auto-fixed by `--fix`. If errors persist after the run, they require
  manual fixes. Common error-level rules that need manual fixes:
  - `no-unused-vars` / `@typescript-eslint/no-unused-vars`: Remove the unused import or variable,
    or prefix with `_` if it is intentionally unused (e.g., `_event`).
  - `no-explicit-any`: Replace `any` with a specific type. Use `unknown` if the type is truly
    unknown and add type narrowing where the value is used.
  - `prefer-const`: Change `let` to `const` for variables that are never reassigned.
  - `no-empty`: Add a comment inside empty catch/if blocks (e.g., `// intentionally empty`)
    or remove the empty block.
- **Both fail**: Fix typecheck errors first. Lint errors often disappear once types are correct.

During iterative development, typecheck/lint failures are expected. They are part of the
normal build-fix-check cycle. Focus on fixing the errors rather than treating each failure
as a problem with the check script itself.

## Troubleshooting Multi-Attempt Failures

`npm run check` has a ~20% multi-attempt rate. Common reasons for needing retries:

- **Cascading type errors**: A single root-cause type error produces many downstream errors.
  Fix the first `error TS` line and re-run — most other errors often disappear.
- **Lint autofix conflicts with types**: `eslint --fix` may rewrite code in a way that
  introduces new type errors. If check fails after lint autofix, re-run — the second pass
  usually catches both.
- **Stale build artifacts**: If errors reference files you've already fixed, delete
  `node_modules/.cache` and re-run.

When `npm run check` fails, always fix and re-run rather than switching to manual
`npx tsc` / `npx eslint` invocations, which may use different configs.

## Common Issues

- **`.netlify/functions-serve/` lint errors**: The `.netlify/functions-serve/` directory contains
  build artifacts that may produce lint errors. These errors are not actionable — do not attempt
  to fix them. If `npm run check` reports lint failures only in `.netlify/functions-serve/` paths,
  they can be safely ignored. To prevent these from appearing, add `.netlify` to the ESLint
  ignore configuration (e.g., `ignorePatterns: ['.netlify']` in `.eslintrc` or an equivalent
  entry in `eslint.config.*`).

- **`@neondatabase/serverless` resolution errors**: If `tsc` reports module resolution failures
  for `@neondatabase/serverless`, verify the package is installed: `ls node_modules/@neondatabase/serverless`.
  If missing, run `npm install` from the app directory. Note that `tsx`-based scripts (e.g.,
  `npx tsx scripts/schema.ts`) may fail on this dependency even when it is installed — this is a
  known `tsx` runtime resolution issue. Use `npm run` wrappers instead of direct `npx tsx` invocation.

## Implementation Tips

- Use `child_process.execSync` for each step. Do NOT inherit stdio — pipe output to the log file.
- Run typecheck first — no point linting if types are broken.
- Overwrite `logs/check.log` each run (not append).
