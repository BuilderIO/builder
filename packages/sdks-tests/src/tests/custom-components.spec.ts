import { expect } from '@playwright/test';
import { test } from './helpers/index.js';

test.describe('Custom components', () => {
  test('correctly renders custom component', async ({ page, packageName }) => {
    test.skip(packageName === 'next-app-dir-client');
    await page.goto('/custom-components');
    const helloWorldText = page.locator('text=hello World').first();
    await expect(helloWorldText).toBeVisible();
  });
});
