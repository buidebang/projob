import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './scripts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Strict Sequential Mode required by Anti-Mocking Protocol
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on'
  },
  outputDir: 'artifacts/playwright-results/', // Artifacts required by AGENTS.md
  webServer: {
    command: 'node .next/standalone/server.js',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
       PORT: '3000',
       DATABASE_URL: "postgres://dummy:dummy@localhost:5432/dummy"
    }
  },
});
