import { expect } from '@playwright/test';
import { excludeTestFor, test } from '../helpers/index.js';

test.describe('Accordion', () => {
  test('Accordion renders correctly', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
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
          reactNative: true, // React Native does not support `order`
        },
        sdk
      )
    );
    await page.goto('/accordion-grid');

    expect(await page.locator('.builder-accordion-title').count()).toBe(3);

    const accordionTitles = await page.locator('.builder-accordion-title').all();
    for (const accordionTitle of accordionTitles) {
      const styleAttribute = (await accordionTitle.getAttribute('style')) || '';
      expect(styleAttribute).toContain('25%');
    }
  });
  test('grid - Check `order` of Accordion elements', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          reactNative: true, // React Native does not support `order`
        },
        sdk
      )
    );
    const orderStr = (index: number) => (sdk === 'svelte' ? `order:${index};` : `order: ${index};`);
    await page.goto('/accordion-grid');

    await page.locator('text=Item 1').click({ timeout: 10000 });

    await expect(page.locator('text=Inside Item 1')).toBeVisible();

    const accordionTitles = await page.locator('.builder-accordion-title').all();
    for (let i = 0; i < accordionTitles.length; i++) {
      const accordionTitle = accordionTitles[i];
      const styleAttribute = await accordionTitle.getAttribute('style');
      expect(styleAttribute).toContain(orderStr(i));
    }

    const openAccordionDetail = page.locator('.builder-accordion-detail-open');
    await expect(openAccordionDetail).toBeVisible();
    expect(await openAccordionDetail.getAttribute('style')).toContain(orderStr(3));
  });
  test('grid - Only one item is displayed regardless of oneAtATime', async ({ page, sdk }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
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
