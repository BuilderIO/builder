import { expect } from '@playwright/test';
import { excludeTestFor, findTextInPage, test } from './helpers.js';

test.describe('Show If & Hide If', () => {
  test('works on static conditions', async ({ page }) => {
    await page.goto('/show-hide-if');

    await findTextInPage({ page, text: 'this always appears' });
    await expect(page.locator('body')).not.toContainText('this never appears');
  });

  test('works on reactive conditions', async ({ page, packageName }) => {
    test.fail(
      excludeTestFor({
        reactNative: true,
        rsc: true,
        solid: true,
      })
    );

    // since these are flaky tests, we have to `.skip()` instead of `.fail()`, seeing as they might sometimes pass.
    test.skip(
      // TO-DO: flaky in remix
      packageName === 'gen1-remix' ||
        // flaky in vue3: takes too long to hydrate, causing button click not to register...
        packageName === 'vue3' ||
        packageName === 'nuxt3'
    );

    await page.goto('/show-hide-if');

    await expect(page.getByText('even clicks')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('odd clicks');

    const button = page.getByRole('button');
    await expect(button).toBeVisible();
    await button.click();

    await expect(page.getByText('odd clicks')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('even clicks');
  });
});
