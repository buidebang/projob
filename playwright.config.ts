import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3000',
  },

  projects: [
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Tablet iPad Pro 11',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

});
