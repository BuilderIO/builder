import * as React from 'react';
import { BuilderElement, BuilderBlockComponent } from '@builder.io/react';
import MuiTooltip from '@material-ui/core/Tooltip';

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
