import { expect } from '@playwright/test';
import { findTextInPage, test, verifyTabContent } from '../helpers/index.js';

test.describe('Editable Regions in Custom Components', () => {
  test('Registers the custom component and contains a text on initial render', async ({
    page,
    packageName,
  }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/advanced-child');

    await findTextInPage({ page, text: 'Custom Component with editable regions' });
  });

  test('Display two buttons with label Tab 1 and Tab 2', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/advanced-child');

    await page.waitForSelector('button');

    const buttons = await page.$$('button');

    expect(buttons.length).toBeGreaterThan(0);

    const buttonTexts = await Promise.all(
      buttons.map(async button => {
        const text = await button.textContent();
        return text?.trim();
      })
    );

    expect(buttonTexts).toContain('Tab 1');
    expect(buttonTexts).toContain('Tab 2');
  });

  test('Display content for the clicked tab and hide the other', async ({ page, packageName }) => {
    test.skip(!['react'].includes(packageName));

    await page.goto('/advanced-child');

    await page.waitForSelector('button:has-text("Tab 1")');
    await page.waitForSelector('button:has-text("Tab 2")');

    await verifyTabContent(
      page,
      'Tab 1',
      'component.options.tabList.0.children',
      'component.options.tabList.1.children'
    );

    await verifyTabContent(
      page,
      'Tab 2',
      'component.options.tabList.1.children',
      'component.options.tabList.0.children'
    );
  });
});
