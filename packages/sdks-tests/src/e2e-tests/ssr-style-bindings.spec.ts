import { expect } from '@playwright/test';
import {
  //   checkIsRN,
  excludeGen2,
  //   expectStylesForElement,
  //   getClassSelector,
  isSSRFramework,
  test,
} from '../helpers/index.js';

test.describe.only('SSR style buildings', () => {
  test('data-binding-styles', async ({ browser, packageName, sdk }) => {
    test.skip(!isSSRFramework(packageName));
    test.skip(excludeGen2(sdk));

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/ssr-binding');
    const content = await page.content();
    console.log(content);
    await expect(page.locator(`text="This text should be red..."`)).toHaveCSS(
      'color',
      'rgb(255, 0, 0)'
    );
  });

  //   test('js enabled', async ({ page, sdk, packageName }) => {
  //     test.skip(!isSSRFramework(packageName));
  //     test.skip(excludeGen2(sdk));

  //     await page.goto('/content-bindings');

  //     const expected = {
  //       'border-top-left-radius': '10px',
  //       'border-top-right-radius': '22px',
  //       'border-bottom-left-radius': '40px',
  //       'border-bottom-right-radius': '30px',
  //     };

  //     const FIRST_BLOCK_SELECTOR = checkIsRN(sdk)
  //       ? // ScrollView adds an extra div wrapper
  //         `${getClassSelector('builder-blocks', sdk)} > div > div`
  //       : sdk === 'angular'
  //         ? `div[builder-id="builder-1098ca09970149b3bc4cd43643bd0545"]`
  //         : `${getClassSelector('builder-blocks', sdk)} > div`;

  //     const locator = page
  //       .locator(FIRST_BLOCK_SELECTOR)
  //       .filter({ hasText: 'Enter some text...' })
  //       .last();

  //     await expectStylesForElement({ expected, locator });
  //     // TODO: fix this
  //     // check the title is correct
  //   });

  //   test('js disabled', async ({ browser, sdk, packageName }) => {
  //     test.skip(!isSSRFramework(packageName));
  //     test.skip(excludeGen2(sdk));

  //     const context = await browser.newContext({
  //       javaScriptEnabled: false,
  //     });
  //     const page = await context.newPage();

  //     await page.goto('/content-bindings');

  //     const expected = {
  //       'border-top-left-radius': '10px',
  //       'border-top-right-radius': '22px',
  //       'border-bottom-left-radius': '40px',
  //       'border-bottom-right-radius': '30px',
  //     };

  //     const FIRST_BLOCK_SELECTOR = checkIsRN(sdk)
  //       ? // ScrollView adds an extra div wrapper
  //         `${getClassSelector('builder-blocks', sdk)} > div > div`
  //       : sdk === 'angular'
  //         ? `div[builder-id="builder-1098ca09970149b3bc4cd43643bd0545"]`
  //         : `${getClassSelector('builder-blocks', sdk)} > div`;

  //     const locator = page
  //       .locator(FIRST_BLOCK_SELECTOR)
  //       .filter({ hasText: 'Enter some text...' })
  //       .last();

  //     await expectStylesForElement({ expected, locator });
  //     // TODO: fix this
  //     // check the title is correct
  //   });
});
