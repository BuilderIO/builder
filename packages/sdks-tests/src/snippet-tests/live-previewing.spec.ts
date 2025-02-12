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

    await expect(blogPreview).toContainText('Blog Title: Welcome to Builder.io');
    await expect(blogPreview).toContainText('Authored by: John Doe');
    await expect(blogPreview).toContainText('Handle: john_doe');

    const expectedDate = new Date().toDateString().split(' ').slice(0, 4).join(' ');

    console.log('expectedDate', expectedDate);

    const actualText = await blogPreview.textContent();

    expect(actualText).toContain(`Published date: ${expectedDate}`);
  });
});
