import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';
import { mockFakeStoreAPI } from '../helpers/fakestoreapi-mock.js';

test.describe('Product Editorial Page', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'remix',
        'react-sdk-next-15-app',
        'sveltekit',
        'qwik-city',
        'nuxt',
        'react-sdk-next-14-app',
        'react-sdk-next-pages',
        'nextjs-sdk-next-app',
        'angular-19-ssr',
        'gen1-react',
        'gen1-remix',
        'gen1-next14-pages',
        'gen1-next15-app',
      ].includes(packageName)
    );

    // Mock fakestoreapi.com to avoid anti-bot protection issues in CI
    await mockFakeStoreAPI(page);

    await page.goto('/products/1');
  });

  test('should render the header component', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Acme Corp');
  });

  test('should render the product info', async ({ page }) => {
    // Wait for the product image element to appear
    const productImage = page.locator('.product-image img');
    await expect(productImage).toBeAttached();
    await expect(productImage).toHaveAttribute('src', /.+/);
    await expect(productImage).toBeVisible();

    // mark test as slow because it takes a while to load the image.
    test.slow();

    // Wait for the image to load completely
    await page.waitForFunction(imgSelector => {
      const img = document.querySelector(imgSelector) as HTMLImageElement;
      return img && img.complete && img.naturalWidth > 0;
    }, '.product-image img');

    // Verify the product title, description, price, and rating are displayed
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('p').nth(0)).toBeVisible();
    await expect(page.locator('p').nth(1)).toBeVisible();
    await expect(page.locator('p').nth(2)).toBeVisible();
  });

  test('should render the editorial content', async ({ page }) => {
    // verify that the editorial content is visible and has some text
    await expect(page.locator('.builder-blocks')).toBeVisible();
    await expect(page.locator('.builder-blocks')).toHaveText(/.+/);
  });

  test('should render the footer component', async ({ page }) => {
    await expect(page.getByText('© 2024 Acme Corp. All rights reserved.')).toBeVisible();
  });
});
