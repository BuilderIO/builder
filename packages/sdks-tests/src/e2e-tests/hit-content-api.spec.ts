import { expect } from '@playwright/test';
import { excludeGen1, test, mapSdkName, getSdkGeneration } from '../helpers/index.js';

test.describe('Get Content', () => {
  test('call content API only once - in page', async ({ page, sdk }) => {
    test.skip(!excludeGen1(sdk));

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content/;

    let contentApiInvocations = 0;
    let headers;

    await page.route(urlMatch, route => {
      contentApiInvocations++;
      headers = route.request().headers();
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto('/get-content', { waitUntil: 'networkidle' });
    expect(contentApiInvocations).toBe(1);

    // Check for new SDK headers
    expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
    expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
    expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
  });
  test('passes fetch options', async ({ page, packageName }) => {
    test.skip(packageName !== 'gen1-next');

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/query/;
    const responsePromise = page.waitForResponse(urlMatch);

    await page.goto('/with-fetch-options', { waitUntil: 'networkidle' });

    const req = (await responsePromise).request();
    expect(req).toBeDefined();
    expect(await req!.postDataJSON()).toEqual({ test: 'test' });
    expect(req!.method()).toBe('POST');
  });
});
