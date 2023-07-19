import { expect } from '@playwright/test';
import { isRNSDK, test } from './helpers.js';

test.describe('State binding', () => {
  test.describe('inside repeater', () => {
    test('writing to state should update binding', async ({ page, packageName }) => {
      if (
        isRNSDK ||
        packageName === 'e2e-react-native' ||
        packageName === 'e2e-vue2' ||
        packageName === 'e2e-vue-nuxt2' ||
        packageName === 'e2e-solidjs' ||
        packageName === 'e2e-solid-start' ||
        packageName === 'e2e-svelte' ||
        packageName === 'e2e-sveltekit' ||
        packageName === 'e2e-nextjs-app-dir-rsc' ||
        packageName === 'e2e-vue3'
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
