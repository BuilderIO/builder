import { expect } from '@playwright/test';
import { isRNSDK, isSSRFramework, test } from './helpers/index.js';

test.describe('SSR', () => {
  test('js enabled', async ({ page }) => {
    await page.goto('/');

    const btn = isRNSDK
      ? page.locator('a').filter({ hasText: 'Data Bindings' })
      : page.locator('text=Data Bindings');

    await expect(btn).toHaveCSS('background-color', 'rgb(56, 152, 236)');
  });

  test('js disabled', async ({ browser, packageName }) => {
    test.fail(!isSSRFramework(packageName));
    test.fail(
      packageName === 'angular-ssr',
      'We are using ngOnInit to set props so we need JS enabled.'
    );

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/');

    const btn = isRNSDK
      ? page.locator('a').filter({ hasText: 'Data Bindings' })
      : page.locator('text=Data Bindings');

    await expect(btn).toHaveCSS('background-color', 'rgb(56, 152, 236)');
  });
});
