import type { BrowserContext, Locator, Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { targetContext } from './context.js';

// test.describe.configure({ mode: 'serial' });

const findTextInPage = ({ page, text }: { page: Page; text: string }) =>
  expect(page.locator(`text=${text}`)).toBeVisible();

const isRNSDK = process.env.SDK === 'reactNative';

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

const expectStyleForElement = async ({
  expectedValue,
  locator,
  cssProperty,
}: {
  locator: Locator;
  cssProperty: string;
  expectedValue: string;
}) => {
  await expect(
    await getElementStyleValue({
      locator,
      cssProperty,
    })
  ).toBe(expectedValue);
};
const expectStylesForElement = async ({
  expected,
  locator,
}: {
  locator: Locator;
  expected: Record<string, string>;
}) => {
  for (const property of Object.keys(expected)) {
    await expectStyleForElement({
      cssProperty: property,
      locator,
      expectedValue: expected[property],
    });
  }
};

const getBuilderSessionIdCookie = async ({
  context,
}: {
  context: BrowserContext;
}) => {
  const cookies = await context.cookies();
  const builderSessionCookie = cookies.find(
    (cookie) => cookie.name === 'builderSessionId'
  );
  return builderSessionCookie;
};

test.describe(targetContext.name, () => {
  test.describe('cookies', () => {
    test('do not appear if canTrack=false', async ({ page, context }) => {
      // by waiting for network requests, we guarantee that impression tracking POST was (NOT) made,
      // which guarantees that the cookie was set or not.
      await page.goto('/can-track-false', { waitUntil: 'networkidle' });

      const cookies = await context.cookies();
      const builderSessionCookie = cookies.find(
        (cookie) => cookie.name === 'builderSessionId'
      );
      expect(builderSessionCookie).toBeUndefined();
    });
    test('appear by default', async ({ page, context }) => {
      // by waiting for network requests, we guarantee that impression tracking POST was made,
      // which guarantees that the cookie was set
      await page.goto('/', { waitUntil: 'networkidle' });

      const builderSessionCookie = await getBuilderSessionIdCookie({ context });

      // react native sdk does not use cookies
      if (isRNSDK) {
        expect(builderSessionCookie).toBeUndefined();
      } else {
        expect(builderSessionCookie).toBeDefined();
      }
    });
  });
  test.describe('tracking', () => {
    test('POSTs correct impression data', async ({ page }) => {
      const navigate = page.goto('/');
      const trackingRequestPromise = page.waitForRequest(
        (request) =>
          request.url().includes('builder.io/api/v1/track') &&
          request.method() === 'POST'
      );

      await navigate;
      const trackingRequest = await trackingRequestPromise;

      const data = trackingRequest.postDataJSON();

      const expected = {
        events: [
          {
            type: 'impression',
            data: {
              metadata: {},
              userAttributes: {
                device: 'desktop',
              },
            },
          },
        ],
      };

      if (isRNSDK) {
        expected.events[0].data.userAttributes.device = 'mobile';
      }

      const ID_REGEX = /^[a-f0-9]{32}$/;

      expect(data).toMatchObject(expected);
      expect(data.events[0].data.sessionId).toMatch(ID_REGEX);
      expect(data.events[0].data.visitorId).toMatch(ID_REGEX);
      expect(data.events[0].data.ownerId).toMatch(ID_REGEX);

      if (!isRNSDK) {
        expect(data.events[0].data.metadata.url).toMatch(
          /http:\/\/localhost:\d+\//
        );
        expect(data.events[0].data.userAttributes.urlPath).toMatch('/');
        expect(data.events[0].data.userAttributes.host).toMatch(
          /localhost:[\d]+/
        );
      }
    });
    test('POSTs correct click data', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      const trackingRequestPromise = page.waitForRequest(
        (request) =>
          request.url().includes('builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'click'
      );

      // click on an element
      await page.click('text=SDK Feature testing project');

      // get click tracking request
      const trackingRequest = await trackingRequestPromise;

      const data = trackingRequest.postDataJSON();

      const expected = {
        events: [
          {
            type: 'click',
            data: {
              metadata: {},
              userAttributes: {
                device: 'desktop',
              },
            },
          },
        ],
      };

      if (isRNSDK) {
        expected.events[0].data.userAttributes.device = 'mobile';
      }

      const ID_REGEX = /^[a-f0-9]{32}$/;

      expect(data).toMatchObject(expected);

      if (!isRNSDK) {
        // check that all the heatmap metadata is present

        expect(
          !isNaN(parseFloat(data.events[0].data.metadata.builderElementIndex))
        ).toBeTruthy();
        expect(
          !isNaN(parseFloat(data.events[0].data.metadata.builderTargetOffset.x))
        ).toBeTruthy();
        expect(
          !isNaN(parseFloat(data.events[0].data.metadata.builderTargetOffset.y))
        ).toBeTruthy();
        expect(
          !isNaN(parseFloat(data.events[0].data.metadata.targetOffset.x))
        ).toBeTruthy();
        expect(
          !isNaN(parseFloat(data.events[0].data.metadata.targetOffset.y))
        ).toBeTruthy();
      }

      // baseline tests for impression tracking
      expect(data.events[0].data.sessionId).toMatch(ID_REGEX);
      expect(data.events[0].data.visitorId).toMatch(ID_REGEX);
      expect(data.events[0].data.ownerId).toMatch(ID_REGEX);

      if (!isRNSDK) {
        expect(data.events[0].data.metadata.url).toMatch(
          /http:\/\/localhost:\d+\//
        );
        expect(data.events[0].data.userAttributes.urlPath).toMatch('/');
        expect(data.events[0].data.userAttributes.host).toMatch(
          /localhost:[\d]+/
        );
      }
    });
  });

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

    const firstSymbolText = await page
      .locator('text="Description of image:"')
      .first();

    // these are desktop and tablet styles, and will never show up in react native
    if (!isRNSDK) {
      // check desktop styles
      await expectStyleForElement({
        locator: firstSymbolText,
        cssProperty: 'color',
        expectedValue: 'rgb(255, 0, 0)',
      });

      // resize to tablet
      await page.setViewportSize({ width: 930, height: 1000 });
      await expectStyleForElement({
        locator: firstSymbolText,
        cssProperty: 'color',
        expectedValue: 'rgb(0, 255, 6)',
      });

      // resize to mobile
      await page.setViewportSize({ width: 400, height: 1000 });
    }

    // TO-DO: fix react native style inheritance for symbols->Text (using HTML renderer component), so we can unblock this.
    if (!isRNSDK) {
      // check mobile styles
      await expectStyleForElement({
        locator: firstSymbolText,
        cssProperty: 'color',
        expectedValue: 'rgb(0, 255, 255)',
      });
    }
  });
  test('style bindings', async ({ page }) => {
    await page.goto('/content-bindings');

    const expected = {
      'border-top-left-radius': '10px',
      'border-top-right-radius': '22px',
      'border-bottom-left-radius': '40px',
      'border-bottom-right-radius': '30px',
    };

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
    if (isRNSDK) {
      // styling is not yet implemented in RN SDK
      return;
    }
    await expectStyleForElement({
      locator: page.locator(`text="This text should be red..."`),
      cssProperty: 'color',
      expectedValue: 'rgb(255, 0, 0)',
    });
  });

  /**
   * We are temporarily skipping this test because it relies on network requests.
   * TO-DO: re-enable it once we have a way to mock network requests.
   */
  test.skip('image', async ({ page }) => {
    await page.goto('/image');

    const imageLocator = await page.locator('img');

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

        await expectStyleForElement({
          locator: breakpointsPara,
          cssProperty: 'color',
          expectedValue: expectedTextColor,
        });

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expectStyleForElement({
          locator: column2,
          cssProperty: 'color',
          expectedValue: expectedColumnTextColor,
        });

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

        await expectStyleForElement({
          locator: breakpointsPara,
          cssProperty: 'color',
          expectedValue: expectedTextColor,
        });

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(223, 22, 22)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expectStyleForElement({
          locator: column2,
          cssProperty: 'color',
          expectedValue: expectedColumnTextColor,
        });

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
        await expectStyleForElement({
          locator: breakpointsPara,
          cssProperty: 'color',
          expectedValue: 'rgb(65, 117, 5)',
        });

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        await expectStyleForElement({
          locator: column2,
          cssProperty: 'color',
          expectedValue: 'rgb(126, 211, 33)', // greenish text color
        });

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

        await expectStyleForElement({
          locator: breakpointsPara,
          cssProperty: 'color',
          expectedValue: expectedTextColor, // black text color
        });

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(0, 0, 0)'; // black text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expectStyleForElement({
          locator: column2,
          cssProperty: 'color',
          expectedValue: expectedColumnTextColor,
        });

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

        await expectStyleForElement({
          locator: breakpointsPara,
          cssProperty: 'color',
          expectedValue: expectedTextColor,
        });

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        let expectedColumnTextColor = 'rgb(223, 22, 22)'; // reddish text color
        if (process.env.SDK === 'reactNative') {
          expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
        }

        await expectStyleForElement({
          locator: column2,
          cssProperty: 'color',
          expectedValue: expectedColumnTextColor,
        });

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

        await expectStyleForElement({
          locator: breakpointsPara,
          cssProperty: 'color',
          expectedValue: 'rgb(65, 117, 5)', // greenish text color
        });

        const column2 = page.locator(`text=Column 2`);
        await expect(column2).toBeVisible();

        await expectStyleForElement({
          locator: column2,
          cssProperty: 'color',
          expectedValue: 'rgb(126, 211, 33)', // greenish text color
        });

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
