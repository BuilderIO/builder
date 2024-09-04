import { Builder, GetContentOptions } from './builder.class';

describe('Builder', () => {
  test('trustedHosts', () => {
    expect(Builder.isTrustedHost('localhost')).toBe(true);
    expect(Builder.isTrustedHost('builder.io')).toBe(true);
    expect(Builder.isTrustedHost('beta.builder.io')).toBe(true);
    expect(Builder.isTrustedHost('qa.builder.io')).toBe(true);
    expect(Builder.isTrustedHost('123-review-build.beta.builder.io')).toBe(true);
  });

  test('arbitrary builder.io subdomains', () => {
    expect(Builder.isTrustedHost('cdn.builder.io')).toBe(false);
    expect(Builder.isTrustedHost('foo.builder.io')).toBe(false);
    expect(Builder.isTrustedHost('evildomainbeta.builder.io')).toBe(false);
  });

  test('add trusted host', () => {
    expect(Builder.isTrustedHost('example.com')).toBe(false);
    Builder.registerTrustedHost('example.com');
    expect(Builder.isTrustedHost('example.com')).toBe(true);
  });
});

describe('serializeIncludingFunctions', () => {
  test('serializes functions in inputs', () => {
    const input = {
      name: 'TestComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: function (value: string) {
            return value.toUpperCase();
          },
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('return value.toUpperCase()');
  });

  test('serializes arrow functions in inputs', () => {
    const input = {
      name: 'ArrowComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          onChange: (value: number) => value * 2,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value * 2');
  });

  test('does not modify non-function properties', () => {
    const input = {
      name: 'MixedComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          defaultValue: 'hello',
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(result).toEqual(input);
  });

  test('handles multiple inputs with mixed properties', () => {
    const input = {
      name: 'ComplexComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: (value: string) => value.trim(),
        },
        {
          name: 'number',
          type: 'number',
          defaultValue: 42,
        },
        {
          name: 'options',
          type: 'string',
          onChange: function (value: string[]) {
            return value.map(v => v.toLowerCase());
          },
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value.trim()');

    expect(result.inputs[1]).toEqual(input.inputs[1]);

    expect(typeof result.inputs[2].onChange).toBe('string');
    expect(result.inputs[2].onChange).toContain('v.toLowerCase()');
  });
});

describe('prepareComponentSpecToSend', () => {
  test('removes class property and serializes functions in inputs', () => {
    const input = {
      name: 'TestComponent',
      class: class TestClass {},
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: function (value: string) {
            return value.toUpperCase();
          },
        },
      ],
    };

    const result = Builder['prepareComponentSpecToSend'](input);

    expect(result.class).toBeUndefined();
    expect(typeof result.inputs?.[0].onChange).toBe('string');
    expect(result.inputs?.[0].onChange).toContain('value.toUpperCase()');
  });

  test('preserves other properties', () => {
    const input = {
      name: 'ComplexComponent',
      class: class ComplexClass {},
      inputs: [
        {
          name: 'text',
          type: 'string',
          defaultValue: 'hello',
          onChange: (value: string) => value.trim(),
        },
        {
          name: 'number',
          type: 'number',
          defaultValue: 42,
        },
      ],
    };

    const result = Builder['prepareComponentSpecToSend'](input);

    expect(result.class).toBeUndefined();
    expect(result.name).toBe('ComplexComponent');
    expect(result.inputs?.length).toBe(2);
    expect(typeof result.inputs?.[0].onChange).toBe('string');
    expect(result.inputs?.[0].onChange).toContain('value.trim()');
    expect(result.inputs?.[0].defaultValue).toBe('hello');
    expect(result.inputs?.[1]).toEqual(input.inputs[1]);
  });
});

describe('flushGetContentQueue', () => {
  const API_KEY = '25608a566fbb654ea959c1b1729e370d';
  const MODEL = 'page';
  const AUTH_TOKEN = '82202e99f9fb4ed1da5940f7fa191e72';
  const KEY = 'my-key';
  const OMIT = 'data.blocks';

  let builder: Builder;

  beforeEach(() => {
    builder = new Builder(API_KEY, undefined, undefined, false, AUTH_TOKEN, 'v3');
    builder['makeCodegenOrContentApiCall'] = jest.fn(() => {
      return Promise.resolve({
        json: Promise.resolve(),
      });
    });
  });

  test('throws error if apiKey is not defined', () => {
    builder = new Builder();
    try {
      builder['flushGetContentQueue']();
    } catch (err: any) {
      expect(err.message).toBe(
        'Fetching content failed, expected apiKey to be defined instead got: null'
      );
    }
  });

  test('throws error if apiVersion is not v3', () => {
    builder = new Builder(API_KEY, undefined, undefined, false, AUTH_TOKEN, 'v1');

    try {
      builder['flushGetContentQueue']();
    } catch (err: any) {
      expect(err.message).toBe("Invalid apiVersion: 'v3', received 'v1'");
    }
  });

  test("hits codegen url when format is 'solid'", async () => {
    const expectedFormat = 'solid';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: KEY,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    expect(builder['makeCodegenOrContentApiCall']).toBeCalledTimes(1);
    expect(builder['makeCodegenOrContentApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/codegen/${API_KEY}/${KEY}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=solid&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${KEY}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits codegen url when format is 'react'", async () => {
    const expectedFormat = 'react';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: KEY,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    expect(builder['makeCodegenOrContentApiCall']).toBeCalledTimes(1);
    expect(builder['makeCodegenOrContentApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/codegen/${API_KEY}/${KEY}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=react&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${KEY}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when format is neither 'html'", async () => {
    const expectedFormat = 'html';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: KEY,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    expect(builder['makeCodegenOrContentApiCall']).toBeCalledTimes(1);
    expect(builder['makeCodegenOrContentApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=html&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when format is neither 'amp'", async () => {
    const expectedFormat = 'amp';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: KEY,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    expect(builder['makeCodegenOrContentApiCall']).toBeCalledTimes(1);
    expect(builder['makeCodegenOrContentApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=amp&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when format is neither 'email'", async () => {
    const expectedFormat = 'email';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: KEY,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    expect(builder['makeCodegenOrContentApiCall']).toBeCalledTimes(1);
    expect(builder['makeCodegenOrContentApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=email&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });
});
