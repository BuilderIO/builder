import React from 'react'
import { BuilderBlock } from '../../decorators/builder-block.decorator'
import { BuilderElement } from '@builder.io/sdk'

export interface ImgProps {
  attributes?: any
  image?: string
  builderBlock?: BuilderElement
}

@BuilderBlock({
  // friendlyName?
  name: 'Raw:Img',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Ff74a2f3de58c4c3e939204e5b6b8f6c3',
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
      <img
        src={this.props.image || attributes.src}
        srcSet={this.props.image || attributes.srcSet || attributes.srcset}
        {...this.props.attributes}
      />
    )
  }
}
