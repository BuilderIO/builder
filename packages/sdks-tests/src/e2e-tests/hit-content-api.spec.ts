import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

test.describe('Get Content', () => {
  test('call content API only once - in page', async ({ page, packageName, sdk }) => {
    test.skip(!excludeGen1(sdk));

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content/;

    let contentApiInvocations = 0;

    await page.route(urlMatch, route => {
      contentApiInvocations++;
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto('/get-content', { waitUntil: 'networkidle' });
    expect(contentApiInvocations).toBe(1);
  });
});
