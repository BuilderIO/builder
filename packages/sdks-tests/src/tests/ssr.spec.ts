import { expect } from '@playwright/test';
import { isRNSDK, isSSRFramework, test } from './helpers.js';

test.describe('SSR', () => {
  test('js enabled', async ({ page }) => {
    await page.goto('/');

    const btn = isRNSDK
      ? page.getByRole('link', { name: 'Data Bindings' })
      : page.locator('text=Data Bindings');

    await expect(btn).toHaveCSS('background-color', 'rgb(56, 152, 236)');
  });

  test('js disabled', async ({ browser, packageName }) => {
    test.skip(!isSSRFramework(packageName));

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/');

    const btn = isRNSDK
      ? page.getByRole('link', { name: 'Data Bindings' })
      : page.locator('text=Data Bindings');

    await expect(btn).toHaveCSS('background-color', 'rgb(56, 152, 236)');
  });
});
