import { expect } from '@playwright/test';
import { excludeTestFor, isSSRFramework, test } from '../helpers/index.js';

test.describe('JS Code', () => {
  test('runs code', async ({ page }) => {
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=jsCode text');
    await expect(menuLocator).toBeVisible();
  });
  test('functions jsCode adds to context are callable from block actions', async ({
    page,
    sdk,
  }) => {
    test.skip(excludeTestFor(['qwik', 'rsc'], sdk));

    await page.goto('/js-code-context/');
    await expect(page.locator('text=count: 0')).toBeVisible();
    await page.getByText('Increment').click();
    await expect(page.locator('text=count: 1')).toBeVisible();
  });
  test('state writes from jsCode functions keep state merged in later', async ({ page, sdk }) => {
    test.skip(
      sdk !== 'react',
      'Covers the React jsCode state writer; the route mock also cannot reach server-side httpRequests fetches.'
    );

    await page.route(/https:\/\/cdn\.builder\.io\/api\/v1\/proxy-api.*/, route =>
      route.fulfill({ status: 200, json: { title: 'fetched' } })
    );
    await page.goto('/js-code-context-http/');
    await expect(page.locator('text=article: fetched')).toBeVisible();
    await page.getByText('Increment').click();
    await expect(page.locator('text=count: 1')).toBeVisible();
    await expect(page.locator('text=article: fetched')).toBeVisible();
  });
  test('runs code (after client-side navigation)', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    const jsCodeLink = await links.filter({ hasText: 'JS Code' });

    await expect(jsCodeLink).toHaveCount(1);
    await jsCodeLink.click();

    const menuLocator = page.locator('text=jsCode text');
    await expect(menuLocator).toBeVisible();
  });

  test('runs code in SSR (JS disabled)', async ({ browser, packageName }) => {
    test.fail(!isSSRFramework(packageName));

    const context = await browser.newContext({
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/js-code/');
    const menuLocator = page.locator('text=jsCode text');
    await expect(menuLocator).toBeVisible();
  });
  test('runs code inside Browser.isBrowser', async ({ page, sdk }) => {
    // doesn't work for these as they are SSR frameworks without a hydration step.
    // therefore jsCode blocks are not run on the client at all
    test.skip(excludeTestFor(['qwik', 'rsc'], sdk));

    const msgPromise = page.waitForEvent('console', msg => msg.text().includes('hello world'));

    await page.goto('/js-content-is-browser');
    await msgPromise;
  });

  test('runs code inside Browser.isBrowser (after client-side navigation)', async ({
    page,
    sdk,
  }) => {
    // this isn't really client-side navigation in most frameworks
    // except for sveltekit I think which automatically hijacks anchor tags

    // therefore this test is not applicable to these frameworks which will ssr the page
    test.skip(excludeTestFor(['qwik', 'rsc'], sdk));

    await page.goto('/');
    const msgPromise = page.waitForEvent('console', msg => msg.text().includes('hello world'));

    const links = page.locator('a');

    const jsCodeLink = await links.filter({ hasText: 'JS isBrowser code' });

    await expect(jsCodeLink).toHaveCount(1);

    await jsCodeLink.click();
    await msgPromise;
  });
});
