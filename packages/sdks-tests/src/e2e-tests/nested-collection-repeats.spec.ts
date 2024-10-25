import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Nested Collection Repeats', () => {
  test('should render nested collection repeats correctly', async ({ page }) => {
    await page.goto('/nested-collection-repeats/');

    // Check for the first product's images
    await expect(page.locator('text="url for product #0, image #0: foo"')).toBeVisible();
    await expect(page.locator('text="url for product #0, image #1: bar"')).toBeVisible();

    // Check for the second product's images
    await expect(page.locator('text="url for product #1, image #0: baz"')).toBeVisible();
    await expect(page.locator('text="url for product #1, image #1: qux"')).toBeVisible();
  });
});
