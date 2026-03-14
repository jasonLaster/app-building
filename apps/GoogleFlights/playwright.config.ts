import { defineConfig, devices } from '@playwright/test'
import { getExecutablePath } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/deployment.spec.ts'],
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: getExecutablePath('chromium'),
    },
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx netlify dev --port 8888 --functions ./netlify/functions',
    port: 8888,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
