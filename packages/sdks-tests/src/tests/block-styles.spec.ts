import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Block Styles', () => {
  test('check that block styles load', async ({ page }) => {
    await page.goto('/columns');
    const blocksWrapper = await page.locator(`.builder-blocks`).first();
    await expect(blocksWrapper).toHaveCSS('display', 'flex');
  });
});
