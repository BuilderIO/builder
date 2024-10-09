import { expect } from '@playwright/test';
import { excludeTestFor, isSSRFramework, test } from '../helpers/index.js';

test.describe('JS Code', () => {
  test('runs code', async ({ page }) => {
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=jsCode text');
    await expect(menuLocator).toBeVisible();
  });
  test('runs code in SSR (JS disabled)', async ({ browser, packageName }) => {
    test.fail(!isSSRFramework(packageName));
    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=jsCode text');
    await expect(menuLocator).toBeVisible();
  });
  test('runs code inside Browser.isBrowser', async ({ page, sdk }) => {
    // doesn't work for these as they are SSR and there is no hydration step
    // so the code is not run on the client (Builder.isBrowser) block isn't executed
    test.fail(excludeTestFor(['qwik', 'rsc'], sdk));
    await page.goto('/js-content-is-browser');
    await expect(page.locator('text=2024')).toBeVisible(); // we are getting state.year from the code
  });
});
