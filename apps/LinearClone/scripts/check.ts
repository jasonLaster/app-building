import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const logDir = join(import.meta.dirname, '..', 'logs')
mkdirSync(logDir, { recursive: true })
const logFile = join(logDir, 'check.log')

let output = ''
let failed = ''

try {
  const tscOutput = execSync('npx tsc --noEmit', { cwd: join(import.meta.dirname, '..'), encoding: 'utf-8', stdio: 'pipe' })
  output += '=== TypeCheck ===\n' + tscOutput + '\n'
} catch (e: unknown) {
  const err = e as { stdout?: string; stderr?: string }
  output += '=== TypeCheck ===\n' + (err.stdout || '') + (err.stderr || '') + '\n'
  failed = 'typecheck'
}

if (!failed) {
  try {
    const lintOutput = execSync('npx eslint . --fix', { cwd: join(import.meta.dirname, '..'), encoding: 'utf-8', stdio: 'pipe' })
    output += '=== Lint ===\n' + lintOutput + '\n'
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    output += '=== Lint ===\n' + (err.stdout || '') + (err.stderr || '') + '\n'
    failed = 'lint'
  }
}

writeFileSync(logFile, output)

if (failed) {
  console.log(`check failed (${failed}) — see logs/check.log`)
  process.exit(1)
} else {
  console.log('check passed')
}
