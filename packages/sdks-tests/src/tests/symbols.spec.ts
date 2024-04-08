import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { DEFAULT_TEXT_SYMBOL, FRENCH_TEXT_SYMBOL } from '../specs/symbol-with-locale.js';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/symbols.js';
import { EXCLUDE_GEN_2, excludeTestFor, isOldReactSDK, isRNSDK, test } from './helpers/index.js';
import type { PackageName } from './sdk.js';
import { sdk } from './sdk.js';

/**
 * These packages fetch symbol content on the server, so we cannot test them.
 */
const SSR_FETCHING_PACKAGES: (PackageName | 'DEFAULT')[] = ['next-app-dir', 'qwik-city'];

const testSymbols = async (page: Page) => {
  await expect(page.getByText('special test description').locator('visible=true')).toBeVisible();

  await expect(
    page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2"]'
      )
      .locator('visible=true')
  ).toBeVisible();

  await expect(page.getByText('default description').locator('visible=true')).toBeVisible();

  await expect(
    page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e"]'
      )
      .locator('visible=true')
  ).toBeVisible();

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
  test.fail(excludeTestFor({ angular: true }), 'Angular Gen2 SDK not implemented.');
  test('render correctly', async ({ page }) => {
    await page.goto('/symbols');

    await testSymbols(page);
  });
  test('fetch content if not provided', async ({ page, packageName }) => {
    test.fail(SSR_FETCHING_PACKAGES.includes(packageName));

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

  test('refresh on locale change', async ({ page }) => {
    // have to use `.skip()` because this test sometimes works in gen2 but flaky
    test.skip(EXCLUDE_GEN_2);

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

    await expect(page.locator('text=Default text')).toBeVisible();

    await page.click('text=click');

    await expect(page.locator('text=French text')).toBeVisible();

    await expect(x).toBeGreaterThanOrEqual(2);
  });

  test.describe('apiVersion', () => {
    test('apiVersion is not set', async ({ page, packageName }) => {
      test.fail(SSR_FETCHING_PACKAGES.includes(packageName));

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
      test.fail(SSR_FETCHING_PACKAGES.includes(packageName));
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

    test('apiVersion is set to v1', async ({ page }) => {
      test.fail(EXCLUDE_GEN_2);
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
  });

  test('works in nested symbols with inherit', async ({ packageName, page }) => {
    await page.goto('/nested-symbols');

    // gen1-remix and gen1-next are also skipped because React.useContext is not recognized
    // rsc skipped because it fetches the content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir'].includes(packageName));

    const symbols = page.locator('[builder-model="symbol"]');
    await expect(symbols).toHaveCount(2);
  });
});
