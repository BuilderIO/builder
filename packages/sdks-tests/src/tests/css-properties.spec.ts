import { expect } from '@playwright/test';
import { isSSRFramework, test } from '../helpers/index.js';

test.describe('CSS Properties from Builder Content (js enabled)', () => {
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

test.describe('CSS Properties from Builder Content (js disabled)', () => {
  test('set image width CSS properties correctly', async ({ browser, packageName }) => {
    test.skip(packageName === 'react-native');
    test.fail(!isSSRFramework(packageName));
    test.fail(packageName === 'angular-ssr', 'We are attaching props on `ngOnInit` so it fails');

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/css-properties');

    const image = page.locator('.builder-image');

    await expect(image).toHaveCSS('width', '616px');
  });

  test('set var(--red-color) bg color in Box properly', async ({ browser, packageName }) => {
    test.skip(packageName === 'react-native');
    test.fail(!isSSRFramework(packageName));
    test.fail(packageName === 'angular-ssr', 'We are attaching props on `ngOnInit` so it fails');

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/css-properties');

    const div = page.locator('.builder-4f5a09e2a52747f8b7cb48b880636a3c');

    await expect(div).toHaveCSS('background-color', 'rgb(255, 0, 0)');
    await expect(div).toHaveCSS('--red-color', 'red');
  });
});
