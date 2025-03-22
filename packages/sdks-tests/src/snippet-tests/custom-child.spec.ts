import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Div with Hero class, and text', () => {
  test('should render the page without 404', async ({ page, packageName }) => {
    test.skip(
      ![
        'react',
        'angular-16',
        'angular-16-ssr',
        'gen1-remix',
        'gen1-react',
        'qwik-city',
        'react-sdk-next-14-app',
        'react-sdk-next-14-pages',
        'vue',
        'nuxt',
        'svelte',
        'sveltekit',
        'qwik-city',
        'hydrogen',
      ].includes(packageName)
    );

    const response = await page.goto('/custom-child');
    expect(response?.status()).toBeLessThan(400);
  });

  test('should verify builder-block with specific text', async ({ page, packageName }) => {
    test.skip(
      ![
        'react',
        'angular-16',
        'angular-16-ssr',
        'gen1-remix',
        'gen1-react',
        'qwik-city',
        'react-sdk-next-14-app',
        'react-sdk-next-14-pages',
        'vue',
        'nuxt',
        'svelte',
        'sveltekit',
        'qwik-city',
        'hydrogen',
      ].includes(packageName)
    );

    await page.goto('/custom-child');

    await page.waitForLoadState('networkidle');
    const builderBlock = page.locator('div.builder-block').first();
    await expect(builderBlock).toBeVisible();

    const column1Text = page.locator('text=This is text from your component');
    await expect(column1Text).toBeVisible();

    const column2Text = page.locator('text=This is Builder text');
    await expect(column2Text).toBeVisible();
  });
});
