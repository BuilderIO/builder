import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Countdown', () => {
  test('correctly updates countdown date', async ({ page }) => {
    // test.skip(
    //   packageName === 'nextjs-sdk-next-app' ||
    //     packageName === 'gen1-next' ||
    //     packageName === 'gen1-react' ||
    //     packageName === 'gen1-remix'
    // );

    await page.goto(`/countdown`);

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
