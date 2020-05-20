import { getComponent, component } from '../../src/constants/components';
import { BuilderElement } from '@builder.io/sdk';

describe('Components', () => {
  test('component function works as expected', () => {
    const COMPONENT_NAME = 'Shopify:Assign';

    component({
      name: COMPONENT_NAME,
      noWrap: true,
      component: (block: BuilderElement) => {
        const { options } = block.component!;
        const content = options.expression;

        return `{% assign ${content} %}`;
      },
    });

    const componentResult = getComponent(COMPONENT_NAME);
    expect(componentResult?.toString()).toMatchSnapshot();
  });
});
