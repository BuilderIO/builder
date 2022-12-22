import type { Locator, Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { targetContext } from './context.js';

// test.describe.configure({ mode: 'serial' });

const findTextInPage = ({ page, text }: { page: Page; text: string }) =>
  expect(page.locator(`text=${text}`)).toBeVisible();

const getElementStyleValue = async ({
  locator,
  cssProperty,
}: {
  locator: Locator;
  cssProperty: string;
}) => {
  return locator.evaluate((e, cssProperty) => {
    return getComputedStyle(e).getPropertyValue(cssProperty);
  }, cssProperty);
};

const expectStylesForElement = async ({
  expected,
  locator,
}: {
  locator: Locator;
  expected: Record<string, string>;
}) => {
  for (const property of Object.keys(expected)) {
    await expect(
      await getElementStyleValue({
        locator,
        cssProperty: property,
      })
    ).toBe(expected[property]);
  }
};

test.describe(targetContext.name, () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a');

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    expect(columnsLink).toHaveCount(1);
    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('columns', async ({ page }) => {
    await page.goto('/columns');

    await findTextInPage({ page, text: 'Stack at tablet' });
  });
  test('symbols', async ({ page }) => {
    await page.goto('/symbols');

    await findTextInPage({ page, text: 'special test description' });
    await page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F32b835cd8f62400085961dcf3f3b37a2"]'
      )
      .isVisible();
    await findTextInPage({ page, text: 'default description' });
    await page
      .locator(
        '[src="https://cdn.builder.io/api/v1/image/assets%2Ff1a790f8c3204b3b8c5c1795aeac4660%2F4bce19c3d8f040b3a95e91000a98283e"]'
      )
      .isVisible();
  });
  test('style bindings', async ({ page }) => {
    await page.goto('/content-bindings');

    const expected = {
      'border-top-left-radius': '10px',
      'border-top-right-radius': '22px',
      'border-bottom-left-radius': '40px',
      'border-bottom-right-radius': '30px',
    };

    const isRNSDK = process.env.SDK === 'reactNative';
    const selector = isRNSDK
      ? '[data-class*=builder-blocks] > div'
      : '[class*=builder-blocks] > div';

    const locator = page
      .locator(selector)
      .filter({ hasText: 'Enter some text...' })
      .last();

    page.locator(selector).innerText;

    await expect(locator).toBeVisible();

    await expectStylesForElement({ expected, locator });
    // TODO: fix this
    // check the title is correct
    // title: 'some special title'
  });
  test('symbol style bindings', async ({ page }) => {
    await page.goto('/symbol-bindings');

    const expected = {
      'border-top-left-radius': '10px',
      'border-top-right-radius': '220px',
      'border-bottom-left-radius': '30px',
      'border-bottom-right-radius': '40px',
    };

    const isRNSDK = process.env.SDK === 'reactNative';
    const selector = isRNSDK
      ? '[data-class*=builder-blocks] > div'
      : '[class*=builder-blocks] > div';

    const locator = page
      .locator(selector)
      .filter({ hasText: 'Enter some text...' })
      .last();

    await expect(locator).toBeVisible();

    await expectStylesForElement({ expected, locator });
    // TODO: fix this
    // check the title is correct
    // title: 'some special title'
  });
  test('data-bindings', async ({ page }) => {
    await page.goto('/data-bindings');

    await expect(page.locator(`text="1234"`).first()).toBeVisible();
    await findTextInPage({
      page,
      text: 'The Hot Wheels™ Legends Tour is Back',
    });
    await findTextInPage({
      page,
      text: 'Mattel Certified by Great Place to Work and Named to Fast Company’s List of 100 Best Workplaces for Innovators',
    });
  });
  test('data-binding-styles', async ({ page }) => {
    await page.goto('/data-binding-styles');
    const isRNSDK = process.env.SDK === 'reactNative';
    if (isRNSDK) {
      // styling is not yet implemented in RN SDK
      return;
    }
    await expect(
      await getElementStyleValue({
        locator: page.locator(`text="This text should be red..."`),
        cssProperty: 'color',
      })
    ).toBe('rgb(255, 0, 0)');
  });

  /**
   * We are temporarily skipping this test because it relies on network requests.
   * TO-DO: re-enable it once we have a way to mock network requests.
   */
  test.skip('image', async ({ page }) => {
    await page.goto('/image');

    const imageLocator = await page.locator('img');

    const isRNSDK = process.env.SDK === 'reactNative';

    const expected: Record<string, string>[] = [
      // first img is a webp image. React Native SDK does not yet support webp.
      ...(isRNSDK
        ? []
        : [
            {
              width: '604px',
              height: '670.438px',
              'object-fit': 'cover',
            },
          ]),
      {
        width: '1264px',
        height: '240.156px',
        // RN SDK does not support object-fit
        'object-fit': isRNSDK ? 'fill' : 'cover',
      },
      {
        width: '604px',
        height: '120.797px',
        // RN SDK does not support object-fit
        'object-fit': isRNSDK ? 'fill' : 'contain',
      },
      {
        width: '1880px',
        height: '1245px',
      },
    ];

    await expect(imageLocator).toHaveCount(expected.length);

    expected.forEach(async (vals, index) => {
      const image = imageLocator.nth(index);
      await expectStylesForElement({ locator: image, expected: vals });
    });
  });

  test.describe('custom-breakpoints', () => {
    /* set breakpoint config in content -
    breakpoints: {
      small: 500,
      medium: 800,
    },
    */
    test.describe('when applied', () => {
      test('large desktop size', async ({ page }) => {
        page.setViewportSize({ width: 801, height: 1000 });

        await page.goto('/custom-breakpoints');
        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor);

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: column2,
            cssProperty: 'color',
          })
        ).toBe(expectedColumnTextColor);

        // Skipping this image test for react-native.
        // Its difficult to locate the image in react-native as css selectors don't work as expected.
        if (process.env.SDK !== 'reactNative') {
          const image = page.locator(`.builder-block:has(img.builder-image)`);
          await expect(image).toBeVisible();

          const expectedImageCss: Record<string, string> = {
            display: 'flex',
            width: '785px',
          };

          await expectStylesForElement({
            locator: image,
            expected: expectedImageCss,
          });
        }
      });

      test('medium tablet size', async ({ page }) => {
        page.setViewportSize({ width: 501, height: 1000 });

        await page.goto('/custom-breakpoints');
        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(208, 2, 27)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor);

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(223, 22, 22)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: column2,
            cssProperty: 'color',
          })
        ).toBe(expectedColumnTextColor);

        // Skipping this image test for react-native.
        // Its difficult to locate the image in react-native as css selectors don't work as expected.
        if (process.env.SDK !== 'reactNative') {
          const image = page.locator(`.builder-block:has(img.builder-image)`);
          await expect(image).not.toBeVisible();

          const expectedImageCss: Record<string, string> = {
            display: 'none',
          };

          await expectStylesForElement({
            locator: image,
            expected: expectedImageCss,
          });
        }
      });

      test('small mobile size', async ({ page }) => {
        page.setViewportSize({ width: 500, height: 1000 });
        await page.goto('/custom-breakpoints');

        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();
        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe('rgb(65, 117, 5)'); // greenish text color

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        await expect(
          await getElementStyleValue({
            locator: column2,
            cssProperty: 'color',
          })
        ).toBe('rgb(126, 211, 33)'); // greenish text color

        // Skipping this image test for react-native.
        // Its difficult to locate the image in react-native as css selectors don't work as expected.
        if (process.env.SDK !== 'reactNative') {
          const image = page.locator(`.builder-block:has(img.builder-image)`);
          await expect(image).toBeVisible();

          const expectedImageCss: Record<string, string> = {
            display: 'flex',
            width: '121px',
            'max-width': '250px',
          };

          await expectStylesForElement({
            locator: image,
            expected: expectedImageCss,
          });
        }
      });
    });

    test.describe('when reset', () => {
      /*
        When no breakpoints are available, defaults are applied as
        breakpoints: {
          small: 640,
          medium: 991,
        }
      */
      test('large desktop size', async ({ page }) => {
        page.setViewportSize({ width: 992, height: 1000 });
        await page.goto('/custom-breakpoints-reset');

        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor); // black text color

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: column2,
            cssProperty: 'color',
          })
        ).toBe(expectedColumnTextColor);

        // Skipping this image test for react-native.
        // Its difficult to locate the image in react-native as css selectors don't work as expected.
        if (process.env.SDK !== 'reactNative') {
          const image = page.locator(`.builder-block:has(img.builder-image)`);
          await expect(image).toBeVisible();

          const expectedImageCss: Record<string, string> = {
            display: 'flex',
            width: '976px',
          };

          await expectStylesForElement({
            locator: image,
            expected: expectedImageCss,
          });
        }
      });

      test('medium tablet size', async ({ page }) => {
        page.setViewportSize({ width: 641, height: 1000 });

        await page.goto('/custom-breakpoints-reset');
        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        let expectedTextColor = 'rgb(208, 2, 27)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe(expectedTextColor);

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(223, 22, 22)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expect(
          await getElementStyleValue({
            locator: column2,
            cssProperty: 'color',
          })
        ).toBe(expectedColumnTextColor);

        // Skipping this image test for react-native.
        // Its difficult to locate the image in react-native as css selectors don't work as expected.
        if (process.env.SDK !== 'reactNative') {
          const image = page.locator(`.builder-block:has(img.builder-image)`);
          await expect(image).not.toBeVisible();

          const expectedImageCss: Record<string, string> = {
            display: 'none',
          };

          await expectStylesForElement({
            locator: image,
            expected: expectedImageCss,
          });
        }
      });

      test('small mobile size', async ({ page }) => {
        page.setViewportSize({ width: 640, height: 1000 });
        await page.goto('/custom-breakpoints-reset');

        const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
        await expect(breakpointsPara).toBeVisible();

        await expect(
          await getElementStyleValue({
            locator: breakpointsPara,
            cssProperty: 'color',
          })
        ).toBe('rgb(65, 117, 5)'); // greenish text color

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        await expect(
          await getElementStyleValue({
            locator: column2,
            cssProperty: 'color',
          })
        ).toBe('rgb(126, 211, 33)'); // greenish text color

        // Skipping this image test for react-native.
        // Its difficult to locate the image in react-native as css selectors don't work as expected.
        if (process.env.SDK !== 'reactNative') {
          const image = page.locator(`.builder-block:has(img.builder-image)`);
          await expect(image).toBeVisible();

          const expectedImageCss: Record<string, string> = {
            display: 'flex',
            width: '156px',
            'max-width': '250px',
          };

          await expectStylesForElement({
            locator: image,
            expected: expectedImageCss,
          });
        }
      });
    });
  });
});
