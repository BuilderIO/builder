import { fetch } from '../get-fetch.js';
import { fetchEntries, fetchOneEntry } from './';
import { generateContentUrl } from './generate-content-url.js';
import type { GetContentOptions } from './types.js';

vi.mock('./generate-content-url.js', () => ({
  generateContentUrl: vi.fn(() => {
    return new URL('https://mocked.builder.io/api/v3/content/model');
  }),
}));

vi.mock('../get-fetch.js', () => ({
  fetch: vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          results: [],
        }),
    })
  ),
}));

describe('fetchOneEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a content URL and add locale to userAttributes', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      locale: 'en-US',
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
      limit: 1,
      userAttributes: {
        locale: 'en-US',
      },
    });
  });
});

describe('fetchEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a content URL and NOT add locale to userAttributes', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      locale: 'en-US',
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
    });
  });
});
