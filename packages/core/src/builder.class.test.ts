import { Builder, GetContentOptions } from './builder.class';
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

  test("hits content url when format is 'html'", async () => {
    const expectedFormat = 'html';

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
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&limit=10&model=%22${MODEL}%22&enrich=true`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when format is 'amp'", async () => {
    const expectedFormat = 'amp';

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
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&limit=10&model=%22${MODEL}%22&enrich=true`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });

  test("hits content url when format is 'email'", async () => {
    const expectedFormat = 'email';

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
      `https://cdn.builder.io/api/v3/content/${MODEL}?omit=data.blocks&apiKey=${API_KEY}&fields=data&format=${expectedFormat}&userAttributes=%7B%22respectScheduling%22%3Atrue%7D&limit=10&model=%22${MODEL}%22&enrich=true`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
  });
});
