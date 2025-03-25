import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('BlogArticleComponent', () => {
  test.beforeEach(async ({ page, packageName }) => {
    test.skip(
      [
        'react-native-74',
        'react-native-76-fabric',
        'solid',
        'solid-start',
        'gen1-next15-app',
        'gen1-next14-pages',
        'gen1-remix',
        'gen1-react',
        'react',
        'qwik-city',
        'hydrogen',
        'svelte',
        'sveltekit',
        'nextjs-sdk-next-app',
        'angular-19-ssr',
        'react-sdk-next-pages',
        'react-sdk-next-14-app',
      ].includes(packageName)
    );
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
