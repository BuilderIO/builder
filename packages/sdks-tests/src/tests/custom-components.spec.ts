import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers/index.js';

test.describe('Custom components', () => {
  test('correctly renders custom component', async ({ page }) => {
    test.skip(
      !excludeTestFor({
        angular: true,
        react: true,
      })
    );
    await page.goto('/custom-components');
    const helloWorldText = page.locator('text=hello World').first();
    await expect(helloWorldText).toBeVisible();
  });
});
