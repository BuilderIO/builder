import type { BuilderContent } from '../../types/builder-content.js';
import { hasPersonalizationContainer } from './helpers.js';

const container = {
  '@type': '@builder.io/sdk:Element' as const,
  component: { name: 'PersonalizationContainer', options: { variants: [] } },
};

describe('hasPersonalizationContainer', () => {
  test('is false for empty or container-free content', () => {
    expect(hasPersonalizationContainer(null)).toBe(false);
    expect(hasPersonalizationContainer(undefined)).toBe(false);
    expect(
      hasPersonalizationContainer({
        data: {
          blocks: [{ '@type': '@builder.io/sdk:Element', children: [] }],
        },
      })
    ).toBe(false);
  });

  test('finds containers nested in children, options and A/B variations', () => {
    const nested: BuilderContent = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element',
            component: {
              name: 'Columns',
              options: { columns: [{ blocks: [{ children: [container] }] }] },
            },
          },
        ],
      },
    };
    expect(hasPersonalizationContainer(nested)).toBe(true);
    expect(
      hasPersonalizationContainer({
        data: { blocks: [] },
        variations: { v1: { data: { blocks: [container] } } },
      })
    ).toBe(true);
  });
});
