import React from 'react'
import { withBuilder } from '../functions/with-builder'
import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component'
import { BuilderElement } from '@builder.io/sdk'

export interface FragmentProps {
  builderBlock?: BuilderElement
}

class FragmentComponent extends React.Component<FragmentProps> {
  render() {
    return (
      this.props.builderBlock &&
      this.props.builderBlock.children &&
      this.props.builderBlock.children.map((block, index) => (
        <BuilderBlockComponent
          block={block}
          key={block.id}
          index={index}
        />
      ))
    )
  }
}

export const Fragment = withBuilder(FragmentComponent, {
  name: 'Core:Fragment',
  canHaveChildren: true,
  noWrap: true,
  static: true,
  hideFromInsertMenu: true
})
