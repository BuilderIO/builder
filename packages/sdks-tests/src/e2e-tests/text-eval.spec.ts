import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Text Eval', () => {
  test('binds text to state', async ({ page }) => {
    await page.goto('/text-eval');
    await expect(page.getByText('Device Size: large')).toBeVisible();
  });
});
