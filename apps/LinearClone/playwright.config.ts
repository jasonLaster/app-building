import { defineConfig } from '@playwright/test';
import { replayDevices, replayReporter } from '@replayio/playwright';

export default defineConfig({
  testDir: './tests',
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
    actionTimeout: 15000,
  },
  webServer: {
    command: 'npx netlify dev --port 8888 --functions ./netlify/functions',
    port: 8888,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
