import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe.only('Accordion', () => {
  test('Accordion renders correctly', async ({ page }) => {
    await page.goto('/accordion');
    expect(await page.locator('text=Item 1').isVisible()).toBeTruthy();
    expect(await page.locator('text=Item 2').isVisible()).toBeTruthy();
    expect(await page.locator('text=Item 3').isVisible()).toBeTruthy();
  });
  test('Accordion opens and closes', async ({ page }) => {
    await page.goto('/accordion');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click();
      expect(await page.locator(`text=Inside Item ${i}`).isVisible()).toBeTruthy();
    }
  });
  test('Content is hidden when accordion is closed', async ({ page }) => {
    await page.goto('/accordion');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click();
      expect(await page.locator(`text=Inside Item ${i}`).isVisible()).toBeTruthy();
      await page.getByText(`Item ${i}`, { exact: true }).click();
      expect(await page.locator(`text=Inside Item ${i}`).isVisible()).toBeFalsy();
    }
  });
});
