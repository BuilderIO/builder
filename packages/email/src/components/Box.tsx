import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { Block } from './Block'

interface BoxProps {
  builderBock?: any
  children?: any[] // Ideally accept react nodes too
}

@BuilderBlock({
  name: 'Email:Box',
  inputs: [
    {
      name: 'children',
      type: 'uiBlocks',
      hideFromUI: true
    }
  ]
})
export class Box extends React.Component<BoxProps> {
  render() {
    return (
      <Block>
        {/* Better way to do this? */}
        <BuilderBlocks blocks={this.props.children} dataPath={`children`} emailMode />
      </Block>
    )
  }
}
