import type { BuilderBlock } from '../types/builder-block.js';
import { getProcessedBlock } from './get-processed-block.js';

test('Can process bindings', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    properties: {
      foo: 'bar',
    },
    bindings: {
      'properties.foo': '"baz"',
      'responsiveStyles.large.zIndex': '1 + 1',
      'properties.test': 'state.test',
      'properties.block': `
        var foo = 'bar';
        return foo;
      `,
      'properties.isEditing': 'builder.isEditing',
    },
  };
  const processed = getProcessedBlock({
    block,
    context: {},
    rootState: { test: 'hello' },
    rootSetState: undefined,
    localState: undefined,
  });
  expect(processed).not.toEqual(block);
  expect(processed.properties?.foo).toEqual('baz');
  expect(processed.properties?.test).toEqual('hello');
  expect(processed.properties?.block).toEqual('bar');
  expect(processed.properties?.isEditing).toEqual(false);
  expect(processed.responsiveStyles?.large?.zIndex).toEqual(2);
});

test.only('Can process localized bindings', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    bindings: {
      'component.options.text':
        'var _virtual_index=state.listData.data.title;return _virtual_index',
    },
    component: {
      name: 'Text',
      options: {
        text: 'Enter some text...',
      },
    },
  };

  const rootState = {
    deviceSize: 'large',
    listData: {
      data: {
        title: {
          Default: 'default title',
          '@type': '@builder.io/core:LocalizedValue',
          'en-US': 'en-US title',
          'en-IN': 'en-IN title',
        },
      },
    },
    locale: 'en-US',
  };
  const processed = getProcessedBlock({
    block,
    context: {},
    rootState,
    rootSetState: undefined,
    localState: undefined,
  });

  expect(processed.component?.options.text).toEqual('en-US title');
});
