import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

const testKey = 'YJIGb4i01jvw0SRdL5Bt';
const testModel = 'page';
const testId = 'c1b81bab59704599b997574eb0736def';

const options = {
  cachebust: 'true',
  noCache: 'true',
  'overrides.037948e52eaf4743afed464f02c70da4':
    '037948e52eaf4743afed464f02c70da4',
  'overrides.page': '037948e52eaf4743afed464f02c70da4',
  'overrides.page:/': '037948e52eaf4743afed464f02c70da4',
  preview: 'page',
};

describe('Generate Content URL', () => {
  test('generates the proper value for a simple query', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
    });
    expect(output).toMatchSnapshot();
  });

  test('Handles overrides correctly', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
      options,
    });
    expect(output).toMatchSnapshot();
  });

  test('generate content url with apiVersion as default', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
      options,
    });
    expect(output).toMatchSnapshot();
  });

  test('generate content url with apiVersion as v2', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
      options,
      apiVersion: 'v2',
    });
    expect(output).toMatchSnapshot();
  });

  test('generate content url with apiVersion as v3', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      query: { id: testId },
      options,
      apiVersion: 'v3',
    });
    expect(output).toMatchSnapshot();
  });

  test('throw error when trying to generate content url with apiVersion as v1', () => {
    expect(() => {
      generateContentUrl({
        apiKey: testKey,
        model: testModel,
        query: { id: testId },
        options,
        apiVersion: 'v1' as GetContentOptions['apiVersion'],
      });
    }).toThrow(`Invalid apiVersion: expected 'v2' or 'v3', received 'v1'`);
  });

  test('throw error when trying to generate content url with an invalid apiVersion value', () => {
    expect(() => {
      generateContentUrl({
        apiKey: testKey,
        model: testModel,
        query: { id: testId },
        options,
        apiVersion: 'INVALID_API_VERSION' as GetContentOptions['apiVersion'],
      });
    }).toThrow(
      `Invalid apiVersion: expected 'v2' or 'v3', received 'INVALID_API_VERSION'`
    );
  });

  test('generate content url with enrich option true', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
      enrich: true,
    });
    expect(output).toMatchSnapshot();
  });

  test('generate content url with enrich option not present', () => {
    const output = generateContentUrl({
      apiKey: testKey,
      model: testModel,
    });
    expect(output).toMatchSnapshot();
  });
});
