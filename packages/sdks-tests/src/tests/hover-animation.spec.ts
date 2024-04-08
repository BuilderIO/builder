import { expect } from '@playwright/test';
import { excludeTestFor, test, isOldReactSDK, isRNSDK } from './helpers/index.js';

test.describe('Hover animations', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test.fail(isRNSDK); // hover animation is not handled in react native SDK
  test('Button should change color when hovered', async ({ page }) => {
    await page.goto('/hover-animation');

    const button = isOldReactSDK ? page.locator('span') : page.locator('button');

    await expect(button).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    await button.hover();
    await page.waitForTimeout(1000);

    await expect(button).toHaveCSS('background-color', 'rgb(149, 79, 79)');
  });
});
