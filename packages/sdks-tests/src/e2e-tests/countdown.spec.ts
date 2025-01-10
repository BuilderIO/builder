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
      const secondsOnPage = (await page.locator('#seconds').textContent())?.trim();
      const minutesOnPage = (await page.locator('#minutes').textContent())?.trim();
      const hoursOnPage = (await page.locator('#hours').textContent())?.trim();
      const daysOnPage = (await page.locator('#days').textContent())?.trim();

      if (!daysOnPage || !hoursOnPage || !minutesOnPage || !secondsOnPage) {
        throw new Error('Countdown values are not visible');
      }

      return `${daysOnPage}:${hoursOnPage}:${minutesOnPage}:${secondsOnPage}`;
    };

    // Wait for the countdown to start. Initial time value is 0:0:0:0
    await expect
      .poll(
        async () => {
          const time = await getTime();
          test.info().annotations.push({
            type: 'performance',
            description: `time: ${time}`,
          });
          return time !== '0:0:0:0';
        },
        {
          message: 'Make sure the countdown begins',
          // retry every 500ms for 10 seconds
          intervals: [500],
          timeout: 10000,
        }
      )
      .toBe(true);

    const firstCountdownValue = await getTime();
    let secondCountdownValue: string | undefined = undefined;

    // Wait for the countdown to show a new value less than the previous value
    await expect
      .poll(
        async () => {
          secondCountdownValue = await getTime();
          test.info().annotations.push({
            type: 'performance',
            description: `secondCountdownValue: ${secondCountdownValue}, firstCountdownValue: ${firstCountdownValue}`,
          });
          return secondCountdownValue < firstCountdownValue;
        },
        {
          message: 'Make sure the countdown updates once',
          // retry every 500ms for 10 seconds
          intervals: [500],
          timeout: 10000,
        }
      )
      .toBe(true);

    // repeat the process to ensure the countdown is updating correctly
    await expect
      .poll(
        async () => {
          if (!secondCountdownValue) throw new Error('firstCheckTime is undefined');

          const thirdCountdownValue = await getTime();
          test.info().annotations.push({
            type: 'performance',
            description: `thirdCountdownValue: ${thirdCountdownValue}, secondCountdownValue: ${secondCountdownValue}`,
          });
          return thirdCountdownValue < secondCountdownValue;
        },
        {
          message: 'Make sure the countdown updates a second time',
          // retry every 500ms for 10 seconds
          intervals: [500],
          timeout: 10000,
        }
      )
      .toBe(true);
  });
});
