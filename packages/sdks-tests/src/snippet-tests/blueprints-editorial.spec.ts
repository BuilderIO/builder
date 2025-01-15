import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Product Editorial Page with Real Data', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['angular', 'angular-ssr'].includes(packageName));
    // Navigate to the product editorial page
    await page.goto('/products/1');
  });

  test('should render the header component', async ({ page }) => {
    const header = page.locator('app-header');
    await expect(header).toBeVisible();
    await expect(header.locator('h1')).toHaveText('Acme Corp');
  });

  test('should render the product info with real data', async ({ page }) => {
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
    const productTitle = page.locator('.product-info h2');
    const productDescription = page.locator('.product-info p').nth(0);
    const productPrice = page.locator('.product-info p').nth(1);
    const productRating = page.locator('.product-info p').nth(2);

    await expect(productTitle).toBeVisible();
    await expect(productDescription).toBeVisible();
    await expect(productPrice).toBeVisible();
    await expect(productRating).toBeVisible();
  });

  test('should render the editorial content with real data', async ({ page }) => {
    const editorialContent = page.locator('builder-content');
    await expect(editorialContent).toBeVisible();

    // Verify that the editorial content contains some text (as the real data may vary)
    const editorialText = editorialContent.locator('div').nth(1);
    await expect(editorialText).toBeVisible();
  });

  test('should render the footer component', async ({ page }) => {
    const footer = page.locator('app-footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('p')).toHaveText('© 2024 Acme Corp. All rights reserved.');
  });
});
