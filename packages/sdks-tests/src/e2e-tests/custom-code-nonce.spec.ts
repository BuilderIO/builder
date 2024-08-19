import { expect, type Page } from '@playwright/test';
import { test } from '../helpers/index.js';

async function skipFetchingScriptContainingSrc(page: Page) {
  await page.route('**/*', route => {
    const request = route.request();

    if (request.url().includes('something')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '',
      });
    }
    return route.continue();
  });
}

test.describe('Nonce in Custom Code script and style tags', () => {
  test.beforeEach(async ({ page }) => {
    await skipFetchingScriptContainingSrc(page);
  });

  test('runnable script with code contains nonce', async ({ page, packageName }) => {
    test.skip(packageName !== 'react', 'Test only added for React SDK');
    await page.goto('/custom-code-nonce');

    const scriptInHead = page.locator('head').locator('script').last();
    const nonce = await scriptInHead.getAttribute('nonce');

    expect(nonce).toEqual('123');
  });
  test('script tag with src contains nonce', async ({ page, packageName }) => {
    test.skip(packageName !== 'react', 'Test only added for React SDK');
    await page.goto('/custom-code-nonce');

    const customCodeLocator = page.locator('.builder-custom-code');
    const scriptTag = customCodeLocator.locator('script').last();
    const nonce = await scriptTag.getAttribute('nonce');

    expect(nonce).toEqual('123');
  });
  test('style tag contains nonce', async ({ page, packageName }) => {
    test.skip(packageName !== 'react', 'Test only added for React SDK');
    await page.goto('/custom-code-nonce');

    const customCodeLocator = page.locator('.builder-custom-code');
    const styleTag = customCodeLocator.locator('style').first();
    const nonce = await styleTag.getAttribute('nonce');

    expect(nonce).toEqual('123');
  });
});
