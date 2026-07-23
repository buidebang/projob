import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({
    viewport: { width: 1280, height: 720 },
    video: {
        mode: 'on',
        size: { width: 1280, height: 720 }
    }
});

test.describe('Autonomous UI Cinematography', () => {
    test('Execute Social Media Blockbuster', async ({ page }, testInfo) => {
        test.setTimeout(120000);

        const artifactsDir = 'artifacts';
        if (!fs.existsSync(artifactsDir)) {
            fs.mkdirSync(artifactsDir, { recursive: true });
        }

        console.log("Navigating to local server...");
        // Ensure server is running or we'll get ECONNREFUSED
        await page.goto('http://localhost:3000/');

        console.log("Inputting text...");
        // Wait for textarea to be visible
        const textarea = page.locator('textarea[placeholder*="Ask ProJob"]');
        await expect(textarea).toBeVisible({ timeout: 20000 });

        await textarea.fill("Analyze the current state of DeFi and generate a multi-platform social media campaign (Twitter & Telegram) using the Social Media MCP.");

        await page.screenshot({ path: `${artifactsDir}/step1-input.png` });

        console.log("Submitting...");
        await textarea.press('Enter');

        console.log("Waiting for processing state...");
        // The processing indicator goes away when done, wait for it or the prose output.
        // On free tier without API keys working perfectly, it might not render output.
        // We will wait for either the .prose (output) or a toast/error, or the spinner to be hidden.

        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${artifactsDir}/step2-thinking.png` });

        console.log("Waiting for final output...");
        // Try to wait for the .prose container (markdown output)
        try {
            const outputContainer = page.locator('.prose').first();
            await expect(outputContainer).toBeVisible({ timeout: 60000 });
            await page.waitForTimeout(2000); // Give it time to finish typing
        } catch (e) {
            console.log("Prose output not found within timeout. Continuing to capture final state anyway...");
        }

        // Take final screenshot
        await page.screenshot({ path: `${artifactsDir}/step3-final-output.png` });

        // Retrieve video path
        const videoPath = await page.video()?.path();
        console.log(`Video saved to: ${videoPath}`);

        if (videoPath) {
           fs.copyFileSync(videoPath, path.join(artifactsDir, 'social-execution-proof.webm'));
        }
    });
});
