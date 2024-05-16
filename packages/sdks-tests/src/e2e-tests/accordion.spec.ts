import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('Accordion', () => {
  test('Accordion renders correctly', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click({ timeout: 10000 });
    }
  });
  test('Accordion opens', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click({ timeout: 10000 });
      await expect(page.locator(`text=Inside Item ${i}`)).toBeVisible();
    }
  });
  test('Content is hidden when accordion is closed', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click({ timeout: 10000 });
      await expect(page.locator(`text=Inside Item ${i}`)).toBeVisible();
      await page.getByText(`Item ${i}`, { exact: true }).click({ timeout: 10000 });
      await expect(page.locator(`text=Inside Item ${i}`)).not.toBeVisible();
    }
  });
});
