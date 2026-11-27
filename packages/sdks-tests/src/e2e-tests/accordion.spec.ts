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
  test('Accordion opens and item details are visible in the correct order', async ({
    page,
    sdk,
  }) => {
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
      const itemTitle = page.getByText(`Item ${i}`, { exact: true });
      await itemTitle.click({ timeout: 10000 });

      const itemDetail = page.getByText(`Inside Item ${i}`, { exact: true });
      await expect(itemDetail).toBeVisible();

      const titleBox = await itemTitle.boundingBox();
      const detailBox = await itemDetail.boundingBox();

      expect(detailBox).toBeDefined();
      expect(titleBox).toBeDefined();

      if (titleBox && detailBox) {
        expect(detailBox.y).toBeGreaterThan(titleBox.y + titleBox.height);

        if (i < 3) {
          const nextItemTitle = page.getByText(`Item ${i + 1}`, { exact: true });
          const nextTitleBox = await nextItemTitle.boundingBox();
          expect(nextTitleBox).toBeDefined();

          if (nextTitleBox) {
            expect(detailBox.y + detailBox.height).toBeLessThan(nextTitleBox.y);
          }
        }
      }
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
  test('useChildrenForItems - renders static and repeated children as items', async ({
    page,
    sdk,
  }) => {
    test.fail(
      excludeTestFor(
        {
          rsc: true,
          // Gen 1 restarts the item index inside each repeat, so indices collide.
          oldReact: true,
        },
        sdk
      )
    );
    await page.goto('/accordion-use-children-for-items');

    for (const title of ['Static', 'Apple', 'Banana']) {
      await expect(page.getByText(title, { exact: true })).toHaveCount(1);
    }
    for (const [title, detail] of [
      ['Static', 'Inside Static'],
      ['Apple', 'Inside Apple'],
      ['Banana', 'Inside Banana'],
    ]) {
      await expect(page.getByText(detail)).not.toBeVisible();
      await page.getByText(title, { exact: true }).click({ timeout: 10000 });
      await expect(page.getByText(detail)).toBeVisible();
    }
  });
  test('useChildrenForItems - state change keeps open detail mounted', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    await page.goto('/accordion-use-children-for-items-state-change');

    await page.getByText('Apple', { exact: true }).click({ timeout: 10000 });
    const detail = page.getByText('Inside Apple');
    await expect(detail).toBeVisible();
    await detail.evaluate(el => ((el as any).__marker = 'same'));

    await page.getByText('Bump').click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await expect(detail).toBeVisible();
    // A remount would drop the marker.
    expect(await detail.evaluate(el => (el as any).__marker)).toBe('same');
  });
  test('useChildrenForItems - oneAtATime closes the previous item', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    await page.goto('/accordion-use-children-for-items-one-at-a-time');

    await page.getByText('Static', { exact: true }).click({ timeout: 10000 });
    await expect(page.getByText('Inside Static')).toBeVisible();
    await page.getByText('Banana', { exact: true }).click();
    await expect(page.getByText('Inside Banana')).toBeVisible();
    await expect(page.getByText('Inside Static')).not.toBeVisible();
  });
  test('useChildrenForItems - collection resolving later adds its items', async ({ page, sdk }) => {
    test.fail(excludeTestFor({ rsc: true }, sdk));
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/accordion-use-children-for-items-async-collection');

    await expect(page.getByText('Static', { exact: true })).toHaveCount(1, {
      timeout: 10000,
    });
    await expect(page.getByText('Apple', { exact: true })).toHaveCount(0);
    await page.getByText('Load').click();
    await expect(page.getByText('Apple', { exact: true })).toHaveCount(1);
    await expect(page.getByText('Banana', { exact: true })).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});
