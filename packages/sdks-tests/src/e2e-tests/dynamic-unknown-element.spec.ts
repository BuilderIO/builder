import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Unknown Element', () => {
  test('unknown element is rendered', async ({ page, packageName }) => {
    test.skip(packageName === 'react-native-74' || packageName === 'react-native-76-fabric');
    await page.goto('/dynamic-unknown-element');

    const tagNameLocator = await page.locator('test');
    const tagNameId = await tagNameLocator.getAttribute('builder-id');

    expect(tagNameId).toBe('builder-493100cea9504d56886045462b65b481');
    await expect(tagNameLocator).toHaveAttribute('class','builder-493100cea9504d56886045462b65b481 builder-block');
    await expect(tagNameLocator).toHaveText('testing text');
  });
});
