import type { ComponentInfo } from '../../types/components';
import { serializeFn } from '../util.js';

export const componentInfo: ComponentInfo = {
  name: 'Image',
  static: true,

  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  defaultStyles: {
    position: 'relative',
    minHeight: '20px',
    minWidth: '20px',
    overflow: 'hidden',
  },
  canHaveChildren: true,
  inputs: [
    {
      name: 'image',
      type: 'file',
      bubble: true,
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a',
      onChange: serializeFn(
        (options: Map<string, any>): void | Promise<void> => {
          const DEFAULT_ASPECT_RATIO = 0.7041;
          options.delete('srcset');
          options.delete('noWebp');
          function loadImage(
            url: string,
            timeout = 60000
          ): Promise<HTMLImageElement> {
            return new Promise((resolve, reject) => {
              const img = document.createElement('img');
              let loaded = false;
              img.onload = () => {
                loaded = true;
                resolve(img);
              };

              img.addEventListener('error', (event) => {
                console.warn('Image load failed', event.error);
                reject(event.error);
              });

              img.src = url;
              setTimeout(() => {
                if (!loaded) {
                  reject(new Error('Image load timed out'));
                }
              }, timeout);
            });
          }

          function round(num: number) {
            return Math.round(num * 1000) / 1000;
          }

          const value = options.get('image');
          const aspectRatio = options.get('aspectRatio');

          // For SVG images - don't render as webp, keep them as SVG
          fetch(value)
            .then((res) => res.blob())
            .then((blob) => {
              if (blob.type.includes('svg')) {
                options.set('noWebp', true);
              }
            });

          if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
            return loadImage(value).then((img) => {
              const possiblyUpdatedAspectRatio = options.get('aspectRatio');
              if (
                options.get('image') === value &&
                (!possiblyUpdatedAspectRatio ||
                  possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)
              ) {
                if (img.width && img.height) {
                  options.set('aspectRatio', round(img.height / img.width));
                  options.set('height', img.height);
                  options.set('width', img.width);
                }
              }
            });
          }
        }
      ),
    },
    {
      name: 'backgroundSize',
      type: 'text',
      defaultValue: 'cover',
      enum: [
        {
          label: 'contain',
          value: 'contain',
          helperText: 'The image should never get cropped',
        },
        {
          label: 'cover',
          value: 'cover',
          helperText: "The image should fill it's box, cropping when needed",
        },
      ],
    },
    {
      name: 'backgroundPosition',
      type: 'text',
      defaultValue: 'center',
      enum: [
        'center',
        'top',
        'left',
        'right',
        'bottom',
        'top left',
        'top right',
        'bottom left',
        'bottom right',
      ],
    },
    {
      name: 'altText',
      type: 'string',
      helperText: 'Text to display when the user has images off',
    },
    {
      name: 'height',
      type: 'number',
      hideFromUI: true,
    },
    {
      name: 'width',
      type: 'number',
      hideFromUI: true,
    },
    {
      name: 'sizes',
      type: 'string',
      hideFromUI: true,
    },
    {
      name: 'srcset',
      type: 'string',
      hideFromUI: true,
    },
    {
      name: 'lazy',
      type: 'boolean',
      defaultValue: true,
      hideFromUI: true,
    },
    {
      name: 'fitContent',
      type: 'boolean',
      helperText:
        "When child blocks are provided, fit to them instead of using the image's aspect ratio",
      defaultValue: true,
    },
    {
      name: 'aspectRatio',
      type: 'number',
      helperText:
        "This is the ratio of height/width, e.g. set to 1.5 for a 300px wide and 200px tall photo. Set to 0 to not force the image to maintain it's aspect ratio",
      advanced: true,
      defaultValue: 0.7041,
    },
  ],
};
