import { test, expect } from '@playwright/test';
import * as fs from 'fs';

let atomicLog: string[] = [];

function logAtomic(message: string) {
    const timestamp = new Date().toISOString();
    const formatted = `[ATOMIC LOG] ${timestamp} - ${message}`;
    console.log(formatted);
    atomicLog.push(formatted);
    fs.appendFileSync('atomic-execution-log-real.txt', formatted + '\n');
}

test.describe('REAL PHYSICAL EXECUTION: UI/UX Chaos Scenarios', () => {
  test('Scenario C: Public Page Stealth Upsell Trigger (Multi-click)', async ({ page }) => {
    logAtomic('Starting Scenario C: Stealth Upsell Trigger on public marketing page');
    await page.goto('/');
    logAtomic('Navigated to /');

    const textarea = page.locator('textarea').first();
    const button = page.locator('button.bg-cyan-500').first();

    if (await textarea.isVisible() && await button.isVisible()) {
        await textarea.fill('Test input');

        // Mock the API response to avoid the app being stuck in processing state
        await page.route('/api/repurpose', async route => {
            const json = { text: 'Mocked response' };
            await route.fulfill({ json });
        });

        for (let i = 0; i < 6; i++) {
            await button.evaluate((node) => (node as HTMLElement).click());
            await page.waitForTimeout(200);
        }

        logAtomic('Clicked submit 6 times.');

        const upsellModal = page.locator('text=Performance Cap Reached');
        try {
            await upsellModal.waitFor({ state: 'visible', timeout: 5000 });
            logAtomic('Upsell Modal successfully triggered and is visible.');
            expect(await upsellModal.isVisible()).toBe(true);

            const upgradeBtn = page.locator('button:has-text("UNLEASH HYPER-ENGINE")');
            if (await upgradeBtn.isVisible()) {
                 await upgradeBtn.evaluate((node) => (node as HTMLElement).click());
                 logAtomic('Clicked Upgrade button successfully.');
            }
        } catch (e) {
            logAtomic(`Failed to find/interact with Upsell modal: ${e}`);
            throw e;
        }

    } else {
        logAtomic('Input or submit button not visible on /');
    }
  });

  test('Scenario D: Massive Text Paste Freeze Test (RTL/LTR mixing)', async ({ page }) => {
     logAtomic('Starting Scenario D: Massive Text Paste Freeze Test');
     await page.goto('/');

     const textarea = page.locator('textarea').first();
     if (await textarea.isVisible()) {
         // Create a massive string (30k chars)
         const payload = "This is a massive string test with RTL (مرحبا بك) and LTR mixed. ".repeat(500);
         const start = Date.now();
         await textarea.fill(payload);
         const end = Date.now();
         const latency = end - start;
         logAtomic(`Massive paste completed in ${latency}ms.`);

         // Assert it didn't freeze for more than 5 seconds
         expect(latency).toBeLessThan(5000);
     }
  });

});
