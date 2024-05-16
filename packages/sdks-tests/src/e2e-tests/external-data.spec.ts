import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('External Data', () => {
  test('renders initial value', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.skip(packageName !== 'react');
    await page.goto('/external-data');

    await expect(page.getByText('Data value: foo')).toBeVisible();
  });
  test('rerenders on external change', async ({ page, packageName, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.skip(packageName !== 'react');
    await page.goto('/external-data');

    await expect(page.getByText('Data value: foo')).toBeVisible();

    await page.click('text=Change value');

    await expect(page.getByText('Data value: bar')).toBeVisible();
  });
});
