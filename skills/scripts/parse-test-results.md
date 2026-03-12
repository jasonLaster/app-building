# parse-test-results

## Purpose

Standard approach for extracting test results from Playwright's JSON reporter output.
Replaces ad-hoc `python3 -c` and `node -e` one-liners with a consistent method.

## Preferred Method

Read `test-results/results.json` using `npx tsx` with a simple inline script, or use
the error-context files which provide more readable output.

### Option 1: Error-context files (preferred)

Check `test-results/*/error-context.md` files for human-readable failure details:

```bash
ls test-results/*/error-context.md 2>/dev/null
```

Each error-context file contains the test name, error message, and page snapshot.
This is the most reliable source for failure diagnosis.

### Option 2: Last-run summary

```bash
cat test-results/.last-run.json
```

Provides high-level pass/fail status without detailed error messages.

### Option 3: Inline TypeScript (when programmatic access is needed)

```bash
npx tsx -e "
import { readFileSync } from 'fs';
const r = JSON.parse(readFileSync('test-results/results.json', 'utf-8'));
const suites = r.suites || [];
for (const s of suites) {
  for (const spec of s.specs || []) {
    const status = spec.tests?.[0]?.results?.[0]?.status || 'unknown';
    console.log(\`[\${status}] \${spec.title}\`);
  }
}
"
```

## Anti-Patterns

- Do NOT use `grep` or `python3 -c` to parse `results.json` — the JSON structure is
  nested and varies between Playwright versions.
- Do NOT rely on `results.json` for error details — the JSON reporter strips test names
  and error context. Use `error-context.md` files instead.
- Do NOT use `node -e` with stdin piping for JSON parsing — use `npx tsx -e` for
  consistency with the rest of the toolchain.
