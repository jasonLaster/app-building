import { execSync } from 'child_process'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.js'
import { seedDatabase } from './seed-db.js'

const appDir = join(import.meta.dirname, '..')
const logsDir = join(appDir, 'logs')
const logFile = join(logsDir, 'deploy.log')
const envPath = join(appDir, '.env')
const deploymentTxtPath = join(appDir, 'deployment.txt')

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

function readDeploymentTxt(): Record<string, string> {
  if (!existsSync(deploymentTxtPath)) return {}
  const content = readFileSync(deploymentTxtPath, 'utf-8')
  const values: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue
    const match = trimmed.match(/^(\w+):\s*(.+)$/)
    if (match) {
      values[match[1]] = match[2].trim()
    }
  }
  return values
}

function populateEnvFromDeploymentTxt(): void {
  const deployed = readDeploymentTxt()
  const mappings: Record<string, string> = {
    site_id: 'NETLIFY_SITE_ID',
    neon_project_id: 'NEON_PROJECT_ID',
    database_url: 'DATABASE_URL',
  }
  const newEntries: string[] = []
  for (const [key, envKey] of Object.entries(mappings)) {
    if (deployed[key] && !process.env[envKey]) {
      process.env[envKey] = deployed[key]
      newEntries.push(`${envKey}=${deployed[key]}`)
    }
  }
  if (newEntries.length > 0) {
    const existing = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
    const suffix = existing.endsWith('\n') || existing === '' ? '' : '\n'
    writeFileSync(envPath, existing + suffix + newEntries.join('\n') + '\n')
  }
}

function setEnvValue(key: string, value: string): void {
  process.env[key] = value
  const existing = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
  const lines = existing.split('\n')
  let found = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx !== -1 && trimmed.slice(0, eqIdx).trim() === key) {
      lines[i] = `${key}=${value}`
      found = true
      break
    }
  }
  if (!found) {
    const suffix = existing.endsWith('\n') || existing === '' ? '' : '\n'
    writeFileSync(envPath, existing + suffix + `${key}=${value}\n`)
  } else {
    writeFileSync(envPath, lines.join('\n'))
  }
}

function appendLog(text: string): void {
  const existing = existsSync(logFile) ? readFileSync(logFile, 'utf-8') : ''
  writeFileSync(logFile, existing + text)
}

// ── Neon API ────────────────────────────────────────────────────────────────

interface NeonProjectResponse {
  project: { id: string }
  connection_uris: Array<{ connection_uri: string }>
}

async function createNeonProject(apiKey: string): Promise<{ projectId: string; databaseUrl: string }> {
  const res = await fetch('https://console.neon.tech/api/v2/projects', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      project: { name: `todo-app-${Date.now()}` },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Neon project creation failed (${res.status}): ${text}`)
  }
  const data = (await res.json()) as NeonProjectResponse
  return {
    projectId: data.project.id,
    databaseUrl: data.connection_uris[0].connection_uri,
  }
}

// ── Netlify helpers ─────────────────────────────────────────────────────────

function createNetlifySite(accountSlug: string): string {
  const output = execSync(
    `LC_ALL=C npx netlify sites:create --account-slug ${accountSlug} --json`,
    { cwd: appDir, encoding: 'utf-8', stdio: 'pipe' }
  )
  const parsed = JSON.parse(output)
  return parsed.id || parsed.site_id
}

function netlifyDeploy(): string {
  const output = execSync(
    'LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions --json',
    { cwd: appDir, encoding: 'utf-8', stdio: 'pipe', env: { ...process.env, LC_ALL: 'C' } }
  )
  const parsed = JSON.parse(output)
  return parsed.deploy_url || parsed.ssl_url || parsed.url || ''
}

// ── Deployment.txt management ───────────────────────────────────────────────

function updateDeploymentTxt(url: string, siteId: string, neonProjectId: string, databaseUrl: string): void {
  const resourceBlock = [
    `url: ${url}`,
    `site_id: ${siteId}`,
    `neon_project_id: ${neonProjectId}`,
    `database_url: ${databaseUrl}`,
  ].join('\n')

  if (existsSync(deploymentTxtPath)) {
    const content = readFileSync(deploymentTxtPath, 'utf-8')
    // Find where history entries start (after the resource block)
    const lines = content.split('\n')
    let historyStart = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('---')) {
        historyStart = i
        break
      }
    }
    if (historyStart >= 0) {
      const history = lines.slice(historyStart).join('\n')
      writeFileSync(deploymentTxtPath, resourceBlock + '\n' + history + '\n')
    } else {
      writeFileSync(deploymentTxtPath, resourceBlock + '\n')
    }
  } else {
    writeFileSync(deploymentTxtPath, resourceBlock + '\n')
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  mkdirSync(logsDir, { recursive: true })
  writeFileSync(logFile, '')

  loadDotEnv()
  populateEnvFromDeploymentTxt()

  const neonApiKey = getEnvVar('NEON_API_KEY')
  getEnvVar('NETLIFY_AUTH_TOKEN')
  const accountSlug = getEnvVar('NETLIFY_ACCOUNT_SLUG')

  let isFirstDeployment = false

  // ── Step 1: Database setup ──────────────────────────────────────────────
  let projectId = process.env.NEON_PROJECT_ID || ''
  let databaseUrl = process.env.DATABASE_URL || ''

  if (!projectId) {
    appendLog('=== Creating Neon project ===\n')
    try {
      const result = await createNeonProject(neonApiKey)
      projectId = result.projectId
      databaseUrl = result.databaseUrl
      setEnvValue('NEON_PROJECT_ID', projectId)
      setEnvValue('DATABASE_URL', databaseUrl)
      appendLog(`Created Neon project: ${projectId}\n`)
      isFirstDeployment = true
    } catch (err) {
      appendLog(`Neon project creation failed: ${err}\n`)
      console.log('Deploy failed (neon) — see logs/deploy.log')
      process.exit(1)
    }
  }

  // ── Step 2: Schema sync ─────────────────────────────────────────────────
  appendLog('=== Syncing database schema ===\n')
  try {
    await initSchema(databaseUrl)
    appendLog('Schema sync complete\n')
  } catch (err) {
    appendLog(`Schema sync failed: ${err}\n`)
    console.log('Deploy failed (schema) — see logs/deploy.log')
    process.exit(1)
  }

  // ── Step 3: Migrations ──────────────────────────────────────────────────
  const migrateScript = join(appDir, 'scripts', 'migrate-db.ts')
  if (existsSync(migrateScript)) {
    appendLog('=== Running migrations ===\n')
    try {
      const migrateOutput = execSync(`npx tsx ${migrateScript}`, {
        cwd: appDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      })
      appendLog(migrateOutput + '\n')
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string }
      appendLog('Migration failed:\n' + (err.stdout || '') + (err.stderr || '') + '\n')
      console.log('Deploy failed (migrate) — see logs/deploy.log')
      process.exit(1)
    }
  }

  // ── Step 4: Seed data (first deployment only) ───────────────────────────
  if (isFirstDeployment) {
    appendLog('=== Seeding database ===\n')
    try {
      await seedDatabase(databaseUrl)
      appendLog('Seed complete\n')
    } catch (err) {
      appendLog(`Seed failed: ${err}\n`)
      console.log('Deploy failed (seed) — see logs/deploy.log')
      process.exit(1)
    }
  }

  // ── Step 5: Netlify site setup ──────────────────────────────────────────
  let siteId = process.env.NETLIFY_SITE_ID || ''

  if (!siteId) {
    appendLog('=== Creating Netlify site ===\n')
    try {
      siteId = createNetlifySite(accountSlug)
      setEnvValue('NETLIFY_SITE_ID', siteId)
      appendLog(`Created Netlify site: ${siteId}\n`)
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string }
      appendLog('Netlify site creation failed:\n' + (err.stdout || '') + (err.stderr || '') + '\n')
      console.log('Deploy failed (netlify) — see logs/deploy.log')
      process.exit(1)
    }
  }

  // ── Step 6: Build ──────────────────────────────────────────────────────
  appendLog('=== Building app ===\n')
  try {
    const buildOutput = execSync('npx vite build', {
      cwd: appDir,
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    })
    appendLog(buildOutput + '\n')
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    appendLog('Build failed:\n' + (err.stdout || '') + (err.stderr || '') + '\n')
    console.log('Deploy failed (build) — see logs/deploy.log')
    process.exit(1)
  }

  // ── Step 7: Deploy to Netlify ──────────────────────────────────────────
  appendLog('=== Deploying to Netlify ===\n')
  let deployedUrl = ''
  try {
    deployedUrl = netlifyDeploy()
    appendLog(`Deployed to: ${deployedUrl}\n`)
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    appendLog('Netlify deploy failed:\n' + (err.stdout || '') + (err.stderr || '') + '\n')
    console.log('Deploy failed (netlify) — see logs/deploy.log')
    process.exit(1)
  }

  // ── Step 8: Update deployment.txt ──────────────────────────────────────
  updateDeploymentTxt(deployedUrl, siteId, projectId, databaseUrl)

  // ── Step 9: Summary ────────────────────────────────────────────────────
  console.log(`Deployed to ${deployedUrl}`)
}

main()
