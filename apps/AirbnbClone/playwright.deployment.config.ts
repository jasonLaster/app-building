import { PlaywrightTestConfig } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'
import { readFileSync } from 'fs'

function getDeployedUrl(): string {
  const content = readFileSync('deployment.txt', 'utf-8')
  const match = content.match(/url=(.+)/)
  return match?.[1]?.trim() || ''
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  testMatch: '**/deployment.spec.ts',
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    replayReporter({ apiKey: process.env.RECORD_REPLAY_API_KEY, upload: true }),
    ['list'],
  ],
  use: {
    ...replayDevices['Replay Chromium'],
    baseURL: getDeployedUrl(),
    headless: true,
    actionTimeout: 15000,
  },
}

export default config
