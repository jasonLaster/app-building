import { defineConfig } from '@playwright/test';
import { devices as replayDevices, replayReporter } from '@replayio/playwright';

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/deployment.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 180000,
  actionTimeout: 15000,
  navigationTimeout: 30000,
  reporter: [
    replayReporter({
      apiKey: process.env.REPLAY_API_KEY ?? process.env.RECORD_REPLAY_API_KEY,
      upload: false,
    }),
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:8888',
    ...replayDevices['Replay Chromium'],
  },
  webServer: {
    command: 'npx netlify dev --port 8888 --functions ./netlify/functions',
    url: 'http://localhost:8888',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
