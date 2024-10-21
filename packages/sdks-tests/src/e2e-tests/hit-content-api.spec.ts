import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

test.describe('Get Content', () => {
  test('call content API only once - in page', async ({ page, sdk }) => {
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
  test('passes fetch options', async ({ page, sdk }) => {
    test.skip(!excludeGen1(sdk));

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content/;

    let headers: Record<string, string> = {};

    await page.route(urlMatch, route => {
      headers = route.request().headers();
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto('/with-fetch-options', { waitUntil: 'networkidle' });
    expect(headers['x-test']).toBe('test');
  });
});
