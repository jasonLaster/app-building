import { execSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema'
import { truncateAndSeed } from './seed-db'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
mkdirSync(logDir, { recursive: true })

// Find next log number
const existingLogs = readdirSync(logDir).filter(f => f.startsWith('test-run-'))
const maxNum = existingLogs.reduce((max, f) => {
  const m = f.match(/test-run-(\d+)\.log/)
  return m ? Math.max(max, parseInt(m[1]!)) : max
}, 0)
const logFile = join(logDir, `test-run-${maxNum + 1}.log`)
let logContent = ''

function log(msg: string) {
  logContent += msg + '\n'
}

function writeLog() {
  writeFileSync(logFile, logContent)
}

function readEnv(): Record<string, string> {
  const envPath = join(appDir, '.env')
  if (!existsSync(envPath)) return {}
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  const env: Record<string, string> = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
    }
  }
  return env
}

function tryExec(cmd: string, opts?: Parameters<typeof execSync>[1]) {
  try { execSync(cmd, opts) } catch { /* ignored */ }
}

const testFile = process.argv[2]
if (!testFile) {
  console.error('Usage: npm run test <test-file>')
  process.exit(1)
}

async function run() {
  const env = readEnv()
  const neonProjectId = env['NEON_PROJECT_ID'] || process.env['NEON_PROJECT_ID'] || ''
  const neonApiKey = process.env['NEON_API_KEY'] || ''
  const replayApiKey = process.env['RECORD_REPLAY_API_KEY'] || ''

  if (!neonProjectId || !neonApiKey) {
    console.error('Missing NEON_PROJECT_ID or NEON_API_KEY')
    process.exit(1)
  }

  // Step 1: Kill stale processes
  tryExec('pkill -f "netlify dev" 2>/dev/null || true', { stdio: 'ignore' })
  tryExec('pkill -f "vite" 2>/dev/null || true', { stdio: 'ignore' })

  // Step 2: Clean up stale test branches
  try {
    const branchesResp = execSync(
      `curl -s "https://console.neon.tech/api/v2/projects/${neonProjectId}/branches" -H "Authorization: Bearer ${neonApiKey}"`,
      { encoding: 'utf-8', timeout: 15000 }
    )
    const branches = JSON.parse(branchesResp).branches || []
    for (const b of branches) {
      if (typeof b.name === 'string' && b.name.startsWith('test-run-')) {
        tryExec(
          `curl -s -X DELETE "https://console.neon.tech/api/v2/projects/${neonProjectId}/branches/${b.id}" -H "Authorization: Bearer ${neonApiKey}"`,
          { stdio: 'ignore', timeout: 10000 }
        )
        log(`Cleaned up stale branch: ${b.name}`)
      }
    }
  } catch { log('Warning: could not clean stale branches') }

  // Step 3: Create ephemeral branch
  const branchName = `test-run-${Date.now()}`
  let branchId = ''
  let testDbUrl = ''

  try {
    const resp = execSync(
      `curl -s -X POST "https://console.neon.tech/api/v2/projects/${neonProjectId}/branches" -H "Authorization: Bearer ${neonApiKey}" -H "Content-Type: application/json" -d '{"branch": {"name": "${branchName}"}, "endpoints": [{"type": "read_write"}]}'`,
      { encoding: 'utf-8', timeout: 30000 }
    )
    const data = JSON.parse(resp)
    branchId = data.branch?.id || ''
    const connUri = data.connection_uris?.[0]?.connection_uri
    if (connUri) {
      testDbUrl = connUri
    } else {
      const ep = data.endpoints?.[0]
      const host = ep?.host || ''
      const role = data.roles?.[0]?.name || 'neondb_owner'
      const pwResp = execSync(
        `curl -s "https://console.neon.tech/api/v2/projects/${neonProjectId}/branches/${branchId}/roles/${role}/reveal_password" -H "Authorization: Bearer ${neonApiKey}"`,
        { encoding: 'utf-8', timeout: 10000 }
      )
      const password = JSON.parse(pwResp).password || ''
      testDbUrl = `postgresql://${role}:${password}@${host}/neondb?sslmode=require`
    }
    log(`Created branch: ${branchName} (${branchId})`)
    log(`Test DB URL: ${testDbUrl.replace(/:[^:@]+@/, ':***@')}`)
  } catch (e) {
    log(`Failed to create branch: ${e}`)
    writeLog()
    console.error('Failed to create Neon test branch')
    process.exit(1)
  }

  // Wait for branch to be ready
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Step 4: Initialize schema and seed
  try {
    await initSchema(testDbUrl)
    log('Schema initialized')
    await truncateAndSeed(testDbUrl)
    log('Database seeded')
  } catch (e) {
    log(`Schema/seed failed: ${e}`)
    writeLog()
    console.error('Schema/seed failed — see ' + logFile)
    cleanup(branchId, neonProjectId, neonApiKey)
    process.exit(1)
  }

  // Step 5 & 6: Remove stale recordings
  tryExec('npx replayio remove --all 2>/dev/null || true', { stdio: 'ignore', cwd: appDir })

  // Step 7: Run Playwright
  let playwrightExitCode = 0
  try {
    const pwOutput = execSync(
      `npx playwright test ${testFile} --retries 0 --workers 1`,
      {
        cwd: appDir,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 300000,
        env: {
          ...process.env,
          DATABASE_URL: testDbUrl,
          RECORD_REPLAY_API_KEY: replayApiKey,
        },
      }
    )
    log('=== Playwright Output ===\n' + pwOutput)
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string }
    playwrightExitCode = err.status || 1
    log('=== Playwright Output ===\n' + (err.stdout || '') + '\n' + (err.stderr || ''))
  }

  // Step 8: Parse results
  let passed = 0
  let failed = 0
  try {
    const resultsPath = join(appDir, 'test-results', 'results.json')
    if (existsSync(resultsPath)) {
      const results = JSON.parse(readFileSync(resultsPath, 'utf-8'))
      for (const suite of results.suites || []) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            if (test.status === 'expected') passed++
            else if (test.status === 'unexpected') failed++
          }
        }
      }
    }
  } catch { /* ok */ }

  // Step 9: Handle failure - upload recordings
  let uploadedId = ''
  if (playwrightExitCode !== 0) {
    try {
      const recLog = readFileSync(join(process.env['HOME'] || '~', '.replay', 'recordings.log'), 'utf-8')
      const lines = recLog.trim().split('\n').filter(l => l.trim())
      const entries: Array<Record<string, unknown>> = []
      for (const l of lines) {
        try { entries.push(JSON.parse(l)) } catch { /* skip */ }
      }

      const recordings: Record<string, { id: string; duration: number; result: string; title: string }> = {}
      for (const entry of entries) {
        if (entry.kind === 'createRecording') {
          recordings[entry.id as string] = { id: entry.id as string, duration: 0, result: '', title: '' }
        }
        if (entry.kind === 'addMetadata') {
          const meta = entry.metadata as Record<string, Record<string, string>> | undefined
          const rec = recordings[entry.id as string]
          if (rec && meta?.test) {
            rec.result = meta.test.result || ''
            rec.title = meta.test.title || ''
          }
        }
        if (entry.kind === 'writeFinished') {
          const rec = recordings[entry.id as string]
          if (rec) {
            rec.duration = (entry.duration as number) || 0
          }
        }
      }

      const metadataBlock = Object.values(recordings)
        .filter(r => r.result)
        .map(r => JSON.stringify(r))
      if (metadataBlock.length) {
        log('\n=== REPLAY RECORDINGS METADATA ===')
        for (const m of metadataBlock) log(m)
        log('=== END REPLAY RECORDINGS METADATA ===')
      }

      const failedRecs = Object.values(recordings)
        .filter(r => r.result === 'failed' || r.result === 'timedOut')
        .sort((a, b) => b.duration - a.duration)

      if (failedRecs[0]) {
        try {
          const uploadOut = execSync(`npx replayio upload ${failedRecs[0].id}`, {
            encoding: 'utf-8',
            cwd: appDir,
            timeout: 60000,
            env: { ...process.env, RECORD_REPLAY_API_KEY: replayApiKey },
          })
          uploadedId = failedRecs[0].id
          log(`REPLAY UPLOADED: ${uploadedId}`)
          log(uploadOut)
        } catch (ue) {
          log(`Replay upload failed: ${ue}`)
        }
      }
    } catch { log('Could not parse recordings') }
  }

  // Step 10: Cleanup
  cleanup(branchId, neonProjectId, neonApiKey)
  tryExec('npx replayio remove --all 2>/dev/null || true', { stdio: 'ignore', cwd: appDir })

  writeLog()

  // Step 11: Summary
  const parts = []
  if (passed > 0) parts.push(`${passed} passed`)
  if (failed > 0) parts.push(`${failed} failed`)
  if (uploadedId) parts.push(`recording: ${uploadedId}`)
  const summary = parts.length > 0
    ? parts.join(', ') + ` — see ${logFile}`
    : `tests completed — see ${logFile}`
  console.log(summary)

  process.exit(playwrightExitCode)
}

function cleanup(branchId: string, projectId: string, apiKey: string) {
  tryExec('pkill -f "netlify dev" 2>/dev/null || true', { stdio: 'ignore' })
  if (branchId) {
    tryExec(
      `curl -s -X DELETE "https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}" -H "Authorization: Bearer ${apiKey}"`,
      { stdio: 'ignore', timeout: 10000 }
    )
  }
}

run()
