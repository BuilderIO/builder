import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

test.describe('Hit Overridden Base Url', () => {
  test('call custom API only once - in page', async ({ page, sdk }) => {
    test.skip(excludeGen1(sdk));

    let customApiInvocations = 0;

    await page.route('**/*', route => {
      if (route.request().url().startsWith('https://cdn-qa.builder.io/api/')) {
        customApiInvocations++;
      }
      return route.continue();
    });

    await page.goto('/override-base-url', { waitUntil: 'networkidle' });
    expect(customApiInvocations).toBe(1);
  });
});
