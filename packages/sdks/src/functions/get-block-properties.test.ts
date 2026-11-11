import type { BuilderContextInterface } from '../context/types.js';
import type { BuilderBlock } from '../types/builder-block.js';
import { getBlockProperties } from './get-block-properties.js';

const context = {} as BuilderContextInterface;

test('Merges properties.class into className without forwarding a raw class prop', () => {
  const block: BuilderBlock = {
    '@type': '@builder.io/sdk:Element',
    id: 'builder-test',
    class: 'block-class',
    properties: {
      class: 'customer-class another-class',
      title: 'Example',
      _newProperty: 'unused',
    },
  };
  const originalProperties = { ...block.properties };

  const properties = getBlockProperties({ block, context });

  expect(properties).toHaveProperty(
    'className',
    'builder-test builder-block block-class customer-class another-class'
  );
  expect(properties).not.toHaveProperty('class');
  expect(properties).not.toHaveProperty('_newProperty');
  expect(properties).toHaveProperty('title', 'Example');
  expect(properties['builder-id']).toBe('builder-test');
  expect(block.properties).toEqual(originalProperties);
});

test.each<BuilderBlock['properties']>([undefined, {}, { class: '' }])(
  'Preserves Builder classes when custom properties are %j',
  (properties) => {
    expect(
      getBlockProperties({
        block: {
          '@type': '@builder.io/sdk:Element',
          id: 'builder-test',
          properties,
        },
        context,
      })
    ).toHaveProperty('className', 'builder-test builder-block');
  }
);
