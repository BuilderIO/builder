import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Inputs', () => {
  test('starts off with default value', async ({ page }) => {
    await page.goto('/input-default-value');
    await expect(page.locator('text=init value')).toBeVisible();
  });
});
