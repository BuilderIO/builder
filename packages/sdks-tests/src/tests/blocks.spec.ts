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
} from './helpers.js';

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
    await page.goto('/symbols-without-content');

    let x = 0;
    await page.route(
      /.*cdn\.builder\.io\/api\/v(\d)\/content\/symbol.*/,
      route => {
        x++;
        return route.fulfill({
          status: 200,
          body: x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT,
        });
      },
      { times: 2 }
    );

    await testSymbols(page);
  });

  test.describe('Columns', () => {
    excludeReactNative('renders columns', async ({ page }) => {
      await page.goto('/columns');

      const columns = page.locator('.builder-columns');

      await expect(columns).toHaveCount(5);

      type ColumnTypes =
        | 'stackAtTablet'
        | 'stackAtTabletReverse'
        | 'stackAtMobile'
        | 'stackAtMobileReverse'
        | 'neverStack';

      type Size = 'mobile' | 'tablet' | 'desktop';

      const sizes: Record<Size, { width: number; height: number }> = {
        mobile: { width: 300, height: 700 },
        tablet: { width: 930, height: 700 },
        desktop: { width: 1200, height: 700 },
      };

      const expected: Record<ColumnTypes, Record<Size, ExpectedStyles> & { index: number }> = {
        stackAtTablet: {
          index: 0,
          mobile: { 'flex-direction': 'column' },
          tablet: { 'flex-direction': 'column' },
          desktop: { 'flex-direction': 'row' },
        },
        stackAtTabletReverse: {
          index: 1,
          mobile: { 'flex-direction': 'column-reverse' },
          tablet: { 'flex-direction': 'column-reverse' },
          desktop: { 'flex-direction': 'row' },
        },
        stackAtMobile: {
          index: 2,
          mobile: { 'flex-direction': 'column' },
          tablet: { 'flex-direction': 'row' },
          desktop: { 'flex-direction': 'row' },
        },
        stackAtMobileReverse: {
          index: 3,
          mobile: { 'flex-direction': 'column-reverse' },
          tablet: { 'flex-direction': 'row' },
          desktop: { 'flex-direction': 'row' },
        },
        neverStack: {
          index: 4,
          mobile: { 'flex-direction': 'row' },
          tablet: { 'flex-direction': 'row' },
          desktop: { 'flex-direction': 'row' },
        },
      };

      for (const [sizeName, size] of Object.entries(sizes)) {
        await page.setViewportSize(size);

        for (const styles of Object.values(expected)) {
          await expectStylesForElement({
            locator: columns.nth(styles.index),
            expected: styles[sizeName as Size],
          });
        }
      }
    });
  });
});
