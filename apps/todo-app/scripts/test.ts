import { execSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { initSchema } from './schema.js';

const NEON_API_KEY = process.env.NEON_API_KEY;
const RECORD_REPLAY_API_KEY = process.env.RECORD_REPLAY_API_KEY;

// Read .env file for project config
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = readFileSync('.env', 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  } catch {
    // .env may not exist
  }
  return env;
}

const dotenv = loadEnv();
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID || dotenv.NEON_PROJECT_ID;
const MAIN_DATABASE_URL = process.env.DATABASE_URL || dotenv.DATABASE_URL;

if (!NEON_API_KEY) {
  console.error('NEON_API_KEY is required');
  process.exit(1);
}
if (!RECORD_REPLAY_API_KEY) {
  console.error('RECORD_REPLAY_API_KEY is required');
  process.exit(1);
}
if (!NEON_PROJECT_ID) {
  console.error('NEON_PROJECT_ID is required');
  process.exit(1);
}
if (!MAIN_DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const testFile = process.argv[2];
if (!testFile) {
  console.error('Usage: npm run test <testFile>');
  process.exit(1);
}

const runId = `test-worker-${Date.now()}`;

// Neon API helpers
async function neonApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`https://console.neon.tech/api/v2${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NEON_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neon API ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function listBranches(): Promise<{ branches: Array<{ id: string; name: string }> }> {
  return neonApi(`/projects/${NEON_PROJECT_ID}/branches`);
}

async function deleteBranch(branchId: string) {
  return neonApi(`/projects/${NEON_PROJECT_ID}/branches/${branchId}`, { method: 'DELETE' });
}

async function createBranch(name: string): Promise<{
  branch: { id: string };
  connection_uris: Array<{ connection_uri: string }>;
}> {
  return neonApi(`/projects/${NEON_PROJECT_ID}/branches`, {
    method: 'POST',
    body: JSON.stringify({
      branch: { name },
      endpoints: [{ type: 'read_write' }],
    }),
  });
}

function getNextLogNumber(): number {
  mkdirSync('logs', { recursive: true });
  const files = readdirSync('logs').filter(f => /^test-run-\d+\.log$/.test(f));
  const nums = files.map(f => parseInt(f.match(/test-run-(\d+)/)?.[1] || '0'));
  return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

// Parse recordings.log
interface RecordingEntry {
  id: string;
  kind: string;
  timestamp?: number;
  metadata?: {
    test?: {
      result?: string;
      title?: string;
      file?: string;
    };
    uri?: string;
  };
  buildId?: string;
  duration?: number;
  recordingStatus?: string;
}

function parseRecordingsLog(): Map<string, RecordingEntry> {
  const recordings = new Map<string, RecordingEntry>();
  try {
    const logPath = `${process.env.HOME}/.replay/recordings.log`;
    const content = readFileSync(logPath, 'utf-8');
    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.kind === 'createRecording' && entry.id) {
          recordings.set(entry.id, { ...entry, metadata: {} });
        } else if (entry.kind === 'addMetadata' && entry.id) {
          const existing = recordings.get(entry.id);
          if (existing) {
            existing.metadata = { ...existing.metadata, ...entry.metadata };
          }
        } else if (entry.kind === 'writeFinished' && entry.id) {
          const existing = recordings.get(entry.id);
          if (existing) {
            existing.recordingStatus = 'finished';
            if (entry.duration) existing.duration = entry.duration;
          }
        }
      } catch {
        // skip malformed lines
      }
    }
  } catch {
    // recordings.log may not exist
  }
  return recordings;
}

async function main() {
  const logNum = getNextLogNumber();
  const logFile = `logs/test-run-${logNum}.log`;

  // 1. Kill stale processes
  try { execSync('pkill -f "netlify" 2>/dev/null || true', { stdio: 'ignore' }); } catch {}
  try { execSync('pkill -f "vite" 2>/dev/null || true', { stdio: 'ignore' }); } catch {}

  // Wait for processes to die
  await new Promise(r => setTimeout(r, 1000));

  // 2. Clean up stale Neon branches
  const NUM_WORKERS = 2;
  const workerBranches: { id: string; dbUrl: string }[] = [];
  try {
    const { branches } = await listBranches();
    for (const b of branches) {
      if (b.name.startsWith('test-worker-')) {
        try {
          await deleteBranch(b.id);
        } catch {
          // ignore cleanup failures
        }
      }
    }
  } catch (e) {
    console.error('Warning: failed to clean stale branches:', e);
  }

  // 3. Create per-worker ephemeral Neon branches
  try {
    for (let i = 0; i < NUM_WORKERS; i++) {
      const result = await createBranch(`${runId}-w${i}`);
      const dbUrl = result.connection_uris[0].connection_uri;
      workerBranches.push({ id: result.branch.id, dbUrl });
      await initSchema(dbUrl);

      // Run migrations if migrate-db.ts exists (same pattern as deploy.ts)
      if (existsSync('scripts/migrate-db.ts')) {
        execSync('npx tsx scripts/migrate-db.ts', {
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: dbUrl },
        });
      }
    }
  } catch (e) {
    console.error('Failed to create Neon branches:', e);
    // Clean up any branches we already created
    for (const b of workerBranches) {
      try { await deleteBranch(b.id); } catch {}
    }
    process.exit(1);
  }

  let playwrightExitCode = 1;

  try {
    // 4. Remove stale recordings
    try { execSync('npx replayio remove --all', { stdio: 'ignore' }); } catch {}

    // 5. Build per-worker DATABASE_URL env vars
    const workerEnv: Record<string, string> = {
      ...process.env as Record<string, string>,
      DATABASE_URL: workerBranches[0].dbUrl,
    };
    for (let i = 0; i < NUM_WORKERS; i++) {
      workerEnv[`DATABASE_URL_W${i}`] = workerBranches[i].dbUrl;
    }

    // 6. Run Playwright (webServer managed by Playwright config; per-worker DB via cookies)
    const result = spawnSync(
      'npx',
      ['playwright', 'test', testFile, '--retries', '0'],
      {
        env: workerEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 1200000, // 20 minute overall timeout
      }
    );

    const stdout = result.stdout?.toString() || '';
    const stderr = result.stderr?.toString() || '';
    const logContent = `=== PLAYWRIGHT OUTPUT ===\n${stdout}\n=== STDERR ===\n${stderr}\n`;
    writeFileSync(logFile, logContent);

    playwrightExitCode = result.status ?? 1;

    // 7. Parse results
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    try {
      const results = JSON.parse(readFileSync('test-results/results.json', 'utf-8'));
      for (const suite of results.suites || []) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            if (test.status === 'expected') passed++;
            else if (test.status === 'unexpected') failed++;
            else if (test.status === 'skipped') skipped++;
          }
        }
      }
    } catch {
      // If JSON results not available, try to parse from stdout
      const passMatch = stdout.match(/(\d+) passed/);
      const failMatch = stdout.match(/(\d+) failed/);
      if (passMatch) passed = parseInt(passMatch[1]);
      if (failMatch) failed = parseInt(failMatch[1]);
    }

    // 8. On failure, upload recordings
    let uploadedId = '';
    if (playwrightExitCode !== 0) {
      const recordings = parseRecordingsLog();
      const metadataEntries: string[] = [];

      // Find recordings with test metadata
      let bestRecording: { id: string; duration: number } | null = null;
      for (const [id, rec] of recordings) {
        if (rec.metadata?.test) {
          metadataEntries.push(JSON.stringify({
            id,
            testResult: rec.metadata.test.result,
            testTitle: rec.metadata.test.title,
            specFile: rec.metadata.test.file,
          }));
        }
        if (
          rec.recordingStatus === 'finished' &&
          (rec.metadata?.test?.result === 'failed' || rec.metadata?.test?.result === 'timedOut') &&
          (rec.duration || 0) > (bestRecording?.duration || 0)
        ) {
          bestRecording = { id, duration: rec.duration || 0 };
        }
      }

      // Append metadata block to log
      if (metadataEntries.length > 0) {
        const metaBlock = `\n=== REPLAY RECORDINGS METADATA ===\n${metadataEntries.join('\n')}\n=== END REPLAY RECORDINGS METADATA ===\n`;
        writeFileSync(logFile, readFileSync(logFile, 'utf-8') + metaBlock);
      }

      // Upload the best recording
      if (bestRecording) {
        try {
          const uploadResult = spawnSync('npx', ['replayio', 'upload', bestRecording.id], {
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 120000,
          });
          const uploadOut = uploadResult.stdout?.toString() || '';
          if (uploadResult.status === 0) {
            uploadedId = bestRecording.id;
            writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOADED: ${uploadedId}\n`);
          } else {
            writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOAD FAILED (exit ${uploadResult.status}): ${uploadOut}\n`);
          }
        } catch (e) {
          writeFileSync(logFile, readFileSync(logFile, 'utf-8') + `\nREPLAY UPLOAD ERROR: ${e}\n`);
        }
      }
    }

    // 10. Print summary
    const parts = [];
    if (passed > 0) parts.push(`${passed} passed`);
    if (failed > 0) parts.push(`${failed} failed`);
    if (skipped > 0) parts.push(`${skipped} skipped`);
    let summary = parts.join(', ') || '0 passed';
    if (uploadedId) summary += ` (recording: ${uploadedId})`;
    summary += ` — see ${logFile}`;
    console.log(summary);

  } finally {
    // 9. Clean up branches and recordings
    for (const b of workerBranches) {
      try { await deleteBranch(b.id); } catch {}
    }
    try { execSync('npx replayio remove --all', { stdio: 'ignore' }); } catch {}
  }

  process.exit(playwrightExitCode);
}

main().catch((e) => {
  console.error('Test script error:', e);
  process.exit(1);
});
