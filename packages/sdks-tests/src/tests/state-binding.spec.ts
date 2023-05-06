import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('State binding', () => {
  test.describe('inside repeater', () => {
    test('writing to state should update binding', async ({ page }) => {
      await page.goto('/state-binding/', { waitUntil: 'networkidle' });
      await expect(page.locator('text=initial Name')).toContainText('initial Name');
      await page.click('text=first');
      await expect(page.locator('text=repeated set')).toContainText('repeated set');
    });
  });
});
