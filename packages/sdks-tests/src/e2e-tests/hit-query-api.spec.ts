import { expect } from '@playwright/test';
import { excludeGen1, test, mapSdkName, getSdkGeneration } from '../helpers/index.js';

test.describe('Get Query', () => {
  test('call query API only once - in page', async ({ page, sdk }) => {
    test.skip(!excludeGen1(sdk));

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/query/;

    let queryApiInvocations = 0;
    let headers;

    await page.route(urlMatch, route => {
      queryApiInvocations++;
      headers = route.request().headers();
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto('/get-query', { waitUntil: 'networkidle' });
    expect(queryApiInvocations).toBe(1);

    // Check for new SDK headers
    expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
    expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
    expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
  });
});
