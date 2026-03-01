import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { initSchema } from './schema.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.log(`Deploy failed — missing ${name}`);
    process.exit(1);
  }
  return val;
}

function readEnvFile(): Record<string, string> {
  if (!existsSync('.env')) return {};
  const lines = readFileSync('.env', 'utf-8').split('\n');
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

function writeEnvValue(key: string, value: string): void {
  const env = readEnvFile();
  env[key] = value;
  const content = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
  writeFileSync('.env', content);
}

function appendLog(text: string): void {
  writeFileSync('logs/deploy.log', text, { flag: 'a' });
}

function readDeploymentTxt(): Record<string, string> {
  if (!existsSync('deployment.txt')) return {};
  const content = readFileSync('deployment.txt', 'utf-8');
  const values: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) break;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && val) values[key] = val;
  }
  return values;
}

function writeResourceBlock(values: Record<string, string>): void {
  const block = Object.entries(values)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  if (!existsSync('deployment.txt')) {
    writeFileSync('deployment.txt', block + '\n');
    return;
  }

  const content = readFileSync('deployment.txt', 'utf-8');
  // Find where the resource block ends (first blank line or --- separator)
  const lines = content.split('\n');
  let endIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('---')) {
      endIdx = i;
      break;
    }
    endIdx = i + 1;
  }
  const rest = lines.slice(endIdx).join('\n');
  writeFileSync('deployment.txt', block + '\n' + rest);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  mkdirSync('logs', { recursive: true });
  writeFileSync('logs/deploy.log', '');

  const neonApiKey = requireEnv('NEON_API_KEY');
  const netlifyToken = requireEnv('NETLIFY_AUTH_TOKEN');
  const netlifySlug = requireEnv('NETLIFY_ACCOUNT_SLUG');

  // Populate .env from deployment.txt if values are missing
  const deploymentValues = readDeploymentTxt();
  const envValues = readEnvFile();

  if (!envValues.NETLIFY_SITE_ID && deploymentValues.site_id) {
    writeEnvValue('NETLIFY_SITE_ID', deploymentValues.site_id);
  }
  if (!envValues.NEON_PROJECT_ID && deploymentValues.neon_project_id) {
    writeEnvValue('NEON_PROJECT_ID', deploymentValues.neon_project_id);
  }
  if (!envValues.DATABASE_URL && deploymentValues.database_url) {
    writeEnvValue('DATABASE_URL', deploymentValues.database_url);
  }

  // Re-read after potential writes
  let env = readEnvFile();

  // -------------------------------------------------------------------------
  // 1. Database setup
  // -------------------------------------------------------------------------
  if (!env.NEON_PROJECT_ID) {
    appendLog('=== Creating Neon project ===\n');
    try {
      const resp = await fetch('https://console.neon.tech/api/v2/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${neonApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: { name: 'todo-app' },
        }),
      });
      if (!resp.ok) {
        const body = await resp.text();
        appendLog(`Neon API error: ${resp.status} ${body}\n`);
        console.log('Deploy failed (neon) — see logs/deploy.log');
        process.exit(1);
      }
      const data = await resp.json() as {
        project: { id: string };
        connection_uris: Array<{ connection_uri: string }>;
      };
      const projectId = data.project.id;
      const dbUrl = data.connection_uris[0].connection_uri;
      writeEnvValue('NEON_PROJECT_ID', projectId);
      writeEnvValue('DATABASE_URL', dbUrl);
      appendLog(`Created Neon project ${projectId}\n`);
    } catch (err) {
      appendLog(`Neon API error: ${String(err)}\n`);
      console.log('Deploy failed (neon) — see logs/deploy.log');
      process.exit(1);
    }
  }

  env = readEnvFile();
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    appendLog('DATABASE_URL not set after Neon setup\n');
    console.log('Deploy failed (neon) — see logs/deploy.log');
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // 2. Database schema sync
  // -------------------------------------------------------------------------
  appendLog('=== Schema sync ===\n');
  try {
    await initSchema(databaseUrl);
    appendLog('Schema sync complete\n');
  } catch (err) {
    appendLog(`Schema sync error: ${String(err)}\n`);
    console.log('Deploy failed (schema) — see logs/deploy.log');
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // 3. Migrations
  // -------------------------------------------------------------------------
  if (existsSync('scripts/migrate-db.ts')) {
    appendLog('=== Running migrations ===\n');
    try {
      const migrateOut = execSync(`npx tsx scripts/migrate-db.ts`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
      appendLog(migrateOut + '\n');
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string };
      appendLog('Migration error:\n' + (err.stdout || '') + (err.stderr || '') + '\n');
      console.log('Deploy failed (migrations) — see logs/deploy.log');
      process.exit(1);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Netlify site setup
  // -------------------------------------------------------------------------
  if (!env.NETLIFY_SITE_ID) {
    appendLog('=== Creating Netlify site ===\n');
    try {
      const resp = await fetch(`https://api.netlify.com/api/v1/${netlifySlug}/sites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (!resp.ok) {
        const body = await resp.text();
        appendLog(`Netlify API error: ${resp.status} ${body}\n`);
        console.log('Deploy failed (netlify) — see logs/deploy.log');
        process.exit(1);
      }
      const site = await resp.json() as { id: string };
      writeEnvValue('NETLIFY_SITE_ID', site.id);
      appendLog(`Created Netlify site ${site.id}\n`);
    } catch (err) {
      appendLog(`Netlify API error: ${String(err)}\n`);
      console.log('Deploy failed (netlify) — see logs/deploy.log');
      process.exit(1);
    }
  }

  env = readEnvFile();
  const siteId = env.NETLIFY_SITE_ID;

  // -------------------------------------------------------------------------
  // 5. Build
  // -------------------------------------------------------------------------
  appendLog('=== Build ===\n');
  try {
    const buildOut = execSync('npx vite build', {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    appendLog(buildOut + '\n');
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    appendLog('Build error:\n' + (err.stdout || '') + (err.stderr || '') + '\n');
    console.log('Deploy failed (build) — see logs/deploy.log');
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // 6. Deploy
  // -------------------------------------------------------------------------
  appendLog('=== Deploy ===\n');
  let deployedUrl = '';
  try {
    const deployOut = execSync(
      `npx netlify deploy --prod --dir dist --functions ./netlify/functions --site ${siteId} --json`,
      {
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
          ...process.env,
          NETLIFY_AUTH_TOKEN: netlifyToken,
          DATABASE_URL: databaseUrl,
        },
      },
    );
    appendLog(deployOut + '\n');
    const result = JSON.parse(deployOut) as { ssl_url?: string; url?: string };
    deployedUrl = result.ssl_url || result.url || '';
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    appendLog('Deploy error:\n' + (err.stdout || '') + (err.stderr || '') + '\n');
    console.log('Deploy failed (netlify) — see logs/deploy.log');
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // 7. Update deployment.txt
  // -------------------------------------------------------------------------
  writeResourceBlock({
    url: deployedUrl,
    site_id: siteId || '',
    neon_project_id: env.NEON_PROJECT_ID || '',
    database_url: databaseUrl,
  });

  console.log(`Deployed to ${deployedUrl}`);
}

main();
