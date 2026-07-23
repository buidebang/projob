import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({
    viewport: { width: 1280, height: 720 },
    // Use artifacts directory as dictated by memory
    video: {
        mode: 'on',
        size: { width: 1280, height: 720 }
    }
});

test.describe('Autonomous UI Cinematography', () => {
    test('Execute Social Media Blockbuster', async ({ page }, testInfo) => {
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
        await expect(textarea).toBeVisible({ timeout: 10000 });

        await textarea.fill("Analyze the current state of DeFi and generate a multi-platform social media campaign (Twitter & Telegram) using the Social Media MCP.");

        await page.screenshot({ path: `${artifactsDir}/step1-input.png` });

        console.log("Submitting...");
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        console.log("Waiting for processing state...");
        // Wait for an element that indicates a message is being processed or the spinner is active
        const processingIndicator = page.locator('button[type="submit"] svg.animate-spin');

        // Sometimes it happens too fast, so we'll wait for either processing or output
        await Promise.race([
            expect(processingIndicator).toBeVisible({ timeout: 5000 }),
            expect(page.locator('.prose')).toBeVisible({ timeout: 5000 })
        ]).catch(() => console.log("Processing indicator missed, moving to final output wait..."));

        await page.screenshot({ path: `${artifactsDir}/step2-thinking.png` });

        console.log("Waiting for final output...");
        // Wait for the final output. The prose class usually renders markdown.
        const outputContainer = page.locator('.prose');
        await expect(outputContainer).toBeVisible({ timeout: 60000 });

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
