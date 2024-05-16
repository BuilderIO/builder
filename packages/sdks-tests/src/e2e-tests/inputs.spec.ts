import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('Inputs', () => {
  test('starts off with default value', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    await page.goto('/input-default-value');
    await expect(page.locator('text=init value')).toBeVisible();
  });
});
