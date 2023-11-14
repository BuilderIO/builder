import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/symbols.js';
import { test, isRNSDK, testOnlyOldReact, testExcludeOldReact, isOldReactSDK } from './helpers.js';
import type { PackageName } from './sdk.js';
import { sdk } from './sdk.js';
import { DEFAULT_TEXT_SYMBOL, FRENCH_TEXT_SYMBOL } from '../specs/symbol-with-locale.js';

/**
 * These packages fetch symbol content on the server, so we cannot test them.
 */
const SSR_FETCHING_PACKAGES: (PackageName | 'DEFAULT')[] = ['next-app-dir', 'qwik-city'];

const testSymbols = async (page: Page) => {
  await page.getByText('special test description').locator('visible=true').waitFor();

  await page
    .locator(
      '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2"]'
    )
    .locator('visible=true')
    .waitFor();

  await page.getByText('default description').locator('visible=true').waitFor();

  await page
    .locator(
      '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e"]'
    )
    .locator('visible=true')
    .waitFor();

  const firstSymbolText = await page.locator('text="Description of image:"').first();

  // these are desktop and tablet styles, and will never show up in react native
  if (!isRNSDK) {
    // check desktop styles
    await expect(firstSymbolText).toHaveCSS('color', 'rgb(255, 0, 0)');

    // resize to tablet
    await page.setViewportSize({ width: 930, height: 1000 });
    await expect(firstSymbolText).toHaveCSS('color', 'rgb(0, 255, 6)');

    // resize to mobile
    await page.setViewportSize({ width: 400, height: 1000 });
  }

  // TO-DO: fix react native style inheritance for symbols->Text (using HTML renderer component), so we can unblock this.
  if (!isRNSDK) {
    // check mobile styles
    await expect(firstSymbolText).toHaveCSS('color', 'rgb(0, 255, 255)');
  }
};

test.describe('Symbols', () => {
  test('render correctly', async ({ page }) => {
    await page.goto('/symbols');

    await testSymbols(page);
  });
  test('fetch content if not provided', async ({ page, packageName }) => {
    test.skip(SSR_FETCHING_PACKAGES.includes(packageName));

    let x = 0;

    const urlMatch =
      sdk === 'oldReact'
        ? 'https://cdn.builder.io/api/v3/query/abcd/symbol*'
        : /https:\/\/cdn\.builder\.io\/api\/v3\/content\/symbol\.*/;

    await page.route(urlMatch, route => {
      x++;

      const url = new URL(route.request().url());

      const keyName =
        sdk === 'oldReact' ? decodeURIComponent(url.pathname).split('/').reverse()[0] : 'results';

      return route.fulfill({
        status: 200,
        json: {
          [keyName]: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
        },
      });
    });

    await page.goto('/symbols-without-content');

    await testSymbols(page);

    await expect(x).toBeGreaterThanOrEqual(2);
  });

  testOnlyOldReact('refresh on locale change', async ({ page }) => {
    let x = 0;

    const urlMatch =
      sdk === 'oldReact'
        ? 'https://cdn.builder.io/api/v3/query/abcd/symbol*'
        : /https:\/\/cdn\.builder\.io\/api\/v3\/content\/symbol\.*/;

    await page.route(urlMatch, route => {
      x++;

      const url = new URL(route.request().url());

      const keyName =
        sdk === 'oldReact' ? decodeURIComponent(url.pathname).split('/').reverse()[0] : 'results';

      return route.fulfill({
        status: 200,
        json: {
          [keyName]: [x === 1 ? DEFAULT_TEXT_SYMBOL : FRENCH_TEXT_SYMBOL],
        },
      });
    });

    await page.goto('/symbol-with-locale');

    await page.waitForSelector('text=Default text');

    await page.click('text=click');

    await page.waitForSelector('text=French text');

    await expect(x).toBeGreaterThanOrEqual(2);
  });

  test.describe('apiVersion', () => {
    test('apiVersion is not set', async ({ page, packageName }) => {
      test.skip(SSR_FETCHING_PACKAGES.includes(packageName));

      let x = 0;

      const urlMatch = isOldReactSDK
        ? 'https://cdn.builder.io/api/v3/query/abcd/symbol*'
        : /.*cdn\.builder\.io\/api\/v3\/content\/symbol.*/;

      await page.route(urlMatch, route => {
        x++;

        const url = new URL(route.request().url());

        const keyName = isOldReactSDK
          ? decodeURIComponent(url.pathname).split('/').reverse()[0]
          : 'results';

        return route.fulfill({
          status: 200,
          json: {
            [keyName]: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
          },
        });
      });

      await page.goto('/api-version-default');

      await testSymbols(page);

      await expect(x).toBeGreaterThanOrEqual(2);
    });

    test('apiVersion is set to v3', async ({ page, packageName }) => {
      test.skip(SSR_FETCHING_PACKAGES.includes(packageName));
      let x = 0;

      const urlMatch = isOldReactSDK
        ? 'https://cdn.builder.io/api/v3/query/abcd/symbol*'
        : /.*cdn\.builder\.io\/api\/v3\/content\/symbol.*/;

      await page.route(urlMatch, route => {
        x++;

        const url = new URL(route.request().url());

        const keyName = isOldReactSDK
          ? decodeURIComponent(url.pathname).split('/').reverse()[0]
          : 'results';

        return route.fulfill({
          status: 200,
          json: {
            [keyName]: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
          },
        });
      });

      await page.goto('/api-version-v3');

      await testSymbols(page);

      await expect(x).toBeGreaterThanOrEqual(2);
    });

    testOnlyOldReact('apiVersion is set to v1', async ({ page }) => {
      let x = 0;

      const urlMatch = 'https://cdn.builder.io/api/v1/query/abcd/symbol*';

      await page.route(urlMatch, route => {
        x++;

        const url = new URL(route.request().url());

        const keyName = decodeURIComponent(url.pathname).split('/').reverse()[0];

        return route.fulfill({
          status: 200,
          json: {
            [keyName]: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
          },
        });
      });

      await page.goto('/api-version-v1');

      await testSymbols(page);

      await expect(x).toBeGreaterThanOrEqual(2);
    });

    testExcludeOldReact('apiVersion is set to v2', async ({ page, packageName }) => {
      test.skip(SSR_FETCHING_PACKAGES.includes(packageName));
      let x = 0;

      const urlMatch = /.*cdn\.builder\.io\/api\/v2\/content\/symbol.*/;

      await page.route(urlMatch, route => {
        x++;

        const keyName = 'results';

        return route.fulfill({
          status: 200,
          json: {
            [keyName]: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
          },
        });
      });

      await page.goto('/api-version-v2');

      await testSymbols(page);

      await expect(x).toBeGreaterThanOrEqual(2);
    });
  });

  test('works in nested symbols with inherit', async ({ packageName, page }) => {
    await page.goto('/nested-symbols');

    // Skipping the test as v2 sdks currently don't support Slot
    // gen1-remix and gen1-next are also skipped because React.useContext is not recognized
    if (
      [
        'react-native',
        'solid',
        'solid-start',
        'qwik-city',
        'next-pages-dir',
        'next-app-dir-client',
        'next-app-dir',
        'react',
        'vue2',
        'vue3',
        'nuxt3',
        'nuxt2',
        'svelte',
        'sveltekit',
        'gen1-remix',
        'gen1-next',
      ].includes(packageName)
    ) {
      test.skip();
    }

    const symbols = page.locator('[builder-model="symbol"]');
    await expect(symbols).toHaveCount(2);
  });
});
