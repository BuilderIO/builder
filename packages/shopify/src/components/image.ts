import { BuilderElement } from '@builder.io/sdk';
import { blockToLiquid } from '../functions/block-to-liquid';
import { style } from '../functions/style';
import { Options } from '../interfaces/options';
import { component } from '../constants/components';

function updateQueryParam(uri = '', key: string, value: string) {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
  }

  return uri + separator + key + '=' + encodeURIComponent(value);
}

export const Image = component({
  name: 'Image',
  component: (block: BuilderElement, renderOptions: Options) => {
    const { options } = block.component!;
    const { aspectRatio, backgroundSize, backgroundPosition, srcset, sizes, image, lazy } = options;
    const widths = [100, 200, 400, 800, 1200, 1600, 2000];

    const srcSet =
      srcset ||
      ((options.image || '').match(/cdn\.shopify|builder\.io/)
        ? widths
            .map(size => `${updateQueryParam(image, 'width', String(size))} ${size}w`)
            .concat([image])
            .join(', ')
        : '');

    // TODO: attribute({}) helper to trim out undefined etc
    // TODO: add srcset and sizes back
    // srcset="${srcSet}"
    // ${sizes ? `sizes="${sizes}"` : ''}
    return `
      <picture>
        ${
          srcSet && srcSet.match(/builder\.io/)
            ? `<source srcset="${srcSet.replace(/\?/g, '?format=webp&')}" type="image/webp" />`
            : ''
        }
        ${
          lazy
            ? ''
            : `<img
          src="${options.image || ''}"
          srcset="${srcSet || options.image || ''}"
          sizes="${sizes || '100vw'}"
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
          })}" />`
        }
      </picture>
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
