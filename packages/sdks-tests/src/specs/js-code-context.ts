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
