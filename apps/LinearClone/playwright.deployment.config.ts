import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'fs';

const deploymentTxt = readFileSync('./deployment.txt', 'utf-8');
const urlMatch = deploymentTxt.match(/^url=(.+)$/m);
const deployedUrl = urlMatch?.[1]?.trim() || '';

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  retries: 0,
  reporter: [['line']],
  use: {
    ...devices['Desktop Chromium'],
    baseURL: deployedUrl,
    actionTimeout: 15000,
    headless: true,
  },
});
