import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('JS Code', () => {
  test('initializes correct value from JS Code block', async ({ page }) => {
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();
  });
  test('toggles value ON/OFF', async ({ page }) => {
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
