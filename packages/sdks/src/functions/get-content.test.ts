import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

import { test, beforeEach, expect } from '@jest/globals';
import { getContent } from './get-content';

const testKey = 'YJIGb4i01jvw0SRdL5Bt';
const testModel = 'page';
const testId = 'c1b81bab59704599b997574eb0736def';

beforeEach(() => {
  // TODO: figure out why fetchMock is not working
});

// Unskip to test real API calls
test.skip('Get content', async () => {
  expect(
    (
      await getContent({
        apiKey: testKey,
        model: testModel,
        query: {
          id: testId,
        },
      })
    )?.id
  ).toEqual(testId);
  expect(
    (
      await getContent({
        apiKey: testKey,
        model: testModel,
        userAttributes: {
          urlPath: '/test-page',
        },
      })
    )?.id
  ).toEqual(testId);
});
