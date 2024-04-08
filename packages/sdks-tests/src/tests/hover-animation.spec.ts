import { expect } from '@playwright/test';
import { excludeTestFor, test, isOldReactSDK, isRNSDK } from './helpers/index.js';

test.describe('Hover animations', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test.fail(isRNSDK); // hover animation is not handled in react native SDK
  test('Button should change color when hovered', async ({ page }) => {
    await page.goto('/hover-animation');

    const button = isOldReactSDK ? page.locator('span') : page.locator('button');

    const initialColor = await button.evaluate(el => getComputedStyle(el).backgroundColor, null, {
      timeout: 10000,
    });

    await button.hover();
    await page.waitForTimeout(1000);

    const hoveredColor = await button.evaluate(el => getComputedStyle(el).backgroundColor, null, {
      timeout: 10000,
    });

    expect(initialColor).toContain('rgb(0, 0, 0)');
    expect(hoveredColor).not.toContain(initialColor);
  });
});
