import * as React from 'react';
import { BuilderElement, BuilderBlockComponent, withBuilder } from '@builder.io/react';
import { Tooltip as MuiTooltip } from '@material-ui/core';

interface Props {
  builderBlock?: BuilderElement;
  text: string;
  placement?: string;
}

export class Tooltip extends React.Component<Props> {
  render() {
    return (
      <MuiTooltip title={this.props.text}>
        <span>
          {/* TODO: this should be BuilderBlocks */}
          {this.props.builderBlock &&
            this.props.builderBlock.children &&
            this.props.builderBlock.children.map((block, index) => (
              <BuilderBlockComponent key={block.id} block={block} />
            ))}
        </span>
      </MuiTooltip>
    );
  }
}

withBuilder(Tooltip, {
  name: 'Tooltip',
  inputs: [
    {
      name: 'text',
      type: 'longText',
      defaultValue: 'Hello there',
      required: true,
    },
    {
      name: 'placement',
      type: 'text',
      defaultValue: 'top',
    },
  ],
  defaultChildren: [
    {
      '@type': '@builder.io/sdk:Element',
      responsiveStyles: {
        large: {
          textAlign: 'center',
        },
      },
      component: {
        name: 'Text',
        options: {
          text: 'Hover me!',
        },
      },
    },
  ],
  canHaveChildren: true,
});
