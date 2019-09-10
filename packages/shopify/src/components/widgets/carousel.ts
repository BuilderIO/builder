import { blockToLiquid } from '../../functions/block-to-liquid';
import { component } from '../../constants/components';

// TODO: slickStyles, emulate the div wrapping layers by the slick lib etc
export const Carousel = component({
  name: 'Builder:Carousel',
  component: (block, renderOptions) => {
    const firstChild = block.children && block.children[0];
    if (firstChild && firstChild.repeat) {
      firstChild.repeat.collection = firstChild.repeat.collection + ' limit:1'
    }
    return `
    <div class="builder-carousel">
      ${
        block.children
          ? // TODO: limit repeat on first element to just one hm
            block.children
              .slice(0, 1)
              .map(child => blockToLiquid(child, renderOptions))
              .join('\n')
          : ''
      }
    </div>
  `;
  },
});
