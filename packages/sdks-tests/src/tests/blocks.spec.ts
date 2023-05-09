import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/symbols.js';
import type { ExpectedStyles } from './helpers.js';
import {
  test,
  findTextInPage,
  isRNSDK,
  expectStyleForElement,
  excludeReactNative,
  expectStylesForElement,
  testOnlyOldReact,
  testExcludeOldReact,
  isOldReactSDK,
} from './helpers.js';
import { sdk } from './sdk.js';

const testSymbols = async (page: Page) => {
  await findTextInPage({ page, text: 'special test description' });
  await page
    .locator(
      '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2"]'
    )
    .isVisible();
  await findTextInPage({ page, text: 'default description' });
  await page
    .locator(
      '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e"]'
    )
    .isVisible();

  const firstSymbolText = await page.locator('text="Description of image:"').first();

  // these are desktop and tablet styles, and will never show up in react native
  if (!isRNSDK) {
    // check desktop styles
    await expectStyleForElement({
      locator: firstSymbolText,
      cssProperty: 'color',
      expectedValue: 'rgb(255, 0, 0)',
    });

    // resize to tablet
    await page.setViewportSize({ width: 930, height: 1000 });
    await expectStyleForElement({
      locator: firstSymbolText,
      cssProperty: 'color',
      expectedValue: 'rgb(0, 255, 6)',
    });

    // resize to mobile
    await page.setViewportSize({ width: 400, height: 1000 });
  }

  // TO-DO: fix react native style inheritance for symbols->Text (using HTML renderer component), so we can unblock this.
  if (!isRNSDK) {
    // check mobile styles
    await expectStyleForElement({
      locator: firstSymbolText,
      cssProperty: 'color',
      expectedValue: 'rgb(0, 255, 255)',
    });
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

    const NO_MARGIN_STYLES = {
      'margin-top': '0px',
      'margin-bottom': '0px',
      'margin-left': '0px',
      'margin-right': '0px',
    };

    for (const child of paragraphClasses) {
      await expectStylesForElement({
        locator: child,
        expected: NO_MARGIN_STYLES,
      });
    }
    await expectStylesForElement({
      locator: soloPTag,
      expected: NO_MARGIN_STYLES,
    });

    const [firstPTag, ...otherPTags] = pTags;

    await expectStylesForElement({
      locator: firstPTag,
      expected: NO_MARGIN_STYLES,
    });

    for (const child of otherPTags) {
      await expectStylesForElement({
        locator: child,
        expected: {
          'margin-top': '16px',
          'margin-bottom': '16px',
          'margin-left': '0px',
          'margin-right': '0px',
        },
      });
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
      await expectStylesForElement({ locator: image, expected: val });
    }
  });

  test('symbols', async ({ page }) => {
    await page.goto('/symbols');

    await testSymbols(page);
  });
  test('symbols without content', async ({ page }) => {
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

    const NO_LEFT_MARGIN = { 'margin-left': '0px' };

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
            await expectStylesForElement({
              locator: columns.nth(styles.index),
              expected: styles[sizeName].columns,
            });

            const columnLocator = isRNSDK
              ? columns.nth(styles.index).locator('[data-builder-block-name=builder-column]')
              : columns.nth(styles.index).locator('.builder-column');

            // first column should never have left margin
            await expectStylesForElement({
              locator: columnLocator.nth(0),
              expected: NO_LEFT_MARGIN,
            });

            await expectStylesForElement({
              locator: columnLocator.nth(1),
              expected: styles[sizeName].column,
            });
          });
        }
      });
    }
  });

  test.describe('Test ApiVersion', () => {
    test('apiVersion in SDKs is not set', async ({ page }) => {
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

    test('apiVersion in SDKs is set to v3', async ({ page }) => {
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

    testOnlyOldReact('apiVersion in old react is set to v1', async ({ page }) => {
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

    testExcludeOldReact('apiVersion in new SDKs is set to v2', async ({ page }) => {
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
});
