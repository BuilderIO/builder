import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Unknown Element', () => {
  test.only('unknown element is rendered', async ({ page, packageName }) => {
    test.skip(packageName === 'react-native');
    await page.goto('/dynamic-unknown-element');

    const testTagName = await page.locator('test');

    const testTagNameId = await testTagName?.getAttribute('builder-id', { timeout: 10000 });
    const testTagNameClass = await testTagName?.getAttribute('class', { timeout: 10000 });

    expect(testTagNameId).toBe('builder-493100cea9504d56886045462b65b481');
    expect(testTagNameClass?.includes('builder-493100cea9504d56886045462b65b481')).toBe(true);

  });
});
