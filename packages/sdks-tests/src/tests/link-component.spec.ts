import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Link Component', () => {
  test('renders regular anchor element by default', async ({ page, packageName }) => {
    test.fail(packageName !== 'react', 'test logic only exists in react e2e server.');
    await page.goto('/');

    const links = page.locator('a');
    const columnsLink = await links.filter({
      hasText: 'Custom Link',
    });

    await expect(columnsLink).toHaveCount(0);
  });
  test('renders custom link component when provided', async ({ page, packageName }) => {
    test.fail(packageName !== 'react', 'test logic only exists in react e2e server.');
    await page.goto('/?link-component=true');

    const links = page.locator('a');
    const columnsLink = await links.filter({
      hasText: 'Custom Link',
    });

    await expect(await columnsLink.count()).toEqual(await links.count());
  });
});
