import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('BlogArticleComponent', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(!['angular-16', 'angular-16-ssr', 'react'].includes(packageName));
    await page.goto('blogs/new-product-line');
  });

  test('should display correct article title', async ({ page }) => {
    const title = await page.locator('h1').textContent();
    expect(title).toBe('Sample Blog Title');
  });

  test('should display article blurb', async ({ page }) => {
    const blurb = await page.locator('p').textContent();
    expect(blurb).toContain('This is a sample blurb for the blog article.');
  });

  test('should display article image', async ({ page }) => {
    const imgSrc = await page.locator('img').nth(0).getAttribute('src');
    expect(imgSrc).toBeTruthy();
  });

  test('should load article content', async ({ page }) => {
    await expect(page.locator('.content')).toBeVisible();
  });
});
