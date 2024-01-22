import { expect } from '@playwright/test';
import { test } from './helpers.js';

test.describe('Slot', () => {
  test('slot should render', async ({ page }) => {
    await page.goto('/slot');
    await expect(page.locator('text=Inside a slot!!')).toBeVisible();
  });

  test('slot should render in the correct place', async ({ page }) => {
    await page.goto('/slot');
    const builderTextElements = page.locator('.builder-text');
    const count = await builderTextElements.count();
    await expect(count).toBe(3);
    const slotElement = builderTextElements.nth(1);
    await expect(slotElement).toHaveText('Inside a slot!!');
  });
});
