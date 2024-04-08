import { expect } from '@playwright/test';
import { excludeTestFor, findTextInPage, test } from './helpers/index.js';

test('Client-side navigation', async ({ page }) => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  await page.goto('/');

  const links = page.locator('a');

  const columnsLink = await links.filter({
    hasText: 'Columns (with images) ',
  });

  await expect(columnsLink).toHaveCount(1);
  await columnsLink.click();
  await findTextInPage({ page, text: 'Stack at tablet' });
});
