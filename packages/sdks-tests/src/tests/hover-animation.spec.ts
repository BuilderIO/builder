import { expect } from '@playwright/test';
import { excludeTestFor, test, isOldReactSDK } from './helpers/index.js';

test.describe('Hover animations', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test('Button should change color when hovered', async ({ page }) => {
    await page.goto('/hover-animation');

    const button = isOldReactSDK ? page.locator('span') : page.locator('button');

    const initialColor = await button.evaluate((el) => getComputedStyle(el).backgroundColor);

    await button.hover();
    await page.waitForTimeout(1000);

    const hoveredColor = await button.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(initialColor).toContain('rgb(0, 0, 0)');
    expect(hoveredColor).not.toContain(initialColor);
  });
});
