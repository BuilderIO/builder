import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('Form', () => {
  test('Form rendering correctly', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ angular: true }, sdk), 'Angular Gen2 SDK not implemented.');
    test.skip(
      excludeTestFor({ reactNative: true, rsc: true }, sdk),
      'Form not implemented in React Native and NextJS SDKs.'
    );
    await page.goto('/form');

    const form = page.locator('form');
    await expect(form).toHaveCount(1);
    await expect(form.locator('input')).toHaveCount(2);
    await expect(form.locator('button')).toHaveCount(1);
    await expect(form.locator('select')).toHaveCount(1);
    await expect(form.locator('select').first().locator('option')).toHaveCount(3);
    expect(await form.locator('button').first().innerText()).toBe('Submit');
  });
});
