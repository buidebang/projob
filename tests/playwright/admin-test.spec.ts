import { test, expect } from '@playwright/test';

test('Admin UI test and generation', async ({ page }) => {
  // Mock auth so we can get to the admin/dashboard routes
  await page.route('/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'admin-id', role: 'ADMIN', email: 'admin@example.com' },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      }),
    });
  });

  await page.goto('/dashboard');

  // Wait for the UI to settle
  await page.waitForTimeout(2000);

  // Select multiple platforms (simulate a multi-platform request)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    buttons.find(b => b.textContent === 'Twitter / X')?.click();
    buttons.find(b => b.textContent === 'LinkedIn Post')?.click();
    buttons.find(b => b.textContent === 'Reddit Thread')?.click();
  });

  // Add some text
  const textarea = page.locator('textarea').first();
  await textarea.fill('This is a test of the multi-platform generation capability.');

  await page.route('/api/repurpose', async route => {
      const json = {
          outputs: {
              "Twitter / X": { textContent: "Twitter output test" },
              "LinkedIn Post": { textContent: "LinkedIn output test" },
              "Reddit Thread": { textContent: "Reddit output test" }
          },
          isCached: false,
          executionMode: "Mock"
      };
      await route.fulfill({ json });
  });

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // The submit button has an ArrowUp icon usually. Let's just click the first cyan button that is an action button.
    const submitBtn = buttons.find(b => b.className.includes('bg-cyan-500'));
    if (submitBtn) submitBtn.click();
  });

  await page.waitForTimeout(2000);

  // Test PDF export for the first one
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pdfBtn = buttons.find(b => b.textContent?.includes('Export to PDF'));
    if (pdfBtn) pdfBtn.click();
  });

  await page.waitForTimeout(1000);
});
