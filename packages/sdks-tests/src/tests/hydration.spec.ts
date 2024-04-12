import { expect } from '@playwright/test';
import { findTextInPage, test } from './helpers.js';

/**
 * The only way to guarantee that hydration has completed is to interact with
 * a page. This is why we click on a link and only then are we able to look at
 * the console logs.
 *
 * PS: we rely on a `.beforeEach()` in `helpers.ts` that runs on every test
 * to throw an error if there is a hydration mismatch.
 */
test.describe('Hydration', () => {
  test('No mismatch on regular content', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });

  test('No mismatch on A/B test content', async ({ page }) => {
    test.fail(true, 'A/B tests are not supported in Vue 2.');

    await page.goto('/ab-test-interactive');
    await expect(page.locator('a').locator('visible=true').first()).toBeVisible();
    await page.locator('a').locator('visible=true').first().click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });
});
