import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('js code with assign', () => {
  test.only('initializes correct value from JS Code block', async ({ page }) => {
    await page.goto('/js-code-with-assign/');
    expect(await page.locator('text=Data 1').count()).toEqual(5);
  });
});
