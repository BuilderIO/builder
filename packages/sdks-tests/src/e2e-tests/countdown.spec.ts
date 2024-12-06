import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Symbol with JS Code', () => {
  test('correctly updates countdown date', async ({ page, sdk }) => {
    test.fail(
      sdk === 'qwik' || sdk === 'react' || sdk === 'rsc',
      'jsCode in symbols does not update global state for these SDKs.'
    );

    await page.goto(`/symbol-with-jscode`);

    const currentSecondsOnPage = await page.locator('#seconds').textContent();

    await page.waitForTimeout(2000);
    const newSecondsOnPage = await page.locator('#seconds').textContent();
    expect(newSecondsOnPage).not.toBe(currentSecondsOnPage);

    await page.waitForTimeout(2000);
    const newSecondsOnPage2 = await page.locator('#seconds').textContent();
    expect(newSecondsOnPage2).not.toBe(newSecondsOnPage);
    expect(newSecondsOnPage2).not.toBe(currentSecondsOnPage);
  });
});
