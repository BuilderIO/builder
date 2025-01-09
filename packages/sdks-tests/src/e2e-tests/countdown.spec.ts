import { expect } from '@playwright/test';
import { test } from '../helpers/index.js';

test.describe('Symbol with JS Code', () => {
  test('correctly updates countdown date', async ({ page, sdk }) => {
    test.fail(
      sdk === 'qwik' || sdk === 'react' || sdk === 'rsc',
      'jsCode in symbols does not update global state for these SDKs.'
    );

    await page.goto(`/symbol-with-jscode`);

    const getTime = async () => {
      const secondsOnPage = await page.locator('#seconds').textContent();
      const minutesOnPage = await page.locator('#minutes').textContent();
      const hoursOnPage = await page.locator('#hours').textContent();
      const daysOnPage = await page.locator('#days').textContent();

      return `${daysOnPage}:${hoursOnPage}:${minutesOnPage}:${secondsOnPage}`;
    };

    // Wait for the countdown to start. Initial time value is 0:0:0:0
    await expect.poll(async () => await getTime()).not.toBe('0:0:0:0');

    const firstCountdownValue = await getTime();
    let secondCountdownValue: string | undefined = undefined;

    // Wait for the countdown to show a new value less than the previous value
    await expect
      .poll(async () => {
        secondCountdownValue = await getTime();
        return secondCountdownValue < firstCountdownValue;
      })
      .toBe(true);

    // repeat the process to ensure the countdown is updating correctly
    await expect
      .poll(async () => {
        if (!secondCountdownValue) throw new Error('firstCheckTime is undefined');

        const thirdCountdownValue = await getTime();
        return thirdCountdownValue < secondCountdownValue;
      })
      .toBe(true);
  });
});
