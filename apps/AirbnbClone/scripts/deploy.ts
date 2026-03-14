import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema'
import { seedDatabase } from './seed-db'

const appDir = join(import.meta.dirname, '..')
const logDir = join(appDir, 'logs')
mkdirSync(logDir, { recursive: true })
const logFile = join(logDir, 'deploy.log')
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

function writeEnvValue(key: string, value: string) {
  const envPath = join(appDir, '.env')
  let content = ''
  if (existsSync(envPath)) {
    content = readFileSync(envPath, 'utf-8')
    const lines = content.split('\n')
    const idx = lines.findIndex(l => l.startsWith(key + '='))
    if (idx >= 0) {
      lines[idx] = `${key}=${value}`
      content = lines.join('\n')
    } else {
      content = content.trimEnd() + `\n${key}=${value}\n`
    }
  } else {
    content = `${key}=${value}\n`
  }
  writeFileSync(envPath, content)
}

async function deploy() {
  const neonApiKey = process.env['NEON_API_KEY'] || ''
  const netlifyToken = process.env['NETLIFY_AUTH_TOKEN'] || ''
  const netlifySlug = process.env['NETLIFY_ACCOUNT_SLUG'] || ''
  const env = readEnv()
  let isFirstDeploy = false

  // Step 1: Database setup
  let databaseUrl = env['DATABASE_URL'] || ''
  let neonProjectId = env['NEON_PROJECT_ID'] || ''

  if (!neonProjectId && neonApiKey) {
    try {
      const resp = execSync(
        `curl -s -X POST "https://console.neon.tech/api/v2/projects" -H "Authorization: Bearer ${neonApiKey}" -H "Content-Type: application/json" -d '{"project": {"name": "airbnb-clone"}}'`,
        { encoding: 'utf-8', timeout: 30000 }
      )
      const data = JSON.parse(resp)
      neonProjectId = data.project?.id || ''
      databaseUrl = data.connection_uris?.[0]?.connection_uri || ''
      if (neonProjectId) writeEnvValue('NEON_PROJECT_ID', neonProjectId)
      if (databaseUrl) writeEnvValue('DATABASE_URL', databaseUrl)
      log(`Created Neon project: ${neonProjectId}`)
      isFirstDeploy = true
    } catch (e) {
      log(`Neon project creation failed: ${e}`)
    }
  }

  // Step 2: Schema sync
  if (databaseUrl) {
    try {
      await initSchema(databaseUrl)
      log('Schema synced')
    } catch (e) {
      log(`Schema sync failed: ${e}`)
      writeLog()
      console.log('Deploy failed (schema) — see logs/deploy.log')
      process.exit(1)
    }

    // Step 4: Seed on first deploy
    if (isFirstDeploy) {
      try {
        await seedDatabase(databaseUrl)
        log('Database seeded')
      } catch (e) {
        log(`Seeding failed: ${e}`)
      }
    }
  }

  // Step 5: Netlify site setup
  let siteId = env['NETLIFY_SITE_ID'] || ''
  if (!siteId && netlifyToken && netlifySlug) {
    try {
      const siteResp = execSync(
        `LC_ALL=C npx netlify sites:create --account-slug ${netlifySlug} --name airbnb-clone-${Date.now()}`,
        {
          encoding: 'utf-8',
          cwd: appDir,
          timeout: 30000,
          env: { ...process.env, NETLIFY_AUTH_TOKEN: netlifyToken, LC_ALL: 'C' },
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      )
      log('Netlify site creation:\n' + siteResp)
      const siteIdMatch = siteResp.match(/Site ID:\s+([a-f0-9-]+)/i) || siteResp.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/)
      if (siteIdMatch?.[1]) {
        siteId = siteIdMatch[1]
        writeEnvValue('NETLIFY_SITE_ID', siteId)
      }
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string }
      log(`Netlify site creation failed: ${err.stdout || ''} ${err.stderr || ''}`)
    }
  }

  // Link site
  if (siteId) {
    try {
      execSync(`LC_ALL=C npx netlify link --id ${siteId}`, {
        cwd: appDir,
        stdio: 'ignore',
        timeout: 15000,
        env: { ...process.env, NETLIFY_AUTH_TOKEN: netlifyToken, LC_ALL: 'C' },
      })
    } catch { /* ok */ }
  }

  // Step 6: Build
  try {
    const buildOut = execSync('npx vite build', {
      cwd: appDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000,
    })
    log('=== Build ===\n' + buildOut)
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    log('=== Build ===\n' + (err.stdout || '') + '\n' + (err.stderr || ''))
    writeLog()
    console.log('Deploy failed (build) — see logs/deploy.log')
    process.exit(1)
  }

  // Step 7: Deploy
  if (siteId) {
    try {
      const deployOut = execSync(
        `LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${siteId}`,
        {
          cwd: appDir,
          encoding: 'utf-8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 120000,
          env: { ...process.env, NETLIFY_AUTH_TOKEN: netlifyToken, LC_ALL: 'C' },
        }
      )
      log('=== Deploy ===\n' + deployOut)

      // Extract URL
      const urlMatch = deployOut.match(/https:\/\/[^\s]+\.netlify\.app/)
      const deployedUrl = urlMatch?.[0] || 'unknown'

      // Step 8: Write deployment.txt
      const deploymentPath = join(appDir, 'deployment.txt')
      let existingHistory = ''
      if (existsSync(deploymentPath)) {
        const content = readFileSync(deploymentPath, 'utf-8')
        const historyIdx = content.indexOf('\n## Deployment History')
        if (historyIdx >= 0) {
          existingHistory = content.slice(historyIdx)
        }
      }
      const resourceBlock = `url=${deployedUrl}\nsite_id=${siteId}\nneon_project_id=${neonProjectId}\ndatabase_url=${databaseUrl}\n`
      writeFileSync(deploymentPath, resourceBlock + existingHistory)

      console.log(`Deployed to ${deployedUrl}`)
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string }
      log('=== Deploy ===\n' + (err.stdout || '') + '\n' + (err.stderr || ''))
      writeLog()
      console.log('Deploy failed (netlify) — see logs/deploy.log')
      process.exit(1)
    }
  } else {
    log('No NETLIFY_SITE_ID — skipping deploy')
    console.log('Build succeeded but no Netlify site configured')
  }

  writeLog()
}

deploy()
