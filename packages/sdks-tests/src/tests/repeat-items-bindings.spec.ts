import { expect } from '@playwright/test';
import { test } from './helpers.js';
import { sdk } from './sdk.js';

test.describe('Repeat items bindings', () => {
  test('Updating state should display repeat collection', async ({ page, packageName }) => {
    test.fail(
      // NextJS fundamentally doesn't support state updates
      sdk === 'rsc' ||
        // not sure why vue2 fails
        sdk === 'vue2'
    );
    await page.goto('/repeat-items-bindings/');
    const buttonLocator = page.getByText('Hover over me');
    await expect(buttonLocator).toBeVisible();
    await buttonLocator.hover();
    await expect(page.locator('text=1')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible();
    await expect(page.locator('text=4')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible();
  });
});
