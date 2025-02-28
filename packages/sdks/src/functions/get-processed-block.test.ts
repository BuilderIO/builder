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
