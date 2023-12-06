import { expect } from '@playwright/test';
import { findTextInPage, test } from './helpers.js';

test('Client-side navigation', async ({ page }) => {
  await page.goto('/');

  const links = page.locator('a');

  const columnsLink = await links.filter({
    hasText: 'Columns (with images) ',
  });

  await expect(columnsLink).toHaveCount(1);
  await columnsLink.click();
  await findTextInPage({ page, text: 'Stack at tablet' });
});
