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
  test('oneAtATime - Only one item opens at a time', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion-one-at-a-time');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click({ timeout: 10000 });
      await expect(page.locator(`text=Inside Item ${i}`)).toBeVisible();
      for (let j = 1; j <= 3; j++) {
        if (j !== i) {
          await expect(page.locator(`text=Inside Item ${j}`)).not.toBeVisible();
        }
      }
    }
  });
  test('grid - Accordion items are displayed in a grid', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion-grid');
    // TODO: Add test logic
    // checks default 25% width
  });
  test('grid - Check if Accordion detail takes the entire space below', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion-grid');
    // TODO: Add test logic
  });
  test('grid - Only one item is displayed regardless of oneAtATime', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          angular: true,
        },
        sdk
      )
    );
    await page.goto('/accordion-grid');

    for (let i = 1; i <= 3; i++) {
      await page.locator(`text=Item ${i}`).click({ timeout: 10000 });
      await expect(page.locator(`text=Inside Item ${i}`)).toBeVisible();
      for (let j = 1; j <= 3; j++) {
        if (j !== i) {
          await expect(page.locator(`text=Inside Item ${j}`)).not.toBeVisible();
        }
      }
    }
  });
});
