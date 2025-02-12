import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('LivePreviewBlogData Component', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    const response = await page.goto('/live-preview');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should display blog details correctly', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/live-preview');
    await page.waitForLoadState('networkidle');

    const blogPreview = page.locator('.blog-data-preview');
    await expect(blogPreview).toBeVisible();

    //assert the blog details coming from builder data model
    await expect(blogPreview).toContainText('Blog Title: Welcome to Builder.io');
    await expect(blogPreview).toContainText('Authored by: John Doe');
    await expect(blogPreview).toContainText('Handle: john_doe');
    await expect(blogPreview).toContainText('Published date: Tue Feb 11 2025');
  });
});
