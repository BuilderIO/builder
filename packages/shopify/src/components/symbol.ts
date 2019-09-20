import { component } from '../constants/components';

export const Symbol = component({
  name: 'Symbol',
  component: (block, renderOptions) => {
    const {
      options: {
        symbol: { inline, content },
      },
    } = block.component!;

    return `
    <div class="builder-symbol${inline ? ' builder-inline-symbol' : ''}">
      ${content ? contentToLiquid(content, 'symbol', renderOptions) : ''}
    </div>
    `;
  },
});

import { contentToLiquid } from '../functions/content-to-liquid';
