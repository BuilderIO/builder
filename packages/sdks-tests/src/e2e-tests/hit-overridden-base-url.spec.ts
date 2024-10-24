import { expect } from '@playwright/test';
import { excludeGen1, test } from '../helpers/index.js';

test.describe.only('Hit Overridden Base Url', () => {
  test('call content API only once - in page', async ({ page, sdk }) => {
    test.skip(excludeGen1(sdk));

    const urlMatch = /https:\/\/cdn-qa\.builder\.io\/api/;

    let contentApiInvocations = 0;

    await page.route(urlMatch, route => {
      contentApiInvocations++;
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.route('**/*', route => {
      const request = route.request();

      // Log the request URL and method
      console.log(`API Call: ${request.method()} ${request.url()}`);

      // Continue with the request
      return route.continue();
    });

    await page.goto('/override-base-url', { waitUntil: 'domcontentloaded' });
    expect(contentApiInvocations).toBe(1);
  });
});
