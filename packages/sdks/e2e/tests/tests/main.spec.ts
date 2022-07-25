import { test, expect } from '@playwright/test';

import { targetContext } from './context';

// test.describe.configure({ mode: 'serial' });

test.describe(targetContext.name, () => {
  test('open homepage', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a');
    await expect(links).toHaveCount(5);

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    expect(columnsLink).toHaveCount(1);
    await columnsLink.click();
    await expect(page.locator('text=Stack at tablet')).toBeVisible();
  });
  test('go to columns', async ({ page }) => {
    await page.goto('/columns');

    await expect(page.locator('text=Stack at tablet')).toBeVisible();
  });
});
