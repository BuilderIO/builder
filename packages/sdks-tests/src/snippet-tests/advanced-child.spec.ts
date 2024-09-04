import { expect } from '@playwright/test';
import { findTextInPage, test, verifyBlocks } from '../helpers/index.js';

test.describe('Adding advanced child blocks in custom components', () => {
  test('render two divs with the attribute builder-path', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/advanced-child');

    await page.waitForSelector('div[builder-path]', { timeout: 5000 });

    const div = page.locator('div[builder-path]');
    const count = await div.count();

    expect(count).toBeGreaterThan(1);
  });

  test('should render a div with two columns', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/advanced-child');

    const twoColumns = page.locator('div.two-columns').first();
    await expect(twoColumns).toBeVisible();

    const columns = twoColumns.locator('div.builder-text');
    await expect(columns).toBeVisible();

    await findTextInPage({ page, text: 'Enter some text...' });

    await verifyBlocks(page, twoColumns, 'component.options.inside.0.blocks');
    await verifyBlocks(page, twoColumns, 'component.options.inside.1.blocks');

    const image = twoColumns.locator('img');
    const imageSrc = await image.getAttribute('src');
    expect(imageSrc).not.toBeNull();
    await expect(image).toBeVisible();
  });
});
