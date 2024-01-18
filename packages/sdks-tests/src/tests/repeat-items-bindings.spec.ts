import { expect } from '@playwright/test';
import { test } from './helpers.js';
import { sdk } from './sdk.js';

test.describe('Repeat items bindings', () => {
  test('Updating state should display repeat collection', async ({ page }) => {
    test.fail(
      // NextJS fundamentally doesn't support state updates
      sdk === 'rsc'
    );
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
