import { expect } from '@playwright/test';
import { findTextInPage, test } from '../helpers/index.js';

test.describe('Quickstart', () => {
  test('Loads content', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    await expect(links).toHaveCount(1);
  });

  test('navigates to columns', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    await expect(columnsLink).toHaveCount(1);
    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });
});
