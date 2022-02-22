import { expect, test } from '@jest/globals';
import { BuilderBlock } from '../types/builder-block';
import * as file from './get-processed-block';

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
        const foo = 'bar';
        return foo;
      `,
      'properties.isEditing': 'builder.isEditing',
    },
  };
  const processed = file.getProcessedBlock({
    block,
    context: {},
    state: { test: 'hello' },
  });
  expect(processed).not.toEqual(block);
  expect(processed.properties?.foo).toEqual('baz');
  expect(processed.properties?.test).toEqual('hello');
  expect(processed.properties?.block).toEqual('bar');
  expect(processed.properties?.isEditing).toEqual(false);
  expect(processed.responsiveStyles?.large?.zIndex).toEqual(2);
});
