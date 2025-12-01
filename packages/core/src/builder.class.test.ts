import { Builder } from './builder.class';
import { BehaviorSubject } from './classes/observable.class';
import { BuilderContent } from './types/content';

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
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const input = {
      name: 'ArrowComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          onChange: (value: number) => value * 2,
          showIf: fn,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value * 2');
    expect(result.inputs[0].showIf).toBe(
      `return (e => !0 === e.get(\"isABTest\")).apply(this, arguments)`
    );
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

  test('serializes arrow functions with non-parenthesized args in inputs', () => {
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const input = {
      name: 'onChangeComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          // @ts-expect-error required for this test
          onChange: value => value * 2,
          showIf: fn,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toBe(`return ((value) => value * 2).apply(this, arguments)`);
  });

  test('serializes functions with parenthesized args in inputs', () => {
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const input = {
      name: 'onChangeComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          onChange: function (value: number) {
            return value * 2;
          },
          showIf: fn,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toBe(
      `return (function(value) {
            return value * 2;
          }).apply(this, arguments)`
    );
  });

  test('serializes async functions with parenthesized args in inputs', () => {
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const input = {
      name: 'AsyncOnChangeComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          onChange: async function (value: number) {
            return value * 2;
          },
          showIf: fn,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toBe(
      `return (async function(value) {
            return value * 2;
          }).apply(this, arguments)`
    );
  });

  test('serializes async arrow functions with parenthesized args in inputs', () => {
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const input = {
      name: 'AsyncOnChangeComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          onChange: async (value: number) => value * 2,
          showIf: fn,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toBe(
      'return (async (value) => value * 2).apply(this, arguments)'
    );
  });

  test('serializes async arrow functions without parenthesized args in inputs', () => {
    // Using eval and template literal to prevent TypeScript from adding parens
    const fn = eval(`(${`e => !0 === e.get("isABTest")`})`);
    const input = {
      name: 'AsyncOnChangeComponent',
      inputs: [
        {
          name: 'number',
          type: 'number',
          // @ts-expect-error
          onChange: async value => value * 2,
          showIf: fn,
        },
      ],
    };

    const result = Builder['serializeIncludingFunctions'](input);

    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toBe(
      'return (async (value) => value * 2).apply(this, arguments)'
    );
  });

  test('does not serialize onSave function when isForPlugin is true', () => {
    const onSaveFn = function (data: any) {
      return data;
    };
    const input = {
      name: 'PluginComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: function (value: string) {
            return value.toUpperCase();
          },
        },
      ],
      onSave: onSaveFn,
    };

    const result = Builder['serializeIncludingFunctions'](input, true);

    // Check that onChange was serialized to a string
    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value.toUpperCase()');

    // Check that onSave was preserved as a function
    expect(typeof result.onSave).toBe('function');
    expect(result.onSave).toBe(onSaveFn);
  });

  test('serializes all functions when isForPlugin is false', () => {
    const onSaveFn = function (data: any) {
      return data;
    };
    const input = {
      name: 'PluginComponent',
      inputs: [
        {
          name: 'text',
          type: 'string',
          onChange: function (value: string) {
            return value.toUpperCase();
          },
        },
      ],
      onSave: onSaveFn,
    };

    const result = Builder['serializeIncludingFunctions'](input, false);

    // Check that all functions were serialized to strings
    expect(typeof result.inputs[0].onChange).toBe('string');
    expect(result.inputs[0].onChange).toContain('value.toUpperCase()');
    expect(typeof result.onSave).toBe('string');
  });

  test('serializes top-level functions when isForPlugin is true except onSave', () => {
    const onSaveFn = function (data: any) {
      return data;
    };
    const validateFn = function (data: any) {
      return data.isValid;
    };

    const input = {
      name: 'PluginComponent',
      validate: validateFn,
      onSave: onSaveFn,
    };

    const result = Builder['serializeIncludingFunctions'](input, true);

    // Check that validate was serialized
    expect(typeof result.validate).toBe('string');
    expect(result.validate).toContain('return data.isValid');

    // Check that onSave was preserved as a function
    expect(typeof result.onSave).toBe('function');
    expect(result.onSave).toBe(onSaveFn);
  });

  test('preserves onSave function in both input and output when isForPlugin is true', () => {
    const onSaveFn = function (data: any) {
      console.log('Saving data');
      return (data.modified = true);
    };

    const input = {
      name: 'PluginWithOnSave',
      onSave: onSaveFn,
    };

    const result = Builder['serializeIncludingFunctions'](input, true);

    // Verify the function is the same reference
    expect(result.onSave).toBe(input.onSave);

    // Verify behavior is preserved by calling the function
    const testData: any = { value: 'test' };
    result.onSave(testData);
    expect(testData.modified).toBe(true);
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
  const OMIT = 'data.blocks';

  let builder: Builder;

  const codegenOrQueryApiResult = {
    [MODEL]: [
      {
        lastUpdatedBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
        folders: [],
        data: {
          themeId: false,
          title: 'test',
          blocks: [
            {
              '@type': '@builder.io/sdk:Element',
              '@version': 2,
              id: 'builder-370f0829496c41d48b1fb77c1b4ea2b2',
              component: {
                name: 'Text',
                options: {
                  text: 'A is selected',
                },
              },
              responsiveStyles: {
                large: {
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  flexShrink: '0',
                  boxSizing: 'border-box',
                  marginTop: '20px',
                  lineHeight: 'normal',
                  height: 'auto',
                },
              },
            },
            {
              id: 'builder-pixel-lrwo8ns32dg',
              '@type': '@builder.io/sdk:Element',
              tagName: 'img',
              properties: {
                src: 'https://cdn.builder.io/api/v1/pixel?apiKey=5271c255f7824802a30f12bdad90e347',
                'aria-hidden': 'true',
                alt: '',
                role: 'presentation',
                width: '0',
                height: '0',
              },
              responsiveStyles: {
                large: {
                  height: '0',
                  width: '0',
                  display: 'inline-block',
                  opacity: '0',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                },
              },
            },
          ],
          url: '/test',
          state: {
            deviceSize: 'large',
            location: {
              pathname: '/test',
              path: ['test'],
              query: {},
            },
          },
        },
        modelId: '12518e35051e42dda999e91f1162f0bd',
        query: [
          {
            '@type': '@builder.io/core:Query',
            property: 'urlPath',
            value: '/test',
            operator: 'is',
          },
          {
            '@type': '@builder.io/core:Query',
            property: 'name',
            value: ['a'],
            operator: 'is',
          },
        ],
        published: 'published',
        firstPublished: 1725450385400,
        testRatio: 1,
        lastUpdated: 1725451287436,
        createdDate: 1725450170945,
        createdBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
        meta: {
          lastPreviewUrl:
            'http://localhost:5173/test?builder.space=5271c255f7824802a30f12bdad90e347&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=ad03bbebf34b49a9912aeae629571db7&builder.overrides.ad03bbebf34b49a9912aeae629571db7=ad03bbebf34b49a9912aeae629571db7&builder.overrides.page:/test=ad03bbebf34b49a9912aeae629571db7&builder.options.locale=Default',
          kind: 'page',
          hasLinks: false,
        },
        variations: {},
        name: 'test',
        id: 'ad03bbebf34b49a9912aeae629571db7',
        rev: '9inkgroan7l',
      },
    ],
  };

  const contentApiResult = {
    results: [
      {
        lastUpdatedBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
        folders: [],
        data: {
          themeId: false,
          title: 'test',
          blocks: [],
          url: '/test',
          state: {
            deviceSize: 'large',
            location: {
              path: '',
              query: {},
            },
          },
        },
        modelId: '12518e35051e42dda999e91f1162f0bd',
        query: [
          {
            '@type': '@builder.io/core:Query',
            property: 'urlPath',
            value: '/test',
            operator: 'is',
          },
          {
            '@type': '@builder.io/core:Query',
            property: 'name',
            value: ['a'],
            operator: 'is',
          },
        ],
        published: 'published',
        firstPublished: 1725450385400,
        testRatio: 1,
        lastUpdated: 1725451287436,
        createdDate: 1725450170945,
        createdBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
        meta: {
          lastPreviewUrl:
            'http://localhost:5173/test?builder.space=5271c255f7824802a30f12bdad90e347&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=ad03bbebf34b49a9912aeae629571db7&builder.overrides.ad03bbebf34b49a9912aeae629571db7=ad03bbebf34b49a9912aeae629571db7&builder.overrides.page:/test=ad03bbebf34b49a9912aeae629571db7&builder.options.locale=Default',
          kind: 'page',
          hasLinks: false,
        },
        variations: {},
        name: 'test',
        id: 'ad03bbebf34b49a9912aeae629571db7',
        rev: 'kvr9rrrklws',
      },
      {
        createdDate: 1725363956284,
        data: {
          title: 'Builder + React Demo Page',
          blocks: [],
          url: ['/builder-demo'],
          state: {
            deviceSize: 'large',
            location: {
              path: '',
              query: {},
            },
          },
        },
        modelId: '12518e35051e42dda999e91f1162f0bd',
        query: [
          {
            property: 'urlPath',
            value: ['/builder-demo'],
            operator: 'is',
          },
        ],
        name: 'Builder + React Demo Page',
        id: '87853dcacee64c4a9b573faa46823e61',
        published: 'published',
        meta: {},
        rev: 'kvr9rrrklws',
      },
      {
        lastUpdatedBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
        folders: [],
        data: {
          themeId: false,
          title: 'Test Page',
          blocks: [],
          url: '/test-page',
          state: {
            deviceSize: 'large',
            location: {
              path: '',
              query: {},
            },
          },
        },
        modelId: '12518e35051e42dda999e91f1162f0bd',
        query: [
          {
            '@type': '@builder.io/core:Query',
            property: 'urlPath',
            value: '/test-page',
            operator: 'is',
          },
        ],
        published: 'published',
        firstPublished: 1722527310201,
        testRatio: 1,
        lastUpdated: 1722528875919,
        createdDate: 1722527254768,
        createdBy: 'vkEwLBAcR1VHNUy7DDD366ffYjQ2',
        meta: {
          kind: 'page',
          lastPreviewUrl:
            'http://localhost:3000/test-page?builder.space=5271c255f7824802a30f12bdad90e347&builder.user.permissions=read%2Ccreate%2Cpublish%2CeditCode%2CeditDesigns%2Cadmin%2CeditLayouts%2CeditLayers&builder.user.role.name=Admin&builder.user.role.id=admin&builder.cachebust=true&builder.preview=page&builder.noCache=true&builder.allowTextEdit=true&__builder_editing__=true&builder.overrides.page=e53863a02641455294ac59ab7e2be643&builder.overrides.e53863a02641455294ac59ab7e2be643=e53863a02641455294ac59ab7e2be643&builder.overrides.page:/test-page=e53863a02641455294ac59ab7e2be643',
          hasLinks: false,
        },
        variations: {},
        name: 'Test Page',
        id: 'e53863a02641455294ac59ab7e2be643',
        rev: 'kvr9rrrklws',
      },
    ],
  };

  beforeEach(() => {
    builder = new Builder(API_KEY, undefined, undefined, false, AUTH_TOKEN, 'v3');

    const builderSubject = new BehaviorSubject<BuilderContent[]>([]);
    builderSubject.next = jest.fn(() => {});
    builder.observersByKey[MODEL] = builderSubject;
    builder['makeFetchApiCall'] = jest.fn((url: string) => {
      const result =
        url.includes('/codegen/') || url.includes('/query/')
          ? codegenOrQueryApiResult
          : contentApiResult;
      return Promise.resolve({
        json: () => {
          return Promise.resolve(result);
        },
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
      expect(err.message).toBe("Invalid apiVersion: expected 'v3', received 'v1'");
    }
  });

  test("hits codegen url when format is 'solid'", async () => {
    const expectedFormat = 'solid';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...codegenOrQueryApiResult[MODEL][0],
      variationId: expect.any(String),
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v1/codegen/${API_KEY}/${MODEL}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=solid&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${MODEL}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits codegen url when format is 'react'", async () => {
    const expectedFormat = 'react';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...codegenOrQueryApiResult[MODEL][0],
      variationId: expect.any(String),
    });
    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v1/codegen/${API_KEY}/${MODEL}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=react&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${MODEL}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits query url when apiEndpoint is undefined and format is 'html'", async () => {
    const expectedFormat = 'html';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...codegenOrQueryApiResult[MODEL][0],
      variationId: expect.any(String),
    });
    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/query/${API_KEY}/${MODEL}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${MODEL}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when apiEndpoint is 'content' and format is 'html'", async () => {
    const expectedFormat = 'html';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...contentApiResult.results[0],
      variationId: expect.any(String),
    });
    expect(observerNextMock.mock.calls[0][0][1]).toStrictEqual({
      ...contentApiResult.results[1],
    });
    expect(observerNextMock.mock.calls[0][0][2]).toStrictEqual({
      ...contentApiResult.results[2],
      variationId: expect.any(String),
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&includeRefs=true&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits query url when apiEndpoint is undefined and format is 'amp'", async () => {
    const expectedFormat = 'amp';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...codegenOrQueryApiResult[MODEL][0],
      variationId: expect.any(String),
    });
    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/query/${API_KEY}/${MODEL}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${MODEL}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when apiEndpoint is 'content' and format is 'amp'", async () => {
    const expectedFormat = 'amp';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...contentApiResult.results[0],
      variationId: expect.any(String),
    });
    expect(observerNextMock.mock.calls[0][0][1]).toStrictEqual({
      ...contentApiResult.results[1],
    });
    expect(observerNextMock.mock.calls[0][0][2]).toStrictEqual({
      ...contentApiResult.results[2],
      variationId: expect.any(String),
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&includeRefs=true&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits query url when apiEndpoint is undefined and format is 'email'", async () => {
    const expectedFormat = 'email';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...codegenOrQueryApiResult[MODEL][0],
      variationId: expect.any(String),
    });
    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/query/${API_KEY}/${MODEL}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&options.${MODEL}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits query url when apiEndpoint is undefined and format is 'email' and url is passed instead of userAttributes", async () => {
    const expectedFormat = 'email';

    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        url: '/test-page',
        omit: OMIT,
        fields: 'data',
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...codegenOrQueryApiResult[MODEL][0],
      variationId: expect.any(String),
    });
    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/query/${API_KEY}/${MODEL}?omit=${OMIT}&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22urlPath%22%3A%22%2Ftest-page%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&options.${MODEL}.model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when apiEndpoint is 'content' and format is 'email'", async () => {
    const expectedFormat = 'email';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        userAttributes: { respectScheduling: true },
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...contentApiResult.results[0],
      variationId: expect.any(String),
    });
    expect(observerNextMock.mock.calls[0][0][1]).toStrictEqual({
      ...contentApiResult.results[1],
    });
    expect(observerNextMock.mock.calls[0][0][2]).toStrictEqual({
      ...contentApiResult.results[2],
      variationId: expect.any(String),
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&includeRefs=true&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when apiEndpoint is 'content' and format is 'email' and url is passed instead of userAttributes", async () => {
    const expectedFormat = 'email';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: MODEL,
        format: expectedFormat,
        key: MODEL,
        url: '/test-page',
        omit: OMIT,
        fields: 'data',
        limit: 10,
      },
    ]);

    const observerNextMock = builder.observersByKey[MODEL]?.next as jest.Mock;

    expect(observerNextMock).toBeCalledTimes(1);
    expect(observerNextMock.mock.calls[0][0][0]).toStrictEqual({
      ...contentApiResult.results[0],
      variationId: expect.any(String),
    });
    expect(observerNextMock.mock.calls[0][0][1]).toStrictEqual({
      ...contentApiResult.results[1],
    });
    expect(observerNextMock.mock.calls[0][0][2]).toStrictEqual({
      ...contentApiResult.results[2],
      variationId: expect.any(String),
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22urlPath%22%3A%22%2Ftest-page%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=10&model=%22${MODEL}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with query.id when id is passed in options.query', async () => {
    const expectedModel = 'symbol';
    const expectedFormat = 'email';
    const expectedEntryId = '123';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: expectedModel,
        format: expectedFormat,
        key: expectedModel,
        omit: OMIT,
        fields: 'data',
        limit: 10,
        entry: expectedEntryId,
        query: {
          id: expectedEntryId,
        },
      },
    ]);

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=10&model=%22${expectedModel}%22&entry=%22123%22&query.id=%22${expectedEntryId}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with query as the same object as the one passed in options.query if query contains $ mongo-operator', async () => {
    const expectedModel = 'symbol';
    const expectedFormat = 'email';
    const expectedEntryId = '123';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: expectedModel,
        format: expectedFormat,
        key: expectedModel,
        omit: OMIT,
        fields: 'data',
        limit: 10,
        entry: expectedEntryId,
        query: {
          data: {
            id: '123',
          },
          $or: [
            {
              data: {
                sourceUrl: '/c/docs/develop',
              },
            },
            {
              data: {
                sourceUrl: 'https://www.builder.io' + '/c/docs/develop',
              },
            },
          ],
        },
      },
    ]);

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/symbol?omit=data.blocks&apiKey=25608a566fbb654ea959c1b1729e370d&fields=data&format=email&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=10&model=%22symbol%22&entry=%22123%22&query=%7B%22data%22%3A%7B%22id%22%3A%22123%22%7D%2C%22%24or%22%3A%5B%7B%22data%22%3A%7B%22sourceUrl%22%3A%22%2Fc%2Fdocs%2Fdevelop%22%7D%7D%2C%7B%22data%22%3A%7B%22sourceUrl%22%3A%22https%3A%2F%2Fwww.builder.io%2Fc%2Fdocs%2Fdevelop%22%7D%7D%5D%7D`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with query as the same object as the one passed in options.query if query contains nested $ mongo-operator', async () => {
    const expectedModel = 'symbol';
    const expectedFormat = 'email';
    const expectedEntryId = '123';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: expectedModel,
        format: expectedFormat,
        key: expectedModel,
        omit: OMIT,
        fields: 'data',
        limit: 10,
        entry: expectedEntryId,
        query: {
          data: {
            sourceUrl: { $eq: '/c/docs/develop' },
          },
        },
      },
    ]);

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/symbol?omit=data.blocks&apiKey=25608a566fbb654ea959c1b1729e370d&fields=data&format=email&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=10&model=%22symbol%22&entry=%22123%22&query.data.sourceUrl=%7B%22%24eq%22%3A%22%2Fc%2Fdocs%2Fdevelop%22%7D`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with query as the flattened object as the one passed in options.query if query does not contain $ mongo-operator', async () => {
    const expectedModel = 'symbol';
    const expectedFormat = 'email';
    const expectedEntryId = '123';

    builder.apiEndpoint = 'content';
    const result = await builder['flushGetContentQueue'](true, [
      {
        model: expectedModel,
        format: expectedFormat,
        key: expectedModel,
        omit: OMIT,
        fields: 'data',
        limit: 10,
        entry: expectedEntryId,
        query: {
          data: {
            sourceUrl: '/c/docs/develop',
          },
          name: {
            fullName: 'John Doe',
          },
        },
      },
    ]);

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/symbol?omit=data.blocks&apiKey=25608a566fbb654ea959c1b1729e370d&fields=data&format=email&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=10&model=%22symbol%22&entry=%22123%22&query.data.sourceUrl=%22%2Fc%2Fdocs%2Fdevelop%22&query.name.fullName=%22John%20Doe%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });
});

describe('get', () => {
  const API_KEY = '25608a566fbb654ea959c1b1729e370d';
  const MODEL = 'page';
  const AUTH_TOKEN = '82202e99f9fb4ed1da5940f7fa191e72';

  let builder: Builder;

  beforeEach(() => {
    builder = new Builder(API_KEY, undefined, undefined, false, AUTH_TOKEN, 'v3');
    const builderSubject = new BehaviorSubject<BuilderContent[]>([]);
    builderSubject.next = jest.fn(() => {});
    builder.observersByKey[MODEL] = builderSubject;
    builder['makeFetchApiCall'] = jest.fn((url: string) => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve({});
        },
      });
    });
  });

  test('hits content url with includeRefs=false when passed in params and noTraverse=false', async () => {
    const expectedModel = 'page';

    const includeRefs = false;

    builder.apiEndpoint = 'content';
    builder.getLocation = jest.fn(() => ({
      search: `?builder.params=includeRefs%3D${includeRefs}`,
    }));

    await builder.get(expectedModel, {});

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=meta.componentsUsed&apiKey=${API_KEY}&noTraverse=false&userAttributes=%7B%22device%22%3A%22desktop%22%7D&includeRefs=${includeRefs}&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with includeRefs=true and noTraverse=false by default', async () => {
    const expectedModel = 'page';

    builder.apiEndpoint = 'content';
    await builder.get(expectedModel, {});

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=meta.componentsUsed&apiKey=${API_KEY}&noTraverse=false&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with includeRefs=false when passed in options and noTraverse=false by default', async () => {
    const expectedModel = 'page';

    builder.apiEndpoint = 'content';
    await builder.get(expectedModel, {
      includeRefs: false,
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=meta.componentsUsed&apiKey=${API_KEY}&noTraverse=false&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=false&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content API with locale=en-IN added to the locale query param and the userAttributes.locale param', async () => {
    const expectedModel = 'page';
    const expectedLocale = 'en-IN';

    builder.apiEndpoint = 'content';
    await builder.get(expectedModel, { locale: expectedLocale });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/page?omit=meta.componentsUsed&apiKey=${API_KEY}&locale=${expectedLocale}&noTraverse=false&userAttributes=%7B%22locale%22%3A%22${expectedLocale}%22%7D&includeRefs=true&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });
});

describe('getAll', () => {
  const API_KEY = '25608a566fbb654ea959c1b1729e370d';
  const MODEL = 'page';
  const AUTH_TOKEN = '82202e99f9fb4ed1da5940f7fa191e72';

  let builder: Builder;

  beforeEach(() => {
    builder = new Builder(API_KEY, undefined, undefined, false, AUTH_TOKEN, 'v3');
    const builderSubject = new BehaviorSubject<BuilderContent[]>([]);
    builderSubject.next = jest.fn(() => {});
    builder.observersByKey[MODEL] = builderSubject;
    builder['makeFetchApiCall'] = jest.fn((url: string) => {
      return Promise.resolve({
        json: () => {
          return Promise.resolve({});
        },
      });
    });
  });

  test('hits content url with includeRefs=false when passed in params and noTraverse=true by default', async () => {
    const expectedModel = 'page';

    const includeRefs = false;

    builder.apiEndpoint = 'content';
    builder.getLocation = jest.fn(() => ({
      search: `?builder.params=includeRefs%3D${includeRefs}`,
    }));

    await builder.getAll(expectedModel, {});

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=meta.componentsUsed&apiKey=${API_KEY}&noTraverse=true&userAttributes=%7B%22device%22%3A%22desktop%22%7D&includeRefs=${includeRefs}&limit=30&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with includeRefs=true and noTraverse=true by default', async () => {
    const expectedModel = 'page';

    builder.apiEndpoint = 'content';
    await builder.getAll(expectedModel, {});

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=meta.componentsUsed&apiKey=${API_KEY}&noTraverse=true&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=30&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with includeRefs=false when passed in options and noTraverse=true by default', async () => {
    const expectedModel = 'page';

    builder.apiEndpoint = 'content';
    await builder.getAll(expectedModel, {
      includeRefs: false,
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/${expectedModel}?omit=meta.componentsUsed&apiKey=${API_KEY}&noTraverse=true&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=false&limit=30&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content API with locale=en-IN added to the locale query param and NOT the userAttributes.locale param', async () => {
    const expectedModel = 'page';
    const expectedLocale = 'en-IN';

    builder.apiEndpoint = 'content';
    await builder.getAll(expectedModel, { locale: expectedLocale });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      `https://cdn.builder.io/api/v3/content/page?omit=meta.componentsUsed&apiKey=${API_KEY}&locale=${expectedLocale}&noTraverse=true&userAttributes=%7B%22urlPath%22%3A%22%2F%22%2C%22host%22%3A%22localhost%22%2C%22device%22%3A%22desktop%22%7D&includeRefs=true&limit=30&model=%22${expectedModel}%22`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits query url with enrich=true when passed in options', async () => {
    const expectedModel = 'page';

    await builder.getAll(expectedModel, { enrich: true });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrich=true'),
      expect.anything()
    );
  });

  test('hits query url with enrichOptions.enrichLevel when passed in options', async () => {
    const expectedModel = 'page';

    await builder.getAll(expectedModel, {
      enrich: true,
      enrichOptions: { enrichLevel: 2 },
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(expect.stringContaining('enrich=true'), {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrichOptions.enrichLevel=2'),
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits content url with enrich=true when apiEndpoint is content', async () => {
    const expectedModel = 'page';

    builder.apiEndpoint = 'content';
    await builder.getAll(expectedModel, { enrich: true });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(expect.stringContaining('enrich=true'), {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
  });

  test('hits content url with enrichOptions.enrichLevel when apiEndpoint is content', async () => {
    const expectedModel = 'page';

    builder.apiEndpoint = 'content';
    await builder.getAll(expectedModel, {
      enrich: true,
      enrichOptions: { enrichLevel: 3 },
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(expect.stringContaining('enrich=true'), {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrichOptions.enrichLevel=3'),
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test('hits query url with enrichOptions.model when passed complex model options', async () => {
    const expectedModel = 'page';

    await builder.getAll(expectedModel, {
      enrich: true,
      enrichOptions: {
        enrichLevel: 2,
        model: {
          product: {
            fields: 'id,name,price',
            omit: 'data.internalNotes',
          },
          category: {
            fields: 'id,name',
          },
        },
      },
    });

    expect(builder['makeFetchApiCall']).toBeCalledTimes(1);
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrichOptions.enrichLevel=2'),
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrichOptions.model.product.fields=id%2Cname%2Cprice'),
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrichOptions.model.product.omit=data.internalNotes'),
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
    expect(builder['makeFetchApiCall']).toBeCalledWith(
      expect.stringContaining('enrichOptions.model.category.fields=id%2Cname'),
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });
});
