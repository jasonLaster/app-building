import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('logs', { recursive: true });

let log = '';
let failed = '';

try {
  const tscOut = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
  log += '=== TypeCheck ===\n' + tscOut + '\n';
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string };
  log += '=== TypeCheck ===\n' + (err.stdout || '') + (err.stderr || '') + '\n';
  failed = 'typecheck';
}

try {
  const eslintOut = execSync('npx eslint . --fix', { encoding: 'utf-8', stdio: 'pipe' });
  log += '=== Lint ===\n' + eslintOut + '\n';
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string };
  log += '=== Lint ===\n' + (err.stdout || '') + (err.stderr || '') + '\n';
  if (!failed) failed = 'lint';
}

writeFileSync('logs/check.log', log);

if (failed) {
  console.log(`check failed (${failed}) — see logs/check.log`);
  process.exit(1);
} else {
  console.log('check passed');
}
