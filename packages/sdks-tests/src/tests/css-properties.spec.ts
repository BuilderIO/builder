import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers/index.js';

test.describe.only('CSS Properties from Builder Content', () => {
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test('set image width CSS properties correctly', async ({ page, packageName }) => {
    test.skip(packageName === 'react-native');
    await page.goto('/css-properties');

    const image = page.locator('.builder-image');

    await expect(image).toHaveCSS('width', '616px');
  });

  test('set var(--red-color) bg color in Box properly', async ({ page, packageName }) => {
    test.skip(packageName === 'react-native');
    await page.goto('/css-properties');

    const div = page.locator('.builder-4f5a09e2a52747f8b7cb48b880636a3c');

    await expect(div).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    await expect(div).toHaveCSS('--red-color', 'red');
  });
});
