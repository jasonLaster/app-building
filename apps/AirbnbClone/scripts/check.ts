import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const logDir = join(import.meta.dirname, '..', 'logs')
mkdirSync(logDir, { recursive: true })
const logFile = join(logDir, 'check.log')

let failed = false
let failStep = ''
let output = ''

try {
  const tscOut = execSync('npx tsc --noEmit', {
    cwd: join(import.meta.dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe',
  })
  output += '=== TypeCheck ===\n' + tscOut + '\n'
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string }
  output += '=== TypeCheck ===\n' + (err.stdout || '') + '\n' + (err.stderr || '') + '\n'
  failed = true
  failStep = 'typecheck'
}

try {
  const eslintOut = execSync('npx eslint . --fix', {
    cwd: join(import.meta.dirname, '..'),
    encoding: 'utf-8',
    stdio: 'pipe',
  })
  output += '=== Lint ===\n' + eslintOut + '\n'
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string }
  output += '=== Lint ===\n' + (err.stdout || '') + '\n' + (err.stderr || '') + '\n'
  if (!failed) {
    failed = true
    failStep = 'lint'
  }
}

writeFileSync(logFile, output)

if (failed) {
  console.log(`check failed (${failStep}) — see logs/check.log`)
  process.exit(1)
} else {
  console.log('check passed')
}
