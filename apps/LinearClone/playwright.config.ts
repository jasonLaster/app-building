import { defineConfig } from '@playwright/test';
import { replayDevices, replayReporter } from '@replayio/playwright';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/deployment.spec.ts'],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
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
});
