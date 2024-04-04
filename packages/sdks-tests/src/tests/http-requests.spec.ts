import { test } from './helpers/index.js';
import { launchEmbedderAndWaitForSdk } from './helpers/visual-editor.js';

test.describe('HTTP Requests', () => {
  test('call proxy API only once', async ({ page, basePort }) => {
    let x = 0;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api\.*/;

    await page.route(urlMatch, route => {
      x++;

      if (x > 10) {
        throw new Error('Too many proxy API requests.');
      }

      return route.fulfill({ status: 200, json: { foo: 'bar' } });
    });

    await launchEmbedderAndWaitForSdk({ page, basePort, path: '/http-requests' });
  });
});
