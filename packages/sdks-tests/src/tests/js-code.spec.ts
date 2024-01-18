import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers.js';

test.describe('JS Code', () => {
  test.skip(excludeTestFor(['vue']));

  test('initializes correct value from JS Code block', async ({ page }) => {
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();
  });

  test('toggles value ON/OFF', async ({ page }) => {
    test.fail(excludeTestFor(['svelte', 'rsc', 'solid', 'reactNative', 'react']));
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();

    const btn = page.getByRole('button');
    await expect(btn).toBeVisible();

    // hide
    await btn.click();
    await expect(menuLocator).toBeHidden();

    // show again
    await btn.click();
    await expect(menuLocator).toBeVisible();
  });
});
