import { execSync, spawn } from 'child_process'
import { writeFileSync, readFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.js'
import { seedDatabase, resetDatabase } from './seed-db.js'

const appDir = join(import.meta.dirname, '..')
const logsDir = join(appDir, 'logs')

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    .map(f => parseInt(f.match(/test-run-(\d+)\.log/)![1], 10))
  return existing.length > 0 ? Math.max(...existing) + 1 : 1
}

function killStaleProcesses(): void {
  try {
    execSync("pkill -f 'netlify dev' || true", { stdio: 'ignore' })
  } catch { /* ignore */ }
  try {
    execSync("pkill -f 'vite' || true", { stdio: 'ignore' })
  } catch { /* ignore */ }
  // Give processes time to exit
  execSync('sleep 1', { stdio: 'ignore' })
}

// ── Neon API helpers ─────────────────────────────────────────────────────────

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
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json()
  }
  return null
}

interface NeonBranch {
  id: string
  name: string
}

interface NeonBranchListResponse {
  branches: NeonBranch[]
}

interface NeonEndpoint {
  host: string
}

interface NeonEndpointsResponse {
  endpoints: NeonEndpoint[]
}

interface NeonBranchCreateResponse {
  branch: NeonBranch
  endpoints: NeonEndpoint[]
}

async function cleanupStaleBranches(projectId: string): Promise<void> {
  const data = await neonApi('GET', `/projects/${projectId}/branches`) as NeonBranchListResponse
  const staleBranches = data.branches.filter((b: NeonBranch) => b.name.startsWith('test-run-'))
  for (const branch of staleBranches) {
    try {
      await neonApi('DELETE', `/projects/${projectId}/branches/${branch.id}`)
    } catch {
      // Best effort cleanup
    }
  }
}

async function createEphemeralBranch(projectId: string, branchName: string): Promise<string> {
  const data = await neonApi('POST', `/projects/${projectId}/branches`, {
    branch: { name: branchName },
    endpoints: [{ type: 'read_write' }],
  }) as NeonBranchCreateResponse

  const host = data.endpoints[0]?.host
  if (!host) {
    // Fetch endpoints separately
    const epData = await neonApi('GET', `/projects/${projectId}/branches/${data.branch.id}/endpoints`) as NeonEndpointsResponse
    if (!epData.endpoints[0]?.host) {
      throw new Error('No endpoint created for ephemeral branch')
    }
    return buildConnectionString(epData.endpoints[0].host)
  }
  return buildConnectionString(host)
}

function buildConnectionString(host: string): string {
  const mainDbUrl = getEnvVar('DATABASE_URL')
  const url = new URL(mainDbUrl)
  url.hostname = host
  return url.toString()
}

async function deleteBranch(projectId: string, branchName: string): Promise<void> {
  const data = await neonApi('GET', `/projects/${projectId}/branches`) as NeonBranchListResponse
  const branch = data.branches.find((b: NeonBranch) => b.name === branchName)
  if (branch) {
    await neonApi('DELETE', `/projects/${projectId}/branches/${branch.id}`)
  }
}

// ── Replay recordings parser ─────────────────────────────────────────────────

interface RecordingEntry {
  id?: string
  kind: string
  timestamp?: string
  metadata?: {
    test?: {
      result?: string
      title?: string
    }
    uri?: string
  }
  duration?: number
}

interface ParsedRecording {
  id: string
  testResult: string
  testTitle: string
  specFile: string
  duration: number
}

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
      if (entry.kind === 'createRecording' && entry.id) {
        recordings.set(entry.id, { id: entry.id, duration: 0 })
      }
      if (entry.kind === 'writeFinished' && entry.id) {
        const rec = recordings.get(entry.id)
        if (rec && entry.duration) {
          rec.duration = entry.duration
        }
      }
      if (entry.kind === 'addMetadata' && entry.id && entry.metadata?.test) {
        metadata.set(entry.id, {
          testResult: entry.metadata.test.result || 'unknown',
          testTitle: entry.metadata.test.title || '',
          specFile: entry.metadata.uri || '',
        })
      }
    } catch {
      // Skip malformed lines
    }
  }

  const results: ParsedRecording[] = []
  for (const [id, rec] of recordings) {
    const meta = metadata.get(id)
    if (meta) {
      results.push({
        id,
        testResult: meta.testResult,
        testTitle: meta.testTitle,
        specFile: meta.specFile,
        duration: rec.duration,
      })
    }
  }
  return results
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  loadDotEnv()

  const testFile = process.argv[2]
  if (!testFile) {
    console.error('Usage: npm run test <testFile>')
    process.exit(1)
  }

  const neonApiKey = getEnvVar('NEON_API_KEY')
  const projectId = getEnvVar('NEON_PROJECT_ID')
  // Ensure DATABASE_URL is available (needed for building connection strings)
  getEnvVar('DATABASE_URL')
  // Suppress unused variable warning
  void neonApiKey

  const logNum = getNextLogNumber()
  const logFile = join(logsDir, `test-run-${logNum}.log`)
  const branchName = `test-run-${Date.now()}`
  let playwrightExitCode = 1
  let ephemeralDbUrl = ''

  // Step 1: Kill stale processes
  killStaleProcesses()

  // Step 2: Clean up stale Neon branches
  await cleanupStaleBranches(projectId)

  // Step 3: Create ephemeral Neon branch
  try {
    ephemeralDbUrl = await createEphemeralBranch(projectId, branchName)
  } catch (err) {
    console.error(`Failed to create ephemeral branch: ${err}`)
    process.exit(1)
  }

  try {
    // Step 4: Initialize schema and seed
    await initSchema(ephemeralDbUrl)
    await seedDatabase(ephemeralDbUrl)

    // Step 5: Start netlify dev
    const netlifyDev = spawn('netlify', ['dev', '--port', '8888'], {
      cwd: appDir,
      env: { ...process.env, DATABASE_URL: ephemeralDbUrl },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    })

    // Wait for netlify dev to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('netlify dev failed to start within 60 seconds'))
      }, 60000)

      let output = ''
      const checkReady = (data: Buffer) => {
        output += data.toString()
        if (output.includes('Server ready') || output.includes('ready on') || output.includes('localhost:8888')) {
          clearTimeout(timeout)
          resolve()
        }
      }

      netlifyDev.stdout?.on('data', checkReady)
      netlifyDev.stderr?.on('data', checkReady)

      netlifyDev.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })

      netlifyDev.on('exit', (code) => {
        if (code !== null && code !== 0) {
          clearTimeout(timeout)
          reject(new Error(`netlify dev exited with code ${code}\n${output}`))
        }
      })
    })

    // Step 6: Remove stale recordings
    try {
      execSync('npx replayio remove --all', { cwd: appDir, stdio: 'ignore' })
    } catch { /* ignore */ }

    // Step 7: Run Playwright
    // Reset database before running (ensures clean state)
    await resetDatabase(ephemeralDbUrl)

    try {
      const pwOutput = execSync(
        `npx playwright test ${testFile} --retries 0 --workers 1`,
        {
          cwd: appDir,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: {
            ...process.env,
            DATABASE_URL: ephemeralDbUrl,
            TEST_DATABASE_URL: ephemeralDbUrl,
            BASE_URL: 'http://localhost:8888',
          },
          timeout: 300000,
        }
      )
      writeFileSync(logFile, pwOutput)
      playwrightExitCode = 0
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; status?: number }
      const output = (err.stdout || '') + '\n' + (err.stderr || '')
      writeFileSync(logFile, output)
      playwrightExitCode = err.status || 1
    }

    // Step 8: Parse results
    let passed = 0
    let failed = 0
    let skipped = 0
    const resultsPath = join(appDir, 'test-results', 'results.json')
    if (existsSync(resultsPath)) {
      try {
        const resultsJson = JSON.parse(readFileSync(resultsPath, 'utf-8'))
        for (const suite of resultsJson.suites || []) {
          for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
              if (test.status === 'expected' || test.status === 'passed') passed++
              else if (test.status === 'unexpected' || test.status === 'failed') failed++
              else if (test.status === 'skipped') skipped++
            }
          }
        }
      } catch {
        // If results.json is malformed, we'll just use exit code
      }
    }

    // Step 9: On failure, handle recordings
    let uploadedRecordingId = ''
    if (playwrightExitCode !== 0) {
      const recordings = parseRecordingsLog()

      // Append metadata to log
      if (recordings.length > 0) {
        let metadataBlock = '\n=== REPLAY RECORDINGS METADATA ===\n'
        for (const rec of recordings) {
          metadataBlock += JSON.stringify({
            id: rec.id,
            testResult: rec.testResult,
            testTitle: rec.testTitle,
            specFile: rec.specFile,
          }) + '\n'
        }
        metadataBlock += '=== END REPLAY RECORDINGS METADATA ===\n'
        writeFileSync(logFile, readFileSync(logFile, 'utf-8') + metadataBlock)
      }

      // Find the longest-duration failed recording
      const failedRecordings = recordings
        .filter(r => r.testResult === 'failed' || r.testResult === 'timedOut')
        .sort((a, b) => b.duration - a.duration)

      if (failedRecordings.length > 0) {
        const toUpload = failedRecordings[0]
        try {
          execSync(`npx replayio upload ${toUpload.id}`, {
            cwd: appDir,
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 120000,
          })
          uploadedRecordingId = toUpload.id
          writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOADED: ${uploadedRecordingId}\n`)
        } catch (e: unknown) {
          const err = e as { status?: number }
          writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOAD FAILED (exit code ${err.status || 'unknown'})\n`)
        }
      }
    }

    // Step 10: Cleanup - stop netlify dev
    try {
      if (netlifyDev.pid) {
        process.kill(-netlifyDev.pid, 'SIGTERM')
      }
    } catch { /* ignore */ }

    // Step 11: Print summary
    const parts: string[] = []
    if (passed > 0) parts.push(`${passed} passed`)
    if (failed > 0) parts.push(`${failed} failed`)
    if (skipped > 0) parts.push(`${skipped} skipped`)

    let summary = parts.length > 0 ? parts.join(', ') : (playwrightExitCode === 0 ? 'all passed' : 'tests failed')
    if (uploadedRecordingId) {
      summary += ` (recording: ${uploadedRecordingId})`
    }
    if (playwrightExitCode !== 0) {
      summary += ` — see logs/test-run-${logNum}.log`
    }
    console.log(summary)

  } finally {
    // Step 10 continued: Delete ephemeral branch and clean recordings
    try {
      await deleteBranch(projectId, branchName)
    } catch { /* ignore */ }

    try {
      execSync('npx replayio remove --all', { cwd: appDir, stdio: 'ignore' })
    } catch { /* ignore */ }

    // Kill any leftover netlify dev
    killStaleProcesses()
  }

  // Step 12: Exit with Playwright's exit code
  process.exit(playwrightExitCode)
}

main()
