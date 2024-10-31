import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { DEFAULT_TEXT_SYMBOL, FRENCH_TEXT_SYMBOL } from '../specs/symbol-with-locale.js';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/symbols.js';
import { excludeGen2, checkIsRN, test, mapSdkName, getSdkGeneration } from '../helpers/index.js';
import type { ServerName } from '../helpers/sdk.js';

/**
 * These packages fetch symbol content on the server, so we cannot test them.
 */
const SSR_FETCHING_PACKAGES: (ServerName | 'DEFAULT')[] = ['nextjs-sdk-next-app', 'qwik-city'];

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
  if (!checkIsRN) {
    // check desktop styles
    await expect(firstSymbolText).toHaveCSS('color', 'rgb(255, 0, 0)');

    // resize to tablet
    await page.setViewportSize({ width: 930, height: 1000 });
    await expect(firstSymbolText).toHaveCSS('color', 'rgb(0, 255, 6)');

    // resize to mobile
    await page.setViewportSize({ width: 400, height: 1000 });
  }

  // TO-DO: fix react native style inheritance for symbols->Text (using HTML renderer component), so we can unblock this.
  if (!checkIsRN) {
    // check mobile styles
    await expect(firstSymbolText).toHaveCSS('color', 'rgb(0, 255, 255)');
  }
};

test.describe('Symbols', () => {
  test('render correctly', async ({ page }) => {
    await page.goto('/symbols');

    await testSymbols(page);
  });
  test('fetch content if not provided', async ({ page, packageName, sdk }) => {
    test.fail(SSR_FETCHING_PACKAGES.includes(packageName));

    let x = 0;
    let headers;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content\/symbol\.*/;

    await page.route(urlMatch, route => {
      x++;
      headers = route.request().headers();

      return route.fulfill({
        status: 200,
        json: {
          results: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
        },
      });
    });

    await page.goto('/symbols-without-content');

    await testSymbols(page);

    await expect(x).toBeGreaterThanOrEqual(2);

    // Check for new SDK headers
    expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
    expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
    expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
  });

  test('refresh on locale change', async ({ page, sdk }) => {
    // have to use `.skip()` because this test sometimes works in gen2 but flaky
    test.skip(excludeGen2(sdk));

    let x = 0;
    let headers;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content\/symbol\.*/;

    await page.route(urlMatch, route => {
      x++;
      headers = route.request().headers();

      return route.fulfill({
        status: 200,
        json: {
          results: [x === 1 ? DEFAULT_TEXT_SYMBOL : FRENCH_TEXT_SYMBOL],
        },
      });
    });

    await page.goto('/symbol-with-locale');

    await expect(page.locator('text=Default text')).toBeVisible();

    await page.click('text=click');

    await expect(page.locator('text=French text')).toBeVisible();

    await expect(x).toBeGreaterThanOrEqual(2);

    // Check for new SDK headers
    expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
    expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
    expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
  });

  test.describe('apiVersion', () => {
    test('apiVersion is not set', async ({ page, packageName, sdk }) => {
      test.fail(SSR_FETCHING_PACKAGES.includes(packageName));

      let x = 0;
      let headers;

      const urlMatch = /.*cdn\.builder\.io\/api\/v3\/content\/symbol.*/;

      await page.route(urlMatch, route => {
        x++;
        headers = route.request().headers();

        return route.fulfill({
          status: 200,
          json: {
            results: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
          },
        });
      });

      await page.goto('/api-version-default');

      await testSymbols(page);

      await expect(x).toBeGreaterThanOrEqual(2);

      // Check for new SDK headers
      expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
      expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
      expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
    });

    test('apiVersion is set to v3', async ({ page, packageName, sdk }) => {
      test.fail(SSR_FETCHING_PACKAGES.includes(packageName));
      let x = 0;
      let headers;

      const urlMatch = /.*cdn\.builder\.io\/api\/v3\/content\/symbol.*/;

      await page.route(urlMatch, route => {
        x++;
        headers = route.request().headers();

        return route.fulfill({
          status: 200,
          json: {
            results: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
          },
        });
      });

      await page.goto('/api-version-v3');

      await testSymbols(page);

      await expect(x).toBeGreaterThanOrEqual(2);

      // Check for new SDK headers
      expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
      expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
      expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
    });
  });

  test('works in nested symbols with inherit', async ({ packageName, page, sdk }) => {
    await page.goto('/nested-symbols');

    // gen1-remix and gen1-next are also skipped because React.useContext is not recognized
    test.fail(['gen1-remix', 'gen1-next'].includes(packageName));

    let selector = '[builder-model="symbol"]';
    if (checkIsRN(sdk)) {
      selector = '[data-class="builder-symbol"]';
    }
    const symbols = page.locator(selector);
    await expect(symbols).toHaveCount(2);
  });
});
