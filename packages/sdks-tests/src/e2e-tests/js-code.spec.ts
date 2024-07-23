import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('JS Code', () => {
  test('initializes correct value from JS Code block', async ({ page, sdk }) => {
    test.skip(excludeTestFor(['vue'], sdk));
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=Content is expanded');
    await expect(menuLocator).toBeVisible();
  });

  test('code inside Browser.isBrowser should work', async ({ page, sdk }) => {
    // doesn't work for these as they are SSR and there is no hydration step
    // so the code is not run on the client (Builder.isBrowser) block isn't executed
    test.fail(excludeTestFor(['vue', 'qwik', 'rsc'], sdk));
    await page.goto('/js-content-is-browser');
    await expect(page.locator('text=2024')).toBeVisible(); // we are getting state.year from the code
  });
});
