import { BuilderElement } from '@builder.io/sdk';
import { blockToLiquid } from '../functions/block-to-liquid';
import { style } from '../functions/style';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';

export const Image = component({
  name: 'Image',
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const { aspectRatio, backgroundSize, backgroundPosition } = options;

    return `
    <img
      src="${options.image || ''}"
      style="${style({
        objectFit: backgroundSize || 'cover',
        objectPosition: backgroundPosition || 'center',
        ...(aspectRatio && {
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: '0',
          left: '0',
        }),
      })}" />
      ${
        aspectRatio
          ? `<div
          class="builder-image-sizer"
          style="${style({
            width: '100%',
            paddingTop: aspectRatio * 100 + '%',
            pointerEvents: 'none',
            fontSize: '0',
          })}"></div>`
          : ''
      }
        ${
          block.children && block.children.length
            ? `
          <div
            style="${style({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
            })}"
          >
            ${block.children
              .map((block: BuilderElement, index: number) => blockToLiquid(block, renderOptions))
              .join('\n')}
          </div>`
            : ''
        }
  `;
  },
});
