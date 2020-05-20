import { BuilderStore, onChange, withBuilder } from '@builder.io/react';
import * as React from 'react';
import { AssignBlockProps } from '../interfaces/component-props';

export class AssignBlock extends React.Component<AssignBlockProps> {
  ran = false;

  constructor(props: AssignBlockProps) {
    super(props);
  }

  run() {
    const { expression, builderState } = this.props;

    if (expression && builderState) {
      if (builderState.context.shopify) {
        builderState.context.shopify.liquid.assign(expression, onChange.target(builderState.state));
        this.ran = true;
        return true;
      }
    }
    return false;
  }

  render() {
    this.run();
    return null;
  }
}

withBuilder(AssignBlock, {
  name: 'Shopify:Assign',
  hideFromInsertMenu: true,
  noWrap: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
      // TODO: type: 'code', language: 'javascript'
    },
  ],
});
