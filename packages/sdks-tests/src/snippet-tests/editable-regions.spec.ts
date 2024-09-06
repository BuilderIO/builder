import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Adding advanced child blocks in custom components', () => {
  test('should render a div with two columns with builder-path attr', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/editable-region');
    await page.waitForLoadState('networkidle');

    const divs = await page.$$('div[builder-path]');

    const count = divs.length;

    expect(count).toBe(2);
  });

  test('should render a div with two columns with placeholder text', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/editable-region');

    const twoColumns = page.locator('div.builder-block').first();
    await expect(twoColumns).toBeVisible();

    const childDivs = twoColumns.locator('div');

    const columns = childDivs.locator('div.builder-text');

    await columns.first().waitFor({ state: 'attached' });
    await columns.nth(1).waitFor({ state: 'attached' });

    await expect(columns.first()).toBeVisible();
    await expect(columns.nth(1)).toBeVisible();

    const firstText = await columns.first().textContent();
    expect(firstText?.trim().toLowerCase()).toBe('column 1 text');

    const secondText = await columns.nth(1).textContent();
    expect(secondText?.trim().toLowerCase()).toBe('column 2 text');
  });
});
