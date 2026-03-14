import { execSync, spawn } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.ts'
import { truncateAndSeed } from './seed-db.ts'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
mkdirSync(logDir, { recursive: true })

// Determine log file number
const existingLogs = readdirSync(logDir).filter(f => f.match(/^test-run-\d+\.log$/))
const maxNum = existingLogs.reduce((max, f) => {
  const m = f.match(/test-run-(\d+)\.log/)
  return m ? Math.max(max, parseInt(m[1]!)) : max
}, 0)
const logNum = maxNum + 1
const logPath = join(logDir, `test-run-${logNum}.log`)
let logContent = ''
function log(msg: string) { logContent += msg + '\n' }

// Read .env
function readEnv(): Record<string, string> {
  const envPath = join(appDir, '.env')
  if (!existsSync(envPath)) return {}
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  const env: Record<string, string> = {}
  for (const line of lines) {
    const idx = line.indexOf('=')
    if (idx > 0 && !line.startsWith('#')) {
      env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    }
  }
  return env
}

const testFile = process.argv[2]
if (!testFile) {
  console.error('Usage: npm run test <test-file>')
  process.exit(1)
}

const NEON_API_KEY = (process.env.NEON_API_KEY || '').trim()
const RECORD_REPLAY_API_KEY = process.env.RECORD_REPLAY_API_KEY || ''
const envVars = readEnv()
const NEON_PROJECT_ID = envVars.NEON_PROJECT_ID || ''
const DATABASE_URL = envVars.DATABASE_URL || ''

if (!NEON_API_KEY || !NEON_PROJECT_ID || !DATABASE_URL) {
  console.error('Missing required env vars (NEON_API_KEY, NEON_PROJECT_ID, DATABASE_URL)')
  process.exit(1)
}

async function neonApi(method: string, path: string, body?: unknown) {
  const opts: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${NEON_API_KEY}`,
      'Content-Type': 'application/json',
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`https://console.neon.tech/api/v2${path}`, opts)
  return res.json()
}

async function main() {
  // Step 1: Kill stale processes
  try { execSync('pkill -f "netlify dev" 2>/dev/null || true', { stdio: 'ignore' }) } catch { /* ignore */ }
  try { execSync('pkill -f "vite" 2>/dev/null || true', { stdio: 'ignore' }) } catch { /* ignore */ }

  // Step 2: Clean up stale Neon test branches
  const branchesRes = await neonApi('GET', `/projects/${NEON_PROJECT_ID}/branches`) as { branches?: { id: string; name: string }[] }
  const branches = branchesRes.branches || []
  for (const b of branches) {
    if (b.name.startsWith('test-run-')) {
      log(`Deleting stale branch: ${b.name}`)
      await neonApi('DELETE', `/projects/${NEON_PROJECT_ID}/branches/${b.id}`)
    }
  }

  // Step 3: Create ephemeral Neon branch
  const branchName = `test-run-${Date.now()}`
  log(`Creating branch: ${branchName}`)
  const branchRes = await neonApi('POST', `/projects/${NEON_PROJECT_ID}/branches`, {
    branch: { name: branchName },
    endpoints: [{ type: 'read_write' }],
  }) as {
    branch?: { id: string };
    endpoints?: { host: string }[];
    roles?: { name: string; password?: string }[];
    connection_uris?: { connection_uri: string }[];
  }

  const branchId = branchRes.branch?.id
  if (!branchId) {
    log('Failed to create branch: ' + JSON.stringify(branchRes))
    writeFileSync(logPath, logContent)
    console.log(`0 passed, 0 failed — see logs/test-run-${logNum}.log`)
    process.exit(1)
  }

  let testDbUrl = ''
  if (branchRes.connection_uris?.[0]?.connection_uri) {
    testDbUrl = branchRes.connection_uris[0].connection_uri
  } else {
    const host = branchRes.endpoints?.[0]?.host || ''
    const roleName = branchRes.roles?.[0]?.name || 'neondb_owner'
    let password = branchRes.roles?.[0]?.password || ''
    if (!password) {
      const pwRes = await neonApi('GET', `/projects/${NEON_PROJECT_ID}/branches/${branchId}/roles/${roleName}/reveal_password`) as { password?: string }
      password = pwRes.password || ''
    }
    testDbUrl = `postgresql://${roleName}:${password}@${host}/neondb?sslmode=require`
  }

  log(`Branch DB URL: ${testDbUrl.replace(/:[^:@]+@/, ':***@')}`)

  let playwrightExit = 1

  try {
    // Step 4: Initialize and seed
    log('Initializing schema...')
    await initSchema(testDbUrl)
    log('Schema initialized')

    log('Seeding database...')
    await truncateAndSeed(testDbUrl)
    log('Database seeded')

    // Step 5: Start netlify dev
    log('Starting netlify dev...')
    const serverProc = spawn('npx', ['netlify', 'dev', '--port', '8888', '--functions', './netlify/functions'], {
      cwd: appDir,
      env: { ...process.env, DATABASE_URL: testDbUrl, LC_ALL: 'C' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let serverOutput = ''
    serverProc.stdout.on('data', (d: Buffer) => { serverOutput += d.toString() })
    serverProc.stderr.on('data', (d: Buffer) => { serverOutput += d.toString() })

    // Wait for server to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server start timeout')), 30000)
      const check = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8888', { signal: AbortSignal.timeout(2000) })
          if (res.ok || res.status === 200 || res.status === 304) {
            clearInterval(check)
            clearTimeout(timeout)
            resolve()
          }
        } catch { /* not ready yet */ }
      }, 1000)
    })

    log('Server ready')

    // Step 6: Remove stale recordings
    try { execSync('npx replayio remove --all 2>/dev/null || true', { cwd: appDir, stdio: 'ignore' }) } catch { /* ignore */ }

    // Step 7: Run Playwright
    log(`Running: npx playwright test ${testFile} --retries 0 --workers 1`)

    // Create a reset script for between tests
    const resetEnv = { ...process.env, DATABASE_URL: testDbUrl }

    try {
      const pwOutput = execSync(
        `npx playwright test ${testFile} --retries 0 --workers 1`,
        {
          cwd: appDir,
          env: { ...resetEnv, RECORD_REPLAY_API_KEY, PW_TEST_REUSE_CONTEXT: '0' },
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 300000,
        }
      )
      log('=== Playwright Output ===')
      log(pwOutput.toString())
      playwrightExit = 0
    } catch (e: unknown) {
      const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number }
      log('=== Playwright Output ===')
      log((err.stdout?.toString() || '') + '\n' + (err.stderr?.toString() || ''))
      playwrightExit = err.status || 1
    }

    log('=== Server Output ===')
    log(serverOutput)

    // Step 8: Parse results
    const resultsPath = join(appDir, 'test-results', 'results.json')
    let passed = 0, failed = 0, _skipped = 0
    if (existsSync(resultsPath)) {
      try {
        const results = JSON.parse(readFileSync(resultsPath, 'utf-8'))
        for (const suite of (results.suites || [])) {
          for (const spec of (suite.specs || [])) {
            for (const test of (spec.tests || [])) {
              if (test.status === 'expected') passed++
              else if (test.status === 'unexpected') failed++
              else if (test.status === 'skipped') _skipped++
            }
          }
        }
      } catch { /* ignore parse errors */ }
    }

    // Step 9: On failure, handle recordings
    let uploadedId = ''
    if (playwrightExit !== 0) {
      const recordingsLogPath = join(process.env.HOME || '~', '.replay', 'recordings.log')
      if (existsSync(recordingsLogPath)) {
        const lines = readFileSync(recordingsLogPath, 'utf-8').split('\n').filter(Boolean)
        const recordings: Record<string, { id: string; duration?: number; result?: string; finished?: boolean }> = {}

        for (const line of lines) {
          try {
            const entry = JSON.parse(line)
            if (entry.kind === 'createRecording') {
              recordings[entry.id] = { id: entry.id, duration: 0, finished: false }
            } else if (entry.kind === 'writeFinished' && recordings[entry.id]) {
              recordings[entry.id]!.finished = true
            } else if (entry.kind === 'addMetadata' && recordings[entry.id]) {
              const testResult = entry.metadata?.test?.result
              if (testResult) recordings[entry.id]!.result = testResult
              if (entry.metadata?.test?.duration) recordings[entry.id]!.duration = entry.metadata.test.duration
            }
          } catch { /* skip bad lines */ }
        }

        // Find failed recordings
        const failedRecs = Object.values(recordings).filter(
          r => r.finished && (r.result === 'failed' || r.result === 'timedOut')
        )

        log('\n=== REPLAY RECORDINGS METADATA ===')
        for (const r of Object.values(recordings)) {
          log(JSON.stringify(r))
        }
        log('=== END REPLAY RECORDINGS METADATA ===')

        if (failedRecs.length > 0) {
          // Pick the longest duration one
          failedRecs.sort((a, b) => (b.duration || 0) - (a.duration || 0))
          const toUpload = failedRecs[0]!
          log(`\nUploading recording: ${toUpload.id}`)
          try {
            execSync(`npx replayio upload ${toUpload.id}`, {
              cwd: appDir,
              env: { ...process.env, RECORD_REPLAY_API_KEY },
              stdio: ['ignore', 'pipe', 'pipe'],
              timeout: 60000,
            })
            uploadedId = toUpload.id
            log(`REPLAY UPLOADED: ${uploadedId}`)
          } catch (ue: unknown) {
            const uploadErr = ue as { status?: number }
            log(`Upload failed with exit code: ${uploadErr.status}`)
          }
        }
      }
    }

    // Clean up server
    serverProc.kill('SIGTERM')

    // Step 10: Print summary
    writeFileSync(logPath, logContent)

    let summary = ''
    if (failed > 0) {
      summary = `${passed} passed, ${failed} failed`
      if (uploadedId) summary += ` (recording: ${uploadedId})`
    } else if (passed > 0) {
      summary = `${passed} passed`
    } else {
      summary = playwrightExit === 0 ? 'Tests completed' : 'Tests failed'
    }
    summary += ` — see logs/test-run-${logNum}.log`
    console.log(summary)
  } finally {
    // Step 10: Clean up Neon branch
    try {
      await neonApi('DELETE', `/projects/${NEON_PROJECT_ID}/branches/${branchId}`)
      log('Cleaned up test branch')
    } catch { /* ignore */ }

    // Remove local recordings
    try { execSync('npx replayio remove --all 2>/dev/null || true', { cwd: appDir, stdio: 'ignore' }) } catch { /* ignore */ }

    writeFileSync(logPath, logContent)
  }

  process.exit(playwrightExit)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
