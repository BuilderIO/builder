import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers/index.js';

test.describe('Inputs', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test('starts off with default value', async ({ page }) => {
    await page.goto('/input-default-value');
    await expect(page.locator('text=init value')).toBeVisible();
  });
});
