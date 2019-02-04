import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { Block } from './Block'

interface TextProps {
  text?: string
  builderBlock?: any
}

@BuilderBlock({
  name: 'Email:Text',
  inputs: [
    {
      name: 'text',
      type: 'html',
      required: true,
      defaultValue: 'Enter some text...'
    }
  ],
  defaultStyles: {
    lineHeight: 'normal',
    height: 'auto',
    textAlign: 'center'
  }
})
export class Text extends React.Component<TextProps> {
  render() {
    return (
      <Block noInnerWrap builderBlock={this.props.builderBlock}>
        <tr>
          {/* TODO: text styling defaults hm */}
          <td dangerouslySetInnerHTML={{ __html: this.props.text! }} />
        </tr>
      </Block>
    )
  }
}
