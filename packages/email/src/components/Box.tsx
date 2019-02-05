import { BuilderBlock, BuilderBlocks } from '@builder.io/react'
import React from 'react'
import { Block } from './Block'

interface BoxProps {
  builderBock?: any
  attributes?: any
  children?: any[] // Ideally accept react nodes too
}

// TODO: acceptsChildren option?
@BuilderBlock({
  name: 'Email:Box',
  inputs: [
    {
      name: 'children',
      type: 'uiBlocks',
      hideFromUI: true
    }
  ]
  // Share these hooks across the projects
  // hooks: {
  //   'BlocksOverlay::debounceNextTickUpdateStyles#updateStyles': () => convert margin selectors to paddings of table
  //   '@builder.io/app:Style.foo': () => { /* ... */ } // maybe optionally async
  // }
})
export class Box extends React.Component<BoxProps> {
  render() {
    return (
      <Block attributes={this.props.attributes} builderBlock={this.props.builderBock}>
        {/* Better way to do this? */}
        <BuilderBlocks blocks={this.props.children} dataPath="children" emailMode />
      </Block>
    )
  }
}
