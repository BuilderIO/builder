import { expect } from '@playwright/test';
import { excludeTestFor, findTextInPage, checkIsRN, test } from '../helpers/index.js';

test.describe('Show If & Hide If', () => {
  test('works on static conditions', async ({ page }) => {
    await page.goto('/show-hide-if');

    await findTextInPage({ page, text: 'this always appears' });
    await expect(page.locator('body')).not.toContainText('this never appears');
  });

  test('works on reactive conditions', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk), 'RSC SDK has no interactivity');

    // since these are flaky tests, we have to `.skip()` instead of `.fail()`, seeing as they might sometimes pass.
    test.skip(
      // TO-DO: flaky in remix
      packageName === 'gen1-remix' ||
        // flaky in vue: takes too long to hydrate, causing button click not to register...
        packageName === 'vue' ||
        packageName === 'nuxt'
    );

    await page.goto('/show-hide-if');

    await expect(page.getByText('even clicks')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('odd clicks');

    const button = checkIsRN(sdk) ? page.locator('button') : page.getByRole('button');
    await expect(button).toBeVisible();
    await button.click();

    await expect(page.getByText('odd clicks')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('even clicks');
  });
  test('works with repeat elements', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk), 'RSC SDK has no interactivity');

    // since these are flaky tests, we have to `.skip()` instead of `.fail()`, seeing as they might sometimes pass.
    test.skip(
      // gen1 SSR breaks here some some reason
      packageName === 'gen1-remix' ||
        packageName === 'gen1-next' ||
        // flaky in vue: takes too long to hydrate, causing button click not to register...
        sdk === 'vue'
    );

    await page.goto('/show-hide-if-repeats');

    await expect(page.locator('body')).not.toContainText('zero');
    await expect(page.locator('body')).not.toContainText('one');
    await expect(page.locator('body')).not.toContainText('two');
    await expect(page.locator('body')).not.toContainText('three');

    await page.hover('text=button1', { timeout: 10000 });

    await expect(page.locator('body')).not.toContainText('zero');
    await expect(page.locator('body')).not.toContainText('one');
    await expect(page.locator('body')).not.toContainText('two');
    await expect(page.locator('body')).not.toContainText('three');

    await page.hover('text=button2', { timeout: 10000 });

    await expect(page.locator('body')).not.toContainText('zero');
    await expect(page.locator('body')).not.toContainText('one');
    await expect(page.locator('body')).toContainText('two');
    await expect(page.locator('body')).not.toContainText('three');

    await page.hover('text=button3', { timeout: 10000 });

    await expect(page.locator('body')).not.toContainText('zero');
    await expect(page.locator('body')).not.toContainText('one');
    await expect(page.locator('body')).not.toContainText('two');
    await expect(page.locator('body')).toContainText('three');
  });
});
