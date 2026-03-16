import { execSync, spawn } from 'child_process'
import { writeFileSync, readFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.js'
import { seedDatabase, resetDatabase } from './seed-db.js'

const appDir = join(import.meta.dirname, '..')
const logsDir = join(appDir, 'logs')

function getEnvVar(name: string): string {
  const val = process.env[name]
  if (!val) {
    console.error(`Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return val
}

function loadDotEnv(): void {
  const envPath = join(appDir, '.env')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function getNextLogNumber(): number {
  mkdirSync(logsDir, { recursive: true })
  const existing = readdirSync(logsDir)
    .filter(f => /^test-run-\d+\.log$/.test(f))
    .map(f => parseInt(f.match(/test-run-(\d+)\.log/)![1]!, 10))
  return existing.length > 0 ? Math.max(...existing) + 1 : 1
}

function killStaleProcesses(): void {
  try { execSync("pkill -f 'netlify dev' || true", { stdio: 'ignore' }) } catch { /* ignore */ }
  try { execSync("pkill -f 'dev-server' || true", { stdio: 'ignore' }) } catch { /* ignore */ }
  try { execSync("pkill -f 'vite' || true", { stdio: 'ignore' }) } catch { /* ignore */ }
  try { execSync("fuser -k 8888/tcp 2>/dev/null || true", { stdio: 'ignore' }) } catch { /* ignore */ }
  try { execSync("fuser -k 5173/tcp 2>/dev/null || true", { stdio: 'ignore' }) } catch { /* ignore */ }
  execSync('sleep 1', { stdio: 'ignore' })
}

async function neonApi(method: string, path: string, body?: unknown): Promise<unknown> {
  const apiKey = getEnvVar('NEON_API_KEY')
  const res = await fetch(`https://console.neon.tech/api/v2${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon API ${method} ${path} failed (${res.status}): ${text}`)
  }
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) return res.json()
  return null
}

interface NeonBranch { id: string; name: string }
interface NeonBranchListResponse { branches: NeonBranch[] }
interface NeonEndpoint { host: string }
interface NeonEndpointsResponse { endpoints: NeonEndpoint[] }
interface NeonBranchCreateResponse { branch: NeonBranch; endpoints: NeonEndpoint[] }

async function cleanupStaleBranches(projectId: string): Promise<void> {
  const data = await neonApi('GET', `/projects/${projectId}/branches`) as NeonBranchListResponse
  const stale = data.branches.filter(b => b.name.startsWith('test-run-'))
  for (const branch of stale) {
    try { await neonApi('DELETE', `/projects/${projectId}/branches/${branch.id}`) } catch { /* best effort */ }
  }
}

async function createEphemeralBranch(projectId: string, branchName: string): Promise<string> {
  const data = await neonApi('POST', `/projects/${projectId}/branches`, {
    branch: { name: branchName },
    endpoints: [{ type: 'read_write' }],
  }) as NeonBranchCreateResponse

  let host = data.endpoints[0]?.host
  if (!host) {
    const epData = await neonApi('GET', `/projects/${projectId}/branches/${data.branch.id}/endpoints`) as NeonEndpointsResponse
    host = epData.endpoints[0]?.host
    if (!host) throw new Error('No endpoint created for ephemeral branch')
  }
  const mainDbUrl = getEnvVar('DATABASE_URL')
  const url = new URL(mainDbUrl)
  url.hostname = host
  return url.toString()
}

async function deleteBranch(projectId: string, branchName: string): Promise<void> {
  const data = await neonApi('GET', `/projects/${projectId}/branches`) as NeonBranchListResponse
  const branch = data.branches.find(b => b.name === branchName)
  if (branch) {
    await neonApi('DELETE', `/projects/${projectId}/branches/${branch.id}`)
  }
}

interface RecordingEntry {
  id?: string; kind: string; metadata?: { test?: { result?: string; title?: string }; uri?: string }; duration?: number
}
interface ParsedRecording { id: string; testResult: string; testTitle: string; specFile: string; duration: number }

function parseRecordingsLog(): ParsedRecording[] {
  const logPath = join(process.env.HOME || '~', '.replay', 'recordings.log')
  if (!existsSync(logPath)) return []
  const content = readFileSync(logPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())
  const recordings = new Map<string, { id: string; duration: number }>()
  const metadata = new Map<string, { testResult: string; testTitle: string; specFile: string }>()
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as RecordingEntry
      if (entry.kind === 'createRecording' && entry.id) recordings.set(entry.id, { id: entry.id, duration: 0 })
      if (entry.kind === 'writeFinished' && entry.id) {
        const rec = recordings.get(entry.id)
        if (rec && entry.duration) rec.duration = entry.duration
      }
      if (entry.kind === 'addMetadata' && entry.id && entry.metadata?.test) {
        metadata.set(entry.id, {
          testResult: entry.metadata.test.result || 'unknown',
          testTitle: entry.metadata.test.title || '',
          specFile: entry.metadata.uri || '',
        })
      }
    } catch { /* skip */ }
  }
  const results: ParsedRecording[] = []
  for (const [id, rec] of recordings) {
    const meta = metadata.get(id)
    if (meta) results.push({ id, ...meta, duration: rec.duration })
  }
  return results
}

async function main(): Promise<void> {
  loadDotEnv()
  const testFile = process.argv[2]
  if (!testFile) { console.error('Usage: npm run test <testFile>'); process.exit(1) }

  const projectId = getEnvVar('NEON_PROJECT_ID')
  getEnvVar('DATABASE_URL')

  const logNum = getNextLogNumber()
  const logFile = join(logsDir, `test-run-${logNum}.log`)
  const branchName = `test-run-${Date.now()}`
  let playwrightExitCode = 1
  let ephemeralDbUrl = ''

  killStaleProcesses()
  await cleanupStaleBranches(projectId)

  try {
    ephemeralDbUrl = await createEphemeralBranch(projectId, branchName)
  } catch (err) {
    console.error(`Failed to create ephemeral branch: ${err}`)
    process.exit(1)
  }

  try {
    await initSchema(ephemeralDbUrl)
    await seedDatabase(ephemeralDbUrl)

    const netlifyDev = spawn('npx', ['tsx', 'scripts/dev-server.ts'], {
      cwd: appDir,
      env: { ...process.env, DATABASE_URL: ephemeralDbUrl, DEV_PORT: '8888' },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('dev server failed to start within 60s')), 60000)
      let output = ''
      let resolved = false
      const check = (data: Buffer) => {
        output += data.toString()
        if (!resolved && (output.includes('Dev server ready') || output.includes('localhost:8888'))) {
          resolved = true
          setTimeout(() => { clearTimeout(timeout); resolve() }, 2000)
        }
      }
      netlifyDev.stdout?.on('data', check)
      netlifyDev.stderr?.on('data', check)
      netlifyDev.on('error', (err) => { if (!resolved) { clearTimeout(timeout); reject(err) } })
      netlifyDev.on('exit', (code) => {
        if (!resolved && code !== null && code !== 0) { clearTimeout(timeout); reject(new Error(`dev server exited ${code}\n${output}`)) }
      })
    })

    try { execSync('npx replayio remove --all', { cwd: appDir, stdio: 'ignore' }) } catch { /* ignore */ }

    // Retry resetDatabase in case the Neon endpoint needs time to become available
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await resetDatabase(ephemeralDbUrl)
        break
      } catch (err) {
        if (attempt === 2) throw err
        console.log(`resetDatabase attempt ${attempt + 1} failed, retrying in 3s...`)
        await new Promise(r => setTimeout(r, 3000))
      }
    }

    try {
      const pwOutput = execSync(`npx playwright test ${testFile} --retries 0 --workers 1`, {
        cwd: appDir, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, DATABASE_URL: ephemeralDbUrl, TEST_DATABASE_URL: ephemeralDbUrl, BASE_URL: 'http://localhost:8888' },
        timeout: 300000,
      })
      writeFileSync(logFile, pwOutput)
      playwrightExitCode = 0
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; status?: number }
      writeFileSync(logFile, (err.stdout || '') + '\n' + (err.stderr || ''))
      playwrightExitCode = err.status || 1
    }

    let passed = 0, failed = 0, skipped = 0
    const resultsPath = join(appDir, 'test-results', 'results.json')
    if (existsSync(resultsPath)) {
      try {
        const rj = JSON.parse(readFileSync(resultsPath, 'utf-8'))
        for (const suite of rj.suites || []) {
          for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
              if (test.status === 'expected' || test.status === 'passed') passed++
              else if (test.status === 'unexpected' || test.status === 'failed') failed++
              else if (test.status === 'skipped') skipped++
            }
          }
        }
      } catch { /* ignore */ }
    }

    let uploadedId = ''
    if (playwrightExitCode !== 0) {
      const recs = parseRecordingsLog()
      if (recs.length > 0) {
        let block = '\n=== REPLAY RECORDINGS METADATA ===\n'
        for (const r of recs) block += JSON.stringify({ id: r.id, testResult: r.testResult, testTitle: r.testTitle, specFile: r.specFile }) + '\n'
        block += '=== END REPLAY RECORDINGS METADATA ===\n'
        writeFileSync(logFile, readFileSync(logFile, 'utf-8') + block)
      }
      const failedRecs = recs.filter(r => r.testResult === 'failed' || r.testResult === 'timedOut').sort((a, b) => b.duration - a.duration)
      if (failedRecs[0]) {
        try {
          execSync(`npx replayio upload ${failedRecs[0].id}`, { cwd: appDir, encoding: 'utf-8', stdio: 'pipe', timeout: 120000 })
          uploadedId = failedRecs[0].id
          writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOADED: ${uploadedId}\n`)
        } catch (e: unknown) {
          const err = e as { status?: number }
          writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOAD FAILED (exit code ${err.status || 'unknown'})\n`)
        }
      }
    }

    try { if (netlifyDev.pid) process.kill(-netlifyDev.pid, 'SIGTERM') } catch { /* ignore */ }

    const parts: string[] = []
    if (passed > 0) parts.push(`${passed} passed`)
    if (failed > 0) parts.push(`${failed} failed`)
    if (skipped > 0) parts.push(`${skipped} skipped`)
    let summary = parts.length > 0 ? parts.join(', ') : (playwrightExitCode === 0 ? 'all passed' : 'tests failed')
    if (uploadedId) summary += ` (recording: ${uploadedId})`
    if (playwrightExitCode !== 0) summary += ` — see logs/test-run-${logNum}.log`
    console.log(summary)

  } finally {
    try { await deleteBranch(projectId, branchName) } catch { /* ignore */ }
    try { execSync('npx replayio remove --all', { cwd: appDir, stdio: 'ignore' }) } catch { /* ignore */ }
    killStaleProcesses()
  }

  process.exit(playwrightExitCode)
}

main()
