import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('State binding', () => {
  test.describe('inside repeater', () => {
    test('writing to state should update binding', async ({ page, packageName, sdk }) => {
      test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
      // hydration errors
      test.fail(packageName === 'gen1-next' || packageName === 'gen1-remix');

      // flaky, can't `test.fail()`
      test.skip(
        packageName === 'react-native' ||
          packageName === 'solid' ||
          packageName === 'solid-start' ||
          packageName === 'svelte' ||
          packageName === 'sveltekit' ||
          packageName === 'nextjs-sdk-next-app' ||
          packageName === 'vue' ||
          packageName === 'nuxt'
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
