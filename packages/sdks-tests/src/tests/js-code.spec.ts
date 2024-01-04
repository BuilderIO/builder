import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers.js';

test.describe('JS Code', () => {
  test('initializes correct value from JS Code block', async ({ page }) => {
    test.fail(excludeTestFor(['vue3']));

    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();
  });
  test('toggles value ON/OFF', async ({ page }) => {
    test.fail(excludeTestFor(['vue3', 'svelte', 'rsc', 'solid', 'reactNative', 'react']));
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();

    // hide
    await page.getByRole('button').click();
    await expect(menuLocator).toBeHidden();

    // show again
    await page.getByRole('button').click();
    await expect(menuLocator).toBeVisible();
  });
});
