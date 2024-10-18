import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Product Details Component', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['angular-ssr', 'angular'].includes(packageName));
    // Visit the page where ProductDetailsComponent is rendered
    await page.goto('/product/category/jacket');
  });

  test('should display product name', async ({ page }) => {
    // Wait for the product name to be rendered
    const productNameLocator = page.locator('h1');
    await productNameLocator.waitFor();

    // Verify the product name is correctly rendered
    const productName = await productNameLocator.textContent();
    expect(productName).toBe('Red Jacket');
  });

  test('should display product image with correct attributes', async ({ page }) => {
    // Wait for the image to be rendered
    const image = page.locator('img');

    // Verify the image source, alt text, and size
    await expect(image).toHaveAttribute('src', /.+/);
    await expect(image).toHaveAttribute('alt', 'Red Jacket');
    await expect(image).toHaveAttribute('width', '400');
    await expect(image).toHaveAttribute('height', '500');
  });

  test('should display product copy (description)', async ({ page }) => {
    // Verify the product copy text
    const productCopyLocator = page.locator('text=This jacket will save you from Frost Bite');
    await productCopyLocator.waitFor();

    const productCopy = await productCopyLocator.textContent();
    expect(productCopy).toBe('This jacket will save you from Frost Bite');
  });

  test('should display product price', async ({ page }) => {
    // Verify the product price
    const priceLocator = page.locator('text=Price: 200');
    await priceLocator.waitFor();

    const price = await priceLocator.textContent();
    expect(price).toContain('200');
  });
});