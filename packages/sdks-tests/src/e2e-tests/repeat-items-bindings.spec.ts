import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Repeat items bindings', () => {
  test('Updating state should display repeat collection', async ({ page, sdk }) => {
    test.fail(sdk === 'rsc', "NextJS SDK doesn't support state updates");

    await page.goto('/repeat-items-bindings/');
    const buttonLocator = page.getByText('Click me');
    await expect(buttonLocator).toBeVisible();
    await buttonLocator.click();
    await expect(page.locator('text=1')).toBeVisible();
    await expect(page.locator('text=2')).toBeVisible();
    await expect(page.locator('text=3')).toBeVisible();
    await expect(page.locator('text=4')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible();
  });

  test('repeat Symbols with content bound to content inputs should render correctly', async ({
    page,
  }) => {
    // here data prop is { products: [{ header: 'title1' }, { header: 'title2' }, { header: 'title3' }] }
    await page.goto('/symbol-with-repeat-input-binding');

    const promises = [];
    for (let i = 1; i <= 3; i++) {
      promises.push(expect(page.locator(`text=title${i}`)).toBeVisible());
    }
    await Promise.all(promises);
  });
});
