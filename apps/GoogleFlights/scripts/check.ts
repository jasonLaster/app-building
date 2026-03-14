import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const logDir = join(import.meta.dirname, '..', 'logs')
mkdirSync(logDir, { recursive: true })
const logPath = join(logDir, 'check.log')

let log = ''
let failed = false
let failStep = ''

try {
  const tscOut = execSync('npx tsc --noEmit', {
    cwd: join(import.meta.dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe',
  })
  log += '=== TypeCheck ===\n' + tscOut + '\n'
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string }
  log += '=== TypeCheck (FAILED) ===\n' + (err.stdout || '') + '\n' + (err.stderr || '') + '\n'
  failed = true
  failStep = 'typecheck'
}

try {
  const lintOut = execSync('npx eslint . --fix', {
    cwd: join(import.meta.dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe',
  })
  log += '=== Lint ===\n' + lintOut + '\n'
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string }
  log += '=== Lint (FAILED) ===\n' + (err.stdout || '') + '\n' + (err.stderr || '') + '\n'
  if (!failed) {
    failed = true
    failStep = 'lint'
  }
}

writeFileSync(logPath, log)

if (failed) {
  console.log(`check failed (${failStep}) — see logs/check.log`)
  process.exit(1)
} else {
  console.log('check passed')
}
