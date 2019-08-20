import { BuilderElement } from '@builder.io/sdk';
import { blockToLiquid } from '../functions/block-to-liquid';

export const Image = (block: BuilderElement) => {
  const { options } = block.component!;
  const { aspectRatio, backgroundSize, backgroundPosition } = options;

  return `
    <img
      src="${options.image || ''}"
      style="
        object-fit: ${backgroundSize || 'cover'};
        object-position: ${backgroundPosition || 'center'};
        ${
          aspectRatio
            ? `
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
        `
            : ''
        }
      " />
      ${
        aspectRatio
          ? `<div
          class="builder-image-sizer"
          style="
            width: 100%;
            padding-top: ${aspectRatio * 100}%;
            pointer-events: none;
            fontSize: 0;
          "
        ></div>`
          : ''
      }
        ${
          block.children && block.children.length
            ? `
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: stretch;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            "
          >
            ${block.children
              .map((block: BuilderElement, index: number) => blockToLiquid(block))
              .join('\n')}
          </div>`
            : ''
        }
  `;
};
