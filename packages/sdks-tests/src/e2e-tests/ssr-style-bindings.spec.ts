import { expect } from '@playwright/test';
import {
  //   checkIsRN,
  excludeGen2,
  //   expectStylesForElement,
  //   getClassSelector,
  isSSRFramework,
  test,
} from '../helpers/index.js';

test.describe('SSR style buildings', () => {
  test('when JavaScript is disabled', async ({ browser, packageName, sdk }) => {
    test.skip(!isSSRFramework(packageName));
    test.skip(excludeGen2(sdk));

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto('/ssr-binding');
    await expect(page.locator('div.builder-b166aa9350cb4f00852666910ff06991')).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)'
    );
  });

  test('when JavaScript is enabled', async ({ browser, packageName, sdk }) => {
    test.skip(!isSSRFramework(packageName));
    test.skip(excludeGen2(sdk));

    const context = await browser.newContext({
      javaScriptEnabled: true,
    });
    const page = await context.newPage();

    await page.goto('/ssr-binding');
    await expect(page.locator('div.builder-b166aa9350cb4f00852666910ff06991')).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)'
    );
  });
});
