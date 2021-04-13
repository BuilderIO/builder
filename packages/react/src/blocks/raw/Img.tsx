import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { withBuilder } from '../../functions/with-builder';

export interface ImgProps {
  attributes?: any;
  image?: string;
  builderBlock?: BuilderElement;
}

// TODO: srcset, alt text input, object size/position input, etc

class ImgComponent extends React.Component<ImgProps> {
  render() {
    const attributes = this.props.attributes || {};
    return (
      <img
        {...this.props.attributes}
        src={this.props.image || attributes.src}
        // TODO: generate this
        // srcSet={this.props.image || attributes.srcSet || attributes.srcset}
      />
    );
  }
}

export const Img = withBuilder(ImgComponent, {
  // friendlyName?
  name: 'Raw:Img',
  hideFromInsertMenu: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  inputs: [
    {
      name: 'image',
      bubble: true,
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
    },
  ],
  noWrap: true,
  static: true,
});
