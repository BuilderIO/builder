import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';
import { launchEmbedderAndWaitForSdk } from '../helpers/visual-editor.js';

const countriesResponse = {
  data: {
    countries: [
      {
        name: 'Andorra',
      },
      {
        name: 'United Arab Emirates',
      },
      {
        name: 'Afghanistan',
      },
      {
        name: 'Antigua and Barbuda',
      },
      {
        name: 'Anguilla',
      },
      {
        name: 'Albania',
      },
      {
        name: 'Armenia',
      },
    ],
  },
};

test.describe('HTTP Requests POST API', () => {
  test('call POST API only once - in page', async ({ page, packageName, sdk }) => {
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

    const urlMatch = /^https:\/\/cdn\.builder\.io\/api\/v2\/admin$/;

    await page.route(urlMatch, route => {
      if (route.request().method() === 'POST') {
        x++;

        if (x > 10) {
          throw new Error('Too many POST API requests.');
        }
        return route.fulfill({
          status: 200,
          json: countriesResponse,
        });
      }
    });

    await page.goto('/http-requests-post-api', { waitUntil: 'networkidle' });
    for (const country of countriesResponse.data.countries) {
      await expect(page.locator('body').getByText(country.name, { exact: true })).toBeVisible();
    }
    expect(x).toBe(1);
  });

  test('call POST API only once - in editor', async ({ page, basePort, packageName, sdk }) => {
    test.skip(
      packageName === 'react-native-74' || packageName === 'react-native-76-fabric',
      'editor tests not supported in react-native'
    );
    test.skip(
      packageName === 'nextjs-sdk-next-app',
      'editor tests not supported in nextjs-sdk-next-app'
    );
    test.fail(
      excludeTestFor({ qwik: true }, sdk),
      'error setting httpRequest response or making API call altogether.'
    );
    test.skip(excludeTestFor({ vue: true }, sdk), 'Vue flakiness issues');

    let x = 0;

    const urlMatch = /^https:\/\/cdn\.builder\.io\/api\/v2\/admin$/;

    await page.route(urlMatch, route => {
      if (route.request().method() === 'POST') {
        x++;

        if (x > 10) {
          throw new Error('Too many proxy API requests.');
        }

        return route.fulfill({
          status: 200,
          json: countriesResponse,
        });
      }
    });

    await launchEmbedderAndWaitForSdk({
      page,
      basePort,
      path: '/http-requests-post-api',
      sdk,
      gotoOptions: { waitUntil: 'networkidle' },
    });

    for (const country of countriesResponse.data.countries) {
      await expect(
        page.frameLocator('iframe').getByText(country.name, { exact: true })
      ).toBeVisible();
    }

    expect(x).toBe(1);
  });
});
