'use client';
import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import type { JSX } from '@builder.io/mitosis/jsx-runtime';
import { withBuilder } from '../../functions/with-builder';
import { IMAGE_FILE_TYPES } from 'src/constants/file-types.constant';
import { getSrcSet } from '../Image';

export interface ImgProps {
  attributes?: any;
  image?: string;
  src?: string;
  srcset?: string;
  altText?: string;
  backgroundSize?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  backgroundPosition?:
    | 'center'
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'top left'
    | 'top right'
    | 'bottom left'
    | 'bottom right';
  aspectRatio?: number;
  title?: string;
  builderBlock?: BuilderElement;
  fitContent?: boolean;
  lazy?: boolean;
  className?: string;
  noWebp?: boolean;
  children?: React.ReactNode;
}

// TODO: srcset, alt text input, object size/position input, etc

class ImgComponent extends React.Component<ImgProps> {
  get image() {
    return this.props.image || this.props.src;
  }

  getSrcSet(): string | undefined {
    const url = this.image;
    if (!url || typeof url !== 'string') {
      return undefined;
    }
    if (this.props.noWebp) {
      return undefined;
    }
    if (!(url.match(/builder\.io/) || url.match(/cdn\.shopify\.com/))) {
      return undefined;
    }
    return getSrcSet(url);
  }

  getAspectRatioCss():
    | (Pick<JSX.CSS, 'position' | 'height' | 'width' | 'left' | 'top'> & {
        position: 'absolute';
      })
    | undefined {
    const aspectRatioStyles = {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: '0px',
      top: '0px',
    } as const;
    const out = this.props.aspectRatio ? aspectRatioStyles : undefined;
    return out;
  }

  render() {
    const {
      fitContent,
      builderBlock,
      children,
      aspectRatio,
      className,
      attributes = {},
    } = this.props;

    const image = this.image;
    let srcset = this.props.srcset;

    if (srcset && image && image.includes('builder.io/api/v1/image')) {
      if (!srcset.includes(image.split('?')[0])) {
        // console.debug('Removed given srcset');
        srcset = this.getSrcSet();
      }
    } else if (image && !srcset) {
      srcset = this.getSrcSet();
    }

    const webpSrcSet =
      srcset?.match(/builder\.io/) && !this.props.noWebp
        ? srcset.replace(/\?/g, '?format=webp&')
        : '';

    const hasChildren = builderBlock?.children?.length;
    const aspectRatioCss = this.getAspectRatioCss();

    const img = (
      <img
        loading={this.props.lazy === false ? undefined : 'lazy'}
        {...attributes}
        alt={this.props.altText}
        title={this.props.title}
        role={this.props.altText ? undefined : 'presentation'}
        style={{
          opacity: '1',
          transition: 'opacity 0.2s ease-in-out',
          objectPosition: this.props.backgroundPosition || 'center',
          objectFit: this.props.backgroundSize || 'cover',
          ...aspectRatioCss,
          ...attributes.style,
        }}
        className={
          'builder-raw-img' +
          (className ? ' ' + className : '') +
          (attributes.className ? ' ' + attributes.className : '')
        }
        src={image}
        srcSet={srcset}
      />
    );

    return (
      <React.Fragment>
        <picture>
          {webpSrcSet ? (
            <source srcSet={webpSrcSet} type="image/webp" />
          ) : null}
          {img}
        </picture>

        {aspectRatio && !(hasChildren && fitContent) ? (
          <div
            className="builder-image-sizer"
            style={{
              paddingTop: aspectRatio * 100 + '%',
              width: '100%',
              pointerEvents: 'none',
              fontSize: '0',
            }}
          />
        ) : null}

        {hasChildren && fitContent ? children : null}

        {!fitContent && hasChildren ? (
          <div
            style={{
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
            {children}
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}

export const Img = withBuilder(ImgComponent, {
  // friendlyName?
  name: 'Raw:Img',
  static: true,
  hideFromInsertMenu: true,
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
      bubble: true,
      type: 'file',
      allowedFileTypes: IMAGE_FILE_TYPES,
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a',
      onChange: (options: Map<string, any>) => {
        const DEFAULT_ASPECT_RATIO = 0.7041;
        options.delete('srcset');
        options.delete('noWebp');
        function loadImage(
          url: string,
          timeout = 60000
        ): Promise<HTMLImageElement> {
          return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
              return;
            }
            const img = document.createElement('img');
            let loaded = false;
            img.onload = () => {
              loaded = true;
              resolve(img);
            };

            img.addEventListener('error', (event: any) => {
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

        if (value && typeof value === 'string') {
          // For SVG images - don't render as webp, keep them as SVG
          fetch(value)
            .then(res => res.blob())
            .then(blob => {
              if (blob.type.includes('svg')) {
                options.set('noWebp', true);
              }
            });
        }

        if (value && (!aspectRatio || aspectRatio === DEFAULT_ASPECT_RATIO)) {
          return loadImage(value).then(img => {
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
      },
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
      name: 'title',
      type: 'string',
      helperText: 'Text to display when hovering over the asset',
    },
    {
      name: 'aspectRatio',
      type: 'number',
      helperText:
        "This is the ratio of height/width, e.g. set to 1.5 for a 300px wide and 200px tall photo. Set to 0 to not force the image to maintain it's aspect ratio",
      advanced: true,
      defaultValue: 0.7041,
    },
    {
      name: 'fitContent',
      type: 'boolean',
      helperText:
        "When child blocks are provided, fit to them instead of using the image's aspect ratio",
      defaultValue: true,
    },
  ],
  noWrap: true,
});
