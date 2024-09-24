import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('BlogArticleComponent', () => {
  test.beforeEach(async ({ page, packageName }) => {
    // Navigate to the blog article page
    // Note: Replace '/blog/new-product-line' with the actual route to your blog article
    test.skip(!['angular'].includes(packageName));
    await page.goto('blogs/new-product-line');
  });

  test('should display correct article title', async ({ page }) => {
    const title = await page.locator('h1').textContent();

    // Note: Replace 'Sample Blog Title' with the expected title or use a more flexible assertion
    expect(title).toBe('Sample Blog Title');
  });

  test('should display article blurb', async ({ page }) => {
    const blurb = await page.locator('p').textContent();
    // Note: Replace with the expected blurb or use a more flexible assertion
    expect(blurb).toContain('This is a sample blurb for the blog article.');
  });

  test('should display article image', async ({ page }) => {
    const imgSrc = await page.locator('img').getAttribute('src');
    // Note: Replace with the expected image path or use a more flexible assertion
    expect(imgSrc).toBeTruthy();
  });

  test('should load article content', async ({ page }) => {
    // This test assumes that the Builder.io content is loaded into an element with a specific class
    // You may need to adjust the selector based on how the content is actually rendered
    await expect(page.locator('.content')).toBeVisible();
  });
});
