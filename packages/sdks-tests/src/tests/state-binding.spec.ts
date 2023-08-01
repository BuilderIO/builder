import { expect } from '@playwright/test';
import { isRNSDK, test } from './helpers.js';

test.describe('State binding', () => {
  test.describe('inside repeater', () => {
    test('writing to state should update binding', async ({ page, packageName }) => {
      /**
       * This only works in Qwik at the moment.
       */
      if (
        isRNSDK ||
        packageName === 'react-native' ||
        packageName === 'vue2' ||
        packageName === 'vue-nuxt2' ||
        packageName === 'solidjs' ||
        packageName === 'solid-start' ||
        packageName === 'svelte' ||
        packageName === 'sveltekit' ||
        packageName === 'nextjs-app-dir-rsc' ||
        packageName === 'vue3' ||
        packageName === 'vue-nuxt3'
      ) {
        test.skip();
        return;
      }

      await page.goto('/state-binding/', { waitUntil: 'networkidle' });
      await expect(page.locator('text=initial Name')).toContainText('initial Name');
      await page.click('text=first');
      await expect(page.locator('text=repeated set')).toContainText('repeated set');
    });
  });
});
