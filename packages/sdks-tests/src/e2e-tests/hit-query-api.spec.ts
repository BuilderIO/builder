import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

test.describe('Get Query', () => {
  test('call query API only once - in page', async ({ page, packageName, sdk }) => {
    test.skip(!excludeGen1(sdk));

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
