import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/symbols.js';
import type { ExpectedStyles } from './helpers.js';
import {
  test,
  isRNSDK,
  excludeReactNative,
  testOnlyOldReact,
  testExcludeOldReact,
  isOldReactSDK,
} from './helpers.js';
import { sdk } from './sdk.js';
import { DEFAULT_TEXT_SYMBOL, FRENCH_TEXT_SYMBOL } from '../specs/symbol-with-locale.js';

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

test.describe('Blocks', () => {
  excludeReactNative('Text block', async ({ page }) => {
    await page.goto('/text-block');

    const textBlocks = page.locator('.builder-text');

    await expect(textBlocks).toHaveCount(3);

    const paragraphClasses = await textBlocks.nth(0).locator('*').all();
    const soloPTag = await textBlocks.nth(1).locator('*').first();
    const pTags = await textBlocks.nth(2).locator('*').all();

    for (const child of paragraphClasses) {
      await expect(child).toHaveCSS('margin-top', '0px');
      await expect(child).toHaveCSS('margin-bottom', '0px');
      await expect(child).toHaveCSS('margin-left', '0px');
      await expect(child).toHaveCSS('margin-right', '0px');
    }

    await expect(soloPTag).toHaveCSS('margin-top', '0px');
    await expect(soloPTag).toHaveCSS('margin-bottom', '0px');
    await expect(soloPTag).toHaveCSS('margin-left', '0px');
    await expect(soloPTag).toHaveCSS('margin-right', '0px');

    const [firstPTag, ...otherPTags] = pTags;

    await expect(firstPTag).toHaveCSS('margin-top', '0px');
    await expect(firstPTag).toHaveCSS('margin-bottom', '0px');
    await expect(firstPTag).toHaveCSS('margin-left', '0px');
    await expect(firstPTag).toHaveCSS('margin-right', '0px');

    for (const child of otherPTags) {
      await expect(child).toHaveCSS('margin-top', '16px');
      await expect(child).toHaveCSS('margin-bottom', '16px');
      await expect(child).toHaveCSS('margin-left', '0px');
      await expect(child).toHaveCSS('margin-right', '0px');
    }
  });
  /**
   * We are temporarily skipping this test because it relies on network requests.
   * TO-DO: re-enable it once we have a way to mock network requests.
   */
  test.skip('image', async ({ page }) => {
    await page.goto('/image');

    const imageLocator = page.locator('img');

    const expected: Record<string, string>[] = [
      // first img is a webp image. React Native SDK does not yet support webp.
      ...(isRNSDK
        ? []
        : [
            {
              width: '604px',
              height: '670.438px',
              'object-fit': 'cover',
            },
          ]),
      {
        width: '1264px',
        height: '240.156px',
        // RN SDK does not support object-fit
        'object-fit': isRNSDK ? 'fill' : 'cover',
      },
      {
        width: '604px',
        height: '120.797px',
        // RN SDK does not support object-fit
        'object-fit': isRNSDK ? 'fill' : 'contain',
      },
      {
        width: '1880px',
        height: '1245px',
      },
    ];

    await expect(imageLocator).toHaveCount(expected.length);

    const expectedVals = expected.map((val, i) => ({ val, i }));

    for (const { val, i } of Object.values(expectedVals)) {
      const image = imageLocator.nth(i);
      const expected = val;
      for (const property of Object.keys(expected)) {
        await expect(image).toHaveCSS(property, expected[property]);
      }
    }
  });

  test('symbols', async ({ page }) => {
    await page.goto('/symbols');

    await testSymbols(page);
  });
  test('symbols without content', async ({ page, packageName }) => {
    if (packageName === 'next-app-dir') test.skip();

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

  testOnlyOldReact('symbols refresh on locale change', async ({ page }) => {
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

  test.describe('Columns', () => {
    type ColumnTypes =
      | 'stackAtTablet'
      | 'stackAtTabletReverse'
      | 'stackAtMobile'
      | 'stackAtMobileReverse'
      | 'neverStack';

    type SizeName = 'mobile' | 'tablet' | 'desktop';
    type Size = {
      width: number;
      height: number;
    };

    const sizes: Record<SizeName, Size> = {
      mobile: { width: 300, height: 700 },
      tablet: { width: 930, height: 700 },
      desktop: { width: 1200, height: 700 },
    };

    type ColStyles = {
      columns: ExpectedStyles;
      column: ExpectedStyles;
    };

    const ROW: ColStyles = {
      columns: {
        'flex-direction': 'row',
      },
      column: {
        'margin-left': '20px',
      },
    };

    const NO_LEFT_MARGIN = { 'margin-left': '0px' } as const;

    const expected: Record<ColumnTypes, Record<SizeName, ColStyles> & { index: number }> = {
      stackAtTablet: {
        index: 0,
        mobile: { columns: { 'flex-direction': 'column' }, column: NO_LEFT_MARGIN },
        tablet: { columns: { 'flex-direction': 'column' }, column: NO_LEFT_MARGIN },
        desktop: ROW,
      },
      stackAtTabletReverse: {
        index: 1,
        mobile: { columns: { 'flex-direction': 'column-reverse' }, column: NO_LEFT_MARGIN },
        tablet: { columns: { 'flex-direction': 'column-reverse' }, column: NO_LEFT_MARGIN },
        desktop: ROW,
      },
      stackAtMobile: {
        index: 2,
        mobile: { columns: { 'flex-direction': 'column' }, column: NO_LEFT_MARGIN },
        tablet: ROW,
        desktop: ROW,
      },
      stackAtMobileReverse: {
        index: 3,
        mobile: { columns: { 'flex-direction': 'column-reverse' }, column: NO_LEFT_MARGIN },
        tablet: ROW,
        desktop: ROW,
      },
      neverStack: {
        index: 4,
        mobile: ROW,
        tablet: ROW,
        desktop: ROW,
      },
    };

    for (const entry of Object.entries(sizes)) {
      const [sizeName, size] = entry as [SizeName, Size];

      // only test mobile for RN
      if (isRNSDK && sizeName !== 'mobile') {
        test.skip();
      }

      test.describe(sizeName, () => {
        for (const [columnType, styles] of Object.entries(expected)) {
          test(columnType, async ({ page }) => {
            await page.setViewportSize(size);
            await page.goto('/columns');
            const columns = isRNSDK
              ? page.locator('[data-builder-block-name=builder-columns]')
              : page.locator('.builder-columns');

            await expect(columns).toHaveCount(5);
            for (const property of Object.keys(styles[sizeName].columns)) {
              await expect(columns.nth(styles.index)).toHaveCSS(
                property,
                styles[sizeName].columns[property]
              );
            }

            const columnLocator = isRNSDK
              ? columns.nth(styles.index).locator('[data-builder-block-name=builder-column]')
              : columns.nth(styles.index).locator('.builder-column');

            // first column should never have left margin
            await expect(columnLocator.nth(0)).toHaveCSS(
              'margin-left',
              NO_LEFT_MARGIN['margin-left']
            );

            const expected = styles[sizeName].column;
            for (const property of Object.keys(expected)) {
              await expect(columnLocator.nth(1)).toHaveCSS(property, expected[property]);
            }
          });
        }
      });
    }
  });

  test.describe('Test ApiVersion', () => {
    test('apiVersion is not set', async ({ page, packageName }) => {
      if (packageName === 'next-app-dir') test.skip();

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
      if (packageName === 'next-app-dir') test.skip();
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
      if (packageName === 'next-app-dir') test.skip();
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

  test('nested symbols with inherit', async ({ packageName, page }) => {
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
