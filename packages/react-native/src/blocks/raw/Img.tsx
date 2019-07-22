import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { BuilderElement } from '@builder.io/sdk'
import { Image } from 'react-native';

export interface ImgProps {
  attributes?: any
  image?: string
  builderBlock?: BuilderElement
}

@BuilderBlock({
  // friendlyName?
  name: 'Raw:Img',
  hideFromInsertMenu: true,
  image:
    'https://firebasestorage.googleapis.com/v0/b/builder-3b0a2.appspot.com/o/images%2Fbaseline-insert_photo-24px.svg?alt=media&token=4e5d0ef4-f5e8-4e57-b3a9-38d63a9b9dc4',
  inputs: [
    {
      name: 'image',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true
    }
  ],
  noWrap: true
})
export class Img extends React.Component<ImgProps> {
  render() {
    const attributes = this.props.attributes || {}
    return (
      <Image
        source={{uri: this.props.image || attributes.src}}
        {...this.props.attributes}
      />
    )
  }
}
