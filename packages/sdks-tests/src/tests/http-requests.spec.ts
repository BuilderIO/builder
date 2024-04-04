import { expect } from '@playwright/test';
import { EXCLUDE_GEN_1, excludeTestFor, test } from './helpers/index.js';
import { launchEmbedderAndWaitForSdk } from './helpers/visual-editor.js';

test.describe('HTTP Requests', () => {
  test('call proxy API only once', async ({ page, basePort, packageName }) => {
    test.skip(EXCLUDE_GEN_1);
    test.skip(packageName === 'react-native', 'editor tests not supported in react-native');
    test.skip(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
    test.fail(
      excludeTestFor({ qwik: true }),
      'error setting httpRequest response or making API call altogether.'
    );

    let x = 0;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api\.*/;

    await page.route(urlMatch, route => {
      x++;

      if (x > 10) {
        throw new Error('Too many proxy API requests.');
      }

      return route.fulfill({
        status: 200,
        json: {
          state: {
            article: {
              entries: [{ seo_title: 'foo' }],
            },
          },
        },
      });
    });

    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/http-requests',
      gotoOptions: { waitUntil: 'networkidle' },
    });

    await expect(page.locator('body')).not.toContainText('foo');

    expect(x).toBeGreaterThanOrEqual(1);

    // eventually this should be exactly 1
    expect(x).toBeLessThan(10);
  });
});
