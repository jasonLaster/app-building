import { PlaywrightTestConfig, devices } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'
import { existsSync } from 'fs'
import { arch } from 'os'

const replayDevice = replayDevices['Replay Chromium']
const replayExePath = replayDevice?.launchOptions?.executablePath
const useReplay = !!replayExePath && existsSync(replayExePath) && arch() === 'x64'

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
    ...(useReplay ? [replayReporter({ upload: false })] : []),
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never' }],
  ],
  use: {
    ...(useReplay ? replayDevice : devices['Desktop Chrome']),
    baseURL: 'http://localhost:8888',
    trace: 'on-first-retry',
    actionTimeout: 15000,
  },
  webServer: {
    command: 'PATH=/tmp/fake-deno:$PATH npx netlify dev --offline --port 8888 --functions ./netlify/functions',
    port: 8888,
    timeout: 120000,
    reuseExistingServer: true,
  },
}

export default config
