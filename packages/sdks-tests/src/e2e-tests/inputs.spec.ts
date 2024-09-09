import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Inputs', () => {
  test('starts off with default value', async ({ page }) => {
    await page.goto('/input-default-value');
    await expect(page.locator('text=init value')).toBeVisible();
  });
});

test.describe('Symbols with bound content inputs', () => {
  test('repeat Symbols with content bound to content inputs should render correctly', async ({
    page,
  }) => {
    // here data prop is { products: [{ header: 'title1' }, { header: 'title2' }, { header: 'title3' }] }
    await page.goto('/symbol-with-repeat-input-binding');

    const promises = [];
    for (let i = 1; i <= 3; i++) {
      promises.push(expect(page.locator(`text=title${i}`)).toBeVisible());
    }
    await Promise.all(promises);
  });
});
