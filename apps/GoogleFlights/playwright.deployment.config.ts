import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getDeployedUrl(): string {
  const deploymentPath = join(__dirname, 'deployment.txt')
  const content = readFileSync(deploymentPath, 'utf-8')
  const match = content.match(/url=(.+)/)
  if (!match) throw new Error('No URL found in deployment.txt')
  return match[1].trim()
}

export default defineConfig({
  testDir: './tests',
  testMatch: 'deployment.spec.ts',
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: getDeployedUrl(),
    headless: true,
  },
  projects: [
    {
      name: 'replay-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
