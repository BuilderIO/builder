import { expect } from '@playwright/test';
import { excludeTestFor, test } from './helpers.js';

test.describe('Form', () => {
  test.skip(
    excludeTestFor({ reactNative: true, rsc: true }),
    'Form not implemented in React Native and NextJS SDKs.'
  );
  test('Form rendering correctly', async ({ page }) => {
    await page.goto('/form');

    expect(await page.locator('form').count()).toBe(1);
    expect(await page.locator('form').first().locator('input').count()).toBe(2);
    expect(await page.locator('form').first().locator('button').count()).toBe(1);
    expect(await page.locator('form').first().locator('select').count()).toBe(1);
    expect(
      await page.locator('form').first().locator('select').first().locator('option').count()
    ).toBe(3);
    expect(await page.locator('form').first().locator('button').first().innerText()).toBe('Submit');
  });
});
