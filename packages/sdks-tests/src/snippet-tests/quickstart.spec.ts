import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('Quickstart', () => {
  test('loads homepage', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    await expect(links).toHaveCount(6);
  });

  test('loads columns', async ({ page }) => {
    await page.goto('/columns');

    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('loads homepage and navigates to columns', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });
});
