import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
        AUTH_SECRET: 'dummy_secret',
        DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy',
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        STRIPE_API_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123',
        NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: 'price_123',
        REDIS_URL: 'redis://localhost:6379',
        GEMINI_API_KEY: 'test_key'
    }
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
