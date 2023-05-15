import { expect } from '@playwright/test';
import { isRNSDK, test } from './helpers.js';

test.describe('State binding', () => {
  test.describe('inside repeater', () => {
    test('writing to state should update binding', async ({ page, packageName }) => {
      if (
        isRNSDK ||
        packageName === 'e2e-react-native' ||
        packageName === 'e2e-vue2' ||
        packageName === 'e2e-solidjs' ||
        packageName === 'e2e-svelte' ||
        packageName === 'e2e-sveltekit'
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
