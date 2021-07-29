import { expect, test } from '@jest/globals';
import { getProcessedBlock } from './get-processed-block';

test('Can process bindings', () => {
  const block = {
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
  const processed = getProcessedBlock({ block, context: {}, state: { test: 'hello' } });
  expect(processed).not.toEqual(block);
  expect(processed.properties.foo).toEqual('baz');
  expect((processed.properties as any).test).toEqual('hello');
  expect((processed.properties as any).block).toEqual('bar');
  expect((processed.properties as any).isEditing).toEqual(false);
  expect((processed as any).responsiveStyles.large.zIndex).toEqual(2);
});
