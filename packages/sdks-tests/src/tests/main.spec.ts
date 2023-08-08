import type { ConsoleMessage } from '@playwright/test';
import { expect } from '@playwright/test';
import { targetContext } from './context.js';
import {
  BUILDER_TEXT_SELECTOR,
  excludeReactNative,
  expectStylesForElement,
  findTextInPage,
  getBuilderSessionIdCookie,
  isRNSDK,
  reactiveStateTest,
  test,
  testExcludeOldReact,
} from './helpers.js';

test.describe(targetContext.name, () => {
  test.describe('Tracking', () => {
    test.describe('cookies', () => {
      test('do not appear if canTrack=false', async ({ page, context, packageName }) => {
        // TO-DO: figure out why Remix fails this test
        if (packageName === 'gen1-remix') {
          test.skip();
        }

        // by waiting for network requests, we guarantee that impression tracking POST was (NOT) made,
        // which guarantees that the cookie was set or not.
        await page.goto('/can-track-false', { waitUntil: 'networkidle' });

        const cookies = await context.cookies();
        const builderSessionCookie = cookies.find(cookie => cookie.name === 'builderSessionId');
        expect(builderSessionCookie).toBeUndefined();
      });
      excludeReactNative('appear by default', async ({ page, context }) => {
        const navigate = page.goto('/');
        const trackingRequestPromise = page.waitForRequest(
          req => req.url().includes('cdn.builder.io/api/v1/track') && req.method() === 'POST'
        );

        await navigate;
        // By waiting for the tracking POST request, we guarantee that the cookie is now set.
        await trackingRequestPromise;

        const builderSessionCookie = await getBuilderSessionIdCookie({ context });

        expect(builderSessionCookie).toBeDefined();
      });
    });
    test.describe('POST data', () => {
      test('POSTs correct impression data', async ({ page }) => {
        const navigate = page.goto('/');
        const trackingRequestPromise = page.waitForRequest(
          request =>
            request.url().includes('cdn.builder.io/api/v1/track') && request.method() === 'POST'
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
        expect(data.events[0].data.ownerId).toMatch(/abcd/);

        if (!isRNSDK) {
          expect(data.events[0].data.metadata.url).toMatch(/http:\/\/localhost:\d+\//);
          expect(data.events[0].data.userAttributes.urlPath).toBe('/');
          expect(data.events[0].data.userAttributes.host).toMatch(/localhost:[\d]+/);
        }
      });

      testExcludeOldReact('POSTs correct click data', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });
        const trackingRequestPromise = page.waitForRequest(
          request =>
            request.url().includes('cdn.builder.io/api/v1/track') &&
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

          expect(!isNaN(parseFloat(data.events[0].data.metadata.builderElementIndex))).toBeTruthy();
          expect(
            !isNaN(parseFloat(data.events[0].data.metadata.builderTargetOffset.x))
          ).toBeTruthy();
          expect(
            !isNaN(parseFloat(data.events[0].data.metadata.builderTargetOffset.y))
          ).toBeTruthy();
          expect(!isNaN(parseFloat(data.events[0].data.metadata.targetOffset.x))).toBeTruthy();
          expect(!isNaN(parseFloat(data.events[0].data.metadata.targetOffset.y))).toBeTruthy();
        }

        // baseline tests for impression tracking
        expect(data.events[0].data.sessionId).toMatch(ID_REGEX);
        expect(data.events[0].data.visitorId).toMatch(ID_REGEX);
        expect(data.events[0].data.ownerId).toMatch(/abcd/);

        if (!isRNSDK) {
          expect(data.events[0].data.metadata.url).toMatch(/http:\/\/localhost:\d+\//);
          expect(data.events[0].data.userAttributes.urlPath).toBe('/');
          expect(data.events[0].data.userAttributes.host).toMatch(/localhost:[\d]+/);
        }
      });
    });
  });

  test('Client-side navigation', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');

    const columnsLink = await links.filter({
      hasText: 'Columns (with images) ',
    });

    await expect(columnsLink).toHaveCount(1);
    await columnsLink.click();
    await findTextInPage({ page, text: 'Stack at tablet' });
  });

  test.describe('Features', () => {
    test.describe('Reactive State', () => {
      excludeReactNative('shows default value', async ({ page }) => {
        await page.goto('/reactive-state');

        const locator = page.locator(BUILDER_TEXT_SELECTOR);

        await locator.getByText('0', { exact: true });
      });

      reactiveStateTest('increments value correctly', async ({ page, packageName }) => {
        if (packageName === 'next-app-dir') {
          test.skip();
        }

        await page.goto('/reactive-state');

        const locator = isRNSDK
          ? page.locator('[data-builder-text]')
          : page.locator('.builder-text');

        await locator.getByText('0', { exact: true });

        await page.getByText('Increment Number').click();

        await locator.getByText('1', { exact: true });
      });
    });
    test.describe('Element Events', () => {
      const filterConsoleMessages = (consoleMessage: ConsoleMessage) => {
        const text = consoleMessage.text();
        return text.startsWith('clicked');
      };
      test('click works on button', async ({ page }) => {
        await page.goto('/element-events');

        // Get the next console log message
        const msgPromise = page.waitForEvent('console', filterConsoleMessages);

        await page.getByText('Click me!').click();

        const msg = await msgPromise;

        expect(msg.text()).toEqual('clicked button');
      });
      test('click works on box', async ({ page }) => {
        await page.goto('/element-events');

        // Get the next console log message
        const msgPromise = page.waitForEvent('console', filterConsoleMessages);

        await page.getByText('clickable BOX').click();
        const msg = await msgPromise;

        expect(msg.text()).toEqual('clicked box');
      });

      test('click works on text', async ({ page }) => {
        await page.goto('/element-events');

        // Get the next console log message
        const msgPromise = page.waitForEvent('console', filterConsoleMessages);

        await page.getByText('clickable text').click();
        const msg = await msgPromise;

        expect(msg.text()).toEqual('clicked text');
      });
    });

    test.describe('Show If & Hide If', () => {
      test('works on static conditions', async ({ page }) => {
        await page.goto('/show-hide-if');

        await findTextInPage({ page, text: 'this always appears' });
        await expect(page.locator('body')).not.toContainText('this never appears');
      });

      reactiveStateTest('works on reactive conditions', async ({ page, packageName }) => {
        if (packageName === 'next-app-dir') {
          test.skip();
        }

        // TO-DO: flaky in remix
        if (packageName === 'gen1-remix') {
          test.skip();
        }

        await page.goto('/show-hide-if');

        await findTextInPage({ page, text: 'even clicks' });
        await expect(page.locator('body')).not.toContainText('odd clicks');

        await page.locator('text=Click me!').click();

        await findTextInPage({ page, text: 'odd clicks' });
        await expect(page.locator('body')).not.toContainText('even clicks');
      });
    });
    test('Dynamic Data Bindings', async ({ page, packageName }) => {
      if (packageName === 'nuxt3') {
        test.skip();
      }
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

    test.describe('Custom Breakpoints', () => {
      /* set breakpoint config in content -
    breakpoints: {
      small: 500,
      medium: 800,
    },
    */
      test.describe('when applied', () => {
        testExcludeOldReact('large desktop size', async ({ page }) => {
          await page.setViewportSize({ width: 801, height: 1000 });

          await page.goto('/custom-breakpoints');
          const breakpointsParam = page.locator(`text=BREAKPOINTS 500 - 800`);

          let expectedTextColor = 'rgb(0, 0, 0)'; // black text color
          if (isRNSDK) {
            expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
          }

          await expect(breakpointsParam).toHaveCSS('color', expectedTextColor);

          const column2 = page.locator(`text=Column 2`);

          let expectedColumnTextColor = 'rgb(0, 0, 0)'; // black text color
          if (isRNSDK) {
            expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
          }

          await expect(column2).toHaveCSS('color', expectedColumnTextColor);

          // Skipping this image test for react-native.
          // Its difficult to locate the image in react-native as css selectors don't work as expected.
          if (!isRNSDK) {
            const image = page.locator(`.builder-block:has(img.builder-image)`);

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

        testExcludeOldReact('medium tablet size', async ({ page }) => {
          await page.setViewportSize({ width: 501, height: 1000 });

          await page.goto('/custom-breakpoints');
          const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);

          let expectedTextColor = 'rgb(208, 2, 27)'; // reddish text color
          if (isRNSDK) {
            expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
          }

          await expect(breakpointsPara).toHaveCSS('color', expectedTextColor);

          const column2 = page.locator(`text=Column 2`);

          let expectedColumnTextColor = 'rgb(223, 22, 22)'; // reddish text color
          if (isRNSDK) {
            expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
          }

          await expect(column2).toHaveCSS('color', expectedColumnTextColor);

          // Skipping this image test for react-native.
          // Its difficult to locate the image in react-native as css selectors don't work as expected.
          if (!isRNSDK) {
            const image = page.locator(`.builder-block:has(img.builder-image)`);

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
          await page.setViewportSize({ width: 500, height: 1000 });
          await page.goto('/custom-breakpoints');

          const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);
          await expect(breakpointsPara).toHaveCSS('color', 'rgb(65, 117, 5)');

          const column2 = page.locator(`text=Column 2`);
          await expect(column2).toHaveCSS('color', 'rgb(126, 211, 33)');

          // Skipping this image test for react-native.
          // Its difficult to locate the image in react-native as css selectors don't work as expected.
          if (!isRNSDK) {
            const image = page.locator(`.builder-block:has(img.builder-image)`);

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
          await page.setViewportSize({ width: 992, height: 1000 });
          await page.goto('/custom-breakpoints-reset');

          const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);

          let expectedTextColor = 'rgb(0, 0, 0)'; // black text color
          if (isRNSDK) {
            expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
          }

          await expect(breakpointsPara).toHaveCSS('color', expectedTextColor);

          const column2 = page.locator(`text=Column 2`);

          let expectedColumnTextColor = 'rgb(0, 0, 0)'; // black text color
          if (isRNSDK) {
            expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
          }

          await expect(column2).toHaveCSS('color', expectedColumnTextColor);

          // Skipping this image test for react-native.
          // Its difficult to locate the image in react-native as css selectors don't work as expected.
          if (!isRNSDK) {
            const image = page.locator(`.builder-block:has(img.builder-image)`);

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
          await page.setViewportSize({ width: 641, height: 1000 });

          await page.goto('/custom-breakpoints-reset');
          const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);

          let expectedTextColor = 'rgb(208, 2, 27)'; // reddish text color
          if (isRNSDK) {
            expectedTextColor = 'rgb(65, 117, 5)'; // greenish text color
          }

          await expect(breakpointsPara).toHaveCSS('color', expectedTextColor);

          const column2 = page.locator(`text=Column 2`);

          let expectedColumnTextColor = 'rgb(223, 22, 22)'; // reddish text color
          if (isRNSDK) {
            expectedColumnTextColor = 'rgb(126, 211, 33)'; // greenish text color
          }

          await expect(column2).toHaveCSS('color', expectedColumnTextColor);

          // Skipping this image test for react-native.
          // Its difficult to locate the image in react-native as css selectors don't work as expected.
          if (!isRNSDK) {
            const image = page.locator(`.builder-block:has(img.builder-image)`);

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
          await page.setViewportSize({ width: 640, height: 1000 });
          await page.goto('/custom-breakpoints-reset');

          const breakpointsPara = page.locator(`text=BREAKPOINTS 500 - 800`);

          await expect(breakpointsPara).toHaveCSS('color', 'rgb(65, 117, 5)');

          const column2 = page.locator(`text=Column 2`);

          await expect(column2).toHaveCSS('color', 'rgb(126, 211, 33)');

          // Skipping this image test for react-native.
          // Its difficult to locate the image in react-native as css selectors don't work as expected.
          if (!isRNSDK) {
            const image = page.locator(`.builder-block:has(img.builder-image)`);

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

    test.describe('Link URL', () => {
      test('renders with static value', async ({ page }) => {
        await page.goto('/link-url');

        await page.locator(`a[href="/static-url"]`).waitFor();
      });
      test('renders with dynamic value', async ({ page, packageName }) => {
        if (packageName === 'gen1-next') {
          test.skip();
        }
        await page.goto('/link-url');

        await page.locator(`a[href="/dynamic-url"]`).waitFor();
      });
    });
  });
});
