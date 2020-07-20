import React from 'react';
import { BuilderElement } from '@builder.io/sdk';
import { withBuilder } from '../functions/with-builder';
import { BuilderBlock as BuilderBlockComponent } from '../components/builder-block.component';

export interface FragmentProps {
  builderBlock?: BuilderElement;
}

class FragmentComponent extends React.Component<FragmentProps> {
  render() {
    return (
      this.props.builderBlock &&
      this.props.builderBlock.children &&
      this.props.builderBlock.children.map((block, index) => (
        <BuilderBlockComponent block={block} key={block.id} index={index} />
      ))
    );
  }
}

export const Fragment = withBuilder(FragmentComponent, {
  name: 'Core:Fragment',
  canHaveChildren: true,
  noWrap: true,
  static: true,
  hideFromInsertMenu: true,
});
