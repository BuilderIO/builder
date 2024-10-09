import { expect } from '@playwright/test';
import { excludeGen1, excludeTestFor, test } from '../helpers/index.js';

test.describe('Get Query', () => {
  test('call query API only once - in page', async ({ page, packageName, sdk }) => {
    test.skip(!excludeGen1(sdk));
    test.fail(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/query/;

    let queryApiInvocations = 0;

    await page.route(urlMatch, route => {
      queryApiInvocations++;
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto('/get-query', { waitUntil: 'networkidle' });
    expect(queryApiInvocations).toBe(1);
  });
});
