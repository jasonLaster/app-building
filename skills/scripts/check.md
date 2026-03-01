# check

## Purpose

Runs typecheck and lint with autofix as a single command. This is the quality gate that must
pass before every commit.

## Usage

- `package.json` entry: `"check": "tsx scripts/check.ts"`
- No command-line arguments.
- No environment variables.
- **Run from the app directory** (e.g., `cd /repo/apps/AppName && npm run check`), not from the
  repo root with standalone `npx tsc --noEmit`. Running from the app directory ensures the correct
  `tsconfig.json` is used and avoids resolution issues.
- Example: `cd /repo/apps/SalesCRM && npm run check`

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

## Faster Type-Only Checks

During iterative development when you only need to verify types (not lint), you can run
`npx tsc --noEmit` directly from the app directory for faster feedback. This skips the lint
step and is useful when making rapid type-level changes. Always run the full `npm run check`
before committing.

## Common Issues

- **`@neondatabase/serverless` resolution errors**: If `tsc` reports module resolution failures
  for `@neondatabase/serverless`, verify the package is installed: `ls node_modules/@neondatabase/serverless`.
  If missing, run `npm install` from the app directory. Note that `tsx`-based scripts (e.g.,
  `npx tsx scripts/schema.ts`) may fail on this dependency even when it is installed — this is a
  known `tsx` runtime resolution issue. Use `npm run` wrappers instead of direct `npx tsx` invocation.

## Implementation Tips

- Use `child_process.execSync` for each step. Do NOT inherit stdio — pipe output to the log file.
- Run typecheck first — no point linting if types are broken.
- Overwrite `logs/check.log` each run (not append).
