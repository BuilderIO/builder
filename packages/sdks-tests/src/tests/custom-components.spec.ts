import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Custom components', () => {
    test('do not show component in `page` model when restricted to `test-model`', async ({
        page,
        packageName,
      }) => {
        test.skip(!['vue2'].includes(packageName));
        await page.goto('/custom-components-models-not-show');
        await expect(page.locator('text=hello World').first()).not.toBeVisible();
    });
    
    test('show component in `test-model` model when restricted to `test-model`', async ({
      page,
      packageName,
    }) => {
      test.skip(!['vue2'].includes(packageName));
      await page.goto('/custom-components-models-show');
      await expect(page.locator('text=hello World').first()).toBeVisible();
    });
});
