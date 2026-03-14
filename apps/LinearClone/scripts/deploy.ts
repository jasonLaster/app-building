import { execSync } from 'child_process'
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { initSchema } from './schema.js'
import { seedDatabase } from './seed-db.js'

const appDir = join(import.meta.dirname, '..')
const logsDir = join(appDir, 'logs')
const envPath = join(appDir, '.env')
const logFile = join(logsDir, 'deploy.log')

mkdirSync(logsDir, { recursive: true })

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
    if (!process.env[key]) process.env[key] = value
  }
}

function getEnvVar(name: string): string {
  const val = process.env[name]
  if (!val) { console.error(`Missing required env var: ${name}`); process.exit(1) }
  return val
}

function appendEnv(key: string, value: string): void {
  const content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
  if (content.includes(`${key}=`)) {
    const updated = content.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`)
    writeFileSync(envPath, updated)
  } else {
    writeFileSync(envPath, content + (content.endsWith('\n') || content === '' ? '' : '\n') + `${key}=${value}\n`)
  }
  process.env[key] = value
}

async function neonApi(method: string, path: string, body?: unknown): Promise<unknown> {
  const apiKey = getEnvVar('NEON_API_KEY')
  const res = await fetch(`https://console.neon.tech/api/v2${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Neon API ${method} ${path} failed (${res.status}): ${await res.text()}`)
  const ct = res.headers.get('content-type')
  if (ct?.includes('application/json')) return res.json()
  return null
}

async function main(): Promise<void> {
  loadDotEnv()
  let output = ''
  let isFirstDeploy = false

  // Step 1: Database setup
  if (!process.env['NEON_PROJECT_ID']) {
    isFirstDeploy = true
    const data = await neonApi('POST', '/projects', { project: { name: 'linear-clone' } }) as {
      project: { id: string }
      connection_uris: Array<{ connection_uri: string }>
    }
    const projectId = data.project.id
    const dbUrl = data.connection_uris[0]?.connection_uri
    if (!dbUrl) throw new Error('No connection URI in project creation response')
    appendEnv('NEON_PROJECT_ID', projectId)
    appendEnv('DATABASE_URL', dbUrl)
    output += `Created Neon project: ${projectId}\n`
  }

  // Step 2: Schema sync
  const dbUrl = getEnvVar('DATABASE_URL')
  await initSchema(dbUrl)
  output += 'Schema synchronized\n'

  // Step 4: Seed on first deploy
  if (isFirstDeploy) {
    await seedDatabase(dbUrl)
    output += 'Database seeded\n'
  }

  // Step 5: Netlify site setup
  if (!process.env['NETLIFY_SITE_ID']) {
    const slug = getEnvVar('NETLIFY_ACCOUNT_SLUG')
    const siteName = `linear-clone-${Date.now()}`
    try {
      const createOutput = execSync(
        `LC_ALL=C npx netlify sites:create --account-slug ${slug} --name ${siteName}`,
        { cwd: appDir, encoding: 'utf-8', stdio: 'pipe' }
      )
      output += createOutput + '\n'
      // Extract site ID from output
      const siteIdMatch = createOutput.match(/Site ID:\s+([a-f0-9-]+)/i)
        || createOutput.match(/"site_id":\s*"([^"]+)"/)
        || createOutput.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/)
      if (siteIdMatch?.[1]) {
        appendEnv('NETLIFY_SITE_ID', siteIdMatch[1])
      } else {
        throw new Error('Could not extract site ID from netlify sites:create output')
      }
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string }
      output += (err.stdout || '') + (err.stderr || '') + '\n'
      writeFileSync(logFile, output)
      console.log('Deploy failed (netlify site creation) — see logs/deploy.log')
      process.exit(1)
    }
  }

  const siteId = getEnvVar('NETLIFY_SITE_ID')

  // Link site
  try {
    execSync(`npx netlify link --id ${siteId}`, { cwd: appDir, stdio: 'pipe' })
  } catch { /* may already be linked */ }

  // Step 6: Build
  try {
    const buildOutput = execSync('npx vite build', { cwd: appDir, encoding: 'utf-8', stdio: 'pipe' })
    output += '=== Build ===\n' + buildOutput + '\n'
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    output += '=== Build ===\n' + (err.stdout || '') + (err.stderr || '') + '\n'
    writeFileSync(logFile, output)
    console.log('Deploy failed (build) — see logs/deploy.log')
    process.exit(1)
  }

  // Step 7: Deploy
  try {
    const deployOutput = execSync(
      `LC_ALL=C npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${siteId}`,
      { cwd: appDir, encoding: 'utf-8', stdio: 'pipe' }
    )
    output += '=== Deploy ===\n' + deployOutput + '\n'

    // Extract URL
    const urlMatch = deployOutput.match(/Website URL:\s+(https?:\/\/\S+)/i)
      || deployOutput.match(/(https:\/\/[^\s]+\.netlify\.app)/i)
    const deployedUrl = urlMatch?.[1] || 'unknown'

    // Step 8: Write deployment.txt
    const deploymentInfo = `url=${deployedUrl}\nsite_id=${siteId}\nneon_project_id=${getEnvVar('NEON_PROJECT_ID')}\ndatabase_url=${dbUrl}\n`
    const deploymentPath = join(appDir, 'deployment.txt')
    const existingDeployment = existsSync(deploymentPath) ? readFileSync(deploymentPath, 'utf-8') : ''
    const historyStart = existingDeployment.indexOf('\n---')
    const history = historyStart >= 0 ? existingDeployment.slice(historyStart) : ''
    writeFileSync(deploymentPath, deploymentInfo + history)

    writeFileSync(logFile, output)
    console.log(`Deployed to ${deployedUrl}`)
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string }
    output += '=== Deploy ===\n' + (err.stdout || '') + (err.stderr || '') + '\n'
    writeFileSync(logFile, output)
    console.log('Deploy failed (netlify) — see logs/deploy.log')
    process.exit(1)
  }
}

main()
