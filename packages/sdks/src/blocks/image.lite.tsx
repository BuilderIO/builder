import { Show } from '@builder.io/mitosis';
import { registerComponent } from '../functions/register-component';

export interface ImageProps {
  className?: string;
  image: string;
  sizes?: string;
  lazy?: boolean;
  height?: number;
  width?: number;
  altText?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  srcset?: string;
  aspectRatio?: number;
  children?: any;
  fitContent?: boolean;
  builderBlock?: any;
}

export default function Image(props: ImageProps) {
  return (
    <div css={{ position: 'relative' }}>
      <picture>
        <img
          loading="lazy"
          alt={props.altText}
          aria-role={props.altText ? 'presentation' : undefined}
          css={{
            opacity: '1',
            transition: 'opacity 0.2s ease-in-out',
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: '0px',
            left: '0px',
          }}
          style={{
            objectPosition: props.backgroundSize || 'center',
            objectFit: (props.backgroundSize as any) || 'cover',
          }}
          class={
            'builder-image' + (props.className ? ' ' + props.className : '')
          }
          src={props.image}
          // TODO: memoize on image on client
          srcset={props.srcset}
          sizes={props.sizes}
        />
        <source srcSet={props.srcset} />
      </picture>
      {props.aspectRatio &&
        !(props.fitContent && props.builderBlock?.children?.length) && (
          <div
            class="builder-image-sizer"
            style={{
              paddingTop: props.aspectRatio * 100 + '%',
            }}
            css={{
              width: '100%',
              pointerEvents: 'none',
              fontSize: '0',
            }}
          >
            {' '}
          </div>
        )}
      <Show when={props.builderBlock?.children?.length && props.fitContent}>
        {props.children}
      </Show>

      <Show when={!props.fitContent}>
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
          }}
        >
          {props.children}
        </div>
      </Show>
    </div>
  );
}

registerComponent({
  name: 'Image',
  static: true,
  builtIn: true,
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
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
      onChange:
        "\
        const DEFAULT_ASPECT_RATIO = 0.7041;\
        options.delete('srcset');\
        options.delete('noWebp');\
        function loadImage(url, timeout) {\
          return new Promise((resolve, reject) => {\
            const img = document.createElement('img');\
            let loaded = false;\
            img.onload = () => {\
              loaded = true;\
              resolve(img);\
            };\
\
            img.addEventListener('error', event => {\
              console.warn('Image load failed', event.error);\
              reject(event.error);\
            });\
\
            img.src = url;\
            setTimeout(() => {\
              if (!loaded) {\
                reject(new Error('Image load timed out'));\
              }\
            }, timeout);\
          });\
        }\
\
        function round(num) {\
          return Math.round(num * 1000) / 1000;\
        }\
\
        const value = options.get('image');\
        const aspectRatio = options.get('aspectRatio');\
\
        // For SVG images - don't render as webp, keep them as SVG\
        fetch(value)\
          .then(res => res.blob())\
          .then(blob => {\
            if (blob.type.includes('svg')) {\
              options.set('noWebp', true);\
            }\
          });\
\
        if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {\
          return loadImage(value).then(img => {\
            const possiblyUpdatedAspectRatio = options.get('aspectRatio');\
            if (\
              options.get('image') === value &&\
              (!possiblyUpdatedAspectRatio || possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)\
            ) {\
              if (img.width && img.height) {\
                options.set('aspectRatio', round(img.height / img.width));\
                options.set('height', img.height);\
                options.set('width', img.width);\
              }\
            }\
          });\
        }",
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
});
