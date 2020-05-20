import { BuilderStore, onChange, withBuilder } from '@builder.io/react';
import * as React from 'react';
import { CaptureBlockProps } from '../interfaces/component-props';

export class CaptureBlock extends React.Component<CaptureBlockProps> {
  ran = false;
  constructor(props: CaptureBlockProps) {
    super(props);
  }

  run() {
    const { expression, variableName, builderState } = this.props;

    if (expression && builderState?.context?.shopify) {
      onChange.target(builderState.state)[
        variableName
      ] = builderState.context.shopify.liquid.render(expression, builderState.state);

      this.ran = true;
      return true;
    }

    return false;
  }

  render() {
    this.run();
    return null;
  }
}

withBuilder(CaptureBlock, {
  name: 'Shopify:Capture',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
    },
  ],
});
