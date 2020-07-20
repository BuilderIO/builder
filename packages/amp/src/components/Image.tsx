import { BuilderBlock, BuilderBlocks } from '@builder.io/react';
import React from 'react';

interface ImageProps {
  altText?: string;
  image?: string;
  height?: number;
  width?: number;
  builderBlock?: any;
  attributes?: any;
}

const DEFAULT_ASPECT_RATIO = 0.7041;

@BuilderBlock({
  name: 'Amp:Image',
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  defaultStyles: {
    minHeight: '20px',
    minWidth: '20px',
    overflow: 'hidden',
    fontSize: '0px',
  },
  inputs: [
    {
      name: 'image',
      type: 'file',
      // TODO: gif!
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      // TODO: something better
      defaultValue:
        'https://builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
      onChange: (options: Map<string, any>) => {
        const DEFAULT_ASPECT_RATIO = 0.7041;
        function loadImage(url: string, timeout = 60000): Promise<HTMLImageElement> {
          return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            let loaded = false;
            img.onload = () => {
              loaded = true;
              resolve(img);
            };

            img.addEventListener('error', event => {
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

        // // TODO
        const value = options.get('image');
        const aspectRatio = options.get('aspectRatio');
        if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
          return loadImage(value).then(img => {
            const possiblyUpdatedAspectRatio = options.get('aspectRatio');
            if (
              options.get('image') === value &&
              (!possiblyUpdatedAspectRatio || possiblyUpdatedAspectRatio === DEFAULT_ASPECT_RATIO)
            ) {
              if (img.width && img.height) {
                // options.set('aspectRatio', round(img.height / img.width));
                options.set('height', img.height);
                options.set('width', img.width);
              }
            }
          });
        }
      },
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
      name: 'aspectRatio',
      type: 'number',
      helperText:
        "This is the ratio of height/width, e.g. set to 1.5 for a 300px wide and 200px tall photo. Set to 0 to not force the image to maintain it's aspect ratio",
      advanced: true,
      defaultValue: DEFAULT_ASPECT_RATIO,
    },
  ],
})
export class Image extends React.Component<ImageProps> {
  render() {
    return (
      <img
        alt={this.props.altText}
        height={this.props.height}
        width={this.props.width}
        role={!this.props.altText ? 'presentation' : undefined}
        style={{
          width: '100%',
          height: 'auto',
        }}
        className="builder-image"
        src={this.props.image}
      />
    );
  }
}
