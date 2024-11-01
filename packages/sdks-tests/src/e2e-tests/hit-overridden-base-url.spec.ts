import { excludeGen1, test } from '../helpers/index.js';

test.describe('Hit Overridden Base Url', () => {
  test('call custom API only once - in page', async ({ page, sdk }) => {
    test.skip(excludeGen1(sdk));

    // Set up request monitoring
    const reqPromise = page.waitForEvent('request', request =>
      request.url().startsWith('https://cdn-qa.builder.io/api/')
    );

    // Start navigation and wait for the specific API request
    await page.goto('/override-base-url');

    await reqPromise;
  });
});
