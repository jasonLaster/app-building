import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.ts'
import { truncateAndSeed } from './seed-db.ts'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
mkdirSync(logDir, { recursive: true })
const logPath = join(logDir, 'deploy.log')
let logContent = ''
function log(msg: string) { logContent += msg + '\n' }

const envPath = join(appDir, '.env')
const deploymentPath = join(appDir, 'deployment.txt')

function readEnv(): Record<string, string> {
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

function writeEnvVar(key: string, value: string) {
  const content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
  const lines = content.split('\n')
  const idx = lines.findIndex(l => l.startsWith(key + '='))
  if (idx >= 0) {
    lines[idx] = `${key}=${value}`
  } else {
    lines.push(`${key}=${value}`)
  }
  writeFileSync(envPath, lines.join('\n'))
}

const NEON_API_KEY = (process.env.NEON_API_KEY || '').trim()
const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN || ''
const NETLIFY_ACCOUNT_SLUG = process.env.NETLIFY_ACCOUNT_SLUG || ''

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
  let env = readEnv()
  let isFirstDeploy = false

  // Step 1: Database setup
  if (!env.NEON_PROJECT_ID) {
    log('Creating Neon project...')
    const res = await neonApi('POST', '/projects', { project: { name: 'google-flights' } }) as {
      project?: { id: string };
      connection_uris?: { connection_uri: string }[];
    }
    const projectId = res.project?.id
    const dbUrl = res.connection_uris?.[0]?.connection_uri
    if (!projectId || !dbUrl) {
      log('Failed to create project: ' + JSON.stringify(res))
      writeFileSync(logPath, logContent)
      console.log('Deploy failed (neon) — see logs/deploy.log')
      process.exit(1)
    }
    writeEnvVar('NEON_PROJECT_ID', projectId)
    writeEnvVar('DATABASE_URL', dbUrl)
    env = readEnv()
    isFirstDeploy = true
    log(`Created Neon project: ${projectId}`)
  }

  // Step 2: Schema sync
  log('Syncing schema...')
  await initSchema(env.DATABASE_URL!)
  log('Schema synced')

  // Step 3: Seed on first deploy
  if (isFirstDeploy) {
    log('Seeding database (first deploy)...')
    await truncateAndSeed(env.DATABASE_URL!)
    log('Database seeded')
  }

  // Step 4: Netlify site setup
  if (!env.NETLIFY_SITE_ID) {
    log('Creating Netlify site...')
    try {
      const siteName = `google-flights-${Date.now()}`
      const output = execSync(
        `LC_ALL=C npx netlify sites:create --account-slug ${NETLIFY_ACCOUNT_SLUG} --name ${siteName}`,
        { cwd: appDir, env: { ...process.env, NETLIFY_AUTH_TOKEN }, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
      )
      log(output)
      // Extract site ID from output
      const siteIdMatch = output.match(/Site ID:\s+([a-f0-9-]+)/i) || output.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/)
      if (siteIdMatch?.[1]) {
        writeEnvVar('NETLIFY_SITE_ID', siteIdMatch[1])
        env = readEnv()
        log(`Created Netlify site: ${siteIdMatch[1]}`)
      }
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string }
      log('Site creation output: ' + (err.stdout || '') + (err.stderr || ''))
    }
  }

  // Ensure public/_redirects exists for SPA routing
  const publicDir = join(appDir, 'public')
  mkdirSync(publicDir, { recursive: true })
  writeFileSync(join(publicDir, '_redirects'), '/* /index.html 200\n')

  // Step 5: Build
  log('Building app...')
  try {
    const buildOutput = execSync('npx vite build', {
      cwd: appDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    })
    log('=== Build Output ===\n' + buildOutput)
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    log('=== Build Failed ===\n' + (err.stdout || '') + '\n' + (err.stderr || ''))
    writeFileSync(logPath, logContent)
    console.log('Deploy failed (build) — see logs/deploy.log')
    process.exit(1)
  }

  // Step 6: Deploy
  log('Deploying to Netlify...')
  const siteId = env.NETLIFY_SITE_ID || ''

  // Link site if needed
  if (siteId) {
    try {
      execSync(`LC_ALL=C npx netlify link --id ${siteId}`, {
        cwd: appDir,
        env: { ...process.env, NETLIFY_AUTH_TOKEN },
        stdio: 'ignore',
      })
    } catch { /* ignore */ }
  }

  let deployUrl = ''
  try {
    const deployOutput = execSync(
      `LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions${siteId ? ` --site ${siteId}` : ''}`,
      {
        cwd: appDir,
        env: { ...process.env, NETLIFY_AUTH_TOKEN },
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )
    log('=== Deploy Output ===\n' + deployOutput)
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+\.netlify\.app/)
    if (urlMatch) deployUrl = urlMatch[0]
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    log('=== Deploy Failed ===\n' + (err.stdout || '') + '\n' + (err.stderr || ''))
    writeFileSync(logPath, logContent)
    console.log('Deploy failed (netlify) — see logs/deploy.log')
    process.exit(1)
  }

  // Step 7: Write deployment.txt
  env = readEnv()
  const resourceBlock = `url=${deployUrl}
site_id=${env.NETLIFY_SITE_ID || siteId}
neon_project_id=${env.NEON_PROJECT_ID || ''}
database_url=${env.DATABASE_URL || ''}`

  let existingHistory = ''
  if (existsSync(deploymentPath)) {
    const existing = readFileSync(deploymentPath, 'utf-8')
    const historyIdx = existing.indexOf('\n---\n')
    if (historyIdx >= 0) existingHistory = existing.slice(historyIdx)
  }
  writeFileSync(deploymentPath, resourceBlock + '\n' + existingHistory)

  writeFileSync(logPath, logContent)
  console.log(`Deployed to ${deployUrl || 'Netlify'}`)
}

main().catch(e => {
  log(String(e))
  writeFileSync(logPath, logContent)
  console.error('Deploy failed — see logs/deploy.log')
  process.exit(1)
})
