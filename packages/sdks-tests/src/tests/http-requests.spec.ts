import { expect } from '@playwright/test';
import { EXCLUDE_GEN_1, excludeTestFor, test } from './helpers/index.js';
import { launchEmbedderAndWaitForSdk } from './helpers/visual-editor.js';

test.describe('HTTP Requests', () => {
  test('call proxy API only once - in page', async ({ page, packageName }) => {
    test.skip(EXCLUDE_GEN_1);
    test.fail(packageName === 'next-app-dir', 'editor tests not supported in next-app-dir');
    test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
    test.fail(
      excludeTestFor({ qwik: true }),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api\.*/;

    await page.route(urlMatch, route => {
      x++;

      if (x > 10) {
        throw new Error('Too many proxy API requests.');
      }

      return route.fulfill({
        status: 200,
        json: { entries: [{ seo_title: 'foo' }] },
      });
    });

    await page.goto('/http-requests', { waitUntil: 'networkidle' });
    await expect(page.locator('body').getByText('foo')).toBeVisible();
    expect(x).toBe(1);
  });

  test('call proxy API only once - in editor', async ({ page, basePort, packageName }) => {
    test.skip(EXCLUDE_GEN_1);
    test.skip(packageName === 'react-native', 'editor tests not supported in react-native');
    test.skip(packageName === 'next-app-dir', 'editor tests not supported in next-app-dir');
    test.skip(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
    test.fail(
      excludeTestFor({ qwik: true }),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api\.*/;

    await page.route(urlMatch, route => {
      x++;

      if (x > 10) {
        throw new Error('Too many proxy API requests.');
      }

      return route.fulfill({
        status: 200,
        json: { entries: [{ seo_title: 'foo' }] },
      });
    });

    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/http-requests',
      gotoOptions: { waitUntil: 'networkidle' },
    });

    await expect(page.frameLocator('iframe').getByText('foo')).toBeVisible();

    // expect(x).toBeGreaterThanOrEqual(1);
    // eventually this should be exactly 1
    // expect(x).toBeLessThan(10);
    expect(x).toBe(1);
  });
});
