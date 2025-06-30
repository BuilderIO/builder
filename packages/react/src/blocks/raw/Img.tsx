'use client';
import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { withBuilder } from '../../functions/with-builder';
import { IMAGE_FILE_TYPES } from 'src/constants/file-types.constant';
import { getSrcSet } from '../Image';

export interface ImgProps {
  attributes?: any;
  image?: string;
  builderBlock?: BuilderElement;
  aspectRatio?: number;
  backgroundSize?: string;
  backgroundPosition?: string;
  altText?: string;
  title?: string;
}

// TODO: srcset, alt text input, object size/position input, etc

class ImgComponent extends React.Component<ImgProps> {
  getSrcSet(): string | undefined {
    const url = this.props.image;
    if (!url || typeof url !== 'string') {
      return;
    }

    // We can auto add srcset for cdn.builder.io images
    if (!url.match(/builder\.io/)) {
      return;
    }

    return getSrcSet(url);
  }

  render() {
    const attributes = this.props.attributes || {};
    const srcset = this.getSrcSet();

    const { style: userStyle, ...restAttributes } = attributes;

    const defaultStyle: React.CSSProperties = {
      objectFit: this.props.backgroundSize as React.CSSProperties['objectFit'],
      objectPosition: this.props.backgroundPosition as React.CSSProperties['objectPosition'],
      aspectRatio: this.props.aspectRatio as unknown as React.CSSProperties['aspectRatio'],
    };

    const mergedStyle = {
      ...defaultStyle,
      ...(userStyle as React.CSSProperties),
    };

    return (
      <img
        loading="lazy"
        {...restAttributes}
        src={this.props.image || attributes.src}
        srcSet={srcset}
        alt={this.props.altText}
        title={this.props.title}
        style={mergedStyle}
        className="builder-raw-img"
      />
    );
  }
}

export const Img = withBuilder(ImgComponent, {
  name: 'Raw:Img',
  hideFromInsertMenu: true,

  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  inputs: [
    {
      name: 'image',
      bubble: true,
      type: 'file',
      allowedFileTypes: IMAGE_FILE_TYPES,
      required: true,
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
  ],

  noWrap: true,
});
