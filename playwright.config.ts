import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  globalSetup: require.resolve('./tests/playwright/global-setup'),
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    video: 'on',
    storageState: 'storageState.json',
  },
  webServer: {
    command: 'npx next dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
        AUTH_SECRET: 'dummy_secret',
        DATABASE_URL: 'postgresql://jules:jules_password@localhost:5432/projob_test',
        NEXTAUTH_URL: 'http://localhost:3000',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        STRIPE_API_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123',
        NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: 'price_123',
        REDIS_URL: 'redis://localhost:6379',
        GEMINI_API_KEY: 'AIzaSyBhsTDPryJ4jFq6gp5hPlCYXilrKhxQbR8'
    }
  },

  projects: [
    {
      name: 'Mobile Pixel 5',
      use: { ...devices['Pixel 5'], browserName: 'chromium' },
    },
    {
      name: 'Tablet iPad Pro 11',
      use: { ...devices['iPad Pro 11'], browserName: 'chromium' },
    },
  ],

});
