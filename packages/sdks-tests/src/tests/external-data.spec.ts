import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('External Data', () => {
  test('renders initial value', async ({ page, packageName }) => {
    test.skip(packageName !== 'react');
    await page.goto('/external-data');

    await expect(page.getByText('Data value: foo')).toBeVisible();
  });
  test('rerenders on external change', async ({ page, packageName }) => {
    test.skip(packageName !== 'react');
    await page.goto('/external-data');

    await expect(page.getByText('Data value: foo')).toBeVisible();

    await page.click('text=Change value');

    await expect(page.getByText('Data value: bar')).toBeVisible();
  });
});
