import React from 'react';
import { Builder, BuilderStore } from '@builder.io/react';

interface AssignBlockProps {
  expression?: string;
  builderState?: BuilderStore;
}

export class AssignBlock extends React.Component<AssignBlockProps> {
  ran = false;
  constructor(props: AssignBlockProps) {
    super(props);

    if (!this.run()) {
      // TODO: queueNextTick
      // TODO: fix the state updates
      setTimeout(() => this.run())
    }
  }

  run() {
    const { expression, builderState } = this.props;

    if (expression && builderState) {
      if (builderState.context.shopify) {
        builderState.context.shopify.liquid.assign(expression, builderState.state);
        this.ran = true;
        console.debug('ran v2')
        return true;
      }
    }
    console.debug('not ran v2')
    return false;
  }

  render() {
    return null;
  }
}

Builder.registerComponent(AssignBlock, {
  name: 'Shopify:Assign',
  hideFromInsertMenu: true,
  inputs: [
    {
      name: 'expression',
      type: 'javascript',
      // TODO: type: 'code', language: 'javascript'
    },
  ],
});
