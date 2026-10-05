export const JS_CODE_CONTEXT_CONTENT = {
  data: {
    title: 'js-code-context',
    jsCode: 'state.count = 0; context.increment = function () { state.count = state.count + 1; };',
    blocks: [
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-js-code-context-text',
        bindings: {
          'component.options.text':
            'var _virtual_index="count: "+state.count;return _virtual_index',
        },
        component: { name: 'Text', options: { text: 'count: ...' } },
      },
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-js-code-context-button',
        actions: { click: 'context.increment()' },
        component: { name: 'Core:Button', options: { text: 'Increment' } },
      },
    ],
  },
  id: 'js-code-context',
  modelId: 'page',
  name: 'js-code-context',
  published: 'published',
  query: [],
  testRatio: 1,
  variations: {},
};

export const JS_CODE_CONTEXT_HTTP_CONTENT = {
  ...JS_CODE_CONTEXT_CONTENT,
  id: 'js-code-context-http',
  name: 'js-code-context-http',
  data: {
    ...JS_CODE_CONTEXT_CONTENT.data,
    title: 'js-code-context-http',
    httpRequests: {
      article: 'https://cdn.builder.io/api/v1/proxy-api?url=https%3A%2F%2Fexample.com%2Farticle',
    },
    blocks: [
      ...JS_CODE_CONTEXT_CONTENT.data.blocks,
      {
        '@type': '@builder.io/sdk:Element',
        '@version': 2,
        id: 'builder-js-code-context-http-text',
        bindings: {
          'component.options.text':
            'var _a,_virtual_index="article: "+((_a=state.article)&&_a.title||"none");return _virtual_index',
        },
        component: { name: 'Text', options: { text: 'article: ...' } },
      },
    ],
  },
};
