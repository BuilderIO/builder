import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers/index.js';
import { sdk } from './sdk.js';

test.describe('Repeat items bindings', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test('Updating state should display repeat collection', async ({ page }) => {
    test.fail(sdk === 'rsc', "NextJS SDK doesn't support state updates");

    await page.goto('/repeat-items-bindings/');
    const buttonLocator = page.getByText('Click me');
    await expect(buttonLocator).toBeVisible();
    await buttonLocator.click();
    await expect(page.locator('text=1')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible();
    await expect(page.locator('text=4')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible();
  });
});
