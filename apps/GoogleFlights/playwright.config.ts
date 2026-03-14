import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/deployment.spec.ts'],
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  actionTimeout: 15000,
  navigationTimeout: 30000,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 8888 --strictPort',
    port: 8888,
    reuseExistingServer: true,
    timeout: 30000,
  },
})
