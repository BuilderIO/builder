import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Angular app loads', () => {
  test('importing sdk-angular works', async ({ page, packageName }) => {
    test.skip(packageName !== 'angular');
    await page.goto('/');
    await expect(page.getByText('Hello world!', { exact: true })).toBeVisible();
  });
});
