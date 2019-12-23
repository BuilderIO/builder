import { BuilderElement } from '@builder.io/sdk';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';

export const Assign = component({
  name: 'Shopify:Assign',
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const content = options.expression

    return `{% assign ${content} %}`;
  },
});
