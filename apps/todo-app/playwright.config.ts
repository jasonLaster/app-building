import { defineConfig, devices } from '@playwright/test'
import type { ReporterDescription } from '@playwright/test'

let replayReporterConfig: ReporterDescription[] = []
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { replayReporter } = require('@replayio/playwright')
  replayReporterConfig = [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: false,
    }),
  ]
} catch {
  // Replay not available
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  actionTimeout: 15000,
  navigationTimeout: 30000,
  reporter: [
    ...replayReporterConfig,
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8888',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
