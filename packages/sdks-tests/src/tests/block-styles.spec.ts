import { expect } from '@playwright/test';
import { excludeTestFor, getClassSelector, test } from './helpers.js';

test.describe('Block Styles', () => {
  test.skip(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test('check that block styles load', async ({ page }) => {
    await page.goto('/columns');
    const blocksWrapper = await page.locator(getClassSelector('builder-blocks')).first();
    await expect(blocksWrapper).toHaveCSS('display', 'flex');
  });
});
