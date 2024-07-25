import { expect } from '@playwright/test';
import {
  excludeGen1,
  excludeRn,
  excludeTestFor,
  getBuilderSessionIdCookie,
  checkIsRN,
  test,
} from '../helpers/index.js';

test.describe('Tracking', () => {
  test.describe('cookies', () => {
    test('do not appear if canTrack=false', async ({ page, context, packageName }) => {
      // TO-DO: figure out why Remix fails this test
      test.fail(packageName === 'gen1-remix');

      // by waiting for network requests, we guarantee that impression tracking POST was (NOT) made,
      // which guarantees that the cookie was set or not.
      await page.goto('/can-track-false', { waitUntil: 'networkidle' });

      const cookies = await context.cookies();
      const builderSessionCookie = cookies.find(cookie => cookie.name === 'builderSessionId');
      expect(builderSessionCookie).toBeUndefined();
    });
    test('do not appear if canTrack=false (for Symbols)', async ({
      page,
      context,
      sdk,
      packageName,
    }) => {
      // TO-DO: figure out why React gen1 fails this test,
      // track is not called in a published content if builder.canTrack = false
      test.fail(packageName === 'gen1-react');
      test.skip(
        excludeTestFor({ angular: true }, sdk),
        'Symbols not working well for Angular Gen2 SDK - infinite loop'
      );
      await page.goto('/symbol-tracking', { waitUntil: 'networkidle' });

      const cookies = await context.cookies();
      const builderSessionCookie = cookies.find(cookie => cookie.name === 'builderSessionId');
      expect(builderSessionCookie).toBeUndefined();
    });
    test('appear by default', async ({ page, context, sdk }) => {
      test.fail(excludeRn(sdk));
      const navigate = page.goto('/');
      const trackingRequestPromise = page.waitForRequest(
        req => req.url().includes('cdn.builder.io/api/v1/track') && req.method() === 'POST',
        { timeout: 10000 }
      );

      await navigate;
      // By waiting for the tracking POST request, we guarantee that the cookie is now set.
      await trackingRequestPromise;

      const builderSessionCookie = await getBuilderSessionIdCookie({ context });

      expect(builderSessionCookie).toBeDefined();
    });
  });
  test.describe('POST data', () => {
    test('POSTs correct impression data', async ({ page, sdk }) => {
      const navigate = page.goto('/');
      const trackingRequestPromise = page.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') && request.method() === 'POST',
        { timeout: 10000 }
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

      if (checkIsRN(sdk)) {
        expected.events[0].data.userAttributes.device = 'mobile';
      }

      const ID_REGEX = /^[a-f0-9]{32}$/;

      expect(data).toMatchObject(expected);
      expect(data.events[0].data.sessionId).toMatch(ID_REGEX);
      expect(data.events[0].data.visitorId).toMatch(ID_REGEX);
      expect(data.events[0].data.ownerId).toMatch(/abcd/);

      if (!checkIsRN(sdk)) {
        expect(data.events[0].data.metadata.url).toMatch(/http:\/\/localhost:\d+\//);
        expect(data.events[0].data.userAttributes.urlPath).toBe('/');
        expect(data.events[0].data.userAttributes.host).toMatch(/localhost:[\d]+/);
      }
    });

    test('POSTs correct click data', async ({ page, sdk }) => {
      test.skip(excludeGen1(sdk));
      await page.goto('/', { waitUntil: 'networkidle' });
      const trackingRequestPromise = page.waitForRequest(
        request =>
          request.url().includes('cdn.builder.io/api/v1/track') &&
          request.method() === 'POST' &&
          request.postDataJSON().events[0].type === 'click',
        { timeout: 10000 }
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

      if (checkIsRN(sdk)) {
        expected.events[0].data.userAttributes.device = 'mobile';
      }

      const ID_REGEX = /^[a-f0-9]{32}$/;

      expect(data).toMatchObject(expected);

      if (!checkIsRN(sdk)) {
        // check that all the heatmap metadata is present

        expect(!isNaN(parseFloat(data.events[0].data.metadata.builderElementIndex))).toBeTruthy();
        expect(!isNaN(parseFloat(data.events[0].data.metadata.builderTargetOffset.x))).toBeTruthy();
        expect(!isNaN(parseFloat(data.events[0].data.metadata.builderTargetOffset.y))).toBeTruthy();
        expect(!isNaN(parseFloat(data.events[0].data.metadata.targetOffset.x))).toBeTruthy();
        expect(!isNaN(parseFloat(data.events[0].data.metadata.targetOffset.y))).toBeTruthy();
      }

      // baseline tests for impression tracking
      expect(data.events[0].data.sessionId).toMatch(ID_REGEX);
      expect(data.events[0].data.visitorId).toMatch(ID_REGEX);
      expect(data.events[0].data.ownerId).toMatch(/abcd/);

      if (!checkIsRN(sdk)) {
        expect(data.events[0].data.metadata.url).toMatch(/http:\/\/localhost:\d+\//);
        expect(data.events[0].data.userAttributes.urlPath).toBe('/');
        expect(data.events[0].data.userAttributes.host).toMatch(/localhost:[\d]+/);
      }
    });
  });
});
