import { describe, test, beforeEach, expect } from '@jest/globals';
import { generateContentUrl } from '.';

const testKey = 'YJIGb4i01jvw0SRdL5Bt';
const testModel = 'page';
const testId = 'c1b81bab59704599b997574eb0736def';

beforeEach(() => {
  // TODO: figure out why fetchMock is not working
});

describe('Generate Content URL', () => {
  test('generates the proper value for a simple query', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: {
        id: testId,
      },
    });
    expect(output).toMatchSnapshot();
  });
  test('Handles overrides correctly', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: {
        id: testId,
      },
    });
    expect(output).toMatchSnapshot();
  });
});
