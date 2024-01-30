import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe.only('Form', () => {
  test('Form rendering correctly', async ({ page }) => {
    await page.goto('/form');

    expect(await page.locator('form').count()).toBe(1);
    expect(await page.locator('form').first().locator('input').count()).toBe(2);
    expect(await page.locator('form').first().locator('button').count()).toBe(1);
    expect(await page.locator('form').first().locator('button').first().innerText()).toBe('Submit');
  });
});
