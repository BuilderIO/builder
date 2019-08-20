import { blockToLiquid } from '../../functions/block-to-liquid';
import { component } from '../../constants/components';

// TODO: slickStyles, emulate the div wrapping layers by the slick lib etc
export const Carousel = component({
  name: 'Builder:Carousel',
  component: (block, renderOptions) => {
    return `
    <div class="builder-carousel">
      ${
        block.children
          ? block.children.map(child => blockToLiquid(child, renderOptions)).join('\n')
          : ''
      }
    </div>
  `;
  },
});
