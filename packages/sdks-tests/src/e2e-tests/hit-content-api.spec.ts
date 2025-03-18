import { expect } from '@playwright/test';
import { excludeGen1, test, mapSdkName, getSdkGeneration } from '../helpers/index.js';
import { FIRST_SYMBOL_CONTENT, SECOND_SYMBOL_CONTENT } from '../specs/symbols.js';

test.describe('Get Content', () => {
  test('call content API only once - in page', async ({ page, sdk }) => {
    test.skip(!excludeGen1(sdk));

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content/;

    let contentApiInvocations = 0;
    let headers;

    await page.route(urlMatch, route => {
      contentApiInvocations++;
      headers = route.request().headers();
      return route.fulfill({
        status: 200,
        json: {},
      });
    });

    await page.goto('/get-content', { waitUntil: 'networkidle' });
    expect(contentApiInvocations).toBe(1);

    // Check for new SDK headers
    expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
    expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
    expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
  });
  test('passes fetch options', async ({ page, packageName }) => {
    test.skip(packageName !== 'gen1-next14-pages' && packageName !== 'gen1-next15-app');

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/query/;
    const responsePromise = page.waitForResponse(urlMatch);

    await page.goto('/with-fetch-options', { waitUntil: 'networkidle' });

    const req = (await responsePromise).request();
    expect(req).toBeDefined();
    expect(await req!.postDataJSON()).toEqual({ test: 'test' });
    expect(req!.method()).toBe('POST');
  });
  test('fetch symbol with query.id', async ({ page, sdk, packageName }) => {
    test.skip(!excludeGen1(sdk));
    test.skip(packageName !== 'gen1-next14-pages');

    let x = 0;
    let headers;

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content\/symbol/;

    const urls: string[] = [];

    await page.route(urlMatch, route => {
      x++;
      headers = route.request().headers();

      const url = new URL(route.request().url());
      urls.push(url.href);
      return route.fulfill({
        status: 200,
        json: {
          results: [x === 0 ? FIRST_SYMBOL_CONTENT : SECOND_SYMBOL_CONTENT],
        },
      });
    });

    await page.goto('/get-content-with-symbol', { waitUntil: 'networkidle' });

    await expect(x).toBeGreaterThanOrEqual(2);

    urls.forEach(url => {
      expect(url).toContain('query.id=29ab534d62c4406c8500e1cbfa609537');
    });

    // Check for new SDK headers
    expect(headers?.['x-builder-sdk']).toBe(mapSdkName(sdk));
    expect(headers?.['x-builder-sdk-gen']).toBe(getSdkGeneration(sdk));
    expect(headers?.['x-builder-sdk-version']).toMatch(/\d+\.\d+\.\d+/); // Check for semver format
  });

  test.only('should include componentsUsed by default when omit is empty string', async ({ page, sdk, packageName }) => {
    test.skip(!excludeGen1(sdk));
    test.skip(packageName === 'gen1-next14-pages');

    const urlMatch = /https:\/\/cdn\.builder\.io\/api\/v3\/content/;
    let requestUrl: string | undefined;

    await page.route(urlMatch, async route => {
      requestUrl = route.request().url();
      return route.fulfill({
        status: 200,
        json: {
          meta: {
            componentsUsed: {
              MyFunComponent: 1,
            },
          }
        }
      });
    });

    await page.goto('/get-content-with-omit', { waitUntil: 'networkidle' });

    // Add null check before assertions
    expect(requestUrl).toBeDefined();
    expect(requestUrl!).not.toContain('omit=meta.componentsUsed');
    expect(requestUrl!.includes('omit=')).toBeTruthy();
    expect(new URL(requestUrl!).searchParams.get('omit')).toBe('');
  });
});
