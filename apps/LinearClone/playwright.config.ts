import { defineConfig } from '@playwright/test';
import { devices as replayDevices, replayReporter } from '@replayio/playwright';

// Check if Replay Chromium is available (not available on aarch64)
const replayChromiumAvailable = (() => {
  try {
    const config = replayDevices['Replay Chromium'];
    if (!config?.launchOptions?.executablePath) return false;
    const fs = require('fs');
    return fs.existsSync(config.launchOptions.executablePath);
  } catch { return false; }
})();

const browserConfig = replayChromiumAvailable
  ? { ...replayDevices['Replay Chromium'] }
  : {};

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
    ...(replayChromiumAvailable ? [replayReporter({ upload: false })] : []),
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never' }],
  ],
  use: {
    ...browserConfig,
    baseURL: 'http://localhost:8888',
    actionTimeout: 15000,
  },
});
