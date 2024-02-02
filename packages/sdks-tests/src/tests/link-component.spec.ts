import { expect } from '@playwright/test';
import { test } from './helpers.js';

const testLinkComponent = (path: string) => {
  test('renders regular anchor element by default', async ({ page }) => {
    await page.goto(path);

    const links = page.locator('a');
    const columnsLink = await links.filter({
      hasText: 'Custom Link',
    });

    await expect(columnsLink).toHaveCount(0);
  });
  test('renders custom link component when provided', async ({ page, packageName }) => {
    test.fail(packageName !== 'react', 'test logic only exists in react e2e server.');
    await page.goto(path + '?link-component=true');

    const links = page.locator('a');
    const columnsLink = await links.filter({
      hasText: 'Custom Link',
    });

    // make sure we have at least one custom link
    await expect(await columnsLink.count()).toBeGreaterThanOrEqual(1);

    await expect(await columnsLink.count()).toEqual(await links.count());
  });
};

test.describe('Link Component', () => {
  test.describe('Button', () => {
    testLinkComponent('/');
  });

  test.describe('Columns', () => {
    testLinkComponent('/columns');
  });

  test.describe('Link URL', () => {
    testLinkComponent('/link-url');
  });
});
