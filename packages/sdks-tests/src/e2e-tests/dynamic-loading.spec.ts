import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Dynamic loading of custom components', () => {
  test('LazyComponent only loads when requested', async ({ page, packageName }) => {
    test.skip(packageName !== 'sveltekit');
    await page.goto('/dynamic-loading');

    let lazyComponentRequested = false;

    page.on('request', request => {
      if (request.url().includes('LazyComponent')) {
        lazyComponentRequested = true;
      }
    });

    await page.waitForLoadState('networkidle');

    expect(lazyComponentRequested).toBe(false);

    const button = page.locator('text=Click me!');
    await button.click();

    expect(lazyComponentRequested).toBe(true);
  });

  test('NotLazyComponent loads immediately even if not requested', async ({
    page,
    packageName,
  }) => {
    test.skip(packageName !== 'sveltekit');
    await page.goto('/dynamic-loading');

    let notLazyComponentRequested = false;

    page.on('requestfinished', request => {
      void (async () => {
        if (request.resourceType() === 'document' || request.resourceType() === 'script') {
          const response = await request.response();
          const responseBody = await response?.text();

          if (responseBody?.includes('Not lazy component loaded')) {
            // its bundled and sent in the initial requests
            // even if we haven't clicked the button
            notLazyComponentRequested = true;
          }
        }
      })();
    });

    await page.waitForLoadState('networkidle');

    expect(notLazyComponentRequested).toBe(true);
  });
});
