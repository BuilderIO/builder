import { expect } from '@playwright/test';
import { isRNSDK, test } from './helpers.js';

test.describe('State binding', () => {
  test.describe('inside repeater', () => {
    test('writing to state should update binding', async ({ page, packageName }) => {
      // flaky, can't `test.fail()`
      test.skip(
        isRNSDK ||
          packageName === 'react-native' ||
          packageName === 'vue2' ||
          packageName === 'nuxt2' ||
          packageName === 'solid' ||
          packageName === 'solid-start' ||
          packageName === 'svelte' ||
          packageName === 'sveltekit' ||
          packageName === 'next-app-dir' ||
          packageName === 'vue3' ||
          packageName === 'nuxt3'
      );

      await page.goto('/state-binding/', { waitUntil: 'networkidle' });
      await expect(page.locator('text=initial Name')).toBeVisible();
      const buttonLocator = page.getByText('first');
      await expect(buttonLocator).toBeVisible();
      await buttonLocator.click();
      await expect(page.locator('text=repeated set')).toBeVisible();
    });
  });
});
