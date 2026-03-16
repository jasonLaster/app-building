import { PlaywrightTestConfig, devices } from '@playwright/test'
import { devices as replayDevices, replayReporter } from '@replayio/playwright'
import { readFileSync, existsSync } from 'fs'
import { arch } from 'os'

function getDeployedUrl(): string {
  const content = readFileSync('deployment.txt', 'utf-8')
  const match = content.match(/url=(.+)/)
  return match?.[1]?.trim() || ''
}

const replayDevice = replayDevices['Replay Chromium']
const replayExePath = replayDevice?.launchOptions?.executablePath
const useReplay = !!replayExePath && existsSync(replayExePath) && arch() === 'x64'

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
    ...(useReplay ? [replayReporter({ apiKey: process.env.RECORD_REPLAY_API_KEY, upload: true })] : []),
    ['list'],
  ],
  use: {
    ...(useReplay ? replayDevice : devices['Desktop Chrome']),
    baseURL: getDeployedUrl(),
    headless: true,
    actionTimeout: 15000,
  },
}

export default config
