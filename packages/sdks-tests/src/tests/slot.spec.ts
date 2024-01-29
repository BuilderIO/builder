import { expect } from '@playwright/test';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/slot-with-symbol.js';
import { isRNSDK, test } from './helpers.js';
import { sdk } from './sdk.js';

test.describe('Slot', () => {
  test('slot should render', async ({ page, packageName }) => {
    // gen1-remix and gen1-next skipped because React.useContext is not recognized
    // rsc skipped because it fetches the slot content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir'].includes(packageName));
    await page.goto('/slot');
    await expect(page.locator('text=Inside a slot!!')).toBeVisible();
  });

  test('slot should render in the correct place', async ({ page, packageName }) => {
    // gen1-remix and gen1-next skipped because React.useContext is not recognized
    // rsc skipped because it fetches the slot content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir'].includes(packageName));
    await page.goto('/slot');
    const builderTextElements = isRNSDK
      ? page.locator('[data-testid="div"]')
      : page.locator('.builder-text');
    const count = await builderTextElements.count();
    expect(count).toBe(3);
    const slotElement = builderTextElements.nth(1);
    await expect(slotElement).toHaveText('Inside a slot!!');
  });

  test('slot should render with symbol (with content)', async ({ page, packageName }) => {
    // gen1-remix and gen1-next skipped because React.useContext is not recognized
    // rsc skipped because it fetches the slot content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir'].includes(packageName));
    await page.goto('/slot-with-symbol');

    await expect(page.locator('text=This is called recursion!')).toBeVisible();
  });

  test('slot should render with symbol (without content)', async ({ page, packageName }) => {
    // gen1-remix and gen1-next skipped because React.useContext is not recognized
    // ssr packages skipped because it fetches the slot content from the server
    test.fail(['gen1-remix', 'gen1-next', 'next-app-dir', 'qwik-city'].includes(packageName));

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

    await page.goto('/slot-without-symbol');

    await expect(page.locator('text=This is called recursion!')).toBeVisible();

    await expect(x).toBeGreaterThanOrEqual(2);
  });
});
