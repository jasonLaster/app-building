import { defineConfig } from '@playwright/test'
import { replayDevices } from '@replayio/playwright'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8888',
    ...replayDevices['Replay Chromium'],
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...replayDevices['Replay Chromium'] },
    },
  ],
})
