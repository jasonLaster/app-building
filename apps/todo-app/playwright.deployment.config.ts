import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { ReporterDescription } from '@playwright/test'

const _dirname = dirname(fileURLToPath(import.meta.url))

function getDeployedUrl(): string {
  const deploymentTxt = readFileSync(join(_dirname, 'deployment.txt'), 'utf-8')
  for (const line of deploymentTxt.split('\n')) {
    const match = line.match(/^url:\s*(.+)$/)
    if (match) return match[1].trim()
  }
  throw new Error('Could not find deployed URL in deployment.txt')
}

let replayReporterConfig: ReporterDescription[] = []
let replayDeviceConfig = {}
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { replayReporter, devices: replayDevices } = require('@replayio/playwright')
  const replayApiKey = process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY
  if (replayApiKey) {
    replayReporterConfig = [
      replayReporter({
        apiKey: replayApiKey,
        upload: true,
      }),
    ]
    replayDeviceConfig = replayDevices['Replay Chromium'] ?? {}
  }
} catch {
  // Replay not available
}

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  fullyParallel: false,
  retries: 0,
  timeout: 60000,
  actionTimeout: 15000,
  navigationTimeout: 30000,
  reporter: [...replayReporterConfig, ['list']],
  use: {
    baseURL: getDeployedUrl(),
    ...devices['Desktop Chrome'],
    ...replayDeviceConfig,
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...replayDeviceConfig },
    },
  ],
})
