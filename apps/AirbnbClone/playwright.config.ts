import { PlaywrightTestConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'

const config: PlaywrightTestConfig = {
  testDir: './tests',
  testIgnore: ['**/deployment.spec.ts'],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    replayReporter({ upload: false }),
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never' }],
  ],
  use: {
    ...replayDevices['Replay Chromium'],
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    actionTimeout: 15000,
  },
  webServer: {
    command: 'npx netlify dev --offline --port 8888 --functions ./netlify/functions',
    port: 8888,
    timeout: 30000,
    reuseExistingServer: true,
  },
}

export default config
