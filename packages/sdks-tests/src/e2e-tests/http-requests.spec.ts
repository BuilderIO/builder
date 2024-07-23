import { expect } from '@playwright/test';
import { excludeGen1, excludeTestFor, test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

test.describe('HTTP Requests', () => {
  test('call proxy API only once - in page', async ({ page, packageName, sdk }) => {
    test.skip(excludeGen1(sdk));
    test.fail(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

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

  test('call proxy API only once - in editor', async ({ page, basePort, packageName, sdk }) => {
    test.skip(excludeGen1(sdk));
    test.skip(packageName === 'react-native', 'editor tests not supported in react-native');
    test.skip(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.skip(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

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
