import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { targetContext } from './context.js';

// test.describe.configure({ mode: 'serial' });

const findTextInPage = ({ page, text }: { page: Page; text: string }) =>
  expect(page.locator(`text=${text}`)).toBeVisible();

test.describe(targetContext.name, () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a');
    await expect(links).toHaveCount(5);

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    expect(columnsLink).toHaveCount(1);
    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('columns', async ({ page }) => {
    await page.goto('/columns');

    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('symbols', async ({ page }) => {
    await page.goto('/symbols');

    await findTextInPage({ page, text: 'special test description' });
    await page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2"]'
      )
      .isVisible();
    await findTextInPage({ page, text: 'default description' });
    await page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e"]'
      )
      .isVisible();
  });
  test('data-bindings', async ({ page }) => {
    await page.goto('/data-bindings');

    await expect(page.locator(`text="1234"`).first()).toBeVisible();
    await findTextInPage({
      page,
      text: 'The Hot Wheels™ Legends Tour is Back',
    });
    await findTextInPage({
      page,
      text: 'Mattel Certified by Great Place to Work and Named to Fast Company’s List of 100 Best Workplaces for Innovators',
    });
  });
});
