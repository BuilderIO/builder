import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

const testLinkComponent = (path: string, totalLinks: number) => {
  test('renders regular anchor element by default', async ({ page }) => {
    await page.goto(path);

    const links = page.locator('a');
    const customLinks = await links.filter({
      hasText: 'Custom Link',
    });

    await expect(links).toHaveCount(totalLinks);
    await expect(customLinks).toHaveCount(0);
  });
  test('renders custom link component when provided', async ({ page, packageName }) => {
    test.fail(packageName !== 'react', 'test logic only exists in react e2e server.');
    await page.goto(path + '?link-component=true');

    const links = page.locator('a');
    const customLinks = await links.filter({
      hasText: 'Custom Link',
    });

    await expect(links).toHaveCount(totalLinks);
    await expect(customLinks).toHaveCount(totalLinks);
  });
};

test.describe('Link Component', () => {
  test.describe('Button', () => {
    testLinkComponent('/', 8);
  });

  test.describe('Columns', () => {
    testLinkComponent('/columns', 2);
  });

  test.describe('Link URL', () => {
    testLinkComponent('/link-url', 2);
  });
});
