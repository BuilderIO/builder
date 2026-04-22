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

  it('should merge locale with existing userAttributes', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      locale: 'fr-FR',
      userAttributes: {
        device: 'mobile',
        userId: '123',
      },
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
      limit: 1,
      userAttributes: {
        locale: 'fr-FR',
        device: 'mobile',
        userId: '123',
      },
    });
  });

  it('should use userAttributes.locale when userAttributes.locale is provided and locale is not provided', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      userAttributes: {
        locale: 'es-ES',
        device: 'desktop',
      },
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
      locale: 'es-ES',
      limit: 1,
      userAttributes: {
        locale: 'es-ES',
        device: 'desktop',
      },
    });
  });

  it('should work without locale parameter', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      userAttributes: {
        device: 'tablet',
      },
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
      limit: 1,
    });
  });

  it('should return null when no content is found', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
    };

    // WHEN
    const result = await fetchOneEntry(options);

    // THEN
    expect(result).toBeNull();
  });

  it('should pass through all other options unchanged', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      query: { published: 'published' },
      fields: 'data.title,data.description',
      omit: 'data.blocks',
      staleCacheSeconds: 300,
      cacheSeconds: 60,
      enrich: true,
      canTrack: false,
      includeUnpublished: true,
      apiVersion: 'v3',
      fetchOptions: {
        headers: {
          'Custom-Header': 'value',
        },
      },
      sort: { createdDate: -1 },
      offset: 10,
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
      limit: 1,
    });
  });

  it('should handle custom fetch function', async () => {
    //  GIVEN
    const customFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [{ id: 'test' }] }),
      })
    );

    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      fetch: customFetch,
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle custom fetchOptions', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      fetchOptions: {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ custom: 'data' }),
      },
    };

    // WHEN
    await fetchOneEntry(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://mocked.builder.io/api/v3/content/model',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ custom: 'data' }),
      })
    );
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

  it('should NOT merge locale with existing userAttributes', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      locale: 'fr-FR',
      userAttributes: {
        device: 'mobile',
        userId: '123',
      },
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
    });
  });

  it('should NOT modify userAttributes when locale is provided', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      locale: 'en-US',
      userAttributes: {
        locale: 'es-ES',
        device: 'desktop',
      },
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
    });
  });

  it('should work without locale parameter', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      userAttributes: {
        device: 'tablet',
      },
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
    });
  });

  it('should return empty array when no content is found', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
    };

    // WHEN
    const result = await fetchEntries(options);

    // THEN
    expect(result).toEqual([]);
  });

  it('should pass through all other options unchanged', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      query: { published: 'published' },
      fields: 'data.title,data.description',
      omit: 'data.blocks',
      staleCacheSeconds: 300,
      cacheSeconds: 60,
      enrich: true,
      canTrack: false,
      includeUnpublished: true,
      apiVersion: 'v3',
      fetchOptions: {
        headers: {
          'Custom-Header': 'value',
        },
      },
      sort: { createdDate: -1 },
      offset: 10,
      limit: 5,
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(generateContentUrl).toHaveBeenCalledWith({
      ...options,
    });
  });

  it('should handle custom fetch function', async () => {
    //  GIVEN
    const customFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [{ id: 'test' }] }),
      })
    );

    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      fetch: customFetch,
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle custom fetchOptions', async () => {
    //  GIVEN
    const options: GetContentOptions = {
      apiKey: 'test-key',
      model: 'test-model',
      fetchOptions: {
        method: 'POST',
        headers: {
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ custom: 'data' }),
      },
    };

    // WHEN
    await fetchEntries(options);

    // THEN
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://mocked.builder.io/api/v3/content/model',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ custom: 'data' }),
      })
    );
  });
});
