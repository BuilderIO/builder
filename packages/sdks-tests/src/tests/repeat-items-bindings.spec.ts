import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Repeat items bindings', () => {
  test('Updating state should display repeat collection', async ({ page, packageName }) => {
    // hydration errors
    // test.fail(packageName === 'gen1-next' || packageName === 'gen1-remix');

    // // flaky, can't `test.fail()`
    // test.skip(
    //   isRNSDK ||
    //     packageName === 'react-native' ||
    //     packageName === 'vue2' ||
    //     packageName === 'nuxt2' ||
    //     packageName === 'solid' ||
    //     packageName === 'solid-start' ||
    //     packageName === 'svelte' ||
    //     packageName === 'sveltekit' ||
    //     packageName === 'next-app-dir' ||
    //     packageName === 'vue3' ||
    //     packageName === 'nuxt3'
    // );

    await page.goto('/repeat-items-bindings/');
    const buttonLocator = page.getByText('Hover over me');
    await expect(buttonLocator).toBeVisible();
    await buttonLocator.hover();
    await expect(page.locator('text=1')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible();
    await expect(page.locator('text=4')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible();
  });
});
